const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const games = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));

let v9Count = 0;

games.forEach(gameFile => {
    const filePath = path.join(gamesDir, gameFile);
    let content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes('SUPERCHARGED PARTICLE POPPER V8.0')) {
        content = content.replace('SUPERCHARGED PARTICLE POPPER V8.0', 'SUPERCHARGED PARTICLE POPPER V9.0');
        content = content.replace('Added: Meteors, Shield Generators', 'Added: Nuclear Particles, Ghost Particles');

        content = content.replace(
            /else if \(rand > 0\.84\) \{ this\.type = 'shield_gen'; this\.color = '#3498db'; this\.radius = 12; this\.hp = 3; \}/,
            `else if (rand > 0.84) { this.type = 'shield_gen'; this.color = '#3498db'; this.radius = 12; this.hp = 3; }
             else if (rand > 0.82) { this.type = 'nuclear'; this.color = '#2ecc71'; this.radius = 14; }
             else if (rand > 0.80) { this.type = 'ghost'; this.color = '#bdc3c7'; this.radius = 10; this.alpha = 0; this.phase = Math.random()*Math.PI; }`
        );

        // Update ghost phase and alpha
        content = content.replace(
            /if \(powerupFreeze > 0\) speedMult \*= 0\.1;/,
            `if (powerupFreeze > 0) speedMult *= 0.1;

                    if (this.type === 'ghost') {
                        this.phase += 0.05 * speedMult;
                        this.alpha = (Math.sin(this.phase) + 1) / 2; // 0 to 1
                    }`
        );

        // Draw ghost with alpha, nuclear with radiation sign
        content = content.replace(
            /ctx\.fillStyle = this\.color;/,
            `ctx.fillStyle = this.type === 'ghost' ? \`rgba(189, 195, 199, \${this.alpha})\` : this.color;`
        );

        content = content.replace(
            /else if \(this\.type === 'boss'\) \{/,
            `else if (this.type === 'nuclear') {
                        ctx.strokeStyle = '#27ae60'; ctx.lineWidth = 3;
                        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI*2); ctx.stroke();
                    } else if (this.type === 'boss') {`
        );

        // Interaction Logic for Nuclear and Ghost
        content = content.replace(
            /let hit = false;/,
            `let hit = false;
             let newProjectiles = []; // for nuclear`
        );

        // Nuclear explosion logic + Ghost transparency check
        content = content.replace(
            /if \(Math\.sqrt\(dx\*dx \+ dy\*dy\) <= p\.radius \* 3\.5 && !p\.isShielded\) \{/,
            `// Check Ghost tangibility
                    const isTangible = p.type !== 'ghost' || (p.type === 'ghost' && p.alpha > 0.7);

                    if (Math.sqrt(dx*dx + dy*dy) <= p.radius * 3.5 && !p.isShielded && isTangible) {`
        );

        content = content.replace(
            /else if \(p\.type === 'shield_gen'\) \{/,
            `else if (p.type === 'nuclear') {
                            createExplosion(p.x, p.y, p.color, true);
                            floatingTexts.push(new FloatingText(p.x, p.y, "RADIOACTIVE!", "#2ecc71", 1.5));
                            particles.splice(i, 1);

                            // Shoot 8 projectiles
                            for(let n=0; n<Math.PI*2; n+=Math.PI/4) {
                                let np = new Particle();
                                np.x = p.x; np.y = p.y;
                                np.vx = Math.cos(n) * 15; np.vy = Math.sin(n) * 15;
                                np.type = 'bomb'; np.color = '#fff'; np.radius = 5;
                                newProjectiles.push(np);
                            }

                            hit = true; combo += 5;
                        } else if (p.type === 'shield_gen') {`
        );

        // Append new projectiles after the loop
        content = content.replace(
            /if \(!hit\) \{ combo = 0; floatingTexts\.push/,
            `particles.push(...newProjectiles);

                if (!hit) { combo = 0; floatingTexts.push`
        );

        fs.writeFileSync(filePath, content);
        v9Count++;
    }
});

console.log(`Successfully upgraded ${v9Count} 2D games to V9.0 mechanics (Nuclear and Ghost particles).`);
