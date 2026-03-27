const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const exoticGamesHTML = `
            <!-- Exotic Games -->
            <a href="games/space-sushi.html" class="game-tile" data-category="exotic" style="background: linear-gradient(135deg, #0b0c10, #ff4757);">
                <div class="game-icon">🍱</div>
                <div class="game-info">
                    <h2>Space Sushi</h2>
                </div>
            </a>
            <a href="games/llama-spit.html" class="game-tile" data-category="exotic" style="background: linear-gradient(135deg, #87CEEB, #27ae60);">
                <div class="game-icon">🦙</div>
                <div class="game-info">
                    <h2>Llama Spit Sniper</h2>
                </div>
            </a>
            <a href="games/chameleon-run.html" class="game-tile" data-category="exotic" style="background: linear-gradient(135deg, #3498db, #e74c3c);">
                <div class="game-icon">🦎</div>
                <div class="game-info">
                    <h2>Chameleon Run</h2>
                </div>
            </a>
            <a href="games/cheese-rolling.html" class="game-tile" data-category="exotic" style="background: linear-gradient(135deg, #f1c40f, #e67e22);">
                <div class="game-icon">🧀</div>
                <div class="game-info">
                    <h2>Cheese Rolling</h2>
                </div>
            </a>
`;

// Insert after Gravity Racer
const targetString = '<div class="game-info">\n                    <h2>Gravity Racer</h2>\n                </div>\n            </a>';
if (indexContent.includes(targetString) && !indexContent.includes('Space Sushi')) {
    indexContent = indexContent.replace(targetString, targetString + '\n' + exoticGamesHTML);
}

// Add filter category
const categoryTarget = '<button class="filter-btn" data-category="multiplayer">Mehrspieler</button>';
const categoryHTML = '\n                <button class="filter-btn" data-category="exotic">Exotisch</button>';

if (indexContent.includes(categoryTarget) && !indexContent.includes('data-category="exotic"')) {
    indexContent = indexContent.replace(categoryTarget, categoryTarget + categoryHTML);
}

fs.writeFileSync(indexPath, indexContent);
console.log('index.html updated successfully with exotic games.');
