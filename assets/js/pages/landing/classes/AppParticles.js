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
    // Initialisation des propriétés de base, y compris le canvas
    this.canvasId = params.canvasId || "yearCanvas";
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) {
      console.error(`Canvas with ID \"${this.canvasId}\" not found.`);
      return;
    }

    // Préparation du contexte de rendu 2D
    this.ctx = this.canvas.getContext("2d");
    this.parent = this.canvas.parentElement;
    this.canvas.width = this.parent.offsetWidth;
    this.canvas.height = this.parent.offsetHeight;

    // Initialisation des options avec des valeurs par défaut
    this.options = {
      dotSize: params.dotSize || 4.5, // Taille des points
      spacing: params.spacing || 8, // Espacement entre les points
      colors: params.colors || ["#D8BD64"], // Couleurs des points
      waveFrequency: params.waveFrequency || 1.2, // Fréquence de l'animation de vague
      polygonPath: params.polygonPath || null, // Chemin personnalisé pour les points
      offsetStartTime: params.offsetStartTime || 2, // Délai d'apparition
      offsetStartPositionX: params.offsetStartPositionX || params.dotSize / 2,
      offsetStartPositionY: params.offsetStartPositionY || params.dotSize / 2,
      debug: params.debug || false, // Mode debug
    };

    this.dots = []; // Tableau pour stocker les points animés
    this.isCanvasVisible = false; // Indique si le canvas est visible dans la fenêtre

    // Calcul des dimensions de la grille de points
    this.rows = Math.ceil(this.canvas.height / this.options.spacing);
    this.cols = Math.ceil(this.canvas.width / this.options.spacing);

    // Conversion des couleurs hexadécimales en format RGB
    this.parsedColors = this.options.colors.map((color) => {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return { r, g, b };
    });

    this.dotsReached = false; // Indique si tous les points ont atteint leur état final
    this.lastRenderTime = 0; // Dernier temps de rendu de l'animation
    this.styles = this.getAnimations(); // Obtenir les styles d'animation
    this.dotPaths = this.getDotCardPaths(); // Obtenir les chemins pour dessiner les points

    this.initVisibilityObserver(); // Initialiser l'observateur de visibilité
    this.createDots(); // Créer les points
  }

  initVisibilityObserver() {
    // Observer la visibilité du canvas pour gérer les animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isCanvasVisible = entry.isIntersecting;
        if (this.isCanvasVisible) {
          //console.log("Canvas visible. Animation active.");
        } else {
          //console.log("Canvas hidden. Animation paused.");
        }
      });
    });
    observer.observe(this.canvas);
    this.observer = observer; // Stocker l'observateur pour un éventuel nettoyage
  }

  getDotCardPaths() {
    // Définit les coordonnées pour dessiner des formes personnalisées de points
    return [
      [32, 0],
      [100, 0],
      [100, 69],
      [70, 100],
      [0, 100],
      [0, 34],
    ];
  }

  concentrationGrouping(indices) {
    // Regrouper les indices de points autour du centre pour des effets plus concentrés
    let groupedIndices = [];
    let centerX = Math.floor(this.cols / 2);
    let centerY = Math.floor(this.rows / 2);

    // Calcul des distances des points par rapport au centre
    let distances = indices.map(({ row, col, realIndex }) => {
      let dx = col - centerX;
      let dy = row - centerY;
      return { realIndex, row, col, distance: Math.sqrt(dx * dx + dy * dy) };
    });

    // Tri par distance croissante
    distances.sort((a, b) => a.distance - b.distance);

    // Reconstitution des indices triés
    distances.forEach((item) =>
      groupedIndices.push({
        row: item.row,
        col: item.col,
        realIndex: item.realIndex,
      })
    );

    return groupedIndices;
  }

  createDots() {
    // Générer les points de la grille avec des propriétés initiales
    let indices = [];
    let realIndex = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        indices.push({ row, col, realIndex });
        realIndex++;
      }
    }

    // Réorganiser les indices pour des effets visuels spécifiques
    indices = this.concentrationGrouping(indices);

    indices.forEach((pos, index) => {
      const { row, col, realIndex } = pos;
      const xPos =
        col * this.options.spacing + this.options.offsetStartPositionX;
      const yPos =
        row * this.options.spacing + this.options.offsetStartPositionY;
      const color =
        this.parsedColors[Math.floor(Math.random() * this.parsedColors.length)];

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
        fadeSpeed: 0.5, // Vitesse d'apparition
        sizeSpeed: 0.3, // Vitesse de croissance
        startTime: index * this.options.offsetStartTime, // Décalage de démarrage
        color,
        offset: Math.random() * Math.PI * 2,
        realIndex,
      });
    });
  }

  updatePoeticDots(dot) {
    const currentTime = performance.now();

    // Vérifier si le délai de démarrage est écoulé
    if (currentTime < dot.startTime) return;

    // Ajustement progressif de la taille
    if (dot.currentSize < dot.targetSize) {
      dot.currentSize += dot.sizeSpeed * dot.targetSize;
      if (dot.currentSize > dot.targetSize) dot.currentSize = dot.targetSize;
    }

    // Ajustement progressif de l’opacité
    if (dot.opacity < dot.targetOpacity) {
      dot.opacity += dot.fadeSpeed;
      if (dot.opacity > dot.targetOpacity) dot.opacity = dot.targetOpacity;
    }

    // Diminution progressive de la taille si nécessaire
    if (dot.currentSize > dot.targetSize) {
      dot.currentSize -= dot.sizeSpeed * dot.targetSize;
      if (dot.currentSize < dot.targetSize) dot.currentSize = dot.targetSize;
    }

    // Diminution progressive de l’opacité si nécessaire
    if (dot.opacity > dot.targetOpacity) {
      dot.opacity -= dot.fadeSpeed;
      if (dot.opacity < dot.targetOpacity) dot.opacity = dot.targetOpacity;
    }

    // Vérifier si toutes les transitions sont terminées
    if (
      dot.currentSize === dot.targetSize &&
      dot.opacity === dot.targetOpacity
    ) {
      dot.reachedTarget = true;
    }
  }

  updateDots() {
    // Mettre à jour l'animation des points et redessiner le canvas
    const time = Date.now() * 0.002;
    const amplitude = 1.3;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    let currentStyle = this.styles[0];

    this.dots.forEach((dot, index) => {
      dot.index = index;

      // Mettre à jour les points qui n'ont pas encore atteint leur état final
      if (!dot.reachedTarget) {
        this.updatePoeticDots(dot, time);
        if (index == this.dots.length - 1) {
          this.dotsReached = this.dotsReached || dot.reachedTarget;
        }
      }

      if (dot.reachedTarget) {
        // Mise à jour de la taille et des couleurs pour les points stabilisés
        const sizeCurrent = currentStyle.sizeFunction(time, dot, amplitude);
        dot.currentSize = sizeCurrent;

        const colorCurrent = currentStyle.colorFunction(time, dot, amplitude);
        const r = colorCurrent.r;
        const g = colorCurrent.g;
        const b = colorCurrent.b;
        const a = colorCurrent.a;

        dot.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      }

      this.drawDot(dot);
    });
    this.ctx.restore();

    // Affichage des coordonnées en mode debug
    if (this.options.debug) {
      this.ctx.font = "12px Arial";
      this.ctx.fillStyle = "#FF0000";
      this.dots.forEach((dot) => {
        this.ctx.fillText(
          `(${dot.x.toFixed(1)}, ${dot.y.toFixed(1)})`,
          dot.x,
          dot.y - 5
        );
      });
    }
  }

  drawDot(dot) {
    // Dessiner un point sur le canvas
    if (dot.fillStyle) {
      this.ctx.fillStyle = dot.fillStyle;
    } else {
      this.ctx.fillStyle = `rgba(${dot.color.r}, ${dot.color.g}, ${dot.color.b}, ${1})`;
    }

    const size = dot.currentSize;
    this.ctx.beginPath();
    this.dotPaths.forEach(([xPercent, yPercent], index) => {
      const x = dot.x + ((xPercent - 50) / 100) * size;
      const y = dot.y + ((yPercent - 50) / 100) * size;
      if (index === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    });
    this.ctx.closePath();

    this.ctx.fill();
    this.ctx.restore();
  }

  animate() {
    // Animation principale, uniquement si le canvas est visible
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
    requestAnimFrame(this.animate.bind(this));
  }

  getAnimations() {
    // Définit les styles d'animation (taille et couleur dynamiques)
    return [
      {
        name: "sparkleAndWaveY",
        sizeFunction: (time, dot, amplitude) => {
          const alwaysWave = true;
          if (!this.dotsReached || alwaysWave) {
            const waveOffset = dot.targetY / (this.options.spacing * 2);
            const size =
              this.options.dotSize +
              Math.sin(time * this.options.waveFrequency + waveOffset) *
                amplitude;
            return size;
          } else if (dot.currentSize !== this.options.dotSize) {
            const adjustmentSpeed = 0.05; // Ajustement progressif
            if (dot.currentSize > this.options.dotSize) {
              dot.currentSize = Math.max(
                dot.currentSize - adjustmentSpeed,
                this.options.dotSize
              );
            } else {
              dot.currentSize = Math.min(
                dot.currentSize + adjustmentSpeed,
                this.options.dotSize
              );
            }
            return dot.currentSize;
          } else {
            return this.options.dotSize;
          }
        },
        colorFunction: (time, dot) => {
          const minOpacity = 0.6;

          const randomNumber = Math.floor(Math.random() * 7);
          if (dot.realIndex % randomNumber == 0) {
            if (
              dot.opacityColor === undefined ||
              dot.modeIncrementation === undefined
            ) {
              dot.opacityColor = minOpacity;
              dot.modeIncrementation = 1;
            }
            // Variation de l'opacité
            if (dot.modeIncrementation === 1) {
              dot.opacityColor += 0.05;
              if (dot.opacityColor >= 1) {
                dot.modeIncrementation = 0;
              }
            } else {
              dot.opacityColor -= 0.05;
              if (dot.opacityColor <= minOpacity) {
                dot.modeIncrementation = 1;
              }
            }
          }
          return { ...dot.color, a: dot.opacityColor };
        },
      },
    ];
  }

  destroy() {
    // Nettoyer les ressources et arrêter les animations
    if (this.observer) {
      this.observer.disconnect();
    }
    this.dots = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    console.log("AppParticles destroyed.");
  }
}
