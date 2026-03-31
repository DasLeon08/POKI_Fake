const fs = require('fs');

const mainJsPath = 'js/main.js';
let mainJs = fs.readFileSync(mainJsPath, 'utf-8');

const newGamesMeta = JSON.parse(fs.readFileSync('new_games_3d_meta.json', 'utf-8'));

// Only add games that we actually generated
const addedGames = newGamesMeta.filter(g => fs.existsSync(`games/${g.id}.html`));

const newGamesArrayStr = addedGames.map(game =>
    `    { id: '${game.id}', title: '${game.title}', category: '${game.category}', file: 'games/${game.id}.html', icon: '${game.icon}', gradient: '${game.gradient}' }`
).join(',\n');

const arrayEndIndex = mainJs.lastIndexOf('];');

if (arrayEndIndex !== -1 && addedGames.length > 0) {
    const before = mainJs.substring(0, arrayEndIndex).trim();
    const comma = before.endsWith(',') ? '' : ',';

    mainJs = before + comma + '\n' + newGamesArrayStr + '\n];' + mainJs.substring(arrayEndIndex + 2);
    fs.writeFileSync(mainJsPath, mainJs);
    console.log(`Successfully added ${addedGames.length} new 3D games to the registry in main.js.`);
}
