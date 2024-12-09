export default function appParticles(params = {}) {
  const canvasId = params.canvasId || "yearCanvas"; // ID du canvas par défaut
  const canvas = document.getElementById(canvasId);

  if (!canvas) {
    console.error(`Canvas with ID "${canvasId}" not found.`);
    return; // Arrêter l'exécution si le canvas n'est pas trouvé
  }

  const ctx = canvas.getContext("2d");
  const parent = canvas.parentElement;

  // Dimensions du canvas
  canvas.width = parent.offsetWidth;
  canvas.height = parent.offsetHeight;

  // Options par défaut avec paramètres personnalisables
  const options = {
    dotSize: params.dotSize || 4.5, // Taille des pastilles
    spacing: params.spacing || 8, // Espacement entre les pastilles
    animationType: params.animationType || "waveHorizontal", // Type d'animation
    moveType: params.moveType || "linear", // Type de mouvement (linear ou closeWindow)
    colors: params.colors || ["#D7BD64"], // Palette de couleurs
    waveFrequency: params.waveFrequency || 0.5, // Contrôle la densité des vagues
    polygonPath: params.polygonPath || null, // Forme personnalisée en chemin
  };

  const { dotSize, spacing, animationType, moveType, colors, waveFrequency, polygonPath } = options;

  // Calcul des lignes et colonnes
  const rows = Math.ceil(canvas.height / spacing);
  const cols = Math.ceil(canvas.width / spacing);

  // Tableau des pastilles
  const dots = [];

  // Créer des pastilles avec position initiale hors écran
  function createDots() {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const fromLeft = col % 2 === 0; // Alterne la direction (gauche/droite)
        const color = colors[Math.floor(Math.random() * colors.length)];
        dots.push({
          x: fromLeft ? -spacing : canvas.width + spacing,
          y: row * spacing,
          targetX: col * spacing,
          targetY: row * spacing,
          color: color,
          speed: Math.random() * 3 + 2,
          currentSize: dotSize,
          opacity: 0,
          reachedTarget: false,
          offset: Math.random() * Math.PI * 2,
          moveDirectionX: fromLeft ? 1 : -1, // Direction pour le mouvement X
        });
      }
    }
  }

  // Mettre à jour les positions et animations
  function updateDots() {
    const time = Date.now() * 0.002;
    const amplitude = 2;

    dots.forEach(dot => {
      if (!dot.reachedTarget) {
        if (moveType === "linear") {
          // Déplacement classique vers la position cible
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
        } else if (moveType === "closeWindow") {
          // Effet "voile qui se ferme"
          const centerX = canvas.width / 2;

          // Diviser les pastilles en deux groupes, gauche et droite
          if (dot.x < centerX) {
            // Pour les pastilles à gauche, elles viennent de gauche vers le centre
            if (dot.x < dot.targetX) {
              dot.x += dot.speed;
              if (dot.x > dot.targetX) dot.x = dot.targetX; // Ne pas dépasser la cible
            }
          } else {
            // Pour les pastilles à droite, elles viennent de droite vers le centre
            if (dot.x > dot.targetX) {
              dot.x -= dot.speed;
              if (dot.x < dot.targetX) dot.x = dot.targetX; // Ne pas dépasser la cible
            }
          }

          if (dot.y < dot.targetY) {
            dot.y += dot.speed;
            if (dot.y > dot.targetY) dot.y = dot.targetY;
          } else if (dot.y > dot.targetY) {
            dot.y -= dot.speed;
            if (dot.y < dot.targetY) dot.y = dot.targetY;
          }
        }

        if (dot.x === dot.targetX && dot.y === dot.targetY) {
          dot.reachedTarget = true;
        }
      }

      if (dot.reachedTarget) {
        const rowWaveOffset = dot.targetY / spacing;
        const colWaveOffset = dot.targetX / spacing;

        if (animationType === "waveHorizontal") {
          dot.currentSize =
            dotSize + Math.sin(time * waveFrequency + rowWaveOffset) * amplitude;
        } else if (animationType === "waveVertical") {
          dot.currentSize =
            dotSize + Math.sin(time * waveFrequency + colWaveOffset) * amplitude;
        } else if (animationType === "twinkle") {
          dot.opacity = Math.sin(time * waveFrequency + dot.offset) * 0.5 + 0.5;
        }
      }
    });
  }

  // Dessiner les pastilles avec un polygone personnalisé
  function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(dot => {
      ctx.fillStyle = `rgba(${parseInt(dot.color.slice(1, 3), 16)}, ${parseInt(dot.color.slice(3, 5), 16)}, ${parseInt(dot.color.slice(5, 7), 16)}, ${dot.opacity || 1})`;

      ctx.beginPath();

      if (polygonPath) {
        // Dessiner un polygone à partir du chemin défini
        const size = dot.currentSize;
        polygonPath.forEach(([xPercent, yPercent], index) => {
          const x = dot.x + (xPercent - 50) / 100 * size;
          const y = dot.y + (yPercent - 50) / 100 * size;

          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
      } else {
        // Dessiner un carré par défaut
        const size = dot.currentSize;
        ctx.fillRect(dot.x - size / 2, dot.y - size / 2, size, size);
      }

      ctx.fill();
    });
  }

  // Animation
  function animate() {
    updateDots();
    drawDots();
    requestAnimationFrame(animate);
  }

  // Initialisation
  createDots();
  animate();

  // Redimensionnement de la fenêtre
  window.addEventListener("resize", () => {
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    dots.length = 0;
    createDots();
  });
}
