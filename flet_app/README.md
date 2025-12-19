# Flet Android Frontend

This directory contains the Flet-based frontend application for wrapping the GeoQR Django web application into an Android app.

## Overview

The Flet app provides a native Android container that embeds the existing Django web application in a WebView, allowing seamless deployment to Android devices while maintaining the full functionality of the web application, **including native device features**.

## Funcionalidades Nativas Soportadas

La aplicación Android (flet_app) expone las siguientes APIs nativas del dispositivo a la webapp:

### 📸 Cámara (QR Scanner)
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

## Architecture

```
flet_app/
├── config/          # Application configuration and settings
├── services/        # Business logic and API services (auth, API client, etc.)
├── views/           # UI components and screens
├── assets/          # Static assets (images, icons, etc.)
├── main.py          # Application entry point
├── pyproject.toml   # Flet build configuration with Android permissions
├── requirements.txt # Python dependencies
└── README.md        # This file
```

## Features

- **WebView Integration**: Embeds the Django web application in a native WebView
- **Native Device APIs**: Full support for camera, geolocation, and push notifications
- **PWA Compatible**: Works as standalone PWA or within the Android app
- **Secure Authentication**: Handles token-based authentication with secure storage
- **Offline Capability**: Caches resources for offline use (when configured)
- **Error Handling**: Graceful error handling with user-friendly messages
- **Security by Design**: Follows security best practices with configurable SSL verification

## Development Setup

### Prerequisites

- Python 3.13+
- Docker and Docker Compose
- Android Studio (for building APK/AAB)
- Flet CLI (optional, for local development without Docker)

### Local Development (Docker)

1. **Start the development environment**:
   ```bash
   docker compose -f docker-compose.flet.local.yml up
   ```

2. **The Flet app will be available at**:
   - Desktop mode: Will open automatically in a native window
   - Web mode: http://localhost:8550

3. **Hot reload**: Changes to Python files will automatically trigger a reload

### Local Development (Without Docker)

1. **Install dependencies**:
   ```bash
   cd flet_app
   pip install -r requirements.txt
   ```

2. **Set environment variables**:
   ```bash
   export FLET_API_BASE_URL=http://localhost:8000
   export FLET_DEBUG=true
   ```

3. **Run the app**:
   ```bash
   # Desktop mode (default)
   flet run main.py

   # Web mode
   flet run --web --port 8550 main.py

   # iOS mode (requires macOS)
   flet run --ios main.py

   # Android mode (requires Android SDK)
   flet run --android main.py
   ```

## Building for Android

### Development Build

1. **Using Docker Compose**:
   ```bash
   docker compose -f docker-compose.flet.local.yml run --rm flet-build
   ```

2. **Manual build** (requires Android SDK):
   ```bash
   cd flet_app
   flet build apk --project geoqr --build-number 1 --build-version 0.1.0
   ```

   The APK will be available at: `build/apk/app-release.apk`

### Production Build

1. **Using Docker Compose**:
   ```bash
   docker compose -f docker-compose.flet.production.yml run --rm flet-build-release
   ```

2. **Manual build with signing**:
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

   The AAB will be available at: `build/aab/app-release.aab`

## Testing Native Features

### Prerequisitos para Testing

1. **Dispositivo Android físico o emulador** con:
   - Android 8.0+ (API 26+)
   - Android 13+ (API 33+) para notificaciones push
   - Cámara funcional (para QR scanner)
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

### Troubleshooting

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

## Configuration

All configuration is managed through environment variables for security and flexibility:

### Required Environment Variables

- `FLET_API_BASE_URL`: URL of the Django backend API (default: `http://django:8000`)

### Optional Environment Variables

- `FLET_APP_TITLE`: Application title (default: `GeoQR`)
- `FLET_DEBUG`: Enable debug mode (default: `false`)
- `FLET_API_TIMEOUT`: API request timeout in seconds (default: `30`)
- `FLET_SECURE_STORAGE`: Use secure storage for tokens (default: `true`)
- `FLET_VERIFY_SSL`: Verify SSL certificates (default: `true`)
- `FLET_WEBVIEW_JAVASCRIPT_ENABLED`: Enable JavaScript in WebView - **requerido para APIs nativas** (default: `true`)
- `FLET_WEBVIEW_ALLOW_SERVICE_WORKERS`: Enable Service Workers - **requerido para PWA y push notifications** (default: `true`)
- `FLET_WEBVIEW_PREVENT_LINK`: Prevent external links (default: `false`)
- `FLET_CACHE_ENABLED`: Enable resource caching (default: `true`)
- `FLET_CACHE_SIZE_MB`: Cache size limit in MB (default: `100`)

### Environment Files

Configuration files are stored in `.envs/.local/.flet` (development) and `.envs/.production/.flet` (production).

Example `.envs/.local/.flet`:
```bash
# Flet Development Configuration
FLET_API_BASE_URL=http://django:8000
FLET_DEBUG=true
FLET_VERIFY_SSL=false
FLET_WEBVIEW_JAVASCRIPT_ENABLED=true
FLET_WEBVIEW_ALLOW_SERVICE_WORKERS=true
```

## Deployment Workflow

### Development Workflow

1. **Make code changes** in `flet_app/`
2. **Test locally** using Docker Compose or Flet CLI
3. **Build development APK** for testing on devices
4. **Iterate** based on testing feedback

### Production Workflow

1. **Ensure all tests pass** and code is reviewed
2. **Update version numbers** in build configuration
3. **Build signed AAB** using production Docker Compose
4. **Upload to Google Play Console** for distribution
5. **Monitor** crash reports and user feedback

## Security Considerations

This application implements security best practices:

1. **Secure Token Storage**: Authentication tokens are stored using secure client storage
2. **SSL Verification**: SSL certificates are verified by default (configurable)
3. **Input Validation**: All user inputs are validated before processing
4. **Secure Communication**: All API communication uses HTTPS in production
5. **No Hardcoded Secrets**: All sensitive data is configured via environment variables
6. **Minimal Permissions**: Android app requests only necessary permissions
7. **Content Security**: WebView is configured to prevent unauthorized content loading

### Additional Security Recommendations

- Always use HTTPS in production (`FLET_API_BASE_URL` should use `https://`)
- Keep `FLET_VERIFY_SSL=true` in production
- Regularly update dependencies to patch security vulnerabilities
- Use strong keystore passwords and store them securely
- Enable ProGuard/R8 for code obfuscation in production builds
- Implement certificate pinning for critical API endpoints
- Use encrypted storage for sensitive user data

## Testing

### Running Tests

```bash
# Run all tests
docker compose -f docker-compose.flet.local.yml run --rm flet pytest

# Run specific test file
docker compose -f docker-compose.flet.local.yml run --rm flet pytest tests/test_auth.py
```

### Manual Testing Checklist

- [ ] App launches successfully
- [ ] WebView loads the Django application
- [ ] Authentication flow works correctly
- [ ] Navigation between pages works
- [ ] Error handling displays appropriate messages
- [ ] Offline mode works (if enabled)
- [ ] Push notifications work (if implemented)
- [ ] App handles network disconnection gracefully

## Troubleshooting

### Common Issues

**Issue**: WebView shows blank screen
- **Solution**: Check `FLET_API_BASE_URL` is correct and Django server is running

**Issue**: SSL certificate errors
- **Solution**: For local development, set `FLET_VERIFY_SSL=false`

**Issue**: Build fails on Android
- **Solution**: Ensure Android SDK is properly configured and `ANDROID_HOME` is set

**Issue**: App crashes on startup
- **Solution**: Check logs with `adb logcat` and verify all environment variables are set

### Debug Mode

Enable debug mode for detailed logging:
```bash
export FLET_DEBUG=true
```

This will print detailed information about:
- Page load events
- API requests and responses
- Navigation events
- Error details

## Performance Optimization

- **Enable caching**: Set `FLET_CACHE_ENABLED=true` to cache resources
- **Optimize images**: Use appropriate image sizes and formats
- **Minimize JavaScript**: Enable JavaScript only if required
- **Use ProGuard**: Enable code shrinking for production builds
- **Monitor memory**: Profile app to identify memory leaks

## Contributing

When contributing to the Flet app:

1. Follow the existing code structure and naming conventions
2. Add docstrings to all functions and classes
3. Include type hints for better code maintainability
4. Test on multiple Android versions and screen sizes
5. Update documentation for any new features
6. Ensure security best practices are followed

## Resources

- [Flet Documentation](https://flet.dev/)
- [Flet GitHub Repository](https://github.com/flet-dev/flet)
- [Android Developer Guide](https://developer.android.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)

## Support

For issues or questions:
1. Check this documentation first
2. Review existing GitHub issues
3. Create a new issue with detailed description and logs
4. Contact the development team

## License

Not open source - See LICENSE file for details.
