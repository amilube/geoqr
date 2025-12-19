"""
Flet Application Settings.

This module contains configuration settings for the Flet Android application.
Settings are loaded from environment variables for security and flexibility.
"""

import os

# Application settings
APP_TITLE = os.getenv("FLET_APP_TITLE", "GeoQR")
DEBUG = os.getenv("FLET_DEBUG", "False").lower() == "true"

# Backend API configuration
API_BASE_URL = os.getenv("FLET_API_BASE_URL", "http://django:8000")
API_TIMEOUT = int(os.getenv("FLET_API_TIMEOUT", "30"))

# Security settings
SECURE_STORAGE = os.getenv("FLET_SECURE_STORAGE", "True").lower() == "true"
VERIFY_SSL = os.getenv("FLET_VERIFY_SSL", "True").lower() == "true"

# WebView settings para soportar funcionalidades nativas
# JavaScript debe estar habilitado para que funcionen las APIs de:
# - Geolocalización (navigator.geolocation)
# - Cámara/MediaDevices (navigator.mediaDevices para escaneo QR)
# - Notificaciones Push (Service Worker + Push API)
WEBVIEW_JAVASCRIPT_ENABLED = (
    os.getenv("FLET_WEBVIEW_JAVASCRIPT_ENABLED", "True").lower() == "true"
)
WEBVIEW_PREVENT_LINK = (
    os.getenv("FLET_WEBVIEW_PREVENT_LINK", "False").lower() == "true"
)

# Nota: Service Workers se habilitan automáticamente cuando JavaScript está
# habilitado y el contenido se sirve desde HTTPS o localhost.
# Esta variable es para documentación y futuras configuraciones.
WEBVIEW_ALLOW_SERVICE_WORKERS = (
    os.getenv("FLET_WEBVIEW_ALLOW_SERVICE_WORKERS", "True").lower() == "true"
)

# Cache settings
CACHE_ENABLED = os.getenv("FLET_CACHE_ENABLED", "True").lower() == "true"
CACHE_SIZE_MB = int(os.getenv("FLET_CACHE_SIZE_MB", "100"))
