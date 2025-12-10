import hashlib

from django.conf import settings
from django.shortcuts import render
from django.utils import timezone


def _get_service_worker_cache_name():
    """
    Genera el nombre de caché del Service Worker automáticamente.
    Usa hash basado en contenido de archivos críticos - cambios automáticos = nueva versión.
    """
    try:
        files_to_hash = [
            # Template del service worker
            settings.BASE_DIR / "apps" / "pwa" / "templates" / "pwa" / "sw.txt",
            # Archivos estáticos críticos
            settings.BASE_DIR / "apps" / "static" / "app.js",
            settings.BASE_DIR / "apps" / "static" / "fallback.css",
            settings.BASE_DIR / "apps" / "static" / "manifest.json",
        ]

        combined_content = b""
        for file_path in files_to_hash:
            if file_path.exists():
                combined_content += file_path.read_bytes()

        # Generar hash corto del contenido combinado
        content_hash = hashlib.sha256(combined_content).hexdigest()[:12]

    except OSError:
        # Fallback: usar timestamp si hay un error de E/S (archivo no encontrado, permisos, etc.)
        if settings.DEBUG:
            return f"geoqr-dev-{timezone.now().strftime('%Y%m%d%H%M%S')}"

        # En producción, usar versión fija como último recurso
        return "geoqr-v1"
    else:
        return f"geoqr-{content_hash}"


def service_worker(request):
    """
    Vista que sirve el Service Worker como una plantilla Django.

    El cache_name se genera AUTOMÁTICAMENTE basado en el hash del contenido
    de archivos críticos. Cualquier cambio en el SW o archivos estáticos
    genera un nuevo nombre de caché, forzando actualización en clientes.

    No requiere intervención manual - la versión se actualiza automáticamente
    cuando modificas el código.
    """
    context = {
        "cache_name": _get_service_worker_cache_name(),
        "debug": settings.DEBUG,
    }
    return render(
        request,
        "pwa/sw.txt",
        context,
        content_type="application/javascript",
    )


def offline(request):
    """
    Vista que sirve la página de error cuando el usuario no tiene conexión a internet.
    El Service Worker redirige aquí cuando no puede alcanzar el servidor.
    """
    return render(request, "pwa/offline.html", status=200)


def server_error(request):
    """
    Vista que sirve la página de error cuando el servidor está caído (5xx).
    El Service Worker redirige aquí cuando recibe errores del servidor.
    """
    return render(request, "pwa/server-error.html", status=200)


def assetlinks(request):
    """
    Vista que sirve el archivo assetlinks.json necesario para la verificación de aplicaciones en Android.
    """
    return render(request, "pwa/assetlinks.json", content_type="application/json")


def privacity_page(request):
    """
    Vista que sirve la página de privacidad de la PWA.
    """
    return render(request, "pwa/privacity_page.html", status=200)
