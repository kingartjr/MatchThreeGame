// DOM Elements
const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const objectiveDisplay = document.getElementById("objective");
const resetButton = document.getElementById("reset-game");
const startButton = document.getElementById("start-game");
const pauseButton = document.getElementById("pause-game");
const leaderboardList = document.getElementById("leaderboard-list");

// Game Variables
const boardSize = 8;
const tileTypes = ["red", "blue", "green", "yellow", "purple"];
let board = [];
let selectedTile = null;
let score = 0;
let movesLeft = 20;
let timer = 60;
let objective = { color: "red", target: 10, progress: 0 };
let isPaused = false;
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

// Sounds
const matchSound = document.getElementById("match-sound");
const swapSound = document.getElementById("swap-sound");
const bgMusic = document.getElementById("background-music");

// Start background music
bgMusic.play();

// Initialize Board
function initializeBoard() {
    board = [];
    gameBoard.innerHTML = "";
    for (let row = 0; row < boardSize; row++) {
        board[row] = [];
        for (let col = 0; col < boardSize; col++) {
            const tile = createTile(row, col);
            board[row][col] = tile;
            gameBoard.appendChild(tile);
        }
    }
    updateObjective();
}

// Create a Tile
function createTile(row, col) {
    const tile = document.createElement("div");
    tile.className = `tile ${getRandomTileType()}`;
    tile.dataset.row = row;
    tile.dataset.col = col;
    tile.addEventListener("click", () => handleTileClick(tile));
    return tile;
}

function getRandomTileType() {
    return tileTypes[Math.floor(Math.random() * tileTypes.length)];
}

// Handle Tile Click
function handleTileClick(tile) {
    if (isPaused) return; // Pause prevents interaction

    if (!selectedTile) {
        selectedTile = tile;
        tile.classList.add("selected");
    } else {
        // Swap Tiles
        swapSound.play();
        const tempClass = selectedTile.className;
        selectedTile.className = tile.className;
        tile.className = tempClass;

        selectedTile.classList.remove("selected");
        selectedTile = null;

        movesLeft--;
        movesDisplay.textContent = movesLeft;

        if (movesLeft <= 0) {
            gameOver("Out of moves!");
        } else {
            checkMatches();
        }
    }
}

// Check for Matches
function checkMatches() {
    let matchedTiles = [];

    // Horizontal matches
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize - 2; col++) {
            const tile1 = board[row][col];
            const tile2 = board[row][col + 1];
            const tile3 = board[row][col + 2];
            if (
                tile1.className === tile2.className &&
                tile1.className === tile3.className
            ) {
                matchedTiles.push(tile1, tile2, tile3);
                if (tile1.classList.contains(objective.color)) {
                    objective.progress += 3;
                }
            }
        }
    }

    // Vertical matches
    for (let col = 0; col < boardSize; col++) {
        for (let row = 0; row < boardSize - 2; row++) {
            const tile1 = board[row][col];
            const tile2 = board[row + 1][col];
            const tile3 = board[row + 2][col];
            if (
                tile1.className === tile2.className &&
                tile1.className === tile3.className
            ) {
                matchedTiles.push(tile1, tile2, tile3);
                if (tile1.classList.contains(objective.color)) {
                    objective.progress += 3;
                }
            }
        }
    }

    if (matchedTiles.length > 0) {
        handleMatches(matchedTiles);
    } else {
        applyGravity();
    }
}

// Handle Matches
function handleMatches(matchedTiles) {
    matchSound.play();
    matchedTiles.forEach(tile => {
        tile.className = "tile empty";
    });
    updateScore(matchedTiles.length);
    updateObjective();
    setTimeout(() => {
        applyGravity();
    }, 500); // Wait for animations
}

// Apply Gravity
function applyGravity() {
    for (let col = 0; col < boardSize; col++) {
        let emptySpaces = 0;
        for (let row = boardSize - 1; row >= 0; row--) {
            const tile = board[row][col];
            if (tile.classList.contains("empty")) {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                board[row + emptySpaces][col].className = tile.className;
                tile.className = "tile empty";
            }
        }

        for (let row = 0; row < emptySpaces; row++) {
            board[row][col].className = `tile ${getRandomTileType()}`;
        }
    }

    setTimeout(checkMatches, 500);
}

// Update Score
function updateScore(matches) {
    score += matches * 10;
    scoreDisplay.textContent = score;
}

// Update Objective
function updateObjective() {
    objectiveDisplay.textContent = `Objective: Match ${objective.target} ${objective.color} tiles (${objective.progress}/${objective.target})`;
    if (objective.progress >= objective.target) {
        gameOver("Objective Complete!");
    }
}

// Game Over
function gameOver(message) {
    alert(message);
    saveLeaderboard();
    resetGame();
}

// Save Leaderboard
function saveLeaderboard() {
    leaderboard.push({ score });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    updateLeaderboardDisplay();
}

// Update Leaderboard Display
function updateLeaderboardDisplay() {
    leaderboardList.innerHTML = leaderboard
        .slice(0, 5)
        .map(entry => `<li>${entry.score} points</li>`)
        .join("");
}

// Reset Game
function resetGame() {
    score = 0;
    movesLeft = 20;
    timer = 60;
    objective.progress = 0;
    scoreDisplay.textContent = score;
    movesDisplay.textContent = movesLeft;
    timerDisplay.textContent = timer;
    initializeBoard();
}

// Start Game
resetButton.addEventListener("click", resetGame);
startButton.addEventListener("click", initializeBoard);
pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Resume" : "Pause";
});

// Countdown Timer
const countdown = setInterval(() => {
    if (!isPaused) {
        timer--;
        timerDisplay.textContent = timer;
        if (timer <= 0) {
            clearInterval(countdown);
            gameOver("Time's up!");
        }
    }
}, 1000);

// Initialize the game
initializeBoard();