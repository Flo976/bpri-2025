import { createSectionAnimations, ANIMATION_TYPES } from "./animationFactory.js";

/**
 * Configuration des animations pour Section 2
 *
 * Structure de la section:
 * - Title (text reveal)
 * - Description (text reveal)
 * - Media items répétés:
 *   - Arc (stroke draw + rotation)
 *   - Content (fade scale)
 *   - Title (text reveal)
 * - Footer curved divider:
 *   - Curved strokes
 *   - Line strokes + dots (répétés)
 */
const SECTION2_CONFIG = {
    section: ".section2",
    animations: [
        // Title text reveal
        {
            type: ANIMATION_TYPES.TEXT_REVEAL,
            target: ".content_text .title",
        },

        // Description text reveal
        {
            type: ANIMATION_TYPES.TEXT_REVEAL,
            target: ".content_text .description",
        },

        // Media items - Arc avec rotation (pour chaque .media_item)
        {
            type: ANIMATION_TYPES.ARC,
            container: ".media_item",
            target: "[class*='__stroke']",
            rotate: true,
        },

        // Media items - Content fade scale (pour chaque .media_item)
        {
            type: ANIMATION_TYPES.FADE_SCALE,
            container: ".media_item",
            target: ".round_media_content",
        },

        // Media items - Title text reveal (pour chaque .media_item)
        {
            type: ANIMATION_TYPES.TEXT_REVEAL,
            target: ".media_title",
            end: 90
        },

        // Media items - description text reveal (pour chaque .media_item)
        {
            type: ANIMATION_TYPES.TEXT_REVEAL,
            target: ".media_description",
            end: 90
        },

        // Footer - Curved strokes
        {
            type: ANIMATION_TYPES.STROKE,
            target: ".curved-divider__curved_stroke",
            trigger: ".curved-divider__curved_divider",
            reverse: true,
            end: 80
        },

        // Footer - Line strokes (pour chaque groupe de ligne)
        {
            type: ANIMATION_TYPES.STROKE,
            container: "[class^='curved-divider__line']",
            target: ".curved-divider__stroke",
            end: 80
        },

        // Footer - Dots (pour chaque groupe de ligne)
        {
            type: ANIMATION_TYPES.DOT,
            container: "[class^='curved-divider__line']",
            target: ".curved-divider__dot",
            end: 80
        }
    ]
};

/**
 * Initialise les animations de la Section 2
 * @returns {Object} - viewportController (iframe) ou array de triggers (normal)
 */
export function initSection2Animation() {
    return createSectionAnimations(SECTION2_CONFIG);
}
