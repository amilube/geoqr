"""
Componente WebView para embeber la aplicación web Django.

Este módulo proporciona un componente WebView que carga y muestra la aplicación
web Django dentro de la app Android Flet.
"""

import flet as ft

from flet_app.config.settings import DEBUG
from flet_app.config.settings import WEBVIEW_JAVASCRIPT_ENABLED
from flet_app.config.settings import WEBVIEW_PREVENT_LINK


def create_webview_page(page: ft.Page, url: str) -> ft.Container:
    """
    Crear el componente WebView.

    Args:
        page: La instancia de página Flet.
        url: La URL de la aplicación web Django a cargar.

    Returns:
        Un contenedor con el control WebView.
    """
    # Crear indicador de carga
    loading = ft.ProgressRing(visible=True)

    def on_page_started(e: ft.ControlEvent) -> None:
        """Manejar evento de inicio de carga de página."""
        if DEBUG:
            print(f"Página comenzó a cargar: {e.data}")
        loading.visible = True
        page.update()

    def on_page_ended(e: ft.ControlEvent) -> None:
        """Manejar evento de fin de carga de página."""
        if DEBUG:
            print(f"Página terminó de cargar: {e.data}")
        loading.visible = False
        page.update()

    def on_web_resource_error(e: ft.ControlEvent) -> None:
        """Manejar error de recurso web."""
        error_message = f"Error cargando página: {e.data}"
        if DEBUG:
            print(error_message)

        def close_dialog(_):
            page.dialog.open = False
            page.update()

        def retry_load(_):
            page.dialog.open = False
            webview.url = url
            loading.visible = True
            page.update()

        # Mostrar diálogo de error
        page.dialog = ft.AlertDialog(
            title=ft.Text("Error"),
            content=ft.Text(error_message),
            actions=[
                ft.TextButton("OK", on_click=close_dialog),
                ft.TextButton("Reintentar", on_click=retry_load),
            ],
        )
        page.dialog.open = True
        loading.visible = False
        page.update()

    # Crear control WebView con soporte para dispositivo nativo
    # Configuración para soportar APIs nativas del dispositivo:
    # - Geolocalización API (navigator.geolocation)
    # - Camera/MediaDevices API (navigator.mediaDevices para escaneo QR)
    # - Notifications API (para push notifications)
    # - Service Workers (habilitados automáticamente con JavaScript + HTTPS/localhost)
    webview = ft.WebView(
        url=url,
        expand=True,
        javascript_enabled=WEBVIEW_JAVASCRIPT_ENABLED,
        prevent_link=WEBVIEW_PREVENT_LINK,
        on_page_started=on_page_started,
        on_page_ended=on_page_ended,
        on_web_resource_error=on_web_resource_error,
    )

    # Crear contenedor principal
    return ft.Container(
        content=ft.Stack(
            [
                webview,
                ft.Container(
                    content=loading,
                    alignment=ft.alignment.center,
                ),
            ],
            expand=True,
        ),
        expand=True,
        padding=0,
    )
