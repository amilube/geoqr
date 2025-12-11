// app.js - Lógica principal de la aplicación Dumanity
// Aplicación de escaneo de códigos QR con extracción y visualización de URLs

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

/**
 * Iniciar el escaneo de códigos QR
 */
async function iniciarEscaneo() {
    try {
        // Verificar que la librería esté disponible
        if (typeof Html5Qrcode === 'undefined') {
            throw new Error('html5-qrcode library no está disponible');
        }

        // Mostrar el contenedor del escáner y ocultar el botón de inicio
        document.getElementById('scanner-container').classList.remove('hidden');
        document.getElementById('scan-button-container').classList.add('hidden');
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('result-container').classList.add('hidden');

        scanningActive = true;

        // Inicializar el escáner html5-qrcode
        html5QrCode = new Html5Qrcode("qr-video");

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        // Iniciar el escaneo
        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanFailure
        );

        mostrarMensaje('Escaneando... Enfocá el código QR', 'info');
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        mostrarMensaje('No se pudo acceder a la cámara. Verificá los permisos.', 'error');

        // Revertir UI en caso de error
        document.getElementById('scanner-container').classList.add('hidden');
        document.getElementById('scan-button-container').classList.remove('hidden');
        document.getElementById('instructions').classList.remove('hidden');
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

    // Ocultar el contenedor del escáner y mostrar el botón de inicio
    document.getElementById('scanner-container').classList.add('hidden');
    document.getElementById('scan-button-container').classList.remove('hidden');
    document.getElementById('instructions').classList.remove('hidden');

    ocultarMensaje();
}

/**
 * Mostrar el resultado del escaneo
 * @param {string} content - El contenido detectado del código QR
 */
function mostrarResultado(content) {
    document.getElementById('qr-result').textContent = content;
    document.getElementById('result-container').classList.remove('hidden');

    // Check if content is a valid URL to show "Open Link" button
    const openBtn = document.getElementById('open-btn');
    try {
        new URL(content);
        openBtn.classList.remove('hidden');
        openBtn.classList.add('flex');
    } catch (error) {
        openBtn.classList.add('hidden');
        openBtn.classList.remove('flex');
    }

    // Agregar animación de carga sutil
    const resultElement = document.getElementById('qr-result');
    resultElement.classList.add('loading');
    setTimeout(() => {
        resultElement.classList.remove('loading');
    }, 800);

    mostrarMensaje('¡Código QR detectado exitosamente!', 'success');
}

/**
 * Copiar el contenido al portapapeles
 */
async function copiarContenido() {
    try {
        await navigator.clipboard.writeText(detectedURL);
        mostrarMensaje('Contenido copiado al portapapeles', 'success');
    } catch (error) {
        console.error('Error al copiar contenido:', error);
        mostrarMensaje('No se pudo copiar el contenido', 'error');
    }
}

/**
 * Abrir la URL en una nueva pestaña
 */
function abrirURL() {
    if (detectedURL) {
        // Validar que sea una URL válida antes de abrir
        try {
            new URL(detectedURL);
            window.open(detectedURL, '_blank');
            mostrarMensaje('Abriendo enlace...', 'info');
        } catch (error) {
            mostrarMensaje('La URL no es válida', 'error');
        }
    }
}

/**
 * Resetear el escáner para escanear otro código
 */
function resetearEscaner() {
    detectedURL = '';
    document.getElementById('result-container').classList.add('hidden');
    document.getElementById('scan-button-container').classList.remove('hidden');
    document.getElementById('instructions').classList.remove('hidden');
    ocultarMensaje();
}

/**
 * Mostrar mensaje de estado
 * @param {string} mensaje - El mensaje a mostrar
 * @param {string} tipo - El tipo de mensaje: 'success', 'error', 'info'
 */
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

// Verificar que html5-qrcode esté cargado
window.addEventListener('DOMContentLoaded', async () => {
    if (typeof Html5Qrcode === 'undefined') {
        console.error('La librería html5-qrcode no está disponible');
        mostrarMensaje('Error al cargar el escáner de QR. Recargá la página.', 'error');
    } else {
        console.log('html5-qrcode library cargada correctamente');
    }

    bindPushControls();

    try {
        await ensureVapidKey();
    } catch (error) {
        console.debug('No se pudo inicializar la clave VAPID:', error);
    }

    // Cargar Google Maps API
    cargarGoogleMapsAPI();
    // Update the push subscription button state if applicable
    try {
        await updatePushButtonState();
    } catch (error) {
        console.debug('No se pudo actualizar estado del botón push:', error);
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                updatePushButtonState();

                // Registrar Periodic Background Sync si está soportado
                registerPeriodicSync(registration);
            })
            .catch((error) => console.debug('Service worker no listo para push:', error));
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
 * Inicializar Google Maps (callback para la API de Google Maps)
 */
function initMap() {
    console.log('Google Maps API cargada correctamente');
}

/* ----------------- Web Push helper funcs ----------------- */
function getNotificationPermission() {
    if (typeof Notification === 'undefined') {
        return 'default';
    }
    try {
        return Notification.permission;
    } catch (error) {
        console.debug('No se pudo leer el permiso de notificaciones:', error);
        return 'default';
    }
}

const pushState = {
    supported: isPushSupported(),
    permission: getNotificationPermission(),
    subscribed: false,
    backendRegistered: false,
    backendDevices: 0,
    registrationId: '',
};

function bindPushControls() {
    const enableButtons = document.querySelectorAll('[data-action="push-enable"]');
    enableButtons.forEach((button) => {
        if (!button.dataset.pushBound) {
            button.addEventListener('click', async (event) => {
                await subscribeToPush(event);
            });
            button.dataset.pushBound = 'true';
        }
    });

    const disableButtons = document.querySelectorAll('[data-action="push-disable"]');
    disableButtons.forEach((button) => {
        if (!button.dataset.pushBound) {
            button.addEventListener('click', async (event) => {
                await unsubscribeFromPush(event);
            });
            button.dataset.pushBound = 'true';
        }
    });

    const testButtons = document.querySelectorAll('[data-action="push-test"]');
    testButtons.forEach((button) => {
        if (!button.dataset.pushBound) {
            button.addEventListener('click', async (event) => {
                await sendTestPushMessage(event);
            });
            button.dataset.pushBound = 'true';
        }
    });

    updatePushControlsUI(pushState);
}

function setButtonBusy(button, busy) {
    if (!button) {
        return;
    }
    if (busy) {
        button.dataset.pushBusy = 'true';
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        button.classList.add('opacity-70', 'cursor-not-allowed');
    } else {
        delete button.dataset.pushBusy;
        button.disabled = false;
        button.removeAttribute('aria-busy');
        button.classList.remove('opacity-70', 'cursor-not-allowed');
    }
}

function toggleElementsHidden(elements, hidden) {
    elements.forEach((element) => {
        if (!element) {
            return;
        }
        if (hidden) {
            element.classList.add('hidden');
            element.setAttribute('aria-hidden', 'true');
        } else {
            element.classList.remove('hidden');
            element.removeAttribute('aria-hidden');
        }
    });
}

function toggleElementsDisabled(elements, disabled) {
    elements.forEach((element) => {
        if (!element || element.dataset.pushBusy === 'true') {
            return;
        }
        element.disabled = disabled;
        if (disabled) {
            element.setAttribute('aria-disabled', 'true');
        } else {
            element.removeAttribute('aria-disabled');
        }
    });
}

function updatePushControlsUI(state) {
    const enableButtons = document.querySelectorAll('[data-action="push-enable"]');
    const disableButtons = document.querySelectorAll('[data-action="push-disable"]');
    const testButtons = document.querySelectorAll('[data-action="push-test"]');
    const statusLabel = document.getElementById('push-status-label');

    let statusText = 'Verificando compatibilidad…';
    let statusClass = 'text-gray-800';

    if (!state.supported) {
        statusText = 'Notificaciones push no disponibles en este dispositivo';
        statusClass = 'text-gray-500';
        toggleElementsHidden(enableButtons, true);
        toggleElementsHidden(disableButtons, true);
        toggleElementsHidden(testButtons, true);
        toggleElementsDisabled(enableButtons, true);
        toggleElementsDisabled(disableButtons, true);
        toggleElementsDisabled(testButtons, true);
    } else {
        const permission = state.permission || getNotificationPermission();
        if (permission === 'denied') {
            statusText = 'Permiso de notificaciones denegado. Habilitalo desde la configuración del navegador.';
            statusClass = 'text-red-700';
            toggleElementsHidden(enableButtons, false);
            toggleElementsHidden(disableButtons, true);
            toggleElementsHidden(testButtons, true);
            toggleElementsDisabled(enableButtons, true);
            toggleElementsDisabled(disableButtons, true);
            toggleElementsDisabled(testButtons, true);
        } else if (state.subscribed) {
            const backendReady = state.backendRegistered && state.backendDevices >= 1;
            statusText = backendReady
                ? `Notificaciones activas${state.backendDevices > 1 ? ` (${state.backendDevices} dispositivos)` : ''}`
                : 'Sincronizando la suscripción con el servidor…';
            statusClass = backendReady ? 'text-green-700' : 'text-gray-800';
            toggleElementsHidden(enableButtons, true);
            toggleElementsHidden(disableButtons, false);
            toggleElementsHidden(testButtons, !backendReady);
            toggleElementsDisabled(disableButtons, false);
            toggleElementsDisabled(testButtons, !backendReady);
        } else {
            statusText = permission === 'granted'
                ? 'Activá las notificaciones en este dispositivo'
                : 'Necesitamos tu permiso para enviarte notificaciones';
            statusClass = 'text-gray-800';
            toggleElementsHidden(enableButtons, false);
            toggleElementsHidden(disableButtons, true);
            toggleElementsHidden(testButtons, true);
            toggleElementsDisabled(enableButtons, false);
            toggleElementsDisabled(disableButtons, true);
            toggleElementsDisabled(testButtons, true);
        }
    }

    if (statusLabel) {
        statusLabel.textContent = statusText;
        statusLabel.classList.remove('text-green-700', 'text-gray-500', 'text-gray-800', 'text-red-700');
        statusLabel.classList.add(statusClass);
    }
}

async function computePushState() {
    const permission = getNotificationPermission();
    const state = {
        supported: isPushSupported(),
        permission,
        subscribed: false,
        backendRegistered: false,
        backendDevices: 0,
        registrationId: '',
    };

    if (!state.supported) {
        return state;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            state.subscribed = true;
            state.registrationId = subscription.endpoint;
        }
    } catch (error) {
        console.debug('No se pudo obtener la suscripción del navegador:', error);
    }

    try {
        const response = await fetch('/push/status/', { headers: { Accept: 'application/json' } });
        if (response.ok) {
            const payload = await response.json();
            state.backendRegistered = Boolean(payload && payload.subscribed);
            state.backendDevices = payload && typeof payload.devices === 'number' ? payload.devices : 0;
        } else if (response.status !== 404) {
            console.debug('Respuesta inesperada del endpoint push/status:', response.status);
        }
    } catch (error) {
        console.debug('No se pudo consultar el estado de push en el servidor:', error);
    }

    return state;
}

async function refreshPushState() {
    const latest = await computePushState();
    Object.assign(pushState, latest);
    updatePushControlsUI(pushState);
    return pushState;
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer) {
    if (!buffer) {
        return '';
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function subscriptionToPayload(subscription) {
    return {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth: arrayBufferToBase64(subscription.getKey('auth')),
        registration_id: subscription.endpoint,
    };
}

function isPushSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

async function ensureVapidKey(forceRefresh = false) {
    if (!forceRefresh) {
        if (window.VAPID_PUBLIC_KEY && window.VAPID_PUBLIC_KEY !== 'TU_VAPID_PUBLIC_KEY_AQUI') {
            return window.VAPID_PUBLIC_KEY;
        }
        let stored = '';
        try {
            stored = localStorage.getItem('vapidPublicKey') || '';
        } catch (storageReadError) {
            console.debug('No se pudo leer la clave VAPID desde localStorage:', storageReadError);
        }
        if (stored) {
            window.VAPID_PUBLIC_KEY = stored;
            return stored;
        }
    }

    try {
        const response = await fetch('/push/vapid/', { headers: { Accept: 'application/json' } });
        if (response.ok && response.status !== 204) {
            const payload = await response.json();
            if (payload && payload.vapid_public_key) {
                window.VAPID_PUBLIC_KEY = payload.vapid_public_key;
                try {
                    localStorage.setItem('vapidPublicKey', payload.vapid_public_key);
                } catch (storageError) {
                    console.debug('No se pudo persistir la clave VAPID en localStorage:', storageError);
                }
                return payload.vapid_public_key;
            }
        }
    } catch (error) {
        console.debug('No se pudo obtener la clave pública VAPID del servidor:', error);
    }

    if (window.VAPID_PUBLIC_KEY) {
        return window.VAPID_PUBLIC_KEY;
    }

    try {
        return localStorage.getItem('vapidPublicKey') || '';
    } catch (storageError) {
        console.debug('No se pudo recuperar la clave VAPID persistida:', storageError);
        return '';
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function subscribeToPush(event) {
    const trigger = event && event.currentTarget ? event.currentTarget : null;
    if (trigger) {
        setButtonBusy(trigger, true);
    }

    if (!isPushSupported()) {
        mostrarMensaje('Notificaciones push no soportadas en este navegador', 'error');
        if (trigger) {
            setButtonBusy(trigger, false);
        }
        return;
    }

    let permission = 'default';
    try {
        permission = await Notification.requestPermission();
    } catch (error) {
        console.debug('No se pudo solicitar permiso de notificaciones:', error);
        permission = 'denied';
    }

    if (permission !== 'granted') {
        mostrarMensaje('Permiso de notificaciones denegado', 'error');
        if (trigger) {
            setButtonBusy(trigger, false);
        }
        await updatePushButtonState();
        return;
    }

    const registration = await navigator.serviceWorker.ready;

    const vapidPublic = await ensureVapidKey();
    if (!vapidPublic) {
        mostrarMensaje('VAPID public key no configurada. Guardala en localStorage como "vapidPublicKey" o configurá el endpoint /push/vapid/.', 'error');
        if (trigger) {
            setButtonBusy(trigger, false);
        }
        await updatePushButtonState();
        return;
    }

    try {
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublic),
            });
        }

        const payload = subscriptionToPayload(subscription);
        await sendSubscriptionToServer(payload);
        mostrarMensaje('Suscripción a notificaciones registrada', 'success');
    } catch (err) {
        console.error('Error al suscribirse:', err);
        mostrarMensaje('No se pudo suscribir a notificaciones', 'error');
    } finally {
        if (trigger) {
            setButtonBusy(trigger, false);
        }
        await updatePushButtonState();
    }
}

async function sendSubscriptionToServer(data) {
    const csrftoken = getCookie('csrftoken');
    const resp = await fetch('/push/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(data),
    });
    if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(errorText || `Error HTTP ${resp.status}`);
    }
    return resp.json();
}

async function sendUnsubscriptionToServer(registrationId) {
    const csrftoken = getCookie('csrftoken');
    const payload = registrationId ? { registration_id: registrationId } : {};
    const resp = await fetch('/push/unregister/', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify(payload),
    });
    if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(errorText || `Error HTTP ${resp.status}`);
    }
    return resp.json();
}

async function unsubscribeFromPush(event) {
    const trigger = event && event.currentTarget ? event.currentTarget : null;
    if (trigger) {
        setButtonBusy(trigger, true);
    }

    if (!isPushSupported()) {
        mostrarMensaje('Notificaciones push no soportadas en este navegador', 'error');
        if (trigger) {
            setButtonBusy(trigger, false);
        }
        return;
    }

    let registrationId = '';
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            registrationId = subscription.endpoint;
            await subscription.unsubscribe();
        }
    } catch (error) {
        console.debug('No se pudo cancelar la suscripción local al push:', error);
    }

    try {
        await sendUnsubscriptionToServer(registrationId);
        mostrarMensaje('Notificaciones desactivadas en este dispositivo', 'info');
    } catch (error) {
        console.error('Error al eliminar la suscripción en el servidor:', error);
        mostrarMensaje('No se pudo desactivar la suscripción de notificaciones', 'error');
    } finally {
        if (trigger) {
            setButtonBusy(trigger, false);
        }
        await updatePushButtonState();
    }
}

async function sendTestPushMessage(event) {
    const trigger = event && event.currentTarget ? event.currentTarget : null;
    if (trigger) {
        setButtonBusy(trigger, true);
    }

    await refreshPushState();

    if (!pushState.subscribed || !pushState.backendRegistered) {
        mostrarMensaje('Primero activá las notificaciones push en este dispositivo', 'error');
        if (trigger) {
            setButtonBusy(trigger, false);
        }
        return;
    }

    const csrftoken = getCookie('csrftoken');
    const payload = {
        title: 'Dumanity',
        body: 'Notificación de prueba enviada desde la web',
        url: window.location.pathname,
    };

    try {
        const resp = await fetch('/push/test/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(payload),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
            const message = data && (data.error || data.detail);
            throw new Error(message || `Error HTTP ${resp.status}`);
        }
        if (Array.isArray(data.errors) && data.errors.length) {
            mostrarMensaje('Notificación enviada con advertencias', 'error');
        } else {
            mostrarMensaje('Notificación de prueba enviada', 'success');
        }
    } catch (error) {
        console.error('Error al enviar la notificación de prueba:', error);
        mostrarMensaje('No se pudo enviar la notificación de prueba', 'error');
    } finally {
        if (trigger) {
            setButtonBusy(trigger, false);
        }
        await updatePushButtonState();
    }
}

async function updatePushButtonState() {
    return refreshPushState();
}

window.addEventListener('load', () => {
    updatePushButtonState().catch((error) => {
        console.debug('No se pudo actualizar estado del botón push tras load:', error);
    });
});

/**
 * Cargar la API de Google Maps dinámicamente
 */
function cargarGoogleMapsAPI() {
    // Intentar obtener la API key del localStorage o usar una key de desarrollo
    // En producción, el usuario deberá configurar su propia API key
    const apiKey = localStorage.getItem('googleMapsApiKey') || '';

    if (!apiKey) {
        // Si no hay API key, mostrar mensaje instructivo
        mostrarMensaje('Nota: Para usar Google Maps, configurá tu API key en localStorage con la clave "googleMapsApiKey"', 'info');
        // Intentar cargar sin API key (modo desarrollo limitado)
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
        console.error('Error al cargar Google Maps API');
    };
    document.head.appendChild(script);
}

/**
 * Solicitar ubicación del usuario
 */
function solicitarUbicacion() {
    if (!navigator.geolocation) {
        mostrarMensaje('Tu navegador no soporta geolocalización', 'error');
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

    mostrarMensaje('¡Ubicación obtenida exitosamente!', 'success');

    // Mostrar información de coordenadas
    const locationInfo = document.getElementById('location-info');
    locationInfo.textContent = `Latitud: ${userLocation.lat.toFixed(6)}, Longitud: ${userLocation.lng.toFixed(6)}`;

    // Ocultar el botón y mostrar el mapa
    document.getElementById('location-button-container').classList.add('hidden');
    document.getElementById('map-container').classList.remove('hidden');

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
            mensaje = 'Permiso de ubicación denegado. Por favor, habilitá el acceso a tu ubicación.';
            break;
        case error.POSITION_UNAVAILABLE:
            mensaje = 'Información de ubicación no disponible.';
            break;
        case error.TIMEOUT:
            mensaje = 'La solicitud de ubicación ha expirado.';
            break;
        default:
            mensaje = 'Error desconocido al obtener la ubicación.';
    }

    mostrarMensaje(mensaje, 'error');
}

/**
 * Inicializar el mapa de Google Maps con la ubicación del usuario
 * @param {Object} location - Objeto con lat y lng
 */
function inicializarMapa(location) {
    // Verificar que Google Maps esté disponible
    if (typeof google === 'undefined' || !google.maps) {
        mostrarMensaje('Google Maps no está disponible. Verificá tu conexión a internet.', 'error');
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
            fillColor: '#3F51B5',
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

/**
 * Solicitar permisos de notificaciones al usuario
 */
async function solicitarPermisoNotificaciones() {
    if (!('Notification' in window)) {
        console.log('Este navegador no soporta notificaciones');
        return false;
    }

    if (Notification.permission === 'granted') {
        notificationPermissionGranted = true;
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            notificationPermissionGranted = true;
            return true;
        }
    }

    return false;
}

/**
 * Enviar una notificación de bienvenida
 */
function enviarNotificacionBienvenida() {
    if (!notificationPermissionGranted) {
        return;
    }

    // Solo enviar si el documento no tiene el foco
    if (document.hidden) {
        const notification = new Notification('¡Bienvenido a GeoQR!', {
            body: 'La aplicación está lista para escanear códigos QR y obtener tu ubicación.',
            icon: '/static/icons/android/android-launchericon-192-192.png',
            badge: '/static/icons/android/android-launchericon-96-96.png',
            tag: 'bienvenida',
            requireInteraction: false,
            silent: false
        });

        notification.onclick = function () {
            window.focus();
            notification.close();
        };
    }
}

/**
 * Inicializar el sistema de notificaciones
 */
async function inicializarNotificaciones() {
    // Solicitar permisos
    await solicitarPermisoNotificaciones();

    // Marcar que la página ha sido visitada
    pageVisited = true;

    // Escuchar cambios de visibilidad para enviar notificación cuando la página pierda el foco
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && pageVisited && notificationPermissionGranted) {
            // Cancelar cualquier timer previo
            if (notificationTimer) {
                clearTimeout(notificationTimer);
            }

            // Programar notificación para 10 segundos después de perder el foco
            notificationTimer = setTimeout(() => {
                // Verificar nuevamente que la página siga sin foco
                if (document.hidden) {
                    enviarNotificacionBienvenida();
                }
            }, 10000); // 10 segundos
        } else {
            // Si la página recupera el foco, cancelar la notificación pendiente
            if (notificationTimer) {
                clearTimeout(notificationTimer);
                notificationTimer = null;
            }
        }
    });
}

// Inicializar notificaciones cuando la página cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarNotificaciones);
} else {
    inicializarNotificaciones();
}
