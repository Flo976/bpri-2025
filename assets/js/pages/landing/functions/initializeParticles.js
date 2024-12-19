import AppParticles from "../classes/AppParticles.js";

/**
 * Calcule une valeur dynamique en fonction de la largeur d'écran.
 * 
 * @param {number} baseValue - La valeur de base utilisée pour le calcul.
 * @param {number} screenWidth - La largeur actuelle de l'écran.
 * @param {number} baseWidth - La largeur de référence pour le calcul (par défaut : 1728).
 * @returns {number} - La valeur ajustée dynamiquement.
 */
function calculateDynamicValue(baseValue, screenWidth, baseWidth = 1728) {
    return screenWidth <= baseWidth
        ? Math.ceil((baseValue * screenWidth) / baseWidth)
        : baseValue;
}

/**
 * Initialise les particules pour chaque section avec des valeurs dynamiques.
 */
function initializeParticles() {
    const screenWidth = window.innerWidth;

    // Définir les paramètres par défaut pour chaque section
    const particleConfigs = {
        section0BackgroundCanvas: {
            dotSize: 8,
            spacing: 25,
            offsetStartTime: 2,
        },
        yearCanvas: {
            dotSize: 4,
            spacing: 8.5,
            offsetStartTime: 1,
        },
        dg_img_canvas: {
            dotSize: 8,
            spacing: 25,
            offsetStartPositionX: 5,
            offsetStartPositionY: 3,
        },
        section2_bg_canvas: {
            dotSize: 8,
            spacing: 25,
        },
    };

    // Adapter les valeurs dynamiquement en fonction de la largeur d'écran
    let baseWidth;
    if (screenWidth <= 480) {
        baseWidth = 480;
        particleConfigs.section0BackgroundCanvas.dotSize = 8;
        particleConfigs.section0BackgroundCanvas.spacing = 25;

        particleConfigs.yearCanvas.dotSize = 4;
        particleConfigs.yearCanvas.spacing = 8.5;

        particleConfigs.dg_img_canvas.dotSize = 8;
        particleConfigs.dg_img_canvas.spacing = 25;
        particleConfigs.dg_img_canvas.offsetStartPositionX = 5;
        particleConfigs.dg_img_canvas.offsetStartPositionY = 3;

        particleConfigs.section2_bg_canvas.dotSize = 8;
        particleConfigs.section2_bg_canvas.spacing = 25;
    } else if (screenWidth <= 768) {
        baseWidth = 768;
        particleConfigs.section0BackgroundCanvas.dotSize = 6;
        particleConfigs.section0BackgroundCanvas.spacing = 15;

        particleConfigs.yearCanvas.dotSize = 4;
        particleConfigs.yearCanvas.spacing = 8.5;

        particleConfigs.dg_img_canvas.dotSize = 6;
        particleConfigs.dg_img_canvas.spacing = 15;
        particleConfigs.dg_img_canvas.offsetStartPositionX = 3;
        particleConfigs.dg_img_canvas.offsetStartPositionY = 8;

        particleConfigs.section2_bg_canvas.dotSize = 6;
        particleConfigs.section2_bg_canvas.spacing = 15;
    } else if (screenWidth <= 991) {
        baseWidth = 991;
        particleConfigs.section0BackgroundCanvas.dotSize = 6;
        particleConfigs.section0BackgroundCanvas.spacing = 15;

        particleConfigs.yearCanvas.dotSize = 3;
        particleConfigs.yearCanvas.spacing = 6.5;

        particleConfigs.dg_img_canvas.dotSize = 6;
        particleConfigs.dg_img_canvas.spacing = 15;
        particleConfigs.dg_img_canvas.offsetStartPositionX = 3;
        particleConfigs.dg_img_canvas.offsetStartPositionY = 8;

        particleConfigs.section2_bg_canvas.dotSize = 6;
        particleConfigs.section2_bg_canvas.spacing = 15;
    } else {
        baseWidth = 1728;
    }

    // Initialiser chaque instance de particules
    Object.entries(particleConfigs).forEach(([canvasId, config]) => {
        const adjustedConfig = Object.fromEntries(
            Object.entries(config).map(([key, value]) => [
                key,
                typeof value === "number" ? calculateDynamicValue(value, screenWidth, baseWidth) : value,
            ])
        );

        window[`${canvasId}Particle`] = new AppParticles({
            canvasId,
            ...adjustedConfig,
        });
        window[`${canvasId}Particle`].animate();
    });
}

// Exporter la fonction pour être utilisée ailleurs
export { initializeParticles };
