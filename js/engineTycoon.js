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
        this.state = JSON.parse(localStorage.getItem(this.saveKey)) || {
            currency: 0,
            clickPower: this.config.clickPower,
            clickUpgrades: 0,
            buildings: this.config.buildings.map(b => ({ id: b.id, count: 0 }))
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
            this.state.currency += this.calculateCPS();
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
            cps += owned * b.cps;
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

    click() {
        this.state.currency += this.state.clickPower;
        this.createClickText(event.clientX, event.clientY, \`+\${this.formatNumber(this.state.clickPower)}\`);

        // Bounce animation
        const mainBtn = document.getElementById('tycoon-main-btn');
        mainBtn.style.transform = 'scale(0.95)';
        setTimeout(() => mainBtn.style.transform = 'scale(1)', 50);

        this.updateUI();
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

    buyBuilding(id) {
        const building = this.config.buildings.find(b => b.id === id);
        const stateBuilding = this.state.buildings.find(ob => ob.id === id);
        const cost = this.getBuildingCost(building.baseCost, stateBuilding.count);

        if (this.state.currency >= cost) {
            this.state.currency -= cost;
            stateBuilding.count++;
            this.updateUI();
        }
    }

    buyClickUpgrade() {
        const cost = Math.floor(50 * Math.pow(1.5, this.state.clickUpgrades));
        if (this.state.currency >= cost) {
            this.state.currency -= cost;
            this.state.clickUpgrades++;
            this.state.clickPower *= 2;
            this.updateUI();
        }
    }

    initUI() {
        this.container.innerHTML = \`
            <div style="display:flex; height: 100%; width: 100%; max-width: 1000px; margin: 0 auto; gap: 20px; font-family: 'Nunito', sans-serif; background: rgba(0,0,0,0.4); border-radius: 20px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">

                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px;">
                    <h2 style="font-family: 'Fredoka One', cursive; font-size: 2rem; color: white; text-shadow: 2px 2px 0 \${this.config.colorTheme}; margin-bottom: 5px;">\${this.config.currencyName}</h2>
                    <div id="currency-display" style="font-size: 3rem; font-weight: bold; color: \${this.config.colorTheme};">0</div>
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
                    </div>

                    <h3 style="color: white; font-family: 'Fredoka One', cursive; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 10px; margin-top: 30px;">Gebäude</h3>

                    <div id="buildings-list"></div>
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
        document.getElementById('cps-display').innerText = this.formatNumber(this.calculateCPS()) + ' / sek';

        const clickCost = Math.floor(50 * Math.pow(1.5, this.state.clickUpgrades));
        const clickEl = document.getElementById('click-upgrade-btn');
        document.getElementById('click-upgrade-cost').innerText = this.formatNumber(clickCost);
        clickEl.style.background = this.state.currency >= clickCost ? 'rgba(52, 152, 219, 0.4)' : 'rgba(0,0,0,0.3)';

        this.config.buildings.forEach(b => {
            const stateB = this.state.buildings.find(ob => ob.id === b.id);
            const cost = this.getBuildingCost(b.baseCost, stateB.count);

            document.getElementById('cost-' + b.id).innerText = this.formatNumber(cost);
            document.getElementById('count-' + b.id).innerText = 'Besitz: ' + stateB.count;

            const el = document.getElementById('b-' + b.id);
            el.style.background = this.state.currency >= cost ? 'rgba(46, 204, 113, 0.3)' : 'rgba(0,0,0,0.3)';
        });
    }
}
window.TycoonEngine = TycoonEngine;
