const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const games = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));
let v8Count = 0;

games.forEach(gameFile => {
    const filePath = path.join(gamesDir, gameFile);
    let content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes('SUPERCHARGED PARTICLE POPPER V7.0')) {
        content = content.replace('SUPERCHARGED PARTICLE POPPER V7.0', 'SUPERCHARGED PARTICLE POPPER V8.0');
        content = content.replace('Added: Giant Boss Particles, Multi-Hit Health, Mini Swarm', 'Added: Meteor Showers, Shield Generators');

        // Add Meteor and Shield Gen state
        content = content.replace(
            /let portals = \[\];/,
            `let portals = [];
            let meteors = [];
            let meteorShower = 0;`
        );

        // Meteor Shower Event Logic
        content = content.replace(
            /if \(particlesCleared >= particlesToClear\) nextWave\(\);/,
            `if (particlesCleared >= particlesToClear) {
                nextWave();
                // V8 Event Trigger: 20% chance per wave
                if (Math.random() < 0.2) {
                    meteorShower = 300; // 5 seconds
                    floatingTexts.push(new FloatingText(canvas.width/(2*dpr), canvas.height/(2*dpr)+40, "METEOR SHOWER!", "#e74c3c", 2));
                    if(window.audio) window.audio.playExplosion();
                }
            }`
        );

        // Particle Class update for Shield Generator
        content = content.replace(
            /else if \(rand > 0\.86\) \{ this\.type = 'blackhole'; this\.color = '#000000'; this\.radius = 15; \}/,
            `else if (rand > 0.86) { this.type = 'blackhole'; this.color = '#000000'; this.radius = 15; }
             else if (rand > 0.84) { this.type = 'shield_gen'; this.color = '#3498db'; this.radius = 12; this.hp = 3; }`
        );

        // Shield Generator Logic (Invulnerability for nearby particles)
        content = content.replace(
            /particles\.forEach\(p => \{ p\.update\(\); p\.draw\(\); \}\);/,
            `// Shield Gen Logic
             let shieldedParticles = [];
             particles.forEach(sg => {
                 if (sg.type === 'shield_gen') {
                     particles.forEach(p => {
                         if (p !== sg && Math.abs(sg.x - p.x) < 150 && Math.abs(sg.y - p.y) < 150) {
                             shieldedParticles.push(p);
                             ctx.beginPath();
                             ctx.moveTo(sg.x, sg.y); ctx.lineTo(p.x, p.y);
                             ctx.strokeStyle = 'rgba(52, 152, 219, 0.4)';
                             ctx.lineWidth = 2; ctx.stroke();
                         }
                     });
                 }
             });

             // Meteor Logic
             if (meteorShower > 0) {
                 meteorShower--;
                 if (frameCount % 10 === 0) {
                     meteors.push({
                         x: Math.random() * canvas.width/dpr, y: -50,
                         vx: (Math.random()-0.5)*5, vy: 15 + Math.random()*10,
                         radius: 20 + Math.random()*20, color: '#e67e22', hp: 1
                     });
                 }
             }

             for(let i=meteors.length-1; i>=0; i--) {
                 let m = meteors[i];
                 m.x += m.vx; m.y += m.vy;

                 // Draw
                 ctx.beginPath(); ctx.arc(m.x, m.y, m.radius, 0, Math.PI*2);
                 ctx.fillStyle = m.color; ctx.shadowBlur = 20; ctx.shadowColor = '#e74c3c'; ctx.fill(); ctx.shadowBlur = 0;

                 // Tail
                 ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx*5, m.y - m.vy*5);
                 ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = m.radius; ctx.stroke();

                 if (m.y > canvas.height/dpr + 50) meteors.splice(i, 1);
             }

             particles.forEach(p => {
                 p.isShielded = shieldedParticles.includes(p);
                 p.update(); p.draw();
             });`
        );

        // Click Interaction Updates for Shields and Meteors
        content = content.replace(
            /let hit = false;/,
            `let hit = false;

             // Check Meteors First (Overlay)
             for (let i = meteors.length - 1; i >= 0; i--) {
                 const m = meteors[i];
                 const dx = mx - m.x; const dy = my - m.y;
                 if (Math.sqrt(dx*dx + dy*dy) <= m.radius) {
                     m.hp--;
                     createExplosion(m.x, m.y, m.color, false);
                     if (m.hp <= 0) {
                         createExplosion(m.x, m.y, '#e74c3c', true);
                         score += 500 * combo;
                         floatingTexts.push(new FloatingText(m.x, m.y, "+500", "#f1c40f", 2));
                         meteors.splice(i, 1);
                     }
                     hit = true; combo++;
                     if(window.audio) window.audio.playExplosion();
                     break; // hit only 1
                 }
             }`
        );

        content = content.replace(
            /if \(Math\.sqrt\(dx\*dx \+ dy\*dy\) <= p\.radius \* 3\.5\) \{/,
            `if (Math.sqrt(dx*dx + dy*dy) <= p.radius * 3.5 && !p.isShielded) {`
        );

        content = content.replace(
            /if \(p\.type === 'boss'\) \{/,
            `if (p.type === 'shield_gen') {
                    p.hp--;
                    createExplosion(p.x, p.y, p.color, false);
                    if (p.hp <= 0) {
                        createExplosion(p.x, p.y, '#3498db', true);
                        floatingTexts.push(new FloatingText(p.x, p.y, "SHIELD DOWN!", "#fff", 1.5));
                        particles.splice(i, 1);
                        score += 200 * combo; particlesCleared++;
                    }
                    hit = true;
                } else if (p.type === 'boss') {`
        );

        content = content.replace(
            /else if \(this\.type === 'boss'\) \{/,
            `else if (this.type === 'shield_gen') {
                        ctx.strokeStyle = '#3498db'; ctx.lineWidth = 3;
                        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 8, 0, (Math.PI*2) * (this.hp/3)); ctx.stroke();
                        ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
                        ctx.beginPath(); ctx.arc(this.x, this.y, 150, 0, Math.PI*2); ctx.fill(); // range indicator
                    } else if (this.type === 'boss') {`
        );

        // Add shielded visual effect
        content = content.replace(
            /ctx\.fill\(\);\n\s*ctx\.closePath\(\);/,
            `ctx.fill();
                    ctx.closePath();
                    if (this.isShielded) {
                        ctx.strokeStyle = '#3498db'; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI*2); ctx.stroke();
                    }`
        );

        fs.writeFileSync(filePath, content);
        v8Count++;
    }
});

console.log(`Successfully upgraded ${v8Count} 2D games to V8.0 mechanics (Meteors, Shield Gens).`);
