const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');
const newGames3D = [];
const biomes = ['neon', 'desert', 'ice', 'mars', 'toxic'];
const prefixes = ['Arena', 'Zone', 'Base', 'World', 'Sector', 'Dimension', 'Realm', 'Station', 'Outpost', 'Nexus'];
const suffixes = ['Alpha', 'Beta', 'Omega', 'Prime', 'Zero', 'X', '7', 'Elite', 'Pro', 'Max'];

for (let i = 0; i < 100; i++) {
    const biome = biomes[Math.floor(Math.random() * biomes.length)];
    const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
    const title = `${biome.charAt(0).toUpperCase() + biome.slice(1)} ${pre} ${suf}`;
    const id = title.toLowerCase().replace(/ /g, '-');

    let icon = '🔫';
    let gradient = '';
    if (biome === 'neon') { icon = '⚡'; gradient = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'; }
    if (biome === 'desert') { icon = '🏜️'; gradient = 'linear-gradient(135deg, #c2b280, #8b5a2b)'; }
    if (biome === 'ice') { icon = '❄️'; gradient = 'linear-gradient(135deg, #a5f2f3, #87ceeb)'; }
    if (biome === 'mars') { icon = '🔴'; gradient = 'linear-gradient(135deg, #8c3b2d, #5c2b20)'; }
    if (biome === 'toxic') { icon = '☣️'; gradient = 'linear-gradient(135deg, #1f2e1a, #7fff00)'; }

    newGames3D.push({
        id,
        title,
        icon,
        category: 'action', // these are all 3D shooters
        gradient,
        config: {
            biome,
            gravity: 0.015 + (Math.random() * 0.01),
            botCount: 10 + Math.floor(Math.random() * 20),
            jumpForce: 0.2 + (Math.random() * 0.2),
            speed: 0.15 + (Math.random() * 0.1),
            weaponDamage: 20 + Math.floor(Math.random() * 30),
            maxHealth: 100 + Math.floor(Math.random() * 100),
            worldSize: 150 + Math.floor(Math.random() * 150)
        }
    });
}

const template = (game) => `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${game.title} - 3D Multiplayer Arena</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
        .ingame-header { position: absolute; z-index: 200; top: 0; width: 100%; display: flex; justify-content: space-between; padding: 10px 20px; pointer-events: none; }
        .ingame-header > * { pointer-events: auto; }
        #game-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; cursor: crosshair; }

        /* Start Screen */
        #start-screen { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 300; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-family: 'Fredoka One', cursive; text-align: center; }
        #start-screen h1 { font-size: 4rem; text-shadow: 0 5px 15px ${game.gradient.split(',')[1] || 'rgba(0,0,0,0.5)'}; margin-bottom: 20px; }
        #start-screen p { font-family: 'Nunito', sans-serif; font-size: 1.2rem; max-width: 600px; margin-bottom: 30px; line-height: 1.6; }
        .start-btn { padding: 15px 40px; font-size: 1.5rem; background: ${game.gradient}; color: white; border: none; border-radius: 30px; cursor: pointer; transition: transform 0.2s; font-family: 'Fredoka One', cursive; box-shadow: 0 5px 20px rgba(0,0,0,0.5); }
        .start-btn:hover { transform: scale(1.1); }
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

    <div id="start-screen">
        <h1>${game.title}</h1>
        <p>Willkommen in der ${game.config.biome} Arena!<br>Du trittst gegen ${game.config.botCount} globale Spieler an.<br><br><b>Steuerung:</b> W A S D zum Bewegen. Maus zum Zielen und Schießen (Linksklick). LEERTASTE zum Springen. E für den Upgrade-Shop.</p>
        <button class="start-btn" id="startBtn">SPIELEN (Pointer Lock)</button>
    </div>

    <div id="game-container"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="../js/user-system.js"></script>
    <script src="../js/engine3d.js"></script>
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

            document.getElementById('startBtn').addEventListener('click', () => {
                document.getElementById('start-screen').style.display = 'none';

                const config = ${JSON.stringify(game.config)};
                window.gameEngine = new GameEngine3D('game-container', config);

                // Set initial pointer lock
                document.body.requestPointerLock();
            });
        });
    </script>
</body>
</html>`;

let count = 0;
newGames3D.forEach(game => {
    // Avoid overwriting existing generic games if ids collide
    if (!fs.existsSync(path.join(gamesDir, `${game.id}.html`))) {
        fs.writeFileSync(path.join(gamesDir, `${game.id}.html`), template(game));
        count++;
    }
});

fs.writeFileSync('new_games_3d_meta.json', JSON.stringify(newGames3D, null, 4));
console.log(`Generated ${count} new highly replayable 3D multiplayer games.`);
