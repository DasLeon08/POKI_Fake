// V2 Advanced 3D Engine with Multiplayer Scaffolding, Bot AI, and High-End Graphics
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
        this.jetpackFuel = 100;
        this.maxJetpackFuel = 100;
        this.grenades = 3;
        this.explosions = [];
        this.isLocked = false;

        this.bots = [];
        this.projectiles = [];
        this.obstacles = [];
        this.particles = [];

        this.keys = { w: false, a: false, s: false, d: false, space: false };
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // Bobbing & Recoil
        this.walkTime = 0;
        this.recoil = 0;

        this.init();
    }

    init() {
        // Setup Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.getBiomeBgColor());
        this.scene.fog = new THREE.FogExp2(this.getBiomeBgColor(), 0.008);

        // Setup Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = 2;

        // Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize pixel ratio
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
        hemiLight.position.set(0, 100, 0);
        this.scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        // Generate Skybox
        this.buildSkybox();

        // Generate World
        this.buildWorld();
        this.spawnBots();

        // Build Player Weapon
        this.buildWeaponModel();

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
        const biomes = { neon: 0x050510, desert: 0xd6b48f, ice: 0xc4e5ed, mars: 0x7a3022, toxic: 0x182413 };
        return biomes[this.config.biome] || 0x000000;
    }

    // Procedural Grid Texture Generator
    createGridTexture(color1, color2, lineWidth) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');

        context.fillStyle = color1;
        context.fillRect(0, 0, 512, 512);

        context.lineWidth = lineWidth;
        context.strokeStyle = color2;
        context.strokeRect(0, 0, 512, 512);

        // Internal grid
        context.beginPath();
        for (let i = 0; i <= 512; i += 64) {
            context.moveTo(i, 0); context.lineTo(i, 512);
            context.moveTo(0, i); context.lineTo(512, i);
        }
        context.stroke();

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        return tex;
    }

    buildSkybox() {
        // Simple starfield using particles
        const starGeo = new THREE.BufferGeometry();
        const starCount = 2000;
        const starPos = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        const color = new THREE.Color();
        for(let i=0; i < starCount; i++) {
            // Random point on sphere
            const r = 400;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            starPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
            starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
            starPos[i*3+2] = r * Math.cos(phi);

            color.setHSL(Math.random(), 0.8, 0.8);
            starColors[i*3] = color.r;
            starColors[i*3+1] = color.g;
            starColors[i*3+2] = color.b;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMat = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        this.starField = new THREE.Points(starGeo, starMat);
        this.scene.add(this.starField);
    }

    buildWorld() {
        const floorTex = this.createGridTexture('#111', '#00ffcc', 4);
        floorTex.repeat.set(this.config.worldSize / 10, this.config.worldSize / 10);

        const floorGeo = new THREE.PlaneGeometry(this.config.worldSize, this.config.worldSize);
        const floorMat = new THREE.MeshStandardMaterial({
            map: floorTex,
            roughness: 0.4,
            metalness: 0.6,
            envMapIntensity: 1.0
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Obstacles (Procedural Tech Crates / Towers)
        const obsTex = this.createGridTexture('#222', '#ff00ff', 2);
        const obsGeo = new THREE.BoxGeometry(1, 1, 1);
        const obsMat = new THREE.MeshStandardMaterial({
            map: obsTex,
            roughness: 0.2,
            metalness: 0.8,
            emissive: new THREE.Color(0x220022)
        });

        for (let i = 0; i < 150; i++) {
            const obs = new THREE.Mesh(obsGeo, obsMat);
            obs.scale.set(
                Math.random() * 5 + 3,
                Math.random() * 12 + 3,
                Math.random() * 5 + 3
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

    buildWeaponModel() {
        this.weaponGroup = new THREE.Group();

        // Gun Body
        const gunGeo = new THREE.BoxGeometry(0.2, 0.3, 0.8);
        const gunMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
        this.gunMesh = new THREE.Mesh(gunGeo, gunMat);
        this.gunMesh.position.set(0.4, -0.3, -0.6);
        this.gunMesh.castShadow = true;

        // Gun Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.1, -0.5);
        this.gunMesh.add(barrel);

        // Gun Glow Line
        const glowGeo = new THREE.BoxGeometry(0.05, 0.05, 0.6);
        const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.set(0, 0.15, 0);
        this.gunMesh.add(glow);

        // Muzzle Flash PointLight (hidden initially)
        this.muzzleFlash = new THREE.PointLight(0x00ffff, 0, 5);
        this.muzzleFlash.position.set(0, 0.1, -0.8);
        this.gunMesh.add(this.muzzleFlash);

        this.weaponGroup.add(this.gunMesh);

        // Attach to camera so it moves with view
        this.camera.add(this.weaponGroup);
        this.scene.add(this.camera);
    }

    spawnBots() {
        const botNames = ['SniperGod', 'NoobMaster', 'Alex2010', 'ProGamer', 'ToxicPlayer', 'Bot_1', 'ShadowNinja'];

        // Bot Head
        const headGeo = new THREE.BoxGeometry(1, 1, 1);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.5, roughness: 0.5 });

        // Bot Eyes (Glowing)
        const eyeGeo = new THREE.BoxGeometry(0.8, 0.2, 0.1);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        // Bot Torso
        const torsoGeo = new THREE.BoxGeometry(1.2, 1.8, 1);

        for (let i = 0; i < this.config.botCount; i++) {
            const botGroup = new THREE.Group();

            const torsoMat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, metalness: 0.3, roughness: 0.7 });
            const torso = new THREE.Mesh(torsoGeo, torsoMat);
            torso.position.y = 0.9;
            torso.castShadow = true;
            torso.receiveShadow = true;

            const head = new THREE.Mesh(headGeo, headMat);
            head.position.y = 2.4;
            head.castShadow = true;

            const eyes = new THREE.Mesh(eyeGeo, eyeMat);
            eyes.position.set(0, 0, 0.51); // slightly in front of face
            head.add(eyes);

            botGroup.add(torso);
            botGroup.add(head);

            botGroup.position.set(
                (Math.random() - 0.5) * this.config.worldSize * 0.8,
                0, // Base at floor
                (Math.random() - 0.5) * this.config.worldSize * 0.8
            );

            this.scene.add(botGroup);

            this.bots.push({
                group: botGroup,
                head: head,
                health: 100,
                name: botNames[Math.floor(Math.random() * botNames.length)] + Math.floor(Math.random()*100),
                vx: (Math.random() - 0.5) * 0.15,
                vz: (Math.random() - 0.5) * 0.15,
                shootTimer: Math.random() * 100
            });
        }
    }

    spawnParticles(position, color, count) {
        const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const mat = new THREE.MeshBasicMaterial({ color: color });

        for(let i=0; i<count; i++) {
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(position);

            // Random direction
            const vx = (Math.random() - 0.5) * 0.5;
            const vy = (Math.random() - 0.5) * 0.5 + 0.2; // slight upward bias
            const vz = (Math.random() - 0.5) * 0.5;

            this.scene.add(mesh);
            this.particles.push({
                mesh: mesh,
                vx: vx, vy: vy, vz: vz,
                life: 1.0
            });
        }
    }

    setupControls() {
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
                    this.keys.space = true;
                    if (this.camera.position.y <= 2) this.velocity.y = this.config.jumpForce;
                    break;
                case 'KeyG':
                    this.throwGrenade();
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
                case 'Space': this.keys.space = false; break;
            }
        });

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
                <div style="display:flex; align-items:center; gap:10px;">
                    <div id="hp-display">HP: ${this.health} / ${this.config.maxHealth}</div>
                    <div style="width:100px; height:10px; background:#333; border-radius:5px; overflow:hidden;"><div id="hp-bar" style="width:100%; height:100%; background:#2ecc71;"></div></div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div id="jetpack-display" style="color:#3498db;">Fuel: ${Math.floor(this.jetpackFuel)}%</div>
                    <div style="width:100px; height:10px; background:#333; border-radius:5px; overflow:hidden;"><div id="jetpack-bar" style="width:100%; height:100%; background:#3498db;"></div></div>
                </div>
                <div id="grenade-display" style="color:#e67e22;">Grenades: ${this.grenades} 💣</div>HP: \${this.health} / \${this.config.maxHealth}</div>
                <div id="coin-display" style="color:#f1c40f;">Coins: \${this.coins} 🪙</div>
                <div id="score-display" style="color:#e74c3c;">Kills: \${this.score}</div>
                <div style="font-size:14px; color:#aaa; margin-top:5px; background:rgba(0,0,0,0.5); padding:5px; border-radius:5px;">Press [E] for Upgrades Shop</div>
            </div>
            <div id="hit-marker" style="display:none; position:fixed; top:50%; left:50%; color:red; font-size:24px; font-weight:bold; transform:translate(-50%,-50%); z-index:99; pointer-events:none; text-shadow: 0 0 10px red;">\u2715</div>

            <div id="shop-modal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(10,14,23,0.95); padding:40px; border-radius:20px; border:2px solid #00ffff; box-shadow: 0 0 30px rgba(0,255,255,0.2); color:white; z-index:200; font-family:'Nunito', sans-serif; text-align:center; min-width:350px;">
                <h2 style="font-family:'Fredoka One', cursive; margin-top:0; color:#00ffff; text-shadow: 0 0 10px #00ffff;">ARMORY & UPGRADES</h2>
                <p style="font-size:1.2rem; font-weight:bold;">Coins: <span id="shop-coins" style="color:#f1c40f;">0</span> 🪙</p>

                <div style="margin:30px 0; display:flex; flex-direction:column; gap:15px;">
                    <button onclick="window.gameEngine.buyUpgrade('damage')" style="padding:15px; font-weight:bold; background:linear-gradient(90deg, #e74c3c, #c0392b); border:none; color:white; border-radius:10px; cursor:pointer; font-size:1.1rem; box-shadow: 0 4px 10px rgba(231,76,60,0.4); transition: transform 0.2s;">Upgrade Damage (50 🪙)</button>
                    <button onclick="window.gameEngine.buyUpgrade('speed')" style="padding:15px; font-weight:bold; background:linear-gradient(90deg, #3498db, #2980b9); border:none; color:white; border-radius:10px; cursor:pointer; font-size:1.1rem; box-shadow: 0 4px 10px rgba(52,152,219,0.4); transition: transform 0.2s;">Upgrade Speed (50 🪙)</button>
                    <button onclick="window.gameEngine.buyUpgrade('health')" style="padding:15px; font-weight:bold; background:linear-gradient(90deg, #2ecc71, #27ae60); border:none; color:white; border-radius:10px; cursor:pointer; font-size:1.1rem; box-shadow: 0 4px 10px rgba(46,204,113,0.4); transition: transform 0.2s;">Restore + Max HP (100 🪙)</button>
                </div>

                <button onclick="window.gameEngine.closeShop()" style="margin-top:10px; padding:10px 30px; background:transparent; border:2px solid #95a5a6; color:#95a5a6; border-radius:20px; cursor:pointer; font-weight:bold;">Close & Resume</button>
            </div>

            <div id="kill-feed" style="position:fixed; top:20px; right:20px; color:white; font-family:'Nunito', sans-serif; font-size:15px; font-weight:bold; text-shadow:1px 1px 2px #000; text-align:right; z-index:100; max-height:200px; overflow:hidden;"></div>
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
        item.innerHTML = msg;
        item.style.marginBottom = '8px';
        item.style.padding = '5px 10px';
        item.style.background = 'rgba(0,0,0,0.5)';
        item.style.borderRadius = '5px';
        item.style.borderLeft = '3px solid #e74c3c';
        feed.appendChild(item);

        // Remove old if too many
        if (feed.children.length > 5) feed.removeChild(feed.firstChild);

        setTimeout(() => {
            if(item.parentNode) item.remove();
        }, 5000);
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

    throwGrenade() {
        if (this.grenades <= 0) return;
        this.grenades--;
        this.updateUIDisplay();

        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);

        const gGeo = new THREE.DodecahedronGeometry(0.3);
        const gMat = new THREE.MeshStandardMaterial({ color: 0x27ae60, metalness: 0.8, roughness: 0.2 });
        const grenade = new THREE.Mesh(gGeo, gMat);

        grenade.position.copy(this.camera.position);
        grenade.position.add(dir.clone().multiplyScalar(1.5));

        this.scene.add(grenade);
        this.projectiles.push({
            mesh: grenade,
            velocity: dir.multiplyScalar(0.8).add(new THREE.Vector3(0, 0.5, 0)), // arc
            life: 150,
            isGrenade: true,
            isPlayer: true
        });
    }

    shoot() {
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);

        // Recoil Animation
        this.recoil = 1;

        // Muzzle Flash
        this.muzzleFlash.intensity = 2;
        setTimeout(() => this.muzzleFlash.intensity = 0, 50);

        // Projectile with PointLight attached for dynamic lighting
        const projGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const projMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const proj = new THREE.Mesh(projGeo, projMat);

        const projLight = new THREE.PointLight(0x00ffff, 1, 20);
        proj.add(projLight);

        proj.position.copy(this.camera.position);
        proj.position.add(dir.clone().multiplyScalar(1.5)); // Start in front of camera

        this.scene.add(proj);
        this.projectiles.push({
            mesh: proj,
            velocity: dir.multiplyScalar(3.0),
            life: 100,
            isPlayer: true
        });
    }

    botShoot(bot) {
        const dir = new THREE.Vector3();
        dir.subVectors(this.camera.position, bot.group.position).normalize();

        const projGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const projMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const proj = new THREE.Mesh(projGeo, projMat);

        const projLight = new THREE.PointLight(0xff0000, 1, 15);
        proj.add(projLight);

        proj.position.copy(bot.group.position);
        proj.position.y += 2.4; // shoot from head level
        proj.position.add(dir.clone().multiplyScalar(2));

        this.scene.add(proj);
        this.projectiles.push({
            mesh: proj,
            velocity: dir.multiplyScalar(2.0),
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
        setTimeout(() => {
            this.addKillFeed("<span style='color:#2ecc71'>[SYSTEM]</span> Connected to Global Master Server.");
            setTimeout(() => this.addKillFeed(\`<span style='color:#3498db'>[LOBBY]</span> \${this.config.botCount} players active.\`), 1000);
        }, 1000);
    }

    die() {
        this.addKillFeed("<span style='color:red'>[DEATH]</span> You were killed! Respawning...");
        this.camera.position.set(0, 2, 0);
        this.health = this.config.maxHealth;
        this.score = Math.max(0, this.score - 1);
        if (window.userSystem) window.userSystem.showToast('Gestorben! -1 Kill', 'error');
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isLocked) {
            // Player Movement
            this.direction.z = Number(this.keys.w) - Number(this.keys.s);
            this.direction.x = Number(this.keys.d) - Number(this.keys.a);
            this.direction.normalize();

            // Head bobbing logic
            if (this.direction.lengthSq() > 0 && this.camera.position.y <= 2) {
                this.walkTime += 0.2;
            } else {
                this.walkTime = 0;
            }

            // Recoil recovery
            if (this.recoil > 0) {
                this.recoil -= 0.1;
                if(this.recoil < 0) this.recoil = 0;
            }

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
                // Recharge jetpack
                if (this.jetpackFuel < this.maxJetpackFuel) this.jetpackFuel += 1;
            } else if (this.keys.space && this.jetpackFuel > 0) {
                // Jetpack boost
                this.velocity.y += 0.03;
                this.jetpackFuel -= 2;
                if (this.velocity.y > 0.4) this.velocity.y = 0.4;
                // Jetpack particles
                this.spawnParticles(this.camera.position.clone().add(new THREE.Vector3(0, -1.5, 0)), 0x3498db, 2);
            }

            // Apply Weapon Bobbing and Recoil
            this.gunMesh.position.y = -0.3 + Math.sin(this.walkTime) * 0.02;
            this.gunMesh.position.z = -0.6 + this.recoil * 0.1; // push gun back
            this.gunMesh.rotation.x = this.recoil * 0.1; // flip gun up

            // Bounds
            const bound = this.config.worldSize / 2;
            if (this.camera.position.x > bound) this.camera.position.x = bound;
            if (this.camera.position.x < -bound) this.camera.position.x = -bound;
            if (this.camera.position.z > bound) this.camera.position.z = bound;
            if (this.camera.position.z < -bound) this.camera.position.z = -bound;
        }

        // Starfield Rotation
        if (this.starField) {
            this.starField.rotation.y += 0.0005;
        }

        // Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            if (p.isGrenade) {
                p.velocity.y -= this.config.gravity * 0.8; // grenade gravity
            }
            p.mesh.position.add(p.velocity);
            p.life--;

            let hit = false;
            const pBox = new THREE.Box3().setFromObject(p.mesh);

            if (p.isPlayer) {
                // Check bot hit
                for (let j = this.bots.length - 1; j >= 0; j--) {
                    const bot = this.bots[j];
                    const bBox = new THREE.Box3().setFromObject(bot.group);
                    if (pBox.intersectsBox(bBox)) {
                        bot.health -= this.config.weaponDamage;
                        this.showHitMarker();
                        hit = true;

                        // Particle impact sparks
                        this.spawnParticles(p.mesh.position, 0xffff00, 5);

                        if (bot.health <= 0) {
                            // Explosion on bot kill
                            this.spawnParticles(bot.group.position, 0xffaa00, 30);

                            this.scene.remove(bot.group);
                            this.addKillFeed(\`You fragged <b>\${bot.name}</b>\`);
                            this.score++;
                            this.coins += 25;
                            if (window.userSystem) window.userSystem.addXP(30);

                            // Respawn bot
                            setTimeout(() => {
                                bot.health = 100;
                                bot.group.position.set(
                                    (Math.random() - 0.5) * this.config.worldSize * 0.8,
                                    0,
                                    (Math.random() - 0.5) * this.config.worldSize * 0.8
                                );
                                this.scene.add(bot.group);
                                this.addKillFeed(\`\${bot.name} rejoined.\`);
                            }, 4000);
                        }
                        break;
                    }
                }
            } else {
                // Check player hit
                const playerBox = new THREE.Box3().setFromCenterAndSize(this.camera.position, new THREE.Vector3(1, 2, 1));
                if (pBox.intersectsBox(playerBox)) {
                    this.health -= 20;
                    hit = true;
                    // Blood effect flash
                    document.body.style.boxShadow = 'inset 0 0 150px rgba(255,0,0,0.8)';
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
                        this.spawnParticles(p.mesh.position, 0x00ffff, 3); // sparks on wall
                        break;
                    }
                }
            }

            if (hit || p.life <= 0) {
                if (p.isGrenade) {
                    // Grenade explosion (AoE)
                    this.spawnParticles(p.mesh.position, 0xe74c3c, 50);
                    this.scene.remove(p.mesh);
                    this.projectiles.splice(i, 1);

                    // Check radius
                    for (let j = this.bots.length - 1; j >= 0; j--) {
                        const bot = this.bots[j];
                        const dist = p.mesh.position.distanceTo(bot.group.position);
                        if (dist < 15) {
                            bot.health -= 150; // massive damage
                            this.showHitMarker();
                            if (bot.health <= 0) {
                                this.scene.remove(bot.group);
                                this.addKillFeed(`You BLEW UP <b>${bot.name}</b>`);
                                this.score++;
                                this.coins += 50; // extra reward
                                if (window.userSystem) window.userSystem.addXP(50);
                                setTimeout(() => {
                                    bot.health = 100;
                                    bot.group.position.set((Math.random() - 0.5) * this.config.worldSize * 0.8, 0, (Math.random() - 0.5) * this.config.worldSize * 0.8);
                                    this.scene.add(bot.group);
                                }, 4000);
                            }
                        }
                    }

                    // Flash screen orange
                    document.body.style.boxShadow = 'inset 0 0 200px rgba(230,126,34,0.8)';
                    setTimeout(() => document.body.style.boxShadow = 'none', 150);

                } else {
                    this.scene.remove(p.mesh);
                    this.projectiles.splice(i, 1);
                }
            }
        }

        // Update Bots (AI & LookAt)
        this.bots.forEach(bot => {
            if (bot.health > 0) {
                bot.group.position.x += bot.vx;
                bot.group.position.z += bot.vz;

                // Make Bot Head look at player
                const targetPos = this.camera.position.clone();
                targetPos.y = 2.4; // Aim at head level height approx
                bot.head.lookAt(targetPos);

                // Random change direction
                if (Math.random() < 0.02) {
                    bot.vx = (Math.random() - 0.5) * 0.15;
                    bot.vz = (Math.random() - 0.5) * 0.15;
                }

                // Keep in bounds
                const bound = this.config.worldSize / 2 - 5;
                if (bot.group.position.x > bound || bot.group.position.x < -bound) bot.vx *= -1;
                if (bot.group.position.z > bound || bot.group.position.z < -bound) bot.vz *= -1;

                // Bot Shooting
                bot.shootTimer--;
                if (bot.shootTimer <= 0) {
                    const dist = bot.group.position.distanceTo(this.camera.position);
                    if (dist < 100) {
                        // Check line of sight (simple: just shoot if close, let obstacles block projectiles)
                        this.botShoot(bot);
                    }
                    bot.shootTimer = 50 + Math.random() * 80; // shoot faster in V2
                }
            }
        });

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let pt = this.particles[i];
            pt.mesh.position.x += pt.vx;
            pt.mesh.position.y += pt.vy;
            pt.mesh.position.z += pt.vz;
            pt.vy -= 0.02; // gravity for particles
            pt.life -= 0.05;

            // Scale down
            pt.mesh.scale.set(pt.life, pt.life, pt.life);

            if (pt.life <= 0) {
                this.scene.remove(pt.mesh);
                this.particles.splice(i, 1);
            }
        }

        this.updateUIDisplay();
        this.renderer.render(this.scene, this.camera);
    }
}
window.GameEngine3D = GameEngine3D;
