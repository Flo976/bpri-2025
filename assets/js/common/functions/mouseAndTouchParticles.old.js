export default function mouseAndTouchParticles() {
    const canvas = document.getElementById("mouseAndTouchParticlesCanvas");
    const ctx = canvas.getContext("2d");

    // Canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Resize canvas on window resize
    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Particles array
    const particles = [];
    const maxParticles = 100;

    // Possible shapes
    const shapes = ["circle", "square", "triangle", "rectangle"];

    // Create particles
    function createParticle(x, y) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 5 + 1, // Random size
            speedX: Math.random() * 3 - 1, // Horizontal movement
            speedY: Math.random() * 3 - 1, // Vertical movement
            opacity: 1, // Initial transparency
            shape: shapes[Math.floor(Math.random() * shapes.length)], // Random shape
            offset: Math.random() * 1000, // Unique offset for animation
        });

        if (particles.length > maxParticles) particles.shift(); // Remove oldest particles
    }

    // Update particles
    function updateParticles() {
        const time = Date.now() * 0.001; // Time in seconds
        particles.forEach((particle, index) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.opacity -= 0.01; // Gradually fade out

            // Remove invisible particles
            if (particle.opacity <= 0) particles.splice(index, 1);
        });
    }

    // Draw particles
    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const time = Date.now() * 0.002; // Time in seconds

        particles.forEach((particle) => {
            const timeFactor = time + particle.offset; // Unique animation per particle
            const red = 212 + Math.sin(timeFactor * 0.1) * 20; // Red oscillation
            const green = 175 + Math.sin(timeFactor * 0.1) * 10; // Green oscillation
            const blue = 55; // Constant blue for golden effect

            ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${particle.opacity})`;

            ctx.beginPath();
            if (particle.shape === "circle") {
                // Draw a circle
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            } else if (particle.shape === "square") {
                // Draw a square
                ctx.rect(
                    particle.x - particle.size / 2,
                    particle.y - particle.size / 2,
                    particle.size,
                    particle.size
                );
            } else if (particle.shape === "triangle") {
                // Draw a triangle
                ctx.moveTo(particle.x, particle.y - particle.size); // Top vertex
                ctx.lineTo(
                    particle.x - particle.size,
                    particle.y + particle.size
                ); // Bottom left vertex
                ctx.lineTo(
                    particle.x + particle.size,
                    particle.y + particle.size
                ); // Bottom right vertex
                ctx.closePath();
            } else if (particle.shape === "rectangle") {
                // Draw a rectangle
                ctx.rect(
                    particle.x - particle.size,
                    particle.y - particle.size / 2,
                    particle.size * 2,
                    particle.size
                );
            }
            ctx.fill();
        });
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