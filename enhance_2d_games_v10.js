const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const games = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));

let v10Count = 0;

games.forEach(gameFile => {
    const filePath = path.join(gamesDir, gameFile);
    let content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes('SUPERCHARGED PARTICLE POPPER V9.0')) {
        content = content.replace('SUPERCHARGED PARTICLE POPPER V9.0', 'SUPERCHARGED PARTICLE POPPER V10.0 (ULTIMATE)');
        content = content.replace('Added: Nuclear Particles, Ghost Particles', 'Added: Virus Infection, Railgun Click');

        // Add Virus and Railgun state
        content = content.replace(
            /else if \(rand > 0\.80\) \{ this\.type = 'ghost'; this\.color = '#bdc3c7'; this\.radius = 10; this\.alpha = 0; this\.phase = Math\.random\(\)\*Math\.PI; \}/,
            `else if (rand > 0.80) { this.type = 'ghost'; this.color = '#bdc3c7'; this.radius = 10; this.alpha = 0; this.phase = Math.random()*Math.PI; }
             else if (rand > 0.78) { this.type = 'virus'; this.color = '#8e44ad'; this.radius = 8; this.infectionTimer = 0; }`
        );

        content = content.replace(
            /let mouse = \{ x: -1000, y: -1000, vx: 0, vy: 0 \};/,
            `let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, isDown: false, charge: 0 };`
        );

        content = content.replace(
            /canvas\.addEventListener\('mousedown', \(e\) => \{/,
            `canvas.addEventListener('mousedown', (e) => {
                mouse.isDown = true;
                const r = canvas.getBoundingClientRect();
                mouse.x = e.clientX - r.left;
                mouse.y = e.clientY - r.top;
            `
        );

        content = content.replace(
            /if \(!hit\) \{ combo = 0; floatingTexts\.push\(new FloatingText\(mx, my, "Miss!", "#ff4757"\)\); \} \n\s*else \{/,
            `if (!hit) {
                    combo = 0;
                    // Don't miss if we are charging railgun
                    if (mouse.charge === 0) floatingTexts.push(new FloatingText(mx, my, "Miss!", "#ff4757"));
                }
                else {`
        );

        // Add Mouse Up for Railgun release
        content = content.replace(
            /if \(particlesCleared >= particlesToClear\) \{/,
            `if (particlesCleared >= particlesToClear) {`
        );

        content = content.replace(
            /let stars = Array\.from/,
            `canvas.addEventListener('mouseup', (e) => {
                mouse.isDown = false;

                // Fire Railgun
                if (mouse.charge > 60) {
                    const r = canvas.getBoundingClientRect();
                    const endX = e.clientX - r.left; const endY = e.clientY - r.top;

                    // Draw Beam
                    ctx.beginPath(); ctx.moveTo(canvas.width/(2*dpr), canvas.height/dpr); ctx.lineTo(endX, endY);
                    ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 10; ctx.shadowBlur = 20; ctx.shadowColor = '#ff0000'; ctx.stroke();
                    ctx.shadowBlur = 0;

                    if(window.audio) window.audio.playLaser();
                    floatingTexts.push(new FloatingText(endX, endY, "RAILGUN!", "#e74c3c", 2));

                    // Calculate Line Collision
                    const cx = canvas.width/(2*dpr); const cy = canvas.height/dpr;
                    const lineLen = Math.sqrt((endX-cx)**2 + (endY-cy)**2);

                    for(let i=particles.length-1; i>=0; i--) {
                        let p = particles[i];

                        // Distance from point to line segment
                        const l2 = lineLen**2;
                        if (l2 === 0) continue;
                        let t = ((p.x - cx) * (endX - cx) + (p.y - cy) * (endY - cy)) / l2;
                        t = Math.max(0, Math.min(1, t));
                        const projX = cx + t * (endX - cx); const projY = cy + t * (endY - cy);

                        if (Math.sqrt((p.x-projX)**2 + (p.y-projY)**2) < p.radius + 15) {
                            // Destroy
                            createExplosion(p.x, p.y, p.color);
                            particles.splice(i, 1);
                            score += 50; combo++; particlesCleared++;
                        }
                    }
                    createExplosion(endX, endY, '#ff0000', true);
                    mouse.charge = 0;
                }
            });

            let stars = Array.from`
        );

        // Update loop: Charge logic and Virus logic
        content = content.replace(
            /particles\.forEach\(p => \{ \n\s*p\.isShielded = shieldedParticles\.includes\(p\);\n\s*p\.update\(\); p\.draw\(\); \n\s*\}\);/,
            `particles.forEach(p => {
                 p.isShielded = shieldedParticles.includes(p);

                 // Virus Infection Logic
                 if (p.type === 'virus') {
                     p.infectionTimer++;
                     if (p.infectionTimer > 180) { // 3 seconds
                         p.infectionTimer = 0;
                         // Infect closest normal
                         let closest = null; let minDist = 100;
                         particles.forEach(np => {
                             if(np.type === 'normal' && !np.isShielded) {
                                 const d = Math.sqrt((p.x-np.x)**2 + (p.y-np.y)**2);
                                 if (d < minDist) { minDist = d; closest = np; }
                             }
                         });
                         if (closest) {
                             closest.type = 'virus';
                             closest.color = '#8e44ad';
                             closest.infectionTimer = 0;
                             ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(closest.x, closest.y);
                             ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 3; ctx.stroke();
                         }
                     }
                     // Pulsing visual
                     p.radius = 8 + Math.sin(frameCount*0.2)*3;
                 }

                 p.update(); p.draw();
             });

             // Railgun Charge Logic
             if (mouse.isDown) {
                 mouse.charge++;
                 if (mouse.charge > 60) {
                     // Draw laser sight
                     ctx.beginPath(); ctx.moveTo(canvas.width/(2*dpr), canvas.height/dpr); ctx.lineTo(mouse.x, mouse.y);
                     ctx.strokeStyle = 'rgba(231, 76, 60, 0.5)'; ctx.setLineDash([5, 15]); ctx.stroke(); ctx.setLineDash([]);
                 }
             } else {
                 mouse.charge = 0;
             }
            `
        );

        fs.writeFileSync(filePath, content);
        v10Count++;
    }
});

console.log(`Successfully upgraded ${v10Count} 2D games to V10.0 mechanics (Virus, Railgun).`);
