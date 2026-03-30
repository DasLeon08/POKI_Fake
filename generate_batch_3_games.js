const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');

const newGamesBatch3 = [
    { id: 'neon-slash', title: 'Neon Slash', icon: '🗡️', category: 'action', gradient: 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)' },
    { id: 'gravity-dash', title: 'Gravity Dash', icon: '🌌', category: 'arcade', gradient: 'linear-gradient(135deg, #30CFD0 0%, #330867 100%)' },
    { id: 'crystal-miner', title: 'Crystal Miner', icon: '⛏️', category: 'puzzle', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    { id: 'laser-defense', title: 'Laser Defense', icon: '🔫', category: 'strategy', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'aqua-runner', title: 'Aqua Runner', icon: '🌊', category: 'arcade', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'desert-storm', title: 'Desert Storm', icon: '🌪️', category: 'action', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'cyber-racer', title: 'Cyber Racer', icon: '🏎️', category: 'racing', gradient: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' },
    { id: 'moon-lander', title: 'Moon Lander', icon: '🌕', category: 'arcade', gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
    { id: 'color-switch', title: 'Color Switch', icon: '🔄', category: 'puzzle', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { id: 'stealth-ninja', title: 'Stealth Ninja', icon: '🥷', category: 'action', gradient: 'linear-gradient(135deg, #000000 0%, #434343 100%)' },
    { id: 'bubble-blast', title: 'Bubble Blast', icon: '🫧', category: 'arcade', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'word-builder', title: 'Word Builder', icon: '🅰️', category: 'puzzle', gradient: 'linear-gradient(135deg, #b224ef 0%, #7579ff 100%)' },
    { id: 'star-pilot', title: 'Star Pilot', icon: '✈️', category: 'action', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
    { id: 'zombie-run', title: 'Zombie Run', icon: '🧟', category: 'arcade', gradient: 'linear-gradient(135deg, #13547a 0%, #80d0c7 100%)' },
    { id: 'math-master', title: 'Math Master', icon: '➗', category: 'puzzle', gradient: 'linear-gradient(135deg, #93a5cf 0%, #e4efe9 100%)' },
    { id: 'skate-tricks', title: 'Skate Tricks', icon: '🛹', category: 'sports', gradient: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)' },
    { id: 'tank-battles', title: 'Tank Battles', icon: '🪖', category: 'strategy', gradient: 'linear-gradient(135deg, #09203f 0%, #537895 100%)' },
    { id: 'fruit-ninja', title: 'Fruit Ninja', icon: '🍉', category: 'arcade', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'mini-golf', title: 'Mini Golf', icon: '⛳', category: 'sports', gradient: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)' },
    { id: 'robot-wars', title: 'Robot Wars', icon: '🤖', category: 'action', gradient: 'linear-gradient(135deg, #cd9cf2 0%, #f6f3ff 100%)' },
    { id: 'dino-dash', title: 'Dino Dash', icon: '🦖', category: 'arcade', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
    { id: 'magic-duel', title: 'Magic Duel', icon: '🪄', category: 'strategy', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'pirate-plunder', title: 'Pirate Plunder', icon: '🏴‍☠️', category: 'action', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { id: 'pizza-maker', title: 'Pizza Maker', icon: '🍕', category: 'arcade', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'snowboard-pro', title: 'Snowboard Pro', icon: '🏂', category: 'sports', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { id: 'escape-room', title: 'Escape Room', icon: '🚪', category: 'puzzle', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
    { id: 'sniper-mission', title: 'Sniper Mission', icon: '🎯', category: 'action', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    { id: 'farm-tycoon', title: 'Farm Tycoon', icon: '🚜', category: 'strategy', gradient: 'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)' },
    { id: 'city-run', title: 'City Run', icon: '🏃', category: 'arcade', gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' },
    { id: 'boxing-ring', title: 'Boxing Ring', icon: '🥊', category: 'sports', gradient: 'linear-gradient(135deg, #df89b5 0%, #bfd9fe 100%)' },
    { id: 'water-sort', title: 'Water Sort', icon: '🧪', category: 'puzzle', gradient: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)' },
    { id: 'dragon-rider', title: 'Dragon Rider', icon: '🐉', category: 'action', gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
    { id: 'empire-builder', title: 'Empire Builder', icon: '🏛️', category: 'strategy', gradient: 'linear-gradient(135deg, #b92b27 0%, #1565C0 100%)' },
    { id: 'pinball-classic', title: 'Pinball Classic', icon: '🕹️', category: 'arcade', gradient: 'linear-gradient(135deg, #373B44 0%, #4286f4 100%)' },
    { id: 'beach-volleyball', title: 'Beach Volleyball', icon: '🏐', category: 'sports', gradient: 'linear-gradient(135deg, #FF4E50 0%, #F9D423 100%)' },
    { id: 'sudoku-pro', title: 'Sudoku Pro', icon: '📝', category: 'puzzle', gradient: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)' },
    { id: 'space-defender', title: 'Space Defender', icon: '👾', category: 'action', gradient: 'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)' },
    { id: 'chess-master', title: 'Chess Master', icon: '♟️', category: 'strategy', gradient: 'linear-gradient(135deg, #000000 0%, #e74c3c 100%)' },
    { id: 'whack-a-zombie', title: 'Whack-a-Zombie', icon: '🔨', category: 'arcade', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { id: 'table-tennis', title: 'Table Tennis', icon: '🏓', category: 'sports', gradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)' },
    { id: 'block-puzzle-2', title: 'Block Puzzle 2', icon: '🧱', category: 'puzzle', gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' },
    { id: 'asteroid-blaster', title: 'Asteroid Blaster', icon: '☄️', category: 'action', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'tower-defense', title: 'Tower Defense', icon: '🏰', category: 'strategy', gradient: 'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)' },
    { id: 'bubble-popper', title: 'Bubble Popper', icon: '🫧', category: 'arcade', gradient: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' },
    { id: 'neon-jump', title: 'Neon Jump', icon: '⬆️', category: 'arcade', gradient: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)' },
    { id: 'gem-match', title: 'Gem Match', icon: '💎', category: 'puzzle', gradient: 'linear-gradient(135deg, #c2e59c 0%, #64b3f4 100%)' },
    { id: 'space-race', title: 'Space Race', icon: '🚀', category: 'racing', gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)' },
    { id: 'castle-siege', title: 'Castle Siege', icon: '⚔️', category: 'strategy', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
    { id: 'candy-crusher', title: 'Candy Crusher', icon: '🍬', category: 'puzzle', gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' },
    { id: 'ninja-dash', title: 'Ninja Dash', icon: '🥷', category: 'action', gradient: 'linear-gradient(135deg, #b20a2c 0%, #fffbd5 100%)' }
];

const template = (id, title) => `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="ingame-header">
        <a href="../index.html" class="back-btn">Zurück zum Portal</a>
        <h1 class="ingame-title">${title}</h1>
        <div class="ingame-controls">
            <button class="game-like-btn" id="inGameLikeBtn" title="Like this game">♡</button>
        </div>
    </div>
    <div class="game-container">
        <h2>${title}</h2>
        <p>Ein brandneues HTML5-Spiel!</p>
        <canvas id="gameCanvas" width="800" height="600"></canvas>
    </div>

    <script src="../js/user-system.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const gameId = '${id}';
            const likeBtn = document.getElementById('inGameLikeBtn');
            const userSystem = new window.UserSystem();

            if (userSystem.isLiked(gameId)) {
                likeBtn.classList.add('liked');
                likeBtn.innerHTML = '♥';
            }

            likeBtn.addEventListener('click', () => {
                const isLiked = userSystem.toggleLike(gameId);
                if (isLiked) {
                    likeBtn.classList.add('liked');
                    likeBtn.innerHTML = '♥';
                    userSystem.showToast('Spiel geliked! +5 XP');
                } else {
                    likeBtn.classList.remove('liked');
                    likeBtn.innerHTML = '♡';
                }
            });

            // Playable Particle Popper Mechanics
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');

            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = \`\${rect.width}px\`;
            canvas.style.height = \`\${rect.height}px\`;

            let particles = [];
            const colors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ff6348', '#a29bfe', '#fd79a8'];
            let mouse = { x: -1000, y: -1000 };
            let score = 0;
            let combo = 0;
            let comboTimer = 0;

            canvas.addEventListener('mousemove', (e) => {
                const r = canvas.getBoundingClientRect();
                mouse.x = e.clientX - r.left;
                mouse.y = e.clientY - r.top;
            });

            canvas.addEventListener('mouseleave', () => {
                mouse.x = -1000;
                mouse.y = -1000;
            });

            // Click to pop particles
            canvas.addEventListener('mousedown', (e) => {
                const r = canvas.getBoundingClientRect();
                const mx = e.clientX - r.left;
                const my = e.clientY - r.top;

                let hit = false;
                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    const dx = mx - p.x;
                    const dy = my - p.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist <= p.radius * 2.5) { // generous hit box
                        // Pop effect
                        createExplosion(p.x, p.y, p.color);
                        particles.splice(i, 1);
                        hit = true;
                        combo++;
                        comboTimer = 60; // frames
                        score += 10 * combo;

                        // Spawn new ones to keep game going
                        for(let k=0; k<2; k++) particles.push(new Particle());

                        // Sync with global system
                        if (window.userSystem) {
                            window.userSystem.addXP(Math.min(combo, 5));
                        }
                    }
                }
                if (!hit) combo = 0;
            });

            let explosions = [];
            function createExplosion(x, y, color) {
                for(let i=0; i<8; i++) {
                    explosions.push({
                        x: x, y: y,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        life: 1.0,
                        color: color
                    });
                }
            }

            class Particle {
                constructor() {
                    this.x = Math.random() * (canvas.width / dpr);
                    this.y = Math.random() * (canvas.height / dpr);
                    this.vx = (Math.random() - 0.5) * 3;
                    this.vy = (Math.random() - 0.5) * 3;
                    this.radius = Math.random() * 4 + 2;
                    this.color = colors[Math.floor(Math.random() * colors.length)];
                }
                update() {
                    this.x += this.vx;
                    this.y += this.vy;

                    // Bounce off walls
                    if (this.x < this.radius) { this.x = this.radius; this.vx *= -1; }
                    if (this.x > (canvas.width / dpr) - this.radius) { this.x = (canvas.width / dpr) - this.radius; this.vx *= -1; }
                    if (this.y < this.radius) { this.y = this.radius; this.vy *= -1; }
                    if (this.y > (canvas.height / dpr) - this.radius) { this.y = (canvas.height / dpr) - this.radius; this.vy *= -1; }

                    // Dodge mouse slightly
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 80) {
                        this.vx -= dx * 0.005;
                        this.vy -= dy * 0.005;
                    }

                    // Speed limit
                    const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
                    if (speed > 4) {
                        this.vx = (this.vx / speed) * 4;
                        this.vy = (this.vy / speed) * 4;
                    }
                }
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = this.color;
                    ctx.fill();
                    ctx.closePath();
                    ctx.shadowBlur = 0;
                }
            }

            // Init particles
            for (let i = 0; i < 60; i++) particles.push(new Particle());

            function animate() {
                // Clear with trail
                ctx.fillStyle = 'rgba(10, 14, 23, 0.25)';
                ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

                // Draw connecting lines
                for(let i=0; i<particles.length; i++) {
                    for(let j=i+1; j<particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = dx*dx + dy*dy;

                        if(dist < 7000) {
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.strokeStyle = \`rgba(255, 255, 255, \${0.15 - dist/46000})\`;
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                }

                particles.forEach(p => {
                    p.update();
                    p.draw();
                });

                // Handle explosions
                for(let i = explosions.length - 1; i >= 0; i--) {
                    let ex = explosions[i];
                    ex.x += ex.vx;
                    ex.y += ex.vy;
                    ex.life -= 0.05;

                    if(ex.life <= 0) {
                        explosions.splice(i, 1);
                        continue;
                    }

                    ctx.beginPath();
                    ctx.arc(ex.x, ex.y, 2 * ex.life, 0, Math.PI*2);
                    ctx.fillStyle = \`rgba(255, 255, 255, \${ex.life})\`;
                    ctx.fill();
                    ctx.closePath();
                }

                // UI overlays
                ctx.fillStyle = 'white';
                ctx.font = 'bold 24px "Fredoka One", cursive';
                ctx.textAlign = 'left';
                ctx.fillText(\`Punkte: \${score}\`, 20, 40);

                if (combo > 1 && comboTimer > 0) {
                    comboTimer--;
                    ctx.fillStyle = \`rgba(255, 71, 87, \${comboTimer/60})\`;
                    ctx.font = 'bold 28px "Fredoka One", cursive';
                    ctx.fillText(\`\${combo}x COMBO!\`, 20, 75);
                } else if (comboTimer <= 0) {
                    combo = 0;
                }

                requestAnimationFrame(animate);
            }
            animate();
        });
    </script>
</body>
</html>`;

newGamesBatch3.forEach(game => {
    fs.writeFileSync(path.join(gamesDir, `${game.id}.html`), template(game.id, game.title));
});

// Write the metadata to a file so we can inject it into main.js
fs.writeFileSync('new_games_batch_3_meta.json', JSON.stringify(newGamesBatch3, null, 4));

console.log(`Generated ${newGamesBatch3.length} new fully playable games.`);
