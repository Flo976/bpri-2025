//import appParticles from "../../../common/functions/appParticles.js";
import AppParticles from "../classes/AppParticles.js";

function section0Particles() {
	// initialize les fonds particle
    window.section0BackgroundCanvasParticle = new AppParticles({
        canvasId: "section0BackgroundCanvas",
        dotSize: 8,
        spacing: 25,
        colors: ["#D8BD64"],
        offsetStartTime: 2,
    })
    window.section0BackgroundCanvasParticle.animate();

    // initialize les fonds particle
    window.yearParticles = new AppParticles({
        canvasId: "yearCanvas",
        dotSize: 4,
        spacing: 8.5,
        colors: ["#D8BD64"],
        offsetStartTime: 1,
    })
    window.yearParticles.animate();

    // initialize les fonds particle
    window.dgImgParticles = new AppParticles({
        canvasId: "dg_img_canvas",
        dotSize: 8,
        spacing: 25,
        colors: ["#D8BD64"],
        offsetStartPositionX: 5,
        offsetStartPositionY: 3,
    })
    window.dgImgParticles.animate();

    // initialize les fonds particle
    window.section2BgParticles = new AppParticles({
        canvasId: "section2_bg_canvas",
        dotSize: 8,
        spacing: 25,
        colors: ["#D8BD64"]
    })
    window.section2BgParticles.animate();
}

export {
	section0Particles
}