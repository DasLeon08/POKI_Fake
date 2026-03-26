// Game Data Array
const gamesData = [
    { id: 'snake', name: 'Snake', category: 'arcade', icon: '🐍', file: 'games/snake.html', description: 'Klassisches Snake-Spiel.' },
    { id: 'tictactoe', name: 'Tic Tac Toe', category: 'puzzle', icon: '❌⭕', file: 'games/tictactoe.html', description: 'Strategie für 2 Spieler.' },
    { id: 'memory', name: 'Memory Match', category: 'puzzle', icon: '🧠', file: 'games/memory.html', description: 'Finde die Paare.' },
    { id: 'breakout', name: 'Breakout', category: 'arcade', icon: '🧱', file: 'games/breakout.html', description: 'Zerstöre alle Blöcke!' },
    { id: 'pingpong', name: 'Ping Pong', category: 'arcade', icon: '🏓', file: 'games/pingpong.html', description: 'Tischtennis gegen den PC.' },
    { id: 'rps', name: 'Schere, Stein, Papier', category: 'casual', icon: '✂️✊📄', file: 'games/rps.html', description: 'Der ewige Klassiker.' },
    { id: 'guess', name: 'Zahlen Raten', category: 'puzzle', icon: '❓', file: 'games/guess.html', description: 'Errate die versteckte Zahl.' },
    { id: 'reaction', name: 'Reaktionstest', category: 'action', icon: '⚡', file: 'games/reaction.html', description: 'Wie schnell bist du?' },
    { id: 'clicker', name: 'Klicker', category: 'casual', icon: '👆', file: 'games/clicker.html', description: 'Klicke so schnell du kannst.' },
    { id: 'catch', name: 'Fangen', category: 'action', icon: '🍎', file: 'games/catch.html', description: 'Fange die fallenden Objekte.' },
    { id: 'simon', name: 'Simon Says', category: 'puzzle', icon: '🚥', file: 'games/simon.html', description: 'Merke dir die Reihenfolge.' },
    { id: 'whack', name: 'Whack-a-Mole', category: 'action', icon: '🔨🐹', file: 'games/whack.html', description: 'Hau den Maulwurf!' }
];

// DOM Elements
const gamesGrid = document.getElementById('gamesGrid');
const searchInput = document.getElementById('searchInput');
const categoryBtns = document.querySelectorAll('.category-btn');
const modal = document.getElementById('gameModal');
const gameFrame = document.getElementById('gameFrame');
const closeModalBtn = document.getElementById('closeModal');

// Render Games Function
function renderGames(games) {
    gamesGrid.innerHTML = '';

    if (games.length === 0) {
        gamesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; font-size: 1.2rem;">Keine Spiele gefunden.</p>';
        return;
    }

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-category', game.category);

        card.innerHTML = `
            <div class="game-icon">${game.icon}</div>
            <h3>${game.name}</h3>
            <p>${game.description}</p>
        `;

        // Add click event to open game in modal
        card.addEventListener('click', () => {
            openGame(game.file);
        });

        gamesGrid.appendChild(card);
    });
}

// Initial Render
renderGames(gamesData);

// Search Functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();

    // Get currently active category
    const activeBtn = document.querySelector('.category-btn.active');
    const activeCategory = activeBtn.dataset.category;

    let filteredGames = gamesData.filter(game => {
        const matchesSearch = game.name.toLowerCase().includes(searchTerm) || game.description.toLowerCase().includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || game.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    renderGames(filteredGames);
});

// Category Filtering
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        const category = btn.dataset.category;
        const searchTerm = searchInput.value.toLowerCase();

        let filteredGames = gamesData.filter(game => {
            const matchesCategory = category === 'all' || game.category === category;
            const matchesSearch = game.name.toLowerCase().includes(searchTerm) || game.description.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        renderGames(filteredGames);
    });
});

// Modal Functionality
function openGame(fileUrl) {
    gameFrame.src = fileUrl; // Load game in iframe
    modal.style.display = 'block'; // Show modal
    document.body.style.overflow = 'hidden'; // Prevent scrolling on main page
}

function closeGame() {
    modal.style.display = 'none'; // Hide modal
    gameFrame.src = ''; // Clear iframe source to stop game/audio
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Close Modal Events
closeModalBtn.addEventListener('click', closeGame);

// Close modal if user clicks outside the modal content area
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeGame();
    }
});

// Also close on Escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeGame();
    }
});