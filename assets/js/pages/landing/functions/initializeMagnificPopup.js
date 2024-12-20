import AppVideo from "../../../common/classes/AppMagnificPopup.min.js";

/**
 * Initialize the Magnific Popup for video galleries with dynamic configurations based on screen width.
 */
function initializeMagnificPopup() {
    const screenWidth = window.innerWidth;
    let prependTo = null;

    // Determine the element to prepend the modal based on screen width.
    if (screenWidth <= 991) {
        prependTo = document.querySelector(".section2");
    } else {
        prependTo = document.querySelector(".section2 .content_bottom");
    }

    // Initialize Magnific Popup for each video gallery in .section2
    $(".section2 .app_mfp_video_gallery").each((index, element) => {
        $(element).magnificPopup({
            prependTo,
            delegate: ".app_mfp_video_gallery_item", // Delegate for clickable items.
            type: "iframe",
            tLoading: "Chargement media #%curr%...", // Loading text.
            mainClass: "app_mfp_modal",
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
        });
    });
}

// Export the initialization function for external use.
export { initializeMagnificPopup };
