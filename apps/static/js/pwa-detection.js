/**
 * Detección de PWA instalada y modo de visualización
 * Detecta si la app está corriendo como PWA instalada vs navegador
 */

// Cache global para el estado del entorno (evita recalcular)
let _cachedPWAEnvironment = null;
let _twaDetectionPromise = null;

/**
 * Detectar si la app está instalada (PWA o TWA) - versión síncrona
 * @returns {Object} Información sobre el entorno de ejecución
 */
function detectPWAEnvironment() {
    // Usar cache si ya se calculó
    if (_cachedPWAEnvironment) {
        return _cachedPWAEnvironment;
    }

    const detection = {
        isInstalled: false,
        isPWA: false,
        isTWA: false,
        isBrowser: true,
        displayMode: 'browser',
        platform: 'unknown',
        userAgent: navigator.userAgent,
        // Nuevo: indica si los permisos requieren gesto de usuario
        requiresUserGesture: false
    };

    // 1. Verificar display-mode mediante media query
    if (window.matchMedia('(display-mode: standalone)').matches) {
        detection.displayMode = 'standalone';
        detection.isInstalled = true;
        detection.isPWA = true;
        detection.isBrowser = false;
    } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
        detection.displayMode = 'fullscreen';
        detection.isInstalled = true;
        detection.isPWA = true;
        detection.isBrowser = false;
    } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        detection.displayMode = 'minimal-ui';
        detection.isInstalled = true;
        detection.isPWA = true;
        detection.isBrowser = false;
    } else if (window.matchMedia('(display-mode: window-controls-overlay)').matches) {
        detection.displayMode = 'window-controls-overlay';
        detection.isInstalled = true;
        detection.isPWA = true;
        detection.isBrowser = false;
    }

    // 2. Verificar iOS standalone mode
    if (window.navigator.standalone === true) {
        detection.isInstalled = true;
        detection.isPWA = true;
        detection.isBrowser = false;
        detection.platform = 'ios';
        detection.displayMode = 'standalone';
        // iOS PWA también requiere gesto para ciertos permisos
        detection.requiresUserGesture = true;
    }

    // 3. Detectar TWA (Trusted Web Activity) - Android
    // Las TWAs compiladas con PWABuilder tienen estas características:
    if (document.referrer.includes('android-app://')) {
        detection.isTWA = true;
        detection.isInstalled = true;
        detection.isPWA = true;
        detection.isBrowser = false;
        detection.platform = 'android-twa';
        detection.displayMode = 'standalone';
        detection.requiresUserGesture = true;
    }

    // 4. Heurística para Android en standalone
    // Las PWAs y TWAs en Android requieren gesto de usuario para permisos
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.includes('android');

    if (isAndroid && detection.displayMode === 'standalone') {
        // En Android, si estamos en standalone, es TWA o PWA instalada
        // Ambos casos requieren gesto de usuario para solicitar permisos
        detection.requiresUserGesture = true;

        // Detectar TWA: puede o no tener window.chrome dependiendo de la versión de Chrome
        // Usamos múltiples heurísticas para detectar TWA
        const isTWAByChrome = typeof window.chrome === 'undefined';
        const isTWAByReferrer = document.referrer.includes('android-app://');
        const isTWAByPackage = sessionStorage.getItem('__pwa_twa_detected') === 'true';

        // Si cualquier heurística indica TWA, marcarlo
        if (isTWAByChrome || isTWAByReferrer || isTWAByPackage) {
            detection.isTWA = true;
            detection.platform = 'android-twa';
        } else {
            // En Android standalone sin indicadores de TWA, aún así tratar como posible TWA
            // porque las heurísticas pueden fallar en algunas versiones de Chrome
            detection.platform = 'android-pwa';
            // Marcar como TWA potencial para manejar permisos correctamente
            detection.possibleTWA = true;
        }
    }

    // 5. Detectar plataforma si aún es desconocida
    if (detection.platform === 'unknown') {
        if (isAndroid) {
            detection.platform = 'android';
        } else if (ua.includes('iphone') || ua.includes('ipad')) {
            detection.platform = 'ios';
        } else if (ua.includes('windows')) {
            detection.platform = 'windows';
        } else if (ua.includes('mac')) {
            detection.platform = 'macos';
        } else if (ua.includes('linux')) {
            detection.platform = 'linux';
        }
    }

    // Cachear resultado
    _cachedPWAEnvironment = detection;

    return detection;
}

/**
 * Detectar TWA de forma asíncrona usando getInstalledRelatedApps
 * @returns {Promise<boolean>} true si es TWA
 */
async function detectTWAAsync() {
    if (_twaDetectionPromise) {
        return _twaDetectionPromise;
    }

    _twaDetectionPromise = (async () => {
        const env = detectPWAEnvironment();

        // Si ya sabemos que es TWA, retornar true
        if (env.isTWA) {
            return true;
        }

        // Verificar usando getInstalledRelatedApps (API asíncrona)
        if (navigator.getInstalledRelatedApps) {
            try {
                const relatedApps = await navigator.getInstalledRelatedApps();
                if (relatedApps.length > 0) {
                    console.log('📱 App instalada detectada via getInstalledRelatedApps:', relatedApps);
                    // Actualizar el cache
                    if (_cachedPWAEnvironment) {
                        _cachedPWAEnvironment.isTWA = true;
                        _cachedPWAEnvironment.isInstalled = true;
                        _cachedPWAEnvironment.platform = 'android-twa';
                        _cachedPWAEnvironment.requiresUserGesture = true;
                    }
                    return true;
                }
            } catch (err) {
                console.log('No se pudo verificar apps relacionadas:', err);
            }
        }

        return env.isTWA;
    })();

    return _twaDetectionPromise;
}

/**
 * Verificar si el contexto actual requiere gesto de usuario para solicitar permisos
 * @returns {boolean}
 */
function requiresUserGestureForPermissions() {
    const env = detectPWAEnvironment();
    return env.requiresUserGesture || env.isTWA || env.isInstalled || env.possibleTWA;
}

/**
 * Invalidar cache del entorno (útil para testing)
 */
function invalidatePWAEnvironmentCache() {
    _cachedPWAEnvironment = null;
    _twaDetectionPromise = null;
}

/**
 * Obtener descripción legible del entorno
 * @returns {string}
 */
function getPWAEnvironmentDescription() {
    const env = detectPWAEnvironment();

    if (env.isTWA) {
        return '📱 App Instalada (TWA desde Google Play)';
    } else if (env.platform === 'android-pwa' || env.possibleTWA) {
        return '📱 App Android (' + env.displayMode + ')';
    } else if (env.isPWA && env.platform === 'ios') {
        return '📱 PWA Instalada (iOS)';
    } else if (env.isPWA) {
        return '📱 PWA Instalada (' + env.displayMode + ')';
    } else {
        return '🌐 Navegador Web (' + env.platform + ')';
    }
}

/**
 * Aplicar estilos o comportamientos según el entorno
 */
function applyPWAEnvironmentStyles() {
    const env = detectPWAEnvironment();
    const body = document.body;

    // Agregar clases CSS para estilos específicos
    if (env.isInstalled) {
        body.classList.add('pwa-installed');
    }

    if (env.isTWA) {
        body.classList.add('pwa-twa');
    }

    if (env.isBrowser) {
        body.classList.add('pwa-browser');
    }

    body.classList.add(`pwa-platform-${env.platform}`);
    body.classList.add(`pwa-display-${env.displayMode}`);

    // Agregar información al DOM para debugging
    const debugInfo = document.createElement('div');
    debugInfo.id = 'pwa-environment-info';
    debugInfo.setAttribute('data-installed', env.isInstalled);
    debugInfo.setAttribute('data-twa', env.isTWA);
    debugInfo.setAttribute('data-platform', env.platform);
    debugInfo.setAttribute('data-display-mode', env.displayMode);
    debugInfo.style.display = 'none';
    document.body.appendChild(debugInfo);
}

// Ejecutar detección al cargar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        applyPWAEnvironmentStyles();
        const env = detectPWAEnvironment();
        const desc = getPWAEnvironmentDescription();
        console.log('🔍 PWA Environment:', env);
        console.log('📱 Descripción:', desc);

        // Agregar log visible si existe la función
        if (typeof addNotificationLog === 'function') {
            addNotificationLog('🔍 Entorno: ' + desc, 'info');
            if (env.isTWA) {
                addNotificationLog('✅ App instalada desde Google Play Store detectada', 'success');
            } else if (env.isInstalled) {
                addNotificationLog('✅ PWA instalada detectada', 'success');
            } else {
                addNotificationLog('🌐 Ejecutando en navegador web', 'info');
            }
        }
    });
} else {
    applyPWAEnvironmentStyles();
    const env = detectPWAEnvironment();
    const desc = getPWAEnvironmentDescription();
    console.log('🔍 PWA Environment:', env);
    console.log('📱 Descripción:', desc);

    // Agregar log visible si existe la función
    if (typeof addNotificationLog === 'function') {
        addNotificationLog('🔍 Entorno: ' + desc, 'info');
        if (env.isTWA) {
            addNotificationLog('✅ App instalada desde Google Play Store detectada', 'success');
        } else if (env.isInstalled) {
            addNotificationLog('✅ PWA instalada detectada', 'success');
        } else {
            addNotificationLog('🌐 Ejecutando en navegador web', 'info');
        }
    }
}

// Exponer funciones globalmente
window.detectPWAEnvironment = detectPWAEnvironment;
window.getPWAEnvironmentDescription = getPWAEnvironmentDescription;
window.detectTWAAsync = detectTWAAsync;
window.requiresUserGestureForPermissions = requiresUserGestureForPermissions;
window.invalidatePWAEnvironmentCache = invalidatePWAEnvironmentCache;
