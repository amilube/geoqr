# 🚀 HTMX Integration - Quick Start

## ¿Qué se implementó?

Se ha integrado **HTMX v2.0.0** con **page transitions suaves** en la aplicación GeoQR. Ahora la navegación es más fluida y moderna:

- ✨ **Transiciones suaves** entre páginas (fade in/out)
- ⚡ **Navegación sin recarga** - Solo el contenido se actualiza
- 📱 **Mobile optimizado** - Funciona perfectamente en dispositivos
- 🎨 **Material Design** - Interfaz moderna y profesional

---

## 🎯 Características

### 1. **Boost Mode Automático**

Todos los enlaces de navegación usan `hx-boost="true"`:

- Logo "GeoQR"
- Enlace "Inicio" (desktop)
- Bottom navbar (5 items en mobile)
- Cards de inicio

Cuando haces click, HTMX intercepta el evento y carga la página sin refrescar.

### 2. **Page Transitions Animadas**

```
Click en enlace
    ↓
Fade out (150ms) ← Opacidad disminuye
    ↓
Carga contenido vía AJAX
    ↓
Fade in (300ms) ← Opacidad aumenta
    ↓
Página lista con scroll al top
```

### 3. **Browser History Funcionando**

- Back/Forward del navegador funciona correctamente
- HTMX cachea últimas 10 páginas
- Historial se actualiza automáticamente

### 4. **Re-inicialización de Componentes**

Después de cada transición:

- Se reinician event listeners (menus, dropdowns)
- Se escanean nuevos iconos (Iconify)
- Se remontán listeners de alertas

---

## 📋 Páginas Configuradas

### Desktop (Escritorio)

```
┌─────────────────────────────┐
│  GeoQR  [Inicio]  [Sign Out]│  ← Top navbar con hx-boost
├─────────────────────────────┤
│                             │
│    [Notificaciones]         │
│    [Geolocalización]        │  ← Cards con hx-boost
│    [Escanear QR]            │
│                             │
└─────────────────────────────┘
```

### Mobile

```
┌─────────────────────┐
│ [☰] GeoQR           │  ← Top navbar
├─────────────────────┤
│                     │
│  Contenido          │
│  de la página       │
│                     │
├─────────────────────┤
│🏠│🔔│📱│📍│👤│      │  ← Bottom navbar con hx-boost
└─────────────────────┘
```

---

## 🧪 Pruebas

### Verificar que funciona

**1. Abre la app en el navegador**

```
URL: http://localhost:8000/home/
```

**2. Haz click en cualquier elemento de navegación**

- Observa: Se ve fade-out rápido
- Luego: Fade-in del nuevo contenido
- Esperado: NO debe haber recarga de página

**3. Abre Developer Tools (F12)**

- Tab "Network"
- Haz click en un enlace
- Deberías ver una petición `XHR` (no document)
- Response será solo el HTML del contenido

**4. Prueba Back/Forward**

- Navega entre páginas
- Presiona back en el navegador
- Debe volver a la página anterior suavemente

**5. Mobile (Opcional)**

- Emula un dispositivo en DevTools (Ctrl+Shift+M)
- Prueba los 5 items del bottom navbar
- Todos deben tener transiciones suaves

---

## 📁 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `base.html` | Template principal con HTMX config y animaciones |
| `project.css` | Animaciones fade in/out y comportamientos HTMX |
| `project.js` | Event listeners y re-inicializadores |
| `pages/home.html` | Cards con hx-boost |
| `pages/push.html` | Página de notificaciones |
| `pages/geo.html` | Página de geolocalización |
| `pages/qr.html` | Página de escaneo QR |

---

## ⚙️ Cómo Funciona Internamente

### HTMX Config

```javascript
// En base.html, dentro de <script>
htmx.config.refreshOnHistoryMiss = true;  // Reload si hay miss de history
htmx.config.historyCacheSize = 10;        // Guardar 10 últimas páginas
```

### Links Boosted

```django-html
<a hx-boost="true" href="{% url 'push' %}">Notificaciones</a>
```

### Target para Reemplazo

```django-html
<div id="main-content">
  <!-- Este div será reemplazado por HTMX -->
  {% block content %}...{% endblock %}
</div>
```

### Event Listeners

```javascript
// Antes de swap (fade-out)
htmx:beforeSwap → opacity: 0.7

// Después de swap (fade-in)
htmx:afterSwap → reinitializeComponents()
              → scroll al top
```

---

## 🎨 Animaciones CSS

Las transiciones usan CSS puro (sin JavaScript complicado):

```css
/* Fade In (después de cargar) */
.htmx-settling #main-content {
  animation: fadeIn 300ms ease-in forwards;
}

/* Fade Out (antes de cargar) */
.htmx-request #main-content {
  animation: fadeOut 150ms ease-out forwards;
}
```

---

## 🔧 Customización

### Cambiar velocidad de animaciones

En `base.html` o `project.css`, busca:

```css
animation: fadeIn 300ms ease-in forwards;  /* 300ms → cambiar aquí */
```

### Cambiar tipo de animación

```css
/* Slide in en lugar de fade */
@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.htmx-settling #main-content {
  animation: slideIn 300ms ease-in forwards;
}
```

### Agregar hx-boost a nuevos links

```django-html
<a hx-boost="true" href="{% url 'my_page' %}">Mi Página</a>
```

---

## ⚠️ Importante

### NO modificar

- No hagas cambios en `config/views.py` (no necesitan cambios)
- No desactives HTMX sin razón (es crucial para las transiciones)

### Mantener en mente

- HTMX cachea páginas → A veces puedes ver contenido antiguo
- Para forzar reload: `htmx.ajax('GET', '/page/')`
- Los scripts en templates se ejecutan cada vez que cargas la página

---

## 📚 Documentación Completa

Para información más detallada, revisa:

- `HTMX_INTEGRATION.md` - Guía técnica completa
- `HTMX_IMPLEMENTATION_SUMMARY.md` - Resumen de cambios

---

## 🎓 Ejemplo: Agregar nueva página con HTMX

```python
# 1. En config/views.py
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

@method_decorator(login_required, name="dispatch")
class MyPageView(TemplateView):
    template_name = "pages/mypage.html"
```

```python
# 2. En config/urls.py
path("mypage/", MyPageView.as_view(), name="mypage"),
```

```django-html
# 3. En templates/pages/mypage.html
{% extends "base.html" %}

{% block content %}
  <h1>Mi Nueva Página</h1>
  <p>Este contenido se cargará con HTMX</p>
{% endblock content %}
```

```django-html
# 4. Agregar link con hx-boost
<a hx-boost="true" href="{% url 'mypage' %}">Mi Página</a>
```

¡Listo! La nueva página tendrá transiciones suaves automáticamente.

---

## ✅ Checklist de Verificación

- [ ] HTMX está cargando (DevTools Network)
- [ ] Los links tienen fade-out/fade-in
- [ ] Mobile navbar funciona
- [ ] Back/Forward del navegador funciona
- [ ] Los menus no se rompen tras navegar
- [ ] Los iconos se ven correctamente tras navegar
- [ ] El scroll va al top automáticamente
- [ ] Las animaciones son suaves (no lentas)

---

**Preguntas? Revisa los archivos de documentación o examina el código en base.html** 🚀
