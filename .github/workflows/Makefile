# ═══════════════════════════════════════════════════════════════
# Syria Dashboard — Docker Commands
# ═══════════════════════════════════════════════════════════════

.PHONY: help dev prod stop logs clean ssl

help: ## Show this help
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  [36m%-15s[0m %s\n", $$1, $$2}'

dev: ## Start development environment
	docker-compose up --build

dev-d: ## Start development in background
	docker-compose up --build -d

prod: ## Start production environment
	docker-compose -f docker-compose.prod.yml up --build -d

stop: ## Stop all containers
	docker-compose down
	docker-compose -f docker-compose.prod.yml down

logs: ## View logs from proxy server
	docker-compose logs -f proxy

logs-nginx: ## View Nginx logs
	docker-compose -f docker-compose.prod.yml logs -f nginx

shell: ## Open shell in proxy container
	docker-compose exec proxy sh

ssl: ## Setup Let's Encrypt SSL (usage: make ssl DOMAIN=yourdomain.com EMAIL=admin@yourdomain.com)
	@if [ -z "$(DOMAIN)" ] || [ -z "$(EMAIL)" ]; then \
		echo "Usage: make ssl DOMAIN=yourdomain.com EMAIL=admin@yourdomain.com"; \
		exit 1; \
	fi
	./init-letsencrypt.sh $(DOMAIN) $(EMAIL)

clean: ## Remove all containers and volumes
	docker-compose down -v
	docker-compose -f docker-compose.prod.yml down -v
	docker system prune -f

update: ## Pull latest code and restart
	git pull
	docker-compose -f docker-compose.prod.yml up --build -d
