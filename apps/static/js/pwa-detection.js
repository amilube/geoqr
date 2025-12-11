/**
 * Detección de PWA instalada y modo de visualización
 * Detecta si la app está corriendo como PWA instalada vs navegador
 */

/**
 * Detectar si la app está instalada (PWA o TWA)
 * @returns {Object} Información sobre el entorno de ejecución
 */
function detectPWAEnvironment() {
    const detection = {
        isInstalled: false,
        isPWA: false,
        isTWA: false,
        isBrowser: true,
        displayMode: 'browser',
        platform: 'unknown',
        userAgent: navigator.userAgent
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
    }

    // 4. Verificar si viene de related_applications (package instalado)
    // Cuando la app está instalada desde Google Play, puede tener este comportamiento
    if (navigator.getInstalledRelatedApps) {
        navigator.getInstalledRelatedApps().then(relatedApps => {
            if (relatedApps.length > 0) {
                detection.isTWA = true;
                detection.isInstalled = true;
                detection.platform = 'android-twa';
                console.log('📱 App instalada detectada:', relatedApps);
            }
        }).catch(err => {
            console.log('No se pudo verificar apps relacionadas:', err);
        });
    }

    // 5. Heurística adicional: verificar ausencia de elementos del navegador
    // Si no hay window.chrome y está en standalone, probablemente es TWA
    if (detection.displayMode === 'standalone' && typeof window.chrome === 'undefined') {
        detection.isTWA = true;
        detection.platform = 'android-twa';
    }

    // 6. Detectar plataforma
    if (detection.platform === 'unknown') {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('android')) {
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

    return detection;
}

/**
 * Obtener descripción legible del entorno
 * @returns {string}
 */
function getPWAEnvironmentDescription() {
    const env = detectPWAEnvironment();

    if (env.isTWA) {
        return '📱 App Instalada (TWA desde Google Play)';
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
