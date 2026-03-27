const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const simulationGamesHTML = `
            <!-- Simulation Games -->
            <a href="games/euro-truck.html" class="game-tile" data-category="simulation" style="background: linear-gradient(135deg, #27ae60, #f39c12);">
                <div class="game-icon">🚚</div>
                <div class="game-info">
                    <h2>Euro Truck 2D</h2>
                </div>
            </a>
            <a href="games/flight-sim.html" class="game-tile" data-category="simulation" style="background: linear-gradient(135deg, #87CEEB, #3498db);">
                <div class="game-icon">✈️</div>
                <div class="game-info">
                    <h2>Flight Sim 2D</h2>
                </div>
            </a>
            <a href="games/train-dispatcher.html" class="game-tile" data-category="simulation" style="background: linear-gradient(135deg, #2ecc71, #e74c3c);">
                <div class="game-icon">🚆</div>
                <div class="game-info">
                    <h2>Train Dispatcher</h2>
                </div>
            </a>
`;

// Insert after Cheese Rolling
const targetString = '<div class="game-info">\n                    <h2>Cheese Rolling</h2>\n                </div>\n            </a>';
if (indexContent.includes(targetString) && !indexContent.includes('Euro Truck 2D')) {
    indexContent = indexContent.replace(targetString, targetString + '\n' + simulationGamesHTML);
}

// Add filter category
const categoryTarget = '<button class="filter-btn" data-filter="exotic">Exotisch</button>';
const categoryHTML = '\n            <button class="filter-btn" data-filter="simulation">Simulation</button>';

if (indexContent.includes(categoryTarget) && !indexContent.includes('data-filter="simulation"')) {
    indexContent = indexContent.replace(categoryTarget, categoryTarget + categoryHTML);
}

fs.writeFileSync(indexPath, indexContent);
console.log('index.html updated successfully with simulation games.');