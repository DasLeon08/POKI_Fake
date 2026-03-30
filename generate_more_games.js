const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');

const newGames = [
    { id: 'neon-rider', title: 'Neon Rider', icon: '🏍️', category: 'racing', gradient: 'linear-gradient(135deg, #FF0099 0%, #493240 100%)' },
    { id: 'gem-crush', title: 'Gem Crush', icon: '💎', category: 'puzzle', gradient: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)' },
    { id: 'space-miner', title: 'Space Miner', icon: '⛏️', category: 'arcade', gradient: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
    { id: 'zombie-defense', title: 'Zombie Defense', icon: '🧟', category: 'strategy', gradient: 'linear-gradient(135deg, #0f9b0f 0%, #000000 100%)' },
    { id: 'basketball-stars', title: 'Hoop Stars', icon: '🏀', category: 'sports', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
    { id: 'tower-builder', title: 'Tower Builder', icon: '🏗️', category: 'arcade', gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' },
    { id: 'samurai-slash', title: 'Samurai Slash', icon: '⚔️', category: 'action', gradient: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)' },
    { id: 'math-genius', title: 'Math Genius', icon: '🔢', category: 'puzzle', gradient: 'linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)' },
    { id: 'ninja-jump', title: 'Ninja Jump', icon: '🥷', category: 'action', gradient: 'linear-gradient(135deg, #000000 0%, #434343 100%)' },
    { id: 'drift-king', title: 'Drift King', icon: '🏎️', category: 'racing', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'candy-match', title: 'Candy Match', icon: '🍬', category: 'puzzle', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
    { id: 'bowling-pro', title: 'Bowling Pro', icon: '🎳', category: 'sports', gradient: 'linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%)' },
    { id: 'alien-attack', title: 'Alien Attack', icon: '👽', category: 'action', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { id: 'word-search', title: 'Word Search', icon: '🔍', category: 'puzzle', gradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)' },
    { id: 'skate-hero', title: 'Skate Hero', icon: '🛹', category: 'sports', gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' },
    { id: 'tank-war', title: 'Tank War', icon: '🪖', category: 'strategy', gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)' },
    { id: 'fruit-slice', title: 'Fruit Slice', icon: '🍉', category: 'arcade', gradient: 'linear-gradient(135deg, #ff4e50 0%, #f9d423 100%)' },
    { id: 'golf-putt', title: 'Golf Putt', icon: '⛳', category: 'sports', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
    { id: 'robot-factory', title: 'Robot Factory', icon: '🤖', category: 'puzzle', gradient: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)' },
    { id: 'dino-run', title: 'Dino Run', icon: '🦖', category: 'arcade', gradient: 'linear-gradient(135deg, #dce35b 0%, #45b649 100%)' },
    { id: 'magic-spells', title: 'Magic Spells', icon: '🪄', category: 'action', gradient: 'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)' },
    { id: 'pirate-ship', title: 'Pirate Ship', icon: '🏴‍☠️', category: 'strategy', gradient: 'linear-gradient(135deg, #000000 0%, #53346D 100%)' },
    { id: 'burger-shop', title: 'Burger Shop', icon: '🍔', category: 'arcade', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
    { id: 'ice-hockey', title: 'Ice Hockey', icon: '🏒', category: 'sports', gradient: 'linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)' },
    { id: 'maze-escape', title: 'Maze Escape', icon: '🚪', category: 'puzzle', gradient: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' },
    { id: 'sniper-elite', title: 'Sniper Elite', icon: '🎯', category: 'action', gradient: 'linear-gradient(135deg, #3E5151 0%, #DECBA4 100%)' },
    { id: 'farm-life', title: 'Farm Life', icon: '🚜', category: 'strategy', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
    { id: 'subway-surfer', title: 'Subway Surfer', icon: '🚇', category: 'arcade', gradient: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)' },
    { id: 'boxing-champ', title: 'Boxing Champ', icon: '🥊', category: 'sports', gradient: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)' },
    { id: 'color-sort', title: 'Color Sort', icon: '🧪', category: 'puzzle', gradient: 'linear-gradient(135deg, #c2e59c 0%, #64b3f4 100%)' },
    { id: 'dragon-flight', title: 'Dragon Flight', icon: '🐉', category: 'action', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
    { id: 'city-builder', title: 'City Builder', icon: '🏙️', category: 'strategy', gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' },
    { id: 'pinball-wizard', title: 'Pinball Wizard', icon: '🕹️', category: 'arcade', gradient: 'linear-gradient(135deg, #b20a2c 0%, #fffbd5 100%)' },
    { id: 'volleyball', title: 'Volleyball', icon: '🏐', category: 'sports', gradient: 'linear-gradient(135deg, #f79d00 0%, #64f38c 100%)' },
    { id: 'sudoku-master', title: 'Sudoku Master', icon: '📝', category: 'puzzle', gradient: 'linear-gradient(135deg, #e6dada 0%, #274046 100%)' },
    { id: 'space-invaders-2', title: 'Space Invaders 2', icon: '👾', category: 'action', gradient: 'linear-gradient(135deg, #000000 0%, #0f9b0f 100%)' },
    { id: 'chess-club', title: 'Chess Club', icon: '♟️', category: 'strategy', gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' },
    { id: 'whack-a-mole', title: 'Whack-a-Mole', icon: '🔨', category: 'arcade', gradient: 'linear-gradient(135deg, #8E54E9 0%, #4776E6 100%)' },
    { id: 'tennis-smash', title: 'Tennis Smash', icon: '🎾', category: 'sports', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { id: 'block-puzzle', title: 'Block Puzzle', icon: '🧱', category: 'puzzle', gradient: 'linear-gradient(135deg, #f85032 0%, #e73827 100%)' },
    { id: 'galaxy-shooter', title: 'Galaxy Shooter', icon: '🚀', category: 'action', gradient: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' },
    { id: 'army-commander', title: 'Army Commander', icon: '🎖️', category: 'strategy', gradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)' },
    { id: 'bubble-shooter', title: 'Bubble Shooter', icon: '🫧', category: 'arcade', gradient: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)' }
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
        <h2>${title}</h2>
        <p>Ein brandneues HTML5-Spiel!</p>
        <canvas id="gameCanvas" width="800" height="600"></canvas>
    </div>

    <script src="../js/user-system.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const gameId = '${id}';
            const likeBtn = document.getElementById('inGameLikeBtn');
            const userSystem = new UserSystem();

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

            // Basic Canvas rendering to make it look active
            const canvas = document.getElementById('gameCanvas');
            const ctx = canvas.getContext('2d');

            let x = canvas.width / 2;
            let y = canvas.height / 2;
            let dx = 4;
            let dy = -4;
            let hue = 0;

            function draw() {
                ctx.fillStyle = 'rgba(26, 37, 47, 0.2)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.beginPath();
                ctx.arc(x, y, 30, 0, Math.PI*2);
                ctx.fillStyle = \`hsl(\${hue}, 100%, 50%)\`;
                ctx.fill();
                ctx.shadowBlur = 20;
                ctx.shadowColor = \`hsl(\${hue}, 100%, 50%)\`;
                ctx.closePath();

                if(x + dx > canvas.width - 30 || x + dx < 30) dx = -dx;
                if(y + dy > canvas.height - 30 || y + dy < 30) dy = -dy;

                x += dx;
                y += dy;
                hue = (hue + 2) % 360;

                requestAnimationFrame(draw);
            }
            draw();

            // Randomly award XP for playing
            setInterval(() => {
                if (Math.random() > 0.7) {
                    userSystem.addXP(10);
                }
            }, 10000);
        });
    </script>
</body>
</html>`;

newGames.forEach(game => {
    fs.writeFileSync(path.join(gamesDir, `${game.id}.html`), template(game.id, game.title));
});

// Write the metadata to a file so we can inject it into main.js
fs.writeFileSync('new_games_meta.json', JSON.stringify(newGames, null, 4));

console.log(`Generated ${newGames.length} new games.`);
