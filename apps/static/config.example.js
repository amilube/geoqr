// config.example.js - Ejemplo de configuración
// Copiá este archivo como 'config.js' y configurá tu API key de Google Maps
//
// NOTA DE SEGURIDAD:
// - localStorage NO es seguro para datos altamente sensibles
// - Para aplicaciones en producción, considerá usar restricciones de dominio/IP en tu API key
// - Limitá los permisos del API key solo a las APIs necesarias (Maps JavaScript API)
// - Para mayor seguridad, implementá un backend proxy que maneje el API key

const CONFIG = {
    // Obtené tu API key en: https://console.cloud.google.com/google/maps-apis
    GOOGLE_MAPS_API_KEY: 'TU_API_KEY_AQUI'
};

// Guardar la API key en localStorage (conveniente pero no altamente seguro)
// Alternativa más segura: usar un backend proxy para ocultar la API key
if (CONFIG.GOOGLE_MAPS_API_KEY && CONFIG.GOOGLE_MAPS_API_KEY !== 'TU_API_KEY_AQUI') {
    localStorage.setItem('googleMapsApiKey', CONFIG.GOOGLE_MAPS_API_KEY);
}

// Opcional: VAPID public key para Web Push
// Generá tus VAPID keys y pegá la "Application Server Key" aquí o en localStorage
// Ejemplo de uso: localStorage.setItem('vapidPublicKey', '<APPLICATION_SERVER_KEY>')
CONFIG.VAPID_PUBLIC_KEY = 'TU_VAPID_PUBLIC_KEY_AQUI'
if (CONFIG.VAPID_PUBLIC_KEY && CONFIG.VAPID_PUBLIC_KEY !== 'TU_VAPID_PUBLIC_KEY_AQUI') {
    localStorage.setItem('vapidPublicKey', CONFIG.VAPID_PUBLIC_KEY);
}
