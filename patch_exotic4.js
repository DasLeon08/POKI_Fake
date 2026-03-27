const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

const categoryTarget = '<button class="filter-btn" data-filter="casual">Gelegenheitsspiele</button>';
const categoryHTML = '\n            <button class="filter-btn" data-filter="exotic">Exotisch</button>';

if (indexContent.includes(categoryTarget) && !indexContent.includes('data-filter="exotic"')) {
    indexContent = indexContent.replace(categoryTarget, categoryTarget + categoryHTML);
}

fs.writeFileSync(indexPath, indexContent);
console.log('index.html updated successfully with exotic button fixed.');
