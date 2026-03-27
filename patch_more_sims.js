const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const moreSimGamesHTML = `
            <a href="games/submarine-explorer.html" class="game-tile" data-category="simulation" style="background: linear-gradient(135deg, #001f3f, #3498db);">
                <div class="game-icon">🤿</div>
                <div class="game-info">
                    <h2>Submarine Explorer</h2>
                </div>
            </a>
            <a href="games/space-docking.html" class="game-tile" data-category="simulation" style="background: linear-gradient(135deg, #0b0c10, #66fcf1);">
                <div class="game-icon">🛰️</div>
                <div class="game-info">
                    <h2>Space Docking Sim</h2>
                </div>
            </a>
            <a href="games/crane-operator.html" class="game-tile" data-category="simulation" style="background: linear-gradient(135deg, #f1c40f, #e67e22);">
                <div class="game-icon">🏗️</div>
                <div class="game-info">
                    <h2>Crane Operator</h2>
                </div>
            </a>
            <a href="games/traffic-controller.html" class="game-tile" data-category="simulation" style="background: linear-gradient(135deg, #2ecc71, #e74c3c);">
                <div class="game-icon">🚦</div>
                <div class="game-info">
                    <h2>Traffic Controller</h2>
                </div>
            </a>
`;

// Insert after Train Dispatcher
const targetString = '<div class="game-info">\n                    <h2>Train Dispatcher</h2>\n                </div>\n            </a>';
if (indexContent.includes(targetString) && !indexContent.includes('Submarine Explorer')) {
    indexContent = indexContent.replace(targetString, targetString + '\n' + moreSimGamesHTML);
}

fs.writeFileSync(indexPath, indexContent);
console.log('index.html updated successfully with more simulation games.');