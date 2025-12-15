from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView


@method_decorator(login_required, name="dispatch")
class ProtectedHomeTemplateView(TemplateView):
    template_name = "pages/home.html"


@method_decorator(login_required, name="dispatch")
class PushTemplateView(TemplateView):
    template_name = "pages/push.html"


@method_decorator(login_required, name="dispatch")
class GeoTemplateView(TemplateView):
    template_name = "pages/geo.html"


@method_decorator(login_required, name="dispatch")
class QRTemplateView(TemplateView):
    template_name = "pages/qr.html"
