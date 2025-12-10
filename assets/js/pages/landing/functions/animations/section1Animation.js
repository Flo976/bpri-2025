import { createSectionAnimations, ANIMATION_TYPES } from "./animationFactory.js";

/**
 * Configuration des animations pour Section 1
 *
 * Structure de la section:
 * - Header line (strokes + dot)
 * - Media (arc + content)
 * - Title + Description (text reveal)
 * - User info: name + job (text reveal)
 * - Footer line (strokes + dot)
 */
const SECTION1_CONFIG = {
    section: ".section1",
    animations: [
        // Header line
        {
            type: ANIMATION_TYPES.STROKE,
            target: ".divider-top__stroke",
            trigger: ".content_header_line"
        },
        {
            type: ANIMATION_TYPES.DOT,
            target: ".divider-top__dot",
            trigger: ".content_header_line"
        },

        // Media arc avec rotation
        {
            type: ANIMATION_TYPES.ARC,
            target: "[class*='arc-media__stroke']",
            trigger: ".content_media",
            rotate: true
        },
        {
            type: ANIMATION_TYPES.FADE_SCALE,
            target: ".round_media_content",
            trigger: ".content_media"
        },

        // Textes
        {
            type: ANIMATION_TYPES.TEXT_REVEAL,
            target: ".content_text .title",
        },
        {
            type: ANIMATION_TYPES.TEXT_REVEAL,
            target: ".content_text .description",
            //end: 50
        },

        // User info - text reveal
        {
            type: ANIMATION_TYPES.TEXT_REVEAL,
            target: ".user_info .user_name",
        },
        {
            type: ANIMATION_TYPES.TEXT_REVEAL,
            target: ".user_info .user_job",
        },

        // Footer line
        {
            type: ANIMATION_TYPES.STROKE,
            target: ".divider-bottom__stroke",
            trigger: ".content_footer_line",
            reverse: true
        },
        {
            type: ANIMATION_TYPES.DOT,
            target: ".divider-bottom__dot",
            trigger: ".content_footer_line"
        }
    ]
};

/**
 * Initialise les animations de la Section 1
 * @returns {Object} - viewportController (iframe) ou array de triggers (normal)
 */
export function initSection1Animation() {
    return createSectionAnimations(SECTION1_CONFIG);
}
