Overview
======================================================================

Routes
----------------------------------------------------------------------

The app defines public endpoints (see `apps/pwa/urls.py`):

- ``/sw.js`` → Service Worker (view: `apps.pwa.views.service_worker`)
- ``/offline.html`` → Offline page (view: `apps.pwa.views.offline`)
- ``/server-error.html`` → Server error page (view: `apps.pwa.views.server_error`)

Views and Templates
----------------------------------------------------------------------

- Service Worker:
  - View: `apps.pwa.views.service_worker`
  - Template: `apps/pwa/templates/pwa/sw.txt`
  - Renders a dynamic Service Worker using Django template context.

- Offline page:
  - View: `apps.pwa.views.offline`
  - Template: `apps/pwa/templates/pwa/offline.html`
  - Shown when the client is offline or network requests fail.

- Server error page:
  - View: `apps.pwa.views.server_error`
  - Template: `apps/pwa/templates/pwa/server-error.html`
  - Shown when the server responds with 5xx errors.

Client Integration
----------------------------------------------------------------------

Service Worker registration lives in `apps/pwa/static/pwa/js/load_sw.js` and is
typically included from the project base template.

Service Worker Behavior (high level)
----------------------------------------------------------------------

- Precaches core pages: ``/``, ``/offline.html``, ``/server-error.html`` and
  selected static assets.
- Fetch strategy:
  - Serves cached content when available.
  - On network errors:
    - If offline: returns cached offline page.
    - If server error (5xx): returns cached server error page (or a fallback).
- Posts client notifications via ``clients.postMessage`` to inform the UI about
  offline/server-error states.
