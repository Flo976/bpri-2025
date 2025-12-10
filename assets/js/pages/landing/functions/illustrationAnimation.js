import { gsap } from "gsap";

/**
 * Animation Drawing pour le SVG IllustrationA
 * - Dessin progressif des lignes
 * - Les points (Vector) apparaissent après leur ligne
 */
export function initIllustrationAnimation() {
    const svgElement = document.querySelector(".section0 .illustration_wrapper > svg");
    const illustration = document.querySelector(".IllustrationA");
    if (!illustration || !svgElement) return;

    // Sélectionner tous les groupes de lignes (rayons)
    const lineGroups = illustration.querySelectorAll('[class^="line"]');

    // Sélectionner les cercles du milieu (paths avec fill dans .middle)
    const middlePaths = illustration.querySelectorAll('.middle path[fill]');

    // Sélectionner les chiffres 2026
    const numberPaths = illustration.querySelectorAll('[class="2026"] path');

    // Préparer les données pour chaque groupe de ligne
    const linesData = [];
    lineGroups.forEach((group, index) => {
        // La ligne principale (path avec stroke directement dans le groupe)
        const linePath = group.querySelector(':scope > path[stroke]');
        // Les points (Vector) - tous les paths dans les sous-groupes .Vector
        const dotPaths = group.querySelectorAll('.Vector path[fill]');

        if (linePath) {
            const length = linePath.getTotalLength();

            // Préparer la ligne pour le drawing
            gsap.set(linePath, {
                strokeDasharray: `${length} ${length}`,
                strokeDashoffset: length,
                opacity: 1
            });

            // Cacher les points
            dotPaths.forEach(dot => {
                gsap.set(dot, { opacity: 0, scale: 0, transformOrigin: "center center" });
            });

            linesData.push({ linePath, dotPaths, length, index });
        }
    });

    // Préparer les cercles du milieu
    middlePaths.forEach(path => {
        gsap.set(path, { opacity: 0 });
    });

    // Préparer les chiffres 2026
    numberPaths.forEach(path => {
        gsap.set(path, { opacity: 0 });
    });

    // Marquer le SVG comme animé
    svgElement.classList.add("animated");

    // Timeline principale
    const tl = gsap.timeline({
        defaults: { ease: "power2.out" }
    });

    // 1. Fade in des cercles du milieu
    tl.to(middlePaths, {
        opacity: 1,
        duration: 1,
        stagger: 0.05
    });

    // 2. Drawing des lignes + apparition des points
    // Créer un ordre aléatoire pour les lignes
    const shuffledLines = [...linesData].sort(() => Math.random() - 0.5);

    shuffledLines.forEach((data, i) => {
        const { linePath, dotPaths } = data;
        const startTime = 0.5 + (i * 0.08); // Délai progressif

        // Dessiner la ligne
        tl.to(linePath, {
            strokeDashoffset: 0,
            duration: 1,
            ease: "power2.out"
        }, startTime);

        // Faire apparaître les points APRÈS la ligne (avec un petit délai)
        if (dotPaths.length > 0) {
            tl.to(dotPaths, {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                stagger: 0.05,
                ease: "back.out(1.7)"
            }, startTime + 0.8); // Apparaît vers la fin du dessin de la ligne
        }
    });

    // 3. Fade in des chiffres 2026
    tl.to(numberPaths, {
        opacity: 1,
        duration: 0.8,
        stagger: 0.1
    }, "-=1");

    return tl;
}

/**
 * Version alternative avec contrôle manuel
 * Permet de rejouer l'animation ou de la contrôler
 */
export function createIllustrationTimeline() {
    const illustration = document.querySelector(".IllustrationA");
    if (!illustration) return null;

    const linePaths = illustration.querySelectorAll('[class^="line"] > path[stroke]');
    const middlePaths = illustration.querySelectorAll('.middle path');

    // Setup initial
    linePaths.forEach(path => {
        const length = path.getTotalLength();
        gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length
        });
    });

    middlePaths.forEach(path => {
        const length = path.getTotalLength();
        gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
            opacity: 0
        });
    });

    // Timeline controlable
    const tl = gsap.timeline({ paused: true });

    tl.to(middlePaths, {
        opacity: 1,
        strokeDashoffset: 0,
        duration: 1.5,
        stagger: 0.1
    })
    .to(linePaths, {
        strokeDashoffset: 0,
        duration: 1.2,
        stagger: { each: 0.08, from: "random" }
    }, "-=0.8");

    return tl;
}
