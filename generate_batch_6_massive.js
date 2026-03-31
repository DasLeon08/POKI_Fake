const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const newGamesBatch6 = [];

const icons2D = ['🏃', '💎', '🚀', '🧟', '🏀', '🧗', '⚔️', '🔢', '🥷', '🏎️', '🍬', '🎳', '👽', '🔍', '🛹', '🪖', '🍉', '⛳', '🤖', '🦖'];
const gradients2D = [
    'linear-gradient(135deg, #FF0099 0%, #493240 100%)',
    'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)',
    'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
    'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
    'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)',
    'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)',
    'linear-gradient(135deg, #09203f 0%, #537895 100%)'
];

// Generate 100 2D Games
for (let i = 0; i < 100; i++) {
    const title = \`Hyper \${['Runner', 'Blaster', 'Crush', 'Dash', 'Strike', 'Pop', 'Quest', 'Force', 'Ninja', 'Racer'][Math.floor(Math.random()*10)]} \${Math.floor(Math.random()*999)}\`;
    const id = title.toLowerCase().replace(/ /g, '-');

    newGamesBatch6.push({
        id: id,
        title: title,
        icon: icons2D[Math.floor(Math.random() * icons2D.length)],
        category: ['action', 'arcade', 'puzzle', 'racing'][Math.floor(Math.random() * 4)],
        gradient: gradients2D[Math.floor(Math.random() * gradients2D.length)],
        is3D: false
    });
}

const biomes3D = ['neon', 'desert', 'ice', 'mars', 'toxic'];
const prefixes3D = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
const suffixes3D = ['Arena', 'Base', 'Nexus', 'World', 'Sector', 'Lab', 'Zone', 'Station', 'Outpost', 'Realm'];

// Generate 100 3D Games
for (let i = 0; i < 100; i++) {
    const biome = biomes3D[Math.floor(Math.random() * biomes3D.length)];
    const pre = prefixes3D[Math.floor(Math.random() * prefixes3D.length)];
    const suf = suffixes3D[Math.floor(Math.random() * suffixes3D.length)];
    const title = \`\${pre} \${biome.charAt(0).toUpperCase() + biome.slice(1)} \${suf} \${Math.floor(Math.random()*99)}\`;
    const id = title.toLowerCase().replace(/ /g, '-');

    let icon = '🔫';
    let gradient = '';
    if (biome === 'neon') { icon = '⚡'; gradient = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'; }
    if (biome === 'desert') { icon = '🏜️'; gradient = 'linear-gradient(135deg, #c2b280, #8b5a2b)'; }
    if (biome === 'ice') { icon = '❄️'; gradient = 'linear-gradient(135deg, #a5f2f3, #87ceeb)'; }
    if (biome === 'mars') { icon = '🔴'; gradient = 'linear-gradient(135deg, #8c3b2d, #5c2b20)'; }
    if (biome === 'toxic') { icon = '☣️'; gradient = 'linear-gradient(135deg, #1f2e1a, #7fff00)'; }

    newGamesBatch6.push({
        id: id,
        title: title,
        icon: icon,
        category: 'action',
        gradient: gradient,
        is3D: true,
        config: {
            biome: biome,
            gravity: 0.015 + (Math.random() * 0.015),
            botCount: 15 + Math.floor(Math.random() * 25),
            jumpForce: 0.25 + (Math.random() * 0.2),
            speed: 0.18 + (Math.random() * 0.15),
            weaponDamage: 15 + Math.floor(Math.random() * 40),
            maxHealth: 80 + Math.floor(Math.random() * 120),
            worldSize: 150 + Math.floor(Math.random() * 200)
        }
    });
}

const template2D = (game) => \`<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${game.title}</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="ingame-header">
        <a href="../index.html" class="back-btn">Zurück zum Portal</a>
        <h1 class="ingame-title">\${game.title}</h1>
        <div class="ingame-controls">
            <button class="game-like-btn" id="inGameLikeBtn" title="Like this game">♡</button>
        </div>
    </div>
    <div class="game-container">
        <canvas id="gameCanvas" width="800" height="600"></canvas>
    </div>

    <script src="../js/user-system.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const gameId = '\${game.id}';
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

            // SUPERCHARGED PARTICLE POPPER V3.0
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');

            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = \\\`\\\${rect.width}px\\\`;
            canvas.style.height = \\\`\\\${rect.height}px\\\`;

            let score = 0;
            let highScore = localStorage.getItem('poki_highscore_v3') || 0;
            let combo = 0;
            let comboTimer = 0;
            let maxCombo = 0;
            let gameSpeed = 1;

            let particles = [];
            let explosions = [];
            let floatingTexts = [];
            let shockwaves = [];

            let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
            let lastMouse = { x: -1000, y: -1000 };

            canvas.addEventListener('mousemove', (e) => {
                const r = canvas.getBoundingClientRect();
                lastMouse.x = mouse.x;
                lastMouse.y = mouse.y;
                mouse.x = e.clientX - r.left;
                mouse.y = e.clientY - r.top;
                mouse.vx = mouse.x - lastMouse.x;
                mouse.vy = mouse.y - lastMouse.y;
            });

            canvas.addEventListener('mouseleave', () => {
                mouse.x = -1000;
                mouse.y = -1000;
            });

            const colors = ['#FF0099', '#493240', '#00C9FF', '#92FE9D', '#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#ff6348', '#a29bfe', '#fd79a8', '#f9ca24'];

            class Particle {
                constructor() {
                    this.x = Math.random() * (canvas.width / dpr);
                    this.y = Math.random() * (canvas.height / dpr);
                    this.vx = (Math.random() - 0.5) * 4 * gameSpeed;
                    this.vy = (Math.random() - 0.5) * 4 * gameSpeed;
                    this.radius = Math.random() * 5 + 3;
                    this.color = colors[Math.floor(Math.random() * colors.length)];
                    this.isBomb = Math.random() > 0.95;
                    if (this.isBomb) { this.color = '#fff'; this.radius = 8; }
                }
                update() {
                    this.x += this.vx * gameSpeed;
                    this.y += this.vy * gameSpeed;
                    if (this.x < this.radius) { this.x = this.radius; this.vx *= -1; }
                    if (this.x > (canvas.width / dpr) - this.radius) { this.x = (canvas.width / dpr) - this.radius; this.vx *= -1; }
                    if (this.y < this.radius) { this.y = this.radius; this.vy *= -1; }
                    if (this.y > (canvas.height / dpr) - this.radius) { this.y = (canvas.height / dpr) - this.radius; this.vy *= -1; }
                    if(!this.isBomb) {
                        const dx = mouse.x - this.x;
                        const dy = mouse.y - this.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist < 100) { this.vx -= dx * 0.005; this.vy -= dy * 0.005; }
                    }
                }
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.shadowBlur = this.isBomb ? 20 : 10;
                    ctx.shadowColor = this.color;
                    ctx.fill();
                    ctx.closePath();
                    if (this.isBomb) { ctx.strokeStyle = '#ff4757'; ctx.lineWidth = 2; ctx.stroke(); }
                    ctx.shadowBlur = 0;
                }
            }

            class Shockwave {
                constructor(x, y, color) {
                    this.x = x; this.y = y; this.color = color; this.radius = 0; this.maxRadius = 100; this.life = 1;
                }
                update() { this.radius += 5; this.life -= 0.05; }
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = \\\`\\\${this.color.replace(')', \\\`,\\\${this.life})\\\`).replace('rgb', 'rgba')}\\\`;
                    ctx.lineWidth = 3 * this.life;
                    ctx.stroke();
                    ctx.closePath();
                }
            }

            class FloatingText {
                constructor(x, y, text, color) {
                    this.x = x; this.y = y; this.text = text; this.color = color; this.life = 1.0; this.vy = -2;
                }
                update() { this.y += this.vy; this.life -= 0.02; }
                draw() {
                    ctx.fillStyle = \\\`rgba(255,255,255,\\\${this.life})\\\`;
                    ctx.font = 'bold 20px "Fredoka One"';
                    ctx.textAlign = 'center';
                    ctx.fillText(this.text, this.x, this.y);
                }
            }

            function createExplosion(x, y, color, isBomb = false) {
                const count = isBomb ? 20 : 8;
                for(let i=0; i<count; i++) {
                    explosions.push({
                        x: x, y: y,
                        vx: (Math.random() - 0.5) * (isBomb ? 15 : 6),
                        vy: (Math.random() - 0.5) * (isBomb ? 15 : 6),
                        life: 1.0, color: color
                    });
                }
                shockwaves.push(new Shockwave(x, y, color === '#fff' ? 'rgb(255,255,255)' : 'rgb(0,255,255)'));
            }

            for (let i = 0; i < 70; i++) particles.push(new Particle());

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

                    if (dist <= p.radius * 3) {
                        if (p.isBomb) {
                            createExplosion(p.x, p.y, p.color, true);
                            floatingTexts.push(new FloatingText(p.x, p.y, "BOOM!", "#fff"));
                            particles.splice(i, 1);
                            for(let j = particles.length - 1; j >= 0; j--) {
                                const bp = particles[j];
                                const bdx = p.x - bp.x;
                                const bdy = p.y - bp.y;
                                if(Math.sqrt(bdx*bdx + bdy*bdy) < 150) {
                                    createExplosion(bp.x, bp.y, bp.color);
                                    score += 20 * combo;
                                    particles.splice(j, 1);
                                    particles.push(new Particle());
                                }
                            }
                            hit = true;
                            combo += 5;
                        } else {
                            createExplosion(p.x, p.y, p.color);
                            floatingTexts.push(new FloatingText(p.x, p.y, \\\`+\\\${10 * (combo+1)}\\\`, p.color));
                            particles.splice(i, 1);
                            hit = true;
                            combo++;
                            score += 10 * combo;
                            particles.push(new Particle());
                        }

                        comboTimer = 90;
                        if(combo > maxCombo) maxCombo = combo;
                        gameSpeed = 1 + (score / 5000);
                        if (window.userSystem) window.userSystem.addXP(Math.min(combo, 10));
                    }
                }

                if (!hit) {
                    combo = 0;
                    floatingTexts.push(new FloatingText(mx, my, "Miss!", "#ff4757"));
                } else {
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('poki_highscore_v3', highScore);
                    }
                }
            });

            let stars = Array.from({length: 50}, () => ({ x: Math.random() * (canvas.width/dpr), y: Math.random() * (canvas.height/dpr), s: Math.random() * 2 + 0.5 }));

            function animate() {
                ctx.fillStyle = 'rgba(10, 14, 25, 0.4)';
                ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                stars.forEach(s => {
                    s.y += s.s * 0.5 * gameSpeed;
                    if(s.y > canvas.height/dpr) s.y = 0;
                    ctx.fillRect(s.x, s.y, s.s, s.s);
                });

                for(let i=0; i<particles.length; i++) {
                    for(let j=i+1; j<particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = dx*dx + dy*dy;
                        if(dist < 8000) {
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.strokeStyle = \\\`rgba(0, 255, 255, \\\${0.2 - dist/40000})\\\`;
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                }

                particles.forEach(p => { p.update(); p.draw(); });

                for(let i = shockwaves.length - 1; i >= 0; i--) {
                    shockwaves[i].update();
                    shockwaves[i].draw();
                    if(shockwaves[i].life <= 0) shockwaves.splice(i, 1);
                }

                for(let i = explosions.length - 1; i >= 0; i--) {
                    let ex = explosions[i];
                    ex.x += ex.vx; ex.y += ex.vy; ex.life -= 0.03;
                    if(ex.life <= 0) { explosions.splice(i, 1); continue; }
                    ctx.beginPath();
                    ctx.arc(ex.x, ex.y, 3 * ex.life, 0, Math.PI*2);
                    ctx.fillStyle = \\\`rgba(255, 255, 255, \\\${ex.life})\\\`;
                    ctx.shadowBlur = 10; ctx.shadowColor = ex.color;
                    ctx.fill(); ctx.closePath(); ctx.shadowBlur = 0;
                }

                for(let i = floatingTexts.length - 1; i >= 0; i--) {
                    floatingTexts[i].update();
                    floatingTexts[i].draw();
                    if(floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
                }

                ctx.fillStyle = 'white';
                ctx.font = 'bold 24px "Fredoka One", cursive';
                ctx.textAlign = 'left';
                ctx.fillText(\\\`Punkte: \\\${score}\\\`, 20, 40);

                ctx.font = 'bold 16px "Nunito"';
                ctx.fillStyle = '#95a5a6';
                ctx.fillText(\\\`High Score: \\\${highScore} | Max Combo: \\\${maxCombo}\\\`, 20, 65);

                if (combo > 1 && comboTimer > 0) {
                    comboTimer--;
                    const scale = 1 + (comboTimer/90) * 0.5;
                    ctx.save();
                    ctx.translate(20, 100);
                    ctx.scale(scale, scale);
                    ctx.fillStyle = \\\`hsla(\\\${combo * 10}, 100%, 60%, \\\${comboTimer/90})\\\`;
                    ctx.font = 'bold 32px "Fredoka One", cursive';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = ctx.fillStyle;
                    ctx.fillText(\\\`\\\${combo}x COMBO!\\\`, 0, 0);
                    ctx.restore();
                } else if (comboTimer <= 0) {
                    combo = 0;
                }

                requestAnimationFrame(animate);
            }
            animate();
        });
    </script>
</body>
</html>\`;

const template3D = (game) => \`<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${game.title} - 3D Multiplayer Arena</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
        .ingame-header { position: absolute; z-index: 200; top: 0; width: 100%; display: flex; justify-content: space-between; padding: 10px 20px; pointer-events: none; }
        .ingame-header > * { pointer-events: auto; }
        #game-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; cursor: crosshair; }
        #start-screen { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 300; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: 'Fredoka One', cursive; text-align: center; }
        #start-screen h1 { font-size: 4rem; text-shadow: 0 5px 15px \${game.gradient.split(',')[1] || 'rgba(0,0,0,0.5)'}; margin-bottom: 20px; }
        #start-screen p { font-family: 'Nunito', sans-serif; font-size: 1.2rem; max-width: 600px; margin-bottom: 30px; line-height: 1.6; }
        .start-btn { padding: 15px 40px; font-size: 1.5rem; background: \${game.gradient}; color: white; border: none; border-radius: 30px; cursor: pointer; transition: transform 0.2s; font-family: 'Fredoka One', cursive; box-shadow: 0 5px 20px rgba(0,0,0,0.5); }
        .start-btn:hover { transform: scale(1.1); }
    </style>
</head>
<body>
    <div class="ingame-header">
        <a href="../index.html" class="back-btn" style="background: rgba(231, 76, 60, 0.8);">Portal</a>
        <h1 class="ingame-title" style="font-size: 1.5rem; padding: 5px 15px;">\${game.title}</h1>
        <div class="ingame-controls">
            <button class="game-like-btn" id="inGameLikeBtn" title="Like this game">♡</button>
        </div>
    </div>

    <div id="start-screen">
        <h1>\${game.title}</h1>
        <p>Willkommen in der \${game.config.biome} Arena!<br>Du trittst gegen \${game.config.botCount} globale Spieler an.<br><br><b>Steuerung:</b> W A S D zum Bewegen. Maus zum Zielen und Schießen (Linksklick). LEERTASTE zum Springen. E für den Upgrade-Shop.</p>
        <button class="start-btn" id="startBtn">SPIELEN (Pointer Lock)</button>
    </div>

    <div id="game-container"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="../js/user-system.js"></script>
    <script src="../js/engine3d.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const gameId = '\${game.id}';
            const likeBtn = document.getElementById('inGameLikeBtn');
            window.userSystem = new window.UserSystem();

            if (window.userSystem.isLiked(gameId)) {
                likeBtn.classList.add('liked');
                likeBtn.innerHTML = '♥';
            }

            likeBtn.addEventListener('click', () => {
                const isLiked = window.userSystem.toggleLike(gameId);
                if (isLiked) {
                    likeBtn.classList.add('liked');
                    likeBtn.innerHTML = '♥';
                    window.userSystem.showToast('Spiel geliked! +5 XP');
                } else {
                    likeBtn.classList.remove('liked');
                    likeBtn.innerHTML = '♡';
                }
            });

            document.getElementById('startBtn').addEventListener('click', () => {
                document.getElementById('start-screen').style.display = 'none';
                const config = \${JSON.stringify(game.config)};
                window.gameEngine = new window.GameEngine3D('game-container', config);
                document.body.requestPointerLock();
            });
        });
    </script>
</body>
</html>\`;

let count = 0;
newGamesBatch6.forEach(game => {
    if (!fs.existsSync(path.join(gamesDir, \`\${game.id}.html\`))) {
        const content = game.is3D ? template3D(game) : template2D(game);
        fs.writeFileSync(path.join(gamesDir, \`\${game.id}.html\`), content);
        count++;
    }
});

fs.writeFileSync('new_games_batch_6_meta.json', JSON.stringify(newGamesBatch6, null, 4));
console.log(\`Generated \${count} massive new games.\`);
