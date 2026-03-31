const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const newTycoons = [];

const tycoonThemes = [
    { name: 'Pizza', icon: '🍕', currency: 'Pizza Coins', color: '#e74c3c', b: ['Ofen', 'Pizzeria', 'Lieferservice', 'Franchise'] },
    { name: 'Burger', icon: '🍔', currency: 'Burger Bucks', color: '#f39c12', b: ['Grill', 'Burger Bude', 'Drive-In', 'Mega Kette'] },
    { name: 'Space', icon: '🚀', currency: 'Star Credits', color: '#9b59b6', b: ['Teleskop', 'Rakete', 'Raumstation', 'Galaktische Flotte'] },
    { name: 'Zombie', icon: '🧟', currency: 'Gehirne', color: '#2ecc71', b: ['Grab', 'Friedhof', 'Labor', 'Apokalypse'] },
    { name: 'Tech', icon: '💻', currency: 'Bitcoins', color: '#3498db', b: ['Server', 'Rechenzentrum', 'Cloud', 'KI Matrix'] },
    { name: 'Bank', icon: '🏦', currency: 'Dollar', color: '#1abc9c', b: ['Tresor', 'Filiale', 'Zentralbank', 'Weltbank'] },
    { name: 'Farm', icon: '🚜', currency: 'Ernte', color: '#f1c40f', b: ['Feld', 'Scheune', 'Traktor', 'Agrarkonzern'] },
    { name: 'Mining', icon: '⛏️', currency: 'Diamanten', color: '#95a5a6', b: ['Spitzhacke', 'Minenschacht', 'Bagger', 'Tiefenbohrer'] },
    { name: 'Cookie', icon: '🍪', currency: 'Cookies', color: '#d35400', b: ['Oma', 'Keksfabrik', 'Keks-Mine', 'Keks-Planet'] },
    { name: 'Coffee', icon: '☕', currency: 'Bohnen', color: '#6e2c00', b: ['Röster', 'Café', 'Barista', 'Kaffee Imperium'] }
];

for (let i = 0; i < 50; i++) {
    const theme = tycoonThemes[Math.floor(Math.random() * tycoonThemes.length)];
    const title = `${theme.name} Tycoon ${Math.floor(Math.random() * 99)}`;
    const id = title.toLowerCase().replace(/ /g, '-');

    newTycoons.push({
        id, title,
        icon: theme.icon,
        category: 'strategy',
        gradient: `linear-gradient(135deg, #2c3e50, ${theme.color})`,
        config: {
            currencyName: theme.currency,
            icon: theme.icon,
            colorTheme: theme.color,
            clickPower: 1,
            buildings: [
                { id: 'b1', name: theme.b[0], baseCost: 15, cps: 1 },
                { id: 'b2', name: theme.b[1], baseCost: 150, cps: 12 },
                { id: 'b3', name: theme.b[2], baseCost: 1500, cps: 140 },
                { id: 'b4', name: theme.b[3], baseCost: 25000, cps: 2500 }
            ]
        }
    });
}

const template = (game) => `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${game.title} - Tycoon</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: ${game.gradient}; }
        .ingame-header { position: absolute; z-index: 200; top: 0; width: 100%; display: flex; justify-content: space-between; padding: 10px 20px; pointer-events: none; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); }
        .ingame-header > * { pointer-events: auto; }
        #game-container { position: absolute; top: 60px; left: 0; width: 100%; height: calc(100% - 60px); z-index: 10; overflow: hidden; padding: 20px; }
    </style>
</head>
<body>
    <div class="ingame-header">
        <a href="../index.html" class="back-btn" style="background: rgba(231, 76, 60, 0.8);">Portal</a>
        <h1 class="ingame-title" style="font-size: 1.5rem; padding: 5px 15px;">${game.title}</h1>
        <div class="ingame-controls">
            <button class="game-like-btn" id="inGameLikeBtn" title="Like this game">♡</button>
        </div>
    </div>

    <div id="game-container"></div>

    <script src="../js/user-system.js"></script>
    <script src="../js/engineTycoon.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const gameId = '${game.id}';
            const likeBtn = document.getElementById('inGameLikeBtn');
            window.userSystem = new window.UserSystem();

            if (window.userSystem.isLiked(gameId)) {
                likeBtn.classList.add('liked');
                likeBtn.innerHTML = '♥';
            }

            likeBtn.addEventListener('click', () => {
                const isLiked = window.userSystem.toggleLike(gameId);
                if (isLiked) {
                    likeBtn.classList.add('liked');
                    likeBtn.innerHTML = '♥';
                    window.userSystem.showToast('Spiel geliked! +5 XP');
                } else {
                    likeBtn.classList.remove('liked');
                    likeBtn.innerHTML = '♡';
                }
            });

            // Init Tycoon Engine
            const config = ${JSON.stringify(game.config)};
            window.tycoon = new TycoonEngine('game-container', config);
        });
    </script>
</body>
</html>`;

let count = 0;
newTycoons.forEach(game => {
    fs.writeFileSync(path.join(gamesDir, `${game.id}.html`), template(game));
    count++;
});

fs.writeFileSync('new_games_tycoon_meta.json', JSON.stringify(newTycoons, null, 4));

// Update main.js registry
let mainJs = fs.readFileSync('js/main.js', 'utf-8');
const newGamesArrayStr = newTycoons.map(game =>
    `    { id: '${game.id}', title: '${game.title}', category: '${game.category}', file: 'games/${game.id}.html', icon: '${game.icon}', gradient: '${game.gradient}' }`
).join(',\n');
const arrayEndIndex = mainJs.lastIndexOf('];');
if (arrayEndIndex !== -1) {
    const before = mainJs.substring(0, arrayEndIndex).trim();
    const comma = before.endsWith(',') ? '' : ',';
    mainJs = before + comma + '\n' + newGamesArrayStr + '\n];' + mainJs.substring(arrayEndIndex + 2);
    fs.writeFileSync('js/main.js', mainJs);
}

console.log(`Generated ${count} new Tycoon games and registered them.`);
