const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const games = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));

let injectedCount = 0;

games.forEach(gameFile => {
    const filePath = path.join(gamesDir, gameFile);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Inject Script Tag
    if (!content.includes('audio.js')) {
        content = content.replace(
            /<script src="\.\.\/js\/user-system\.js"><\/script>/,
            `<script src="../js/audio.js"></script>\n    <script src="../js/user-system.js"></script>`
        );
        injectedCount++;
    }

    // 2. Add Audio Triggers for 2D V5 games (inline scripts)
    if (content.includes('SUPERCHARGED PARTICLE POPPER V5.0')) {
        if (!content.includes('window.audio.playExplosion')) {
            content = content.replace(
                /shockwaves\.push\(new Shockwave[\s\S]*?\);/,
                `shockwaves.push(new Shockwave(x, y, color === '#fff' ? 'rgb(255,255,255)' : 'rgb(0,255,255)'));
                if (window.audio && isBig) window.audio.playExplosion();
                else if (window.audio) window.audio.playLaser();`
            );

            content = content.replace(
                /score \+= 10 \* combo;/,
                `score += 10 * combo;
                            if (window.audio) window.audio.playCoin();`
            );
        }
    }

    // We only write back if changes were made
    fs.writeFileSync(filePath, content);
});

console.log(`Injected audio.js script tag and inline 2D audio hooks into ${injectedCount} HTML files.`);

// 3. Inject Audio into Engines

// Engine3D
let eng3d = fs.readFileSync('js/engine3d.js', 'utf-8');
if (!eng3d.includes('window.audio.playLaser')) {
    eng3d = eng3d.replace(
        /this\.muzzleFlash\.intensity = 2;/,
        `this.muzzleFlash.intensity = 2;
        if(window.audio) window.audio.playLaser();`
    );
    eng3d = eng3d.replace(
        /this\.scene\.add\(grenade\);/,
        `this.scene.add(grenade);
        if(window.audio) window.audio.playJump();` // small toss sound
    );
    eng3d = eng3d.replace(
        /this\.spawnParticles\(p\.mesh\.position, 0xe74c3c, 50\);/,
        `this.spawnParticles(p.mesh.position, 0xe74c3c, 50);
                    if(window.audio) window.audio.playExplosion();`
    );
    eng3d = eng3d.replace(
        /if \(this\.camera\.position\.y <= 2\) this\.velocity\.y = this\.config\.jumpForce;/,
        `if (this.camera.position.y <= 2) {
            this.velocity.y = this.config.jumpForce;
            if(window.audio) window.audio.playJump();
        }`
    );
    fs.writeFileSync('js/engine3d.js', eng3d);
    console.log('Injected audio hooks into engine3d.js');
}

// EngineTycoon
let engTyc = fs.readFileSync('js/engineTycoon.js', 'utf-8');
if (!engTyc.includes('window.audio.playClick')) {
    engTyc = engTyc.replace(
        /this\.updateUI\(\);\n\s*\}\n\n\s*createClickText/,
        `this.updateUI();
        if(window.audio) window.audio.playClick();
    }

    createClickText`
    );
    engTyc = engTyc.replace(
        /this\.updateUI\(\);\n\s*\}\n\s*\}\n\n\s*buyClickUpgrade/,
        `this.updateUI();
            if(window.audio) window.audio.playCoin();
        }
    }

    buyClickUpgrade`
    );
    engTyc = engTyc.replace(
        /this\.updateUI\(\);\n\s*\}\n\s*\}\n\n\s*initUI/,
        `this.updateUI();
            if(window.audio) window.audio.playPowerup();
        }
    }

    initUI`
    );
    engTyc = engTyc.replace(
        /this\.updateUI\(\);\n\s*\}\n\s*\}\n\n\s*doPrestige/,
        `this.updateUI();
            if(window.audio) window.audio.playPowerup();
        };

        document.body.appendChild(btn);`
    ); // golden click
    fs.writeFileSync('js/engineTycoon.js', engTyc);
    console.log('Injected audio hooks into engineTycoon.js');
}

// EngineShmup
let engShmup = fs.readFileSync('js/engineShmup.js', 'utf-8');
if (!engShmup.includes('window.audio.playLaser')) {
    engShmup = engShmup.replace(
        /if \(this\.frameCount % this\.config\.fireRate === 0\) \{/,
        `if (this.frameCount % this.config.fireRate === 0) {
            if(window.audio && this.bullets.length < 50) window.audio.playLaser();`
    );
    engShmup = engShmup.replace(
        /if\(e\.health <= 0\) \{/,
        `if(e.health <= 0) {
                        if(window.audio) window.audio.playExplosion();`
    );
    engShmup = engShmup.replace(
        /this\.score \+= 50;\n\s*continue;/,
        `this.score += 50;
                if(window.audio) window.audio.playPowerup();
                continue;`
    );
    fs.writeFileSync('js/engineShmup.js', engShmup);
    console.log('Injected audio hooks into engineShmup.js');
}

// EnginePlatformer
let engPlat = fs.readFileSync('js/enginePlatformer.js', 'utf-8');
if (!engPlat.includes('window.audio.playJump')) {
    engPlat = engPlat.replace(
        /this\.player\.jumps\+\+;/,
        `this.player.jumps++;
                if(window.audio) window.audio.playJump();`
    );
    engPlat = engPlat.replace(
        /this\.coins\+\+;/,
        `this.coins++;
                    if(window.audio) window.audio.playCoin();`
    );
    engPlat = engPlat.replace(
        /this\.score \+= 100;/,
        `this.score += 100;
                    if(window.audio) window.audio.playExplosion();` // glass break
    );
    engPlat = engPlat.replace(
        /if \(e\.code === 'KeyG'\) this\.player\.inverted = !this\.player\.inverted;/,
        `if (e.code === 'KeyG') {
                this.player.inverted = !this.player.inverted;
                if(window.audio) window.audio.playPowerup();
            }`
    );
    fs.writeFileSync('js/enginePlatformer.js', engPlat);
    console.log('Injected audio hooks into enginePlatformer.js');
}
