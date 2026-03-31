// Advanced 3D Engine with Multiplayer Scaffolding and Bot AI
// Uses Three.js (assumed to be loaded globally via CDN)

class GameEngine3D {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = Object.assign({
            biome: 'neon', // neon, desert, ice, mars, toxic
            gravity: 0.015,
            botCount: 15,
            jumpForce: 0.3,
            speed: 0.2,
            weaponDamage: 25,
            maxHealth: 100,
            worldSize: 200
        }, config);

        this.score = 0;
        this.coins = 0;
        this.health = this.config.maxHealth;
        this.isLocked = false;

        this.bots = [];
        this.projectiles = [];
        this.obstacles = [];

        this.keys = { w: false, a: false, s: false, d: false, space: false };
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        this.init();
    }

    init() {
        // Setup Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.getBiomeBgColor());
        this.scene.fog = new THREE.Fog(this.scene.background, 10, this.config.worldSize * 0.8);

        // Setup Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = 2;

        // Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        this.scene.add(dirLight);

        // Generate World
        this.buildWorld();
        this.spawnBots();

        // Controls (Custom FPS)
        this.setupControls();

        // UI Setup
        this.setupUI();

        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Loop
        this.prevTime = performance.now();
        this.animate();

        // Multiplayer Mock connect
        this.connectMultiplayer();
    }

    getBiomeBgColor() {
        const biomes = {
            neon: 0x050510,
            desert: 0xe0cdb1,
            ice: 0xd4f0ff,
            mars: 0x8c3b2d,
            toxic: 0x1f2e1a
        };
        return biomes[this.config.biome] || 0x000000;
    }

    getBiomeFloorColor() {
        const biomes = {
            neon: 0x111122,
            desert: 0xc2b280,
            ice: 0xa5f2f3,
            mars: 0xad6242,
            toxic: 0x3d5c31
        };
        return biomes[this.config.biome] || 0x222222;
    }

    getBiomeObstacleColor() {
        const biomes = {
            neon: 0x00ffff,
            desert: 0x8b5a2b,
            ice: 0x87ceeb,
            mars: 0x5c2b20,
            toxic: 0x7fff00
        };
        return biomes[this.config.biome] || 0xffffff;
    }

    buildWorld() {
        // Floor
        const floorGeo = new THREE.PlaneGeometry(this.config.worldSize, this.config.worldSize);
        const floorMat = new THREE.MeshStandardMaterial({
            color: this.getBiomeFloorColor(),
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Obstacles
        const obsGeo = new THREE.BoxGeometry(1, 1, 1);
        const obsMat = new THREE.MeshStandardMaterial({ color: this.getBiomeObstacleColor() });

        // Generate random city/maze
        for (let i = 0; i < 150; i++) {
            const obs = new THREE.Mesh(obsGeo, obsMat);
            obs.scale.set(
                Math.random() * 5 + 2,
                Math.random() * 10 + 2,
                Math.random() * 5 + 2
            );
            obs.position.set(
                (Math.random() - 0.5) * this.config.worldSize * 0.9,
                obs.scale.y / 2,
                (Math.random() - 0.5) * this.config.worldSize * 0.9
            );
            obs.castShadow = true;
            obs.receiveShadow = true;
            this.scene.add(obs);
            this.obstacles.push(new THREE.Box3().setFromObject(obs));
        }
    }

    spawnBots() {
        const botNames = ['SniperGod', 'NoobMaster', 'Alex2010', 'ProGamer', 'ToxicPlayer', 'Bot_1', 'ShadowNinja'];
        const botGeo = new THREE.BoxGeometry(1.5, 3, 1.5);

        for (let i = 0; i < this.config.botCount; i++) {
            const botMat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
            const bot = new THREE.Mesh(botGeo, botMat);
            bot.position.set(
                (Math.random() - 0.5) * this.config.worldSize * 0.8,
                1.5,
                (Math.random() - 0.5) * this.config.worldSize * 0.8
            );
            bot.castShadow = true;
            this.scene.add(bot);

            this.bots.push({
                mesh: bot,
                health: 100,
                name: botNames[Math.floor(Math.random() * botNames.length)] + Math.floor(Math.random()*100),
                vx: (Math.random() - 0.5) * 0.1,
                vz: (Math.random() - 0.5) * 0.1,
                shootTimer: Math.random() * 100
            });
        }
    }

    setupControls() {
        // Pointer Lock
        document.body.addEventListener('click', () => {
            if (!this.isLocked && document.getElementById('shop-modal').style.display === 'none') {
                document.body.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === document.body;
            document.getElementById('crosshair').style.display = this.isLocked ? 'block' : 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isLocked) {
                const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
                const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

                this.camera.rotation.y -= movementX * 0.002;
                this.camera.rotation.x -= movementY * 0.002;

                // Clamp pitch
                this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!this.isLocked) return;
            switch(e.code) {
                case 'KeyW': this.keys.w = true; break;
                case 'KeyA': this.keys.a = true; break;
                case 'KeyS': this.keys.s = true; break;
                case 'KeyD': this.keys.d = true; break;
                case 'Space':
                    if (this.camera.position.y <= 2) this.velocity.y = this.config.jumpForce;
                    break;
                case 'KeyE':
                    this.openShop();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW': this.keys.w = false; break;
                case 'KeyA': this.keys.a = false; break;
                case 'KeyS': this.keys.s = false; break;
                case 'KeyD': this.keys.d = false; break;
            }
        });

        // Shooting
        document.addEventListener('mousedown', (e) => {
            if (this.isLocked && e.button === 0) {
                this.shoot();
            }
        });
    }

    setupUI() {
        this.ui = document.createElement('div');
        this.ui.innerHTML = \`
            <div id="crosshair" style="display:none; position:fixed; top:50%; left:50%; width:10px; height:10px; background:white; border-radius:50%; transform:translate(-50%,-50%); pointer-events:none; z-index:100; mix-blend-mode: difference;"></div>
            <div style="position:fixed; bottom:20px; left:20px; color:white; font-family:'Fredoka One', cursive; font-size:24px; text-shadow:2px 2px 0 #000; z-index:100;">
                <div id="hp-display">HP: \${this.health} / \${this.config.maxHealth}</div>
                <div id="coin-display">Coins: \${this.coins} 🪙</div>
                <div id="score-display">Kills: \${this.score}</div>
                <div style="font-size:14px; color:#aaa;">Press [E] for Upgrades</div>
            </div>
            <div id="hit-marker" style="display:none; position:fixed; top:50%; left:50%; color:red; font-size:24px; font-weight:bold; transform:translate(-50%,-50%); z-index:99; pointer-events:none;">X</div>

            <!-- Shop Modal -->
            <div id="shop-modal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.9); padding:30px; border-radius:15px; border:2px solid #3498db; color:white; z-index:200; font-family:'Nunito', sans-serif; text-align:center; min-width:300px;">
                <h2 style="font-family:'Fredoka One', cursive; margin-top:0; color:#f1c40f;">UPGRADE SHOP</h2>
                <p>Coins: <span id="shop-coins">0</span></p>

                <div style="margin:20px 0; display:flex; flex-direction:column; gap:10px;">
                    <button onclick="window.gameEngine.buyUpgrade('damage')" style="padding:10px; background:#e74c3c; border:none; color:white; border-radius:5px; cursor:pointer;">+ Damage (50 🪙)</button>
                    <button onclick="window.gameEngine.buyUpgrade('speed')" style="padding:10px; background:#3498db; border:none; color:white; border-radius:5px; cursor:pointer;">+ Speed (50 🪙)</button>
                    <button onclick="window.gameEngine.buyUpgrade('health')" style="padding:10px; background:#2ecc71; border:none; color:white; border-radius:5px; cursor:pointer;">+ Max HP & Heal (100 🪙)</button>
                </div>

                <button onclick="window.gameEngine.closeShop()" style="margin-top:20px; padding:10px 20px; background:#95a5a6; border:none; color:white; border-radius:5px; cursor:pointer;">Close & Resume</button>
            </div>

            <!-- Kill Feed -->
            <div id="kill-feed" style="position:fixed; top:20px; right:20px; color:white; font-family:'Nunito', sans-serif; font-size:14px; text-shadow:1px 1px 0 #000; text-align:right; z-index:100;"></div>
        \`;
        document.body.appendChild(this.ui);
    }

    updateUIDisplay() {
        document.getElementById('hp-display').innerText = \`HP: \${Math.floor(this.health)} / \${this.config.maxHealth}\`;
        document.getElementById('coin-display').innerText = \`Coins: \${this.coins} 🪙\`;
        document.getElementById('score-display').innerText = \`Kills: \${this.score}\`;
    }

    showHitMarker() {
        const hm = document.getElementById('hit-marker');
        hm.style.display = 'block';
        setTimeout(() => hm.style.display = 'none', 100);
    }

    addKillFeed(msg) {
        const feed = document.getElementById('kill-feed');
        const item = document.createElement('div');
        item.innerText = msg;
        item.style.marginBottom = '5px';
        feed.appendChild(item);
        setTimeout(() => item.remove(), 4000);
    }

    openShop() {
        document.exitPointerLock();
        document.getElementById('shop-modal').style.display = 'block';
        document.getElementById('shop-coins').innerText = this.coins;
    }

    closeShop() {
        document.getElementById('shop-modal').style.display = 'none';
        document.body.requestPointerLock();
    }

    buyUpgrade(type) {
        if (type === 'damage' && this.coins >= 50) {
            this.coins -= 50;
            this.config.weaponDamage += 10;
        } else if (type === 'speed' && this.coins >= 50) {
            this.coins -= 50;
            this.config.speed += 0.05;
        } else if (type === 'health' && this.coins >= 100) {
            this.coins -= 100;
            this.config.maxHealth += 50;
            this.health = this.config.maxHealth;
        } else {
            return;
        }
        document.getElementById('shop-coins').innerText = this.coins;
        this.updateUIDisplay();
    }

    shoot() {
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);

        const projGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const projMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const proj = new THREE.Mesh(projGeo, projMat);

        proj.position.copy(this.camera.position);
        proj.position.add(dir.clone().multiplyScalar(1));

        this.scene.add(proj);
        this.projectiles.push({
            mesh: proj,
            velocity: dir.multiplyScalar(2.0),
            life: 100,
            isPlayer: true
        });
    }

    botShoot(bot) {
        const dir = new THREE.Vector3();
        dir.subVectors(this.camera.position, bot.mesh.position).normalize();

        const projGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const projMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const proj = new THREE.Mesh(projGeo, projMat);

        proj.position.copy(bot.mesh.position);
        proj.position.y += 1; // shoot from head
        proj.position.add(dir.clone().multiplyScalar(2));

        this.scene.add(proj);
        this.projectiles.push({
            mesh: proj,
            velocity: dir.multiplyScalar(1.5),
            life: 100,
            isPlayer: false
        });
    }

    checkCollisions(position) {
        const playerBox = new THREE.Box3().setFromCenterAndSize(position, new THREE.Vector3(1, 2, 1));
        for (let obs of this.obstacles) {
            if (playerBox.intersectsBox(obs)) return true;
        }
        return false;
    }

    connectMultiplayer() {
        // Mocking a multiplayer connection
        setTimeout(() => {
            this.addKillFeed("SYSTEM: Connected to Global Server.");
            setTimeout(() => this.addKillFeed("SYSTEM: 15 Players in lobby."), 1000);
        }, 1000);
    }

    die() {
        this.addKillFeed("You died! Respawning...");
        this.camera.position.set(0, 2, 0);
        this.health = this.config.maxHealth;
        this.score = Math.max(0, this.score - 1); // Lose a kill point
        if (window.userSystem) window.userSystem.showToast('Gestorben! -1 Kill', 'error');
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isLocked) {
            // Player Movement
            this.direction.z = Number(this.keys.w) - Number(this.keys.s);
            this.direction.x = Number(this.keys.d) - Number(this.keys.a);
            this.direction.normalize();

            // Apply camera rotation to movement
            const euler = new THREE.Euler(0, this.camera.rotation.y, 0, 'YXZ');
            const moveDir = this.direction.clone().applyEuler(euler);

            const prevPos = this.camera.position.clone();

            this.camera.position.x -= moveDir.x * this.config.speed;
            this.camera.position.z -= moveDir.z * this.config.speed;

            // Collision
            if (this.checkCollisions(this.camera.position)) {
                this.camera.position.x = prevPos.x;
                this.camera.position.z = prevPos.z;
            }

            // Gravity & Jump
            this.velocity.y -= this.config.gravity;
            this.camera.position.y += this.velocity.y;

            if (this.camera.position.y < 2) {
                this.velocity.y = 0;
                this.camera.position.y = 2;
            }

            // Bounds
            const bound = this.config.worldSize / 2;
            if (this.camera.position.x > bound) this.camera.position.x = bound;
            if (this.camera.position.x < -bound) this.camera.position.x = -bound;
            if (this.camera.position.z > bound) this.camera.position.z = bound;
            if (this.camera.position.z < -bound) this.camera.position.z = -bound;
        }

        // Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.mesh.position.add(p.velocity);
            p.life--;

            let hit = false;
            const pBox = new THREE.Box3().setFromObject(p.mesh);

            if (p.isPlayer) {
                // Check bot hit
                for (let j = this.bots.length - 1; j >= 0; j--) {
                    const bot = this.bots[j];
                    const bBox = new THREE.Box3().setFromObject(bot.mesh);
                    if (pBox.intersectsBox(bBox)) {
                        bot.health -= this.config.weaponDamage;
                        this.showHitMarker();
                        hit = true;

                        if (bot.health <= 0) {
                            this.scene.remove(bot.mesh);
                            this.addKillFeed(\`You killed \${bot.name}!\`);
                            this.score++;
                            this.coins += 15;
                            if (window.userSystem) window.userSystem.addXP(20);

                            // Respawn bot
                            setTimeout(() => {
                                bot.health = 100;
                                bot.mesh.position.set(
                                    (Math.random() - 0.5) * this.config.worldSize * 0.8,
                                    1.5,
                                    (Math.random() - 0.5) * this.config.worldSize * 0.8
                                );
                                this.scene.add(bot.mesh);
                                this.addKillFeed(\`\${bot.name} connected.\`);
                            }, 3000);
                        }
                        break;
                    }
                }
            } else {
                // Check player hit
                const playerBox = new THREE.Box3().setFromCenterAndSize(this.camera.position, new THREE.Vector3(1, 2, 1));
                if (pBox.intersectsBox(playerBox)) {
                    this.health -= 15;
                    hit = true;
                    // Blood effect flash
                    document.body.style.boxShadow = 'inset 0 0 100px red';
                    setTimeout(() => document.body.style.boxShadow = 'none', 100);

                    if (this.health <= 0) {
                        this.die();
                    }
                }
            }

            // Check wall hits
            if (!hit) {
                for (let obs of this.obstacles) {
                    if (pBox.intersectsBox(obs)) {
                        hit = true;
                        break;
                    }
                }
            }

            if (hit || p.life <= 0) {
                this.scene.remove(p.mesh);
                this.projectiles.splice(i, 1);
            }
        }

        // Update Bots (AI)
        this.bots.forEach(bot => {
            if (bot.health > 0) {
                bot.mesh.position.x += bot.vx;
                bot.mesh.position.z += bot.vz;

                // Random change direction
                if (Math.random() < 0.02) {
                    bot.vx = (Math.random() - 0.5) * 0.2;
                    bot.vz = (Math.random() - 0.5) * 0.2;
                }

                // Keep in bounds
                const bound = this.config.worldSize / 2 - 5;
                if (bot.mesh.position.x > bound || bot.mesh.position.x < -bound) bot.vx *= -1;
                if (bot.mesh.position.z > bound || bot.mesh.position.z < -bound) bot.vz *= -1;

                // Bot Shooting
                bot.shootTimer--;
                if (bot.shootTimer <= 0) {
                    // Check if player is visible (distance check)
                    const dist = bot.mesh.position.distanceTo(this.camera.position);
                    if (dist < 80) {
                        this.botShoot(bot);
                    }
                    bot.shootTimer = 60 + Math.random() * 100;
                }
            }
        });

        this.updateUIDisplay();
        this.renderer.render(this.scene, this.camera);
    }
}
window.GameEngine3D = GameEngine3D;
