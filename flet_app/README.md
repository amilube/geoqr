# Frontend Android con Flet

Este directorio contiene la aplicación frontend basada en Flet para envolver la aplicación web Django GeoQR en una app Android.

## Descripción General

La aplicación Flet proporciona un contenedor nativo de Android que embebe la aplicación web Django existente en un WebView, permitiendo un despliegue sin problemas en dispositivos Android mientras mantiene toda la funcionalidad de la aplicación web, **incluyendo funcionalidades nativas del dispositivo**.

## Funcionalidades Nativas Soportadas

La aplicación Android (flet_app) expone las siguientes APIs nativas del dispositivo a la webapp:

### 📸 Cámara (Escáner QR)
- **API Web**: `navigator.mediaDevices.getUserMedia()`
- **Permiso Android**: `CAMERA`
- **Uso**: Escaneo de códigos QR usando la librería Html5Qrcode
- **Prueba**: Ir a `/qr` en la webapp dentro de la app

### 📍 Geolocalización
- **API Web**: `navigator.geolocation.getCurrentPosition()`
- **Permisos Android**: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`
- **Uso**: Obtener ubicación actual del dispositivo
- **Prueba**: Ir a `/geo` en la webapp dentro de la app

### 🔔 Notificaciones Push
- **API Web**: Service Worker + Push API + Notifications API
- **Permiso Android**: `POST_NOTIFICATIONS` (Android 13+)
- **Uso**: Suscripción y recepción de notificaciones push
- **Prueba**: Ir a `/push` en la webapp dentro de la app

### 🌐 Conectividad
- **Permisos Android**: `INTERNET`, `ACCESS_NETWORK_STATE`, `ACCESS_WIFI_STATE`
- **Uso**: Comunicación con el backend Django y funcionamiento de PWA

## Arquitectura

```
flet_app/
├── config/          # Configuración y ajustes de la aplicación
├── services/        # Lógica de negocio y servicios API (auth, cliente API, etc.)
├── views/           # Componentes UI y pantallas
├── assets/          # Recursos estáticos (imágenes, iconos, etc.)
├── main.py          # Punto de entrada de la aplicación
├── pyproject.toml   # Configuración de build de Flet con permisos Android
├── requirements.txt # Dependencias Python
└── README.md        # Este archivo
```

## Características

- **Integración WebView**: Embebe la aplicación web Django en un WebView nativo
- **APIs Nativas del Dispositivo**: Soporte completo para cámara, geolocalización y notificaciones push
- **Compatible con PWA**: Funciona como PWA independiente o dentro de la app Android
- **Autenticación Segura**: Maneja autenticación basada en tokens con almacenamiento seguro
- **Capacidad Offline**: Cachea recursos para uso sin conexión (cuando está configurado)
- **Manejo de Errores**: Manejo elegante de errores con mensajes amigables para el usuario
- **Seguridad por Diseño**: Sigue mejores prácticas de seguridad con verificación SSL configurable

## Configuración de Desarrollo

### Prerequisitos

- Python 3.13+
- Docker y Docker Compose
- Android Studio (para construir APK/AAB)
- Flet CLI (opcional, para desarrollo local sin Docker)

### Desarrollo Local (Docker)

1. **Iniciar el entorno de desarrollo**:
   ```bash
   docker compose -f docker-compose.flet.local.yml up
   ```

2. **La app Flet estará disponible en**:
   - Modo escritorio: Se abrirá automáticamente en una ventana nativa
   - Modo web: http://localhost:8550

3. **Recarga automática**: Los cambios en archivos Python activarán automáticamente una recarga

### Desarrollo Local (Sin Docker)

1. **Instalar dependencias**:
   ```bash
   cd flet_app
   pip install -r requirements.txt
   ```

2. **Configurar variables de entorno**:
   ```bash
   export FLET_API_BASE_URL=http://localhost:8000
   export FLET_DEBUG=true
   ```

3. **Ejecutar la app**:
   ```bash
   # Modo escritorio (por defecto)
   flet run main.py

   # Modo web
   flet run --web --port 8550 main.py

   # Modo iOS (requiere macOS)
   flet run --ios main.py

   # Modo Android (requiere Android SDK)
   flet run --android main.py
   ```

## Construcción para Android

### Build de Desarrollo

1. **Usando Docker Compose**:
   ```bash
   docker compose -f docker-compose.flet.local.yml run --rm flet-build
   ```

2. **Build manual** (requiere Android SDK):
   ```bash
   cd flet_app
   flet build apk --project geoqr --build-number 1 --build-version 0.1.0
   ```

   El APK estará disponible en: `build/apk/app-release.apk`

### Build de Producción

1. **Usando Docker Compose**:
   ```bash
   docker compose -f docker-compose.flet.production.yml run --rm flet-build-release
   ```

2. **Build manual con firma**:
   ```bash
   cd flet_app
   flet build aab \
     --project geoqr \
     --build-number 1 \
     --build-version 1.0.0 \
     --key-store /path/to/keystore.jks \
     --key-store-password "$KEYSTORE_PASSWORD" \
     --key-alias "$KEY_ALIAS" \
     --key-password "$KEY_PASSWORD"
   ```

   El AAB estará disponible en: `build/aab/app-release.aab`

## Pruebas de Funcionalidades Nativas

### Prerequisitos para Testing

1. **Dispositivo Android físico o emulador** con:
   - Android 8.0+ (API 26+)
   - Android 13+ (API 33+) para notificaciones push
   - Cámara funcional (para escáner QR)
   - GPS habilitado (para geolocalización)

2. **Backend Django corriendo** y accesible desde el dispositivo

### Probar en Desarrollo

1. **Build e instalar la APK**:
   ```bash
   # Opción 1: Docker
   docker compose -f docker-compose.flet.local.yml run --rm flet-build
   
   # Opción 2: Manual
   cd flet_app
   flet build apk --project geoqr --build-number 1 --build-version 0.1.0
   ```

2. **Instalar en dispositivo**:
   ```bash
   # Via ADB
   adb install build/apk/app-release.apk
   
   # O transferir el APK y instalar manualmente
   ```

3. **Probar cada funcionalidad**:

   **a) Escaneo QR (Cámara)**:
   - Abrir la app
   - Navegar a la sección de escaneo QR (página `/qr`)
   - Presionar "Iniciar escaneo"
   - Android solicitará permiso de cámara (aceptar)
   - Apuntar a un código QR para escanear
   - ✅ Verificar que se detecta el código correctamente

   **b) Geolocalización**:
   - Navegar a la sección de ubicación (página `/geo`)
   - Presionar "Obtener ubicación"
   - Android solicitará permiso de ubicación (aceptar)
   - ✅ Verificar que se muestran las coordenadas y el mapa

   **c) Notificaciones Push**:
   - Navegar a la sección de notificaciones (página `/push`)
   - Presionar "Suscribirse"
   - Android solicitará permiso de notificaciones (aceptar en Android 13+)
   - Presionar "Enviar prueba"
   - ✅ Verificar que llega la notificación al dispositivo

### Verificar Permisos Configurados

Verificar que el APK incluye los permisos necesarios:

```bash
# Extraer permisos del APK
aapt dump permissions build/apk/app-release.apk

# Debe incluir:
# - android.permission.CAMERA
# - android.permission.ACCESS_FINE_LOCATION
# - android.permission.ACCESS_COARSE_LOCATION
# - android.permission.POST_NOTIFICATIONS (Android 13+)
# - android.permission.INTERNET
```

### Solución de Problemas

**Problema**: Permisos no solicitados
- **Solución**: Verificar que `pyproject.toml` incluye todos los permisos
- Rebuild la APK después de cambios en permisos

**Problema**: Cámara/ubicación no funciona
- **Solución**: Verificar que JavaScript está habilitado en WebView
- Verificar que el backend es accesible (CORS configurado)

**Problema**: Notificaciones no llegan
- **Solución**: Verificar que el Service Worker está registrado
- Verificar configuración VAPID en el backend
- En Android 13+, verificar permiso POST_NOTIFICATIONS concedido

## Configuración

Toda la configuración se gestiona a través de variables de entorno para seguridad y flexibilidad:

### Variables de Entorno Requeridas

- `FLET_API_BASE_URL`: URL del API backend de Django (por defecto: `http://django:8000`)

### Variables de Entorno Opcionales

- `FLET_APP_TITLE`: Título de la aplicación (por defecto: `GeoQR`)
- `FLET_DEBUG`: Habilitar modo debug (por defecto: `false`)
- `FLET_API_TIMEOUT`: Timeout de peticiones API en segundos (por defecto: `30`)
- `FLET_SECURE_STORAGE`: Usar almacenamiento seguro para tokens (por defecto: `true`)
- `FLET_VERIFY_SSL`: Verificar certificados SSL (por defecto: `true`)
- `FLET_WEBVIEW_JAVASCRIPT_ENABLED`: Habilitar JavaScript en WebView - **requerido para APIs nativas** (por defecto: `true`)
- `FLET_WEBVIEW_ALLOW_SERVICE_WORKERS`: Habilitar Service Workers - **requerido para PWA y push notifications** (por defecto: `true`)
- `FLET_WEBVIEW_PREVENT_LINK`: Prevenir enlaces externos (por defecto: `false`)
- `FLET_CACHE_ENABLED`: Habilitar caché de recursos (por defecto: `true`)
- `FLET_CACHE_SIZE_MB`: Límite de tamaño de caché en MB (por defecto: `100`)

### Archivos de Entorno

Los archivos de configuración se almacenan en `.envs/.local/.flet` (desarrollo) y `.envs/.production/.flet` (producción).

Ejemplo `.envs/.local/.flet`:
```bash
# Configuración de Desarrollo Flet
FLET_API_BASE_URL=http://django:8000
FLET_DEBUG=true
FLET_VERIFY_SSL=false
FLET_WEBVIEW_JAVASCRIPT_ENABLED=true
FLET_WEBVIEW_ALLOW_SERVICE_WORKERS=true
```

## Flujo de Despliegue

### Flujo de Desarrollo

1. **Hacer cambios de código** en `flet_app/`
2. **Probar localmente** usando Docker Compose o Flet CLI
3. **Build de APK de desarrollo** para probar en dispositivos
4. **Iterar** basándose en retroalimentación de pruebas

### Flujo de Producción

1. **Asegurar que todas las pruebas pasen** y el código sea revisado
2. **Actualizar números de versión** en la configuración de build
3. **Build de AAB firmado** usando Docker Compose de producción
4. **Subir a Google Play Console** para distribución
5. **Monitorear** reportes de crashes y retroalimentación de usuarios

## Consideraciones de Seguridad

Esta aplicación implementa mejores prácticas de seguridad:

1. **Almacenamiento Seguro de Tokens**: Los tokens de autenticación se almacenan usando almacenamiento seguro del cliente
2. **Verificación SSL**: Los certificados SSL se verifican por defecto (configurable)
3. **Validación de Entrada**: Todas las entradas de usuario se validan antes del procesamiento
4. **Comunicación Segura**: Toda comunicación API usa HTTPS en producción
5. **Sin Secretos Hardcodeados**: Todos los datos sensibles se configuran vía variables de entorno
6. **Permisos Mínimos**: La app Android solicita solo los permisos necesarios
7. **Seguridad de Contenido**: WebView está configurado para prevenir carga de contenido no autorizado

### Recomendaciones de Seguridad Adicionales

- Siempre usar HTTPS en producción (`FLET_API_BASE_URL` debe usar `https://`)
- Mantener `FLET_VERIFY_SSL=true` en producción
- Actualizar dependencias regularmente para parchear vulnerabilidades de seguridad
- Usar contraseñas fuertes de keystore y almacenarlas de forma segura
- Habilitar ProGuard/R8 para ofuscación de código en builds de producción
- Implementar certificate pinning para endpoints API críticos
- Usar almacenamiento cifrado para datos sensibles de usuario

## Pruebas

### Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
docker compose -f docker-compose.flet.local.yml run --rm flet pytest

# Ejecutar archivo de prueba específico
docker compose -f docker-compose.flet.local.yml run --rm flet pytest tests/test_auth.py
```

### Checklist de Pruebas Manuales

- [ ] La app se inicia exitosamente
- [ ] WebView carga la aplicación Django
- [ ] El flujo de autenticación funciona correctamente
- [ ] La navegación entre páginas funciona
- [ ] El manejo de errores muestra mensajes apropiados
- [ ] El modo offline funciona (si está habilitado)
- [ ] Las notificaciones push funcionan (si está implementado)
- [ ] La app maneja desconexión de red elegantemente

## Solución de Problemas

### Problemas Comunes

**Problema**: WebView muestra pantalla en blanco
- **Solución**: Verificar que `FLET_API_BASE_URL` es correcto y el servidor Django está corriendo

**Problema**: Errores de certificado SSL
- **Solución**: Para desarrollo local, configurar `FLET_VERIFY_SSL=false`

**Problema**: Build falla en Android
- **Solución**: Asegurar que Android SDK está configurado correctamente y `ANDROID_HOME` está establecido

**Problema**: La app crashea al iniciar
- **Solución**: Revisar logs con `adb logcat` y verificar que todas las variables de entorno están configuradas

### Modo Debug

Habilitar modo debug para logging detallado:
```bash
export FLET_DEBUG=true
```

Esto imprimirá información detallada sobre:
- Eventos de carga de página
- Peticiones y respuestas API
- Eventos de navegación
- Detalles de errores

## Optimización de Rendimiento

- **Habilitar caché**: Configurar `FLET_CACHE_ENABLED=true` para cachear recursos
- **Optimizar imágenes**: Usar tamaños y formatos de imagen apropiados
- **Minimizar JavaScript**: Habilitar JavaScript solo si es requerido
- **Usar ProGuard**: Habilitar reducción de código para builds de producción
- **Monitorear memoria**: Perfilar la app para identificar fugas de memoria

## Contribuir

Al contribuir a la app Flet:

1. Seguir la estructura de código y convenciones de nombres existentes
2. Agregar docstrings a todas las funciones y clases
3. Incluir type hints para mejor mantenibilidad del código
4. Probar en múltiples versiones de Android y tamaños de pantalla
5. Actualizar documentación para cualquier nueva característica
6. Asegurar que se siguen las mejores prácticas de seguridad

## Recursos

- [Documentación de Flet](https://flet.dev/)
- [Repositorio GitHub de Flet](https://github.com/flet-dev/flet)
- [Guía de Desarrollador Android](https://developer.android.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)

## Soporte

Para problemas o preguntas:
1. Revisar primero esta documentación
2. Revisar issues existentes en GitHub
3. Crear un nuevo issue con descripción detallada y logs
4. Contactar al equipo de desarrollo

## Licencia

No es código abierto - Ver archivo LICENSE para detalles.
