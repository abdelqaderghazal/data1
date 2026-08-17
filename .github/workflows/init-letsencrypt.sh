#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Let's Encrypt SSL Setup Script
# ═══════════════════════════════════════════════════════════════
# Usage: ./init-letsencrypt.sh yourdomain.com admin@yourdomain.com
# ═══════════════════════════════════════════════════════════════

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Example: $0 dashboard.yourdomain.com admin@yourdomain.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "🔐 Setting up SSL for $DOMAIN..."

# Create necessary directories
mkdir -p certbot/conf certbot/www

# Stop any running containers
docker-compose -f docker-compose.prod.yml down

# Start Nginx without SSL first (to pass ACME challenge)
cat > nginx.conf <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOF

docker-compose -f docker-compose.prod.yml up -d nginx

# Get certificate
docker-compose -f docker-compose.prod.yml run --rm certbot certonly     --webroot     --webroot-path=/var/www/certbot     --email $EMAIL     --agree-tos     --no-eff-email     -d $DOMAIN

# Replace nginx config with full SSL config
cat > nginx.conf <<EOF
upstream dashboard_backend {
    server proxy:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    location / {
        root /var/www/syria-dashboard/public;
        try_files \$uri \$uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }

    location /api/ {
        proxy_pass http://dashboard_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
    }
}
EOF

# Reload Nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "✅ SSL certificate installed for $DOMAIN!"
echo "   Certificate path: ./certbot/conf/live/$DOMAIN/"
echo "   Auto-renewal is configured in docker-compose.prod.yml"
