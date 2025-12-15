/**
 * Módulo para manejar Web Push Notifications con django-push-notifications
 */

const PUSH_DEBUG = true;

/**
 * Convierte una clave pública VAPID base64 a Uint8Array
 * @param {string} base64String - Clave pública VAPID en base64
 * @returns {Uint8Array}
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Obtener información del navegador
 * @returns {string}
 */
function getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
}

/**
 * Suscribirse a notificaciones push
 * @param {string} vapidPublicKey - Clave pública VAPID
 * @returns {Promise<Object>} Objeto de suscripción
 */
async function subscribeToPushNotifications(vapidPublicKey) {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Workers no soportados');
    }

    if (!('PushManager' in window)) {
        throw new Error('Push API no soportada');
    }

    try {
        // Esperar que el Service Worker esté listo
        const registration = await navigator.serviceWorker.ready;

        if (PUSH_DEBUG) console.log('📱 Service Worker listo, suscribiendo a push...');

        // Verificar si ya existe una suscripción
        let subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            if (PUSH_DEBUG) console.log('✅ Suscripción existente encontrada');
            return subscription;
        }

        // Crear nueva suscripción
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        });

        if (PUSH_DEBUG) console.log('✅ Nueva suscripción creada', subscription);

        return subscription;

    } catch (error) {
        console.error('❌ Error al suscribirse:', error);
        throw error;
    }
}

/**
 * Registrar suscripción en el servidor
 * @param {Object} subscription - Objeto de suscripción
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function registerSubscriptionOnServer(subscription) {
    try {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

        const response = await fetch('/api/push/subscribe/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                subscription: subscription.toJSON(),
                browser: getBrowserInfo()
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al registrar suscripción');
        }

        const data = await response.json();
        if (PUSH_DEBUG) console.log('✅ Suscripción registrada en servidor:', data);

        return data;

    } catch (error) {
        console.error('❌ Error al registrar en servidor:', error);
        throw error;
    }
}

/**
 * Enviar notificación de prueba
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function sendTestNotification() {
    try {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

        const response = await fetch('/api/push/test/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al enviar notificación');
        }

        const data = await response.json();
        if (PUSH_DEBUG) console.log('✅ Notificación de prueba enviada:', data);

        return data;

    } catch (error) {
        console.error('❌ Error al enviar notificación de prueba:', error);
        throw error;
    }
}

/**
 * Desuscribirse de notificaciones push
 * @returns {Promise<boolean>}
 */
async function unsubscribeFromPushNotifications() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            if (PUSH_DEBUG) console.log('ℹ️ No hay suscripción activa');
            return false;
        }

        // Desuscribir del navegador
        const unsubscribed = await subscription.unsubscribe();

        if (unsubscribed) {
            // Notificar al servidor
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

            await fetch('/api/push/unsubscribe/', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint
                })
            });

            if (PUSH_DEBUG) console.log('✅ Desuscripción exitosa');
        }

        return unsubscribed;

    } catch (error) {
        console.error('❌ Error al desuscribirse:', error);
        throw error;
    }
}

/**
 * Verificar estado de suscripción
 * @returns {Promise<Object>} Estado de la suscripción
 */
async function checkSubscriptionStatus() {
    try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return {
                supported: false,
                subscribed: false,
                permission: Notification.permission
            };
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        return {
            supported: true,
            subscribed: !!subscription,
            permission: Notification.permission,
            subscription: subscription ? subscription.toJSON() : null
        };

    } catch (error) {
        console.error('❌ Error al verificar estado:', error);
        return {
            supported: false,
            subscribed: false,
            permission: Notification.permission,
            error: error.message
        };
    }
}

// Exponer funciones globalmente
window.pushNotifications = {
    subscribe: subscribeToPushNotifications,
    register: registerSubscriptionOnServer,
    sendTest: sendTestNotification,
    unsubscribe: unsubscribeFromPushNotifications,
    checkStatus: checkSubscriptionStatus,
    getBrowserInfo: getBrowserInfo
};

console.log('✓ Módulo push-notifications.js cargado');
