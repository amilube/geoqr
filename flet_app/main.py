"""
Main Flet Application Entry Point.

This module serves as the main entry point for the Flet-based Android frontend.
It wraps the existing Django web application in a Flet webview for Android deployment.
"""

import flet as ft

from flet_app.config.settings import API_BASE_URL
from flet_app.config.settings import APP_TITLE
from flet_app.config.settings import DEBUG
from flet_app.views.webview import WebViewPage


def main(page: ft.Page) -> None:
    """
    Main application entry point.

    Args:
        page: The Flet page instance.
    """
    # Configure page settings
    page.title = APP_TITLE
    page.theme_mode = ft.ThemeMode.LIGHT
    page.padding = 0
    page.spacing = 0

    # Security settings
    page.window_prevent_close = False

    # Add the webview page
    webview_page = WebViewPage(page, API_BASE_URL)
    page.add(webview_page)

    # Update the page
    page.update()

    if DEBUG:
        print(f"Flet app started. Loading URL: {API_BASE_URL}")


if __name__ == "__main__":
    # Run the Flet app
    ft.app(target=main)
