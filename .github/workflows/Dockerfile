# ═══════════════════════════════════════════════════════════════
# Syria Dashboard — Docker Image
# Node.js 20 Alpine (خفيف وآمن)
# ═══════════════════════════════════════════════════════════════

FROM node:20-alpine AS base

# ─── Security: run as non-root ────────────────────────────────
RUN addgroup -g 1001 -S nodejs &&     adduser -S nodejs -u 1001

WORKDIR /app

# ─── Dependencies ─────────────────────────────────────────────
# نسخ package.json أولاً للاستفادة من cache
COPY package.json ./
RUN npm install --production --ignore-scripts &&     npm cache clean --force

# ─── Application ──────────────────────────────────────────────
COPY proxy-server.js ./
COPY .env.example ./
COPY data/ ./data/

# إنشاء مجلد logs
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app

USER nodejs

# ─── Environment ──────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# ─── Health Check ───────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3     CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "proxy-server.js"]
