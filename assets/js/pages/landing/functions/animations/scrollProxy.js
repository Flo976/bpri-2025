import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll Proxy pour iframeResizer
 *
 * Détecte si on est dans un iframe avec iframeResizer
 * et utilise la position de scroll du parent pour piloter ScrollTrigger
 */

let isInIframe = false;
let parentScrollTop = 0;
let iframeOffsetTop = 0;
let parentViewportHeight = 0;
let scrollListeners = [];

/**
 * Vérifie si on est dans un iframe
 */
function checkIfInIframe() {
    try {
        isInIframe = window.self !== window.top;
    } catch (e) {
        isInIframe = true;
    }
    return isInIframe;
}

/**
 * Initialise le proxy de scroll pour iframeResizer
 */
export function initScrollProxy() {
    checkIfInIframe();

    if (!isInIframe) {
        console.log("ScrollProxy: Mode normal (pas dans un iframe)");
        return false;
    }

    console.log("ScrollProxy: Mode iframe détecté");

    // Attendre que parentIFrame soit disponible
    const waitForParentIFrame = () => {
        if (window.parentIFrame) {
            setupParentScrollListener();
        } else {
            // Réessayer après un court délai
            setTimeout(waitForParentIFrame, 100);
        }
    };

    waitForParentIFrame();
    return true;
}

/**
 * Configure l'écoute du scroll parent via iframeResizer
 */
function setupParentScrollListener() {
    if (!window.parentIFrame) {
        console.warn("ScrollProxy: parentIFrame non disponible");
        return;
    }

    // Demander les infos de scroll du parent
    window.parentIFrame.getPageInfo((pageInfo) => {
        parentScrollTop = pageInfo.scrollTop;
        iframeOffsetTop = pageInfo.offsetTop;
        parentViewportHeight = pageInfo.clientHeight;

        // Calculer la position de scroll relative à l'iframe
        const iframeScrollPosition = parentScrollTop - iframeOffsetTop;

        // Mettre à jour ScrollTrigger
        updateScrollTrigger(iframeScrollPosition, parentViewportHeight);

        // Notifier les listeners
        scrollListeners.forEach(callback => {
            callback({
                scrollTop: iframeScrollPosition,
                viewportHeight: parentViewportHeight,
                parentScrollTop,
                iframeOffsetTop
            });
        });
    });
}

/**
 * Met à jour ScrollTrigger avec la position de scroll du parent
 */
function updateScrollTrigger(scrollPosition, viewportHeight) {
    // Créer un faux événement de scroll pour ScrollTrigger
    ScrollTrigger.update();
}

/**
 * Ajoute un listener pour les mises à jour de scroll
 */
export function onParentScroll(callback) {
    scrollListeners.push(callback);
}

/**
 * Retourne si on est dans un iframe
 */
export function isIframeMode() {
    return isInIframe;
}

/**
 * Configure ScrollTrigger pour fonctionner avec le scroll du parent
 * Alternative: utiliser un scroller personnalisé
 */
export function setupScrollTriggerForIframe() {
    if (!isInIframe) return;

    // Créer un conteneur virtuel pour le scroll
    const scrollContainer = document.createElement("div");
    scrollContainer.id = "scroll-proxy-container";
    scrollContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 1px;
        height: 100%;
        pointer-events: none;
        visibility: hidden;
    `;
    document.body.appendChild(scrollContainer);

    // Écouter les messages du parent pour mettre à jour la position
    window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "scroll") {
            parentScrollTop = event.data.scrollTop;
            ScrollTrigger.update();
        }
    });
}

/**
 * Calcule le progrès d'un élément basé sur le scroll du parent
 * @param {HTMLElement} element - L'élément à tracker
 * @param {Object} options - Options (start, end en %)
 * @returns {number} - Progrès entre 0 et 1
 */
export function getElementProgress(element, options = {}) {
    if (!element) return 0;

    const {
        startViewport = 90,  // L'élément commence à être visible à 90% du viewport
        endViewport = 50     // L'animation est complète à 50% du viewport
    } = options;

    const rect = element.getBoundingClientRect();
    const elementTop = rect.top;
    const viewportHeight = parentViewportHeight || window.innerHeight;

    // Position de départ (quand l'élément atteint startViewport% du viewport)
    const startPosition = viewportHeight * (startViewport / 100);
    // Position de fin (quand l'élément atteint endViewport% du viewport)
    const endPosition = viewportHeight * (endViewport / 100);

    // Calculer le progrès
    if (elementTop >= startPosition) {
        return 0; // Pas encore commencé
    } else if (elementTop <= endPosition) {
        return 1; // Terminé
    } else {
        // Entre les deux - interpoler
        const progress = (startPosition - elementTop) / (startPosition - endPosition);
        return Math.max(0, Math.min(1, progress));
    }
}
