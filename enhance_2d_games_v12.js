const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const files = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));

// V12 Mechanics
const V12_HTML = `
<!-- V12 Mechanics -->
<button id="v12-emp-btn" style="position:fixed; bottom:140px; right:20px; padding:10px; background:#9b59b6; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold; z-index:100; box-shadow:0 0 10px #9b59b6;">EMP BLAST (400)</button>
<button id="v12-wormhole-btn" style="position:fixed; bottom:100px; right:20px; padding:10px; background:#34495e; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold; z-index:100; box-shadow:0 0 10px #34495e;">WORMHOLE (500)</button>
`;

const V12_JS = `
// V12 EMP and Wormhole mechanics
let wormholeActive = false;
let wormholeX = 0;
let wormholeY = 0;
let wormholeDuration = 0;

document.getElementById('v12-emp-btn').addEventListener('click', () => {
    if (score >= 400) {
        score -= 400;
        updateScore();
        if(window.audio) window.audio.playExplosion();

        // EMP Effect - clear all standard particles and stun bosses
        particles = [];
        document.body.style.filter = 'contrast(200%) brightness(150%) hue-rotate(90deg)';
        setTimeout(() => { document.body.style.filter = 'none'; }, 500);

        if (typeof bosses !== 'undefined') {
            bosses.forEach(b => {
                b.vx = 0;
                b.vy = 0;
                b.hp -= 50;
            });
        }

        const empMsg = document.createElement('div');
        empMsg.innerText = "EMP DETONATED!";
        empMsg.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); font-size:48px; color:#9b59b6; font-weight:bold; z-index:1000; text-shadow:0 0 20px #fff;";
        document.body.appendChild(empMsg);
        setTimeout(() => empMsg.remove(), 1000);
    }
});

document.getElementById('v12-wormhole-btn').addEventListener('click', () => {
    if (score >= 500 && !wormholeActive) {
        score -= 500;
        updateScore();
        wormholeActive = true;
        wormholeDuration = 300; // 5 seconds
        if(window.audio) window.audio.playPowerup();

        const whMsg = document.createElement('div');
        whMsg.innerText = "WORMHOLE OPENED!";
        whMsg.style.cssText = "position:fixed; top:40%; left:50%; transform:translate(-50%,-50%); font-size:36px; color:#34495e; font-weight:bold; z-index:1000; text-shadow:0 0 20px #fff;";
        document.body.appendChild(whMsg);
        setTimeout(() => whMsg.remove(), 1000);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (wormholeActive) {
        const rect = canvas.getBoundingClientRect();
        wormholeX = e.clientX - rect.left;
        wormholeY = e.clientY - rect.top;
    }
});

// Hook into the main loop to draw and process wormhole
const originalV12Draw = ctx.clearRect;
ctx.clearRect = function(x, y, w, h) {
    originalV12Draw.call(ctx, x, y, w, h);
    if (wormholeActive) {
        wormholeDuration--;
        if (wormholeDuration <= 0) {
            wormholeActive = false;
        } else {
            // Draw wormhole
            ctx.beginPath();
            ctx.arc(wormholeX, wormholeY, 50, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(52, 73, 94, 0.5)';
            ctx.fill();
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#2c3e50';
            ctx.stroke();

            // Suck particles in
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                const dx = wormholeX - p.x;
                const dy = wormholeY - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 150) {
                    p.x += dx * 0.05;
                    p.y += dy * 0.05;
                    if (dist < 50) {
                        particles.splice(i, 1);
                        score += 5;
                        updateScore();
                    }
                }
            }
        }
    }
};
`;

let count = 0;
files.forEach(file => {
    const filePath = path.join(gamesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Only patch standard 2D games (skip canvas-engine games which have custom engines)
    if (content.includes('engine3d.js') || content.includes('engineTycoon.js') || content.includes('engineShmup.js') || content.includes('enginePlatformer.js')) {
        return;
    }

    // Skip if already patched
    if (content.includes('v12-emp-btn')) return;

    // Inject HTML
    content = content.replace('</body>', `\n${V12_HTML}\n</body>`);

    // Inject JS
    content = content.replace('</script>\n</body>', `\n${V12_JS}\n</script>\n</body>`);

    fs.writeFileSync(filePath, content);
    count++;
});

console.log(`Successfully injected V12 features into ${count} 2D games.`);
