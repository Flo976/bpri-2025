//import appParticles from "../../../common/functions/appParticles.js";
import AppParticles from "../classes/AppParticles.js";

function section0Particles() {
	// initialize les fonds particle
    window.section0BackgroundCanvasParticle = new AppParticles({
        canvasId: "section0BackgroundCanvas",
        dotSize: 8,
        spacing: 25,
        moveType: "poetic",
        animationType: "sparkleAndWaveY",
        
        polygonPath: [
            [32, 0],
            [100, 0],
            [100, 69],
            [70, 100],
            [0, 100],
            [0, 34]
        ],
        colors: ["#D4AF37"],
        offsetStartTime: 2,
        xxx: true,
        offsetStartPositionX: 9,
        offsetStartPositionY: 12,
    })
    window.section0BackgroundCanvasParticle.animate();

    // initialize les fonds particle
    window.yearParticles = new AppParticles({
        canvasId: "yearCanvas",
        dotSize: 8,
        spacing: 25,
        moveType: "poetic",
        animationType: "sparkleAndWaveY",
        
        polygonPath: [
            [32, 0],
            [100, 0],
            [100, 69],
            [70, 100],
            [0, 100],
            [0, 34]
        ],
        colors: ["#D4AF37"],
        offsetStartTime: 1,
        offsetStartPositionX: 0.1,
        offsetStartPositionY: 0.1,
    })
    window.yearParticles.animate();

    // initialize les fonds particle
    window.dgImgParticles = new AppParticles({
        canvasId: "dg_img_canvas",
        dotSize: 8,
        spacing: 25,
        moveType: "poetic",
        animationType: "sparkleAndWaveY",
        
        polygonPath: [
            [32, 0],
            [100, 0],
            [100, 69],
            [70, 100],
            [0, 100],
            [0, 34]
        ],
        colors: ["#D4AF37"],
        offsetStartPositionX: 5,
        offsetStartPositionY: 1.5,
    })
    window.dgImgParticles.animate();

    // initialize les fonds particle
    window.section2BgParticles = new AppParticles({
        canvasId: "section2_bg_canvas",
        dotSize: 8,
        spacing: 25,
        moveType: "poetic",
        animationType: "sparkleAndWaveY",
        
        polygonPath: [
            [32, 0],
            [100, 0],
            [100, 69],
            [70, 100],
            [0, 100],
            [0, 34]
        ],
        colors: ["#D4AF37"]
    })
    window.section2BgParticles.animate();
}

export {
	section0Particles
}