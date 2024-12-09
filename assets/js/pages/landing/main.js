import "../../../scss/pages/landing/main.scss";

import ContentLandingManager from "./classes/ContentLandingManager.js";
import { section0Particles } from "./functions/section0Particles.js";

function main() {
	window.contentLandingManager = new ContentLandingManager();
	window.appAnimateCss?.checkAnimations();
	window.scrollbarContent?.update();
	window.iFrameResizer?.trigger("resize");
	console.info("window.innerHeight", window.innerHeight);

	section0Particles();
}

/**
 * Initialiser quand le DOM est chargé
 */
document.addEventListener("DOMContentLoaded", () => {
	//main()
});

export { main };
