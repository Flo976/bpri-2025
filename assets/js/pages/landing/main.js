import "../../../scss/pages/landing/main.scss";

import { initializeParticles } from "./functions/initializeParticles.js";
import { initializeMagnificPopup } from "./functions/initializeMagnificPopup.js";
import { initializeSwipers } from "./functions/initializeSwipers.js";

function main() {
    window.appAnimateCss?.checkAnimations();
    window.scrollbarContent?.update();
    window.iFrameResizer?.trigger("resize");
    console.info("window.innerHeight", window.innerHeight);

    initializeParticles();
    initializeMagnificPopup();
    initializeSwipers();
}

/**
 * Initialiser quand le DOM est chargé
 */
window.addEventListener("load", () => {
    main()
});

export { main };