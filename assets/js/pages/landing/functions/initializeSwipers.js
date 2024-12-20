// Import Swiper bundle with all modules installed
import Swiper from 'swiper/bundle';
// Import Swiper styles bundle
import 'swiper/css/bundle';

/**
 * Initialize a specific Swiper instance for the element with the class `wishVideoSwiper`.
 */
function initializeSwiperS2() {
    const swiper = new Swiper(".wishVideoSwiper", {
        direction: "horizontal", // Set the slider direction to horizontal.
        slidesPerView: "auto",   // Allow multiple slides to be visible based on their width.
        centeredSlides: true,    // Center the active slide.
        loop: false,             // Disable infinite loop.
        spaceBetween: 0,         // No space between slides.
        mousewheel: false,       // Disable navigation using the mouse wheel.
        autoplay: false,         // Autoplay is disabled.
        pagination: {
            el: ".wishVideoSwiper .swiper-pagination", // Element for pagination indicators.
            clickable: true,                            // Make pagination indicators clickable.
        },
        navigation: {
            nextEl: ".wishVideoSwiper .swiper-button-next", // Next button element.
            prevEl: ".wishVideoSwiper .swiper-button-prev", // Previous button element.
        },
    });

    /**
     * Handle the active slide index changes by calling `checkActiveIndex`.
     */
    swiper.on('slideChange', function () {
        checkActiveIndex();
    });

    /**
     * Function to check the current active slide index.
     * Additional logic can be implemented based on the active index.
     */
    const checkActiveIndex = () => {
        const activeIndex = swiper.activeIndex;
        //console.log(`Active slide index: ${activeIndex}`); // Log active index for debugging.
        // Add custom behavior here if needed.
    };

    // Ensure the active index is checked upon initialization.
    checkActiveIndex();
}

/**
 * Initialize Swipers based on the screen width.
 * Only initializes `initializeSwiperS2` if the screen width is 991px or less.
 */
function initializeSwipers() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 991) {
        initializeSwiperS2();
    }
}

// Export the `initializeSwipers` function for external use.
export {
    initializeSwipers
}
