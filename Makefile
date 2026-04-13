.PHONY: dev dev-local down down-clean logs logs-web logs-api build \
        install lint lint-api test-api migrate reset \
        config config-local help

# ── Default ───────────────────────────────────────────────────────────────────
.DEFAULT_GOAL := help

# ── Dev servers ───────────────────────────────────────────────────────────────

## Start the app with cloud Supabase (set credentials in .env first)
dev:
	docker compose up --build

## Start the app with the fully local Supabase stack (no cloud needed)
dev-local:
	docker compose -f docker-compose.yml -f docker-compose.local.yml up --build

## Start in the background (detached)
dev-bg:
	docker compose -f docker-compose.yml -f docker-compose.local.yml up --build -d

## Stop all running containers
down:
	docker compose down

## Stop all containers AND delete the local Supabase database volume (full reset)
down-clean:
	docker compose down -v

# ── Logs ──────────────────────────────────────────────────────────────────────

## Tail logs for all services
logs:
	docker compose logs -f

## Tail frontend (Vite) logs only
logs-web:
	docker compose logs -f web

## Tail API (NestJS) logs only
logs-api:
	docker compose logs -f api

## Tail Supabase auth (GoTrue) logs
logs-auth:
	docker compose logs -f auth

## Tail Supabase database logs
logs-db:
	docker compose logs -f db

# ── Build ─────────────────────────────────────────────────────────────────────

## Rebuild all Docker images without cache
build:
	docker compose build --no-cache

## Build the frontend for production
build-web:
	pnpm run build

## Build the API for production (type check)
build-api:
	pnpm --filter api run build

# ── Dependencies ──────────────────────────────────────────────────────────────

## Install all dependencies (frontend + API) with one command
install:
	pnpm install

## Install a frontend package:  make add PKG=framer-motion
add:
	pnpm add $(PKG)

## Install an API package:  make add-api PKG=@nestjs/throttler
add-api:
	pnpm add $(PKG) --filter api

# ── Code quality ──────────────────────────────────────────────────────────────

## Lint the frontend
lint:
	pnpm run lint

## Lint the API
lint-api:
	pnpm --filter api run lint

# ── Testing ───────────────────────────────────────────────────────────────────

## Run API unit tests
test-api:
	pnpm --filter api run test

# ── Database ──────────────────────────────────────────────────────────────────

## Re-run migrations against the local Supabase (restarts db-migrate container)
migrate:
	docker compose run --rm db-migrate

## Open a psql shell against the local database
db-shell:
	docker compose exec db psql -U postgres -d postgres

# ── Config inspection ─────────────────────────────────────────────────────────

## Print the resolved compose config for cloud mode (shows interpolated env vars)
config:
	docker compose config

## Print the resolved compose config for local Supabase mode
config-local:
	docker compose -f docker-compose.yml -f docker-compose.local.yml config

# ── Setup ─────────────────────────────────────────────────────────────────────

## Copy .env.docker → .env (first-time setup)
env:
	cp .env.docker .env
	@echo "✅ .env created — fill in ANTHROPIC_API_KEY then run: make dev-local"

# ── Help ──────────────────────────────────────────────────────────────────────

## Show this help message
help:
	@echo ""
	@echo "  KidCode — available commands"
	@echo ""
	@grep -E '^##' Makefile | sed 's/## /  /' | awk 'NR%2{printf "\033[36m%-20s\033[0m", $$0; next} {print}'
	@echo ""
	@grep -E '^[a-zA-Z_-]+:' Makefile | grep -v '.PHONY' | awk -F: '{printf "  \033[36m%-20s\033[0m\n", $$1}'
	@echo ""
