import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitTextIntoChars } from "./textReveal.js";
import { viewportController } from "./iframeAnimations.js";

gsap.registerPlugin(ScrollTrigger);

// ============================================
// Détection du mode iframe
// ============================================
const isInIframe = (() => {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
})();

// ============================================
// Types d'animations disponibles
// ============================================
const ANIMATION_TYPES = {
    STROKE: "stroke",
    DOT: "dot",
    ARC: "arc",
    FADE_SCALE: "fadeScale",
    FADE_UP: "fadeUp",
    TEXT_REVEAL: "textReveal"
};

// ============================================
// Configuration par défaut pour chaque type
// ============================================
const DEFAULT_CONFIGS = {
    [ANIMATION_TYPES.STROKE]: {
        start: 95,
        end: 75,
        staggerOffset: 3
    },
    [ANIMATION_TYPES.DOT]: {
        start: 95,
        end: 75
    },
    [ANIMATION_TYPES.ARC]: {
        start: 95,
        end: 75,
        staggerOffset: 3
    },
    [ANIMATION_TYPES.FADE_SCALE]: {
        start: 95,
        end: 75,
        fromScale: 0.8
    },
    [ANIMATION_TYPES.FADE_UP]: {
        start: 95,
        end: 75,
        fromY: 20
    },
    [ANIMATION_TYPES.TEXT_REVEAL]: {
        start: 95,
        end: 75,
        charOffset: 0.3 // Offset par caractère pour l'effet stagger
    }
};

// ============================================
// Classe principale AnimationFactory
// ============================================
class AnimationFactory {
    constructor(sectionSelector) {
        this.section = document.querySelector(sectionSelector);
        this.triggers = [];
        this.mode = isInIframe ? "iframe" : "normal";

        if (this.section) {
            console.log(`AnimationFactory: ${sectionSelector} - Mode ${this.mode}`);
        }
    }

    /**
     * Crée une animation de type stroke (ligne SVG)
     * Supporte un paramètre `container` pour les éléments répétés
     */
    createStrokeAnimation(config) {
        const { target, trigger, container, start, end, staggerOffset, reverse } = {
            ...DEFAULT_CONFIGS[ANIMATION_TYPES.STROKE],
            reverse: false,
            ...config
        };

        // Si container est défini, appliquer l'animation à chaque container
        if (container) {
            const containers = this.section.querySelectorAll(container);
            containers.forEach(containerEl => {
                const triggerEl = trigger ? containerEl.querySelector(trigger) : containerEl;
                const strokes = containerEl.querySelectorAll(target);

                if (!triggerEl || strokes.length === 0) return;

                // Setup initial
                strokes.forEach(stroke => {
                    if (!stroke.getTotalLength) return;
                    const length = stroke.getTotalLength();
                    gsap.set(stroke, {
                        strokeDasharray: `${length} ${length}`,
                        strokeDashoffset: reverse ? -length : length,
                        opacity: 0
                    });
                });

                if (this.mode === "iframe") {
                    strokes.forEach((stroke, index) => {
                        if (!stroke.getTotalLength) return;
                        const length = stroke.getTotalLength();

                        viewportController.add({
                            trigger: triggerEl,
                            targets: stroke,
                            from: { strokeDashoffset: reverse ? -length : length, opacity: 0 },
                            to: { strokeDashoffset: 0, opacity: 1 },
                            start: start - (index * staggerOffset),
                            end: end - (index * staggerOffset)
                        });
                    });
                } else {
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: triggerEl,
                            start: `top ${start}%`,
                            end: `top ${end}%`,
                            scrub: 0.5
                        }
                    });

                    tl.to(strokes, {
                        strokeDashoffset: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.2,
                        ease: "none"
                    });

                    this.triggers.push(tl);
                }
            });
            return;
        }

        const triggerEl = this.section.querySelector(trigger);
        const strokes = this.section.querySelectorAll(target);

        if (!triggerEl || strokes.length === 0) return;

        // Setup initial
        strokes.forEach(stroke => {
            if (!stroke.getTotalLength) return;
            const length = stroke.getTotalLength();
            gsap.set(stroke, {
                strokeDasharray: `${length} ${length}`,
                strokeDashoffset: reverse ? -length : length,
                opacity: 0
            });
        });

        if (this.mode === "iframe") {
            strokes.forEach((stroke, index) => {
                if (!stroke.getTotalLength) return;
                const length = stroke.getTotalLength();

                viewportController.add({
                    trigger: triggerEl,
                    targets: stroke,
                    from: { strokeDashoffset: reverse ? -length : length, opacity: 0 },
                    to: { strokeDashoffset: 0, opacity: 1 },
                    start: start - (index * staggerOffset),
                    end: end - (index * staggerOffset)
                });
            });
        } else {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: triggerEl,
                    start: `top ${start}%`,
                    end: `top ${end}%`,
                    scrub: 0.5
                }
            });

            tl.to(strokes, {
                strokeDashoffset: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                ease: "none"
            });

            this.triggers.push(tl);
        }
    }

    /**
     * Crée une animation de type dot (cercle SVG)
     * Supporte un paramètre `container` pour les éléments répétés
     */
    createDotAnimation(config) {
        const { target, trigger, container, start, end } = {
            ...DEFAULT_CONFIGS[ANIMATION_TYPES.DOT],
            ...config
        };

        // Si container est défini, appliquer l'animation à chaque container
        if (container) {
            const containers = this.section.querySelectorAll(container);
            containers.forEach(containerEl => {
                const dot = containerEl.querySelector(target);
                const triggerEl = trigger ? containerEl.querySelector(trigger) : dot;

                if (!triggerEl || !dot) return;

                gsap.set(dot, { opacity: 0 });

                if (this.mode === "iframe") {
                    viewportController.add({
                        trigger: triggerEl,
                        targets: dot,
                        from: { opacity: 0 },
                        to: { opacity: 1 },
                        start,
                        end
                    });
                } else {
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: triggerEl,
                            start: `top ${start}%`,
                            end: `top ${end}%`,
                            scrub: 0.5
                        }
                    });

                    tl.to(dot, {
                        opacity: 1,
                        duration: 0.5,
                        ease: "none"
                    });

                    this.triggers.push(tl);
                }
            });
            return;
        }

        const triggerEl = this.section.querySelector(trigger);
        const dot = this.section.querySelector(target);

        if (!triggerEl || !dot) return;

        // Setup initial
        gsap.set(dot, { opacity: 0 });

        if (this.mode === "iframe") {
            viewportController.add({
                trigger: triggerEl,
                targets: dot,
                from: { opacity: 0 },
                to: { opacity: 1 },
                start,
                end
            });
        } else {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: triggerEl,
                    start: `top ${start}%`,
                    end: `top ${end}%`,
                    scrub: 0.5
                }
            });

            tl.to(dot, {
                opacity: 1,
                duration: 0.5,
                ease: "none"
            });

            this.triggers.push(tl);
        }
    }

    /**
     * Crée une animation de type arc (cercle média avec rotation)
     * Supporte un paramètre `container` pour les éléments répétés
     */
    createArcAnimation(config) {
        const { target, trigger, container, start, end, staggerOffset, rotate } = {
            ...DEFAULT_CONFIGS[ANIMATION_TYPES.ARC],
            rotate: false,
            ...config
        };

        // Si container est défini, appliquer l'animation à chaque container
        if (container) {
            const containers = this.section.querySelectorAll(container);
            containers.forEach(containerEl => {
                this._createSingleArcAnimation(containerEl, { target, trigger, start, end, staggerOffset, rotate });
            });
            return;
        }

        const triggerEl = this.section.querySelector(trigger);
        const arcSvg = triggerEl?.querySelector("svg");
        const strokes = this.section.querySelectorAll(target);

        if (!triggerEl || strokes.length === 0) return;

        // Setup initial
        strokes.forEach(stroke => {
            if (!stroke.getTotalLength) return;
            const length = stroke.getTotalLength();
            gsap.set(stroke, {
                strokeDasharray: `${length} ${length}`,
                strokeDashoffset: length,
                opacity: 0
            });
        });

        const onEnterCallback = rotate && arcSvg ? () => arcSvg.classList.add("anim-rotate") : null;
        const onLeaveBackCallback = rotate && arcSvg ? () => arcSvg.classList.remove("anim-rotate") : null;

        if (this.mode === "iframe") {
            strokes.forEach((stroke, index) => {
                if (!stroke.getTotalLength) return;
                const length = stroke.getTotalLength();

                viewportController.add({
                    trigger: triggerEl,
                    targets: stroke,
                    from: { strokeDashoffset: length, opacity: 0 },
                    to: { strokeDashoffset: 0, opacity: 1 },
                    start: start - (index * staggerOffset),
                    end: end - (index * staggerOffset),
                    onEnter: index === 0 ? onEnterCallback : null,
                    onLeaveBack: index === 0 ? onLeaveBackCallback : null
                });
            });
        } else {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: triggerEl,
                    start: `top ${start}%`,
                    end: `top ${end}%`,
                    scrub: 0.5,
                    onEnter: onEnterCallback,
                    onLeaveBack: onLeaveBackCallback
                }
            });

            tl.to(strokes, {
                strokeDashoffset: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.1,
                ease: "none"
            });

            this.triggers.push(tl);
        }
    }

    /**
     * Helper: Crée une animation arc pour un container spécifique
     */
    _createSingleArcAnimation(containerEl, { target, trigger, start, end, staggerOffset, rotate }) {
        const triggerEl = trigger ? containerEl.querySelector(trigger) : containerEl;
        const arcSvg = containerEl.querySelector("svg");
        const strokes = containerEl.querySelectorAll(target || "[class*='__stroke']");

        if (!triggerEl || strokes.length === 0) return;

        // Setup initial
        strokes.forEach(stroke => {
            if (!stroke.getTotalLength) return;
            const length = stroke.getTotalLength();
            gsap.set(stroke, {
                strokeDasharray: `${length} ${length}`,
                strokeDashoffset: length,
                opacity: 0
            });
        });

        const onEnterCallback = rotate && arcSvg ? () => arcSvg.classList.add("anim-rotate") : null;
        const onLeaveBackCallback = rotate && arcSvg ? () => arcSvg.classList.remove("anim-rotate") : null;

        if (this.mode === "iframe") {
            strokes.forEach((stroke, index) => {
                if (!stroke.getTotalLength) return;
                const length = stroke.getTotalLength();

                viewportController.add({
                    trigger: triggerEl,
                    targets: stroke,
                    from: { strokeDashoffset: length, opacity: 0 },
                    to: { strokeDashoffset: 0, opacity: 1 },
                    start: start - (index * staggerOffset),
                    end: end - (index * staggerOffset),
                    onEnter: index === 0 ? onEnterCallback : null,
                    onLeaveBack: index === 0 ? onLeaveBackCallback : null
                });
            });
        } else {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: triggerEl,
                    start: `top ${start}%`,
                    end: `top ${end}%`,
                    scrub: 0.5,
                    onEnter: onEnterCallback,
                    onLeaveBack: onLeaveBackCallback
                }
            });

            tl.to(strokes, {
                strokeDashoffset: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.1,
                ease: "none"
            });

            this.triggers.push(tl);
        }
    }

    /**
     * Crée une animation de type fadeScale (opacity + scale)
     * Supporte un paramètre `container` pour les éléments répétés
     */
    createFadeScaleAnimation(config) {
        const { target, trigger, container, start, end, fromScale } = {
            ...DEFAULT_CONFIGS[ANIMATION_TYPES.FADE_SCALE],
            ...config
        };

        // Si container est défini, appliquer l'animation à chaque container
        if (container) {
            const containers = this.section.querySelectorAll(container);
            containers.forEach(containerEl => {
                const triggerEl = trigger ? containerEl.querySelector(trigger) : containerEl;
                const element = containerEl.querySelector(target);

                if (!triggerEl || !element) return;

                gsap.set(element, { opacity: 0, scale: fromScale });

                if (this.mode === "iframe") {
                    viewportController.add({
                        trigger: triggerEl,
                        targets: element,
                        from: { opacity: 0, scale: fromScale },
                        to: { opacity: 1, scale: 1 },
                        start,
                        end
                    });
                } else {
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: triggerEl,
                            start: `top ${start}%`,
                            end: `top ${end}%`,
                            scrub: 0.5
                        }
                    });

                    tl.to(element, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.8,
                        ease: "none"
                    });

                    this.triggers.push(tl);
                }
            });
            return;
        }

        const triggerEl = this.section.querySelector(trigger);
        const element = this.section.querySelector(target);

        if (!triggerEl || !element) return;

        // Setup initial
        gsap.set(element, { opacity: 0, scale: fromScale });

        if (this.mode === "iframe") {
            viewportController.add({
                trigger: triggerEl,
                targets: element,
                from: { opacity: 0, scale: fromScale },
                to: { opacity: 1, scale: 1 },
                start,
                end
            });
        } else {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: triggerEl,
                    start: `top ${start}%`,
                    end: `top ${end}%`,
                    scrub: 0.5
                }
            });

            tl.to(element, {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "none"
            });

            this.triggers.push(tl);
        }
    }

    /**
     * Crée une animation de type fadeUp (opacity + translateY)
     */
    createFadeUpAnimation(config) {
        const { target, trigger, start, end, fromY } = {
            ...DEFAULT_CONFIGS[ANIMATION_TYPES.FADE_UP],
            ...config
        };

        const triggerEl = this.section.querySelector(trigger || target);
        const element = this.section.querySelector(target);

        if (!triggerEl || !element) return;

        // Setup initial
        gsap.set(element, { opacity: 0, y: fromY });

        if (this.mode === "iframe") {
            viewportController.add({
                trigger: triggerEl,
                targets: element,
                from: { opacity: 0, y: fromY },
                to: { opacity: 1, y: 0 },
                start,
                end
            });
        } else {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: triggerEl,
                    start: `top ${start}%`,
                    end: `top ${end}%`,
                    scrub: 0.5
                }
            });

            tl.to(element, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "none"
            });

            this.triggers.push(tl);
        }
    }

    /**
     * Helper: Crée l'animation TEXT_REVEAL pour iframe
     * Simule le stagger GSAP avec offset sur START et END pour créer l'effet vague
     * L'offset total est limité pour que tous les caractères restent dans le viewport
     */
    _createIframeTextReveal(triggerEl, chars, { start, end, charOffset }) {
        const totalChars = chars.length;
        if (totalChars === 0) return;

        // Limiter l'offset TOTAL à 15% du viewport maximum
        // Cela garantit que même le dernier caractère est visible
        const maxTotalOffset = 15;

        // Calculer l'offset par caractère en fonction du nombre total
        // Pour 10 chars: 15/9 = 1.67% par char (effet vague visible)
        // Pour 100 chars: 15/99 = 0.15% par char (effet plus subtil mais tous visibles)
        const perCharOffset = totalChars > 1 ? maxTotalOffset / (totalChars - 1) : 0;

        chars.forEach((char, index) => {
            const offset = index * perCharOffset;
            const isLastChar = index === totalChars - 1;

            viewportController.add({
                trigger: triggerEl,
                targets: char,
                from: { y: 100, opacity: 0 },
                to: { y: 0, opacity: 1 },
                start: start - offset,
                end: end - offset,
                // Nettoyer les styles quand le dernier caractère termine
                onLeave: isLastChar ? () => {
                    chars.forEach(c => {
                        c.style.willChange = "auto";
                        c.style.transform = "none";
                        c.style.opacity = "1";
                    });
                } : null
            });
        });
    }

    /**
     * Crée une animation de type textReveal (lettre par lettre)
     * Boucle automatiquement sur tous les éléments correspondant au sélecteur
     * Chaque élément est son propre trigger
     */
    createTextRevealAnimation(config) {
        const { target, trigger, start, end, charOffset } = {
            ...DEFAULT_CONFIGS[ANIMATION_TYPES.TEXT_REVEAL],
            ...config
        };

        // Récupérer tous les éléments correspondant au sélecteur
        const elements = this.section.querySelectorAll(target);

        elements.forEach(element => {
            // Chaque élément est son propre trigger (sauf si trigger est défini)
            const triggerEl = trigger ? this.section.querySelector(trigger) : element;

            if (!triggerEl || !element) return;

            const chars = splitTextIntoChars(element);
            if (chars.length === 0) return;

            if (this.mode === "iframe") {
                this._createIframeTextReveal(triggerEl, chars, { start, end, charOffset });
            } else {
                // Flag pour tracker si le nettoyage a été fait
                let cleaned = false;

                const cleanupStyles = () => {
                    if (cleaned) return;
                    cleaned = true;
                    chars.forEach(char => {
                        // Supprimer willChange pour éviter les problèmes de rendu
                        char.style.willChange = "auto";
                        // Forcer transform à none pour éviter les valeurs résiduelles
                        char.style.transform = "none";
                        char.style.opacity = "1";
                    });
                };

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: triggerEl,
                        start: `top ${start}%`,
                        end: `top ${end}%`,
                        scrub: 0.3,
                        // Nettoyer quand on sort de la zone (animation terminée)
                        onLeave: cleanupStyles,
                        // Réinitialiser le flag si on revient en arrière
                        onEnterBack: () => { cleaned = false; }
                    }
                });

                tl.to(chars, {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.02,
                    ease: "none",
                    force3D: false // Éviter les matrix3d pour un rendu plus propre
                });

                this.triggers.push(tl);
            }
        });
    }

    /**
     * Crée les animations à partir d'une configuration
     */
    createFromConfig(animations) {
        if (!this.section) return null;

        animations.forEach(anim => {
            switch (anim.type) {
                case ANIMATION_TYPES.STROKE:
                    this.createStrokeAnimation(anim);
                    break;
                case ANIMATION_TYPES.DOT:
                    this.createDotAnimation(anim);
                    break;
                case ANIMATION_TYPES.ARC:
                    this.createArcAnimation(anim);
                    break;
                case ANIMATION_TYPES.FADE_SCALE:
                    this.createFadeScaleAnimation(anim);
                    break;
                case ANIMATION_TYPES.FADE_UP:
                    this.createFadeUpAnimation(anim);
                    break;
                case ANIMATION_TYPES.TEXT_REVEAL:
                    this.createTextRevealAnimation(anim);
                    break;
                default:
                    console.warn(`AnimationFactory: Type inconnu "${anim.type}"`);
            }
        });

        return this.mode === "iframe" ? viewportController : this.triggers;
    }
}

// ============================================
// Fonction helper pour créer les animations
// ============================================
export function createSectionAnimations(config) {
    const { section, animations } = config;
    const factory = new AnimationFactory(section);
    return factory.createFromConfig(animations);
}

// Export des types pour utilisation externe
export { ANIMATION_TYPES, AnimationFactory };
