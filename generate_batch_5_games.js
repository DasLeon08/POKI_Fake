const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');

const newGamesBatch5 = [
    { id: 'neon-survivor', title: 'Neon Survivor', icon: '🏃', category: 'action', gradient: 'linear-gradient(135deg, #FF0099 0%, #493240 100%)' },
    { id: 'gem-shooter', title: 'Gem Shooter', icon: '💎', category: 'arcade', gradient: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)' },
    { id: 'space-drifter', title: 'Space Drifter', icon: '🚀', category: 'action', gradient: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
    { id: 'zombie-smash', title: 'Zombie Smash', icon: '🧟', category: 'arcade', gradient: 'linear-gradient(135deg, #0f9b0f 0%, #000000 100%)' },
    { id: 'hoop-hero', title: 'Hoop Hero', icon: '🏀', category: 'sports', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
    { id: 'tower-climb', title: 'Tower Climb', icon: '🧗', category: 'arcade', gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' },
    { id: 'samurai-dash', title: 'Samurai Dash', icon: '⚔️', category: 'action', gradient: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)' },
    { id: 'math-blaster', title: 'Math Blaster', icon: '🔢', category: 'puzzle', gradient: 'linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)' },
    { id: 'ninja-stealth', title: 'Ninja Stealth', icon: '🥷', category: 'action', gradient: 'linear-gradient(135deg, #000000 0%, #434343 100%)' },
    { id: 'drift-master', title: 'Drift Master', icon: '🏎️', category: 'racing', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'candy-pop', title: 'Candy Pop', icon: '🍬', category: 'puzzle', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { id: 'bowling-hero', title: 'Bowling Hero', icon: '🎳', category: 'sports', gradient: 'linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%)' },
    { id: 'alien-swarm', title: 'Alien Swarm', icon: '👽', category: 'action', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { id: 'word-finder', title: 'Word Finder', icon: '🔍', category: 'puzzle', gradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)' },
    { id: 'skate-legend', title: 'Skate Legend', icon: '🛹', category: 'sports', gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' },
    { id: 'tank-commander', title: 'Tank Commander', icon: '🪖', category: 'strategy', gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)' },
    { id: 'fruit-crush', title: 'Fruit Crush', icon: '🍉', category: 'arcade', gradient: 'linear-gradient(135deg, #ff4e50 0%, #f9d423 100%)' },
    { id: 'golf-pro', title: 'Golf Pro', icon: '⛳', category: 'sports', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
    { id: 'robot-defense', title: 'Robot Defense', icon: '🤖', category: 'action', gradient: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)' },
    { id: 'dino-hunter', title: 'Dino Hunter', icon: '🦖', category: 'action', gradient: 'linear-gradient(135deg, #dce35b 0%, #45b649 100%)' },
    { id: 'magic-runner', title: 'Magic Runner', icon: '🪄', category: 'arcade', gradient: 'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)' },
    { id: 'pirate-battle', title: 'Pirate Battle', icon: '🏴‍☠️', category: 'strategy', gradient: 'linear-gradient(135deg, #000000 0%, #53346D 100%)' },
    { id: 'burger-tycoon', title: 'Burger Tycoon', icon: '🍔', category: 'strategy', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
    { id: 'ice-hockey-2', title: 'Ice Hockey 2', icon: '🏒', category: 'sports', gradient: 'linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)' },
    { id: 'maze-runner', title: 'Maze Runner', icon: '🚪', category: 'arcade', gradient: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' },
    { id: 'sniper-pro', title: 'Sniper Pro', icon: '🎯', category: 'action', gradient: 'linear-gradient(135deg, #3E5151 0%, #DECBA4 100%)' },
    { id: 'farm-hero', title: 'Farm Hero', icon: '🚜', category: 'strategy', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
    { id: 'subway-runner', title: 'Subway Runner', icon: '🚇', category: 'arcade', gradient: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)' },
    { id: 'boxing-legend', title: 'Boxing Legend', icon: '🥊', category: 'sports', gradient: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)' },
    { id: 'color-crush', title: 'Color Crush', icon: '🧪', category: 'puzzle', gradient: 'linear-gradient(135deg, #c2e59c 0%, #64b3f4 100%)' },
    { id: 'dragon-slayer', title: 'Dragon Slayer', icon: '🐉', category: 'action', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'city-mayor', title: 'City Mayor', icon: '🏙️', category: 'strategy', gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' },
    { id: 'pinball-hero', title: 'Pinball Hero', icon: '🕹️', category: 'arcade', gradient: 'linear-gradient(135deg, #b20a2c 0%, #fffbd5 100%)' },
    { id: 'volleyball-pro', title: 'Volleyball Pro', icon: '🏐', category: 'sports', gradient: 'linear-gradient(135deg, #f79d00 0%, #64f38c 100%)' },
    { id: 'sudoku-genius', title: 'Sudoku Genius', icon: '📝', category: 'puzzle', gradient: 'linear-gradient(135deg, #e6dada 0%, #274046 100%)' },
    { id: 'space-invaders-4', title: 'Space Invaders 4', icon: '👾', category: 'action', gradient: 'linear-gradient(135deg, #000000 0%, #0f9b0f 100%)' },
    { id: 'chess-hero', title: 'Chess Hero', icon: '♟️', category: 'strategy', gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' },
    { id: 'whack-a-boss', title: 'Whack-a-Boss', icon: '🔨', category: 'arcade', gradient: 'linear-gradient(135deg, #8E54E9 0%, #4776E6 100%)' },
    { id: 'tennis-pro', title: 'Tennis Pro', icon: '🎾', category: 'sports', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { id: 'block-master', title: 'Block Master', icon: '🧱', category: 'puzzle', gradient: 'linear-gradient(135deg, #f85032 0%, #e73827 100%)' },
    { id: 'galaxy-defender', title: 'Galaxy Defender', icon: '🚀', category: 'action', gradient: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' },
    { id: 'army-general', title: 'Army General', icon: '🎖️', category: 'strategy', gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)' },
    { id: 'bubble-master', title: 'Bubble Master', icon: '🫧', category: 'arcade', gradient: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)' },
    { id: 'neon-racer', title: 'Neon Racer', icon: '🏎️', category: 'racing', gradient: 'linear-gradient(135deg, #FF0099 0%, #493240 100%)' },
    { id: 'gravity-fall', title: 'Gravity Fall', icon: '🌌', category: 'arcade', gradient: 'linear-gradient(135deg, #30CFD0 0%, #330867 100%)' },
    { id: 'crystal-crush', title: 'Crystal Crush', icon: '⛏️', category: 'puzzle', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    { id: 'laser-shooter', title: 'Laser Shooter', icon: '🔫', category: 'action', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'aqua-dash', title: 'Aqua Dash', icon: '🌊', category: 'arcade', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'desert-racer', title: 'Desert Racer', icon: '🌪️', category: 'racing', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'cyber-runner', title: 'Cyber Runner', icon: '🏃', category: 'arcade', gradient: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }
];

const template = (id, title) => `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="../style.css">
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="ingame-header">
        <a href="../index.html" class="back-btn">Zurück zum Portal</a>
        <h1 class="ingame-title">${title}</h1>
        <div class="ingame-controls">
            <button class="game-like-btn" id="inGameLikeBtn" title="Like this game">♡</button>
        </div>
    </div>
    <div class="game-container">
        <!-- Upgraded mechanics injected globally later -->
        <canvas id="gameCanvas" width="800" height="600"></canvas>
    </div>

    <script src="../js/user-system.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const gameId = '${id}';
            const likeBtn = document.getElementById('inGameLikeBtn');
            const userSystem = new window.UserSystem();

            if (userSystem.isLiked(gameId)) {
                likeBtn.classList.add('liked');
                likeBtn.innerHTML = '♥';
            }

            likeBtn.addEventListener('click', () => {
                const isLiked = userSystem.toggleLike(gameId);
                if (isLiked) {
                    likeBtn.classList.add('liked');
                    likeBtn.innerHTML = '♥';
                    userSystem.showToast('Spiel geliked! +5 XP');
                } else {
                    likeBtn.classList.remove('liked');
                    likeBtn.innerHTML = '♡';
                }
            });
        });
    </script>
</body>
</html>`;

newGamesBatch5.forEach(game => {
    fs.writeFileSync(path.join(gamesDir, `${game.id}.html`), template(game.id, game.title));
});

// Write the metadata to a file so we can inject it into main.js
fs.writeFileSync('new_games_batch_5_meta.json', JSON.stringify(newGamesBatch5, null, 4));

// Update main.js directly here to save a step
const mainJsPath = 'js/main.js';
let mainJs = fs.readFileSync(mainJsPath, 'utf-8');

const newGamesArrayStr = newGamesBatch5.map(game =>
    `    { id: '${game.id}', title: '${game.title}', category: '${game.category}', file: 'games/${game.id}.html', icon: '${game.icon}', gradient: '${game.gradient}' }`
).join(',\n');

const arrayEndIndex = mainJs.lastIndexOf('];');
if (arrayEndIndex !== -1) {
    const before = mainJs.substring(0, arrayEndIndex).trim();
    const comma = before.endsWith(',') ? '' : ',';
    mainJs = before + comma + '\n' + newGamesArrayStr + '\n];' + mainJs.substring(arrayEndIndex + 2);
    fs.writeFileSync(mainJsPath, mainJs);
}

console.log(`Generated and registered ${newGamesBatch5.length} new games. (Batch 5)`);
