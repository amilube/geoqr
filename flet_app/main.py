"""
Punto de Entrada Principal de la Aplicación Flet.

Este módulo sirve como punto de entrada principal para el frontend Android basado en Flet.
Envuelve la aplicación web Django existente en un webview Flet para despliegue en Android.
"""

import flet as ft

from flet_app.config.settings import API_BASE_URL
from flet_app.config.settings import APP_TITLE
from flet_app.config.settings import DEBUG
from flet_app.views.webview import create_webview_page


def main(page: ft.Page) -> None:
    """
    Punto de entrada principal de la aplicación.

    Args:
        page: La instancia de página Flet.
    """
    # Configurar ajustes de página
    page.title = APP_TITLE
    page.theme_mode = ft.ThemeMode.LIGHT
    page.padding = 0
    page.spacing = 0

    # Ajustes de seguridad
    page.window_prevent_close = False

    # Agregar la página webview
    webview_container = create_webview_page(page, API_BASE_URL)
    page.add(webview_container)

    # Actualizar la página
    page.update()

    if DEBUG:
        print(f"App Flet iniciada. Cargando URL: {API_BASE_URL}")


if __name__ == "__main__":
    # Ejecutar la app Flet
    # For web mode, use view parameter
    import os
    
    port = int(os.getenv("FLET_PORT", "8550"))
    host = os.getenv("FLET_HOST", "0.0.0.0")
    
    # Run in web mode for development
    ft.app(target=main, port=port, host=host, view=ft.AppView.WEB_BROWSER)
