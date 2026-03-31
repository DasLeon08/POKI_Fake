// Advanced Infinite Runner / Platformer Engine

class PlatformerEngine {
    constructor(canvasId, config) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.config = Object.assign({
            bgColor: '#34495e',
            groundColor: '#2c3e50',
            playerColor: '#e74c3c',
            gameSpeed: 5,
            gravity: 0.6,
            jumpForce: -12,
            maxJumps: 2
        }, config);

        this.initCanvas();

        this.player = {
            x: 100,
            y: 0,
            width: 30,
            height: 30,
            vy: 0,
            jumps: 0,
            inverted: false
        };

        this.score = 0;
        this.platforms = [];
        this.obstacles = [];
        this.particles = [];
        this.frameCount = 0;
        this.isGameOver = false;

        this.initPlatforms();
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

    initPlatforms() {
        // Initial solid ground
        this.platforms.push({
            x: 0, y: this.height - 100, width: this.width * 2, height: 100
        });
    }

    setupControls() {
        const jump = () => {
            if (this.isGameOver) {
                // Reload or reset logic could go here
                return;
            }
            if (this.player.jumps < this.config.maxJumps) {
                this.player.vy = this.player.inverted ? -this.config.jumpForce : this.config.jumpForce;
                this.player.jumps++;
                this.createParticles(this.player.x, this.player.inverted ? this.player.y : this.player.y + this.player.height, '#fff', 5);
            }
        };

        window.addEventListener('keydown', e => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') jump();
            if (e.code === 'KeyG') this.player.inverted = !this.player.inverted; // Gravity flip mechanic
        });

        this.canvas.addEventListener('mousedown', jump);
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, {passive: false});
    }

    createParticles(x, y, color, count) {
        for(let i=0; i<count; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 5 - this.config.gameSpeed,
                vy: (Math.random() - 0.5) * 5,
                life: 1.0,
                color: color
            });
        }
    }

    update() {
        this.frameCount++;

        // Speed up
        if (this.frameCount % 600 === 0) this.config.gameSpeed += 0.5;
        this.score += this.config.gameSpeed / 10;

        // Player physics
        this.player.vy += this.player.inverted ? -this.config.gravity : this.config.gravity;
        this.player.y += this.player.vy;

        // Platform generation
        if (this.platforms[this.platforms.length - 1].x < this.width) {
            let pY = this.height - 100 + (Math.random() - 0.5) * 100;
            // Ensure gap
            let gap = Math.random() * 150 + 50;
            this.platforms.push({
                x: this.platforms[this.platforms.length - 1].x + this.platforms[this.platforms.length - 1].width + gap,
                y: pY,
                width: Math.random() * 300 + 100,
                height: this.height - pY
            });

            // Add obstacle
            if (Math.random() > 0.5) {
                this.obstacles.push({
                    x: this.platforms[this.platforms.length - 1].x + Math.random() * 100 + 50,
                    y: pY - 30,
                    width: 30,
                    height: 30,
                    danger: true
                });
            }
        }

        // Check collisions & move
        let grounded = false;

        // Platforms
        for (let i = this.platforms.length - 1; i >= 0; i--) {
            let p = this.platforms[i];
            p.x -= this.config.gameSpeed;

            if (this.player.x < p.x + p.width &&
                this.player.x + this.player.width > p.x &&
                this.player.y < p.y + p.height &&
                this.player.y + this.player.height > p.y) {

                if (!this.player.inverted && this.player.vy > 0 && this.player.y + this.player.height - this.player.vy <= p.y) {
                    this.player.y = p.y - this.player.height;
                    this.player.vy = 0;
                    this.player.jumps = 0;
                    grounded = true;
                } else if (this.player.inverted && this.player.vy < 0 && this.player.y - this.player.vy >= p.y + p.height) {
                    this.player.y = p.y + p.height;
                    this.player.vy = 0;
                    this.player.jumps = 0;
                    grounded = true;
                } else {
                    // Hit side of platform
                    this.isGameOver = true;
                }
            }
            if (p.x + p.width < 0) this.platforms.splice(i, 1);
        }

        // Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let o = this.obstacles[i];
            o.x -= this.config.gameSpeed;

            if (this.player.x < o.x + o.width &&
                this.player.x + this.player.width > o.x &&
                this.player.y < o.y + o.height &&
                this.player.y + this.player.height > o.y) {
                this.isGameOver = true;
            }
            if (o.x + o.width < 0) this.obstacles.splice(i, 1);
        }

        // Death bounds
        if (this.player.y > this.height || this.player.y < -this.height) this.isGameOver = true;

        // Particles
        for(let i = this.particles.length - 1; i >= 0; i--) {
            let pt = this.particles[i];
            pt.x += pt.vx; pt.y += pt.vy;
            pt.life -= 0.05;
            if(pt.life <= 0) this.particles.splice(i, 1);
        }

        if (this.frameCount % 5 === 0 && grounded) {
             this.createParticles(this.player.x, this.player.inverted ? this.player.y : this.player.y + this.player.height, this.config.playerColor, 1);
        }
    }

    draw() {
        // BG
        this.ctx.fillStyle = this.config.bgColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Grid pattern in BG
        this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        this.ctx.lineWidth = 1;
        const offset = (this.frameCount * (this.config.gameSpeed * 0.2)) % 50;
        this.ctx.beginPath();
        for(let i=-offset; i<this.width; i+=50) { this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.height); }
        for(let i=0; i<this.height; i+=50) { this.ctx.moveTo(0, i); this.ctx.lineTo(this.width, i); }
        this.ctx.stroke();

        // Platforms
        this.ctx.fillStyle = this.config.groundColor;
        this.platforms.forEach(p => {
            this.ctx.fillRect(p.x, p.y, p.width, p.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(p.x, p.y, p.width, 5); // top highlight
            this.ctx.fillStyle = this.config.groundColor;
        });

        // Obstacles
        this.ctx.fillStyle = '#e74c3c';
        this.obstacles.forEach(o => {
            this.ctx.fillRect(o.x, o.y, o.width, o.height);
        });

        // Player
        this.ctx.fillStyle = this.config.playerColor;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.config.playerColor;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.shadowBlur = 0;

        // Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, 4, 4);
        });
        this.ctx.globalAlpha = 1.0;

        // UI
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px "Fredoka One"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(\`Distance: \${Math.floor(this.score)}m\`, 20, 40);

        this.ctx.font = '14px "Nunito"';
        this.ctx.fillStyle = '#bdc3c7';
        this.ctx.fillText('Press G to invert gravity!', 20, 65);
    }

    loop() {
        if (this.isGameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 40px "Fredoka One"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.width/2, this.height/2);
            this.ctx.font = '20px "Nunito"';
            this.ctx.fillText(\`Final Distance: \${Math.floor(this.score)}m\`, this.width/2, this.height/2 + 40);

            if (window.userSystem) {
                window.userSystem.addXP(Math.floor(this.score / 100));
            }
            return;
        }

        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}
window.PlatformerEngine = PlatformerEngine;
