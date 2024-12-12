import "../../../scss/pages/landing/main.scss";

import ContentLandingManager from "./classes/ContentLandingManager.js";
import { section0Particles } from "./functions/section0Particles.js";


// import Swiper bundle with all modules installed
import Swiper from 'swiper/bundle';
// import styles bundle
import 'swiper/css/bundle';

const initMySwiper = () => {
    const swiper = new Swiper(".sections_swiper", {
        direction: "vertical", // Slider vertical
        slidesPerView: 1, // Une seule carte visible à la fois
        speed: 600, // Vitesse de transition
        loop: false,
        spaceBetween: 0,
        mousewheel: true, // Navigation avec la molette

        effect: "creative", // Activation de l'effet creative
        creativeEffect: {
        	prev: {
	          shadow: false,
	          translate: [0, "-2%", -1],
	          rotate: [0, 0, 1],
	        },
	        next: {
	          translate: [0, "100%", 0],
	          rotate: [0, 0, -1],
	        },
        },

        pagination: {
            el: ".sections_swiper .swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".sections_swiper .swiper-button-next",
            prevEl: ".sections_swiper .swiper-button-prev",
        },
    });

};

function main() {
    window.contentLandingManager = new ContentLandingManager();
    window.appAnimateCss?.checkAnimations();
    window.scrollbarContent?.update();
    window.iFrameResizer?.trigger("resize");
    console.info("window.innerHeight", window.innerHeight);

    initMySwiper();

    setTimeout(() => {
    	section0Particles();
    }, 500)
}

/**
 * Initialiser quand le DOM est chargé
 */
document.addEventListener("DOMContentLoaded", () => {
    //main()
});

export { main };