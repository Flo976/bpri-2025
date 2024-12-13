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

  shuffleGrouping(indices) {
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
  }

  zigzagGrouping(indices) {
    let groupedIndices = [];
    let direction = 1; // 1 for right, -1 for left

    for (let row = 0; row < this.rows; row++) {
      if (direction === 1) {
        for (let col = 0; col < this.cols; col++) {
          groupedIndices.push({ row, col });
        }
      } else {
        for (let col = this.cols - 1; col >= 0; col--) {
          groupedIndices.push({ row, col });
        }
      }
      direction *= -1;
    }

    return groupedIndices;
  }

  inverseSpiralGrouping(indices) {
    let groupedIndices = [];
    let top = this.rows - 1;
    let bottom = 0;
    let left = this.cols - 1;
    let right = 0;

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

  cascadeGrouping(indices) {
    let groupedIndices = [];

    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        groupedIndices.push({ row, col });
      }
    }

    return groupedIndices;
  }

  concentrationGrouping(indices) {
    let groupedIndices = [];
    let centerX = Math.floor(this.cols / 2);
    let centerY = Math.floor(this.rows / 2);

    // Tri des indices par proximité du centre
    let distances = indices.map(({ row, col }) => {
      let dx = col - centerX;
      let dy = row - centerY;
      return { row, col, distance: Math.sqrt(dx * dx + dy * dy) };
    });

    // Tri par distance croissante
    distances.sort((a, b) => a.distance - b.distance);

    // Regrouper les indices triés
    distances.forEach((item) =>
      groupedIndices.push({ row: item.row, col: item.col }),
    );

    return groupedIndices;
  }

  createDots() {
    let indices = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        indices.push({ row, col });
      }
    }

    // Mélanger les indices
    //this.shuffleArray(indices);
    //indices = this.zigzagGrouping(indices, cols, rows);
    //indices = this.inverseSpiralGrouping(indices, cols, rows);
    //indices = this.cascadeGrouping(indices, cols, rows);
    indices = this.concentrationGrouping(indices);

    indices.forEach((pos, index) => {
      const { row, col } = pos;
      const xPos = (col * this.options.spacing) + (this.options.dotSize / 2);
      const yPos = (row * this.options.spacing) + (this.options.dotSize / 2);
      const color =
        this.parsedColors[Math.floor(Math.random() * this.parsedColors.length)];
      const fromLeft = xPos < this.canvas.width / 2;

      if (this.options.moveType === "slide") {
        this.dots.push({
          x: fromLeft
            ? xPos - this.canvas.width / 2
            : xPos + this.canvas.width / 2,
          y: yPos,
          targetX: xPos,
          targetY: yPos,
          color,
          speed: 5,
          currentSize: this.options.dotSize,
          opacity: 0,
          reachedTarget: false,
          offset: Math.random() * Math.PI * 2,
        });
      } else if (this.options.moveType === "poetic") {
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
        });
      }
    });
  }

  updateSlideDots(dot) {
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
    if (this.options.animationType === "sparkle") {
      currentStyle = this.styles[0];
    } else if (this.options.animationType === "sparkleAndWaveY") {
      currentStyle = this.styles[1];
    } else if (this.options.animationType === "sparkleAndWaveX") {
      currentStyle = this.styles[2];
    }

    this.dots.forEach((dot, index) => {
      if (!dot.reachedTarget) {
        if (this.options.moveType === "slide") {
          this.updateSlideDots(dot);
        } else if (this.options.moveType === "poetic") {
          this.updatePoeticDots(dot, time);
        }
        if (index == this.dots.length - 1) {
          this.dotsReached = this.dotsReached || dot.reachedTarget;
        }
      }

      if (dot.reachedTarget) {
        // Interpoler la taille
        const sparkleFactor = Math.random() < 0.01 ? 1.05 : 0; // Éclat rare
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

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  drawDot(dot) {
    if (dot.fillStyle) {
      this.ctx.fillStyle = dot.fillStyle;
    } else {
      this.ctx.fillStyle = `rgba(${dot.color.r}, ${dot.color.g}, ${
        dot.color.b
      }, ${dot.opacity || 1})`;
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
    //this.ctx.shadowBlur = 0;
  }

  checkStyleChange(now) {
    if (now - this.lastStyleChange > 5000) {
      this.styleTransitionStart = performance.now();
      this.currentStyleIndex = this.nextStyleIndex;
      this.nextStyleIndex = (this.nextStyleIndex + 1) % this.styles.length;
      this.lastStyleChange = now;
    }
  }

  animate() {
    if (!this.isCanvasVisible) {
      requestAnimFrame(this.animate.bind(this));
      return;
    }

    const now = performance.now();
    if (now - this.lastRenderTime < 16) {
      requestAnimFrame(this.animate.bind(this));
      return;
    }
    this.lastRenderTime = now;

    this.updateDots();
    //this.checkStyleChange(now);
    requestAnimFrame(this.animate.bind(this));
  }

  getAnimations() {
    return [
      {
        name: "sparkle",
        sizeFunction: (time, dot, amplitude) => {
          return this.options.dotSize;
        },
        colorFunction: (time, dot) => {
          const sparkleFactor = Math.random() < 0.0001 ? 1.5 : 1; // Éclat rare
          const timeFactor = time + Math.random() * 5000; // Délai aléatoire pour chaque
          return {
            r: 212 + sparkleFactor + Math.sin(timeFactor * 0.1) * 20,
            g: 175 + sparkleFactor + Math.cos(timeFactor * 0.1) * 15,
            b: 55,
            a: 1,
          };
        },
      },
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
            // Liste des valeurs possibles
          const values = [1.1, 1.2, 1.3, 1.4, 1.5];
          // Sélection aléatoire
          const randomValue = values[Math.floor(Math.random() * values.length)];
            const waveOffset = dot.targetX / (this.options.spacing * 3);
            const sparkleFactor = Math.random() < 0.01 ? randomValue : 1; // Éclat rare
            return (this.options.dotSize * sparkleFactor);
          }
        },
        colorFunction: (time, dot) => {
          const sparkleFactor = Math.random() < 0.01 ? 10 : 1; // Éclat rare
          const timeFactor = time + Math.random() * 5000; // Délai aléatoire pour chaque
          return {
            r: 212 + sparkleFactor + Math.sin(timeFactor * 0.5) * 25,
            g: 175 + sparkleFactor + Math.cos(timeFactor * 0.1) * 20,
            b: 10,
            a: 1,
          };
        },
      },
      {
        name: "sparkleAndWaveX",
        sizeFunction: (time, dot, amplitude) => {
          const waveOffset = dot.targetX / (this.options.spacing * 3);
          const sparkleFactor = Math.random() < 0.01 ? 1.5 : 1; // Éclat rare
          return (
            (this.options.dotSize +
              Math.sin(time * this.options.waveFrequency + waveOffset) *
                amplitude) *
            sparkleFactor
          );
        },
        colorFunction: (time, dot) => {
          const sparkleFactor = Math.random() < 0.01 ? 1.5 : 1; // Éclat rare
          const timeFactor = time + Math.random() * 5000; // Délai aléatoire pour chaque
          return {
            r: 212 + sparkleFactor + Math.sin(timeFactor * 0.1) * 20,
            g: 175 + sparkleFactor + Math.cos(timeFactor * 0.1) * 15,
            b: 55,
            a: 1,
          };
        },
      },
      {
        name: "sparkleAndWaveZ",
        sizeFunction: (time, dot, amplitude) => {
          const waveOffset = dot.targetX / (this.options.spacing * 3);
          const sparkleFactor = Math.random() < 0.01 ? 1.5 : 1; // Éclat rare
          return (
            this.options.dotSize +
            Math.sin(time * this.options.waveFrequency + waveOffset) *
              amplitude +
            Math.cos(sparkleFactor * 0.1) * 2
          );
        },
        colorFunction: (time, dot) => {
          const sparkleFactor = Math.random() < 0.01 ? 1.5 : 1; // Éclat rare
          const timeFactor = time + Math.random() * 5000; // Délai aléatoire pour chaque
          return {
            r: 212 + sparkleFactor + Math.sin(timeFactor * 0.1) * 20,
            g: 175 + sparkleFactor + Math.cos(timeFactor * 0.1) * 15,
            b: 55,
            a: 1,
          };
        },
      },
    ];
  }
}
