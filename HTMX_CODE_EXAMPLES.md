# HTMX Code Examples & Reference

## 📌 Índice

1. [HTMX Config](#htmx-config)
2. [Link Boost](#link-boost)
3. [CSS Animations](#css-animations)
4. [JavaScript Integration](#javascript-integration)
5. [Event Handling](#event-handling)
6. [Custom Integration](#custom-integration)

---

## HTMX Config

### Localización

**Archivo:** `/app/apps/templates/base.html` (lines ~240-260)

### Código

```javascript
<script>
  // HTMX Configuration
  htmx.config.refreshOnHistoryMiss = true;
  htmx.config.historyCacheSize = 10;

  // Configure HTMX to swap with main-content div
  htmx.onLoad(function(content) {
    // Reinitialize event listeners after HTMX swap
    initializeMobileMenu();
    initializeMobileProfileMenu();
  });

  // Scroll to top on page transition
  document.addEventListener('htmx:beforeSwap', function(event) {
    window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
  });
</script>
```

### Explicación

- `refreshOnHistoryMiss` - Si el usuario navega a una página no cacheada
- `historyCacheSize` - Número de páginas a guardar en cache
- `htmx:beforeSwap` - Se ejecuta antes de reemplazar el contenido

---

## Link Boost

### Qué es Boost?

"Boost mode" convierte links normales en AJAX requests que no recargan la página.

### Desktop Links

**Archivo:** `/app/apps/templates/base.html` (lines ~104-107)

```django-html
<!-- Logo -->
<a hx-boost="true" class="text-2xl font-bold text-white" href="{% url 'home' %}">
  GeoQR
</a>

<!-- Navbar Link -->
<a hx-boost="true" class="text-white hover:text-blue-100 font-medium transition" 
   href="{% url 'protected_home' %}">
  Inicio
</a>
```

### Mobile Links

**Archivo:** `/app/apps/templates/base.html` (lines ~186-215)

```django-html
<!-- Bottom Navbar with 5 Items -->
<nav class="md:hidden fixed bottom-0 inset-x-0 bg-white shadow-2xl shadow-black/10">
  <div class="grid grid-cols-5 text-center">
    <!-- Inicio -->
    <a hx-boost="true" href="{% url 'protected_home' %}" class="nav-item flex flex-col items-center justify-center py-2">
      <iconify-icon icon="lucide:home" class="text-2xl"></iconify-icon>
      <span class="text-xs mt-1">Inicio</span>
    </a>

    <!-- Notificaciones -->
    <a hx-boost="true" href="{% url 'push' %}" class="nav-item flex flex-col items-center justify-center py-2">
      <iconify-icon icon="lucide:bell" class="text-2xl"></iconify-icon>
      <span class="text-xs mt-1">Notifs</span>
    </a>

    <!-- QR Scanner -->
    <a hx-boost="true" href="{% url 'qr' %}" class="nav-item flex flex-col items-center justify-center py-2">
      <iconify-icon icon="lucide:qr-code" class="text-2xl"></iconify-icon>
      <span class="text-xs mt-1">Scan</span>
    </a>

    <!-- Geolocation -->
    <a hx-boost="true" href="{% url 'geo' %}" class="nav-item flex flex-col items-center justify-center py-2">
      <iconify-icon icon="lucide:map-pin" class="text-2xl"></iconify-icon>
      <span class="text-xs mt-1">Geo</span>
    </a>

    <!-- Menu -->
    <button id="mobile-profile-button" class="nav-item flex flex-col items-center justify-center py-2" type="button">
      <iconify-icon icon="lucide:user" class="text-2xl"></iconify-icon>
      <span class="text-xs mt-1">Menu</span>
    </button>
  </div>
</nav>
```

### Feature Cards

**Archivo:** `/app/apps/templates/pages/home.html` (lines ~22-77)

```django-html
<!-- Notificaciones Card -->
<a hx-boost="true" href="{% url 'push' %}" class="group block">
  <article class="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden h-full flex flex-col">
    <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-8 flex items-center justify-center flex-1">
      <iconify-icon icon="lucide:bell" class="text-6xl text-white"></iconify-icon>
    </div>
    <div class="p-6 flex-1 flex flex-col justify-between">
      <div>
        <h2 class="text-lg font-bold text-gray-900 mb-2">Notificaciones Push</h2>
        <p class="text-sm text-gray-600 leading-relaxed">Configura y prueba notificaciones en tu dispositivo.</p>
      </div>
      <div class="inline-flex items-center text-blue-600 font-semibold text-sm mt-4">
        Explorar <iconify-icon icon="lucide:arrow-right" class="ml-1"></iconify-icon>
      </div>
    </div>
  </article>
</a>
```

---

## CSS Animations

### En base.html (inline)

**Localización:** `/app/apps/templates/base.html` (lines ~27-55)

```css
<style>
  /* Fade transition for page loads */
  .htmx-request.htmx-settling #main-content {
    opacity: 0.6;
    transition: opacity 200ms ease-in;
  }

  .htmx-request.htmx-swapping #main-content {
    opacity: 0;
    transition: opacity 150ms ease-out;
  }

  .htmx-settling #main-content {
    opacity: 1;
    transition: opacity 300ms ease-in;
  }

  /* Smooth height transitions */
  #main-content {
    transition: all 300ms ease-in-out;
  }

  /* Loading indicator */
  .htmx-request .htmx-indicator {
    display: inline-block;
  }

  .htmx-indicator {
    display: none;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
```

### En project.css (archivo externo)

**Localización:** `/app/apps/static/css/project.css` (lines ~47-81)

```css
/* HTMX Page Transitions */
#main-content {
  will-change: opacity;
}

/* Fade in animation for new content */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.htmx-settling #main-content {
  animation: fadeIn 300ms ease-in forwards;
}

.htmx-request #main-content {
  animation: fadeOut 150ms ease-out forwards;
}

/* Loading state */
.htmx-request.htmx-settling {
  opacity: 0.7;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}
```

---

## JavaScript Integration

### HTMX Reinitialization

**Localización:** `/app/apps/static/js/project.js` (full file)

```javascript
/* Project specific Javascript goes here. */

/**
 * HTMX Integration
 * Handles page transitions and smooth loading with HTMX
 */

document.addEventListener('DOMContentLoaded', function() {
  // Configure HTMX settings
  if (typeof htmx !== 'undefined') {
    // Enable history management
    htmx.config.refreshOnHistoryMiss = true;
    htmx.config.historyCacheSize = 10;
    htmx.config.defaultIndicatorStyle = 'spinner';

    // Event listeners for page transitions
    
    // Before swap - prepare for animation
    document.body.addEventListener('htmx:beforeSwap', function(event) {
      // Add fade-out effect before swap
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.style.opacity = '0.7';
      }
    });

    // After swap - handle post-swap logic
    document.body.addEventListener('htmx:afterSwap', function(event) {
      // Reset opacity after swap
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.style.opacity = '1';
      }
      
      // Scroll to top smoothly
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

      // Re-initialize components after swap
      reinitializeComponents();
    });

    // On load - handle new content
    document.body.addEventListener('htmx:load', function(event) {
      reinitializeComponents();
    });

    // Trigger HTMX to add boost to dynamically added elements
    htmx.process(document.body);
  }
});

/**
 * Reinitialize components after HTMX swap
 * This function runs after each page load to ensure event listeners work
 */
function reinitializeComponents() {
  // Re-attach mobile menu listeners
  if (typeof initializeMobileMenu === 'function') {
    initializeMobileMenu();
  }

  // Re-attach profile menu listeners
  if (typeof initializeMobileProfileMenu === 'function') {
    initializeMobileProfileMenu();
  }

  // Re-initialize Alpine.js components if present
  if (typeof Alpine !== 'undefined' && Alpine.data) {
    // Alpine.js will auto-initialize new elements
  }

  // Re-initialize event listeners for dynamic content
  initializeDynamicListeners();
}

/**
 * Initialize event listeners for dynamically added content
 */
function initializeDynamicListeners() {
  // Add close button functionality to alerts
  const closeButtons = document.querySelectorAll('[onclick*="remove"]');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      this.closest('div').remove();
    });
  });

  // Re-process Iconify icons for newly added content
  if (typeof iconify !== 'undefined') {
    iconify.scan();
  }
}
```

---

## Event Handling

### HTMX Events Disponibles

```javascript
// Antes de hacer la request
document.addEventListener('htmx:beforeRequest', function(event) {
  console.log('About to make request:', event);
});

// Después de recibir response
document.addEventListener('htmx:afterSwap', function(event) {
  console.log('Content swapped:', event);
  reinitializeComponents();  // ← Importante!
});

// Cuando hay un error
document.addEventListener('htmx:responseError', function(event) {
  console.error('Error:', event);
  alert('Error loading page');
});

// Cuando se carga contenido nuevo
document.addEventListener('htmx:load', function(event) {
  console.log('New content loaded:', event);
});
```

### Estado de HTMX Classes

HTMX automáticamente agrega clases durante las transiciones:

```html
<!-- Estado inicial -->
<div id="main-content">Contenido</div>

<!-- Durante request -->
<div id="main-content" class="htmx-request">Contenido</div>

<!-- Durante swap -->
<div id="main-content" class="htmx-request htmx-swapping">Contenido</div>

<!-- Después del swap -->
<div id="main-content" class="htmx-settling">Contenido</div>

<!-- Estado final -->
<div id="main-content">Contenido</div>
```

---

## Custom Integration

### Crear Nueva Página con HTMX

**Step 1: Create Django View**

```python
# /app/config/views.py
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView

@method_decorator(login_required, name="dispatch")
class MyCustomPageView(TemplateView):
    template_name = "pages/mycustom.html"
```

**Step 2: Register URL**

```python
# /app/config/urls.py
from .views import MyCustomPageView

urlpatterns = [
    # ... existing patterns ...
    path("mycustom/", MyCustomPageView.as_view(), name="mycustom"),
]
```

**Step 3: Create Template**

```django-html
{# /app/apps/templates/pages/mycustom.html #}
{% extends "base.html" %}
{% load static %}

{% block content %}
  <div class="max-w-6xl mx-auto">
    <section class="bg-gradient-to-br from-purple-600 to-pink-600 text-white px-6 py-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-3">Mi Página Custom</h1>
      <p class="text-white/80 text-lg">Esta página tiene transiciones HTMX automáticas</p>
    </section>

    <div class="px-4 py-8">
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-4">Contenido</h2>
        <p class="text-gray-600">Este contenido será cargado sin page reload.</p>
      </div>
    </div>
  </div>
{% endblock content %}
```

**Step 4: Add Navigation Link**

```django-html
<!-- En base.html o cualquier template -->
<a hx-boost="true" href="{% url 'mycustom' %}">Mi Página Custom</a>
```

¡Listo! La página tendrá transiciones HTMX automáticamente.

### Agregar Script Personalizado en Página

```django-html
{% extends "base.html" %}

{% block content %}
  <h1>Mi Página</h1>

  <script>
    // Este script se ejecutará después de cada carga de página
    // Incluso cuando se carga vía HTMX
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Página cargada!');
      // Tu código aquí
    });

    // O mejor aún, usar evento HTMX
    document.addEventListener('htmx:afterSwap', function() {
      console.log('Contenido reemplazado!');
      // Tu código aquí
    });
  </script>
{% endblock %}
```

### Indicador de Carga Personalizado

```django-html
<!-- En base.html, después del navbar -->
<div id="htmx-indicator" class="htmx-indicator fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
  Cargando...
</div>

<style>
  .htmx-request #htmx-indicator {
    display: block;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
```

---

## Debugging

### Ver logs de HTMX

```javascript
// En la consola del navegador
htmx.logAll();  // Activa todos los logs

// O un evento específico
htmx.on('htmx:xhr:load', function(evt) {
  console.log('XHR Load:', evt);
});
```

### Desactivar HTMX temporalmente

```javascript
// En consola
htmx.config.timeout = 0;  // Sin timeout
htmx.config.refreshOnHistoryMiss = false;  // No refrescar en history miss
```

### Forzar recarga de página

```javascript
// Si HTMX falla, vuelve a cargar manualmente
window.location.reload();
```

---

## Migración de Código Existente

### Antes (Sin HTMX)

```django-html
<a href="{% url 'push' %}" class="btn btn-primary">
  Notificaciones
</a>
```

### Después (Con HTMX)

```django-html
<a hx-boost="true" href="{% url 'push' %}" class="btn btn-primary">
  Notificaciones
</a>
```

**Es literalmente solo agregar `hx-boost="true"`** 🎉

---

## Recursos

- **HTMX Official:** <https://htmx.org>
- **HTMX Docs:** <https://htmx.org/docs>
- **HTMX Examples:** <https://htmx.org/examples>
- **Nuestros docs:**
  - `HTMX_INTEGRATION.md` - Guía completa
  - `HTMX_QUICKSTART.md` - Quick start
  - Este archivo - Code examples

---

**¡Felicidades! Ya comprendes cómo funciona HTMX en esta aplicación.** 🚀
