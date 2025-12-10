import "../../../scss/pages/landing/main.scss";

import { initializeMagnificPopup } from "./functions/initializeMagnificPopup.js";
//import { initializeSwipers } from "./functions/initializeSwipers.js";
import { initSection0Animation } from "./functions/animations/section0Animation.js";
import { initSection1Animation } from "./functions/animations/section1Animation.js";
import { initSection2Animation } from "./functions/animations/section2Animation.js";

function main() {
    initializeMagnificPopup();
    //initializeSwipers();

    // Lancer les animations de la section0 (hero)
    initSection0Animation();

    // Lancer les animations de la section1 (scroll-triggered)
    initSection1Animation();

    // Lancer les animations de la section2 (scroll-triggered)
    initSection2Animation();
}

/**
 * Initialiser quand le DOM est chargé
 */
window.addEventListener("load", () => {
    main()
});

export { main };