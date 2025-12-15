# HTMX Integration Guide

## Overview

HTMX has been integrated into the GeoQR application to provide smooth page transitions and boost mode functionality. This allows seamless navigation between pages without full page reloads.

## How It Works

### 1. **HTMX Boost Mode**

- All navigation links have `hx-boost="true"` attribute
- This intercepts link clicks and converts them to AJAX requests
- The response replaces the `#main-content` div smoothly

### 2. **Page Transitions**

- CSS animations provide fade in/out effects during page transitions
- Animations are defined in `/app/apps/static/css/project.css`
- Smooth scroll to top on each page transition

### 3. **Configuration**

#### In `base.html`

```django-html
<!-- HTMX CDN -->
<script src="https://unpkg.com/htmx.org@2.0.0"></script>

<!-- Navigation Links with hx-boost -->
<a hx-boost="true" href="{% url 'push' %}">Notificaciones</a>
```

#### HTMX Settings (in inline JavaScript)

```javascript
htmx.config.refreshOnHistoryMiss = true;     // Refresh on browser history
htmx.config.historyCacheSize = 10;            // Cache last 10 requests
```

### 4. **Main Content Container**

- All page content is wrapped in `<div id="main-content">` in base.html
- HTMX replaces only this div, keeping navigation intact
- CSS transitions apply to this div for smooth animations

### 5. **Event Re-initialization**

After each page transition, event listeners are re-attached:

- Mobile menu functionality
- Profile menu functionality
- Dynamic alert close buttons
- Iconify icon scanning

## CSS Animations

### Fade In/Out Transitions

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.htmx-settling #main-content {
  animation: fadeIn 300ms ease-in forwards;
}
```

### Smooth Scroll Behavior

- `scroll-behavior: smooth` applied globally
- Auto-scroll to top on page load

## Event Listeners

### HTMX Events Handled

- `htmx:beforeSwap` - Prepare for animation (fade out)
- `htmx:afterSwap` - Post-swap logic, re-initialize components
- `htmx:load` - Handle newly loaded content

### Components Re-initialized

1. Mobile menu toggle
2. Profile menu dropdown
3. Alert close buttons
4. Iconify icon rendering

## Navigation Structure

### Desktop Navigation

- Top bar with navigation links
- "Inicio" link with `hx-boost="true"`
- Sign out link (no boost needed)

### Mobile Navigation

- Bottom navbar with 5 items:
  1. Home (Inicio) - `hx-boost="true"`
  2. Notifications (Notifs) - `hx-boost="true"`
  3. QR Scanner (Scan) - `hx-boost="true"`
  4. Geolocation (Geo) - `hx-boost="true"`
  5. Profile Menu (Menu) - Regular button

### Feature Pages

- Home page cards link to features with `hx-boost="true"`
- Each feature page can navigate back to home

## URL Routing

All routes use standard Django URL patterns:

- `/home/` - Protected home page
- `/push/` - Push notifications page
- `/geo/` - Geolocation page
- `/qr/` - QR scanner page

## Browser Compatibility

HTMX v2.0.0 is compatible with:

- Modern Chrome/Firefox/Safari
- Edge browsers
- Works with PWA mode

## Performance Benefits

1. **Reduced Data Transfer** - Only content div is fetched
2. **Smooth Transitions** - CSS animations instead of page flicker
3. **Preserved State** - Navigation bars remain unchanged
4. **Faster Perceived Speed** - Smooth transitions feel faster
5. **History Support** - Browser back/forward work seamlessly

## Troubleshooting

### Issue: Events not working after navigation

**Solution:** Ensure `reinitializeComponents()` is called in HTMX event listeners

### Issue: Icons not showing after transition

**Solution:** Call `iconify.scan()` in post-swap event handlers

### Issue: Navigation not triggering

**Solution:** Verify links have `hx-boost="true"` attribute

## Future Enhancements

1. Add loading indicator during transitions
2. Implement page caching strategy
3. Add prefetch on hover
4. Create HTMX target fragments for partial updates
5. Add form submission handling

## Related Files

- `/app/apps/templates/base.html` - Main layout with HTMX config
- `/app/apps/static/css/project.css` - Page transition animations
- `/app/apps/static/js/project.js` - HTMX event handlers
- `/app/config/views.py` - Django views (no changes needed)
- `/app/config/urls.py` - URL routing configuration
