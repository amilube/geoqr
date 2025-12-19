.PHONY: help
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Django targets
.PHONY: django-up django-down django-logs django-shell
django-up: ## Start Django development server
	docker compose -f docker-compose.local.yml up

django-down: ## Stop Django development server
	docker compose -f docker-compose.local.yml down

django-logs: ## View Django logs
	docker compose -f docker-compose.local.yml logs -f django

django-shell: ## Open Django shell
	docker compose -f docker-compose.local.yml run --rm django python manage.py shell

# Flet targets
.PHONY: flet-up flet-down flet-logs flet-build-apk
flet-up: ## Start Flet development server
	docker compose -f docker-compose.flet.local.yml up

flet-down: ## Stop Flet development server
	docker compose -f docker-compose.flet.local.yml down

flet-logs: ## View Flet logs
	docker compose -f docker-compose.flet.local.yml logs -f flet

flet-build-apk: ## Build development APK
	@echo "Building development APK..."
	docker compose -f docker-compose.flet.local.yml --profile build run --rm flet-build
	@echo "APK available at: build/flet/apk/app-release.apk"

# Combined targets
.PHONY: up down all-up all-down
up: django-up ## Alias for django-up

down: django-down ## Alias for django-down

all-up: ## Start both Django and Flet
	docker compose -f docker-compose.local.yml -f docker-compose.flet.local.yml up

all-down: ## Stop both Django and Flet
	docker compose -f docker-compose.local.yml -f docker-compose.flet.local.yml down

# Flet production targets
.PHONY: flet-build-release flet-build-prod-apk
flet-build-release: ## Build production AAB (requires keystore env vars)
	@echo "Building production AAB..."
	@if [ -z "$$KEY_STORE_PASSWORD" ]; then \
		echo "Error: KEY_STORE_PASSWORD not set"; \
		exit 1; \
	fi
	docker compose -f docker-compose.flet.production.yml --profile build-release run --rm flet-build-release
	@echo "AAB available at: build/flet/production/app-release.aab"

flet-build-prod-apk: ## Build production APK
	@echo "Building production APK..."
	docker compose -f docker-compose.flet.production.yml --profile build-apk run --rm flet-build-apk
	@echo "APK available at: build/flet/production/app-release.apk"

# Testing and linting targets
.PHONY: flet-lint flet-type-check flet-test
flet-lint: ## Run linting on Flet code
	docker compose -f docker-compose.flet.local.yml run --rm flet ruff check flet_app/

flet-type-check: ## Run type checking on Flet code
	docker compose -f docker-compose.flet.local.yml run --rm flet mypy flet_app/

flet-test: ## Run tests on Flet code
	docker compose -f docker-compose.flet.local.yml run --rm flet pytest

# Cleanup targets
.PHONY: clean clean-build
clean: ## Remove build artifacts and temporary files
	rm -rf build/flet/
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.coverage" -delete

clean-build: ## Remove Docker build cache
	docker compose -f docker-compose.flet.local.yml build --no-cache
	docker compose -f docker-compose.local.yml build --no-cache
