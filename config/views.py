from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView


@method_decorator(login_required, name="dispatch")
class ProtectedHomeTemplateView(TemplateView):
    template_name = "pages/home.html"


@method_decorator(login_required, name="dispatch")
class PushTemplateView(TemplateView):
    template_name = "pages/push.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["vapid_public_key"] = getattr(settings, "WP_VAPID_PUBLIC_KEY", "")
        return context


@method_decorator(login_required, name="dispatch")
class GeoTemplateView(TemplateView):
    template_name = "pages/geo.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["google_maps_js_api_key"] = settings.GOOGLE_MAPS_JS_API_KEY
        return context


@method_decorator(login_required, name="dispatch")
class QRTemplateView(TemplateView):
    template_name = "pages/qr.html"
