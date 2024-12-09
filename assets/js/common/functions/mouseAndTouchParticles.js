export default function mouseAndTouchParticles() {
	const canvas = document.getElementById("particlesCanvas");
	const ctx = canvas.getContext("2d");

	// Canvas dimensions
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Resize canvas on window resize
	window.addEventListener("resize", () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	});

	// Couleurs des particules
	const colors = [
		"#DFB47E",
		"#D09245",
		"#AB7536",
		"#8D5F2B",
		"#784E23",
		"#6C451E",
		"#68421D",
		"#6C451E",
		"#784E23",
		"#8C5E2B",
		"#A97436",
		"#CD9044",
		"#D59647",
		"#E0B580",
		"#DEB077",
		"#D9A35F",
		"#D79C52",
		"#BD8745",
		"#805528",
		"#68421D",
	];

	// Particles array
	const particles = [];
	const maxParticles = 100;

	// Create particles
	function createParticle(x, y) {
		particles.push({
			x: x,
			y: y,
			size: Math.random() * 5 + 1, // Taille aléatoire
			speedX: Math.random() * 3 - 1, // Mouvement horizontal aléatoire
			speedY: Math.random() * 3 - 1, // Mouvement vertical aléatoire
			alpha: 1, // Transparence
			color: colors[Math.floor(Math.random() * colors.length)], // Couleur aléatoire
		});

		if (particles.length > maxParticles) particles.shift(); // Supprimer les plus anciennes
	}

	// Update particles
	function updateParticles() {
		particles.forEach((particle, index) => {
			particle.x += particle.speedX;
			particle.y += particle.speedY;
			particle.alpha -= 0.01; // Disparaît progressivement
			if (particle.alpha <= 0) particles.splice(index, 1); // Supprimer les particules invisibles
		});
	}

	// Draw particles
	function drawParticles() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		particles.forEach((particle) => {
			ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${
				particle.alpha
			})`; // Couleur avec transparence
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
			ctx.fill();
		});
	}

	// Convert HEX to RGB
	function hexToRgb(hex) {
		const bigint = parseInt(hex.replace("#", ""), 16);
		const r = (bigint >> 16) & 255;
		const g = (bigint >> 8) & 255;
		const b = bigint & 255;
		return `${r}, ${g}, ${b}`;
	}

	// Animation loop
	function animate() {
		updateParticles();
		drawParticles();
		requestAnimationFrame(animate);
	}
	animate();

	// Handle mouse/touch events
	function handleMove(e) {
		const x = e.touches ? e.touches[0].clientX : e.clientX;
		const y = e.touches ? e.touches[0].clientY : e.clientY;
		createParticle(x, y);
	}

	canvas.addEventListener("mousemove", handleMove);
	canvas.addEventListener("touchmove", handleMove);
}
