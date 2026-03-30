const fs = require('fs');

const mainJsPath = 'js/main.js';
let mainJs = fs.readFileSync(mainJsPath, 'utf-8');

const newGamesMeta = JSON.parse(fs.readFileSync('new_games_batch_3_meta.json', 'utf-8'));

// Format the new games to match the existing format
const newGamesArrayStr = newGamesMeta.map(game =>
    `    { id: '${game.id}', title: '${game.title}', category: '${game.category}', file: 'games/${game.id}.html', icon: '${game.icon}', gradient: '${game.gradient}' }`
).join(',\n');

// Find the end of the games array in main.js and insert the new games
const arrayEndIndex = mainJs.lastIndexOf('];');

if (arrayEndIndex !== -1) {
    const before = mainJs.substring(0, arrayEndIndex).trim();
    // make sure there is a comma before we append
    const comma = before.endsWith(',') ? '' : ',';

    mainJs = before + comma + '\n' + newGamesArrayStr + '\n];' + mainJs.substring(arrayEndIndex + 2);
    fs.writeFileSync(mainJsPath, mainJs);
    console.log(`Successfully added ${newGamesMeta.length} new games to the registry in main.js.`);
} else {
    console.error('Could not find the end of the games array in main.js.');
}
