Usage
======================================================================

Registering the Service Worker
----------------------------------------------------------------------

The loader script registers ``/sw.js`` on page load:

- Source: `apps/pwa/static/pwa/js/load_sw.js`
- Include it from your base template to enable PWA features.

It also listens for messages sent by the Service Worker and can be used to
show UI banners for offline and server-error states.

Offline and Server Error Pages
----------------------------------------------------------------------

- Offline page HTML: `apps/pwa/templates/pwa/offline.html`
- Server error HTML: `apps/pwa/templates/pwa/server-error.html`

These pages are cached and served when:

- There’s no network connectivity (offline)
- The server returns 5xx status codes

Endpoints
----------------------------------------------------------------------

- Service Worker endpoint:
  - URL: ``/sw.js``
  - View: `apps.pwa.views.service_worker`
  - Template: `apps/pwa/templates/pwa/sw.txt`

- Offline endpoint:
  - URL: ``/offline.html``
  - View: `apps.pwa.views.offline`

- Server error endpoint:
  - URL: ``/server-error.html``
  - View: `apps.pwa.views.server_error`

Build and Serve Docs (optional)
----------------------------------------------------------------------

To serve project-wide docs via Docker:

.. code-block:: bash

   docker compose -f docker-compose.docs.yml up

Docs are served at port 9000 and watch for changes.
