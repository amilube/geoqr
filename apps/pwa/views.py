import hashlib
import json

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.http import require_http_methods


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


@login_required
@require_http_methods(["POST"])
def register_push_subscription(request):
    """
    Registra o actualiza la suscripción Web Push del usuario.
    """
    try:
        from push_notifications.models import WebPushDevice

        data = json.loads(request.body)
        subscription = data.get("subscription")

        if not subscription:
            return JsonResponse({"error": "No subscription data"}, status=400)

        # Extraer endpoint, keys, etc.
        endpoint = subscription.get("endpoint")
        p256dh = subscription.get("keys", {}).get("p256dh")
        auth = subscription.get("keys", {}).get("auth")

        if not all([endpoint, p256dh, auth]):
            return JsonResponse({"error": "Invalid subscription format"}, status=400)

        # Crear o actualizar el dispositivo
        device, created = WebPushDevice.objects.update_or_create(
            registration_id=endpoint,
            defaults={
                "user": request.user,
                "p256dh": p256dh,
                "auth": auth,
                "browser": data.get("browser", "unknown"),
                "active": True,
            },
        )

        return JsonResponse(
            {"success": True, "created": created, "device_id": device.id}
        )

    except ImportError:
        return JsonResponse(
            {"error": "django-push-notifications not installed"}, status=500
        )
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@login_required
@require_http_methods(["POST"])
def send_test_notification(request):
    """
    Envía una notificación de prueba al usuario actual.
    """
    try:
        from push_notifications.models import WebPushDevice

        # Obtener todos los dispositivos activos del usuario
        devices = WebPushDevice.objects.filter(user=request.user, active=True)

        if not devices.exists():
            return JsonResponse(
                {"error": "No active devices found. Please subscribe first."},
                status=400,
            )

        # Enviar notificación a todos los dispositivos
        message = {
            "title": "🧪 Notificación de Prueba",
            "body": "Esta es una notificación de prueba desde GeoQR. ¡Todo funciona correctamente!",
            "icon": "/static/icons/android/android-launchericon-192-192.png",
            "badge": "/static/icons/qeoqr_icon_monochrome.svg",
            "data": {"url": "/", "timestamp": timezone.now().isoformat()},
        }

        devices.send_message(message=json.dumps(message))

        return JsonResponse(
            {
                "success": True,
                "devices_count": devices.count(),
                "message": "Test notification sent",
            }
        )

    except ImportError:
        return JsonResponse(
            {"error": "django-push-notifications not installed"}, status=500
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@login_required
@require_http_methods(["DELETE"])
def unregister_push_subscription(request):
    """
    Desregistra la suscripción Web Push del usuario.
    """
    try:
        from push_notifications.models import WebPushDevice

        data = json.loads(request.body)
        endpoint = data.get("endpoint")

        if not endpoint:
            return JsonResponse({"error": "No endpoint provided"}, status=400)

        deleted_count, _ = WebPushDevice.objects.filter(
            registration_id=endpoint, user=request.user
        ).delete()

        return JsonResponse({"success": True, "deleted": deleted_count > 0})

    except ImportError:
        return JsonResponse(
            {"error": "django-push-notifications not installed"}, status=500
        )
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
