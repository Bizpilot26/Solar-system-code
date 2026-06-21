const canvas = document.getElementById('universeCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Central coordinates to base orbits from
let centerX = canvas.width / 2;
let centerY = canvas.height / 2;

// --- Background Starfield Generation ---
const stars = [];
for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.6,
        alpha: Math.random()
    });
}

// --- Planet Data Definition with Realistic Color Gradients & Orbital Mechanics ---
// Speed is set VERY low for slow orbits. Earth is our reference: 0.005 is very slow.
// We adjust others based on standard orbital period ratios (Mercury orbits much faster than Neptune).
const planets = [
    { name: 'Mercury', radius: 4,  orbitRadius: 70,  speed: 0.015,  color: '#8c8c8c', angle: Math.random() * 6 },
    { name: 'Venus',   radius: 8,  orbitRadius: 105, speed: 0.010,  color: '#e3bb76', angle: Math.random() * 6 },
    { name: 'Earth',   radius: 9,  orbitRadius: 140, speed: 0.005,  color: '#2b82c9', angle: 0, 
      moon: { radius: 2.5, orbitRadius: 20, speed: 0.06, color: '#dddddd', angle: Math.random() * 6 } 
    },
    { name: 'Mars',    radius: 7,  orbitRadius: 175, speed: 0.0035, color: '#c1440e', angle: Math.random() * 6 },
    { name: 'Jupiter', radius: 18, orbitRadius: 230, speed: 0.0010, color: '#b07f35', angle: Math.random() * 6 },
    { name: 'Saturn',  radius: 16, orbitRadius: 280, speed: 0.0006, color: '#f2cf8d', angle: Math.random() * 6, hasRings: true },
    { name: 'Uranus',  radius: 13, orbitRadius: 330, speed: 0.0003, color: '#91e1ff', angle: Math.random() * 6 },
    { name: 'Neptune', radius: 12, orbitRadius: 370, speed: 0.0001, color: '#132177', angle: Math.random() * 6 }
];

// Array to store interactive particles
const cosmicDebris = [];

// Handle screen resizing smoothly
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
});

function drawUniverse() {
    // Clear the canvas with slight opacity for subtle motion trails
    ctx.fillStyle = 'rgba(1, 1, 3, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Twinkling Background Starfield
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
        
        // Update twinkling effect slightly
        star.alpha += (Math.random() * 0.06 - 0.03);
        if (star.alpha < 0.1) star.alpha = 0.1;
        if (star.alpha > 1) star.alpha = 1;
    });

    // 2. Draw The Glowing Central Star (The Sun)
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
    sunGradient.addColorStop(0, '#ffffff'); // Pure white core
    sunGradient.addColorStop(0.2, '#ffcc00'); // Deep yellow layer
    sunGradient.addColorStop(1, 'transparent'); // Fading aura
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = sunGradient;
    ctx.fill();

    // 3. Update and Draw Each Planet & Orbit Line
    planets.forEach(planet => {
        // Draw Clear Orbit Line
        ctx.beginPath();
        ctx.arc(centerX, centerY, planet.orbitRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'; // Subtle, dashed white orbit lines
        ctx.lineWidth = 1;
        ctx.stroke();

        // Calculate clear, precise slow movement of the planet
        planet.angle += planet.speed;
        const planetX = centerX + Math.cos(planet.angle) * planet.orbitRadius;
        const planetY = centerY + Math.sin(planet.angle) * planet.orbitRadius;

        // Draw Planet Body with depth gradient
        const planetGrad = ctx.createRadialGradient(planetX - planet.radius/3, planetY - planet.radius/3, 0, planetX, planetY, planet.radius);
        planetGrad.addColorStop(0, '#ffffff'); // Pure highlight
        planetGrad.addColorStop(0.3, planet.color); // Primary planet color
        planetGrad.addColorStop(1, '#000000'); // Shadow for depth

        ctx.beginPath();
        ctx.arc(planetX, planetY, planet.radius, 0, Math.PI * 2);
        ctx.fillStyle = planetGrad;
        ctx.fill();
        
        // Glowing aura (atmosphere/presence)
        ctx.beginPath();
        ctx.arc(planetX, planetY, planet.radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = planet.color;
        ctx.globalAlpha = 0.15; // Subtle, transparent outline
        ctx.stroke();
        ctx.globalAlpha = 1.0; // Reset general transparency

        // Special Planet Features: Saturn's Rings
        if (planet.hasRings) {
            ctx.beginPath();
            ctx.ellipse(planetX, planetY, planet.radius * 1.8, planet.radius * 0.7, planet.angle + Math.PI/2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(242, 207, 141, 0.18)'; // Saturn's unique ring color, slightly transparent
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        // Special Planet Features: Earth's Moon
        if (planet.moon) {
            // Update & Draw Moon Orbit around Earth
            planet.moon.angle += planet.moon.speed;
            const moonX = planetX + Math.cos(planet.moon.angle) * planet.moon.orbitRadius;
            const moonY = planetY + Math.sin(planet.moon.angle) * planet.moon.orbitRadius;

            // Draw Moon Body
            ctx.beginPath();
            ctx.arc(moonX, moonY, planet.moon.radius, 0, Math.PI * 2);
            ctx.fillStyle = planet.moon.color;
            ctx.fill();
        }
    });

    // 4. Update and Draw User Interaction Debris Particles
    for (let i = 0; i < cosmicDebris.length; i++) {
        const p = cosmicDebris[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01; // Gradually fades out

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 243, 255, ${p.life})`; // Particles fade smoothly
        ctx.fill();

        // Efficiently remove dead particles from memory
        if (p.life <= 0) {
            cosmicDebris.splice(i, 1);
            i--; // Adjust index after removing an element
        }
    }

    // Continuously loop the animation at a slow pace
    requestAnimationFrame(drawUniverse);
}

// Function to generate new interactive particles on interaction
function spawnDebris(e) {
    // Detect location of touch or mouse click precisely
    const xPos = e.touches ? e.touches[0].clientX : e.clientX;
    const yPos = e.touches ? e.touches[0].clientY : e.clientY;

    // Spawn 10 tiny particles that drift from that location
    for (let i = 0; i < 10; i++) {
        cosmicDebris.push({
            x: xPos,
            y: yPos,
            vx: (Math.random() * 3 - 1.5), // Drifts in random direction
            vy: (Math.random() * 3 - 1.5),
            size: Math.random() * 2.5 + 1, // Varies in size
            life: 1.0 // Initial life (full opacity)
        });
    }
}

// Add event listeners for both mobile touch and desktop clicks
window.addEventListener('mousedown', spawnDebris);
window.addEventListener('touchstart', spawnDebris);

// Initialize Simulation Engine
drawUniverse();
