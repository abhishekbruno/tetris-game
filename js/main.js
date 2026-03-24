const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

let lastTime = 0;
let dropCounter = 0;
let dropInterval = 500;
let gameOver = false;

//  Game state
let score = 0;
let level = 1;
let linesCleared = 0;

function update(time = 0) {
    if (gameOver) return;
    const delta = time - lastTime;
    lastTime = time;

    dropCounter += delta;


    if (dropCounter >= dropInterval) {
        moveDown();
        dropCounter = 0;
    }


    if (linesCleared >= level * 5) {
        level++;
        dropInterval = Math.max(100, dropInterval * 0.85); // prevent too fast
    }

    draw();

    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    drawGrid(ctx);
    drawGhost(ctx);
    drawPiece(ctx);
    drawNextPiece();


    const scoreEl = document.getElementById("score");
    if (scoreEl) {
        scoreEl.innerText = `Score: ${score} | Level: ${level}`;
    }
}
function showGameOver() {
    gameOver = true;

    const screen = document.getElementById("gameOverScreen");
    const text = document.getElementById("gameOverText");
    const scoreText = document.getElementById("finalScore");

    // 💥 SCREEN SHAKE
    document.body.classList.add("shake");



    setTimeout(() => {
        document.body.classList.remove("shake");
    }, 300);

    // 🔴 SHOW SCREEN
    screen.style.display = "flex";

    // 🎯 SCORE
    scoreText.innerText = `Score: ${score}`;

    // 💥 TEXT SLAM ANIMATION
    text.style.animation = "slam 9.5s ease forwards";
}

function restartGame() {
    location.reload();
}

function exitGame() {
    window.close();
}

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

update();