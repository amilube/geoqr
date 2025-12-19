"""
Componente WebView para embeber la aplicación web Django.

Este módulo proporciona un componente WebView que carga y muestra la aplicación
web Django dentro de la app Android Flet.
"""

import flet as ft

from flet_app.config.settings import DEBUG
from flet_app.config.settings import WEBVIEW_JAVASCRIPT_ENABLED
from flet_app.config.settings import WEBVIEW_PREVENT_LINK


class WebViewPage(ft.UserControl):
    """
    Componente de página WebView.

    Este componente envuelve la aplicación web Django en un control WebView de Flet,
    proporcionando integración perfecta entre la web app y el contenedor Android.
    """

    def __init__(self, page: ft.Page, url: str) -> None:
        """
        Inicializar la página WebView.

        Args:
            page: La instancia de página Flet.
            url: La URL de la aplicación web Django a cargar.
        """
        super().__init__()
        self.page = page
        self.url = url
        self.webview: ft.WebView | None = None

    def build(self) -> ft.Container:
        """
        Construir el componente WebView.

        Returns:
            Un contenedor con el control WebView.
        """
        # Crear indicador de carga
        self.loading = ft.ProgressRing(visible=True)

        # Crear control WebView con soporte para dispositivo nativo
        # Configuración para soportar APIs nativas del dispositivo:
        # - Geolocalización API (navigator.geolocation)
        # - Camera/MediaDevices API (navigator.mediaDevices para escaneo QR)
        # - Notifications API (para push notifications)
        # - Service Workers (habilitados automáticamente con JavaScript + HTTPS/localhost)
        self.webview = ft.WebView(
            url=self.url,
            expand=True,
            javascript_enabled=WEBVIEW_JAVASCRIPT_ENABLED,
            prevent_link=WEBVIEW_PREVENT_LINK,
            on_page_started=self._on_page_started,
            on_page_ended=self._on_page_ended,
            on_web_resource_error=self._on_web_resource_error,
        )

        # Crear contenedor principal
        return ft.Container(
            content=ft.Stack(
                [
                    self.webview,
                    ft.Container(
                        content=self.loading,
                        alignment=ft.alignment.center,
                    ),
                ],
                expand=True,
            ),
            expand=True,
            padding=0,
        )

    def _on_page_started(self, e: ft.ControlEvent) -> None:
        """
        Manejar evento de inicio de carga de página.

        Args:
            e: El evento de control.
        """
        if DEBUG:
            print(f"Página comenzó a cargar: {e.data}")
        self.loading.visible = True
        self.update()

    def _on_page_ended(self, e: ft.ControlEvent) -> None:
        """
        Manejar evento de fin de carga de página.

        Args:
            e: El evento de control.
        """
        if DEBUG:
            print(f"Página terminó de cargar: {e.data}")
        self.loading.visible = False
        self.update()

    def _on_web_resource_error(self, e: ft.ControlEvent) -> None:
        """
        Manejar error de recurso web.

        Args:
            e: El evento de control.
        """
        error_message = f"Error cargando página: {e.data}"
        if DEBUG:
            print(error_message)

        # Mostrar diálogo de error
        self.page.dialog = ft.AlertDialog(
            title=ft.Text("Error"),
            content=ft.Text(error_message),
            actions=[
                ft.TextButton("OK", on_click=lambda _: self._close_dialog()),
                ft.TextButton("Reintentar", on_click=lambda _: self._retry_load()),
            ],
        )
        self.page.dialog.open = True
        self.loading.visible = False
        self.update()

    def _close_dialog(self) -> None:
        """Cerrar el diálogo de error."""
        if self.page.dialog:
            self.page.dialog.open = False
            self.page.update()

    def _retry_load(self) -> None:
        """Reintentar cargar la página."""
        self._close_dialog()
        if self.webview:
            self.webview.url = self.url
            self.loading.visible = True
            self.update()
