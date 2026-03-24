document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        if (!isColliding(-1, 0)) piece.x--;
    }

    if (e.key === "ArrowRight") {
        if (!isColliding(1, 0)) piece.x++;
    }

    if (e.key === "ArrowDown") {
        if (!isColliding(0, 1)) piece.y++;
    }

    if (e.key === "ArrowUp") {
        rotatePiece();
    }
    if (e.code === "Space") {
        hardDrop();
    }
});
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    // 👆 TAP (small movement)
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        rotatePiece();
        return;
    }

    // 👉👈 Horizontal swipe
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) {
            if (!isColliding(1, 0)) piece.x++;
        } else if (dx < -30) {
            if (!isColliding(-1, 0)) piece.x--;
        }
    }

    // 👇 Vertical swipe
    else {
        if (dy > 50) {
            // fast swipe = HARD DROP
            hardDrop();
        } else if (dy > 20) {
            // slow swipe = SOFT DROP
            if (!isColliding(0, 1)) piece.y++;
        }
    }
});