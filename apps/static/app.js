// app.js - Lógica principal de la aplicación Dumanity
// Aplicación de escaneo de códigos QR con extracción y visualización de URLs

// Debug mode (establecer a true para ver logs detallados)
const DEBUG = true;

let html5QrCode = null;
let scanningActive = false;
let detectedURL = '';
let map = null;
let marker = null;
let userLocation = null;

// Variables para el manejo de notificaciones
let notificationPermissionGranted = false;
let pageVisited = false;
let notificationTimer = null;
let notificationsInitialized = false;
let accessibilityInitialized = false;
let mapsScriptInjected = false;
let mapsLibraryPromise = null;
let notificationPromptRegistered = false;
let pendingPermissionResolver = null;
function isPushPage() {
    return window.location.pathname.startsWith('/push');
}

function isGeoPage() {
    return window.location.pathname.startsWith('/geo');
}

/**
 * Agregar log visible en la UI
 * @param {string} message - Mensaje del log
 * @param {string} type - Tipo: 'info', 'success', 'warning', 'error'
 */
function addNotificationLog(message, type = 'info') {
    const logContainer = document.getElementById('notification-logs');
    if (!logContainer) return;

    const timestamp = new Date().toLocaleTimeString('es-AR');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry border-l-4 p-2 mb-2 text-sm';

    // Colores según el tipo
    const colors = {
        info: 'border-blue-500 bg-blue-50 text-blue-800',
        success: 'border-green-500 bg-green-50 text-green-800',
        warning: 'border-yellow-500 bg-yellow-50 text-yellow-800',
        error: 'border-red-500 bg-red-50 text-red-800'
    };

    logEntry.className += ' ' + (colors[type] || colors.info);
    logEntry.innerHTML = `<span class="font-mono text-xs text-gray-500">[${timestamp}]</span> ${message}`;

    logContainer.insertBefore(logEntry, logContainer.firstChild);

    // Limitar a 20 logs máximo
    while (logContainer.children.length > 20) {
        logContainer.removeChild(logContainer.lastChild);
    }

    // Auto-scroll al último log
    logContainer.scrollTop = 0;

    // También logear en consola
    console.log(`[Notifications ${type}]`, message);
}

/**
 * Iniciar el escaneo de códigos QR
 */
async function iniciarEscaneo() {
    try {
        // Verificar que la librería esté disponible
        if (typeof Html5Qrcode === 'undefined') {
            throw new Error('html5-qrcode library no está disponible');
        }

        // Mostrar el contenedor del escáner y ocultar otros elementos
        const scannerContainer = document.getElementById('scanner-container');
        const scanButtonCard = document.getElementById('scan-button-card');
        const resultContainer = document.getElementById('result-container');

        if (!scannerContainer) {
            throw new Error('No se encontraron los elementos necesarios');
        }

        // Ocultar botón principal, mostrar escáner
        scannerContainer.classList.remove('hidden');
        resultContainer?.classList.add('hidden');
        scanButtonCard?.classList.add('hidden');

        scanningActive = true;

        // Inicializar el escáner html5-qrcode
        html5QrCode = new Html5Qrcode("qr-video");

        const config = {
            fps: 10,
            qrbox: { width: 420, height: 420 },
            aspectRatio: 1.0
        };

        // Iniciar el escaneo
        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanFailure
        );

        mostrarMensaje('📷 Escaneando... enfoca el código', 'info');
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        mostrarMensaje('❌ No se pudo abrir la cámara\nVerificá los permisos', 'error');

        // Revertir UI en caso de error
        const scannerContainer = document.getElementById('scanner-container');
        const scanButtonCard = document.getElementById('scan-button-card');
        if (scannerContainer) scannerContainer.classList.add('hidden');
        if (scanButtonCard) scanButtonCard.classList.remove('hidden');
        scanningActive = false;
    }
}

/**
 * Callback cuando se detecta un código QR exitosamente
 * @param {string} decodedText - El texto decodificado del QR
 */
function onScanSuccess(decodedText) {
    if (scanningActive) {
        detectedURL = decodedText;
        detenerEscaneo();
        mostrarResultado(detectedURL);
        // Vibrar el dispositivo si está soportado
        if (navigator.vibrate) {
            navigator.vibrate(200); // vibra 200ms
        }
    }
}

/**
 * Callback cuando falla el escaneo (se llama muchas veces, no es error crítico)
 */
function onScanFailure(error) {
    // No hacer nada, es normal que falle mientras no detecte un código
}

/**
 * Detener el escaneo de códigos QR
 */
async function detenerEscaneo() {
    scanningActive = false;

    if (html5QrCode) {
        try {
            await html5QrCode.stop();
            html5QrCode.clear();
        } catch (error) {
            console.error('Error al detener escáner:', error);
        }
        html5QrCode = null;
    }

    // Mostrar botón principal, ocultar escáner
    const scannerContainer = document.getElementById('scanner-container');
    const scanButtonCard = document.getElementById('scan-button-card');
    if (scannerContainer) scannerContainer.classList.add('hidden');
    if (scanButtonCard) scanButtonCard.classList.remove('hidden');

    ocultarMensaje();
}

/**
 * Mostrar el resultado del escaneo
 * @param {string} content - El contenido detectado del código QR
 */
function mostrarResultado(content) {
    const resultContainer = document.getElementById('result-container');
    const scanButtonCard = document.getElementById('scan-button-card');
    const scannerContainer = document.getElementById('scanner-container');

    // Mostrar contenido en el resultado
    const resultElement = document.getElementById('qr-result');
    if (resultElement) {
        resultElement.textContent = content;
    }

    // Cambiar visibilidad
    if (resultContainer) resultContainer.classList.remove('hidden');
    if (scanButtonCard) scanButtonCard.classList.add('hidden');
    if (scannerContainer) scannerContainer.classList.add('hidden');

    // Mostrar/ocultar botón de abrir enlace
    const openBtn = document.getElementById('open-btn');
    if (openBtn) {
        try {
            new URL(content);
            openBtn.classList.remove('hidden');
        } catch (error) {
            openBtn.classList.add('hidden');
        }
    }

    // Scroll al resultado para que se vea bien
    if (resultContainer) {
        setTimeout(() => {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }

    mostrarMensaje('✅ ¡Código detectado!', 'success');
}

/**
 * Copiar el contenido al portapapeles
 */
async function copiarContenido() {
    try {
        await navigator.clipboard.writeText(detectedURL);
        mostrarMensaje('📋 Copiado', 'success');

        // Vibración de confirmación
        if (navigator.vibrate) {
            navigator.vibrate([50, 100, 50]);
        }
    } catch (error) {
        console.error('Error al copiar contenido:', error);
        mostrarMensaje('❌ No se pudo copiar', 'error');
    }
}

/**
 * Abrir la URL en una nueva pestaña
 */
function abrirURL() {
    if (detectedURL) {
        try {
            new URL(detectedURL);
            window.open(detectedURL, '_blank');
            mostrarMensaje('🔗 Abriendo...', 'info');
        } catch (error) {
            mostrarMensaje('❌ URL no válida', 'error');
        }
    }
}

/**
 * Resetear el escáner para escanear otro código
 */
function resetearEscaner() {
    detectedURL = '';
    const resultContainer = document.getElementById('result-container');
    const scanButtonCard = document.getElementById('scan-button-card');

    if (resultContainer) resultContainer.classList.add('hidden');
    if (scanButtonCard) scanButtonCard.classList.remove('hidden');

    ocultarMensaje();

    // Scroll al botón principal
    if (scanButtonCard) {
        setTimeout(() => {
            scanButtonCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
}

/**
 * Inicializar controles de accesibilidad (ARIA, focus, etc.)
 */
function initializeAccessibilityControls() {
    if (accessibilityInitialized) return;
    accessibilityInitialized = true;

    // Manejar el botón de tips para actualizar aria-expanded
    const tipsButton = document.querySelector('[aria-controls="tips-content"]');
    if (tipsButton) {
        const tipsContent = document.getElementById('tips-content');
        const originalOnclick = tipsButton.onclick;

        tipsButton.addEventListener('click', () => {
            // Hacer toggle del contenido
            tipsContent?.classList.toggle('hidden');

            // Actualizar aria-expanded basado en visibilidad
            const isHidden = tipsContent?.classList.contains('hidden');
            tipsButton.setAttribute('aria-expanded', !isHidden);
        });
    }
}

function mostrarMensaje(mensaje, tipo) {
    const messageContainer = document.getElementById('status-message');
    if (!messageContainer) {
        console.debug('Contenedor de mensajes no disponible; mensaje:', mensaje);
        return;
    }
    messageContainer.textContent = mensaje;
    messageContainer.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'bg-blue-100',
        'text-green-800', 'text-red-800', 'text-blue-800');

    if (tipo === 'success') {
        messageContainer.classList.add('bg-green-100', 'text-green-800');
    } else if (tipo === 'error') {
        messageContainer.classList.add('bg-red-100', 'text-red-800');
    } else {
        messageContainer.classList.add('bg-blue-100', 'text-blue-800');
    }

    messageContainer.classList.add('fade-in');

    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
        ocultarMensaje();
    }, 3000);
}

/**
 * Ocultar mensaje de estado
 */
function ocultarMensaje() {
    const messageContainer = document.getElementById('status-message');
    if (!messageContainer) {
        return;
    }
    messageContainer.classList.add('hidden');
}

/**
 * Inicializar Google Maps (callback para la API de Google Maps)
 */
function initMap() {
    console.log('Google Maps API cargada correctamente');
}

/**
 * Cargar la API de Google Maps dinámicamente
 */
function cargarGoogleMapsAPI() {
    // Solo cargar en la página de geolocalización
    const mapContainer = document.querySelector('[data-google-maps-key]');
    if (!mapContainer) return;

    if (mapsLibraryPromise) {
        return mapsLibraryPromise;
    }

    // Si la API ya está presente (por otro script), usar el nuevo loader directamente
    if (typeof google !== 'undefined' && google.maps?.importLibrary) {
        mapsLibraryPromise = Promise.all([
            google.maps.importLibrary('maps'),
            google.maps.importLibrary('marker')
        ]).then(() => {
            console.log('Google Maps API cargada correctamente (loader nativo presente)');
        }).catch((error) => {
            console.error('Error al importar librerías de Google Maps', error);
            throw error;
        });
        return mapsLibraryPromise;
    }

    const apiKey = mapContainer?.dataset.googleMapsKey || '';

    if (!apiKey) {
        mostrarMensaje('Falta configurar GOOGLE_MAPS_JS_API_KEY (restringida por dominio). Contactá al administrador.', 'error');
        return null;
    }

    mapsLibraryPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        // Cargar con libraries directamente (fallback seguro para Android)
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=maps,marker`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            try {
                if (typeof google !== 'undefined' && google.maps) {
                    console.log('✓ Google Maps API cargada correctamente');
                    resolve();
                } else {
                    throw new Error('Google Maps no se inicializó correctamente');
                }
            } catch (error) {
                console.error('Error al cargar Google Maps API', error);
                reject(error);
            }
        };
        script.onerror = () => {
            const err = new Error('Error al cargar Google Maps API');
            console.error(err);
            reject(err);
        };
        mapsScriptInjected = true;
        document.head.appendChild(script);
    });

    return mapsLibraryPromise;
}

/**
 * Solicitar ubicación del usuario
 */
function solicitarUbicacion() {
    if (!navigator.geolocation) {
        mostrarMensaje('Tu navegador no soporta geolocalización', 'error');
        return;
    }

    if (!window.isSecureContext) {
        mostrarMensaje('Activa HTTPS (o usa localhost) para permitir geolocalización', 'error');
        return;
    }

    mostrarMensaje('Solicitando tu ubicación...', 'info');

    navigator.geolocation.getCurrentPosition(
        ubicacionExitosa,
        ubicacionError,
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

/**
 * Callback cuando se obtiene la ubicación exitosamente
 * @param {GeolocationPosition} position - La posición del usuario
 */
function ubicacionExitosa(position) {
    userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    mostrarMensaje('✅ ¡Ubicación obtenida!', 'success');

    // Mostrar información de coordenadas
    const locationInfo = document.getElementById('location-info');
    if (locationInfo) {
        locationInfo.textContent = `Lat: ${userLocation.lat.toFixed(6)}, Lng: ${userLocation.lng.toFixed(6)}`;
    }

    // Ocultar el botón y mostrar el mapa
    const locationButtonContainer = document.getElementById('location-button-container');
    const mapContainer = document.getElementById('map-container');
    const mapPlaceholder = document.getElementById('map-placeholder');
    if (locationButtonContainer) locationButtonContainer.classList.add('hidden');
    if (mapContainer) mapContainer.classList.remove('hidden');
    if (mapPlaceholder) mapPlaceholder.classList.add('hidden');

    // Inicializar el mapa con la ubicación del usuario
    inicializarMapa(userLocation);
}

/**
 * Callback cuando falla la obtención de la ubicación
 * @param {GeolocationPositionError} error - El error de geolocalización
 */
function ubicacionError(error) {
    let mensaje = '';

    switch (error.code) {
        case error.PERMISSION_DENIED:
            mensaje = '❌ Permiso denegado\nHabilita el acceso en configuración';
            break;
        case error.POSITION_UNAVAILABLE:
            {
                const msg = (error.message || '').toLowerCase();
                const gpsOff = msg.includes('location') && msg.includes('disabled');
                const suggestion = gpsOff
                    ? '\nActiva la ubicación/GPS en tu dispositivo y reintenta.'
                    : '\nVerifica que el GPS esté activado y tengas señal.';
                mensaje = `❌ Ubicación no disponible${suggestion}`;
            }
            break;
        case error.TIMEOUT:
            mensaje = '❌ Tiempo agotado';
            break;
        default:
            mensaje = '❌ Error desconocido';
    }

    mostrarMensaje(mensaje, 'error');
}

/**
 * Inicializar el mapa de Google Maps con la ubicación del usuario
 * @param {Object} location - Objeto con lat y lng
 */
async function inicializarMapa(location) {
    try {
        await cargarGoogleMapsAPI();
    } catch (error) {
        mostrarMensaje('🗺️ Google Maps no está disponible', 'error');
        return;
    }

    // Verificar que Google Maps esté disponible tras el loader
    if (typeof google === 'undefined' || !google.maps) {
        mostrarMensaje('🗺️ Google Maps no está disponible', 'error');
        return;
    }

    // Crear el mapa centrado en la ubicación del usuario
    map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true
    });

    // Crear un marcador en la ubicación del usuario
    marker = new google.maps.Marker({
        position: location,
        map: map,
        title: 'Tu ubicación',
        animation: google.maps.Animation.DROP,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#16a34a',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
        }
    });

    // Agregar un InfoWindow al marcador
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 8px;">
                <strong>Tu ubicación actual</strong><br>
                <small>Lat: ${location.lat.toFixed(6)}<br>
                Lng: ${location.lng.toFixed(6)}</small>
            </div>
        `
    });

    // Mostrar el InfoWindow al hacer clic en el marcador
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });

    // Mostrar el InfoWindow automáticamente al cargar
    infoWindow.open(map, marker);
}

async function runPageInitializers() {
    if (typeof Html5Qrcode === 'undefined') {
        console.error('La librería html5-qrcode no está disponible');
        mostrarMensaje('⚠️ Error al cargar el escáner\nRecargá la página', 'error');
    }

    initializeAccessibilityControls();

    if (isGeoPage()) {
        cargarGoogleMapsAPI();
    }

    if (isPushPage()) {
        maybeInitNotifications();
    }
}

// Verificar que html5-qrcode esté cargado y disparar inicializadores al cargar la página
window.addEventListener('DOMContentLoaded', async () => {
    await runPageInitializers();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registerPeriodicSync(registration);
            })
            .catch((error) => console.debug('Service worker registration failed:', error));
    }
});

/**
 * Registrar sincronización periódica en segundo plano
 * @param {ServiceWorkerRegistration} registration - Registro del service worker
 */
async function registerPeriodicSync(registration) {
    try {
        // Verificar si Periodic Sync está soportado
        if ('periodicSync' in registration) {
            // Solicitar permiso y registrar sincronización periódica
            const status = await navigator.permissions.query({
                name: 'periodic-background-sync',
            });

            if (status.state === 'granted') {
                // Registrar sincronización cada 24 horas (valor mínimo puede variar)
                await registration.periodicSync.register('content-sync', {
                    minInterval: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
                });
                console.log('Periodic Background Sync registrado exitosamente');
            } else {
                console.log('Periodic Background Sync: permiso no otorgado');
            }
        } else {
            console.log('Periodic Background Sync no está soportado en este navegador');
        }
    } catch (error) {
        console.debug('No se pudo registrar Periodic Sync:', error);
    }
}

/**
 * Escuchar mensajes del Service Worker
 */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.from === 'ServiceWorker') {
            const { type, message } = event.data;

            switch (type) {
                case 'OFFLINE':
                    console.log('App offline:', message);
                    break;
                case 'SERVER_ERROR':
                    console.log('Error del servidor:', message);
                    break;
                case 'SERVING_CACHED':
                    console.log('Sirviendo desde caché:', message);
                    break;
                case 'SYNC_COMPLETE':
                    console.log('Sincronización completa:', message);
                    break;
                case 'PERIODIC_SYNC_COMPLETE':
                    console.log('Sincronización periódica completa:', message);
                    break;
                default:
                    console.log('Mensaje del SW:', event.data);
            }
        }
    });
}

/**
 * Solicitar permisos de notificación al usuario
 * @returns {Promise<boolean>} - true si se otorgaron los permisos
 */
async function solicitarPermisoNotificaciones() {
    if (!('Notification' in window)) {
        addNotificationLog('❌ Este navegador no soporta notificaciones', 'error');
        return false;
    }

    // Las notificaciones solo se pueden pedir desde contextos seguros
    if (!window.isSecureContext) {
        addNotificationLog('❌ Necesitás HTTPS o localhost para solicitar permisos de notificaciones', 'error');
        return false;
    }

    addNotificationLog('🔍 Verificando permisos de notificaciones...', 'info');

    // Verificar estado actual
    const currentPermission = Notification.permission;

    if (currentPermission === 'granted') {
        notificationPermissionGranted = true;
        addNotificationLog('✅ Permisos ya concedidos', 'success');
        return true;
    }

    if (currentPermission === 'denied') {
        addNotificationLog('🚫 Permisos denegados previamente', 'error');
        return false;
    }

    // Si es 'default', solicitar permisos
    try {
        addNotificationLog('⏳ Solicitando permisos al usuario...', 'warning');
        // Chrome en Android puede requerir gesto; permitir un único pending resolver para
        // que listeners de interacción puedan resolver la misma promesa.
        const existingPending = pendingPermissionResolver;

        const permission = await new Promise((resolve) => {
            // Si ya hay un pendiente, reutilizar
            if (existingPending) {
                pendingPermissionResolver = existingPending;
                pendingPermissionResolver(resolve);
                return;
            }

            pendingPermissionResolver = (r) => r;
            Notification.requestPermission().then((p) => {
                pendingPermissionResolver = null;
                resolve(p);
            }).catch(() => {
                pendingPermissionResolver = null;
                resolve('denied');
            });
        });

        if (permission === 'granted') {
            notificationPermissionGranted = true;
            addNotificationLog('✅ Permisos concedidos por el usuario', 'success');

            // Esperar para que el Service Worker se sincronice con el nuevo estado de permisos
            // El SW necesita tiempo para detectar el cambio de permisos
            await new Promise(resolve => setTimeout(resolve, 200));

            // Re-verificar estado
            const recheck = Notification.permission;
            notificationPermissionGranted = (recheck === 'granted');
            if (DEBUG) console.log('🔄 Re-verificación de permisos tras delay:', recheck);

            return true;
        } else {
            notificationPermissionGranted = false;
            addNotificationLog('❌ Usuario denegó los permisos', 'error');
            return false;
        }
    } catch (error) {
        addNotificationLog('❌ Error al solicitar permisos: ' + error.message, 'error');
        return false;
    }
}

/**
 * Enviar una notificación (compatible con Service Worker)
 * @param {string} title - Título de la notificación
 * @param {Object} options - Opciones de la notificación
 * @param {Object} options.data - Datos adicionales
 * @param {string} options.data.path - Ruta para deep linking (ej: 'scan', 'settings')
 * 
 * @example
 * // Notificación que abre la home
 * enviarNotificacion('Bienvenido', { body: 'Hola' });
 * 
 * @example
 * // Notificación que abre el scanner (deep link)
 * enviarNotificacion('Nuevo QR', { 
 *   body: 'Hay un código QR esperando',
 *   data: { path: 'scan' }
 * });
 */
async function enviarNotificacion(title, options) {
    // Forzar assets de marca si no vienen en options
    const icon = options.icon || '/static/icons/android/android-launchericon-192-192.png';
    const badge = options.badge || '/static/icons/qeoqr_icon_monochrome.svg';
    const body = options.body || '';
    // Verificar permisos antes de intentar enviar
    const currentPermission = Notification.permission;

    if (DEBUG) {
        console.log('=== VERIFICACIÓN DE PERMISOS ===');
        console.log('Notification.permission:', currentPermission);
        console.log('notificationPermissionGranted:', notificationPermissionGranted);
    }

    if (currentPermission !== 'granted') {
        // Intentar solicitar permisos si aún no se han solicitado
        if (currentPermission === 'default') {
            addNotificationLog('🔄 Solicitando permisos para enviar notificación...', 'info');
            const granted = await solicitarPermisoNotificaciones();
            if (!granted) {
                addNotificationLog('❌ No se pudo enviar: permisos rechazados', 'error');
                throw new Error('No notification permission has been granted');
            }

            // CRÍTICO: Espera adicional para que el Service Worker detecte el cambio
            // La espera en solicitarPermisoNotificaciones() no es suficiente
            addNotificationLog('⏳ Esperando sincronización con Service Worker...', 'info');
            await new Promise(resolve => setTimeout(resolve, 300));

            // Permisos concedidos exitosamente
            addNotificationLog('✅ Permisos verificados - continuando con envío...', 'success');
        } else if (currentPermission === 'denied') {
            addNotificationLog('❌ No se pudo enviar: permisos previamente denegados', 'error');
            throw new Error('Notification permission was denied');
        }
    } else {
        // Permisos ya concedidos
        if (DEBUG) console.log('✅ Permisos ya concedidos, procediendo a enviar notificación');
    }

    try {
        // Usar siempre la API del Service Worker (aunque todavía no controle la página)
        // Esto permite que navegadores como iOS Safari muestren la notificación nativa
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;

            if (!registration.showNotification) {
                // Fallback a la API clásica si el SW no soporta showNotification
                const notification = new Notification(title, { ...options, body, icon, badge });
                addNotificationLog(`✅ Notificación enviada directamente`, 'success');
                addNotificationLog(`   📋 Título: "${title}"`, 'info');

                notification.onclick = function () {
                    addNotificationLog('👆 Usuario hizo clic en la notificación', 'info');
                    window.focus();
                    notification.close();
                };
                return;
            }

            // Usar protocol handler para mejor integración nativa
            const targetPath = options.data?.path || '';
            const protocolUrl = targetPath ? `web+geoqr://${targetPath}` : 'web+geoqr://home';

            // Agregar data.url para que el Service Worker maneje el click correctamente
            const swOptions = {
                ...options,
                // Asegurar que body/icon/badge están presentes
                body,
                badge,
                icon,
                data: {
                    url: '/',
                    protocolUrl: protocolUrl,
                    origin: window.location.origin,
                    timestamp: Date.now(),
                    ...options.data
                }
            };

            if (DEBUG) {
                console.log('=== DEBUG NOTIFICACIÓN ===');
                console.log('Título:', title);
                console.log('Opciones completas:', swOptions);
                console.log('Body:', swOptions.body);
                console.log('Icon:', swOptions.icon);
                console.log('Badge:', swOptions.badge);
                console.log('Notification.permission justo antes de showNotification:', Notification.permission);
            }

            await registration.showNotification(title, swOptions);
            addNotificationLog(`✅ Notificación enviada vía Service Worker`, 'success');
            addNotificationLog(`   📋 Título: "${title}"`, 'info');
            addNotificationLog(`   📋 Body: "${swOptions.body}"`, 'info');
            addNotificationLog(`   🔗 Protocol: ${protocolUrl}`, 'info');
        } else {
            // Si no hay Service Worker, usar el constructor tradicional
            const notification = new Notification(title, { ...options, body, icon, badge });
            addNotificationLog(`✅ Notificación enviada directamente`, 'success');
            addNotificationLog(`   📋 Título: "${title}"`, 'info');

            notification.onclick = function () {
                addNotificationLog('👆 Usuario hizo clic en la notificación', 'info');
                window.focus();
                notification.close();
            };
        }
    } catch (error) {
        addNotificationLog('❌ Error al enviar notificación: ' + error.message, 'error');
        throw error;
    }
}

/**
 * Enviar una notificación de bienvenida
 */
async function enviarNotificacionBienvenida() {
    // Verificar permisos en tiempo real (no confiar solo en la variable)
    const currentPermission = Notification.permission;

    if (currentPermission !== 'granted') {
        addNotificationLog(`⚠️ No se puede enviar notificación: permisos ${currentPermission}`, 'warning');
        return;
    }

    // Solo enviar si el documento no tiene el foco
    if (document.hidden) {
        addNotificationLog('📤 Enviando notificación de bienvenida...', 'info');

        try {
            await enviarNotificacion('¡Bienvenido a GeoQR!', {
                body: 'La aplicación está lista para escanear códigos QR y obtener tu ubicación.',
                icon: '/static/icons/android/android-launchericon-192-192.png',
                tag: 'bienvenida',
                requireInteraction: false,
                silent: false
            });
        } catch (error) {
            // Error ya loggeado en enviarNotificacion
        }
    } else {
        addNotificationLog('⚠️ No se envió notificación: la app tiene el foco', 'warning');
    }
}

/**
 * Inicializar el sistema de notificaciones locales
 */
async function inicializarNotificaciones() {
    if (notificationsInitialized) {
        return;
    }
    notificationsInitialized = true;

    addNotificationLog('🚀 Iniciando sistema de notificaciones locales...', 'info');

    // Solicitar permisos de notificación con reintento en interacción del usuario (algunas
    // plataformas móviles requieren gesto explícito, ej. TWA instalada desde Play Store).
    const granted = await solicitarPermisoNotificaciones();

    if (!granted && !notificationPromptRegistered && Notification.permission === 'default') {
        notificationPromptRegistered = true;

        const promptOnceOnInteraction = async () => {
            document.removeEventListener('click', promptOnceOnInteraction, true);
            document.removeEventListener('touchend', promptOnceOnInteraction, true);
            document.removeEventListener('touchstart', promptOnceOnInteraction, true);
            document.removeEventListener('pointerdown', promptOnceOnInteraction, true);
            document.removeEventListener('pointerup', promptOnceOnInteraction, true);
            document.removeEventListener('wheel', promptOnceOnInteraction, true);
            document.removeEventListener('scroll', promptOnceOnInteraction, true);
            document.removeEventListener('keydown', promptOnceOnInteraction, true);
            try {
                await solicitarPermisoNotificaciones();
            } catch (error) {
                console.debug('Permiso de notificaciones no concedido tras interacción:', error);
            }
        };

        // Registrar listeners en fase de captura para asegurar que se dispare con el primer gesto.
        document.addEventListener('click', promptOnceOnInteraction, true);
        document.addEventListener('touchend', promptOnceOnInteraction, true);
        document.addEventListener('touchstart', promptOnceOnInteraction, true);
        document.addEventListener('pointerdown', promptOnceOnInteraction, true);
        document.addEventListener('pointerup', promptOnceOnInteraction, true);
        document.addEventListener('wheel', promptOnceOnInteraction, true);
        document.addEventListener('scroll', promptOnceOnInteraction, true);
        document.addEventListener('keydown', promptOnceOnInteraction, true);
    }

    if (granted) {
        addNotificationLog('✅ Notificaciones locales habilitadas', 'success');
    } else {
        addNotificationLog('⚠️ Notificaciones locales no disponibles', 'warning');
    }

    // Marcar que la página ha sido visitada
    pageVisited = true;
    addNotificationLog('✓ Sistema de notificaciones listo', 'success');

    // Escuchar cambios de visibilidad para enviar notificación cuando la página pierda el foco
    document.addEventListener('visibilitychange', () => {
        // Verificar permisos en tiempo real
        const currentPermission = Notification.permission;
        const hasPermission = (currentPermission === 'granted');

        if (document.hidden && pageVisited && hasPermission) {
            addNotificationLog('👁️ App perdió el foco - programando notificación en 10 segundos...', 'info');

            // Cancelar cualquier timer previo
            if (notificationTimer) {
                clearTimeout(notificationTimer);
                addNotificationLog('🔄 Timer previo cancelado', 'info');
            }

            // Programar notificación para 10 segundos después de perder el foco
            notificationTimer = setTimeout(() => {
                // Verificar nuevamente que la página siga sin foco
                if (document.hidden) {
                    addNotificationLog('⏰ 10 segundos transcurridos - enviando notificación', 'info');
                    enviarNotificacionBienvenida();
                } else {
                    addNotificationLog('⚠️ App recuperó el foco antes de enviar notificación', 'warning');
                }
            }, 10000); // 10 segundos
        } else if (document.hidden && !hasPermission) {
            addNotificationLog(`⚠️ App perdió el foco pero permisos no concedidos (${currentPermission})`, 'warning');
        } else if (!document.hidden) {
            // Si la página recupera el foco, cancelar la notificación pendiente
            if (notificationTimer) {
                clearTimeout(notificationTimer);
                notificationTimer = null;
                addNotificationLog('✋ App recuperó el foco - notificación cancelada', 'warning');
            }
        }
    });
}

// Inicializar notificaciones cuando la página relevante cargue
function maybeInitNotifications() {
    if (isPushPage()) {
        inicializarNotificaciones();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybeInitNotifications);
} else {
    maybeInitNotifications();
}

// Escuchar mensajes del Service Worker para navegación
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NAVIGATE') {
            const targetUrl = event.data.url;
            if (targetUrl && targetUrl !== window.location.pathname) {
                addNotificationLog('📍 Navegando a: ' + targetUrl, 'info');
                window.location.href = targetUrl;
            }
        }
    });
}
