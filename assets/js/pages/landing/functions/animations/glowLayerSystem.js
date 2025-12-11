/**
 * Glow Layer System (Section 0 uniquement)
 *
 * OPTIMISATION DE PERFORMANCE:
 * Au lieu d'animer filter: drop-shadow (coûteux, recalcul GPU constant),
 * on duplique les éléments SVG et on anime uniquement l'opacity (GPU-accélérée).
 *
 * Structure créée:
 * - Élément original : sans filtre, opacity animée (Base)
 * - Élément clone (glow) : filtre statique, opacity animée (Glow)
 *
 * Le résultat visuel est identique à l'animation originale.
 */

// Configuration des éléments à dupliquer (Section 0 uniquement)
const GLOW_CONFIG = {
    dots: {
        selector: '.hero-illustration__dot',
        filterVar: '--dot-shadow-glow',
        animationBase: 'dotPulseBase',
        animationGlow: 'dotPulseGlow'
    },
    lines: {
        selector: '.hero-illustration__middle_outer path.hero-illustration__stroke, .hero-illustration__middle_inner path.hero-illustration__stroke, [class^="hero-illustration__line"] > path.hero-illustration__stroke',
        filterVar: '--line-shimmer-50',
        animationBase: 'lineShimmerBase',
        animationGlow: 'lineShimmerGlow'
    },
    numbers: {
        selector: '.hero-illustration__2026 path',
        filterVar: '--number-glow-intense',
        animationBase: 'numberGlowBase',
        animationGlow: 'numberGlowGlow'
    }
};

// Stockage des clones créés
const createdClones = new Map();

/**
 * Initialise le système de glow layer
 */
export function initGlowLayerSystem() {
    setupMutationObserver();
}

/**
 * Configure un MutationObserver pour détecter l'ajout des classes d'animation
 */
function setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const element = mutation.target;

                // Vérifier si .glowing ou .pulsing a été ajouté (Section 0 uniquement)
                if ((element.classList.contains('glowing') || element.classList.contains('pulsing'))
                    && !createdClones.has(element)
                    && isSection0Element(element)) {
                    createGlowLayer(element);
                }
            }
        });
    });

    // Observer uniquement la section0
    const section0 = document.querySelector('.section0');
    if (section0) {
        observer.observe(section0, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });
    }

    return observer;
}

/**
 * Vérifie si l'élément appartient à la section 0
 */
function isSection0Element(element) {
    return element.closest('.section0') !== null;
}

/**
 * Crée un layer de glow pour un élément
 */
function createGlowLayer(element) {
    const config = getConfigForElement(element);
    if (!config) return;

    // Cloner l'élément
    const clone = element.cloneNode(true);
    clone.classList.add('glow-layer');
    clone.classList.remove('glowing', 'pulsing');

    // Appliquer le filtre statique
    const filterValue = getComputedStyle(document.documentElement).getPropertyValue(config.filterVar);
    if (filterValue) {
        clone.style.filter = filterValue.trim();
    }

    // Positionner le clone
    clone.style.pointerEvents = 'none';

    // IMPORTANT: Démarrer invisible avec transition pour apparition progressive
    clone.style.opacity = '0';
    clone.style.transition = 'opacity 1s ease-in-out';

    // Insérer après l'original
    element.parentNode.insertBefore(clone, element.nextSibling);

    // Configurer les animations
    setupDualAnimation(element, clone, config);

    // Stocker la référence
    createdClones.set(element, clone);
}

/**
 * Récupère la configuration pour un élément
 */
function getConfigForElement(element) {
    if (element.classList.contains('hero-illustration__dot')) {
        return GLOW_CONFIG.dots;
    }
    if (element.classList.contains('hero-illustration__stroke')) {
        return GLOW_CONFIG.lines;
    }
    if (element.closest('.hero-illustration__2026')) {
        return GLOW_CONFIG.numbers;
    }
    return null;
}

/**
 * Configure les animations synchronisées
 */
function setupDualAnimation(original, clone, config) {
    const computedStyle = getComputedStyle(original);
    const duration = computedStyle.animationDuration || '2s';
    const delay = computedStyle.animationDelay || '0s';
    const timing = computedStyle.animationTimingFunction || 'ease-in-out';

    // Animation de base sur l'original (sans filtre)
    original.style.filter = 'none';
    original.style.animation = `${config.animationBase} ${duration} ${timing} ${delay} infinite`;

    // Faire apparaître le clone progressivement après un court délai
    // (la transition CSS sur opacity gère l'animation d'apparition)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Double rAF pour s'assurer que le style initial est appliqué
            clone.style.opacity = '1';
        });
    });

    // Animation glow sur le clone (optionnel - décommenter pour animation pulsante)
    clone.style.animation = `${config.animationGlow} ${duration} ${timing} ${delay} infinite`;
}

/**
 * Nettoie tous les clones
 */
export function cleanupGlowLayers() {
    createdClones.forEach((clone) => {
        clone.remove();
    });
    createdClones.clear();
}
