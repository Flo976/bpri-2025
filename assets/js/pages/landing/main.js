import "../../../scss/pages/landing/main.scss";

import ContentLandingManager from "./classes/ContentLandingManager.js";
import { initializeParticles } from "./functions/initializeParticles.js";


// import Swiper bundle with all modules installed
import Swiper from 'swiper/bundle';
// import styles bundle
import 'swiper/css/bundle';

const initMySwiper = () => {
    const swiper = new Swiper(".wishVideoSwiper", {
        direction: "horizontal", // Slider vertical
        slidesPerView: "auto", // Une seule carte visible à la fois
        centeredSlides: true,
        loop: false,
        spaceBetween: 0,
        mousewheel: false, // Navigation avec la molette
        autoplay: false,
        pagination: {
            el: ".wishVideoSwipper .swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".wishVideoSwipper .swiper-button-next",
            prevEl: ".wishVideoSwipper .swiper-button-prev",
        },
    });

    // Écouter l'événement de changement de slide
	swiper.on('slideChange', function () {
	  checkActiveIndex()
	});

	const checkActiveIndex = () => {
		const activeIndex = swiper.activeIndex;
	}
	checkActiveIndex()
};

function main() {
    window.contentLandingManager = new ContentLandingManager();
    window.appAnimateCss?.checkAnimations();
    window.scrollbarContent?.update();
    window.iFrameResizer?.trigger("resize");
    console.info("window.innerHeight", window.innerHeight);

    initializeParticles();
    if (window.innerWidth <= 991) {
    	initMySwiper();
    }
}

/**
 * Initialiser quand le DOM est chargé
 */
window.addEventListener("load", () => {
    main()
});

export { main };