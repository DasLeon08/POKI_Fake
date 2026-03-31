const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const newGames = [];

const shmupColors = ['#00ffff', '#ff00ff', '#ffff00', '#ff0000', '#00ff00', '#0000ff', '#ffffff'];
const shmupNames = ['Galaxy', 'Star', 'Astro', 'Cosmic', 'Void', 'Nebula', 'Nova', 'Quasar', 'Pulsar', 'Meteor'];

for (let i = 0; i < 100; i++) {
    const title = `${shmupNames[Math.floor(Math.random() * shmupNames.length)]} Shooter ${Math.floor(Math.random() * 999)}`;
    const id = title.toLowerCase().replace(/ /g, '-');
    const color = shmupColors[Math.floor(Math.random() * shmupColors.length)];

    newGames.push({
        id, title,
        icon: '🚀',
        category: 'action',
        gradient: `linear-gradient(135deg, #0a0a1a, ${color})`,
        type: 'shmup',
        config: {
            themeColor: color,
            playerSpeed: 5 + Math.random() * 3,
            fireRate: Math.floor(6 + Math.random() * 6),
            enemySpeedMult: 0.8 + Math.random() * 0.5,
            enemySpawnRate: Math.floor(50 + Math.random() * 30)
        }
    });
}

const platNames = ['Runner', 'Dash', 'Jump', 'Leap', 'Sprint', 'Bound', 'Rush', 'Flip', 'Bounce', 'Vault'];
const bgColors = ['#2c3e50', '#8e44ad', '#2980b9', '#c0392b', '#16a085'];
const playerColors = ['#f1c40f', '#e74c3c', '#2ecc71', '#3498db', '#9b59b6'];

for (let i = 0; i < 100; i++) {
    const title = `Gravity ${platNames[Math.floor(Math.random() * platNames.length)]} ${Math.floor(Math.random() * 999)}`;
    const id = title.toLowerCase().replace(/ /g, '-');
    const bg = bgColors[Math.floor(Math.random() * bgColors.length)];
    const pc = playerColors[Math.floor(Math.random() * playerColors.length)];

    newGames.push({
        id, title,
        icon: '🏃',
        category: 'arcade',
        gradient: `linear-gradient(135deg, ${bg}, ${pc})`,
        type: 'platformer',
        config: {
            bgColor: bg,
            groundColor: '#1a252f', // darker than bg
            playerColor: pc,
            gameSpeed: 4 + Math.random() * 3,
            gravity: 0.5 + Math.random() * 0.3,
            jumpForce: -10 - Math.random() * 5
        }
    });
}

const template = (game) => `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${game.title}</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: ${game.gradient}; overflow: hidden; }
        .ingame-header { position: absolute; z-index: 200; top: 0; width: 100%; display: flex; justify-content: space-between; padding: 10px 20px; pointer-events: none; background: rgba(0,0,0,0.3); backdrop-filter: blur(2px); }
        .ingame-header > * { pointer-events: auto; }
        #game-container { position: absolute; top: 60px; left: 0; width: 100%; height: calc(100% - 60px); z-index: 10; display: flex; justify-content: center; align-items: center; }
        canvas { max-width: 100%; max-height: 100%; box-shadow: 0 0 50px rgba(0,0,0,0.5); }
    </style>
</head>
<body>
    <div class="ingame-header">
        <a href="../index.html" class="back-btn">Portal</a>
        <h1 class="ingame-title" style="font-size: 1.5rem; padding: 5px 15px;">${game.title}</h1>
        <div class="ingame-controls">
            <button class="game-like-btn" id="inGameLikeBtn" title="Like this game">♡</button>
        </div>
    </div>

    <div id="game-container">
        <canvas id="gameCanvas" width="${game.type === 'shmup' ? '600' : '800'}" height="${game.type === 'shmup' ? '800' : '600'}"></canvas>
    </div>

    <script src="../js/user-system.js"></script>
    <script src="../js/${game.type === 'shmup' ? 'engineShmup.js' : 'enginePlatformer.js'}"></script>
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

            // Init Engine
            const config = ${JSON.stringify(game.config)};
            if ('${game.type}' === 'shmup') {
                window.gameEngine = new ShmupEngine('gameCanvas', config);
            } else {
                window.gameEngine = new PlatformerEngine('gameCanvas', config);
            }
        });
    </script>
</body>
</html>`;

let count = 0;
newGames.forEach(game => {
    fs.writeFileSync(path.join(gamesDir, `${game.id}.html`), template(game));
    count++;
});

fs.writeFileSync('new_games_shmup_plat_meta.json', JSON.stringify(newGames, null, 4));

// Update main.js registry directly
let mainJs = fs.readFileSync('js/main.js', 'utf-8');
const newGamesArrayStr = newGames.map(game =>
    `    { id: '${game.id}', title: '${game.title}', category: '${game.category}', file: 'games/${game.id}.html', icon: '${game.icon}', gradient: '${game.gradient}' }`
).join(',\n');
const arrayEndIndex = mainJs.lastIndexOf('];');
if (arrayEndIndex !== -1) {
    const before = mainJs.substring(0, arrayEndIndex).trim();
    const comma = before.endsWith(',') ? '' : ',';
    mainJs = before + comma + '\n' + newGamesArrayStr + '\n];' + mainJs.substring(arrayEndIndex + 2);
    fs.writeFileSync('js/main.js', mainJs);
}

console.log(`Generated ${count} new Shmup and Platformer games and registered them.`);
