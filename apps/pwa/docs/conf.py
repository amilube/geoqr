import os
import sys

# Minimal Sphinx conf for apps.pwa docs

# Ensure project root is on sys.path so Django modules import correctly
sys.path.insert(0, os.path.abspath("/app"))

# Configure Django so autodoc can import project modules
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")
try:
    import django  # noqa: F401

    django.setup()
except Exception:
    # If Django can't be set up (e.g., when building outside the container),
    # still allow Sphinx to render static pages.
    pass

project = "GeoQR PWA"
author = "GeoQR Contributors"

extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.napoleon",
]

templates_path = []
exclude_patterns = ["_build"]

html_theme = "alabaster"
