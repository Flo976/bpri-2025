/* ---- Jquery ----- */
import $ from "jquery";
global.jQuery = $;
global.$ = $;
window.jQuery = $;
window.$ = $;
/* ---- Jquery ----- */

/* ---- Bootstrap ----- */
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
/* ---- Bootstrap ----- */

/* ---- AppAnimateCss ----- */
//import "animate.css";
import '../common/classes/AppAnimateCss.min.js';
/* ---- AppAnimateCss ----- */

/* ---- AppMagnificPopup ----- */
import '../common/classes/AppMagnificPopup.min.js';
/* ---- AppMagnificPopup ----- */

import "../../scss/layout/main.scss";

import BodyManager from "./classes/BodyManager.js";
// import PageManager from "./classes/PageManager.js";
import AppMagneticCursor from "./classes/AppMagneticCursor.js";

import customContainerModals from "./functions/customContainerModals.js";
import mouseAndTouchParticles from "../common/functions/mouseAndTouchParticles.js";

// Initialiser quand le DOM est chargé
window.addEventListener("load", () => {
    // initialize BodyManager
    new BodyManager();

    // initialize PageManager
    // window.pageManager = new PageManager();
    // Affiche la section landing par défaut
    // window.pageManager.showContent('landing');
    // Pour changer de section
    // window.pageManager.showContent('example');

    // initialize the customer container modals
    customContainerModals();

    // initialize effet particle
    mouseAndTouchParticles()  
});