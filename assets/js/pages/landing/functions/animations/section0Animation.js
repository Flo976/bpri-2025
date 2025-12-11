import { gsap } from "gsap";

/**
 * Animation de la Section 0 (Hero)
 *
 * Séquence:
 * 1. Sections fade-in
 * 2. Logo fade-in
 * 3. Caption fade-in
 * 4. SVG Illustration:
 *    - Cercles middle (strokes)
 *    - Lignes drawing (ordre aléatoire)
 *    - Dots apparition (après leur ligne)
 *    - Chiffres 2026 fade-in
 * 5. Rotations continues des cercles
 */
export function initSection0Animation() {
    const section = document.querySelector(".section0");
    if (!section) return null;

    const sections = document.querySelector(".sections");
    const contentLogo = section.querySelector(".content_logo");
    const contentCaption = section.querySelector(".content_caption");
    const contentIllustration = section.querySelector(".content_illustration");
    const illustration = section.querySelector(".illustration_wrapper svg");

    if (!sections || !illustration) return null;

    // Éléments SVG
    const middleOuter = illustration.querySelector(".hero-illustration__middle_outer");
    const middleInner = illustration.querySelector(".hero-illustration__middle_inner");
    const lineGroups = illustration.querySelectorAll('[class^="hero-illustration__line"]');
    const numberPaths = illustration.querySelectorAll(".hero-illustration__2026 path");

    // ========================================
    // Setup initial - tout caché
    // ========================================
    gsap.set(sections, { opacity: 0 });
    // contentLogo et contentCaption sont gérés par CSS (classe displayin)
    gsap.set(numberPaths, { opacity: 0 });

    // Préparer les données pour chaque ligne
    const linesData = [];
    lineGroups.forEach((group) => {
        // Path principal de la ligne (avec stroke)
        const linePath = group.querySelector(":scope > path.hero-illustration__stroke");
        // Tous les dots de cette ligne
        const dots = group.querySelectorAll(".hero-illustration__dot");

        if (linePath) {
            const length = linePath.getTotalLength();

            // Setup stroke pour drawing
            gsap.set(linePath, {
                strokeDasharray: `${length} ${length}`,
                strokeDashoffset: length,
                opacity: 0
            });

            // Setup dots - cachés
            dots.forEach(dot => {
                gsap.set(dot, { opacity: 0, scale: 1, transformOrigin: "center center" });
            });

            linesData.push({ linePath, dots, length });
        }
    });

    // Préparer les strokes des cercles middle (séparés pour sens différent)
    const middleOuterStrokes = middleOuter ? middleOuter.querySelectorAll("path.hero-illustration__stroke") : [];
    const middleInnerStrokes = middleInner ? middleInner.querySelectorAll("path.hero-illustration__stroke") : [];

    // Middle outer: sens horaire (offset positif → 0)
    middleOuterStrokes.forEach(path => {
        if (path.getTotalLength) {
            const length = path.getTotalLength();
            gsap.set(path, {
                strokeDasharray: `${length} ${length}`,
                strokeDashoffset: -length,
                opacity: 0
            });
        }
    });

    // Middle inner: sens anti-horaire (offset négatif → 0)
    middleInnerStrokes.forEach(path => {
        if (path.getTotalLength) {
            const length = path.getTotalLength();
            gsap.set(path, {
                strokeDasharray: `${length} ${length}`,
                strokeDashoffset: -length,
                opacity: 0
            });
        }
    });

    // ========================================
    // Timeline principale
    // ========================================
    const tl = gsap.timeline({
        defaults: { ease: "linear" }
    });

    // 1. Sections fade-in
    tl.to(sections, {
        opacity: 1,
        duration: 0.5
    }, 1);

    // 2. Logo + Caption fade-in (CSS transition via classe displayin)
    tl.call(() => {
        contentLogo.classList.add("displayin");
        contentCaption.classList.add("displayin");
    }, null, 2);

    // 3. Illustration fade-in (CSS) - après le titre
    tl.call(() => {
        contentIllustration.classList.add("displayin");
    }, null, 3);

    // 3b. Rotations (CSS) - après que l'illustration soit visible (3s + 1s transition)
    tl.call(() => {
        illustration.classList.add("anim-rotate");
    }, null, 3.5);

    // 4. Cercles du middle - stroke drawing (après illustration visible à 4s)
    // 4a. Middle inner: sens anti-horaire (dessine en premier)
    tl.to(middleInnerStrokes, {
        strokeDashoffset: 0,
        duration: 1.5,
        stagger: {
            each: 0.15,
            onComplete: function() {
                this.targets()[0].classList.add("glowing");
            }
        },
        opacity: 1,
        ease: "linear"
    }, 4);

    // 4b. Middle outer: sens horaire (dessine après)
    tl.to(middleOuterStrokes, {
        strokeDashoffset: 0,
        duration: 1.5,
        stagger: {
            each: 0.15,
            onComplete: function() {
                this.targets()[0].classList.add("glowing");
            }
        },
        opacity: 1,
        ease: "linear"
    }, 4);

    // 5. Lignes extérieures - drawing avec ordre aléatoire
    //const shuffledLines = [...linesData].sort(() => Math.random() - 0.5);
    const shuffledLines = [...linesData];
    const linesStartTime = 4.5; // Après les cercles du middle

    shuffledLines.forEach((data, i) => {
        const { linePath, dots } = data;
        const startTime = linesStartTime + (i * 0.06);

        // Dessiner la ligne
        tl.to(linePath, {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 1,
            ease: "ease",
            onComplete: () => {
                // Ajouter la classe glowing après le dessin
                linePath.classList.add("glowing");
            }
        }, startTime);

        // Apparition des dots après la ligne
        dots.forEach((dot, _i) => {
            tl.to(dot, {
                opacity: 1,
                scale: 1,
                duration: 1,
                stagger: 0.05,
                ease: "ease",
                onComplete: () => {
                    // Ajouter la classe pulsing après apparition
                    dot.classList.add("pulsing");
                }
            }, startTime + 0.7 + (_i * 0.25));
        });
    });

    // 6. Chiffres 2026 fade-in
    tl.to(numberPaths, {
        opacity: 1,
        duration: 1,
        stagger: {
            each: 0.5,
            onComplete: function() {
                // Ajouter la classe glowing à chaque chiffre après son apparition
                this.targets()[0].classList.add("glowing");
            }
        },
        ease: "ease"
    }, "-=2.5");

    return tl;
}
