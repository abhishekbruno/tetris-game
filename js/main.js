const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

// 📱 RESPONSIVE CANVAS (with space for next box)
function resizeCanvas() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // leave space for next piece
    let gameWidth = Math.min(screenWidth * 0.7, screenHeight * 0.5);
    let gameHeight = gameWidth * 2;

    canvas.style.width = gameWidth + "px";
    canvas.style.height = gameHeight + "px";

    // internal resolution (sharp rendering)
    canvas.width = COLS * SIZE;
    canvas.height = ROWS * SIZE;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// 🎯 Game state
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 500;
let gameOver = false;

let score = 0;
let level = 1;
let linesCleared = 0;

// 🔊 SOUND SYSTEM
const sounds = {
    move: new Audio("sounds/move.wav"),
    rotate: new Audio("sounds/rotate.wav"),
    clear: new Audio("sounds/clear.wav"),
    gameover: new Audio("sounds/gameover.wav")
};

// preload sounds
for (let key in sounds) {
    sounds[key].load();
}

function playSound(sound) {
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => { });
}

// 🎮 GAME LOOP
function update(time = 0) {
    if (gameOver) return;

    const delta = time - lastTime;

    // prevent lag spikes
    if (delta > 100) {
        lastTime = time;
        requestAnimationFrame(update);
        return;
    }

    lastTime = time;
    dropCounter += delta;

    if (dropCounter >= dropInterval) {
        moveDown();
        dropCounter = 0;
    }

    if (linesCleared >= level * 5) {
        level++;
        dropInterval = Math.max(100, dropInterval * 0.9);
    }

    draw();
    requestAnimationFrame(update);
}

// 🎯 UI optimization
let frameCount = 0;
const scoreEl = document.getElementById("score");

// 🎨 DRAW
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx);
    drawGhost(ctx);
    drawPiece(ctx);
    drawNextPiece();

    if (frameCount % 10 === 0 && scoreEl) {
        scoreEl.innerText = `Score: ${score} | Level: ${level}`;
    }

    frameCount++;
}

// 💀 GAME OVER
function showGameOver() {
    gameOver = true;

    const screen = document.getElementById("gameOverScreen");
    const text = document.getElementById("gameOverText");
    const scoreText = document.getElementById("finalScore");

    document.body.classList.add("shake");
    setTimeout(() => {
        document.body.classList.remove("shake");
    }, 300);

    screen.style.display = "flex";
    scoreText.innerText = `Score: ${score}`;

    // 🔊 sound
    playSound(sounds.gameover);

    // 💥 animation
    text.style.animation = "slam 0.7s ease forwards";
}

// 🔄 Restart
function restartGame() {
    location.reload();
}

// 🚪 Exit
function exitGame() {
    window.close();
}

// 🧩 NEXT PIECE
function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    const size = 25;
    nextCtx.fillStyle = nextPiece.color;

    for (let r = 0; r < nextPiece.shape.length; r++) {
        for (let c = 0; c < nextPiece.shape[r].length; c++) {
            if (nextPiece.shape[r][c]) {
                nextCtx.fillRect(
                    c * size + 20,
                    r * size + 20,
                    size,
                    size
                );
            }
        }
    }
}

// 🚀 START
update();