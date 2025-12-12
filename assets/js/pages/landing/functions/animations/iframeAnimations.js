import { gsap } from "gsap";

/**
 * Système d'animation basé sur la position viewport
 * Fonctionne dans un iframe avec iframeResizer
 *
 * Utilise parentIFrame.getPageInfo() pour récupérer les infos de scroll du parent
 */

// Compensation pour le mode iframe (le header du parent décale les seuils)
const IFRAME_START_COMPENSATION = 0;

class ViewportAnimationController {
    constructor() {
        this.animations = [];
        this.isRunning = false;
        this.rafId = null;
        // Infos du parent (via iframeResizer)
        this.parentInfo = {
            scrollTop: 0,
            offsetTop: 0,
            windowHeight: window.innerHeight
        };
        this.parentIFrameReady = false;
        // Callbacks appelés à chaque update
        this.updateCallbacks = [];
    }

    /**
     * Enregistre un callback appelé à chaque update avec parentInfo
     * @param {Function} callback - Fonction(parentInfo) appelée à chaque scroll
     * @returns {Function} - Fonction pour se désinscrire
     */
    onUpdate(callback) {
        this.updateCallbacks.push(callback);
        // Retourner une fonction de désinscription
        return () => {
            const index = this.updateCallbacks.indexOf(callback);
            if (index > -1) this.updateCallbacks.splice(index, 1);
        };
    }

    /**
     * Ajoute une animation liée au viewport
     * @param {Object} config - Configuration de l'animation
     */
    add(config) {
        const {
            trigger,           // Élément déclencheur
            targets,           // Éléments à animer (peut être un array)
            from,              // Valeurs de départ
            to,                // Valeurs d'arrivée
            start = 90,        // Début: quand le haut de l'élément atteint X% du viewport parent
            end = 50,          // Fin: quand le haut de l'élément atteint X% du viewport parent
            onEnter = null,    // Callback quand on entre dans la zone
            onLeave = null,    // Callback quand on sort par le bas
            onEnterBack = null,// Callback quand on revient par le haut
            onLeaveBack = null,// Callback quand on sort par le haut
            ease = "none"
        } = config;

        if (!trigger) return;

        // Appliquer la compensation pour aligner avec le mode sans iframe
        const adjustedStart = start + IFRAME_START_COMPENSATION;
        const adjustedEnd = end + IFRAME_START_COMPENSATION;

        const animation = {
            trigger,
            targets: Array.isArray(targets) ? targets : [targets],
            from,
            to,
            start: adjustedStart / 100,
            end: adjustedEnd / 100,
            onEnter,
            onLeave,
            onEnterBack,
            onLeaveBack,
            ease,
            lastProgress: -1,
            hasEntered: false,
            hasLeft: false
        };

        // Appliquer les valeurs initiales
        if (from) {
            animation.targets.forEach(target => {
                if (target) gsap.set(target, from);
            });
        }

        this.animations.push(animation);

        // Démarrer la boucle si pas encore active
        if (!this.isRunning) {
            this.start();
        }

        return animation;
    }

    /**
     * Calcule le progrès d'un élément en utilisant les infos du parent
     */
    calculateProgress(element, startRatio, endRatio) {
        const rect = element.getBoundingClientRect();
        const { scrollTop, offsetTop, windowHeight } = this.parentInfo;

        // Position de l'élément dans le contexte du parent
        // offsetTop = position de l'iframe dans le parent
        // rect.top = position de l'élément dans l'iframe
        // scrollTop = position de scroll du parent
        const topInParent = offsetTop + rect.top - scrollTop;

        // Positions de seuil dans le viewport du parent
        const startPosition = windowHeight * startRatio;
        const endPosition = windowHeight * endRatio;

        if (topInParent >= startPosition) {
            return 0;
        } else if (topInParent <= endPosition) {
            return 1;
        } else {
            const progress = (startPosition - topInParent) / (startPosition - endPosition);
            return Math.max(0, Math.min(1, progress));
        }
    }

    /**
     * Met à jour toutes les animations avec les infos du parent
     */
    updateWithParentInfo(props) {
        // Mettre à jour les infos du parent
        this.parentInfo = {
            scrollTop: props.scrollTop || 0,
            offsetTop: props.offsetTop || 0,
            windowHeight: props.windowHeight || props.clientHeight || window.innerHeight
        };

        // Appeler les callbacks enregistrés
        this.updateCallbacks.forEach(cb => cb(this.parentInfo));

        // Mettre à jour les animations
        this.animations.forEach(anim => {
            const progress = this.calculateProgress(anim.trigger, anim.start, anim.end);

            // Détecter les transitions de zone
            if (progress > 0 && !anim.hasEntered) {
                anim.hasEntered = true;
                anim.hasLeft = false;
                if (anim.onEnter) anim.onEnter();
            } else if (progress === 0 && anim.hasEntered) {
                anim.hasEntered = false;
                if (anim.onLeaveBack) anim.onLeaveBack();
            } else if (progress === 1 && !anim.hasLeft) {
                anim.hasLeft = true;
                if (anim.onLeave) anim.onLeave();
            } else if (progress < 1 && anim.hasLeft) {
                anim.hasLeft = false;
                if (anim.onEnterBack) anim.onEnterBack();
            }

            // Ne mettre à jour que si le progrès a changé significativement
            if (Math.abs(progress - anim.lastProgress) > 0.001) {
                anim.lastProgress = progress;

                // Interpoler les valeurs
                anim.targets.forEach(target => {
                    if (!target) return;

                    const animatedValues = {};

                    for (const prop in anim.to) {
                        const fromValue = anim.from ? anim.from[prop] : 0;
                        const toValue = anim.to[prop];

                        // Gérer les valeurs numériques
                        if (typeof toValue === "number") {
                            animatedValues[prop] = fromValue + (toValue - fromValue) * progress;
                        }
                        // Gérer les pourcentages (ex: "100%" -> 0)
                        else if (typeof toValue === "string" && toValue.includes("%")) {
                            const fromNum = parseFloat(fromValue) || 0;
                            const toNum = parseFloat(toValue) || 0;
                            animatedValues[prop] = fromNum + (toNum - fromNum) * progress + "%";
                        }
                    }

                    // Utiliser gsap.to avec une très courte durée
                    // pour garder la fluidité tout en préservant les décalages
                    gsap.to(target, {
                        ...animatedValues,
                        duration: 0.05,
                        ease: "none",
                        overwrite: "auto"
                    });
                });
            }
        });
    }

    /**
     * Démarre la boucle d'animation avec parentIFrame
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        const self = this;
        let attempts = 0;
        const maxAttempts = 5; // 5 tentatives x 100ms = 500ms max

        // Attendre que parentIFrame soit disponible
        const initWhenReady = () => {
            if (window.parentIFrame) {
                console.log("ViewportController: parentIFrame détecté");
                self.parentIFrameReady = true;

                // Utiliser getPageInfo (v3.x) ou getParentProps (v4.x)
                const getProps = window.parentIFrame.getPageInfo || window.parentIFrame.getParentProps;

                if (getProps) {
                    // Boucle d'animation
                    const tick = () => {
                        getProps((props) => {
                            self.updateWithParentInfo(props);
                        });
                        self.rafId = requestAnimationFrame(tick);
                    };
                    tick();
                } else {
                    console.warn("ViewportController: getPageInfo/getParentProps non disponible");
                    // Fallback sur getBoundingClientRect simple
                    self.startFallback();
                }
            } else {
                attempts++;
                if (attempts >= maxAttempts) {
                    // Pas dans un iframe, utiliser le fallback
                    console.log("ViewportController: parentIFrame non trouvé, utilisation du mode standalone");
                    self.startFallback();
                } else {
                    // Réessayer après un court délai
                    setTimeout(initWhenReady, 100);
                }
            }
        };

        initWhenReady();
    }

    /**
     * Fallback si parentIFrame n'est pas disponible
     * (mode standalone ou autre contexte)
     *
     * Note: En mode standalone, getBoundingClientRect().top est DÉJÀ relatif
     * au viewport, donc on passe scrollTop: 0 et offsetTop: 0 pour que
     * le calcul topInParent = offsetTop + rect.top - scrollTop = rect.top
     */
    startFallback() {
        console.log("ViewportController: Mode fallback (sans parentIFrame)");

        const self = this;

        const loop = () => {
            // En standalone, rect.top est déjà relatif au viewport
            // donc on ne soustrait pas scrollTop (contrairement au mode iframe)
            self.updateWithParentInfo({
                scrollTop: 0,  // rect.top est déjà viewport-relative
                offsetTop: 0,
                windowHeight: window.innerHeight
            });
            self.rafId = requestAnimationFrame(loop);
        };

        loop();
    }

    /**
     * Arrête la boucle d'animation
     */
    stop() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Nettoie toutes les animations
     */
    clear() {
        this.stop();
        this.animations = [];
    }
}

// Instance globale
export const viewportController = new ViewportAnimationController();

/**
 * Helper pour créer une animation de stroke draw
 */
export function createStrokeAnimation(controller, config) {
    const { trigger, strokes, start = 90, end = 50, onComplete } = config;

    strokes.forEach((stroke, index) => {
        if (!stroke || !stroke.getTotalLength) return;

        const length = stroke.getTotalLength();

        // Setup initial
        gsap.set(stroke, {
            strokeDasharray: `${length} ${length}`,
            strokeDashoffset: length,
            opacity: 0
        });

        controller.add({
            trigger,
            targets: stroke,
            from: { strokeDashoffset: length, opacity: 0 },
            to: { strokeDashoffset: 0, opacity: 1 },
            start: start - (index * 2), // Léger décalage entre les strokes
            end: end - (index * 2),
            onLeave: index === strokes.length - 1 ? onComplete : null
        });
    });
}

/**
 * Helper pour créer une animation de caractères
 */
export function createCharsAnimation(controller, config) {
    const { trigger, chars, start = 90, end = 50 } = config;

    chars.forEach((char, index) => {
        const delay = index * 0.5; // Décalage progressif

        controller.add({
            trigger,
            targets: char,
            from: { y: 100, opacity: 0 },
            to: { y: 0, opacity: 1 },
            start: start - delay,
            end: end - delay
        });
    });
}

export default ViewportAnimationController;
