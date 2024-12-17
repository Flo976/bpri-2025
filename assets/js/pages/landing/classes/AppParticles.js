window.requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };

export default class AppParticles {
  constructor(params = {}) {
    this.canvasId = params.canvasId || "yearCanvas";
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) {
      console.error(`Canvas with ID "${this.canvasId}" not found.`);
      return;
    }

    this.ctx = this.canvas.getContext("2d");
    this.parent = this.canvas.parentElement;
    this.canvas.width = this.parent.offsetWidth;
    this.canvas.height = this.parent.offsetHeight;

    this.options = {
      dotSize: params.dotSize || 4.5,
      spacing: params.spacing || 8,
      moveType: params.moveType || "slide",
      animationType: params.animationType || "sparkle",
      colors: params.colors || ["#D7BD64"],
      waveFrequency: params.waveFrequency || 0.5,
      polygonPath: params.polygonPath || null,
      offsetStartTime: params.offsetStartTime || 2,
    };

    this.dots = [];
    this.isCanvasVisible = false;

    this.rows = Math.ceil(this.canvas.height / this.options.spacing);
    this.cols = Math.ceil(this.canvas.width / this.options.spacing);

    this.parsedColors = this.options.colors.map((color) => {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return { r, g, b };
    });

    this.dotsReached = false;
    this.lastStyleChange = 0;
    this.lastRenderTime = 0;
    this.currentStyleIndex = 0; // Index du style actuel
    this.nextStyleIndex = 1; // Index du style suivant
    this.styleTransitionStart = 0; // Moment du début de la transition
    this.transitionDuration = 1000; // Durée de la transition en ms
    this.styles = this.getAnimations();

    //this.initVisibilityObserver();
    this.createDots();
  }

  initVisibilityObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isCanvasVisible = entry.isIntersecting;
        if (this.isCanvasVisible) {
          console.log("Canvas visible. Animation active.");
        } else {
          console.log("Canvas hidden. Animation paused.");
        }
      });
    });
    observer.observe(this.canvas);
  }

  concentrationGrouping(indices) {
    let groupedIndices = [];
    let centerX = Math.floor(this.cols / 2);
    let centerY = Math.floor(this.rows / 2);

    // Tri des indices par proximité du centre
    let distances = indices.map(({ row, col, realIndex }) => {
      let dx = col - centerX;
      let dy = row - centerY;
      return { realIndex, row, col, distance: Math.sqrt(dx * dx + dy * dy) };
    });

    // Tri par distance croissante
    distances.sort((a, b) => a.distance - b.distance);

    // Regrouper les indices triés
    distances.forEach((item) =>
      groupedIndices.push({ row: item.row, col: item.col, realIndex: item.realIndex }),
    );

    return groupedIndices;
  }

  createDots() {
    let indices = [];
    let realIndex = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        indices.push({ row, col, realIndex });
        realIndex++;
      }
    }

    indices = this.concentrationGrouping(indices);

    indices.forEach((pos, index) => {
      const { row, col, realIndex } = pos;
      const xPos = col * this.options.spacing + this.options.dotSize / 2;
      const yPos = row * this.options.spacing + this.options.dotSize / 2;
      const color =
        this.parsedColors[Math.floor(Math.random() * this.parsedColors.length)];
      const fromLeft = xPos < this.canvas.width / 2;

      if (this.options.moveType === "poetic") {
        this.dots.push({
          row,
          col,
          x: xPos,
          y: yPos,
          targetX: xPos,
          targetY: yPos,
          targetSize: this.options.dotSize, // Taille finale
          currentSize: 0, // Taille initiale
          opacity: 0.001, // Opacité initiale
          targetOpacity: 1, // Opacité finale
          fadeSpeed: 0.5, // Vitesse aléatoire d'apparition
          sizeSpeed: 0.09, // Vitesse aléatoire de croissance
          startTime: index * this.options.offsetStartTime, // Délai aléatoire pour chaque pastille
          color,
          offset: Math.random() * Math.PI * 2,
          realIndex
        });
      }
    });
  }

  updatePoeticDots(dot) {
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
    if (
      dot.currentSize === dot.targetSize &&
      dot.opacity === dot.targetOpacity
    ) {
      dot.reachedTarget = true;
    }
  }

  updateDots() {
    const time = Date.now() * 0.002;
    const amplitude = 2;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let currentStyle = this.styles[0];

    this.dots.forEach((dot, index) => {
      dot.index = index;

      if (!dot.reachedTarget) {
        if (this.options.moveType === "poetic") {
          this.updatePoeticDots(dot, time);
        }
        if (index == this.dots.length - 1) {
          this.dotsReached = this.dotsReached || dot.reachedTarget;
        }
      }

      if (dot.reachedTarget) {
        // Interpoler la taille
        const sparkleFactor = Math.random() < 0.01 ? 0 : 0; // Éclat rare
        const sizeCurrent = currentStyle.sizeFunction(time, dot, amplitude);
        dot.currentSize = sizeCurrent;
        if (dot.shadowBlur) {
          dot.shadowBlur = 0;
        } else {
          dot.shadowBlur = sizeCurrent * sparkleFactor;
        }

        // Interpoler la couleur
        const colorCurrent = currentStyle.colorFunction(time, dot, amplitude);
        const r = colorCurrent.r;
        const g = colorCurrent.g;
        const b = colorCurrent.b;
        const a = colorCurrent.a;

        dot.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        dot.shadowColor = `rgba(${255}, ${215}, ${0}, ${a})`;
      }

      this.drawDot(dot);
    });
  }

  drawDot(dot) {
    if (dot.fillStyle) {
      this.ctx.fillStyle = dot.fillStyle;
    } else {
      const gradient = this.ctx.createLinearGradient(0, this.canvas.height / 2, this.canvas.width, 0);
      gradient.addColorStop(0, "#D7BD64");
      gradient.addColorStop(0.5, "#F3E1A7");
      gradient.addColorStop(1, "#D9BD64");

      this.ctx.fillStyle = gradient;
    }

    this.ctx.beginPath();
    if (this.options.polygonPath) {
      const size = dot.currentSize;
      this.options.polygonPath.forEach(([xPercent, yPercent], index) => {
        const x = dot.x + ((xPercent - 50) / 100) * size;
        const y = dot.y + ((yPercent - 50) / 100) * size;
        if (index === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
      this.ctx.closePath();
    } else {
      const size = dot.currentSize;
      this.ctx.fillRect(dot.x - size / 2, dot.y - size / 2, size, size);
    }

    if (dot.shadowBlur !== undefined) {
      this.ctx.shadowBlur = dot.shadowBlur;
    }

    if (dot.shadowColor) {
      this.ctx.shadowColor = dot.shadowColor;
    }

    this.ctx.fill();
    this.ctx.restore();
  }

  animate() {
    if (!this.isCanvasVisible) {
      requestAnimFrame(this.animate.bind(this));
      return;
    }

    const now = performance.now();
    if (now - this.lastRenderTime < 32) {
      requestAnimFrame(this.animate.bind(this));
      return;
    }
    this.lastRenderTime = now;

    this.updateDots();
    requestAnimFrame(this.animate.bind(this));
  }

  getAnimations() {
    return [
      {
        name: "sparkleAndWaveY",
        sizeFunction: (time, dot, amplitude) => {
          if (!this.dotsReached) {
            amplitude = 1;
            const waveOffset = dot.targetY / (this.options.spacing * 2);
            const sparkleFactor = 1;
            const size =
              (this.options.dotSize +
                Math.sin(time * this.options.waveFrequency + waveOffset) *
                  amplitude) *
              sparkleFactor;
            return size;
          } else if (dot.currentSize !== this.options.dotSize) {
            // Ajuster progressivement la taille pour converger vers this.options.dotSize
            const adjustmentSpeed = 0.05; // Vitesse d'ajustement
            if (dot.currentSize > this.options.dotSize) {
              // Réduction progressive
              dot.currentSize = Math.max(
                dot.currentSize - adjustmentSpeed,
                this.options.dotSize,
              );
            } else {
              // Augmentation progressive
              dot.currentSize = Math.min(
                dot.currentSize + adjustmentSpeed,
                this.options.dotSize,
              );
            }
            return dot.currentSize;
          } else {
            const waveOffset = dot.targetX / (this.options.spacing * 3);
            const sparkleFactor = Math.random() < 0.01 ? 1.1 : 1; // Éclat rare
            return this.options.dotSize * sparkleFactor;
          }
        },
        colorFunction: (time, dot) => {
          // Définir les couleurs principales pour le dégradé
          const colors = [
            { r: 215, g: 189, b: 100 }, // #D7BD64
            { r: 243, g: 225, b: 167 }, // #F3E1A7
            { r: 217, g: 189, b: 100 }, // #D9BD64
          ];

          // Calcule une position oscillante pour le dégradé
          const t = 0.5 + 0.1 * Math.sin(time * 0.001); // Oscille entre 0 et 1

          // Interpolation linéaire entre les couleurs du dégradé
          const startColor = colors[0];
          const endColor = colors[0];

          const r = Math.round(startColor.r + t * (endColor.r - startColor.r));
          const g = Math.round(startColor.g + t * (endColor.g - startColor.g));
          const b = Math.round(startColor.b + t * (endColor.b - startColor.b));

          var opacity = 1;
          const randomNumber = Math.floor(Math.random() * 7); // 0 à 10 inclus
          if (dot.realIndex % randomNumber == 0) {
            if (dot.icolor === undefined || dot.dcolor === undefined) {
                dot.icolor = 0.5;
                dot.dcolor = 1;
            }
             //opacity = 0.5 + 0.3 * Math.sin(time * Math.random() * 500);
             // Variation douce de la couleur
            if (dot.dcolor === 1 && dot.icolor < 30) {
                dot.icolor += 0.1;
                if (dot.icolor >= 1) {
                    dot.dcolor = 0;
                }
            } else if (dot.dcolor === 0 && dot.icolor > 0) {
                dot.icolor -= 0.1;
                if (dot.icolor <= 0.5) {
                    dot.dcolor = 1;
                }
            }
          }
          return { r, g, b, a: dot.icolor };
        },
      },
    ];
  }
}
