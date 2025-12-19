"""
WebView component for embedding the Django web application.

This module provides a WebView component that loads and displays the Django
web application within the Flet Android app.
"""

import flet as ft

from flet_app.config.settings import DEBUG
from flet_app.config.settings import WEBVIEW_JAVASCRIPT_ENABLED
from flet_app.config.settings import WEBVIEW_PREVENT_LINK


class WebViewPage(ft.UserControl):
    """
    WebView page component.

    This component wraps the Django web application in a Flet WebView control,
    providing seamless integration between the web app and Android container.
    """

    def __init__(self, page: ft.Page, url: str) -> None:
        """
        Initialize the WebView page.

        Args:
            page: The Flet page instance.
            url: The URL of the Django web application to load.
        """
        super().__init__()
        self.page = page
        self.url = url
        self.webview: ft.WebView | None = None

    def build(self) -> ft.Container:
        """
        Build the WebView component.

        Returns:
            A container with the WebView control.
        """
        # Create loading indicator
        self.loading = ft.ProgressRing(visible=True)

        # Create WebView control
        self.webview = ft.WebView(
            url=self.url,
            expand=True,
            javascript_enabled=WEBVIEW_JAVASCRIPT_ENABLED,
            prevent_link=WEBVIEW_PREVENT_LINK,
            on_page_started=self._on_page_started,
            on_page_ended=self._on_page_ended,
            on_web_resource_error=self._on_web_resource_error,
        )

        # Create main container
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
        Handle page load start event.

        Args:
            e: The control event.
        """
        if DEBUG:
            print(f"Page started loading: {e.data}")
        self.loading.visible = True
        self.update()

    def _on_page_ended(self, e: ft.ControlEvent) -> None:
        """
        Handle page load end event.

        Args:
            e: The control event.
        """
        if DEBUG:
            print(f"Page finished loading: {e.data}")
        self.loading.visible = False
        self.update()

    def _on_web_resource_error(self, e: ft.ControlEvent) -> None:
        """
        Handle web resource error.

        Args:
            e: The control event.
        """
        error_message = f"Error loading page: {e.data}"
        if DEBUG:
            print(error_message)

        # Show error dialog
        self.page.dialog = ft.AlertDialog(
            title=ft.Text("Error"),
            content=ft.Text(error_message),
            actions=[
                ft.TextButton("OK", on_click=lambda _: self._close_dialog()),
                ft.TextButton("Retry", on_click=lambda _: self._retry_load()),
            ],
        )
        self.page.dialog.open = True
        self.loading.visible = False
        self.update()

    def _close_dialog(self) -> None:
        """Close the error dialog."""
        if self.page.dialog:
            self.page.dialog.open = False
            self.page.update()

    def _retry_load(self) -> None:
        """Retry loading the page."""
        self._close_dialog()
        if self.webview:
            self.webview.url = self.url
            self.loading.visible = True
            self.update()
