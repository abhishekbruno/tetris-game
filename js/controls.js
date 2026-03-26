// 🔊 MOBILE AUDIO UNLOCK (must be first)
document.addEventListener("touchstart", () => {
    for (let key in sounds) {
        sounds[key].play().then(() => {
            sounds[key].pause();
            sounds[key].currentTime = 0;
        }).catch(() => { });
    }
}, { once: true });


// 🎮 KEYBOARD CONTROLS
document.addEventListener("keydown", (e) => {

    // ⬅️ Move Left
    if (e.key === "ArrowLeft") {
        if (!isColliding(-1, 0)) {
            piece.x--;
            playSound(sounds.move);
        }
    }

    // ➡️ Move Right
    if (e.key === "ArrowRight") {
        if (!isColliding(1, 0)) {
            piece.x++;
            playSound(sounds.move);
        }
    }

    // ⬇️ Soft Drop
    if (e.key === "ArrowDown") {
        if (!isColliding(0, 1)) {
            piece.y++;
        }
    }

    // 🔄 Rotate
    if (e.key === "ArrowUp") {
        rotatePiece();
        playSound(sounds.rotate);
    }

    // ⚡ Hard Drop
    if (e.code === "Space") {
        e.preventDefault();
        hardDrop();
    }
});


// 📱 TOUCH CONTROLS
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

    // 👆 TAP → rotate
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        rotatePiece();
        playSound(sounds.rotate);
        return;
    }

    // 👉👈 Horizontal swipe
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) {
            if (!isColliding(1, 0)) {
                piece.x++;
                playSound(sounds.move);
            }
        } else if (dx < -30) {
            if (!isColliding(-1, 0)) {
                piece.x--;
                playSound(sounds.move);
            }
        }
    }

    // 👇 Vertical swipe
    else {
        if (dy > 50) {
            // ⚡ Hard drop
            hardDrop();
        } else if (dy > 20) {
            // ⬇️ Soft drop
            if (!isColliding(0, 1)) {
                piece.y++;
            }
        }
    }
});


// 📱 PREVENT SCROLL (IMPORTANT FOR MOBILE)
document.addEventListener("touchmove", (e) => {
    e.preventDefault();
}, { passive: false });