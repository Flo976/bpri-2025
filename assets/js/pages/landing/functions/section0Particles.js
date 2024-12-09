import appParticles from "../../../common/functions/appParticles.js";

function section0Particles() {
	// initialize les fonds particle
    appParticles({
        canvasId: "section0BackgroundCanvas",
        dotSize: 8,
        spacing: 25,
        moveType: "linear",
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
        colors: ["#D7BD64"]
    })

    // initialize les fonds particle
    appParticles({
        canvasId: "yearCanvas",
        dotSize: 4,
        spacing: 8.5,
        moveType: "linear",
        waveFrequency: 1.5,
        animationType: "waveHorizontal",
        polygonPath: [
            [32, 0],
            [100, 0],
            [100, 69],
            [70, 100],
            [0, 100],
            [0, 34]
        ],
        colors: ["#D7BD64"]
    })
}

export {
	section0Particles
}