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
});