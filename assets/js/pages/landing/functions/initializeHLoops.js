import { HLoop } from "../../../common/functions/HLoop.js"

/**
 * Initialize a specific Swiper instance for the element with the class `wishVideoSwiper`.
 */
function initializeS4HLoop() {
    let activeElement;
    let hLoop = HLoop(".s4_bloc_item", {
        speed: 0.125,
        repeat: false,
        paused: true,
        paddingRight: 0,
        draggable: true, // make it draggable
        center: true, // active element is the one in the center of the container rather than th left edge
        dragTrigger: ".s4_bloc_list",
        onChange: (element, index) => { // when the active element changes, this function gets called.
            activeElement && activeElement.classList.remove("active");
            element.classList.add("active");
            activeElement = element;
        }
    });
}

/**
 * Initialize Swipers based on the screen width.
 * Only initializes `initializeS4HLoop` if the screen width is 991px or less.
 */
function initializeHLoops() {
    initializeS4HLoop();
}

// Export the `initializeHLoops` function for external use.
export {
    initializeHLoops
}
