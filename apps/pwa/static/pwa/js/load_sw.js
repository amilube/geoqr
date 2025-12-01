/**
 * Registrar y configurar Service Worker
 * Permite funcionamiento offline y caché de recursos
 */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✓ Service Worker registrado:', registration.scope);

        // Escuchar mensajes del Service Worker
        setupServiceWorkerMessageListener(registration);
      })
      .catch((error) => {
        console.error('✗ Error al registrar Service Worker:', error);
      });
  });
}

/**
 * Configura la escucha de mensajes provenientes del Service Worker
 * @param {ServiceWorkerRegistration} registration - Registro del SW
 */
function setupServiceWorkerMessageListener(registration) {
  // Escuchar mensajes del SW actual
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'PING',
      message: 'Cliente conectado'
    });
  }

  // Escuchar mensajes de cualquier SW
  navigator.serviceWorker.addEventListener('message', (event) => {
    const { from, type, message, status } = event.data;

    // Verificar que el mensaje viene del Service Worker
    if (from !== 'ServiceWorker') return;

    console.log('[SW Message]', type, message);

    // Manejar diferentes tipos de eventos
    switch (type) {
      case 'OFFLINE':
        handleOfflineEvent(message);
        break;

      case 'SERVER_ERROR':
        handleServerErrorEvent(message, status);
        break;

      case 'PONG':
        console.log('✓ Service Worker respondió al PING');
        break;

      default:
        console.log('Mensaje desconocido del SW:', type);
    }
  });
}

/**
 * Maneja eventos cuando el usuario está offline
 * @param {string} message - Mensaje descriptivo
 */
function handleOfflineEvent(message) {
  console.warn('📡 Usuario offline:', message);

  // Mostrar banner de desconexión en el DOM si existe
  showBanner({
    type: 'offline',
    title: 'Sin conexión',
    message: message || 'No hay conexión a internet',
    icon: '📡'
  });

  // Disparar evento personalizado para que otras partes de la app lo escuchen
  window.dispatchEvent(
    new CustomEvent('sw:offline', {
      detail: { message }
    })
  );
}

/**
 * Maneja eventos cuando el servidor no está disponible
 * @param {string} message - Mensaje descriptivo
 * @param {number} status - Código HTTP del error
 */
function handleServerErrorEvent(message, status) {
  console.error('⚠️ Error del servidor:', status, message);

  // Mostrar banner de error del servidor
  showBanner({
    type: 'server-error',
    title: 'Error del servidor',
    message: message || 'El servidor no está disponible',
    status: status,
    icon: '⚠️'
  });

  // Disparar evento personalizado
  window.dispatchEvent(
    new CustomEvent('sw:server-error', {
      detail: { message, status }
    })
  );
}

/**
 * Muestra un banner de notificación en la página
 * @param {Object} config - Configuración del banner
 * @param {string} config.type - Tipo de banner (offline, server-error, etc.)
 * @param {string} config.title - Título del banner
 * @param {string} config.message - Mensaje descriptivo
 * @param {string} config.icon - Emoji o icono
 * @param {number} config.status - (Opcional) Código HTTP
 */
function showBanner(config) {
  // Evitar crear múltiples banners del mismo tipo
  const existingBanner = document.querySelector(`[data-banner-type="${config.type}"]`);
  if (existingBanner) {
    return; // Banner ya existe
  }

  const banner = document.createElement('div');
  banner.setAttribute('data-banner-type', config.type);
  banner.className = `fixed top-0 left-0 right-0 z-50 p-4 ${config.type === 'offline'
      ? 'bg-red-600 border-b-2 border-red-700'
      : 'bg-yellow-600 border-b-2 border-yellow-700'
    } text-white shadow-lg animate-slideDown`;

  const statusText = config.status ? ` (${config.status})` : '';

  banner.innerHTML = `
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-3 flex-1">
        <span class="text-2xl">${config.icon}</span>
        <div>
          <p class="font-semibold">${config.title}</p>
          <p class="text-sm opacity-90">${config.message}${statusText}</p>
        </div>
      </div>
      <button 
        class="text-white hover:text-gray-200 transition p-2"
        onclick="this.parentElement.parentElement.remove()"
        aria-label="Cerrar"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `;

  document.body.insertBefore(banner, document.body.firstChild);

  // Agregar estilos de animación si no existen
  if (!document.querySelector('style[data-banner-styles]')) {
    const style = document.createElement('style');
    style.setAttribute('data-banner-styles', '');
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      .animate-slideDown {
        animation: slideDown 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
  }

  // Auto-ocultar después de 10 segundos (opcional)
  if (config.type === 'server-error') {
    setTimeout(() => {
      const btn = banner.querySelector('button');
      if (btn) btn.click();
    }, 10000);
  }
}

console.log('✓ Service Worker loader inicializado');