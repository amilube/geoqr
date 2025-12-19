export COMPOSE_FILE := "docker-compose.local.yml"

## Just does not yet manage signals for subprocesses reliably, which can lead to unexpected behavior.
## Exercise caution before expanding its usage in production environments. 
## For more information, see https://github.com/casey/just/issues/2473 .


# Default command to list all available commands.
default:
    @just --list

# build: Build python image.
build:
    @echo "Building python image..."
    @docker compose build

# up: Start up containers.
up:
    @echo "Starting up containers..."
    @docker compose up -d --remove-orphans

# down: Stop containers.
down:
    @echo "Stopping containers..."
    @docker compose down

# prune: Remove containers and their volumes.
prune *args:
    @echo "Killing containers and removing volumes..."
    @docker compose down -v {{args}}

# logs: View container logs
logs *args:
    @docker compose logs -f {{args}}

# manage: Executes `manage.py` command.
manage +args:
    @docker compose run --rm django python ./manage.py {{args}}

# flet-dev: Start Flet in development mode (web preview)
flet-dev:
    @echo "Starting Flet app in development mode..."
    @docker compose -f docker-compose.flet.local.yml up

# flet-build: Build Android APK (development)
flet-build version="0.1.0":
    @echo "Building Android APK version {{version}}..."
    @BUILD_VERSION={{version}} docker compose -f docker-compose.flet.local.yml --profile build run --rm flet-build
    @echo "✓ APK ready at: build/flet/apk/app-release.apk"

# flet-release: Build production AAB (requires keystore config)
flet-release version="1.0.0":
    @echo "Building production AAB version {{version}}..."
    @BUILD_VERSION={{version}} docker compose -f docker-compose.flet.production.yml --profile build-release run --rm flet-build-release
    @echo "✓ AAB ready at: build/flet/production/app-release.aab"

# all: Start Django + Flet together
all:
    @echo "Starting Django + Flet..."
    @docker compose -f docker-compose.local.yml -f docker-compose.flet.local.yml up -d
    @echo "✓ Django: http://localhost:8000"
    @echo "✓ Flet: http://localhost:8550"
