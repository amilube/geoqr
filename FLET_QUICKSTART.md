# GeoQR - Flet Android App Quick Start

Este es un proyecto Django con un frontend Android basado en Flet como proyecto anexo.

## Estructura del Proyecto

```
geoqr/
├── apps/                       # Aplicaciones Django
│   ├── users/
│   ├── pwa/
│   └── ...
├── flet_app/                   # Frontend Android Flet (proyecto anexo)
│   ├── config/
│   ├── services/
│   ├── views/
│   └── main.py
├── compose/                    # Configuraciones Docker
│   ├── local/
│   │   ├── django/
│   │   └── flet/
│   └── production/
│       ├── django/
│       └── flet/
├── docker-compose.local.yml           # Docker Compose para Django
├── docker-compose.flet.local.yml      # Docker Compose para Flet (desarrollo)
└── docker-compose.flet.production.yml # Docker Compose para Flet (producción)
```

## Inicio Rápido

### 1. Iniciar Ambiente de Desarrollo Django

```bash
docker compose -f docker-compose.local.yml up
```

Acceso: http://localhost:8000

### 2. Iniciar Ambiente de Desarrollo Flet

```bash
# Opción A: Solo Flet (requiere Django corriendo)
docker compose -f docker-compose.flet.local.yml up

# Opción B: Django + Flet juntos
docker compose -f docker-compose.local.yml -f docker-compose.flet.local.yml up
```

Acceso: http://localhost:8550

### 3. Construir APK para Android (Desarrollo)

```bash
export BUILD_NUMBER=1
export BUILD_VERSION=0.1.0
docker compose -f docker-compose.flet.local.yml --profile build run --rm flet-build
```

APK disponible en: `build/flet/apk/app-release.apk`

### 4. Construir AAB para Google Play (Producción)

```bash
# Configurar variables de entorno
export BUILD_NUMBER=1
export BUILD_VERSION=1.0.0
export KEYSTORE_PATH=./keystore.jks
export KEY_STORE_PASSWORD="tu-password"
export KEY_ALIAS="geoqr"
export KEY_PASSWORD="tu-password"

# Construir
docker compose -f docker-compose.flet.production.yml --profile build-release run --rm flet-build-release
```

AAB disponible en: `build/flet/production/app-release.aab`

## Configuración

### Variables de Ambiente - Desarrollo

Archivo: `.envs/.local/.flet`

```bash
FLET_API_BASE_URL=http://django:8000
FLET_DEBUG=true
FLET_VERIFY_SSL=false
```

### Variables de Ambiente - Producción

Archivo: `.envs/.production/.flet` (crear desde `.envs/.production/.flet.example`)

```bash
FLET_API_BASE_URL=https://tu-dominio-produccion.com
FLET_DEBUG=false
FLET_VERIFY_SSL=true
```

## Comandos Útiles

### Desarrollo

```bash
# Ver logs de Flet
docker compose -f docker-compose.flet.local.yml logs -f flet

# Detener servicios
docker compose -f docker-compose.flet.local.yml down

# Reconstruir imágenes
docker compose -f docker-compose.flet.local.yml build --no-cache
```

### Testing y Linting

```bash
# Linting
docker compose -f docker-compose.flet.local.yml run --rm flet ruff check flet_app/

# Type checking
docker compose -f docker-compose.flet.local.yml run --rm flet mypy flet_app/

# Tests
docker compose -f docker-compose.flet.local.yml run --rm flet pytest
```

## Documentación Completa

- **[README Principal](README.md)** - Información general del proyecto
- **[Flet App README](flet_app/README.md)** - Documentación detallada de la app Flet
- **[Guía de Despliegue](FLET_DEPLOYMENT_GUIDE.md)** - Flujo completo de desarrollo y despliegue
- **[Guía de Seguridad](FLET_SECURITY.md)** - Mejores prácticas de seguridad

## Arquitectura

El proyecto sigue una arquitectura de dos capas:

1. **Backend Django**: API REST que maneja toda la lógica de negocio
2. **Frontend Flet**: Aplicación Android que envuelve la web app en un WebView nativo

```
┌─────────────────────┐
│   App Android       │
│   (Flet)            │
│   ┌─────────────┐   │
│   │  WebView    │   │
│   │  Django App │   │
│   └─────────────┘   │
└──────────┬──────────┘
           │ HTTPS
           ▼
    ┌──────────────┐
    │ Django API   │
    │ (Backend)    │
    └──────────────┘
```

## Seguridad

**Consideraciones importantes:**

1. **Nunca** commitear `.envs/.production/.flet` (contiene secretos)
2. **Nunca** commitear keystores (`.jks`, `.keystore`)
3. **Siempre** usar HTTPS en producción
4. **Siempre** verificar certificados SSL en producción
5. Mantener dependencias actualizadas

## Soporte

Para problemas o preguntas:

1. Revisar la documentación en este repositorio
2. Buscar issues existentes en GitHub
3. Crear un nuevo issue con descripción detallada

## Licencia

Not open source - Ver archivo LICENSE para detalles.
