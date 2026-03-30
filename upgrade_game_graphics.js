const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const games = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));

const advancedGraphicsScript = `
            // Advanced Particle System Graphics
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');

            // Adjust canvas to match device pixel ratio for sharper graphics
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = \`\${rect.width}px\`;
            canvas.style.height = \`\${rect.height}px\`;

            let particles = [];
            const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ff6348'];
            let mouse = { x: canvas.width / (2 * dpr), y: canvas.height / (2 * dpr) };

            canvas.addEventListener('mousemove', (e) => {
                const r = canvas.getBoundingClientRect();
                mouse.x = e.clientX - r.left;
                mouse.y = e.clientY - r.top;
            });

            class Particle {
                constructor() {
                    this.x = Math.random() * (canvas.width / dpr);
                    this.y = Math.random() * (canvas.height / dpr);
                    this.vx = (Math.random() - 0.5) * 2;
                    this.vy = (Math.random() - 0.5) * 2;
                    this.radius = Math.random() * 3 + 1;
                    this.color = colors[Math.floor(Math.random() * colors.length)];
                }
                update() {
                    this.x += this.vx;
                    this.y += this.vy;

                    if (this.x < 0 || this.x > canvas.width / dpr) this.vx = -this.vx;
                    if (this.y < 0 || this.y > canvas.height / dpr) this.vy = -this.vy;

                    // Mouse interaction
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 100) {
                        this.x -= dx * 0.02;
                        this.y -= dy * 0.02;
                    }
                }
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = this.color;
                    ctx.fill();
                    ctx.closePath();
                    ctx.shadowBlur = 0; // Reset
                }
            }

            for (let i = 0; i < 80; i++) particles.push(new Particle());

            function animate() {
                // Trail effect
                ctx.fillStyle = 'rgba(10, 14, 23, 0.3)';
                ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

                particles.forEach(p => p.update());

                // Draw connecting lines
                for(let i=0; i<particles.length; i++) {
                    for(let j=i; j<particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx*dx + dy*dy);

                        if(dist < 80) {
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.strokeStyle = \`rgba(255, 255, 255, \${1 - dist/80})\`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }

                particles.forEach(p => p.draw());
                requestAnimationFrame(animate);
            }
            animate();
`;

let upgradedCount = 0;

games.forEach(gameFile => {
    const filePath = path.join(gamesDir, gameFile);
    let content = fs.readFileSync(filePath, 'utf-8');

    // We want to replace the old basic bouncing ball code with our new advanced particle system
    // The old code usually looks like:
    // const canvas = document.getElementById('gameCanvas'); ... let hue = 0; ... draw();

    if (content.includes('let hue = 0;')) {
        // Regex to match everything from getting the canvas context down to the draw() call
        const regex = /const canvas = document\.getElementById\('gameCanvas'\);[\s\S]*?draw\(\);/g;
        if (regex.test(content)) {
            content = content.replace(regex, advancedGraphicsScript);
            fs.writeFileSync(filePath, content);
            upgradedCount++;
        }
    } else if (content.includes('canvas.getContext(\'2d\');')) {
         // Fallback if the script structure is slightly different but still basic
         const regex = /const canvas = document\.getElementById\('gameCanvas'\);[\s\S]*?(?=\/\/ Randomly award XP|\<\/script\>)/g;
         if (regex.test(content) && !content.includes('class Particle')) { // Don't replace if already upgraded
             content = content.replace(regex, advancedGraphicsScript);
             fs.writeFileSync(filePath, content);
             upgradedCount++;
         }
    }
});

console.log(`Upgraded canvas graphics for ${upgradedCount} games.`);
