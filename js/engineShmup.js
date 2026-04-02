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
        this.blackHoleActive = 0;
        this.drones = [];
        this.missiles = [];
        this.pets = [];
        this.laserActive = 0;
        this.lightningArcs = [];
        this.rewinds = 2; // Z key
        this.history = []; // state history
        this.isRewinding = false;
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

    fireChainLightning() {
        if (this.enemies.length === 0) return;

        // Find closest enemy to start
        let closest = null; let minDist = Infinity;
        this.enemies.forEach(e => {
            const dist = Math.sqrt((e.x-this.player.x)**2 + (e.y-this.player.y)**2);
            if (dist < minDist) { minDist = dist; closest = e; }
        });

        if (closest) {
            let currentTarget = closest;
            let hits = 0;
            const maxHits = 10;
            const damage = 100;

            // Arc logic
            while(currentTarget && hits < maxHits) {
                currentTarget.health -= damage;
                this.createExplosion(currentTarget.x, currentTarget.y, '#f1c40f', 10);

                let nextTarget = null; let nextDist = 200; // max arc distance
                this.enemies.forEach(e => {
                    if (e !== currentTarget && e.health > 0 && !e.hitByLightning) {
                        const dist = Math.sqrt((e.x-currentTarget.x)**2 + (e.y-currentTarget.y)**2);
                        if (dist < nextDist) { nextDist = dist; nextTarget = e; }
                    }
                });

                if (nextTarget) {
                    // Store line to draw
                    this.lightningArcs.push({ x1: currentTarget.x, y1: currentTarget.y, x2: nextTarget.x, y2: nextTarget.y, life: 10 });
                    currentTarget.hitByLightning = true;
                    currentTarget = nextTarget;
                    hits++;
                } else {
                    break;
                }
            }

            // Reset tags
            this.enemies.forEach(e => e.hitByLightning = false);
            if(window.audio) window.audio.playExplosion();
        }
    }

    togglePetFormation() {
        this.petFormation = this.petFormation === 'spread' ? 'focus' : 'spread';
        if(window.audio) window.audio.playClick();
    }

    fireGrazeBurst() {
        this.grazeMeter = 0;
        this.grazeBursting = 100; // Radius growth timer
        if(window.audio) window.audio.playExplosion();
        this.shakeTimer = 60;
    }

    rewindTime() {
        if (this.rewinds <= 0 || this.isRewinding) return;
        this.rewinds--;
        this.isRewinding = true;
        if(window.audio) window.audio.playPowerup();
    }

    fireNuke() {
        if (this.nukes <= 0) return;
        this.nukes--;
        this.shakeTimer = 60; // longer shake

        // Spawn Black Hole
        this.blackHoleActive = 120; // 2 seconds
        if(window.audio) window.audio.playExplosion();
    }

    spawnEnemy() {
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
        const types = ['heal', 'weapon', 'shield', 'drone', 'missiles', 'pet', 'laser', 'reflector', 'lightning'];
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

        // Pet Auto Fire
        this.pets.forEach((pt, idx) => {
            pt.fireTimer--;
            if (pt.fireTimer <= 0) {
                pt.fireTimer = 30 + Math.random()*20;
                let bx = this.player.x + pt.offsetX;
                let by = this.player.y + pt.offsetY - 10;

                // Move pets to formation
                if (this.petFormation === 'focus') {
                    // Close in
                    pt.offsetX += ( (idx%2===0 ? -15 : 15) - pt.offsetX ) * 0.1;
                    pt.offsetY += ( 20 - pt.offsetY ) * 0.1;
                } else {
                    // Spread out
                    pt.offsetX += ( (idx%2===0 ? -40 : 40) - pt.offsetX ) * 0.1;
                    pt.offsetY += ( 50 - pt.offsetY ) * 0.1;
                }

                this.bullets.push({
                    x: bx, y: by,
                    vx: 0, vy: -12, damage: 15
                });
                if(window.audio) window.audio.playLaser();
            }

            // Draw Pet (hacky to put in update but saves a loop)
            this.ctx.beginPath();
            this.ctx.arc(this.player.x + pt.offsetX, this.player.y + pt.offsetY, 8, 0, Math.PI*2);
            this.ctx.fillStyle = '#2ecc71';
            this.ctx.fill();
        });

        // Laser Logic
        if (this.laserActive > 0) {
            this.laserActive--;
            this.ctx.fillStyle = `rgba(0, 255, 255, ${Math.random()})`;
            this.ctx.fillRect(this.player.x - 20, 0, 40, this.player.y);

            // Damage everything in beam
            this.enemies.forEach((e, i) => {
                if (e.x > this.player.x - 40 && e.x < this.player.x + 40) {
                    e.health -= 50; // continuous damage
                    this.createExplosion(e.x, e.y, '#00ffff', 2);
                    if (e.health <= 0) {
                        this.score += e.type === 'boss' ? 1000 : 100;
                        this.enemiesKilled++;
                        this.spawnPowerup(e.x, e.y);
                        this.createExplosion(e.x, e.y, '#ffaa00', 20);
                        this.enemies.splice(i, 1);
                    }
                }
            });
        }

        // Auto Fire
        if (this.player.powerupTimer > 0 && this.player.powerupType === 'missiles' && this.frameCount % (this.config.fireRate * 2) === 0) {
            this.missiles.push({
                x: this.player.x, y: this.player.y - 10,
                vx: (Math.random()-0.5)*10, vy: -5,
                damage: 30
            });
        }

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

        // Homing Missiles
        for(let i = this.missiles.length - 1; i >= 0; i--) {
            let m = this.missiles[i];
            m.x += m.vx; m.y += m.vy;

            // Find closest enemy
            let closest = null; let minDist = Infinity;
            this.enemies.forEach(e => {
                const dist = Math.sqrt((e.x-m.x)**2 + (e.y-m.y)**2);
                if (dist < minDist) { minDist = dist; closest = e; }
            });

            if (closest) {
                const angle = Math.atan2(closest.y - m.y, closest.x - m.x);
                m.vx += Math.cos(angle) * 0.5;
                m.vy += Math.sin(angle) * 0.5;

                // Speed cap
                const speed = Math.sqrt(m.vx**2 + m.vy**2);
                if (speed > 8) { m.vx = (m.vx/speed)*8; m.vy = (m.vy/speed)*8; }
            }

            // Smoke trail
            this.particles.push({x: m.x, y: m.y, vx: 0, vy: 0, life: 0.5, color: '#bdc3c7'});

            if(m.y < -50 || m.x < -50 || m.x > this.width + 50) this.missiles.splice(i, 1);
        }

        // Lightning Arcs
        for(let i=this.lightningArcs.length-1; i>=0; i--) {
            let l = this.lightningArcs[i];
            this.ctx.beginPath();
            this.ctx.moveTo(l.x1, l.y1);

            // Jagged line
            let dx = l.x2 - l.x1; let dy = l.y2 - l.y1;
            this.ctx.lineTo(l.x1 + dx/2 + (Math.random()-0.5)*30, l.y1 + dy/2 + (Math.random()-0.5)*30);
            this.ctx.lineTo(l.x2, l.y2);

            this.ctx.strokeStyle = `rgba(241, 196, 15, ${l.life/10})`;
            this.ctx.lineWidth = 4;
            this.ctx.stroke();

            l.life--;
            if(l.life <= 0) this.lightningArcs.splice(i, 1);
        }

        // Graze Burst Ring
        if (this.grazeBursting > 0) {
            const radius = (100 - this.grazeBursting) * 8; // expands to ~800
            this.grazeBursting--;

            // Destroy bullets in ring
            for(let i=this.enemyBullets.length-1; i>=0; i--) {
                let b = this.enemyBullets[i];
                if (Math.sqrt((b.x-this.player.x)**2 + (b.y-this.player.y)**2) < radius) {
                    this.createExplosion(b.x, b.y, '#00ffff', 5);
                    this.enemyBullets.splice(i,1);
                    this.score += 10;
                }
            }

            // Damage enemies in ring
            this.enemies.forEach((e, i) => {
                if (Math.sqrt((e.x-this.player.x)**2 + (e.y-this.player.y)**2) < radius) {
                    e.health -= 5; // massive continuous AoE
                    this.createExplosion(e.x, e.y, '#00ffff', 2);
                    if(e.health <= 0) {
                        this.score += e.type === 'boss' ? 1000 : 100;
                        this.enemiesKilled++;
                        this.spawnPowerup(e.x, e.y);
                        this.createExplosion(e.x, e.y, '#ffaa00', e.type === 'boss' ? 100 : 20);
                        this.enemies.splice(i, 1);
                    }
                }
            });

            // Draw
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, radius, 0, Math.PI*2);
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${this.grazeBursting/100})`;
            this.ctx.lineWidth = 10;
            this.ctx.stroke();
        }

        // Enemy Bullets
        // Black Hole logic
        if (this.blackHoleActive > 0) {
            this.blackHoleActive--;
            const cx = this.width/2;
            const cy = this.height/2;

            // Suck enemies
            this.enemies.forEach((e, i) => {
                const dx = cx - e.x; const dy = cy - e.y;
                const d2 = dx*dx + dy*dy;
                e.vx += (dx/Math.sqrt(d2)) * 1.5;
                e.vy += (dy/Math.sqrt(d2)) * 1.5;

                if (d2 < 2000) {
                    e.health = 0; // Crush
                }
            });

            // Suck enemy bullets
            this.enemyBullets.forEach(b => {
                const dx = cx - b.x; const dy = cy - b.y;
                const d2 = dx*dx + dy*dy;
                b.vx += (dx/Math.sqrt(d2)) * 3;
                b.vy += (dy/Math.sqrt(d2)) * 3;
            });

            if (this.blackHoleActive === 1) {
                // Detonate
                this.createExplosion(cx, cy, '#ffffff', 200);
                this.enemyBullets = [];
                if(window.audio) window.audio.playExplosion();
            }
        }

        for(let i = this.enemyBullets.length - 1; i >= 0; i--) {
            let b = this.enemyBullets[i];
            b.x += b.vx; b.y += b.vy;

            // Check player hit
            const dx = b.x - this.player.x;
            const dy = b.y - this.player.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            // Graze check (very close but no hit)
            if (dist > this.player.radius + 5 && dist < this.player.radius + 15) {
                if (!b.grazed) {
                    b.grazed = true;
                    this.score += 5; // Graze points
                    this.createExplosion(b.x, b.y, '#f1c40f', 1);
                    this.grazeMeter += 1;
                    if (this.grazeMeter >= 50) this.fireGrazeBurst(); // tiny spark
                    if(window.audio && Math.random() > 0.5) window.audio.playCoin(); // ting!
                }
            }

            if (dist < this.player.radius + 5) {

            // Drone collision
            let hitDrone = false;
            for(let d=this.drones.length-1; d>=0; d--) {
                let drone = this.drones[d];
                const dxD = b.x - (this.player.x + Math.cos(drone.angle)*40);
                const dyD = b.y - (this.player.y + Math.sin(drone.angle)*40);
                if (Math.sqrt(dxD*dxD + dyD*dyD) < 15) {
                    drone.hp--;
                    hitDrone = true;
                    this.createExplosion(b.x, b.y, '#3498db', 5);
                    if(drone.hp <= 0) this.drones.splice(d,1);
                    break;
                }
            }
            if(hitDrone) { this.enemyBullets.splice(i, 1); continue; }

            if (this.player.powerupTimer > 0 && this.player.powerupType === 'reflector') {
                // Bounce back
                b.vy *= -1;
                b.damage *= 2; // double damage back
                this.bullets.push(b); // convert to player bullet
                this.enemyBullets.splice(i, 1);
                if(window.audio) window.audio.playCoin();
                continue;
            } else if (this.player.powerupTimer <= 0 || this.player.powerupType !== 'shield') {
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
            // Check Missiles
            for(let j = this.missiles.length - 1; j >= 0; j--) {
                let m = this.missiles[j];
                if(Math.sqrt((m.x-e.x)**2 + (m.y-e.y)**2) < e.radius + 10) {
                    e.health -= m.damage;
                    this.missiles.splice(j, 1);
                    this.createExplosion(m.x, m.y, '#e74c3c', 15);
                    if(e.health <= 0) {
                        hit = true; break; // handle death below
                    }
                }
            }

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

            if(e.health <= 0 && hit) { // from missile
                this.score += e.type === 'boss' ? 1000 : 100;
                this.enemiesKilled++;
                this.spawnPowerup(e.x, e.y);
                this.createExplosion(e.x, e.y, '#ffaa00', e.type === 'boss' ? 100 : 20);
                this.enemies.splice(i, 1);
                if(window.userSystem) window.userSystem.addXP(e.type === 'boss' ? 50 : 5);
                if (this.enemiesKilled % 20 === 0) this.wave++;
                continue;
            }
            if(e.health <= 0) { // from lightning/laser
                this.score += e.type === 'boss' ? 1000 : 100;
                this.enemiesKilled++;
                this.spawnPowerup(e.x, e.y);
                this.createExplosion(e.x, e.y, '#ffaa00', e.type === 'boss' ? 100 : 20);
                this.enemies.splice(i, 1);
                if(window.userSystem) window.userSystem.addXP(e.type === 'boss' ? 50 : 5);
                if (this.enemiesKilled % 20 === 0) this.wave++;
                continue;
            }
            if(hit) continue;

            // Player Collision (Ram)
            // Drone Ramming
            for(let d=this.drones.length-1; d>=0; d--) {
                let drone = this.drones[d];
                const dxD = e.x - (this.player.x + Math.cos(drone.angle)*40);
                const dyD = e.y - (this.player.y + Math.sin(drone.angle)*40);
                if (Math.sqrt(dxD*dxD + dyD*dyD) < e.radius + 10) {
                    e.health -= 50;
                    drone.hp--;
                    this.createExplosion(e.x, e.y, '#3498db', 10);
                    if(drone.hp <= 0) this.drones.splice(d,1);
                }
            }

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
                if(p.type === 'drone') {
                    this.drones.push({ angle: 0, hp: 3 });
                }
                if(p.type === 'missiles') {
                    this.player.powerupTimer = 400; this.player.powerupType = 'missiles';
                }
                if(p.type === 'pet') {
                    this.pets.push({ offsetX: (Math.random()-0.5)*100, offsetY: 50, fireTimer: 0 });
                }
                if(p.type === 'laser') {
                    this.laserActive = 120; // 2 seconds
        this.grazeMeter = 0;
        this.petFormation = 'spread'; // spread or focus
        this.grazeBursting = 0;
                    this.shakeTimer = 120;
                    if(window.audio) window.audio.playExplosion(); // loud laser sound
                }
                if(p.type === 'lightning') {
                    // Chain Lightning triggers immediately
                    this.fireChainLightning();
                }
                    this.laserActive = 120; // 2 seconds
                    this.shakeTimer = 120;
                    if(window.audio) window.audio.playExplosion();
                }
                if(p.type === 'reflector') {
                    this.player.powerupTimer = 400; this.player.powerupType = 'reflector';
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

        // Black Hole
        if (this.blackHoleActive > 0) {
            this.ctx.beginPath();
            this.ctx.arc(this.width/2, this.height/2, 40 + Math.sin(this.frameCount*0.2)*10, 0, Math.PI*2);
            this.ctx.fillStyle = '#000';
            this.ctx.fill();
            this.ctx.strokeStyle = '#9b59b6';
            this.ctx.lineWidth = 5;
            this.ctx.stroke();
        }

        // Bullets
        this.ctx.fillStyle = '#f1c40f';
        this.bullets.forEach(b => {
            this.ctx.fillRect(b.x - 2, b.y - 10, 4, 20);
        });

        // Missiles
        this.ctx.fillStyle = '#e74c3c';
        this.missiles.forEach(m => {
            this.ctx.fillRect(m.x - 3, m.y - 8, 6, 16);
            this.ctx.fillStyle = '#f1c40f';
            this.ctx.fillRect(m.x - 2, m.y + 8, 4, 4); // flame
            this.ctx.fillStyle = '#e74c3c';
        });

        // Drones
        this.ctx.fillStyle = '#3498db';
        this.drones.forEach((d, i) => {
            d.angle += 0.05 + (i * 0.01);
            const dx = this.player.x + Math.cos(d.angle) * 40;
            const dy = this.player.y + Math.sin(d.angle) * 40;
            this.ctx.beginPath();
            this.ctx.arc(dx, dy, 8, 0, Math.PI*2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = d.hp;
            this.ctx.stroke();
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
        this.ctx.fillText(`Nukes: ${this.nukes} (Space) | Rewinds: ${this.rewinds} (Z)`, 20, this.height - 50);

        // Graze Meter UI
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.width - 220, this.height - 30, 200, 15);
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillRect(this.width - 220, this.height - 30, Math.min(200, 200 * (this.grazeMeter/50)), 15);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px "Fredoka One"';
        this.ctx.fillText("GRAZE BURST (X to toggle Pets)", this.width - 210, this.height - 40);
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

        if (this.isRewinding) {
            // Apply history backwards
            if (this.history.length > 0) {
                const h = this.history.pop();
                this.enemies = h.e;
                this.enemyBullets = h.eb;
                this.player.health = Math.max(this.player.health, h.ph); // heal if rewinding past damage
                this.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
                this.ctx.fillRect(0, 0, this.width, this.height); // rewind effect
            } else {
                this.isRewinding = false;
            }
        } else {
            // Record state (limit to 60 frames = ~1 sec rewind)
            this.history.push({
                e: JSON.parse(JSON.stringify(this.enemies)), // deep copy required for simple array of objects
                eb: JSON.parse(JSON.stringify(this.enemyBullets)),
                ph: this.player.health
            });
            if(this.history.length > 60) this.history.shift();

            this.updatePlayer();
            this.updateEntities();
        }
        this.draw();

        requestAnimationFrame(() => this.loop());
    }
}
window.ShmupEngine = ShmupEngine;
