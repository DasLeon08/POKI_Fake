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
        this.killStreak = 0;
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
        this.dashCooldown = 0;
        this.isZoomed = false;
        this.baseFov = 75;
        this.medkits = [];
        this.jumps = 0;
        this.maxJumps = 2; // Double Jump
        this.killStreak = 0;
        this.killStreakTimer = 0;
        this.bulletTimeFuel = 100;
        this.isBulletTime = false;
        this.turrets = [];
        this.decoys = [];
        this.swordActive = 0;
        this.mines = [];
        this.orbitalStrikes = [];
        this.energyShields = [];
        this.isMech = false;
        this.mechHealth = 0;
        this.mechTimer = 0;
        this.grenadeType = 'frag'; // frag, gravity, or mind
        this.canTeleport = true;
        this.xrayActive = false;
        this.wallRunTimer = 0;
        this.isWallRunning = false;
        this.timeSlowActive = false;
        this.timeSlowTimer = 0;
        this.heldObject = null;
        this.heldObjectDist = 5;
        this.ufoMode = false;
        this.ufoEnergy = 1000;
        this.orbitalLasers = [];
        this.grapple = { active: false, point: null, line: null };

        // Dynamic Weather System
        this.weatherParticles = [];
        this.initWeather();

        this.init();
    }

    initWeather() {
        const type = this.config.biome;
        let count = 0, color = 0xffffff, size = 1, speed = 0.5, drift = 0;

        if (type === 'toxic') { count = 300; color = 0x7fff00; size = 2; speed = 0.8; drift = 0.2; }
        else if (type === 'ice') { count = 500; color = 0xffffff; size = 1.5; speed = 0.3; drift = 0.5; }
        else if (type === 'desert') { count = 400; color = 0xdeb887; size = 1; speed = 0.4; drift = 0.8; }
        else if (type === 'mars') { count = 200; color = 0xffa07a; size = 1.2; speed = 0.6; drift = 0.3; }
        else if (type === 'neon') { return; } // No weather in neon

        const wGeo = new THREE.BufferGeometry();
        const wPos = new Float32Array(count * 3);

        for(let i=0; i<count; i++) {
            wPos[i*3] = (Math.random() - 0.5) * this.config.worldSize;
            wPos[i*3+1] = Math.random() * 100;
            wPos[i*3+2] = (Math.random() - 0.5) * this.config.worldSize;
        }

        wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3));
        const wMat = new THREE.PointsMaterial({ color: color, size: size, transparent: true, opacity: 0.6 });

        this.weatherSystem = new THREE.Points(wGeo, wMat);
        this.scene.add(this.weatherSystem);
        this.weatherConfig = { speed, drift };
    }

    init() {
        // Setup Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.getBiomeBgColor());
        this.scene.fog = new THREE.FogExp2(this.getBiomeBgColor(), 0.008);

        // Setup Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.y = floorY;

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

        // Procedural Nebula Clouds
        const nebGeo = new THREE.BufferGeometry();
        const nebCount = 50;
        const nebPos = new Float32Array(nebCount * 3);
        const nebColors = new Float32Array(nebCount * 3);
        const color2 = new THREE.Color();
        for(let i=0; i<nebCount; i++) {
            const r = 350;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            nebPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
            nebPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
            nebPos[i*3+2] = r * Math.cos(phi);
            color2.setHSL(Math.random(), 1.0, 0.5);
            nebColors[i*3] = color2.r; nebColors[i*3+1] = color2.g; nebColors[i*3+2] = color2.b;
        }
        nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3));
        nebGeo.setAttribute('color', new THREE.BufferAttribute(nebColors, 3));

        // Create a basic circular canvas texture for clouds
        const nebCanvas = document.createElement('canvas');
        nebCanvas.width = 64; nebCanvas.height = 64;
        const nebCtx = nebCanvas.getContext('2d');
        const grad = nebCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        nebCtx.fillStyle = grad;
        nebCtx.fillRect(0,0,64,64);
        const nebTex = new THREE.CanvasTexture(nebCanvas);

        const nebMat = new THREE.PointsMaterial({
            size: 200,
            map: nebTex,
            vertexColors: true,
            transparent: true,
            opacity: 0.15,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        this.nebulaField = new THREE.Points(nebGeo, nebMat);
        this.scene.add(this.nebulaField);
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
                case 'ShiftLeft':
                    this.dash();
                    break;
                case 'KeyF': this.fireGrapple(); break;
                case 'KeyV': this.swingSword(); break;
                case 'KeyH': this.deployDecoy(); break;
                case 'KeyM': this.deployMine(); break;
                case 'KeyB': this.callOrbitalStrike(); break;
                case 'KeyZ': this.deployEnergyShield(); break;
                case 'KeyX': this.deployMech(); break;
                case 'KeyT': this.dashTeleport(); break;
                case 'KeyR': this.toggleXray(); break;
                case 'KeyQ': this.toggleTimeSlow(); break;
                case 'KeyE': this.useGravityGun(); break;
                case 'KeyC': this.buildStructure('wall'); break;
                case 'KeyV': this.buildStructure('ramp'); break;
                case 'KeyF': this.toggleUFO(); break;
                case 'KeyO': this.fireOrbitalLaser(); break;
                case 'KeyG':
                    if (e.shiftKey) this.toggleGrenade();
                    else this.throwGrenade();
                    break;
                case 'KeyT': this.deployTurret(); break;
                case 'KeyQ':
                    if (this.bulletTimeFuel > 20) this.isBulletTime = true;
                    break;
                case 'Space':
                    if (!this.keys.space && this.jumps < this.maxJumps) {
                        this.velocity.y = this.config.jumpForce;
                        this.jumps++;
                        if(window.audio) window.audio.playJump();

                        // Particle burst on double jump
                        if (this.jumps === 2) {
                            this.spawnParticles(this.camera.position.clone().add(new THREE.Vector3(0, -1.5, 0)), 0xffffff, 10);
                        }
                    }
                    this.keys.space = true;
                    break;
                // G replaced above
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
                case 'KeyQ': this.isBulletTime = false; break;
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 2) this.isZoomed = false;
        });

        document.addEventListener('mousedown', (e) => {
            if (this.isLocked && e.button === 2) {
                // Right click Snipe Zoom
                this.isZoomed = true;
            } else
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
                <div style="display:flex; align-items:center; gap:10px;">
                    <div id="bt-display" style="color:#f39c12;">Focus: ${Math.floor(this.bulletTimeFuel)}% [Q]</div>
                    <div style="width:100px; height:10px; background:#333; border-radius:5px; overflow:hidden;"><div id="bt-bar" style="width:100%; height:100%; background:#f39c12;"></div></div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="color:#9b59b6;">Turrets: ${Math.floor(this.coins/100)} [T] (100 🪙)</div>
                    <div style="color:#2ecc71;">Grapple [F]</div>
                    <div style="color:#e74c3c;">Sword [V]</div>
                    <div style="color:#3498db;">Decoy [H] (50 🪙)</div>
                    <div style="color:#f39c12;">Mine [M] (75 🪙)</div>
                    <div style="color:#9b59b6;">Shield [Z] (150 🪙)</div>
                    <div style="color:#e74c3c;">Orbital [B] (500 🪙)</div>
                    <div style="color:#f1c40f;">Mech [X] (1000 🪙)</div>
                    <div style="color:#00ffff;">Teleport Dash [T] (Free)</div>
                    <div style="color:#2ecc71;">X-Ray Goggles [R] (Toggle)</div>
                    <div style="color:#f1c40f;">Time Slow [Q] (Cost: 500)</div>
                    <div style="color:#9b59b6;">Gravity Gun [E] (Grab/Throw Bots)</div>
                    <div style="color:#3498db;">Build Wall [C] / Ramp [V] (Cost: 100)</div>
                    <div style="color:#f39c12;">UFO Flight [F] (Hold space to ascend)</div>
                    <div style="color:#ff0000;">Sky Laser [O] (Cost: 1000)</div>
                    <div style="font-size:0.8rem; color:#bdc3c7;">Jump near wall to Wallrun!</div>
                    <div style="font-size:0.8rem; color:#bdc3c7;">[Shift+G] Grenade (Frag/Grav/Mind)</div>
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


            <!-- Radar Minimap -->
            <div style="position:fixed; top:20px; left:20px; width:150px; height:150px; background:rgba(0,10,20,0.7); border:2px solid #00ffff; border-radius:50%; z-index:90; overflow:hidden;">
                <canvas id="radarCanvas" width="150" height="150" style="position:absolute; top:0; left:0;"></canvas>
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

    fireGrapple() {
        if (this.grapple.active) {
            // Cancel
            this.grapple.active = false;
            this.scene.remove(this.grapple.line);
            return;
        }

        // Raycast to find wall/obstacle
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);

        const raycaster = new THREE.Raycaster(this.camera.position, dir, 0, 100);
        const intersects = [];

        // Mock raycast against obstacles bounding boxes
        let hitDist = Infinity;
        let hitPoint = null;
        for(let obs of this.obstacles) {
            const tempBox = new THREE.Box3().copy(obs);
            const p = new THREE.Vector3();
            if(raycaster.ray.intersectBox(tempBox, p)) {
                const dist = this.camera.position.distanceTo(p);
                if(dist < hitDist) { hitDist = dist; hitPoint = p; }
            }
        }

        if (hitPoint) {
            this.grapple.active = true;
            this.grapple.point = hitPoint;
            if(window.audio) window.audio.playLaser();

            // Draw line
            const mat = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
            const pts = [this.camera.position, hitPoint];
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            this.grapple.line = new THREE.Line(geo, mat);
            this.scene.add(this.grapple.line);
        }
    }

    swingSword() {
        if (this.swordActive > 0) return;
        this.swordActive = 20; // 20 frames

        // Visual swing
        this.gunMesh.rotation.z = Math.PI / 2;
        this.gunMesh.rotation.x = -Math.PI / 4;
        setTimeout(() => {
            this.gunMesh.rotation.z = 0;
            this.gunMesh.rotation.x = 0;
        }, 300);

        if(window.audio) window.audio.playLaser(); // proxy sound

        // Damage logic
        const hitBox = new THREE.Box3().setFromCenterAndSize(
            this.camera.position.clone().add(this.direction.clone().multiplyScalar(3)),
            new THREE.Vector3(4, 4, 4)
        );

        this.bots.forEach(bot => {
            if (bot.health > 0) {
                const bBox = new THREE.Box3().setFromObject(bot.group);
                if (hitBox.intersectsBox(bBox)) {
                    bot.health -= 150; // Massive damage
                    this.showHitMarker();
                        if (isHeadshot) {
                            document.getElementById('hit-marker').style.color = '#f1c40f'; // Gold hitmarker
                            if(window.audio) window.audio.playCoin(); // headshot ding
                        } else {
                            document.getElementById('hit-marker').style.color = 'red';
                        }
                    this.spawnParticles(bot.group.position, 0xff00ff, 20); // sword sparks
                    if (bot.health <= 0) {
                        this.scene.remove(bot.group);
                        this.addKillFeed(`You SLICED <b>${bot.name}</b>`);
                        this.score++; this.coins += 25;
                        if(window.userSystem) window.userSystem.addXP(40);

                        setTimeout(() => {
                            bot.health = 100;
                            bot.group.position.set((Math.random() - 0.5) * this.config.worldSize * 0.8, 0, (Math.random() - 0.5) * this.config.worldSize * 0.8);
                            this.scene.add(bot.group);
                        }, 4000);
                    }
                }
            }
        });
    }

    callOrbitalStrike() {
        if (this.coins >= 500) {
            this.coins -= 500;
            this.updateUIDisplay();

            // Raycast to find target point on ground
            const dir = new THREE.Vector3();
            this.camera.getWorldDirection(dir);
            const raycaster = new THREE.Raycaster(this.camera.position, dir, 0, 100);

            let hitPoint = new THREE.Vector3();
            hitPoint.copy(this.camera.position).add(dir.multiplyScalar(20)); // default 20 units ahead
            hitPoint.y = 0; // force ground

            // Target marker
            const mGeo = new THREE.RingGeometry(3, 3.5, 32);
            const mMat = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });
            const marker = new THREE.Mesh(mGeo, mMat);
            marker.rotation.x = Math.PI / 2;
            marker.position.copy(hitPoint);
            marker.position.y = 0.1;
            this.scene.add(marker);

            this.orbitalStrikes.push({ marker: marker, x: hitPoint.x, z: hitPoint.z, timer: 180 }); // 3 sec delay

            this.showToastUI("ORBITAL STRIKE INBOUND");
            if(window.audio) window.audio.playPowerup();
        } else {
            this.showToastUI("Not enough coins (500)");
        }
    }

    toggleTimeSlow() {
        if (this.coins >= 500 && !this.timeSlowActive) {
            this.coins -= 500;
            this.timeSlowActive = true;
            this.timeSlowTimer = 300; // 5 seconds
            document.body.style.filter = "sepia(0.5) hue-rotate(-50deg)";
            this.showToastUI("BULLET TIME ACTIVATED");
            if(window.audio) window.audio.playPowerup();
            this.updateUIDisplay();
        }
    }

    toggleUFO() {
        this.ufoMode = !this.ufoMode;
        if (this.ufoMode) {
            this.showToastUI("🛸 UFO FLIGHT ENGAGED");
            document.body.style.boxShadow = "inset 0 0 100px rgba(241, 196, 15, 0.3)";
        } else {
            this.showToastUI("UFO FLIGHT DISENGAGED");
            document.body.style.boxShadow = "none";
        }
        if(window.audio) window.audio.playPowerup();
    }

    fireOrbitalLaser() {
        if (this.coins >= 1000) {
            this.coins -= 1000;

            let dir = new THREE.Vector3();
            this.camera.getWorldDirection(dir);
            let pos = this.camera.position.clone().add(dir.multiplyScalar(30));
            pos.y = 2; // Floor hit

            // Draw giant cylinder beam
            const geo = new THREE.CylinderGeometry(15, 15, 200, 32);
            const mat = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.8});
            const beam = new THREE.Mesh(geo, mat);
            beam.position.copy(pos);
            beam.position.y += 100;
            this.scene.add(beam);

            this.orbitalLasers.push({mesh: beam, pos: pos, timer: 120});

            this.showToastUI("ORBITAL LASER INCOMING!");
            if(window.audio) window.audio.playExplosion();
            this.updateUIDisplay();
        }
    }

    buildStructure(type) {
        if (this.coins >= 100 && !this.isMech) {
            this.coins -= 100;

            let dir = new THREE.Vector3();
            this.camera.getWorldDirection(dir);
            let pos = this.camera.position.clone().add(dir.multiplyScalar(4));

            let geo, mat, mesh;
            if (type === 'wall') {
                geo = new THREE.BoxGeometry(4, 4, 0.5);
                mat = new THREE.MeshLambertMaterial({color: 0x3498db, transparent: true, opacity: 0.8});
                mesh = new THREE.Mesh(geo, mat);
                pos.y = 2; // Floor level
                mesh.position.copy(pos);
                mesh.lookAt(this.camera.position); // Face player
            } else if (type === 'ramp') {
                geo = new THREE.BoxGeometry(4, 0.5, 4);
                mat = new THREE.MeshLambertMaterial({color: 0xe67e22, transparent: true, opacity: 0.8});
                mesh = new THREE.Mesh(geo, mat);
                pos.y = 1;
                mesh.position.copy(pos);
                mesh.lookAt(this.camera.position);
                mesh.rotation.x = Math.PI / 4; // Slanted
            }

            this.scene.add(mesh);
            this.obstacles.push(mesh);

            this.showToastUI("STRUCTURE BUILT!");
            if(window.audio) window.audio.playPowerup();
            this.updateUIDisplay();
        }
    }

    useGravityGun() {
        if (this.heldObject) {
            // Throw it
            let dir = new THREE.Vector3();
            this.camera.getWorldDirection(dir);

            // If it's a bot, give it huge velocity and damage it upon impact later (simplified: just kill it or throw it away)
            if (this.heldObject.isBot) {
                this.heldObject.botRef.health -= 100;
                this.heldObject.botRef.group.position.add(dir.multiplyScalar(20)); // Launch it
            }

            this.heldObject = null;
            this.showToastUI("THROWN!");
            if(window.audio) window.audio.playExplosion();
        } else {
            // Try to grab a bot
            let dir = new THREE.Vector3();
            this.camera.getWorldDirection(dir);
            let raycaster = new THREE.Raycaster(this.camera.position, dir);
            let intersects = raycaster.intersectObjects(this.scene.children, true);

            for(let i=0; i<intersects.length; i++) {
                let obj = intersects[i].object;
                if(intersects[i].distance < 30) {
                    // Check if it's part of a bot
                    let foundBot = this.bots.find(b => b.mesh === obj || b.group === obj.parent);
                    if (foundBot && foundBot.health > 0) {
                        this.heldObject = { isBot: true, botRef: foundBot, mesh: foundBot.group };
                        this.showToastUI("CAPTURED BOT");
                        if(window.audio) window.audio.playPowerup();
                        break;
                    }
                }
            }
        }
    }

    toggleXray() {
        this.xrayActive = !this.xrayActive;
        this.showToastUI(this.xrayActive ? "X-RAY GOGGLES ON" : "X-RAY GOGGLES OFF");

        if (this.xrayActive) {
            document.body.style.filter = "invert(1) hue-rotate(180deg)";
            this.bots.forEach(b => {
                if(b.health > 0) b.mesh.material.wireframe = true;
            });
            this.obstacles.forEach(o => o.material.opacity = 0.3);
        } else {
            document.body.style.filter = "none";
            this.bots.forEach(b => {
                if(b.health > 0) b.mesh.material.wireframe = false;
            });
            this.obstacles.forEach(o => o.material.opacity = 1.0);
        }
        if(window.audio) window.audio.playPowerup();
    }

    dashTeleport() {
        if (!this.canTeleport || this.isMech) return;
        this.canTeleport = false;

        // Calculate forward position
        let dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        let targetPos = this.camera.position.clone().add(dir.multiplyScalar(20));
        targetPos.y = 2; // Keep on ground

        // Boundaries
        if(targetPos.x > this.config.mapSize/2) targetPos.x = this.config.mapSize/2 - 2;
        if(targetPos.x < -this.config.mapSize/2) targetPos.x = -this.config.mapSize/2 + 2;
        if(targetPos.z > this.config.mapSize/2) targetPos.z = this.config.mapSize/2 - 2;
        if(targetPos.z < -this.config.mapSize/2) targetPos.z = -this.config.mapSize/2 + 2;

        this.spawnParticles(this.camera.position, 0x00ffff, 5);
        this.camera.position.copy(targetPos);
        this.spawnParticles(this.camera.position, 0x00ffff, 5);

        this.showToastUI("TELEPORT DASH!");
        if(window.audio) window.audio.playPowerup();

        // Cooldown
        setTimeout(() => {
            this.canTeleport = true;
        }, 3000);
    }

    toggleGrenade() {
        if(this.grenadeType === 'frag') this.grenadeType = 'gravity';
        else if(this.grenadeType === 'gravity') this.grenadeType = 'mind';
        else this.grenadeType = 'frag';
        this.showToastUI(`GRENADE: ${this.grenadeType.toUpperCase()}`);
        if(window.audio) window.audio.playClick();
    }

    deployMech() {
        if (this.coins >= 1000 && !this.isMech) {
            this.coins -= 1000;
            this.isMech = true;
            this.mechHealth = 500;
            this.mechTimer = 1800; // 30 seconds

            // Alter view height and speed
            this.camera.position.y = 4;

            // Mech UI Overlay
            document.body.style.boxShadow = "inset 0 0 150px rgba(241, 196, 15, 0.5)";
            this.showToastUI("MECHA SUIT ONLINE");
            if(window.audio) window.audio.playPowerup();
            this.updateUIDisplay();
        } else if (this.isMech) {
            this.showToastUI("Already in Mech");
        } else {
            this.showToastUI("Not enough coins (1000)");
        }
    }

    deployEnergyShield() {
        if (this.coins >= 150) {
            this.coins -= 150;
            this.updateUIDisplay();

            const dir = new THREE.Vector3();
            this.camera.getWorldDirection(dir);
            dir.y = 0; dir.normalize(); // flat

            const sGeo = new THREE.PlaneGeometry(6, 4);
            const sMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
            const shield = new THREE.Mesh(sGeo, sMat);

            shield.position.copy(this.camera.position).add(dir.multiplyScalar(3));
            shield.position.y = 2;
            shield.lookAt(this.camera.position); // face player

            // Hexagon grid texture (mocked with lines)
            const wireGeo = new THREE.WireframeGeometry(new THREE.PlaneGeometry(6, 4, 6, 4));
            const wireMat = new THREE.LineBasicMaterial({ color: 0x00ffff });
            const wire = new THREE.LineSegments(wireGeo, wireMat);
            shield.add(wire);

            this.scene.add(shield);
            const bbox = new THREE.Box3().setFromObject(shield);

            this.energyShields.push({ mesh: shield, box: bbox, life: 600 }); // 10 seconds

            if(window.audio) window.audio.playPowerup();
        } else {
            this.showToastUI("Not enough coins (150)");
        }
    }

    deployMine() {
        if (this.coins >= 75) {
            this.coins -= 75;
            this.updateUIDisplay();

            const mGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 8);
            const mMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, emissive: 0x330000 });
            const mine = new THREE.Mesh(mGeo, mMat);

            mine.position.copy(this.camera.position);
            mine.position.y = 0.1; // flat on ground

            // Blink light
            const light = new THREE.PointLight(0xff0000, 1, 3);
            light.position.y = 0.5;
            mine.add(light);

            this.scene.add(mine);
            this.mines.push({ mesh: mine, active: false, timer: 60 }); // 1 sec arm time

            if(window.audio) window.audio.playPowerup();
            this.showToastUI("MINE ARMED");
        } else {
            this.showToastUI("Not enough coins (75)");
        }
    }

    deployDecoy() {
        if (this.coins >= 50) {
            this.coins -= 50;
            this.updateUIDisplay();

            const dGeo = new THREE.BoxGeometry(1.2, 2.5, 1);
            const dMat = new THREE.MeshBasicMaterial({ color: 0x3498db, transparent: true, opacity: 0.5, wireframe: true });
            const decoy = new THREE.Mesh(dGeo, dMat);

            decoy.position.copy(this.camera.position);
            decoy.position.add(this.direction.clone().multiplyScalar(2));
            decoy.position.y = 1.25;

            this.scene.add(decoy);
            this.decoys.push({ mesh: decoy, life: 300 }); // 5 seconds

            if(window.audio) window.audio.playPowerup();
            this.showToastUI("DECOY OUT");
        } else {
            this.showToastUI("Not enough coins (50)");
        }
    }

    deployTurret() {
        if (this.coins >= 100) {
            this.coins -= 100;
            this.updateUIDisplay();

            const tGeo = new THREE.CylinderGeometry(0.5, 0.8, 1.5, 8);
            const tMat = new THREE.MeshStandardMaterial({ color: 0x9b59b6, metalness: 0.8 });
            const turret = new THREE.Mesh(tGeo, tMat);

            // Barrel
            const bGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
            const bMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
            const barrel = new THREE.Mesh(bGeo, bMat);
            barrel.rotation.x = Math.PI / 2;
            barrel.position.set(0, 0.5, 0.5);
            turret.add(barrel);

            turret.position.copy(this.camera.position);
            turret.position.y = 0.75; // ground level
            this.scene.add(turret);

            this.turrets.push({ mesh: turret, barrel: barrel, fireTimer: 0, life: 1000 });
            if(window.audio) window.audio.playPowerup();
            this.showToastUI("TURRET DEPLOYED");
        } else {
            this.showToastUI("Not enough coins (100)");
        }
    }

    dash() {
        if (this.dashCooldown > 0) return;
        // Boost in current movement direction
        const euler = new THREE.Euler(0, this.camera.rotation.y, 0, 'YXZ');
        const moveDir = this.direction.clone().applyEuler(euler);
        if (moveDir.lengthSq() > 0) {
            this.camera.position.x -= moveDir.x * 5; // massive instant dash
            this.camera.position.z -= moveDir.z * 5;
            this.dashCooldown = 120; // 2 sec cooldown
            this.spawnParticles(this.camera.position.clone(), 0xffffff, 20); // Dash trail
            this.showToastUI("DASH!");
            // FOV kick
            this.camera.fov = 90;
            this.camera.updateProjectionMatrix();
        }
    }

    showToastUI(text) {
        const div = document.createElement('div');
        div.innerText = text;
        div.style.position = 'fixed';
        div.style.top = '60%';
        div.style.left = '50%';
        div.style.transform = 'translate(-50%, -50%)';
        div.style.color = '#00ffff';
        div.style.fontFamily = "'Fredoka One', cursive";
        div.style.fontSize = '30px';
        div.style.pointerEvents = 'none';
        div.style.transition = 'all 0.5s';
        div.style.zIndex = '1000';
        document.body.appendChild(div);
        setTimeout(() => { div.style.top = '50%'; div.style.opacity = '0'; }, 50);
        setTimeout(() => div.remove(), 500);
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
        if(window.audio) window.audio.playJump();
        this.projectiles.push({
            mesh: grenade,
            velocity: dir.multiplyScalar(0.8).add(new THREE.Vector3(0, 0.5, 0)),
            life: this.grenadeType === 'gravity' ? 200 : 150,
            isGrenade: true,
            gType: this.grenadeType,
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
        if(window.audio) window.audio.playLaser();
        setTimeout(() => this.muzzleFlash.intensity = 0, 50);

        // Projectile with PointLight attached for dynamic lighting
        const projGeo = new THREE.SphereGeometry(this.isMech ? 0.4 : 0.15, 8, 8);
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
            isPlayer: true,
            isMechShot: this.isMech
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

        // Bullet time fuel management
        if (this.isBulletTime && this.bulletTimeFuel > 0) {
            this.bulletTimeFuel -= 0.5;
            document.body.style.filter = "sepia(0.5) contrast(1.2)";
        } else {
            this.isBulletTime = false;
            if (this.bulletTimeFuel < 100) this.bulletTimeFuel += 0.2;
            document.body.style.filter = "none";
        }

        const timeScale = this.isBulletTime ? 0.2 : 1.0;

        // Grapple Physics
        if (this.grapple.active && this.grapple.point) {
            const dir = new THREE.Vector3().subVectors(this.grapple.point, this.camera.position).normalize();
            this.camera.position.add(dir.multiplyScalar(0.8)); // pull speed
            this.velocity.y = 0.1; // slight lift

            // Update line
            const positions = this.grapple.line.geometry.attributes.position.array;
            positions[0] = this.camera.position.x; positions[1] = this.camera.position.y - 0.5; positions[2] = this.camera.position.z;
            this.grapple.line.geometry.attributes.position.needsUpdate = true;

            // Auto release if close
            if (this.camera.position.distanceTo(this.grapple.point) < 2) {
                this.grapple.active = false;
                this.scene.remove(this.grapple.line);
            }
        }

        // Orbital Strike Logic
        for(let i=this.orbitalStrikes.length-1; i>=0; i--) {
            let o = this.orbitalStrikes[i];
            o.timer--;

            // Blink marker
            o.marker.material.opacity = (o.timer % 10 < 5) ? 1 : 0.2;

            if (o.timer <= 0) {
                // KABOOM
                const strikePos = new THREE.Vector3(o.x, 0, o.z);
                this.spawnParticles(strikePos, 0xff0000, 100);
                if(window.audio) window.audio.playExplosion();

                // Screen shake
                this.camera.position.y += (Math.random()-0.5);
                this.camera.position.x += (Math.random()-0.5);

                // Huge AoE damage
                this.bots.forEach(bot => {
                    if (bot.health > 0 && strikePos.distanceTo(bot.group.position) < 15) {
                        bot.health -= 1000;
                        if (bot.health <= 0) {
                            this.scene.remove(bot.group);
                            this.addKillFeed(`Orbital Strike vaporized <b>${bot.name}</b>`);
                            this.score++; this.coins += 25;
                            if(window.userSystem) window.userSystem.addXP(50);
                            setTimeout(() => {
                                bot.health = 100;
                                bot.group.position.set((Math.random() - 0.5) * this.config.worldSize * 0.8, 0, (Math.random() - 0.5) * this.config.worldSize * 0.8);
                                this.scene.add(bot.group);
                            }, 4000);
                        }
                    }
                });

                this.scene.remove(o.marker);
                this.orbitalStrikes.splice(i, 1);
            }
        }

        // Energy Shield Logic
        for(let i=this.energyShields.length-1; i>=0; i--) {
            let s = this.energyShields[i];
            s.life--;
            s.mesh.material.opacity = (s.life / 600) * 0.5; // fade out
            if (s.life <= 0) {
                this.scene.remove(s.mesh);
                this.energyShields.splice(i, 1);
            }
        }

        // Mine Logic
        for(let i=this.mines.length-1; i>=0; i--) {
            let m = this.mines[i];
            if (m.timer > 0) m.timer--;
            else m.active = true;

            if (m.active) {
                // Blink
                m.mesh.children[0].intensity = Math.sin(Date.now() / 100) > 0 ? 2 : 0;

                // Check dist to bots
                let exploded = false;
                for(let j=this.bots.length-1; j>=0; j--) {
                    const b = this.bots[j];
                    if (b.health > 0 && m.mesh.position.distanceTo(b.group.position) < 3) {
                        // BOOM
                        this.spawnParticles(m.mesh.position, 0xe74c3c, 50);
                        if(window.audio) window.audio.playExplosion();

                        // AoE Damage
                        this.bots.forEach(botAoe => {
                            if(botAoe.health > 0 && m.mesh.position.distanceTo(botAoe.group.position) < 10) {
                                botAoe.health -= 200;
                                if(botAoe.health <= 0) {
                                    this.scene.remove(botAoe.group);
                                    this.addKillFeed(`Mine obliterated <b>${botAoe.name}</b>`);
                                    this.score++; this.coins += 25;
                                    if(window.userSystem) window.userSystem.addXP(30);
                                    setTimeout(() => {
                                        botAoe.health = 100;
                                        botAoe.group.position.set((Math.random() - 0.5) * this.config.worldSize * 0.8, 0, (Math.random() - 0.5) * this.config.worldSize * 0.8);
                                        this.scene.add(botAoe.group);
                                    }, 4000);
                                }
                            }
                        });

                        exploded = true;
                        break;
                    }
                }
                if(exploded) {
                    this.scene.remove(m.mesh);
                    this.mines.splice(i, 1);
                }
            }
        }

        // Turret Logic
        for(let i=this.turrets.length-1; i>=0; i--) {
            let t = this.turrets[i];
            t.life--;
            if (t.life <= 0) { this.scene.remove(t.mesh); this.turrets.splice(i,1); continue; }

            // Find closest bot
            let closest = null; let minDist = 40;
            this.bots.forEach(b => {
                if (b.health > 0) {
                    const d = t.mesh.position.distanceTo(b.group.position);
                    if (d < minDist) { minDist = d; closest = b; }
                }
            });

            if (closest) {
                t.mesh.lookAt(closest.group.position);
                t.fireTimer--;
                if (t.fireTimer <= 0) {
                    t.fireTimer = 20;
                    // Shoot
                    const dir = new THREE.Vector3().subVectors(closest.group.position, t.mesh.position).normalize();
                    const projGeo = new THREE.SphereGeometry(0.1, 4, 4);
                    const projMat = new THREE.MeshBasicMaterial({ color: 0x9b59b6 });
                    const proj = new THREE.Mesh(projGeo, projMat);
                    proj.position.copy(t.mesh.position);
                    proj.position.y += 0.5;

                    this.scene.add(proj);
                    this.projectiles.push({ mesh: proj, velocity: dir.multiplyScalar(2.0), life: 50, isPlayer: true, damage: 15 });
                    if(window.audio) window.audio.playLaser();
                }
            } else {
                t.mesh.rotation.y += 0.02; // idle scan
            }
        }

        // Dash Cooldown & FOV restore
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.swordActive > 0) this.swordActive--;
        if (this.killStreakTimer > 0) {
            this.killStreakTimer--;
            if (this.killStreakTimer <= 0) this.killStreak = 0;
        }

        // Snipe Zoom
        const targetFov = this.isZoomed ? 30 : this.baseFov;
        if (Math.abs(this.camera.fov - targetFov) > 0.5) {
            this.camera.fov += (targetFov - this.camera.fov) * 0.1;
            this.camera.updateProjectionMatrix();
        }

        // Medkit Collection
        for (let i = this.medkits.length - 1; i >= 0; i--) {
            const m = this.medkits[i];
            m.mesh.rotation.y += 0.05; // spin
            m.life--;

            const dist = m.mesh.position.distanceTo(this.camera.position);
            if (dist < 2.0) {
                // Collect
                this.health = Math.min(this.config.maxHealth, this.health + 30);
                this.showToastUI("+30 HP");
                document.body.style.boxShadow = 'inset 0 0 100px rgba(46,204,113,0.8)';
                setTimeout(() => document.body.style.boxShadow = 'none', 150);

                this.scene.remove(m.mesh);
                this.medkits.splice(i, 1);
            } else if (m.life <= 0) {
                this.scene.remove(m.mesh);
                this.medkits.splice(i, 1);
            }
        }

        // Draw Radar Minimap
        const rCanvas = document.getElementById('radarCanvas');
        if (rCanvas) {
            const rCtx = rCanvas.getContext('2d');
            rCtx.clearRect(0,0,150,150);

            // Radar scanline
            rCtx.fillStyle = 'rgba(0,255,255,0.1)';
            rCtx.beginPath();
            rCtx.arc(75, 75, 75, 0, Math.PI*2);
            rCtx.fill();

            const scanAngle = (performance.now() / 1000) * Math.PI;
            rCtx.fillStyle = 'rgba(0,255,255,0.3)';
            rCtx.beginPath();
            rCtx.moveTo(75,75);
            rCtx.arc(75,75,75, scanAngle, scanAngle + 0.5);
            rCtx.closePath();
            rCtx.fill();

            // Draw Player (Center, fixed rotation)
            rCtx.fillStyle = '#00ffff';
            rCtx.beginPath(); rCtx.arc(75, 75, 3, 0, Math.PI*2); rCtx.fill();

            // Draw Bots relative to player
            rCtx.fillStyle = '#ff0000';
            this.bots.forEach(bot => {
                if (bot.health > 0) {
                    const dx = bot.group.position.x - this.camera.position.x;
                    const dz = bot.group.position.z - this.camera.position.z;
                    // Scale map (150px = approx 80 units diameter)
                    const mapScale = 1.5;
                    const mapX = 75 + (dx * mapScale);
                    const mapY = 75 + (dz * mapScale);

                    if (mapX > 0 && mapX < 150 && mapY > 0 && mapY < 150) {
                        rCtx.beginPath(); rCtx.arc(mapX, mapY, 2, 0, Math.PI*2); rCtx.fill();
                    }
                }
            });
        }


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

            // Mech Timer
            if (this.isMech) {
                this.mechTimer--;
                if (this.mechTimer <= 0) {
                    this.isMech = false;
                    this.camera.position.y = 2;
                    document.body.style.boxShadow = 'none';
                    this.showToastUI("MECH POWER DEPLETED");
                }
            }

            const floorY = this.isMech ? 4 : 2;
            if (this.camera.position.y < floorY) {
                this.velocity.y = 0;
                this.camera.position.y = 2;
                this.jumps = 0;
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
            if (this.nebulaField) {
                this.nebulaField.rotation.y += 0.0002;
                this.nebulaField.rotation.x += 0.0001;
            }
        }

        // Update Weather
        if (this.weatherSystem) {
            const positions = this.weatherSystem.geometry.attributes.position.array;
            for(let i=0; i<positions.length; i+=3) {
                positions[i+1] -= (this.weatherConfig.speed * timeScale); // Y (fall)
                positions[i] += (this.weatherConfig.drift * timeScale);   // X (drift)

                if (positions[i+1] < 0) {
                    positions[i+1] = 100;
                    positions[i] = (Math.random() - 0.5) * this.config.worldSize;
                }
            }
            this.weatherSystem.geometry.attributes.position.needsUpdate = true;
        }

        // Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            if (p.isGrenade) {
                p.velocity.y -= this.config.gravity * 0.8;

                // Gravity pull effect before explosion
                if (p.gType === 'gravity' && p.life < 100 && p.life > 0) {
                    p.velocity.multiplyScalar(0.5); // stop moving
                    this.spawnParticles(p.mesh.position, 0x9b59b6, 2);

                    // Mind Control effect
                if (p.gType === 'mind' && p.life === 1) {
                    this.spawnParticles(p.mesh.position, 0xff00ff, 5);
                    this.bots.forEach(b => {
                        if (b.health > 0 && p.mesh.position.distanceTo(b.group.position) < 25) {
                            b.isMindControlled = true;
                            b.mesh.material.color.setHex(0xff00ff);
                        }
                    });
                }

                // Suck bots in
                    this.bots.forEach(b => {
                        if (b.health > 0) {
                            const d = p.mesh.position.distanceTo(b.group.position);
                            if (d < 30) {
                                const pullDir = new THREE.Vector3().subVectors(p.mesh.position, b.group.position).normalize();
                                b.group.position.add(pullDir.multiplyScalar(15 / Math.max(d, 1)));
                            }
                        }
                    });
                }
            }
            p.mesh.position.add(p.velocity.clone().multiplyScalar(timeScale));
            p.life--;

            let hit = false;
            const pBox = new THREE.Box3().setFromObject(p.mesh);

            if (p.isMindShot) {
                let hitBot = false;
                for (let j = 0; j < this.bots.length; j++) {
                    let bot = this.bots[j];
                    if (bot.health > 0 && !bot.isMindControlled) {
                        if (p.mesh.position.distanceTo(bot.group.position) < 2.0) {
                            bot.health -= this.config.weaponDamage;
                            this.spawnParticles(p.mesh.position, 0xff0000, 1);
                            p.life = 0;
                            hitBot = true;
                            if (bot.health <= 0) {
                                this.score += 50;
                                this.coins += 10;
                                this.updateUIDisplay();
                                if(window.audio) window.audio.playExplosion();
                            }
                            break;
                        }
                    }
                }
                if(hitBot) continue;
            } else if (p.isPlayer) {
                // Check bot hit
                for (let j = this.bots.length - 1; j >= 0; j--) {
                    const bot = this.bots[j];
                    const bBox = new THREE.Box3().setFromObject(bot.group);
                    if (pBox.intersectsBox(bBox)) {
                        // Headshot Check
                        let isHeadshot = false;
                        if (p.mesh.position.y > bot.group.position.y + 1.8) {
                            isHeadshot = true;
                            bot.health -= this.config.weaponDamage * 2.5; // CRIT
                        } else {
                            bot.health -= (this.config.weaponDamage * (p.isMechShot ? 3 : 1));
                        }
                        this.showHitMarker();
                        hit = true;

                        // Particle impact sparks
                        this.spawnParticles(p.mesh.position, 0xffff00, 5);

                        if (bot.health <= 0) {
                            // Medkit drop (25% chance)
                            if (Math.random() > 0.75) {
                                const mkGeo = new THREE.BoxGeometry(0.8, 0.4, 0.8);
                                const mkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x220000 });
                                const mk = new THREE.Mesh(mkGeo, mkMat);

                                // Red cross
                                const crGeo = new THREE.BoxGeometry(0.5, 0.41, 0.15);
                                const crMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                                const cr1 = new THREE.Mesh(crGeo, crMat);
                                const cr2 = new THREE.Mesh(crGeo, crMat);
                                cr2.rotation.y = Math.PI / 2;
                                mk.add(cr1); mk.add(cr2);

                                mk.position.copy(bot.group.position);
                                mk.position.y = 0.2;
                                this.scene.add(mk);
                                this.medkits.push({ mesh: mk, life: 600 });
                            }

                            // Explosion on bot kill
                            this.spawnParticles(bot.group.position, 0xffaa00, 30);

                            this.scene.remove(bot.group);
                            this.addKillFeed(`You fragged <b>${bot.name}</b>`);

                            this.killStreak++;
                            this.killStreakTimer = 180; // 3 seconds
                            if (this.killStreak === 2) this.showToastUI("DOUBLE KILL!");
                            if (this.killStreak === 3) this.showToastUI("TRIPLE KILL!");
                            if (this.killStreak >= 4) this.showToastUI("RAMPAGE! " + this.killStreak + "X");

                            // Streak bonus
                            if (this.killStreak > 1) {
                                this.coins += 10 * this.killStreak;
                                if (window.userSystem) window.userSystem.addXP(10 * this.killStreak);
                            }
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
                // Check Energy Shield hit (block enemy bullets)
                let blocked = false;
                for(let s of this.energyShields) {
                    if (pBox.intersectsBox(s.box)) {
                        blocked = true;
                        this.spawnParticles(p.mesh.position, 0x00ffff, 5); // shield impact sparks
                        break;
                    }
                }
                if(blocked) { this.scene.remove(p.mesh); this.projectiles.splice(i, 1); continue; }

                // Check player hit
                const playerBox = new THREE.Box3().setFromCenterAndSize(this.camera.position, new THREE.Vector3(1, 2, 1));
                if (pBox.intersectsBox(playerBox)) {
                    if (this.isMech) {
                        this.mechHealth -= 20;
                        if (this.mechHealth <= 0) {
                            this.isMech = false;
                            this.camera.position.y = 2;
                            document.body.style.boxShadow = 'none';
                            this.showToastUI("MECH DESTROYED");
                            if(window.audio) window.audio.playExplosion();
                        }
                    } else {
                        this.health -= 20;
                    }
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
                    if(window.audio) window.audio.playExplosion();
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

        // Decoy Logic
        for(let i=this.decoys.length-1; i>=0; i--) {
            let d = this.decoys[i];
            d.life--;
            d.mesh.rotation.y += 0.1; // spinning holo effect
            if(d.life <= 0) {
                this.spawnParticles(d.mesh.position, 0x3498db, 20);
                this.scene.remove(d.mesh);
                this.decoys.splice(i, 1);
            }
        }

        // Update Bots (AI & LookAt)
        this.bots.forEach(bot => {
            if (bot.health > 0) {
                bot.group.position.x += bot.vx * timeScale;
                bot.group.position.z += bot.vz * timeScale;

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
                bot.shootTimer -= timeScale;
                if (bot.shootTimer <= 0) {
                    // Decoy targeting priority
                    let targetPos = this.camera.position;
                    let targetDist = bot.group.position.distanceTo(targetPos);

                    if (this.decoys.length > 0) {
                        // Find closest decoy
                        let cDecoy = null; let cDist = Infinity;
                        this.decoys.forEach(d => {
                            const dist = bot.group.position.distanceTo(d.mesh.position);
                            if(dist < cDist) { cDist = dist; cDecoy = d.mesh.position; }
                        });

                        // If decoy is closer than player, or just randomly prefer decoy
                        if (cDecoy && (cDist < targetDist || Math.random() > 0.3)) {
                            targetPos = cDecoy;
                            targetDist = cDist;
                        }
                    }

                    if (targetDist < 100) {
                        // Overwrite botShoot logic slightly inline to use targetPos instead of camera
                        const dir = new THREE.Vector3();
                        dir.subVectors(targetPos, bot.group.position).normalize();

                        const projGeo = new THREE.SphereGeometry(0.2, 8, 8);
                        const projMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const proj = new THREE.Mesh(projGeo, projMat);

                        const projLight = new THREE.PointLight(0xff0000, 1, 15);
                        proj.add(projLight);

                        proj.position.copy(bot.group.position);
                        proj.position.y += 2.4;
                        proj.position.add(dir.clone().multiplyScalar(2));

                        this.scene.add(proj);
                        this.projectiles.push({
                            mesh: proj,
                            velocity: dir.multiplyScalar(2.0),
                            life: 100,
                            isPlayer: false
                        });
                    }

                    bot.shootTimer = 50 + Math.random() * 80; // shoot faster in V2
                }
            }
        });

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let pt = this.particles[i];
            pt.mesh.position.x += pt.vx * timeScale;
            pt.mesh.position.y += pt.vy * timeScale;
            pt.mesh.position.z += pt.vz * timeScale;
            pt.vy -= 0.02 * timeScale; // gravity for particles
            pt.life -= 0.05 * timeScale;

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
