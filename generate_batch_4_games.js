const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');

const newGamesBatch4 = [
    { id: 'neon-drifter', title: 'Neon Drifter', icon: '🏎️', category: 'racing', gradient: 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)' },
    { id: 'space-miner-2', title: 'Space Miner 2', icon: '⛏️', category: 'action', gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
    { id: 'jungle-run', title: 'Jungle Run', icon: '🌴', category: 'arcade', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
    { id: 'ice-climber', title: 'Ice Climber', icon: '🧗', category: 'arcade', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
    { id: 'volcano-escape', title: 'Volcano Escape', icon: '🌋', category: 'action', gradient: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)' },
    { id: 'city-defender', title: 'City Defender', icon: '🏙️', category: 'strategy', gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' },
    { id: 'alien-hunter', title: 'Alien Hunter', icon: '👽', category: 'action', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { id: 'math-puzzle', title: 'Math Puzzle', icon: '🔢', category: 'puzzle', gradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)' },
    { id: 'word-scramble-2', title: 'Word Scramble 2', icon: '🔤', category: 'puzzle', gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' },
    { id: 'block-breaker', title: 'Block Breaker', icon: '🧱', category: 'arcade', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'ninja-runner', title: 'Ninja Runner', icon: '🥷', category: 'arcade', gradient: 'linear-gradient(135deg, #000000 0%, #434343 100%)' },
    { id: 'zombie-sniper', title: 'Zombie Sniper', icon: '🎯', category: 'action', gradient: 'linear-gradient(135deg, #3E5151 0%, #DECBA4 100%)' },
    { id: 'basketball-pro', title: 'Basketball Pro', icon: '🏀', category: 'sports', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
    { id: 'tennis-champ', title: 'Tennis Champ', icon: '🎾', category: 'sports', gradient: 'linear-gradient(135deg, #c2e59c 0%, #64b3f4 100%)' },
    { id: 'golf-master', title: 'Golf Master', icon: '⛳', category: 'sports', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
    { id: 'bowling-star', title: 'Bowling Star', icon: '🎳', category: 'sports', gradient: 'linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%)' },
    { id: 'soccer-kick', title: 'Soccer Kick', icon: '⚽', category: 'sports', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { id: 'racing-fever', title: 'Racing Fever', icon: '🏎️', category: 'racing', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'bike-stunts', title: 'Bike Stunts', icon: '🏍️', category: 'racing', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
    { id: 'boat-racing', title: 'Boat Racing', icon: '🚤', category: 'racing', gradient: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)' },
    { id: 'farm-simulator', title: 'Farm Simulator', icon: '🚜', category: 'strategy', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
    { id: 'tower-builder-2', title: 'Tower Builder 2', icon: '🏗️', category: 'strategy', gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' },
    { id: 'empire-tycoon', title: 'Empire Tycoon', icon: '👑', category: 'strategy', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'pizza-shop', title: 'Pizza Shop', icon: '🍕', category: 'strategy', gradient: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 100%)' },
    { id: 'burger-dash', title: 'Burger Dash', icon: '🍔', category: 'arcade', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
    { id: 'candy-popper', title: 'Candy Popper', icon: '🍬', category: 'puzzle', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { id: 'bubble-shooter-2', title: 'Bubble Shooter 2', icon: '🫧', category: 'arcade', gradient: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)' },
    { id: 'color-match-2', title: 'Color Match 2', icon: '🎨', category: 'puzzle', gradient: 'linear-gradient(135deg, #c2e59c 0%, #64b3f4 100%)' },
    { id: 'memory-game', title: 'Memory Game', icon: '🧠', category: 'puzzle', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    { id: 'sudoku-expert', title: 'Sudoku Expert', icon: '📝', category: 'puzzle', gradient: 'linear-gradient(135deg, #e6dada 0%, #274046 100%)' },
    { id: 'chess-pro', title: 'Chess Pro', icon: '♟️', category: 'strategy', gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' },
    { id: 'checkers-king', title: 'Checkers King', icon: '🔴', category: 'strategy', gradient: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)' },
    { id: 'tic-tac-toe', title: 'Tic Tac Toe', icon: '❌', category: 'puzzle', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { id: 'snake-classic', title: 'Snake Classic', icon: '🐍', category: 'arcade', gradient: 'linear-gradient(135deg, #000000 0%, #0f9b0f 100%)' },
    { id: 'pac-runner', title: 'Pac Runner', icon: '🟡', category: 'arcade', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'space-invaders-3', title: 'Space Invaders 3', icon: '👾', category: 'action', gradient: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' },
    { id: 'asteroids-remix', title: 'Asteroids Remix', icon: '☄️', category: 'action', gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)' },
    { id: 'flappy-bird-clone', title: 'Flappy Clone', icon: '🐦', category: 'arcade', gradient: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)' },
    { id: 'doodle-jump-clone', title: 'Doodle Clone', icon: '⬆️', category: 'arcade', gradient: 'linear-gradient(135deg, #c2e59c 0%, #64b3f4 100%)' },
    { id: 'fruit-slicer', title: 'Fruit Slicer', icon: '🍉', category: 'arcade', gradient: 'linear-gradient(135deg, #ff4e50 0%, #f9d423 100%)' },
    { id: 'temple-run-clone', title: 'Temple Runner', icon: '🏃', category: 'arcade', gradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' },
    { id: 'subway-surfer-2', title: 'Subway Surfer 2', icon: '🚇', category: 'arcade', gradient: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)' },
    { id: 'angry-birds-clone', title: 'Angry Birds Clone', icon: '😡', category: 'action', gradient: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)' },
    { id: 'cut-the-rope', title: 'Cut the Rope', icon: '✂️', category: 'puzzle', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
    { id: 'water-sort-2', title: 'Water Sort 2', icon: '🧪', category: 'puzzle', gradient: 'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)' },
    { id: 'draw-rider', title: 'Draw Rider', icon: '✏️', category: 'racing', gradient: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' },
    { id: 'stickman-archer', title: 'Stickman Archer', icon: '🏹', category: 'action', gradient: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)' },
    { id: 'stickman-fighter', title: 'Stickman Fighter', icon: '🥋', category: 'action', gradient: 'linear-gradient(135deg, #000000 0%, #434343 100%)' },
    { id: 'stickman-hook', title: 'Stickman Hook', icon: '🪝', category: 'arcade', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'stickman-golf', title: 'Stickman Golf', icon: '🏌️', category: 'sports', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' }
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

                    if (dist <= p.radius * 2.5) {
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

newGamesBatch4.forEach(game => {
    fs.writeFileSync(path.join(gamesDir, `${game.id}.html`), template(game.id, game.title));
});

// Write the metadata to a file so we can inject it into main.js
fs.writeFileSync('new_games_batch_4_meta.json', JSON.stringify(newGamesBatch4, null, 4));

console.log(`Generated ${newGamesBatch4.length} new fully playable games.`);
