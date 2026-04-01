// User System Logic

const XP_PER_LEVEL = 100;

// Default User State
const defaultUser = {
    username: "Gastspieler",
    level: 1,
    xp: 0,
    coins: 50,
    avatar: "👤",
    title: "Anfänger",
    ownedAvatars: ["👤"],
    ownedTitles: ["Anfänger"],
    gamesPlayed: 0,
    quests: [
        { id: 1, title: "Spiele 3 Spiele", target: 3, progress: 0, reward: 50, completed: false },
        { id: 2, title: "Erreiche Level 2", target: 1, progress: 0, reward: 100, completed: false },
        { id: 3, title: "Kaufe ein Item", target: 1, progress: 0, reward: 20, completed: false }
    ],
    friends: [
        { name: "Max Mustermann", status: "Online", level: 5 },
        { name: "GamerGirl99", status: "Offline", level: 12 },
        { name: "ProPlayer", status: "Online", level: 8 }
    ]
};

// Shop Items
const shopItems = [
    { id: 'av1', type: 'avatar', name: 'Cooler Typ', icon: '😎', price: 100 },
    { id: 'av2', type: 'avatar', name: 'Ninja', icon: '🥷', price: 250 },
    { id: 'av3', type: 'avatar', name: 'Roboter', icon: '🤖', price: 500 },
    { id: 'ti1', type: 'title', name: 'Gamer', icon: 'Gamer', price: 150 },
    { id: 'ti2', type: 'title', name: 'Meister', icon: 'Meister', price: 300 },
    { id: 'ti3', type: 'title', name: 'Legende', icon: 'Legende', price: 1000 }
];

// Mock Leaderboard
const leaderboardData = [
    { rank: 1, name: "GottGamer", level: 50, avatar: "👑" },
    { rank: 2, name: "SpeedRunner", level: 45, avatar: "⚡" },
    { rank: 3, name: "CasualPro", level: 42, avatar: "🎯" },
    { rank: 4, name: "Du", level: 1, avatar: "👤", isUser: true }, // Will be updated
    { rank: 5, name: "NoobMaster", level: 10, avatar: "🐢" }
];

class UserSystem {
    constructor() {
        this.loadUser();
        this.initUI();
        this.updateUI();
    }

    loadUser() {
        const saved = localStorage.getItem('poki_user_data');
        if (saved) {
            this.user = JSON.parse(saved);
            // Merge new fields if updating from old version
            this.user = { ...defaultUser, ...this.user };
        } else {
            this.user = JSON.parse(JSON.stringify(defaultUser));
            this.saveUser();
        }
    }

    saveUser() {
        localStorage.setItem('poki_user_data', JSON.stringify(this.user));
    }

    addXP(amount) {
        this.updateQuestProgress('q2', amount);
        this.user.xp += amount;
        let leveledUp = false;

        while (this.user.xp >= XP_PER_LEVEL * this.user.level) {
            this.user.xp -= XP_PER_LEVEL * this.user.level;
            this.user.level++;
            leveledUp = true;
        }

        if (leveledUp) {
            this.showNotification(`Level Up! Du bist jetzt Level ${this.user.level}!`, 'success');
            this.updateQuestProgress(2, 1); // "Erreiche Level X" logic could be more complex, keeping simple
        }

        this.saveUser();
        this.updateUI();
    }

    addCoins(amount) {
        this.user.coins += amount;
        this.saveUser();
        this.updateUI();
    }

    buyItem(item) {
        if (this.user.coins >= item.price) {
            if (item.type === 'avatar' && !this.user.ownedAvatars.includes(item.icon)) {
                this.user.coins -= item.price;
                this.user.ownedAvatars.push(item.icon);
                this.user.avatar = item.icon; // Auto equip
                this.updateQuestProgress(3, 1);
                this.showNotification(`Erfolgreich gekauft: ${item.name}`, 'success');
            } else if (item.type === 'title' && !this.user.ownedTitles.includes(item.icon)) {
                this.user.coins -= item.price;
                this.user.ownedTitles.push(item.icon);
                this.user.title = item.icon; // Auto equip
                this.updateQuestProgress(3, 1);
                this.showNotification(`Erfolgreich gekauft: ${item.name}`, 'success');
            } else {
                 this.showNotification(`Du besitzt dieses Item bereits.`, 'error');
                 return;
            }
            this.saveUser();
            this.updateUI();
            this.renderShop(); // Re-render to update UI buttons
            this.renderProfile();
        } else {
            this.showNotification('Nicht genug Münzen!', 'error');
        }
    }

    updateQuestProgress(questId, amount) {
        const quest = this.user.quests.find(q => q.id === questId);
        if (quest && !quest.completed) {
            quest.progress += amount;
            if (quest.progress >= quest.target) {
                quest.progress = quest.target;
                quest.completed = true;
                this.addCoins(quest.reward);
                this.showNotification(`Quest abgeschlossen: ${quest.title} (+${quest.reward}💰)`, 'success');
            }
            this.saveUser();
            this.renderQuests(); // Update UI if open
        }
    }

    playGame() {
        this.user.gamesPlayed++;
        this.addXP(20);
        this.addCoins(10);
        this.updateQuestProgress(1, 1);
        this.saveUser();
    }

    // UI Updates
    initUI() {
        // Setup modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal-overlay').style.display = 'none';
            });
        });

        // Setup Nav buttons (if they exist)
        const navProfile = document.getElementById('nav-profile');
        if (navProfile) navProfile.addEventListener('click', () => this.openModal('modal-profile'));
        const navQuests = document.getElementById('nav-quests');
        if (navQuests) navQuests.addEventListener('click', () => this.openModal('modal-quests'));
        const navShop = document.getElementById('nav-shop');
        if (navShop) navShop.addEventListener('click', () => this.openModal('modal-shop'));
        const navLeaderboard = document.getElementById('nav-leaderboard');
        if (navLeaderboard) navLeaderboard.addEventListener('click', () => this.openModal('modal-leaderboard'));
        const navFriends = document.getElementById('nav-friends');
        if (navFriends) navFriends.addEventListener('click', () => this.openModal('modal-friends'));

        // Bind game links to add XP
        document.querySelectorAll('.game-tile').forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't prevent default, just log the play before navigating
                this.playGame();
            });
        });

        // Setup Filters
        const filterBtns = document.querySelectorAll('.filter-btn');
        const gameTiles = document.querySelectorAll('.game-tile');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                gameTiles.forEach(tile => {
                    if (filter === 'all') {
                        tile.style.display = 'flex'; // Reset to flex (since it's a flex container in CSS)
                    } else {
                        const categories = tile.getAttribute('data-category');
                        if (categories && categories.includes(filter)) {
                            tile.style.display = 'flex';
                        } else {
                            tile.style.display = 'none';
                        }
                    }
                });
            });
        });
    }

    updateUI() {
        const avatarEl = document.getElementById('ui-avatar');
        if (avatarEl) avatarEl.innerText = this.user.avatar;

        const levelEl = document.getElementById('ui-level');
        if (levelEl) levelEl.innerText = `Lvl ${this.user.level}`;

        const coinsEl = document.getElementById('ui-coins');
        if (coinsEl) coinsEl.innerText = `${this.user.coins} 💰`;

        const xpRequired = XP_PER_LEVEL * this.user.level;
        const xpPercent = (this.user.xp / xpRequired) * 100;
        const xpFillEl = document.getElementById('ui-xp-fill');
        if (xpFillEl) xpFillEl.style.width = `${xpPercent}%`;
    }

    openModal(modalId) {
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            if (modalId === 'modal-profile') this.renderProfile();
            if (modalId === 'modal-shop') this.renderShop();
            if (modalId === 'modal-quests') this.renderQuests();
            if (modalId === 'modal-leaderboard') this.renderLeaderboard();
            if (modalId === 'modal-friends') this.renderFriends();
        }
    }

    renderProfile() {
        const content = document.getElementById('profile-content');
        if (!content) return;
        content.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar-large">${this.user.avatar}</div>
                <div>
                    <h2>${this.user.username}</h2>
                    <span class="profile-title">${this.user.title}</span>
                </div>
            </div>
            <div class="profile-stats">
                <div class="stat-box">
                    <h3>Level</h3>
                    <p>${this.user.level}</p>
                </div>
                <div class="stat-box">
                    <h3>Gespielt</h3>
                    <p>${this.user.gamesPlayed}</p>
                </div>
                <div class="stat-box">
                    <h3>Münzen</h3>
                    <p>${this.user.coins}</p>
                </div>
            </div>
        `;
    }

    renderShop() {
        const content = document.getElementById('shop-content');
        if (!content) return;
        content.innerHTML = '';
        shopItems.forEach(item => {
            const isOwned = (item.type === 'avatar' && this.user.ownedAvatars.includes(item.icon)) ||
                            (item.type === 'title' && this.user.ownedTitles.includes(item.icon));

            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <div class="shop-icon">${item.icon}</div>
                <div class="shop-info">
                    <h4>${item.name}</h4>
                    <span class="shop-price">${item.price} 💰</span>
                </div>
                <button class="shop-btn" ${isOwned ? 'disabled' : ''}>${isOwned ? 'Im Besitz' : 'Kaufen'}</button>
            `;

            if (!isOwned) {
                div.querySelector('button').addEventListener('click', () => this.buyItem(item));
            } else {
                 div.querySelector('button').style.backgroundColor = '#95a5a6';
            }

            content.appendChild(div);
        });
    }

    renderQuests() {
        const content = document.getElementById('quests-content');
        if (!content) return;
        content.innerHTML = '';
        this.user.quests.forEach(quest => {
            const pct = Math.min((quest.progress / quest.target) * 100, 100);
            const div = document.createElement('div');
            div.className = `quest-item ${quest.completed ? 'completed' : ''}`;
            div.innerHTML = `
                <div class="quest-info">
                    <h4>${quest.title}</h4>
                    <span>Belohnung: ${quest.reward} 💰</span>
                </div>
                <div class="quest-progress">
                    <div class="quest-bar"><div class="quest-fill" style="width: ${pct}%"></div></div>
                    <span>${quest.progress}/${quest.target}</span>
                </div>
            `;
            content.appendChild(div);
        });
    }

    renderLeaderboard() {
        const content = document.getElementById('leaderboard-content');
        if (!content) return;
        content.innerHTML = '';

        // Update user rank logic
        let data = [...leaderboardData];
        const userEntry = data.find(d => d.isUser);
        if (userEntry) {
            userEntry.level = this.user.level;
            userEntry.avatar = this.user.avatar;
            userEntry.name = this.user.username;
        }

        data.sort((a, b) => b.level - a.level);
        data.forEach((entry, i) => entry.rank = i + 1);

        data.forEach(entry => {
            const div = document.createElement('div');
            div.className = `leaderboard-item ${entry.isUser ? 'highlight' : ''}`;
            div.innerHTML = `
                <span class="lb-rank">#${entry.rank}</span>
                <span class="lb-avatar">${entry.avatar}</span>
                <span class="lb-name">${entry.name}</span>
                <span class="lb-level">Lvl ${entry.level}</span>
            `;
            content.appendChild(div);
        });
    }

    renderFriends() {
        const content = document.getElementById('friends-content');
        if (!content) return;
        content.innerHTML = '';
        this.user.friends.forEach(friend => {
            const div = document.createElement('div');
            div.className = 'friend-item';
            div.innerHTML = `
                <div class="friend-info">
                    <h4>${friend.name}</h4>
                    <span class="friend-level">Level ${friend.level}</span>
                </div>
                <span class="friend-status ${friend.status.toLowerCase()}">${friend.status}</span>
            `;
            content.appendChild(div);
        });
    }

    showNotification(msg, type='info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerText = msg;
        document.body.appendChild(toast);

        // Trigger reflow
        void toast.offsetWidth;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.userSystem = new UserSystem();
});
