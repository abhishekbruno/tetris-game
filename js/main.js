const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let lastTime = 0;
let dropCounter = 0;
let dropInterval = 500;

// 🎯 Score system
let score = 0;
let level = 1;
let linesCleared = 0;

function update(time = 0) {
    const delta = time - lastTime;
    lastTime = time;

    dropCounter += delta;

    // ⬇️ Gravity
    if (dropCounter >= dropInterval) {
        moveDown();
        dropCounter = 0;
    }

    // ⚡ Level system (put BEFORE draw)
    if (linesCleared >= level * 5) {
        level++;
        dropInterval *= 0.8;
    }

    draw();

    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(ctx);
    drawPiece(ctx);

    // 🎯 Update UI
    const scoreEl = document.getElementById("score");
    if (scoreEl) {
        scoreEl.innerText = `Score: ${score} | Level: ${level}`;
    }
}

update();