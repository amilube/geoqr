#!/bin/bash
#
# Script simplificado para flujo de desarrollo y despliegue de Flet
# Uso: ./flet.sh [comando]
#

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones helper
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Comando: dev - Iniciar desarrollo
dev() {
    print_info "Iniciando entorno de desarrollo..."
    docker compose -f docker-compose.local.yml -f docker-compose.flet.local.yml up -d
    print_success "Servicios iniciados"
    print_info "Django: http://localhost:8000"
    print_info "Flet: http://localhost:8550"
    print_info ""
    print_info "Para ver logs: docker compose logs -f"
    print_info "Para detener: ./flet.sh stop"
}

# Comando: stop - Detener servicios
stop() {
    print_info "Deteniendo servicios..."
    docker compose -f docker-compose.local.yml -f docker-compose.flet.local.yml down
    print_success "Servicios detenidos"
}

# Comando: build - Construir APK de desarrollo
build() {
    VERSION=${1:-0.1.0}
    print_info "Construyendo APK versión $VERSION..."
    BUILD_VERSION=$VERSION docker compose -f docker-compose.flet.local.yml --profile build run --rm flet-build
    print_success "APK listo en: build/flet/apk/app-release.apk"
    print_info ""
    print_info "Para instalar en dispositivo:"
    print_info "  adb install build/flet/apk/app-release.apk"
}

# Comando: release - Construir AAB de producción
release() {
    VERSION=${1:-1.0.0}
    
    # Validar variables de entorno
    if [ -z "$KEY_STORE_PASSWORD" ]; then
        print_warning "Variables de keystore no configuradas"
        print_info "Configura las siguientes variables de entorno:"
        echo "  export KEY_STORE_PASSWORD='tu-password'"
        echo "  export KEY_ALIAS='geoqr'"
        echo "  export KEY_PASSWORD='tu-password'"
        echo "  export KEYSTORE_PATH='./keystore.jks'"
        exit 1
    fi
    
    print_info "Construyendo AAB versión $VERSION..."
    BUILD_VERSION=$VERSION docker compose -f docker-compose.flet.production.yml --profile build-release run --rm flet-build-release
    print_success "AAB listo en: build/flet/production/app-release.aab"
    print_info ""
    print_info "Sube el AAB a Google Play Console"
}

# Comando: logs - Ver logs
logs() {
    SERVICE=${1:-}
    if [ -z "$SERVICE" ]; then
        docker compose -f docker-compose.local.yml -f docker-compose.flet.local.yml logs -f
    else
        docker compose -f docker-compose.local.yml -f docker-compose.flet.local.yml logs -f $SERVICE
    fi
}

# Comando: clean - Limpiar build artifacts
clean() {
    print_info "Limpiando archivos de build..."
    rm -rf build/flet/
    print_success "Build artifacts eliminados"
}

# Comando: help - Mostrar ayuda
help() {
    cat << EOF
${BLUE}Flet Android App - Script Simplificado${NC}

${GREEN}Comandos disponibles:${NC}

  ${YELLOW}dev${NC}               Iniciar desarrollo (Django + Flet)
  ${YELLOW}stop${NC}              Detener todos los servicios
  ${YELLOW}build [version]${NC}   Construir APK de desarrollo (default: 0.1.0)
  ${YELLOW}release [version]${NC} Construir AAB de producción (default: 1.0.0)
  ${YELLOW}logs [service]${NC}    Ver logs (opcionalmente de un servicio específico)
  ${YELLOW}clean${NC}             Limpiar archivos de build

${GREEN}Ejemplos:${NC}

  ./flet.sh dev                    # Iniciar desarrollo
  ./flet.sh build 0.2.0            # Construir APK v0.2.0
  ./flet.sh release 1.0.1          # Construir AAB v1.0.1
  ./flet.sh logs flet              # Ver logs de Flet

${GREEN}Flujo típico:${NC}

  1. ./flet.sh dev                 # Desarrollar y probar en http://localhost:8550
  2. ./flet.sh build               # Construir APK para probar en dispositivo
  3. ./flet.sh release 1.0.0       # Construir AAB para producción
  4. ./flet.sh stop                # Detener cuando termines

${GREEN}Configuración:${NC}

  Desarrollo:   .envs/.local/.flet
  Producción:   .envs/.production/.flet

EOF
}

# Main
case "${1:-help}" in
    dev)
        dev
        ;;
    stop)
        stop
        ;;
    build)
        build ${2:-0.1.0}
        ;;
    release)
        release ${2:-1.0.0}
        ;;
    logs)
        logs ${2:-}
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_warning "Comando desconocido: $1"
        echo ""
        help
        exit 1
        ;;
esac
