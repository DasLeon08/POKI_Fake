const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const games = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));

let v6ScriptCount = 0;

games.forEach(gameFile => {
    const filePath = path.join(gamesDir, gameFile);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Find the V5 block and patch it up to V6
    if (content.includes('SUPERCHARGED PARTICLE POPPER V5.0')) {
        // Change header
        content = content.replace('SUPERCHARGED PARTICLE POPPER V5.0', 'SUPERCHARGED PARTICLE POPPER V6.0');
        content = content.replace('Added: CRT Overlay, Black Holes, Chain Lightning', 'Added: Mirror Portals, Advanced CRT Overlay, Screen Shake');

        // Add Portals state
        content = content.replace(
            /let lightning = \[\]; \/\/ v5/,
            `let lightning = [];
            let portals = [];`
        );

        // Create Portals on init
        content = content.replace(
            /for \(let i = 0; i < 70; i\+\+\) particles\.push\(new Particle\(\)\);/,
            `
            // V6 Mirror Portals
            portals.push({x: canvas.width/dpr * 0.1, y: canvas.height/dpr * 0.5, id: 0, link: 1, color: '#e67e22', angle: 0});
            portals.push({x: canvas.width/dpr * 0.9, y: canvas.height/dpr * 0.5, id: 1, link: 0, color: '#e67e22', angle: 0});

            for (let i = 0; i < 70; i++) particles.push(new Particle());`
        );

        // Particle <-> Portal Interaction in update()
        content = content.replace(
            /if \(this\.type === 'blackhole'\) \{/,
            `
            // Portal Teleportation
            portals.forEach(pt => {
                const dx = pt.x - this.x;
                const dy = pt.y - this.y;
                if(Math.sqrt(dx*dx + dy*dy) < 30) {
                    const linked = portals.find(p => p.id === pt.link);
                    if(linked && !this.justTeleported) {
                        this.x = linked.x;
                        this.y = linked.y;
                        this.justTeleported = 30; // cooldown
                        if(window.audio) window.audio.playJump();
                        createExplosion(linked.x, linked.y, linked.color, false);
                    }
                }
            });
            if(this.justTeleported > 0) this.justTeleported--;

            if (this.type === 'blackhole') {`
        );

        // Draw Portals in animate()
        content = content.replace(
            /drawCRT\(\);/,
            `
                // Draw Portals
                portals.forEach(pt => {
                    pt.angle += 0.05;
                    ctx.save();
                    ctx.translate(pt.x, pt.y);
                    ctx.rotate(pt.angle);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 20, 30 + Math.sin(frameCount*0.1)*5, 0, 0, Math.PI*2);
                    ctx.strokeStyle = pt.color;
                    ctx.lineWidth = 3;
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = pt.color;
                    ctx.stroke();
                    ctx.restore();
                });

                // Screen Shake logic tied to explosions (simulated by translating canvas context)
                if(explosions.length > 20) {
                    ctx.setTransform(dpr, 0, 0, dpr, (Math.random()-0.5)*5, (Math.random()-0.5)*5);
                } else {
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                }

                drawCRT();`
        );

        fs.writeFileSync(filePath, content);
        v6ScriptCount++;
    }
});

console.log(`Successfully upgraded ${v6ScriptCount} 2D games to V6.0 mechanics (Mirror Portals, Shake).`);
