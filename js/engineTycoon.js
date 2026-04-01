// Universal Tycoon Game Engine

class TycoonEngine {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = Object.assign({
            currencyName: 'Gold',
            clickPower: 1,
            buildings: [
                { id: 'b1', name: 'Stand', baseCost: 10, cps: 1 },
                { id: 'b2', name: 'Shop', baseCost: 100, cps: 15 },
                { id: 'b3', name: 'Factory', baseCost: 1000, cps: 150 },
                { id: 'b4', name: 'Corporation', baseCost: 10000, cps: 2000 }
            ],
            colorTheme: '#f1c40f'
        }, config);

        // Load Save State
        this.saveKey = 'poki_tycoon_' + this.config.currencyName.replace(/\\s/g, '_');
        this.stockPrice = 100;
        this.stockTrend = 0;
        this.bankBalance = 0;
        this.interestRate = 0.05; // 5% per 10s
        this.clickCombo = 0;
        this.comboDecayTimer = 0;
        this.overdriveTimer = 0;
        this.state = JSON.parse(localStorage.getItem(this.saveKey)) || {
            currency: 0,
            clickPower: this.config.clickPower,
            clickUpgrades: 0,
            buildings: this.config.buildings.map(b => ({ id: b.id, count: 0, level: 1 })),
            shares: 0,
            autoClickers: 0,
            prestige: 0
        };

        // Offline Progress
        const lastLogin = localStorage.getItem(this.saveKey + '_time') || Date.now();
        const secondsAway = Math.floor((Date.now() - lastLogin) / 1000);

        const cps = this.calculateCPS();
        if (secondsAway > 60 && cps > 0) {
            const offlineGains = cps * secondsAway;
            this.state.currency += offlineGains;
            if (window.userSystem) {
                window.userSystem.showToast(\`Willkommen zurück! \${this.formatNumber(offlineGains)} \${this.config.currencyName} verdient.\`);
            }
        }

        this.initUI();
        this.updateUI();

        // Game Loop
        setInterval(() => {
            let multiplier = 1 + (this.state.prestige * 0.5); // +50% per prestige level
            this.state.currency += this.calculateCPS() * multiplier;

            // Update Stock Market
            this.stockTrend += (Math.random() - 0.5) * 2;

            // Interest tick every 10 seconds
            if (Date.now() % 10000 < 1000 && this.bankBalance > 0) {
                const interest = this.bankBalance * this.interestRate;
                this.bankBalance += interest;
                this.createClickText(window.innerWidth/2, window.innerHeight/2, `Zinsen! +${this.formatNumber(interest)}`);
                if(window.audio) window.audio.playCoin();
            }
            const bbEl = document.getElementById('bank-balance');
            if (bbEl) bbEl.innerText = this.formatNumber(this.bankBalance);
            this.stockTrend *= 0.95; // dampen
            this.stockPrice += this.stockTrend + (Math.random() - 0.5) * 5;
            if (this.stockPrice < 10) this.stockPrice = 10;
            if (this.stockPrice > 1000) this.stockPrice = 1000;

            const spEl = document.getElementById('stock-price');
            if (spEl) {
                spEl.innerText = Math.floor(this.stockPrice);
                spEl.style.color = this.stockTrend > 0 ? '#2ecc71' : '#e74c3c';
            }

            // Auto Clickers
            if (this.state.autoClickers > 0) {
                for(let i=0; i<this.state.autoClickers; i++) {
                    const clickVal = this.state.clickPower * multiplier;
                    this.state.currency += clickVal;
                    if(Math.random() < 0.1) {
                        const btnRect = document.getElementById('tycoon-main-btn').getBoundingClientRect();
                        this.createClickText(btnRect.left + Math.random()*btnRect.width, btnRect.top + Math.random()*btnRect.height, `+${this.formatNumber(clickVal)} (Auto)`);
                    }
                }
            }

            // Random Golden Click event (1% chance per second)
            if (Math.random() < 0.01 && !document.getElementById('golden-click')) {
                this.spawnGoldenClick();
            }

            // Thief Event
            if (Math.random() < 0.005 && !document.getElementById('thief-event')) {
                this.spawnThief();
            }

            // Loot Crate Event (rare)
            if (Math.random() < 0.002 && !document.getElementById('loot-crate')) {
                this.spawnLootCrate();
            }
                this.spawnGoldenClick();
            }
            this.updateUI();

            // Save randomly
            if (Math.random() < 0.1) {
                localStorage.setItem(this.saveKey, JSON.stringify(this.state));
                localStorage.setItem(this.saveKey + '_time', Date.now());
                if (window.userSystem) window.userSystem.addXP(Math.floor(this.calculateCPS() / 10) + 1);
            }
        }, 1000);
    }

    calculateCPS() {
        let cps = 0;
        this.config.buildings.forEach(b => {
            const owned = this.state.buildings.find(ob => ob.id === b.id).count;
            const lvl = this.state.buildings.find(ob => ob.id === b.id).level || 1;
            cps += owned * (b.cps * Math.pow(1.2, lvl - 1));
        });
        return cps;
    }

    getBuildingCost(baseCost, count) {
        return Math.floor(baseCost * Math.pow(1.15, count));
    }

    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num).toString();
    }

    spawnThief() {
        const btn = document.createElement('div');
        btn.id = 'thief-event';
        btn.innerHTML = '🏃‍♂️💨';
        btn.style.position = 'fixed';
        btn.style.left = '-100px';
        btn.style.top = (20 + Math.random() * 60) + '%';
        btn.style.fontSize = '4rem';
        btn.style.cursor = 'crosshair';
        btn.style.zIndex = 2000;
        btn.style.transition = 'left 6s linear';

        btn.onclick = () => {
            const reward = Math.max(500, this.calculateCPS() * 300); // 5 mins worth
            this.state.currency += reward;
            this.createClickText(btn.getBoundingClientRect().left, btn.getBoundingClientRect().top, `+${this.formatNumber(reward)} THIEF CAUGHT!`);
            this.createParticles(btn.getBoundingClientRect().left + 25, btn.getBoundingClientRect().top + 25, '#2ecc71', 50);
            btn.remove();
            this.updateUI();
            if(window.audio) window.audio.playExplosion();
        };

        document.body.appendChild(btn);

        // Run across
        setTimeout(() => btn.style.left = '120%', 100);
        setTimeout(() => { if(btn.parentNode) btn.remove(); }, 6100);
    }

    spawnLootCrate() {
        const crate = document.createElement('div');
        crate.id = 'loot-crate';
        crate.innerHTML = '📦';
        crate.style.position = 'fixed';
        crate.style.left = (Math.random() * 80 + 10) + '%';
        crate.style.top = (Math.random() * 80 + 10) + '%';
        crate.style.fontSize = '5rem';
        crate.style.cursor = 'pointer';
        crate.style.zIndex = 2000;
        crate.style.transition = 'transform 0.1s';

        let clicks = 0;
        crate.onclick = () => {
            clicks++;
            crate.style.transform = `scale(${1 - clicks*0.05}) rotate(${(Math.random()-0.5)*20}deg)`;
            this.createParticles(crate.getBoundingClientRect().left + 40, crate.getBoundingClientRect().top + 40, '#e67e22', 5);
            if(window.audio) window.audio.playJump(); // thud sound

            if (clicks >= 10) {
                // Break open
                const reward = Math.max(5000, this.calculateCPS() * 600); // 10 mins worth
                this.state.currency += reward;
                this.createClickText(crate.getBoundingClientRect().left, crate.getBoundingClientRect().top, `MASSIVE LOOT! +${this.formatNumber(reward)}`);
                this.createParticles(crate.getBoundingClientRect().left + 40, crate.getBoundingClientRect().top + 40, '#f1c40f', 200);
                crate.remove();
                this.updateUI();
                if(window.audio) window.audio.playExplosion();
            }
        };

        document.body.appendChild(crate);
        setTimeout(() => { if(crate.parentNode) crate.remove(); }, 15000); // 15 sec to break it
    }

    spawnGoldenClick() {
        const btn = document.createElement('div');
        btn.id = 'golden-click';
        btn.innerHTML = '✨';
        btn.style.position = 'fixed';
        btn.style.left = Math.random() * 80 + '%';
        btn.style.top = '-50px';
        btn.style.fontSize = '3rem';
        btn.style.cursor = 'pointer';
        btn.style.zIndex = 2000;
        btn.style.transition = 'top 5s linear, transform 0.2s';

        btn.onclick = () => {
            const reward = Math.max(100, this.calculateCPS() * 120); // 2 minutes worth or 100 flat
            this.state.currency += reward;
            this.createClickText(btn.getBoundingClientRect().left, btn.getBoundingClientRect().top, `+${this.formatNumber(reward)} GOLDEN!`);
            this.createParticles(btn.getBoundingClientRect().left + 25, btn.getBoundingClientRect().top + 25, '#f1c40f', 30);
            btn.remove();
            this.updateUI();
        };

        document.body.appendChild(btn);

        // Fall down
        setTimeout(() => btn.style.top = '110%', 100);
        setTimeout(() => { if(btn.parentNode) btn.remove(); }, 5100);
    }

    createParticles(x, y, color, count = 10) {
        for(let i=0; i<count; i++) {
            const pt = document.createElement('div');
            pt.style.position = 'fixed';
            pt.style.left = x + 'px';
            pt.style.top = y + 'px';
            pt.style.width = '8px';
            pt.style.height = '8px';
            pt.style.backgroundColor = Math.random() > 0.5 ? color : '#fff';
            pt.style.borderRadius = '50%';
            pt.style.pointerEvents = 'none';
            pt.style.zIndex = 1500;

            const vx = (Math.random() - 0.5) * 300;
            const vy = (Math.random() - 0.5) * 300 - 150;

            pt.animate([
                { transform: `translate(0px, 0px) scale(1)`, opacity: 1 },
                { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
            ], { duration: 800 + Math.random()*400, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' });

            document.body.appendChild(pt);
            setTimeout(() => pt.remove(), 1200);
        }
    }

    buyOverdrive() {
        const cost = this.calculateCPS() * 300; // 5 minutes worth of CPS
        if (this.state.currency >= cost && this.overdriveTimer <= 0) {
            this.state.currency -= cost;
            this.overdriveTimer = 30; // 30 seconds
            this.createClickText(window.innerWidth/2, window.innerHeight/2, `OVERDRIVE ACTIVATED!`);
            this.createParticles(window.innerWidth/2, window.innerHeight/2, '#e74c3c', 100);
            if(window.audio) window.audio.playExplosion();
            this.updateUI();
        } else if (this.overdriveTimer > 0) {
            this.createClickText(event.clientX, event.clientY, `Already Active!`);
        } else {
            this.createClickText(event.clientX, event.clientY, `Need ${this.formatNumber(cost)}`);
        }
    }

    doPrestige() {
        // Require at least building tier 3
        const b3 = this.state.buildings.find(b => b.id === 'b3');
        if (b3 && b3.count >= 10) {
            if (confirm("Möchtest du einen Prestige durchführen? Alles wird zurückgesetzt, aber du erhältst +50% Einkommen dauerhaft!")) {
                this.state.prestige = (this.state.prestige || 0) + 1;
                this.state.currency = 0;
                this.state.clickPower = this.config.clickPower;
                this.state.clickUpgrades = 0;
                this.state.buildings.forEach(b => b.count = 0);
                this.createParticles(window.innerWidth/2, window.innerHeight/2, '#9b59b6', 100);
                this.updateUI();
                localStorage.setItem(this.saveKey, JSON.stringify(this.state));
            }
        } else {
            alert("Du brauchst mindestens 10 von Gebäude Tier 3 für Prestige!");
        }
    }

    click() {
        this.state.currency += this.state.clickPower;
        this.createClickText(event.clientX, event.clientY, \`+\${this.formatNumber(this.state.clickPower)}\`);

        // Bounce animation
        const mainBtn = document.getElementById('tycoon-main-btn');
        mainBtn.style.transform = 'scale(0.95)';
        setTimeout(() => mainBtn.style.transform = 'scale(1)', 50);

        this.updateUI();
        if(window.audio) window.audio.playClick();
    }

    createClickText(x, y, text) {
        const el = document.createElement('div');
        el.innerText = text;
        el.style.position = 'fixed';
        el.style.left = (x - 20 + Math.random() * 40) + 'px';
        el.style.top = (y - 20) + 'px';
        el.style.color = this.config.colorTheme;
        el.style.fontWeight = 'bold';
        el.style.fontSize = '24px';
        el.style.pointerEvents = 'none';
        el.style.fontFamily = "'Fredoka One', cursive";
        el.style.transition = "all 1s ease-out";
        el.style.zIndex = 1000;
        document.body.appendChild(el);

        setTimeout(() => {
            el.style.top = (y - 100) + 'px';
            el.style.opacity = '0';
        }, 10);

        setTimeout(() => el.remove(), 1000);
    }

    spinSlots() {
        if (this.state.currency >= 500) {
            this.state.currency -= 500;
            const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣'];
            const r1 = symbols[Math.floor(Math.random() * symbols.length)];
            const r2 = symbols[Math.floor(Math.random() * symbols.length)];
            const r3 = symbols[Math.floor(Math.random() * symbols.length)];

            const resEl = document.getElementById('slot-result');
            resEl.innerText = `${r1}${r2}${r3}`;

            if (r1 === r2 && r2 === r3) {
                // JACKPOT
                let win = 5000;
                if (r1 === '7️⃣') win = 50000;
                if (r1 === '💎') win = 100000;

                this.state.currency += win;
                this.createClickText(window.innerWidth/2, window.innerHeight/2, `JACKPOT! +${this.formatNumber(win)}`);
                this.createParticles(window.innerWidth/2, window.innerHeight/2, '#f1c40f', 100);
                if(window.audio) window.audio.playExplosion();
            } else if (r1 === r2 || r2 === r3 || r1 === r3) {
                // Small win
                this.state.currency += 1000;
                this.createClickText(window.innerWidth/2, window.innerHeight/2, `+1k`);
                if(window.audio) window.audio.playCoin();
            } else {
                if(window.audio) window.audio.playJump(); // sad sound
            }
            this.updateUI();
        }
    }

    levelUpBuilding(id) {
        const b = this.config.buildings.find(x => x.id === id);
        const stateB = this.state.buildings.find(x => x.id === id);
        const lvl = stateB.level || 1;
        const cost = Math.floor(b.baseCost * 5 * Math.pow(1.5, lvl)); // expensive to level up

        if (this.state.currency >= cost) {
            this.state.currency -= cost;
            stateB.level = lvl + 1;
            this.createClickText(event.clientX, event.clientY, `LEVEL UP!`);
            this.createParticles(event.clientX, event.clientY, '#3498db', 20);
            if(window.audio) window.audio.playPowerup();
            this.updateUI();
        } else {
            this.createClickText(event.clientX, event.clientY, `Need ${this.formatNumber(cost)}`);
        }
    }

    buyBuilding(id) {
        const building = this.config.buildings.find(b => b.id === id);
        const stateBuilding = this.state.buildings.find(ob => ob.id === id);
        const cost = this.getBuildingCost(building.baseCost, stateBuilding.count);

        if (this.state.currency >= cost) {
            this.state.currency -= cost;
            stateBuilding.count++;
            const el = document.getElementById('b-' + id);
            if (el) {
                const rect = el.getBoundingClientRect();
                this.createParticles(rect.left + rect.width/2, rect.top + rect.height/2, '#2ecc71', 15);
            }
            this.updateUI();
            if(window.audio) window.audio.playCoin();
        }
    }

    depositBank() {
        if (this.state.currency > 0) {
            this.bankBalance += this.state.currency;
            this.state.currency = 0;
            this.updateUI();
            if(window.audio) window.audio.playCoin();
        }
    }

    withdrawBank() {
        if (this.bankBalance > 0) {
            this.state.currency += this.bankBalance;
            this.bankBalance = 0;
            this.updateUI();
            if(window.audio) window.audio.playPowerup();
        }
    }

    buyStock() {
        const cost = Math.floor(this.stockPrice);
        if (this.state.currency >= cost) {
            this.state.currency -= cost;
            this.state.shares = (this.state.shares || 0) + 1;
            this.updateUI();
        }
    }

    sellStock() {
        if ((this.state.shares || 0) > 0) {
            const val = Math.floor(this.stockPrice);
            this.state.shares--;
            this.state.currency += val;
            this.createClickText(event.clientX, event.clientY, `+${this.formatNumber(val)} (Stock)`);
            this.updateUI();
        }
    }

    buyAutoClicker() {
        const cost = Math.floor(200 * Math.pow(1.5, this.state.autoClickers || 0));
        if (this.state.currency >= cost) {
            this.state.currency -= cost;
            this.state.autoClickers = (this.state.autoClickers || 0) + 1;
            this.updateUI();
            if(window.audio) window.audio.playCoin();
        }
    }

    buyClickUpgrade() {
        const cost = Math.floor(50 * Math.pow(1.5, this.state.clickUpgrades));
        if (this.state.currency >= cost) {
            this.state.currency -= cost;
            this.state.clickUpgrades++;
            this.state.clickPower *= 2;
            this.updateUI();
            if(window.audio) window.audio.playPowerup();
        }
    }

    initUI() {
        this.container.innerHTML = \`
            <div style="display:flex; height: 100%; width: 100%; max-width: 1000px; margin: 0 auto; gap: 20px; font-family: 'Nunito', sans-serif; background: rgba(0,0,0,0.4); border-radius: 20px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">

                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px;">
                    <h2 style="font-family: 'Fredoka One', cursive; font-size: 2rem; color: white; text-shadow: 2px 2px 0 \${this.config.colorTheme}; margin-bottom: 5px;">\${this.config.currencyName}</h2>
                    <div id="currency-display" style="font-size: 3rem; font-weight: bold; color: \${this.config.colorTheme};">0</div>
                    <div id="combo-display" style="font-size: 1.5rem; color: #e74c3c; font-weight: bold; margin-bottom: 10px; opacity: 0; transition: opacity 0.2s;">1.0x COMBO!</div>
                    <div id="cps-display" style="font-size: 1.2rem; color: #ecf0f1; margin-bottom: 40px;">0 / sek</div>

                    <button id="tycoon-main-btn" onclick="window.tycoon.click(event)" style="width: 200px; height: 200px; border-radius: 50%; background: \${this.config.colorTheme}; border: 10px solid rgba(255,255,255,0.3); font-size: 5rem; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.3); transition: transform 0.1s;">\${this.config.icon || '💰'}</button>
                </div>

                <div style="flex: 1; background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; overflow-y: auto;">
                    <h3 style="color: white; font-family: 'Fredoka One', cursive; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px;">Upgrades</h3>

                    <div id="click-upgrade-btn" onclick="window.tycoon.buyClickUpgrade()" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s;">
                        <div>
                            <div style="color: white; font-weight: bold; font-size: 1.1rem;">Doppelter Klick (\${this.state.clickPower * 2} pro Klick)</div>
                            <div style="color: #95a5a6; font-size: 0.9rem;">Level \${this.state.clickUpgrades}</div>
                        </div>
                        <div id="click-upgrade-cost" style="color: \${this.config.colorTheme}; font-weight: bold;">50</div>

                        <div id="auto-clicker-cost" style="color: ${this.config.colorTheme}; font-weight: bold;">500</div>
                    </div>

                    <div id="auto-clicker-btn" onclick="window.tycoon.buyAutoClicker()" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s;">
                        <div>
                            <div style="color: white; font-weight: bold; font-size: 1.1rem;">Manager Einstellen (Auto-Klick)</div>
                            <div style="color: #95a5a6; font-size: 0.9rem;">Besitz: ${this.state.autoClickers || 0}</div>
                        </div>
                        <div id="auto-clicker-cost-disp" style="color: ${this.config.colorTheme}; font-weight: bold;">${this.formatNumber(Math.floor(200 * Math.pow(1.5, this.state.autoClickers || 0)))}</div>
                    </div>

                    <h3 style="color: white; font-family: 'Fredoka One', cursive; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 30px;">Gebäude</h3>

                    <div id="buildings-list"></div>

                    <h3 style="color: white; font-family: 'Fredoka One', cursive; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 30px;">Black Market 🕶️</h3>
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 15px; text-align:center;">
                        <button id="overdrive-btn" onclick="window.tycoon.buyOverdrive()" style="width:100%; padding:10px; background:linear-gradient(135deg, #e74c3c, #c0392b); border:none; color:white; border-radius:5px; font-weight:bold; cursor:pointer; font-size:1.1rem; box-shadow: 0 4px 10px rgba(231,76,60,0.4);">OVERDRIVE (x10 CPS for 30s)</button>
                    </div>
                    <h3 style="color: white; font-family: 'Fredoka One', cursive; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 30px;">Casino 🎰</h3>
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 15px; text-align:center;">
                        <div id="slot-result" style="font-size: 2rem; margin-bottom:10px; letter-spacing:10px;">❓❓❓</div>
                        <button onclick="window.tycoon.spinSlots()" style="width:100%; padding:10px; background:linear-gradient(135deg, #f1c40f, #f39c12); border:none; color:white; border-radius:5px; font-weight:bold; cursor:pointer; font-size:1.1rem; box-shadow: 0 4px 10px rgba(241,196,15,0.4);">SPIN (500 🪙)</button>
                    </div>
                    <h3 style="color: white; font-family: 'Fredoka One', cursive; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 30px;">Bank 🏦</h3>
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        <div style="color:white; margin-bottom:10px;">Guthaben: <span id="bank-balance" style="font-weight:bold; color:#2ecc71;">0</span></div>
                        <div style="display:flex; gap:10px;">
                            <button onclick="window.tycoon.depositBank()" style="flex:1; padding:8px; background:#f39c12; border:none; color:white; border-radius:5px; cursor:pointer;">Einzahlen (All)</button>
                            <button onclick="window.tycoon.withdrawBank()" style="flex:1; padding:8px; background:#9b59b6; border:none; color:white; border-radius:5px; cursor:pointer;">Auszahlen</button>
                        </div>
                        <div style="color:#95a5a6; font-size:0.8rem; margin-top:10px;">Zinsen: +5% alle 10s</div>
                    </div>
                    <h3 style="color: white; font-family: 'Fredoka One', cursive; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 30px;">Stock Market 📈</h3>
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <div style="color:white;">Stock Price: <span id="stock-price" style="font-weight:bold; color:#f1c40f;">100</span></div>
                            <div style="color:white;">Shares: <span id="stock-owned" style="font-weight:bold; color:#3498db;">0</span></div>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button onclick="window.tycoon.buyStock()" style="flex:1; padding:8px; background:#2ecc71; border:none; color:white; border-radius:5px; cursor:pointer;">Kaufen</button>
                            <button onclick="window.tycoon.sellStock()" style="flex:1; padding:8px; background:#e74c3c; border:none; color:white; border-radius:5px; cursor:pointer;">Verkaufen</button>
                        </div>
                    </div>
                </div>
            </div>
        \`;

        const list = document.getElementById('buildings-list');
        this.config.buildings.forEach(b => {
            const el = document.createElement('div');
            el.id = 'b-' + b.id;
            el.onclick = () => this.buyBuilding(b.id);
            el.style.cssText = 'background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s;';

            el.innerHTML = \`
                <div>
                    <div style="color: white; font-weight: bold; font-size: 1.1rem;">\${b.name}</div>
                    <div style="color: #2ecc71; font-size: 0.9rem;">+\${this.formatNumber(b.cps)} / sek</div>
                </div>
                <div style="text-align: right;">
                    <div id="cost-\${b.id}" style="color: \${this.config.colorTheme}; font-weight: bold;">0</div>
                    <div id="count-\${b.id}" style="color: #95a5a6; font-size: 0.9rem;">Besitz: 0</div>
                </div>
            \`;
            list.appendChild(el);
        });
    }

    updateUI() {
        document.getElementById('currency-display').innerText = this.formatNumber(this.state.currency);
        this.clickCombo += 0.1;
        if (this.clickCombo > 5.0) this.clickCombo = 5.0; // Max 5x combo
        this.comboDecayTimer = 10; // 1 second before decay

        let multiplier = 1 + ((this.state.prestige || 0) * 0.5) * (1 + this.clickCombo);
        document.getElementById('cps-display').innerText = this.formatNumber(this.calculateCPS() * multiplier) + ' / sek';

        // Update Combo UI
        const cDisp = document.getElementById('combo-display');
        if (cDisp) {
            cDisp.innerText = `${(1 + this.clickCombo).toFixed(1)}x COMBO!`;
            cDisp.style.opacity = this.clickCombo > 0.1 ? 1 : 0;
            cDisp.style.transform = `scale(${1 + this.clickCombo*0.1})`;
        }

        // Update Overdrive UI
        const odBtn = document.getElementById('overdrive-btn');
        if (odBtn) {
            const odCost = this.calculateCPS() * 300;
            if (this.overdriveTimer > 0) {
                odBtn.innerText = `ACTIVE (${this.overdriveTimer}s left)`;
                odBtn.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
                document.body.style.boxShadow = `inset 0 0 ${Math.sin(Date.now() / 100) * 50 + 50}px rgba(231,76,60,0.5)`;
            } else {
                odBtn.innerText = `OVERDRIVE (${this.formatNumber(odCost)} 🪙)`;
                odBtn.style.background = this.state.currency >= odCost ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 'rgba(0,0,0,0.3)';
                document.body.style.boxShadow = 'none';
            }
        }
        const pDisp = document.getElementById('prestige-display');
        if (pDisp) pDisp.innerHTML = `Prestige: ${this.state.prestige || 0} (+<span id="mult-display">${(this.state.prestige || 0) * 50}</span>%)`;

        // Background animated gradient
        document.body.style.background = `linear-gradient(${(Date.now() / 50) % 360}deg, #2c3e50, ${this.config.colorTheme})`;

        const clickCost = Math.floor(50 * Math.pow(1.5, this.state.clickUpgrades));
        const clickEl = document.getElementById('click-upgrade-btn');
        document.getElementById('click-upgrade-cost').innerText = this.formatNumber(clickCost);
        clickEl.style.background = this.state.currency >= clickCost ? 'rgba(52, 152, 219, 0.4)' : 'rgba(0,0,0,0.3)';

        const soEl = document.getElementById('stock-owned');
        if (soEl) soEl.innerText = this.state.shares || 0;

        const autoCost = Math.floor(200 * Math.pow(1.5, this.state.autoClickers || 0));
        const autoEl = document.getElementById('auto-clicker-btn');
        if (autoEl) {
            document.getElementById('auto-clicker-cost-disp').innerText = this.formatNumber(autoCost);
            autoEl.querySelector('div > div:nth-child(2)').innerText = 'Besitz: ' + (this.state.autoClickers || 0);
            autoEl.style.background = this.state.currency >= autoCost ? 'rgba(155, 89, 182, 0.4)' : 'rgba(0,0,0,0.3)';
        }

        this.config.buildings.forEach(b => {
            const stateB = this.state.buildings.find(ob => ob.id === b.id);
            const cost = this.getBuildingCost(b.baseCost, stateB.count);

            document.getElementById('cost-' + b.id).innerText = this.formatNumber(cost);
            document.getElementById('count-' + b.id).innerText = 'Besitz: ' + stateB.count + ' (Lv.' + (stateB.level||1) + ')';
            document.getElementById('cps-' + b.id).innerText = '+' + this.formatNumber(b.cps * Math.pow(1.2, (stateB.level||1)-1)) + ' / sek';

            const el = document.getElementById('b-' + b.id);
            el.style.background = this.state.currency >= cost ? 'rgba(46, 204, 113, 0.3)' : 'rgba(0,0,0,0.3)';
        });
    }
}
window.TycoonEngine = TycoonEngine;
