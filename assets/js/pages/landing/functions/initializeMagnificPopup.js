import AppVideo from "../../../common/classes/AppMagnificPopup.min.js";
import { viewportController } from "./animations/iframeAnimations.js";

// Détecter si on est dans un iframe
const isInIframe = (() => {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
})();

// Flag pour savoir si le modal est ouvert
let isMfpOpen = false;

// S'abonner aux mises à jour du viewportController (même système que les animations)
if (isInIframe) {
    viewportController.onUpdate((parentInfo) => {
        // Si le modal est ouvert, mettre à jour sa position en temps réel
        if (isMfpOpen) {
            const viewportTopInIframe = Math.max(0, parentInfo.scrollTop - parentInfo.offsetTop);
            const height = parentInfo.windowHeight > 200
                ? parentInfo.windowHeight
                : (window.screen?.height || window.outerHeight || window.innerHeight);

            applyMfpCssVariables(viewportTopInIframe + 'px', height + 'px');
        }
    });
}

/**
 * Applique les variables CSS pour positionner le modal
 * Utilise transform pour ne pas affecter la hauteur du document
 */
function applyMfpCssVariables(translateY, height) {
    const body = document.body;
    body.style.setProperty('--mfp-translate-y', translateY);
    body.style.setProperty('--mfp-height', height);
}

/**
 * Met à jour les variables CSS pour positionner le modal Magnific Popup
 * Gère les deux modes : iframe et sans iframe
 * Utilise transform: translateY pour ne pas affecter la hauteur du document
 */
function updateMfpCssVariables() {
    if (isInIframe) {
        // Mode iframe (mobile et desktop)
        // Utiliser les infos du viewportController (même système que les animations)
        const parentInfo = viewportController.parentInfo;
        if (parentInfo.windowHeight > 200) {
            // Calculer le décalage pour aligner avec le viewport du parent
            const viewportTopInIframe = Math.max(0, parentInfo.scrollTop - parentInfo.offsetTop);
            applyMfpCssVariables(viewportTopInIframe + 'px', parentInfo.windowHeight + 'px');
        } else {
            // Fallback avec screen.height
            const fallbackHeight = window.screen?.height || window.outerHeight || window.innerHeight;
            applyMfpCssVariables('0', fallbackHeight + 'px');
        }
    } else {
        // Mode sans iframe : pas de décalage
        applyMfpCssVariables('0', '100vh');
    }
}

/**
 * Centre le modal Magnific Popup par rapport au viewport visible
 * @param {Object} mfpInstance - Instance Magnific Popup (this dans le callback)
 */
function centerModalOnViewport(mfpInstance) {
    updateMfpCssVariables();
}

/**
 * Initialize the Magnific Popup for video galleries with dynamic configurations based on screen width.
 */
function initializeMagnificPopup() {
    const screenWidth = window.innerWidth;
    const contenBottom = document.querySelector(".section2 .content_medias");
    let prependTo = null;

    // Determine the element to prepend the modal based on screen width.
    if (
        screenWidth <= 991 ||
        contenBottom.clientHeight <= 650
    ){
        prependTo = document.querySelector(".section2");
    } else {
        prependTo = contenBottom;
    }

    // Initialize Magnific Popup for each video gallery in .section2
    $(".section2 .app_mfp_video_gallery").each((index, element) => {
        $(element).magnificPopup({
            delegate: ".app_mfp_video_gallery_item", // Delegate for clickable items.
            type: "iframe",
            tLoading: "Chargement media #%curr%...", // Loading text.
            mainClass: "app_mfp_modal",
            fixedContentPos: 'auto',
            fixedBgPos: 'auto',
            midClick: true,
            zoom: {
                enabled: true, // Enable zoom effect on open.
            },
            gallery: {
                enabled: true, // Enable gallery navigation.
                navigateByImgClick: true, // Navigate by clicking on images.
                preload: [0, 1], // Preload current and next images.
                arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
                tPrev: "Précédent", // Previous button text.
                tNext: "Suivant", // Next button text.
                tCounter: '<span class="mfp-counter">%curr% sur %total%</span>', // Counter markup.
            },
            iframe: {
                markup: '<div class="mfp-iframe-scaler">' +
                    '<div class="mfp-close"></div>' +
                    '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
                    '</div>',
                patterns: {
                    youtube: {
                        index: "youtu", // URL pattern for YouTube.
                        id: function (url) {
                            return AppVideo.getYoutubeIdVideoFromUrl(url); // Extract YouTube ID.
                        },
                        src: "https://www.youtube.com/embed/%id%?autoplay=1", // YouTube embed URL.
                    },
                    vimeo: {
                        index: "vimeo", // URL pattern for Vimeo.
                        id: function (url) {
                            return AppVideo.getVimeoIdVideoFromUrl(url); // Extract Vimeo ID.
                        },
                        src: "https://player.vimeo.com/video/%id%?autoplay=1", // Vimeo embed URL.
                    },
                    dailymotion1: {
                        index: "dailymotion", // URL pattern for Dailymotion.
                        id: function (url) {
                            return AppVideo.getDailymotionIdVideoFromUrl(url); // Extract Dailymotion ID.
                        },
                        src: "https://www.dailymotion.com/embed/video/%id%?autoplay=1", // Dailymotion embed URL.
                    },
                    dailymotion2: {
                        index: "dai.ly", // Alternate Dailymotion URL pattern.
                        id: function (url) {
                            return AppVideo.getDailymotionIdVideoFromUrl(url); // Extract Dailymotion ID.
                        },
                        src: "https://www.dailymotion.com/embed/video/%id%?autoplay=1", // Dailymotion embed URL.
                    },
                    video: {
                        index: function (url) {
                            return url.endsWith(".mp4") || url.endsWith(".webm"); // Check for local video files.
                        },
                        id: function (url) {
                            return url; // Return the file URL directly.
                        },
                        src: "%id%", // Use the file URL as source.
                    },
                },
                srcAction: "iframe_src", // Action to set iframe source.
            },
            callbacks: {
                open: function() {
                    isMfpOpen = true;
                    // Centrer le modal sur le viewport visible
                    centerModalOnViewport(this);
                },
                resize: function() {
                    // Recentrer lors du redimensionnement
                    centerModalOnViewport(this);
                },
                close: function() {
                    isMfpOpen = false;
                    // Réinitialiser les CSS variables
                    applyMfpCssVariables('0', '100vh');
                }
            }
        });
    });
}

// Export the initialization function for external use.
export { initializeMagnificPopup };
