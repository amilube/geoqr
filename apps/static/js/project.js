/* Project specific Javascript goes here. */

/**
 * HTMX Integration
 * Handles page transitions and smooth loading with HTMX
 */

document.addEventListener('DOMContentLoaded', function () {
    // Configure HTMX settings
    if (typeof htmx !== 'undefined') {
        // Enable history management
        htmx.config.refreshOnHistoryMiss = true;
        htmx.config.historyCacheSize = 10;
        htmx.config.defaultIndicatorStyle = 'spinner';

        // Event listeners for page transitions

        // Before swap - prepare for animation
        document.body.addEventListener('htmx:beforeSwap', function (event) {
            // Add fade-out effect before swap
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.style.opacity = '0.7';
            }
        });

        // After swap - handle post-swap logic
        document.body.addEventListener('htmx:afterSwap', function (event) {
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
        document.body.addEventListener('htmx:load', function (event) {
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
        button.addEventListener('click', function () {
            this.closest('div').remove();
        });
    });

    // Re-process Iconify icons for newly added content
    if (typeof iconify !== 'undefined') {
        iconify.scan();
    }
}
