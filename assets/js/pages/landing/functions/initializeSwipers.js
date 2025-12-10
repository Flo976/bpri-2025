// Import Swiper bundle with all modules installed
import Swiper from 'swiper/bundle';
// Import Swiper styles bundle
import 'swiper/css/bundle';

/**
 * Initialize Swipers.
 */
function initializeSwipers() {
    const ggl_review_swiper = new Swiper(".ggl_review_swiper", {
        direction: "horizontal", // Set the slider direction to horizontal.
        slidesPerView: "auto",   // Allow multiple slides to be visible based on their width.
        centeredSlides: false,    // Center the active slide.
        loop: false,             // Disable infinite loop.
        spaceBetween: 0,         // No space between slides.
        mousewheel: false,       // Disable navigation using the mouse wheel.
        autoplay: false,         // Autoplay is disabled.
        pagination: false,
        //freeMode: true,
        navigation: {
            nextEl: ".ggl_review_swiper .swiper-button-next", // Next button element.
            prevEl: ".ggl_review_swiper .swiper-button-prev", // Previous button element.
        },
    });

    const s1_swiper = new Swiper(".s1_swiper", {
        direction: "horizontal", // Set the slider direction to horizontal.
        slidesPerView: "auto",   // Allow multiple slides to be visible based on their width.
        centeredSlides: false,    // Center the active slide.
        loop: false,             // Disable infinite loop.
        spaceBetween: 0,         // No space between slides.
        mousewheel: false,       // Disable navigation using the mouse wheel.
        autoplay: false,         // Autoplay is disabled.
        pagination: false,
        freeMode: true,
        navigation: false,
        navigation: {
            nextEl: ".s1_swiper .swiper-button-next", // Next button element.
            prevEl: ".s1_swiper .swiper-button-prev", // Previous button element.
        },
    });

    const s3_swiper = new Swiper(".s3_swiper", {
        direction: "horizontal", // Set the slider direction to horizontal.
        slidesPerView: "auto",   // Allow multiple slides to be visible based on their width.
        centeredSlides: false,    // Center the active slide.
        loop: false,             // Disable infinite loop.
        spaceBetween: 0,         // No space between slides.
        mousewheel: false,       // Disable navigation using the mouse wheel.
        autoplay: false,         // Autoplay is disabled.
        pagination: false,
        freeMode: true,
        navigation: false,
        navigation: {
            nextEl: ".s3_swiper .swiper-button-next", // Next button element.
            prevEl: ".s3_swiper .swiper-button-prev", // Previous button element.
        },
    });

    const s4_swiper = new Swiper(".s4_swiper", {
        direction: "horizontal", // Set the slider direction to horizontal.
        slidesPerView: "auto",   // Allow multiple slides to be visible based on their width.
        centeredSlides: false,    // Center the active slide.
        loop: false,             // Disable infinite loop.
        spaceBetween: 0,         // No space between slides.
        mousewheel: false,       // Disable navigation using the mouse wheel.
        autoplay: false,         // Autoplay is disabled.
        pagination: false,
        freeMode: true,
        navigation: false,
        navigation: {
            nextEl: ".s4_swiper .swiper-button-next", // Next button element.
            prevEl: ".s4_swiper .swiper-button-prev", // Previous button element.
        },
    });
}

// Export the `initializeSwipers` function for external use.
export {
    initializeSwipers
}
