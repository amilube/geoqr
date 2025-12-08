from django.conf import settings
from django.shortcuts import render


def service_worker(request):
    """
    Vista que sirve el Service Worker como una plantilla Django.

    Esto permite usar variables de plantilla como {{ STATIC_URL }} y {{ cache_name }}
    en el archivo service-worker.js.
    """
    context = {
        "cache_name": f"geoqr-v{settings.SERVICE_WORKER_VERSION}"
        if hasattr(settings, "SERVICE_WORKER_VERSION")
        else "geoqr-v1",
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
