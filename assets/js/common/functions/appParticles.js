export default function appParticles(params = {}) {
    const canvasId = params.canvasId || "yearCanvas";
    const canvas = document.getElementById(canvasId);

    if (!canvas) {
        console.error(`Canvas with ID "${canvasId}" not found.`);
        return;
    }

    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;

    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;

    const options = {
        dotSize: params.dotSize || 4.5,
        spacing: params.spacing || 8,
        animationType: params.animationType || "waveHorizontal",
        moveType: params.moveType || "slide",
        colors: params.colors || ["#D7BD64"],
        waveFrequency: params.waveFrequency || 0.5,
        polygonPath: params.polygonPath || null,
    };

    const {
        dotSize,
        spacing,
        animationType,
        moveType,
        colors,
        waveFrequency,
        polygonPath,
    } = options;
    const rows = Math.ceil(canvas.height / spacing);
    const cols = Math.ceil(canvas.width / spacing);

    const dots = [];
    const parsedColors = colors.map((color) => {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return { r, g, b };
    });

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function zigzagGrouping(indices, cols, rows) {
        let groupedIndices = [];
        let direction = 1; // 1 pour droite, -1 pour gauche

        // Groupes en zigzag
        for (let row = 0; row < rows; row++) {
            if (direction === 1) {
                for (let col = 0; col < cols; col++) {
                    groupedIndices.push({ row, col });
                }
            } else {
                for (let col = cols - 1; col >= 0; col--) {
                    groupedIndices.push({ row, col });
                }
            }
            direction *= -1; // Inverser la direction
        }

        return groupedIndices;
    }

    function inverseSpiralGrouping(indices, cols, rows) {
        let groupedIndices = [];
        let top = rows - 1,
            bottom = 0,
            left = cols - 1,
            right = 0;

        while (top >= bottom && left >= right) {
            // Prendre la dernière ligne
            for (let col = left; col >= right; col--) {
                groupedIndices.push({ row: top, col });
            }
            top--;

            // Prendre la première colonne
            for (let row = top; row >= bottom; row--) {
                groupedIndices.push({ row, col: right });
            }
            right++;

            // Prendre la première ligne
            if (top >= bottom) {
                for (let col = right; col <= left; col++) {
                    groupedIndices.push({ row: bottom, col });
                }
                bottom++;
            }

            // Prendre la dernière colonne
            if (left >= right) {
                for (let row = bottom; row <= top; row++) {
                    groupedIndices.push({ row, col: left });
                }
                left--;
            }
        }

        return groupedIndices;
    }

    function cascadeGrouping(indices, cols, rows) {
        let groupedIndices = [];

        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                groupedIndices.push({ row, col });
            }
        }

        return groupedIndices;
    }

    function concentrationGrouping(indices, cols, rows) {
        let groupedIndices = [];
        let centerX = Math.floor(cols / 2);
        let centerY = Math.floor(rows / 2);

        // Tri des indices par proximité du centre
        let distances = indices.map(({ row, col }) => {
            let dx = col - centerX;
            let dy = row - centerY;
            return { row, col, distance: Math.sqrt(dx * dx + dy * dy) };
        });

        // Tri par distance croissante
        distances.sort((a, b) => a.distance - b.distance);

        // Regrouper les indices triés
        distances.forEach(item => groupedIndices.push({ row: item.row, col: item.col }));

        return groupedIndices;
    }

    function createDots() {
        let indices = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                indices.push({ row, col });
            }
        }

        // Mélanger les indices
        //shuffleArray(indices);
        //indices = zigzagGrouping(indices, cols, rows);
        //indices = inverseSpiralGrouping(indices, cols, rows);
        //indices = cascadeGrouping(indices, cols, rows);
        indices = concentrationGrouping(indices, cols, rows);

        indices.forEach((pos, index) => {
            const { row, col } = pos;
            const xPos = col * spacing;
            const color =
                parsedColors[Math.floor(Math.random() * parsedColors.length)];
            const fromLeft = xPos < canvas.width / 2;

            if (moveType === "slide") {
                dots.push({
                    x: fromLeft ? xPos - canvas.width / 2 : xPos + canvas.width / 2,
                    y: row * spacing,
                    targetX: xPos,
                    targetY: row * spacing,
                    color,
                    speed: 5,
                    currentSize: dotSize,
                    opacity: 0,
                    reachedTarget: false,
                    offset: Math.random() * Math.PI * 2,
                });
            } else if (moveType === "fade") {
                dots.push({
                    x: xPos,
                    y: row * spacing,
                    targetX: xPos,
                    targetY: row * spacing,
                    color,
                    speed: 5,
                    currentSize: dotSize,
                    opacity: 0,
                    reachedTarget: false,
                    offset: Math.random() * Math.PI * 2,
                    fadeDelay: Math.random() * 6000,
                    fadeSpeed: 0.01 + Math.random() * 0.04,
                });
            } else if (moveType === "poetic") {
                dots.push({
                    row,
                    col,
                    x: xPos, // Position fixe
                    y: row * spacing, // Position fixe
                    targetX: xPos,
                    targetY: row * spacing,
                    targetSize: dotSize, // Taille finale
                    currentSize: 0, // Taille initiale
                    opacity: 0.001, // Opacité initiale
                    targetOpacity: 1, // Opacité finale
                    fadeSpeed: 0.05, // Vitesse aléatoire d'apparition
                    sizeSpeed: 0.05, // Vitesse aléatoire de croissance
                    startTime: index * 1.5, // Délai aléatoire pour chaque pastille
                    color, // Couleur de la pastille
                    offset: Math.random() * Math.PI * 2,
                    baseSize: Math.random() * 5 + 2, // Taille de base
                });
            }
        })
    }

    function updateSlideDots(dot) {
        if (!dot.reachedTarget) {
            if (dot.x < dot.targetX) {
                dot.x += dot.speed;
                if (dot.x > dot.targetX) dot.x = dot.targetX;
            } else if (dot.x > dot.targetX) {
                dot.x -= dot.speed;
                if (dot.x < dot.targetX) dot.x = dot.targetX;
            }

            if (dot.y < dot.targetY) {
                dot.y += dot.speed;
                if (dot.y > dot.targetY) dot.y = dot.targetY;
            } else if (dot.y > dot.targetY) {
                dot.y -= dot.speed;
                if (dot.y < dot.targetY) dot.y = dot.targetY;
            }

            if (dot.x === dot.targetX && dot.y === dot.targetY) {
                dot.reachedTarget = true;
            }
        }
    }

    function updateFadeDots(dot) {
        const currentTime = Date.now();
        if (!dot.startTime) {
            dot.startTime = currentTime + dot.fadeDelay;
        }

        if (currentTime >= dot.startTime && !dot.reachedTarget) {
            if (dot.opacity < 1) {
                dot.opacity += dot.fadeSpeed;
                if (dot.opacity > 1) dot.opacity = 1;
            } else {
                dot.reachedTarget = true;
            }
        }
    }

    function updatePoeticDots(dot) {
        const currentTime = performance.now();

        // Vérifier si le délai de démarrage est écoulé
        if (currentTime < dot.startTime) return;

        // Augmenter la taille progressivement
        if (dot.currentSize < dot.targetSize) {
            dot.currentSize += dot.sizeSpeed * dot.targetSize;
            if (dot.currentSize > dot.targetSize) dot.currentSize = dot.targetSize;
        }

        // Augmenter l’opacité progressivement
        if (dot.opacity < dot.targetOpacity) {
            dot.opacity += dot.fadeSpeed;
            if (dot.opacity > dot.targetOpacity) dot.opacity = dot.targetOpacity;
        }

        // Marquer comme terminé si les transitions sont complètes
        if (dot.currentSize === dot.targetSize && dot.opacity === dot.targetOpacity) {
            dot.reachedTarget = true;
        }
    }


    let currentStyleIndex = 0; // Index du style actuel
    let nextStyleIndex = 1; // Index du style suivant
    let styleTransitionStart = 0; // Moment du début de la transition
    const transitionDuration = 1000; // Durée de la transition en ms

    const styles = [{
            name: "sparkle",
            sizeFunction: (time, dot, amplitude) => {
                const rowWaveOffset = dot.targetY / (spacing * 3);
                const sparkleFactor = Math.random() < 0.01 ? 1.5 : 1; // Éclat rare
                return (dotSize + amplitude) * sparkleFactor;;
            },
            colorFunction: (time, dot) => {
                const sparkleFactor = Math.random() < 0.01 ? 1.5 : 1; // Éclat rare
                const timeFactor = time + (Math.random() * 5000); // Délai aléatoire pour chaque 
                return {
                    r: (212 + sparkleFactor + Math.sin(timeFactor * 0.1) * 20),
                    g: (175 + sparkleFactor + Math.cos(timeFactor * 0.1) * 15),
                    b: 55,
                    a: 1,
                };
            },
        },
        {
            name: "TwinkleY",
            sizeFunction: (time, dot, amplitude) => {
                const rowWaveOffset = dot.targetY / (spacing * 3);
                const sparkleFactor = Math.random() < 0.01 ? 1.5 : 1; // Éclat rare
                return (dotSize + Math.sin(time * waveFrequency + rowWaveOffset) * amplitude) * sparkleFactor;;
            },
            colorFunction: (time, dot) => {
                const sparkleFactor = Math.random() < 0.01 ? 1.5 : 1; // Éclat rare
                const timeFactor = time + (Math.random() * 5000); // Délai aléatoire pour chaque 
                return {
                    r: (212 + sparkleFactor + Math.sin(timeFactor * 0.1) * 20),
                    g: (175 + sparkleFactor + Math.cos(timeFactor * 0.1) * 15),
                    b: 55,
                    a: 1,
                };
            },
        },
        {
            name: "TwinkleX",
            sizeFunction: (time, dot, amplitude) => {
                const rowWaveOffset = dot.targetX / (spacing * 3);
                const sparkleFactor = Math.random() < 0.01 ? 1.5 : 1; // Éclat rare
                return (dotSize + Math.sin(time * waveFrequency + rowWaveOffset) * amplitude) * sparkleFactor;
            },
            colorFunction: (time, dot) => {
                const sparkleFactor = Math.random() < 0.01 ? 1.5 : 1; // Éclat rare
                const timeFactor = time + (Math.random() * 5000); // Délai aléatoire pour chaque 
                return {
                    r: (212 + sparkleFactor + Math.sin(timeFactor * 0.1) * 20),
                    g: (175 + sparkleFactor + Math.cos(timeFactor * 0.1) * 15),
                    b: 55,
                    a: 1,
                };
            },
        },
        {
            name: "TwinklexZ",
            sizeFunction: (time, dot, amplitude) => {
                const rowWaveOffset = dot.targetX / (spacing * 3);
                const sparkleFactor = Math.random() < 0.01 ? 1.5 : 1; // Éclat rare
                return dotSize + Math.sin(time * waveFrequency + rowWaveOffset) * amplitude + Math.cos(sparkleFactor * 0.1) * 2;

            },
            colorFunction: (time, dot) => {
                const sparkleFactor = Math.random() < 0.01 ? 1.5 : 1; // Éclat rare
                const timeFactor = time + (Math.random() * 5000); // Délai aléatoire pour chaque 
                return {
                    r: (212 + sparkleFactor + Math.sin(timeFactor * 0.1) * 20),
                    g: (175 + sparkleFactor + Math.cos(timeFactor * 0.1) * 15),
                    b: 55,
                    a: 1,
                };
            },
        },
    ];


    function updateDots() {
        const time = Date.now() * 0.002;
        const amplitude = 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const currentStyle = styles[currentStyleIndex];
        const nextStyle = styles[nextStyleIndex];

        console.log(currentStyle.name)

        const transitionProgress = Math.min(
            (performance.now() - styleTransitionStart) / transitionDuration,
            1
        );

        dots.forEach((dot, index) => {
            if (!dot.reachedTarget) {
                if (moveType === "slide") {
                    updateSlideDots(dot);
                } else if (moveType === "fade") {
                    updateFadeDots(dot);
                } else if (moveType === "poetic") {
                    updatePoeticDots(dot, time);
                }
            }

            if (dot.reachedTarget) {
                // Interpoler la taille
                const sizeCurrent = currentStyle.sizeFunction(time, dot, amplitude);
                const sizeNext = nextStyle.sizeFunction(time, dot, amplitude);
                dot.currentSize = lerp(sizeCurrent, sizeNext, transitionProgress);

                // Interpoler la couleur
                const colorCurrent = currentStyle.colorFunction(time, dot, amplitude);
                const colorNext = nextStyle.colorFunction(time, dot, amplitude);
                const r = Math.floor(lerp(colorCurrent.r, colorNext.r, transitionProgress));
                const g = Math.floor(lerp(colorCurrent.g, colorNext.g, transitionProgress));
                const b = Math.floor(lerp(colorCurrent.b, colorNext.b, transitionProgress));
                const a = lerp(colorCurrent.a, colorNext.a, transitionProgress);

                dot.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
            }

            drawDot(dot, ctx);
        });
    }

    // Lerp function for smooth transitions
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function drawDot(dot, ctx) {
        if (dot.fillStyle) {
            ctx.fillStyle = dot.fillStyle;
        } else {
            ctx.fillStyle = `rgba(${dot.color.r}, ${dot.color.g}, ${dot.color.b}, ${
              dot.opacity || 1
            })`;
        }

        ctx.beginPath();

        if (polygonPath) {
            const size = dot.currentSize;
            polygonPath.forEach(([xPercent, yPercent], index) => {
                const x = dot.x + ((xPercent - 50) / 100) * size;
                const y = dot.y + ((yPercent - 50) / 100) * size;
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
        } else {
            const size = dot.currentSize;
            ctx.fillRect(dot.x - size / 2, dot.y - size / 2, size, size);
        }

        ctx.fill();
    }

    // Changer de style toutes les 2 secondes
    let lastStyleChange = 0;

    function checkStyleChange(now) {
        if (now - lastStyleChange > 5000) {
            styleTransitionStart = performance.now();
            currentStyleIndex = nextStyleIndex;
            nextStyleIndex = (nextStyleIndex + 1) % styles.length;
            lastStyleChange = now;
        }
    }

    // Animation principale
    let lastRenderTime = 0;

    function animate() {
        const now = performance.now();
        if (now - lastRenderTime < 16) {
            requestAnimationFrame(animate);
            return;
        }
        lastRenderTime = now;

        updateDots();
        checkStyleChange(now);
        requestAnimationFrame(animate);
    }

    createDots();
    animate();

    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            canvas.width = parent.offsetWidth;
            canvas.height = parent.offsetHeight;
            dots.length = 0;
            createDots();
        }, 100);
    });
}