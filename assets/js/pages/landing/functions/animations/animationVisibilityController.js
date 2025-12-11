/**
 * Animation Visibility Controller (Section 0 uniquement)
 *
 * Utilise IntersectionObserver pour pauser les animations CSS infinies
 * quand la section 0 est hors du viewport, économisant ainsi CPU/GPU.
 */

const PAUSE_CLASS = 'anim-visibility-paused';

// Sélecteurs des éléments animés (Section 0 uniquement)
const ANIMATED_SELECTORS = [
    '.hero-illustration__middle_outer',
    '.hero-illustration__middle_inner',
    '.hero-illustration__dot.pulsing',
    '.hero-illustration__stroke.glowing',
    '.hero-illustration__2026 path.glowing',
    '.glow-layer' // Inclure les clones créés par glowLayerSystem
];

/**
 * Initialise le contrôleur de visibilité
 */
export function initAnimationVisibilityController() {
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported');
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                resumeAnimations();
            } else {
                pauseAnimations();
            }
        });
    }, observerOptions);

    const section0 = document.querySelector('.section0');
    if (section0) {
        observer.observe(section0);
    }

    return observer;
}

/**
 * Pause les animations de la section 0
 */
function pauseAnimations() {
    const section0 = document.querySelector('.section0');
    if (!section0) return;

    ANIMATED_SELECTORS.forEach(selector => {
        const elements = section0.querySelectorAll(selector);
        elements.forEach(el => el.classList.add(PAUSE_CLASS));
    });
}

/**
 * Reprend les animations de la section 0
 */
function resumeAnimations() {
    const section0 = document.querySelector('.section0');
    if (!section0) return;

    ANIMATED_SELECTORS.forEach(selector => {
        const elements = section0.querySelectorAll(selector);
        elements.forEach(el => el.classList.remove(PAUSE_CLASS));
    });
}
