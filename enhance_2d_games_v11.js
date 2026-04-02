const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const games = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));

let v11Count = 0;

games.forEach(gameFile => {
    const filePath = path.join(gamesDir, gameFile);
    let content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes('SUPERCHARGED PARTICLE POPPER V10.0 (ULTIMATE)')) {
        content = content.replace('SUPERCHARGED PARTICLE POPPER V10.0 (ULTIMATE)', 'SUPERCHARGED PARTICLE POPPER V11.0 (LEGENDARY)');
        content = content.replace('Added: Virus Infection, Railgun Click', 'Added: Ninja Particles, Paint Splatters');

        // Add state
        content = content.replace(
            /let meteors = \[\];\n\s*let meteorShower = 0;/,
            `let meteors = [];
             let meteorShower = 0;
             let paintSplatter = 0;`
        );

        // Add Particle types
        content = content.replace(
            /else if \(rand > 0\.78\) \{ this\.type = 'virus'; this\.color = '#8e44ad'; this\.radius = 8; this\.infectionTimer = 0; \}/,
            `else if (rand > 0.78) { this.type = 'virus'; this.color = '#8e44ad'; this.radius = 8; this.infectionTimer = 0; }
             else if (rand > 0.76) { this.type = 'ninja'; this.color = '#fff'; this.radius = 6; this.alpha = 0; }
             else if (rand > 0.74) { this.type = 'paint'; this.color = '#e84393'; this.radius = 12; }`
        );

        // Ninja reveal logic
        content = content.replace(
            /if \(this\.type === 'ghost'\) \{/,
            `if (this.type === 'ninja') {
                    const dx = mouse.x - this.x; const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 150 || paintSplatter > 0) this.alpha = 1;
                    else this.alpha = 0;
             }
             if (this.type === 'ghost') {`
        );

        // Slow down if paint active
        content = content.replace(
            /if \(powerupFreeze > 0\) speedMult \*= 0\.1;/,
            `if (powerupFreeze > 0) speedMult *= 0.1;
             if (paintSplatter > 0) speedMult *= 0.5; // Sticky paint`
        );

        // Draw Ninja and Paint
        content = content.replace(
            /ctx\.fillStyle = this\.type === 'ghost' \? \\\`rgba\(189, 195, 199, \\\$\{this\.alpha\}\)\\\` : this\.color;/,
            `if (this.type === 'ghost') ctx.fillStyle = \`rgba(189, 195, 199, \${this.alpha})\`;
             else if (this.type === 'ninja') ctx.fillStyle = \`rgba(0, 0, 0, \${this.alpha})\`; // black ninja, white outline
             else ctx.fillStyle = this.color;`
        );

        content = content.replace(
            /else if \(this\.type === 'nuclear'\) \{/,
            `else if (this.type === 'ninja' && this.alpha > 0) {
                 ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
                 ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2); ctx.stroke();
             } else if (this.type === 'paint') {
                 // Spiky paint ball
                 ctx.beginPath();
                 for(let i=0; i<Math.PI*2; i+=Math.PI/6) {
                     ctx.lineTo(this.x + Math.cos(i)*(this.radius + Math.random()*5), this.y + Math.sin(i)*(this.radius + Math.random()*5));
                 }
                 ctx.closePath(); ctx.fill();
             } else if (this.type === 'nuclear') {`
        );

        // Interaction Logic
        content = content.replace(
            /const isTangible = p\.type !== 'ghost' \|\| \(p\.type === 'ghost' && p\.alpha > 0\.7\);/,
            `const isTangible = (p.type !== 'ghost' && p.type !== 'ninja') ||
                               (p.type === 'ghost' && p.alpha > 0.7) ||
                               (p.type === 'ninja' && p.alpha > 0);`
        );

        content = content.replace(
            /\} else if \(p\.type === 'shield_gen'\) \{/,
            `} else if (p.type === 'paint') {
                 paintSplatter = 300; // 5 seconds
                 floatingTexts.push(new FloatingText(p.x, p.y, "SPLATTER!", p.color, 1.5));
                 particles.splice(i, 1);

                 // Giant paint explosion
                 createExplosion(p.x, p.y, p.color, true);
                 for(let j=0; j<20; j++) createExplosion(p.x + (Math.random()-0.5)*400, p.y + (Math.random()-0.5)*400, p.color, false);

                 hit = true; combo++;
                 if(window.audio) window.audio.playExplosion();
             } else if (p.type === 'ninja') {
                 createExplosion(p.x, p.y, '#fff');
                 floatingTexts.push(new FloatingText(p.x, p.y, "NINJA! +200", p.color));
                 particles.splice(i, 1);
                 hit = true; combo++; score += 200 * combo; particlesCleared++;
             } else if (p.type === 'shield_gen') {`
        );

        content = content.replace(
            /if\(powerupMagnet > 0\) \{ ctx\.fillStyle = '#9b59b6'; ctx\.fillText/,
            `if(paintSplatter > 0) {
                 paintSplatter--;
                 // Draw literal splatters
                 ctx.fillStyle = 'rgba(232, 67, 147, 0.4)';
                 ctx.beginPath(); ctx.arc(canvas.width/(2*dpr) - 100, canvas.height/(2*dpr) - 50, 80, 0, Math.PI*2); ctx.fill();
                 ctx.beginPath(); ctx.arc(canvas.width/(2*dpr) + 150, canvas.height/(2*dpr) + 100, 120, 0, Math.PI*2); ctx.fill();
             }
             if(powerupMagnet > 0) { ctx.fillStyle = '#9b59b6'; ctx.fillText`
        );


        fs.writeFileSync(filePath, content);
        v11Count++;
    }
});

console.log(`Successfully upgraded ${v11Count} 2D games to V11.0 mechanics (Ninjas, Paint Splatters).`);
