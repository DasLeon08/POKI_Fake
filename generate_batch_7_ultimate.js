const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'games');

// We will copy templates from existing games to ensure all newly injected features (like V8 scripts) are present.
// Find existing source templates for each engine.
const template2DPath = path.join(gamesDir, 'neon-slash.html');
const template3DPath = path.join(gamesDir, 'neon-arena-alpha.html');
const templateTycPath = path.join(gamesDir, 'pizza-tycoon-12.html');
const templateShmupPath = path.join(gamesDir, 'galaxy-shooter-12.html');
const templatePlatPath = path.join(gamesDir, 'gravity-runner-45.html');

const tpl2D = fs.readFileSync(template2DPath, 'utf-8');
const tpl3D = fs.readFileSync(template3DPath, 'utf-8');
const tplTyc = fs.readFileSync(templateTycPath, 'utf-8');
const tplShmup = fs.readFileSync(templateShmupPath, 'utf-8');
const tplPlat = fs.readFileSync(templatePlatPath, 'utf-8');

const newGames = [];
let count = 0;

// Helper to inject title into template
function injectTitle(template, title, id, gradient) {
    let res = template.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    res = res.replace(/<h1 class="ingame-title".*?>.*?<\/h1>/, `<h1 class="ingame-title" style="font-size: 1.5rem; padding: 5px 15px;">${title}</h1>`);
    res = res.replace(/<h2>.*?<\/h2>/, `<h2>${title}</h2>`);
    res = res.replace(/const gameId = '.*?';/, `const gameId = '${id}';`);
    if(gradient) {
        res = res.replace(/background: linear-gradient\(.*?\);/, `background: ${gradient};`);
    }
    return res;
}

// 40 2D Poppers
for(let i=0; i<40; i++) {
    const title = `Super Pop ${Math.floor(Math.random()*9999)}`;
    const id = title.toLowerCase().replace(/ /g, '-');
    const gradient = `linear-gradient(135deg, #FF0099 0%, #493240 100%)`;
    newGames.push({ id, title, icon: '💥', category: 'action', gradient });
    fs.writeFileSync(path.join(gamesDir, `${id}.html`), injectTitle(tpl2D, title, id));
    count++;
}

// 40 3D FPS
const biomes3D = ['neon', 'desert', 'ice', 'mars', 'toxic'];
for(let i=0; i<40; i++) {
    const title = `FPS ${biomes3D[Math.floor(Math.random()*5)]} ${Math.floor(Math.random()*9999)}`;
    const id = title.toLowerCase().replace(/ /g, '-');
    const gradient = `linear-gradient(135deg, #0f2027, #203a43)`;
    newGames.push({ id, title, icon: '🔫', category: 'action', gradient });
    fs.writeFileSync(path.join(gamesDir, `${id}.html`), injectTitle(tpl3D, title, id));
    count++;
}

// 40 Tycoon
for(let i=0; i<40; i++) {
    const title = `Clicker Empire ${Math.floor(Math.random()*9999)}`;
    const id = title.toLowerCase().replace(/ /g, '-');
    const gradient = `linear-gradient(135deg, #2c3e50, #f39c12)`;
    newGames.push({ id, title, icon: '💰', category: 'strategy', gradient });
    fs.writeFileSync(path.join(gamesDir, `${id}.html`), injectTitle(tplTyc, title, id, gradient));
    count++;
}

// 40 Shmups
for(let i=0; i<40; i++) {
    const title = `Star Bullet ${Math.floor(Math.random()*9999)}`;
    const id = title.toLowerCase().replace(/ /g, '-');
    const gradient = `linear-gradient(135deg, #0a0a1a, #ff00ff)`;
    newGames.push({ id, title, icon: '🚀', category: 'action', gradient });
    fs.writeFileSync(path.join(gamesDir, `${id}.html`), injectTitle(tplShmup, title, id, gradient));
    count++;
}

// 40 Platformers
for(let i=0; i<40; i++) {
    const title = `Dash Jump ${Math.floor(Math.random()*9999)}`;
    const id = title.toLowerCase().replace(/ /g, '-');
    const gradient = `linear-gradient(135deg, #8e44ad, #e74c3c)`;
    newGames.push({ id, title, icon: '🏃', category: 'arcade', gradient });
    fs.writeFileSync(path.join(gamesDir, `${id}.html`), injectTitle(tplPlat, title, id, gradient));
    count++;
}

fs.writeFileSync('new_games_batch_7_meta.json', JSON.stringify(newGames, null, 4));

// Update Registry
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

console.log(`Generated ${count} final batch games across all 5 engine archetypes and registered them.`);
