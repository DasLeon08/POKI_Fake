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
            wallSliding: false,
            x: 100,
            y: 0,
            width: 30,
            height: 30,
            vy: 0,
            jumps: 0,
            inverted: false
        };

        this.score = 0;
        this.coins = 0;
        this.dashCooldown = 0;
        this.isDashing = false;
        this.parallaxX = 0;
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
        const isMoving = Math.random() > 0.7; // 30% chance to be a moving platform
            const type = Math.random() > 0.5 ? 'h' : 'v';
            this.platforms.push({
                x: this.platforms[this.platforms.length - 1].x + this.platforms[this.platforms.length - 1].width + gap,
                y: pY,
                width: Math.random() * 300 + 100,
                height: this.height - pY,
                isMoving: isMoving,
                type: type,
                origY: pY,
                offset: 0,
                hasBouncePad: hasBouncePad
            });

            // Add obstacle
            if (Math.random() > 0.5) {
                this.obstacles.push({
                    x: this.platforms[this.platforms.length - 1].x + Math.random() * 100 + 50,
                    y: pY - 30,
                    width: 30,
                    height: 30,
                    danger: true,
                    breakable: Math.random() > 0.8 // 20% are glass/breakable
                });
            }

            // Coins
            if (Math.random() > 0.4) {
                for(let c=0; c<3; c++) {
                    this.obstacles.push({
                        x: this.platforms[this.platforms.length - 1].x + 50 + (c * 40),
                        y: pY - 60 - Math.random() * 50,
                        width: 15,
                        height: 15,
                        danger: false,
                        isCoin: true
                    });
                }
            }
        }

        // Check collisions & move
        let grounded = false;
        this.player.wallSliding = false;

        // Platforms
        for (let i = this.platforms.length - 1; i >= 0; i--) {
            let p = this.platforms[i];

            // Move logic
            if (p.isMoving) {
                p.offset += 0.05;
                if (p.type === 'v') {
                    p.y = p.origY + Math.sin(p.offset) * 100;
                    p.height = this.height - p.y;
                } else {
                    p.x += Math.cos(p.offset) * 2;
                }
            }
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
                    this.player.wallSliding = false;

                    // Bounce pad interaction
                    if (p.hasBouncePad &&
                        this.player.x + this.player.width > p.x + p.width/2 - 20 &&
                        this.player.x < p.x + p.width/2 + 20) {
                        this.player.vy = this.player.inverted ? 20 : -20; // massive jump
                        if(window.audio) window.audio.playPowerup();
                        this.createParticles(this.player.x, this.player.y, '#f1c40f', 20);
                        grounded = false; // immediately airborne
                    }
                } else {
                    // Hit side of platform
                    if (this.player.vy > 0 && !this.player.inverted) {
                        this.player.wallSliding = true;
                        this.player.vy = 2; // Slide down slowly
                        this.player.jumps = 1; // Allow wall jump
                        if (this.frameCount % 5 === 0) this.createParticles(this.player.x + this.player.width, this.player.y + this.player.height/2, '#fff', 2);
                    } else if (this.player.vy < 0 && this.player.inverted) {
                        this.player.wallSliding = true;
                        this.player.vy = -2; // Slide up slowly
                        this.player.jumps = 1;
                        if (this.frameCount % 5 === 0) this.createParticles(this.player.x + this.player.width, this.player.y + this.player.height/2, '#fff', 2);
                    } else {
                        this.isGameOver = true;
                    }
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

                if (o.isCoin) {
                    this.coins++;
                    if(window.audio) window.audio.playCoin();
                    this.score += 50;
                    this.obstacles.splice(i, 1);
                    this.createParticles(o.x, o.y, '#f1c40f', 5);
                    continue;
                } else if (o.breakable && this.isDashing) {
                    this.score += 100;
                    if(window.audio) window.audio.playExplosion();
                    this.obstacles.splice(i, 1);
                    this.createParticles(o.x, o.y, '#3498db', 20); // glass shatter
                    continue;
                } else {
                    this.isGameOver = true;
                }
            }
            if (o && o.x + o.width < 0) this.obstacles.splice(i, 1);
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
        // Parallax Mountains
        this.parallaxX -= this.config.gameSpeed * 0.3;
        if(this.parallaxX < -this.width) this.parallaxX = 0;

        this.ctx.fillStyle = '#111822'; // mountain
        this.ctx.beginPath();
        for(let i=0; i<2; i++) {
            const startX = this.parallaxX + (i*this.width);
            this.ctx.moveTo(startX, this.height);
            this.ctx.lineTo(startX + 200, this.height - 300);
            this.ctx.lineTo(startX + 400, this.height - 100);
            this.ctx.lineTo(startX + 600, this.height - 400);
            this.ctx.lineTo(startX + this.width, this.height);
        }
        this.ctx.fill();

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

            // Draw bounce pad
            if (p.hasBouncePad) {
                this.ctx.fillStyle = '#f1c40f';
                this.ctx.fillRect(p.x + p.width/2 - 20, p.y - 5, 40, 5);
            }
            this.ctx.fillStyle = this.config.groundColor;
        });

        // Obstacles
        this.obstacles.forEach(o => {
            if (o.isCoin) {
                this.ctx.fillStyle = '#f1c40f';
                this.ctx.beginPath();
                this.ctx.arc(o.x + o.width/2, o.y + o.height/2, o.width/2, 0, Math.PI*2);
                this.ctx.fill();
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '10px Arial';
                this.ctx.fillText('

        // Player
        this.ctx.fillStyle = this.isDashing ? '#ffffff' : this.config.playerColor;
        if(this.isDashing) {
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#fff';
        }
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
        this.ctx.fillText('Press [G] Invert Gravity | [Shift] Dash/Break Glass', 20, 95);
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
, o.x + 4, o.y + 12);
            } else if (o.breakable) {
                this.ctx.fillStyle = 'rgba(52, 152, 219, 0.5)'; // glass
                this.ctx.fillRect(o.x, o.y, o.width, o.height);
                this.ctx.strokeStyle = '#fff';
                this.ctx.strokeRect(o.x, o.y, o.width, o.height);
            } else {
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.fillRect(o.x, o.y, o.width, o.height);
            }
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
