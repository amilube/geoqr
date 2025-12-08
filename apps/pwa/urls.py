# Urls to serve the PWA app
from django.urls import path

from apps.pwa.views import assetlinks
from apps.pwa.views import offline
from apps.pwa.views import privacity_page
from apps.pwa.views import server_error
from apps.pwa.views import service_worker

urlpatterns = [
    path("sw.js", service_worker, name="service_worker"),
    path("offline.html", offline, name="offline"),
    path("server-error.html", server_error, name="server_error"),
    path(".well-known/assetlinks.json", assetlinks, name="assetlinks"),
    path("privacidad/", privacity_page, name="privacity_page"),
]
