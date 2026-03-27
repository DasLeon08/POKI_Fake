const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const exoticGamesHTML = `
            <!-- Exotic Games -->
            <a href="games/space-sushi.html" class="game-card" data-category="exotic">
                <div class="game-icon" style="background: linear-gradient(135deg, #0b0c10, #ff4757);">🍱</div>
                <div class="game-info">
                    <div class="game-title">Space Sushi</div>
                    <div class="game-category">Exotic</div>
                </div>
            </a>
            <a href="games/llama-spit.html" class="game-card" data-category="exotic">
                <div class="game-icon" style="background: linear-gradient(135deg, #87CEEB, #27ae60);">🦙</div>
                <div class="game-info">
                    <div class="game-title">Llama Spit Sniper</div>
                    <div class="game-category">Exotic</div>
                </div>
            </a>
            <a href="games/chameleon-run.html" class="game-card" data-category="exotic">
                <div class="game-icon" style="background: linear-gradient(135deg, #3498db, #e74c3c);">🦎</div>
                <div class="game-info">
                    <div class="game-title">Chameleon Run</div>
                    <div class="game-category">Exotic</div>
                </div>
            </a>
            <a href="games/cheese-rolling.html" class="game-card" data-category="exotic">
                <div class="game-icon" style="background: linear-gradient(135deg, #f1c40f, #e67e22);">🧀</div>
                <div class="game-info">
                    <div class="game-title">Cheese Rolling</div>
                    <div class="game-category">Exotic</div>
                </div>
            </a>
`;

// Insert after the multiplayer games
const targetString = '<div class="game-title">Gravity Racer</div>\n                    <div class="game-category">Multiplayer</div>\n                </div>\n            </a>';
if (indexContent.includes(targetString)) {
    indexContent = indexContent.replace(targetString, targetString + '\n' + exoticGamesHTML);
} else {
    console.log("Could not find insertion point.");
}

// Add filter category
const categoryTarget = '<button class="filter-btn" data-filter="multiplayer">Mehrspieler</button>';
const categoryHTML = '\n                <button class="filter-btn" data-filter="exotic">Exotisch</button>';

if (indexContent.includes(categoryTarget) && !indexContent.includes('data-filter="exotic"')) {
    indexContent = indexContent.replace(categoryTarget, categoryTarget + categoryHTML);
}

fs.writeFileSync(indexPath, indexContent);
console.log('index.html updated successfully with exotic games.');
