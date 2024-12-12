import appParticles from "../../../common/functions/appParticles.js";

function section0Particles() {
	// initialize les fonds particle
    appParticles({
        canvasId: "section0BackgroundCanvas",
        dotSize: 8,
        spacing: 25,
        moveType: "poetic",
        waveFrequency: 1.5,
        animationType: "twinkle",
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

    // initialize les fonds particle
    appParticles({
        canvasId: "yearCanvas",
        dotSize: 4,
        spacing: 8.5,
        moveType: "poetic",
        waveFrequency: 1.5,
        animationType: "twinkle",
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
}

export {
	section0Particles
}