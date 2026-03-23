const ROWS = 20;
const COLS = 10;
const SIZE = 30;

let grid = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));

function drawGrid(ctx) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c]) {
                ctx.fillStyle = grid[r][c];
                ctx.fillRect(c * SIZE, r * SIZE, SIZE, SIZE);
            }
        }
    }
}

function clearLines() {
    let cleared = 0;

    for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r].every(cell => cell !== 0)) {
            grid.splice(r, 1);
            grid.unshift(new Array(COLS).fill(0));
            cleared++;
            r++;
        }
    }

    return cleared; // 🔥 important
}