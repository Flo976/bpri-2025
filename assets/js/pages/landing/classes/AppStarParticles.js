window.requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };

export default class AppStarParticles {
    constructor(params = {}) {
        // Initialisation du canvas et du contexte
        this.canvasId = params.canvasId || "yearCanvas"; 
        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) {
            console.error(`Canvas with ID "${this.canvasId}" not found.`);
            return;
        }
        this.ctx = this.canvas.getContext("2d");

        // Réglage de la taille du canvas en fonction du parent
        this.parent = this.canvas.parentElement;
        this.canvas.width = this.parent.offsetWidth;
        this.canvas.height = this.parent.offsetHeight;

        // Paramètres des particules
        this.dotSize = params.dotSize || 4.5; 
        this.spacing = params.spacing || 8;
        this.numStars = 100; // Nombre d'étoiles
        this.particles = [];
        this.maxSpeed = 0.9; 
        this.depthFactor = 0.01; // Facteur de profondeur pour l'effet de zoom

        this.createStars(); // Créer les étoiles initiales

        // Démarrer l'animation
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
        this.animate();
    }

    // Créer les étoiles avec des propriétés de profondeur, vitesse, taille
    createStars() {
        for (let i = 0; i < this.numStars; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width, // Position X aléatoire
                y: Math.random() * this.canvas.height, // Position Y aléatoire
                size: Math.random() * this.dotSize + 1, // Taille aléatoire
                speedX: Math.random() * this.maxSpeed - this.maxSpeed / 2, // Vitesse X
                speedY: Math.random() * this.maxSpeed - this.maxSpeed / 2, // Vitesse Y
                depth: Math.random() * 3 + 0.5, // Profondeur (plus la profondeur est petite, plus l'étoile est proche)
                opacity: Math.random() * 0.5 + 0.5, // Opacité initiale
            });
        }
    }

    // Dessiner une étoile avec un effet de "profondité"
    drawStar(star) {
        // Calculer la taille de l'étoile en fonction de sa profondeur
        const size = star.size * star.depth;
        const opacity = star.opacity;
        const gradient = this.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size);
        
        // Appliquer la couleur or à l'étoile
        gradient.addColorStop(0, `rgba(215, 189, 100, ${opacity})`); 
        gradient.addColorStop(1, `rgba(215, 189, 100, 0)`); 

        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, size, 0, Math.PI * 2, false);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    // Mettre à jour la position des étoiles (avec effet de mouvement vers l'observateur)
    updateStars(time) {
        this.particles.forEach(star => {
            star.x += star.speedX;
            star.y += star.speedY;

            // Réinitialiser la position des étoiles une fois qu'elles dépassent les bords
            if (star.x > this.canvas.width) star.x = 0;
            if (star.x < 0) star.x = this.canvas.width;
            if (star.y > this.canvas.height) star.y = 0;
            if (star.y < 0) star.y = this.canvas.height;

            // Proximité (zoom effect) : Plus l'étoile est proche, plus elle devient grande
            star.size += star.depth * this.depthFactor; // Augmenter la taille avec la profondeur

            // Effet de scintillement avec la taille et l'opacité
            const sizeRandomness = Math.random() * 0.5 + 0.5;
            star.size = this.dotSize * sizeRandomness + Math.sin(time * 0.1) * 2; // Variation de la taille
            star.opacity = Math.random() * 0.5 + 0.5 + Math.sin(time * 0.05) * 0.5; // Variation d'opacité
        });
    }

    // Dessiner toutes les étoiles avec l'effet "Space Jump"
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Effacer le canvas
        this.particles.forEach(star => this.drawStar(star)); // Dessiner chaque étoile
    }

    // Lancer l'animation infinie
    animate(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.updateStars(time); // Mettre à jour les positions des étoiles
        this.draw(); // Dessiner les étoiles mises à jour

        requestAnimationFrame(this.animate); // Continuer l'animation
    }
}