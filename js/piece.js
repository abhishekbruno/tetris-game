const SHAPES = [
    { shape: [[1, 1, 1, 1]], color: "#00f0ff" }, // I
    { shape: [[1, 1], [1, 1]], color: "#ffd400" }, // O
    { shape: [[0, 1, 0], [1, 1, 1]], color: "#a000f0" }, // T
    { shape: [[1, 0, 0], [1, 1, 1]], color: "#ff9500" }, // L
    { shape: [[0, 0, 1], [1, 1, 1]], color: "#0050ff" }, // J
    { shape: [[0, 1, 1], [1, 1, 0]], color: "#00ff50" }, // S
    { shape: [[1, 1, 0], [0, 1, 1]], color: "#ff0030" }  // Z
];
let piece = createPiece();
let nextPiece = createPiece();
function createPiece() {
    const rand = SHAPES[Math.floor(Math.random() * SHAPES.length)];

    return {
        x: Math.floor(COLS / 2) - Math.ceil(rand.shape[0].length / 2),
        y: 0,
        shape: rand.shape,
        color: rand.color
    };
}
function drawPiece(ctx) {
    ctx.fillStyle = piece.color;

    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {

                // 🎨 Fill
                ctx.fillRect(
                    (piece.x + c) * SIZE,
                    (piece.y + r) * SIZE,
                    SIZE,
                    SIZE
                );

                // ✨ Border
                ctx.strokeStyle = "rgba(0,0,0,0.4)";
                ctx.strokeRect(
                    (piece.x + c) * SIZE,
                    (piece.y + r) * SIZE,
                    SIZE,
                    SIZE
                );
            }
        }
    }
}

//   collision
function isColliding(offsetX = 0, offsetY = 0) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (!piece.shape[r][c]) continue;

            let x = piece.x + c + offsetX;
            let y = piece.y + r + offsetY;

            if (
                x < 0 ||
                x >= COLS ||
                y >= ROWS ||
                (y >= 0 && grid[y][x])
            ) {
                return true;
            }
        }
    }
    return false;
}

function merge() {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                grid[piece.y + r][piece.x + c] = piece.color;
            }
        }
    }

    const cleared = clearLines();

    if (cleared > 0) {
        linesCleared += cleared;
        score += cleared * 100;
    }
}

function moveDown() {
    if (!isColliding(0, 1)) {
        piece.y++;
    } else {
        merge();
        piece = nextPiece;
        nextPiece = createPiece();


        //  GAME OVER 
        if (isColliding(0, 0)) {
            showGameOver();
        }
    }
}
function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    let rotated = [];

    for (let c = 0; c < cols; c++) {
        rotated[c] = [];
        for (let r = rows - 1; r >= 0; r--) {
            rotated[c].push(matrix[r][c]);
        }
    }

    return rotated;
}

function rotatePiece() {
    const newShape = rotateMatrix(piece.shape);
    const oldShape = piece.shape;

    piece.shape = newShape;

    const kicks = [-1, 1, -2, 2];

    for (let i = 0; i < kicks.length; i++) {
        if (!isColliding(kicks[i], 0)) {
            piece.x += kicks[i];
            return;
        }
    }

    if (isColliding(0, 0)) {
        piece.shape = oldShape;
    }
}
function getGhostY() {
    let y = piece.y;

    while (!isColliding(0, y - piece.y + 1)) {
        y++;
    }

    return y;
}
function drawGhost(ctx) {
    const ghostY = getGhostY();

    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.strokeStyle = "rgba(255,255,255,0.3)";

    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {

                ctx.fillRect(
                    (piece.x + c) * SIZE,
                    (ghostY + r) * SIZE,
                    SIZE,
                    SIZE
                );

                ctx.strokeRect(
                    (piece.x + c) * SIZE,
                    (ghostY + r) * SIZE,
                    SIZE,
                    SIZE
                );
            }
        }
    }
}
function hardDrop() {
    while (!isColliding(0, 1)) {
        piece.y++;
    }

    merge();
    piece = createPiece();

    // 💀 Game over check
    if (isColliding(0, 0)) {
        showGameOver();
    }
}