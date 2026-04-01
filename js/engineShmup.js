// Advanced 2D Bullet Hell / Space Shooter Engine

class ShmupEngine {
    constructor(canvasId, config) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.config = Object.assign({
            themeColor: '#00ffff',
            playerSpeed: 6,
            fireRate: 8,
            enemySpeedMult: 1.0,
            enemySpawnRate: 60,
            bossWave: 10
        }, config);

        this.initCanvas();

        this.player = {
            x: this.width / 2,
            y: this.height - 100,
            radius: 15,
            health: 100,
            weaponLevel: 1,
            powerupTimer: 0
        };

        this.score = 0;
        this.nukes = 3;
        this.shakeTimer = 0;
        this.starLayers = [[], [], []];
        this.wave = 1;
        this.enemiesKilled = 0;

        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.particles = [];
        this.powerups = [];
        this.stars = [];

        this.keys = {};
        this.frameCount = 0;
        this.isGameOver = false;

        this.initStars();
        this.setupControls();
        this.loop();
    }

    initCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
    }

    initStars() {
        for(let l=0; l<3; l++) {
            for(let i=0; i<50; i++) {
                this.starLayers[l].push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    size: Math.random() * (l+1) * 0.5,
                    speed: (l+1) * 0.5 + Math.random()
                });
            }
        }
    }
    }

    setupControls() {
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
            if (e.code === 'Space') this.fireNuke();
        });

        // Mouse/Touch support
        this.canvas.addEventListener('mousemove', e => {
            const rect = this.canvas.getBoundingClientRect();
            this.player.x = e.clientX - rect.left;
            this.player.y = e.clientY - rect.top;
        });
        this.canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.player.x = e.touches[0].clientX - rect.left;
            this.player.y = e.touches[0].clientY - rect.top;
        }, { passive: false });
    }

    fireNuke() {
        if (this.nukes <= 0) return;
        this.nukes--;
        this.shakeTimer = 30; // shake screen for 0.5s

        // Massive explosion
        this.createExplosion(this.width/2, this.height/2, '#ffffff', 200);

        // Clear all enemies and enemy bullets
        this.enemies.forEach(e => {
            this.createExplosion(e.x, e.y, '#ffaa00', e.type === 'boss' ? 50 : 10);
            this.score += e.type === 'boss' ? 500 : 50;
            this.enemiesKilled++;
            if(window.userSystem) window.userSystem.addXP(5);
        });

        this.enemies = [];
        this.enemyBullets = [];
        if (this.enemiesKilled % 20 === 0) this.wave++;
    }

    spawnEnemy() {
        const isBoss = (this.wave % this.config.bossWave === 0) && this.enemies.length === 0;

        if (isBoss) {
            // Structured Formations (20% chance instead of random 1)
        if (Math.random() < 0.2 && !isBoss && this.enemies.length < 5) {
            // V-Formation
            const startX = this.width / 2;
            for(let i=0; i<5; i++) {
                this.enemies.push({
                    x: startX + (i-2)*40,
                    y: -30 - Math.abs(i-2)*30,
                    radius: 15, health: hp, vx: 0, vy: vy, type: 'basic', fireTimer: Math.random()*60
                });
            }
        } else {
            this.enemies.push({
                x: Math.random() * (this.width - 40) + 20,
                y: -30,
                radius: radius,
                health: hp,
                vx: vx,
                vy: vy,
                type: eType,
                fireTimer: Math.random() * 60
            });
        }
            return;
        }

        const type = Math.random();
        let hp = 20 * this.wave;
        let radius = 15;
        let vy = (Math.random() * 2 + 1) * this.config.enemySpeedMult;
        let vx = (Math.random() - 0.5) * 2;
        let eType = 'basic';

        if (type > 0.8) { eType = 'tank'; hp *= 3; radius = 25; vy *= 0.5; }
        else if (type > 0.6) { eType = 'shooter'; }

        this.enemies.push({
            x: Math.random() * (this.width - 40) + 20,
            y: -30,
            radius: radius,
            health: hp,
            vx: vx,
            vy: vy,
            type: eType,
            fireTimer: Math.random() * 60
        });
    }

    spawnPowerup(x, y) {
        if (Math.random() > 0.1) return; // 10% chance
        const types = ['heal', 'weapon', 'shield'];
        this.powerups.push({
            x: x, y: y, radius: 12,
            vy: 2,
            type: types[Math.floor(Math.random() * types.length)],
            color: '#f1c40f'
        });
    }

    createExplosion(x, y, color, size) {
        for(let i=0; i<size; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: color
            });
        }
    }

    updatePlayer() {
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.x -= this.config.playerSpeed;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.x += this.config.playerSpeed;
        if (this.keys['ArrowUp'] || this.keys['KeyW']) this.player.y -= this.config.playerSpeed;
        if (this.keys['ArrowDown'] || this.keys['KeyS']) this.player.y += this.config.playerSpeed;

        this.player.x = Math.max(this.player.radius, Math.min(this.width - this.player.radius, this.player.x));
        this.player.y = Math.max(this.player.radius, Math.min(this.height - this.player.radius, this.player.y));

        if (this.player.powerupTimer > 0) this.player.powerupTimer--;

        // Auto Fire
        if (this.frameCount % this.config.fireRate === 0) {
            if(window.audio && this.bullets.length < 50) window.audio.playLaser();
            const spread = this.player.weaponLevel;
            for(let i=0; i<spread; i++) {
                let offset = (i - (spread-1)/2) * 10;
                let angle = (i - (spread-1)/2) * 0.1;
                this.bullets.push({
                    x: this.player.x + offset,
                    y: this.player.y - 10,
                    vx: Math.sin(angle) * 15,
                    vy: -Math.cos(angle) * 15 - 10,
                    damage: 10 + (this.player.weaponLevel * 2)
                });
            }
        }
    }

    updateEntities() {
        // Player Bullets
        for(let i = this.bullets.length - 1; i >= 0; i--) {
            let b = this.bullets[i];
            b.x += b.vx; b.y += b.vy;
            if(b.y < -50 || b.x < -50 || b.x > this.width + 50) this.bullets.splice(i, 1);
        }

        // Enemy Bullets
        for(let i = this.enemyBullets.length - 1; i >= 0; i--) {
            let b = this.enemyBullets[i];
            b.x += b.vx; b.y += b.vy;

            // Check player hit
            const dx = b.x - this.player.x;
            const dy = b.y - this.player.y;
            if (Math.sqrt(dx*dx + dy*dy) < this.player.radius + 5) {
                if (this.player.powerupTimer <= 0 || this.player.powerupType !== 'shield') {
                    this.player.health -= b.damage;
                    this.createExplosion(this.player.x, this.player.y, '#ff0000', 10);
                }
                this.enemyBullets.splice(i, 1);
                continue;
            }
            if(b.y > this.height + 50) this.enemyBullets.splice(i, 1);
        }

        // Enemies
        for(let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            e.x += e.vx; e.y += e.vy;

            // Bounds bounce
            if(e.x < e.radius || e.x > this.width - e.radius) e.vx *= -1;

            // Boss logic
            if (e.type === 'boss') {
                if(e.y > 100) e.vy = 0; // stop moving down
                e.fireTimer--;
                if(e.fireTimer <= 0) {
                    // Circle spread attack
                    for(let a=0; a<Math.PI*2; a+=Math.PI/8) {
                        this.enemyBullets.push({
                            x: e.x, y: e.y,
                            vx: Math.cos(a) * 5,
                            vy: Math.sin(a) * 5,
                            damage: 15
                        });
                    }
                    e.fireTimer = 120;
                }
            } else if (e.type === 'shooter') {
                e.fireTimer--;
                if (e.fireTimer <= 0) {
                    const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
                    this.enemyBullets.push({
                        x: e.x, y: e.y,
                        vx: Math.cos(angle) * 7,
                        vy: Math.sin(angle) * 7,
                        damage: 10
                    });
                    e.fireTimer = 90;
                }
            }

            // Bullet Collision
            let hit = false;
            for(let j = this.bullets.length - 1; j >= 0; j--) {
                let b = this.bullets[j];
                const dx = b.x - e.x;
                const dy = b.y - e.y;
                if(Math.sqrt(dx*dx + dy*dy) < e.radius + 5) {
                    e.health -= b.damage;
                    this.bullets.splice(j, 1);
                    this.createExplosion(b.x, b.y, this.config.themeColor, 3);
                    if(e.health <= 0) {
                        if(window.audio) window.audio.playExplosion();
                        this.score += e.type === 'boss' ? 1000 : 100;
                        this.enemiesKilled++;
                        this.spawnPowerup(e.x, e.y);
                        this.createExplosion(e.x, e.y, '#ffaa00', e.type === 'boss' ? 100 : 20);
                        this.enemies.splice(i, 1);
                        hit = true;

                        if(window.userSystem) window.userSystem.addXP(e.type === 'boss' ? 50 : 5);

                        if (this.enemiesKilled % 20 === 0) this.wave++;
                        break;
                    }
                }
            }
            if(hit) continue;

            // Player Collision (Ram)
            const dx = e.x - this.player.x;
            const dy = e.y - this.player.y;
            if(Math.sqrt(dx*dx + dy*dy) < e.radius + this.player.radius) {
                if (this.player.powerupTimer <= 0 || this.player.powerupType !== 'shield') {
                    this.player.health -= 30;
                }
                e.health = 0;
                this.createExplosion(e.x, e.y, '#ffaa00', 30);
                this.enemies.splice(i, 1);
            }

            if(e && e.y > this.height + 100) this.enemies.splice(i, 1);
        }

        // Powerups
        for(let i = this.powerups.length - 1; i >= 0; i--) {
            let p = this.powerups[i];
            p.y += p.vy;
            const dx = p.x - this.player.x;
            const dy = p.y - this.player.y;
            if(Math.sqrt(dx*dx + dy*dy) < p.radius + this.player.radius) {
                if(p.type === 'heal') this.player.health = Math.min(100, this.player.health + 30);
                if(p.type === 'weapon') this.player.weaponLevel = Math.min(5, this.player.weaponLevel + 1);
                if(p.type === 'shield') { this.player.powerupTimer = 300; this.player.powerupType = 'shield'; }

                this.createExplosion(p.x, p.y, p.color, 15);
                this.powerups.splice(i, 1);
                this.score += 50;
                if(window.audio) window.audio.playPowerup();
                continue;
            }
            if(p.y > this.height + 50) this.powerups.splice(i, 1);
        }

        // Particles
        for(let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx; p.y += p.vy;
            p.life -= 0.03;
            if(p.life <= 0) this.particles.splice(i, 1);
        }
    }

    draw() {
        this.ctx.save();
        if (this.shakeTimer > 0) {
            const dx = (Math.random() - 0.5) * 20;
            const dy = (Math.random() - 0.5) * 20;
            this.ctx.translate(dx, dy);
            this.shakeTimer--;
        }

        // Background
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(-20, -20, this.width+40, this.height+40); // cover shake gaps

        // 3 Layer Parallax Stars
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillStyle = '#ffffff';
        this.starLayers.forEach((layer, index) => {
            layer.forEach(s => {
                s.y += s.speed;
                if(s.y > this.height) { s.y = 0; s.x = Math.random() * this.width; }
                this.ctx.globalAlpha = 0.3 + (index * 0.2);
                this.ctx.fillRect(s.x, s.y, s.size, s.size);
            });
        });
        this.ctx.globalAlpha = 1.0;

        // Player
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x, this.player.y - this.player.radius);
        this.ctx.lineTo(this.player.x - this.player.radius, this.player.y + this.player.radius);
        this.ctx.lineTo(this.player.x + this.player.radius, this.player.y + this.player.radius);
        this.ctx.closePath();
        this.ctx.fillStyle = this.config.themeColor;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.config.themeColor;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        if (this.player.powerupTimer > 0 && this.player.powerupType === 'shield') {
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, this.player.radius + 10, 0, Math.PI*2);
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }

        // Enemies
        this.enemies.forEach(e => {
            this.ctx.beginPath();
            if (e.type === 'boss') {
                this.ctx.rect(e.x - e.radius, e.y - e.radius, e.radius*2, e.radius*2);
                this.ctx.fillStyle = '#8e44ad';
            } else if (e.type === 'tank') {
                this.ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2);
                this.ctx.fillStyle = '#e67e22';
            } else {
                this.ctx.moveTo(e.x, e.y + e.radius);
                this.ctx.lineTo(e.x - e.radius, e.y - e.radius);
                this.ctx.lineTo(e.x + e.radius, e.y - e.radius);
                this.ctx.fillStyle = '#e74c3c';
            }
            this.ctx.fill();

            // Boss HP Bar
            if (e.type === 'boss') {
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.fillRect(e.x - e.radius, e.y - e.radius - 15, e.radius*2 * (e.health/e.maxHealth), 8);
            }
        });

        // Bullets
        this.ctx.fillStyle = '#f1c40f';
        this.bullets.forEach(b => {
            this.ctx.fillRect(b.x - 2, b.y - 10, 4, 20);
        });

        this.ctx.fillStyle = '#ff0000';
        this.enemyBullets.forEach(b => {
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, 4, 0, Math.PI*2);
            this.ctx.fill();
        });

        // Powerups
        this.powerups.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
            this.ctx.fillStyle = '#000';
            this.ctx.textAlign = 'center';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(p.type.charAt(0).toUpperCase(), p.x, p.y + 4);
        });

        // Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;

        // UI
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px "Fredoka One"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(\`Score: \${this.score}\`, 20, 30);
        this.ctx.fillText(\`Wave: \${this.wave}\`, 20, 60);

        // HP Bar
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(20, this.height - 30, 200, 15);
        this.ctx.fillStyle = this.player.health > 30 ? '#2ecc71' : '#e74c3c';
        this.ctx.fillRect(20, this.height - 30, Math.max(0, 200 * (this.player.health/100)), 15);

        // Nuke UI
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`Nukes: ${this.nukes} (Space)`, 20, this.height - 50);
        this.ctx.restore();
    }

    loop() {
        if (this.player.health <= 0) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 40px "Fredoka One"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width/2, this.height/2);
            this.ctx.font = '20px "Nunito"';
            this.ctx.fillText(\`Final Score: \${this.score}\`, this.width/2, this.height/2 + 40);

            if(window.userSystem) {
                // Large death penalty/reward logic could go here
            }
            return;
        }

        this.frameCount++;

        let spawnRate = Math.max(10, this.config.enemySpawnRate - (this.wave * 2));
        if (this.frameCount % spawnRate === 0) {
            this.spawnEnemy();
        }

        this.updatePlayer();
        this.updateEntities();
        this.draw();

        requestAnimationFrame(() => this.loop());
    }
}
window.ShmupEngine = ShmupEngine;
