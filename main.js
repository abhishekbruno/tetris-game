// ============================================================
//  TETRIS — main.js  |  Cyberpunk Edition  (Optimized)
//  Features: 7-bag, DAS, lock delay, combos, line flash,
//            sound pooling, soft-drop scoring, Gamepad, T-Spins,
//            Particles, Gameboy Mode
// ============================================================

// ─── CONSTANTS ───────────────────────────────────────────────
const COLS = 10;
const ROWS = 20;
const SIZE = 30;
let GHOST_ALPHA = 0.2;

// DAS — Delayed Auto Shift (hold-to-repeat movement)
const DAS_DELAY = 160;   // ms before auto-repeat kicks in
const DAS_RATE  = 50;    // ms between repeats

// Lock delay — time to slide a piece after it lands
const LOCK_DELAY    = 500;  // ms before piece locks
const LOCK_MAX_MOVES = 15;  // max moves/rotates before forced lock

// NES-style speed curve (ms per drop, indexed by level)
const SPEED_CURVE = [
  800, 720, 630, 550, 470, 380, 300, 220, 170, 130,
  100, 100, 100, 80, 80, 80, 60, 60, 60, 40, 40, 40, 30
];

// ─── CANVAS ──────────────────────────────────────────────────
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

canvas.width = COLS * SIZE;
canvas.height = ROWS * SIZE;

// ─── STATE ───────────────────────────────────────────────────
let board = [];
let score = 0;
let level = 1;
let linesCleared = 0;
let gameOver = false;
let paused = false;
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 800;
let animationId = null;
let holdPiece = null;
let holdUsed = false;

// Lock-delay state
let lockTimer = 0;
let lockMoves = 0;
let isLanding = false;

// Pro Mechanics State
let combo = -1;
let lastActionRotate = false; // Used for T-Spin detection

// Effects state
let flashRows = [];
let flashTimer = 0;
const FLASH_DURATION = 300;
let particles = [];
let floatTexts = []; // T-Spin popups
let gameboyMode = false;

// ─── GAMEBOY MODE ────────────────────────────────────────────
function toggleGameboyMode() {
  gameboyMode = !gameboyMode;
  document.body.classList.toggle("gameboy-mode");
  GHOST_ALPHA = gameboyMode ? 0.4 : 0.2;
  initBgCache();
}

// ─── PIECES ──────────────────────────────────────────────────
// Notice T piece is #aa00ff. Its center is at [1,1] in its local 3x3 block space.
const PIECES = [
  { shape: [[1, 1, 1, 1]], color: "#00e5ff", id: "I" },           // I — cyan
  { shape: [[1, 1], [1, 1]], color: "#ffe600", id: "O" },          // O — yellow
  { shape: [[0, 1, 0], [1, 1, 1]], color: "#aa00ff", id: "T" },    // T — purple
  { shape: [[1, 0, 0], [1, 1, 1]], color: "#ff8800", id: "L" },    // L — orange
  { shape: [[0, 0, 1], [1, 1, 1]], color: "#2255ff", id: "J" },    // J — blue
  { shape: [[0, 1, 1], [1, 1, 0]], color: "#00ff88", id: "S" },    // S — green
  { shape: [[1, 1, 0], [0, 1, 1]], color: "#ff2d78", id: "Z" },    // Z — pink
];

// ─── 7-BAG RANDOMIZER ────────────────────────────────────────
let bag = [];
function fillBag() {
  bag = [...Array(PIECES.length).keys()];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
}
function nextFromBag() {
  if (bag.length === 0) fillBag();
  return makePiece(PIECES[bag.pop()]);
}

// ─── SOUND POOLING ───────────────────────────────────────────
function makeSound(src) {
  const a = new Audio(src);
  a.onerror = () => {};
  return a;
}
function playSound(key) {
  const src = soundSources[key];
  if (!src) return;
  try {
    const clone = src.cloneNode();
    clone.volume = src.volume;
    clone.play().catch(() => {});
  } catch (_) {}
}
const soundSources = {
  move: makeSound("sounds/move.wav"),
  rotate: makeSound("sounds/rotate.wav"),
  clear: makeSound("sounds/clear.wav"),
  gameover: makeSound("sounds/gameover.wav"),
};

// ─── PARTICLE ENGINE ─────────────────────────────────────────
function spawnParticles(x, y, color, count) {
  if (gameboyMode) color = "#0f380f"; // Snap to GB colors if active
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x * SIZE + SIZE / 2,
      y: y * SIZE + SIZE / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15 - 3,
      life: 1.0,
      color: color,
      size: Math.random() * 6 + 2,
    });
  }
}
function spawnText(msg, x, y, color) {
  floatTexts.push({
    msg, x, y, life: 1.0, color: gameboyMode ? "#0f380f" : color
  });
}
function updateParticles(delta) {
  const d = delta / 16.66;
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.vy += 0.8 * d; // gravity
    p.x += p.vx * d;
    p.y += p.vy * d;
    p.life -= 0.03 * d;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (let i = floatTexts.length - 1; i >= 0; i--) {
    let t = floatTexts[i];
    t.y -= 0.5 * d;
    t.life -= 0.015 * d;
    if (t.life <= 0) floatTexts.splice(i, 1);
  }
}
function drawParticles() {
  for (let p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "center";
  ctx.font = "bold 16px Orbitron";
  if (gameboyMode) ctx.font = "bold 16px 'Share Tech Mono'";
  for (let t of floatTexts) {
    ctx.globalAlpha = Math.max(0, t.life);
    ctx.fillStyle = t.color;
    ctx.fillText(t.msg, t.x, t.y);
  }
  ctx.globalAlpha = 1;
}

// ─── BOARD ───────────────────────────────────────────────────
function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// ─── PIECE FACTORY ───────────────────────────────────────────
function makePiece(template) {
  return {
    shape: template.shape.map(r => [...r]),
    color: template.color,
    id: template.id,
    x: Math.floor(COLS / 2) - Math.floor(template.shape[0].length / 2),
    y: 0,
  };
}

let currentPiece = null;
let nextPiece = null;

function spawnPiece() {
  currentPiece = nextPiece || nextFromBag();
  nextPiece = nextFromBag();
  holdUsed = false;
  lockTimer = 0;
  lockMoves = 0;
  isLanding = false;
  lastActionRotate = false;
  drawNextPiece();
  if (collides(currentPiece, 0, 0)) showGameOver();
}

// ─── HOLD ────────────────────────────────────────────────────
function holdCurrentPiece() {
  if (holdUsed || gameOver || paused) return;
  holdUsed = true;
  lastActionRotate = false;

  // Visual pop for hold
  spawnParticles(currentPiece.x + currentPiece.shape[0].length/2, currentPiece.y, "#ffffff", 10);

  if (!holdPiece) {
    holdPiece = makePiece(PIECES.find(p => p.id === currentPiece.id));
    spawnPiece();
  } else {
    const temp = makePiece(PIECES.find(p => p.id === holdPiece.id));
    holdPiece = makePiece(PIECES.find(p => p.id === currentPiece.id));
    currentPiece = temp;
    currentPiece.x = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentPiece.y = 0;
    lockTimer = 0;
    lockMoves = 0;
    isLanding = false;
  }
}

// ─── COLLISION ───────────────────────────────────────────────
function collides(piece, dx, dy, shape) {
  const s = shape || piece.shape;
  for (let r = 0; r < s.length; r++) {
    for (let c = 0; c < s[r].length; c++) {
      if (!s[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

// ─── ROTATION (with wall-kick) ───────────────────────────────
function rotateMatrix(shape) {
  const rows = shape.length, cols = shape[0].length;
  const out = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      out[c][rows - 1 - r] = shape[r][c];
  return out;
}

function rotatePiece() {
  lastActionRotate = true;
  const rotated = rotateMatrix(currentPiece.shape);
  for (const kick of [0, -1, 1, -2, 2]) {
    if (!collides(currentPiece, kick, 0, rotated)) {
      currentPiece.shape = rotated;
      currentPiece.x += kick;
      playSound("rotate");
      if (isLanding && lockMoves < LOCK_MAX_MOVES) {
        lockTimer = 0;
        lockMoves++;
      }
      return;
    }
  }
}

// ─── MOVEMENT ────────────────────────────────────────────────
function moveLeft() {
  lastActionRotate = false;
  if (!collides(currentPiece, -1, 0)) {
    currentPiece.x--;
    playSound("move");
    if (isLanding && lockMoves < LOCK_MAX_MOVES) { lockTimer = 0; lockMoves++; }
  }
}
function moveRight() {
  lastActionRotate = false;
  if (!collides(currentPiece, 1, 0)) {
    currentPiece.x++;
    playSound("move");
    if (isLanding && lockMoves < LOCK_MAX_MOVES) { lockTimer = 0; lockMoves++; }
  }
}
function moveDown() {
  lastActionRotate = false;
  if (!collides(currentPiece, 0, 1)) {
    currentPiece.y++;
    isLanding = false;
    lockTimer = 0;
  } else {
    isLanding = true;
  }
}
function softDrop() {
  lastActionRotate = false;
  if (!collides(currentPiece, 0, 1)) {
    currentPiece.y++;
    score += 1;
    isLanding = false;
    lockTimer = 0;
  } else {
    isLanding = true;
  }
}
function hardDrop() {
  lastActionRotate = false;
  
  // Trail particles
  let startY = currentPiece.y;
  
  while (!collides(currentPiece, 0, 1)) {
    currentPiece.y++;
    score += 2;
  }
  
  // Create blast where it lands
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (currentPiece.shape[r][c]) {
        spawnParticles(currentPiece.x + c, currentPiece.y + r, currentPiece.color, 3);
        
        // Add vertical ghost trails if it fell far
        if (currentPiece.y - startY > 2) {
          spawnParticles(currentPiece.x + c, currentPiece.y + r - 1, "#ffffff", 1);
        }
      }
    }
  }

  lockPiece();
}

// ─── LOCK & CLEAR & T-SPIN ───────────────────────────────────
function lockPiece() {
  // Check T-Spin
  let isTSpin = false;
  if (currentPiece.id === "T" && lastActionRotate) {
    const cx = currentPiece.x + 1;
    const cy = currentPiece.y + 1;
    let corners = 0;
    const offsets = [[-1,-1], [1,-1], [-1,1], [1,1]];
    for(let o of offsets) {
      const nx = cx + o[0];
      const ny = cy + o[1];
      if (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && board[ny][nx])) corners++;
    }
    if (corners >= 3) {
      isTSpin = true;
    }
  }

  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (!currentPiece.shape[r][c]) continue;
      const ny = currentPiece.y + r;
      const nx = currentPiece.x + c;
      if (ny < 0) { showGameOver(); return; }
      board[ny][nx] = currentPiece.color;
    }
  }
  isLanding = false;
  lockTimer = 0;
  lockMoves = 0;
  clearLines(isTSpin);
  spawnPiece();
}

function clearLines(isTSpin) {
  let cleared = 0;
  const rowsToClear = [];

  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(cell => cell !== 0)) {
      rowsToClear.push(r);
      cleared++;
    }
  }

  // T-Spin tracking & points
  let tSpinStr = "";
  if (isTSpin) {
    if (cleared === 0) tSpinStr = "T-SPIN";
    if (cleared === 1) tSpinStr = "T-SPIN SINGLE!";
    if (cleared === 2) tSpinStr = "T-SPIN DOUBLE!!";
    if (cleared === 3) tSpinStr = "T-SPIN TRIPLE!!!";
  }

  if (cleared > 0) {
    flashRows = rowsToClear;
    flashTimer = FLASH_DURATION;

    // Line clear explosion particles
    for (let row of rowsToClear) {
      for(let x=0; x<COLS; x++) {
         spawnParticles(x, row, board[row][x], 4);
      }
    }

    setTimeout(() => {
      for (const row of rowsToClear.sort((a, b) => a - b)) {
        board.splice(row, 1);
        board.unshift(Array(COLS).fill(0));
      }
    }, FLASH_DURATION);

    linesCleared += cleared;

    // Real Scoring
    let base = [0, 100, 300, 500, 800][cleared];
    if (isTSpin) base = [0, 800, 1200, 1600][cleared];
    score += base * level;

    combo++;
    if (combo > 0) {
      score += 50 * combo * level;
      if (combo >= 2) spawnText(`Combo x${combo}!`, canvas.width/2, 100, "#ff2d78");
    }

    playSound("clear");

    const newLevel = Math.floor(linesCleared / 10) + 1;
    if (newLevel > level) {
      level = newLevel;
      dropInterval = SPEED_CURVE[Math.min(level - 1, SPEED_CURVE.length - 1)];
      spawnText("LEVEL UP", canvas.width/2, 150, "#ffe600");
    }
  } else {
    combo = -1;
    if (isTSpin) score += 400 * level; // T-Spin no lines
  }

  if (tSpinStr) {
    spawnText(tSpinStr, canvas.width/2, 200, "#aa00ff");
    playSound("clear"); // double trigger for impact
  }

  updateHUD();
}

// ─── HUD ─────────────────────────────────────────────────────
function updateHUD() {
  const pad = (n, len) => String(n).padStart(len, "0");
  document.getElementById("scoreVal").textContent = pad(score, 6);
  document.getElementById("linesVal").textContent = pad(linesCleared, 2);
  document.getElementById("levelVal").textContent = pad(level, 2);
  document.getElementById("scoreSide").textContent = score;
  document.getElementById("linesSide").textContent = linesCleared;
  document.getElementById("levelSide").textContent = level;
  document.getElementById("levelBar").style.width = ((linesCleared % 10) / 10) * 100 + "%";
}

// ─── DRAWING ─────────────────────────────────────────────────
const bgCanvas = document.createElement("canvas");
bgCanvas.width = COLS * SIZE;
bgCanvas.height = ROWS * SIZE;
const bgCtx = bgCanvas.getContext("2d");

function initBgCache() {
  const style = getComputedStyle(document.body);
  const bgColor = style.getPropertyValue('--bg').trim() || "#04040d";
  const bgGridColor = gameboyMode ? "rgba(15, 56, 15, 0.15)" : "rgba(255,255,255,0.05)";
  
  bgCtx.fillStyle = bgColor;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCtx.strokeStyle = bgGridColor;
  bgCtx.lineWidth = 0.5;
  bgCtx.beginPath();
  for (let r = 0; r <= ROWS; r++) {
    bgCtx.moveTo(0, r * SIZE);
    bgCtx.lineTo(COLS * SIZE, r * SIZE);
  }
  for (let c = 0; c <= COLS; c++) {
    bgCtx.moveTo(c * SIZE, 0);
    bgCtx.lineTo(c * SIZE, ROWS * SIZE);
  }
  bgCtx.stroke();
}
// Init called below

function drawBlock(context, x, y, color, alpha = 1) {
  context.globalAlpha = alpha;
  context.fillStyle = color;
  context.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);

  // inner highlight (disabled in gameboy mode for flatter look)
  if (!gameboyMode) {
    context.fillStyle = "rgba(255,255,255,0.12)";
    context.fillRect(x * SIZE + 1, y * SIZE + 1, SIZE - 2, 4);
  }

  context.strokeStyle = gameboyMode ? "#0f380f" : "rgba(0,0,0,0.35)";
  context.lineWidth = 1;
  context.strokeRect(x * SIZE, y * SIZE, SIZE, SIZE);
  context.globalAlpha = 1;
}

function drawBoard() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) {
        if (flashTimer > 0 && flashRows.includes(r)) {
          const pulse = Math.sin((flashTimer / FLASH_DURATION) * Math.PI);
          drawBlock(ctx, c, r, "#ffffff", 0.4 + pulse * 0.6);
        } else {
          // Snap locked blocks to gameboy palette if needed
          let clr = gameboyMode ? "#306230" : board[r][c];
          drawBlock(ctx, c, r, clr);
        }
      }
    }
  }
}

function drawCurrentPiece() {
  if (!currentPiece) return;
  let clr = gameboyMode ? "#0f380f" : currentPiece.color;
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (currentPiece.shape[r][c]) drawBlock(ctx, currentPiece.x + c, currentPiece.y + r, clr);
    }
  }
}

function drawGhost() {
  if (!currentPiece) return;
  let ghostY = currentPiece.y;
  while (!collides(currentPiece, 0, ghostY - currentPiece.y + 1)) ghostY++;
  if (ghostY === currentPiece.y) return;

  let clr = gameboyMode ? "#306230" : currentPiece.color;
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (currentPiece.shape[r][c]) {
        drawBlock(ctx, currentPiece.x + c, ghostY + r, clr, GHOST_ALPHA);
      }
    }
  }
}

function drawNextPiece() {
  if (!nextPiece) return;
  nextCtx.fillStyle = gameboyMode ? getComputedStyle(document.body).getPropertyValue('--bg').trim() : "#04040d";
  nextCtx.fillRect(0,0, nextCanvas.width, nextCanvas.height);

  const blockSize = 22;
  const shape = nextPiece.shape;
  const offsetX = (nextCanvas.width - shape[0].length * blockSize) / 2;
  const offsetY = (nextCanvas.height - shape.length * blockSize) / 2;

  let clr = gameboyMode ? "#0f380f" : nextPiece.color;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        nextCtx.fillStyle = clr;
        nextCtx.fillRect(offsetX + c * blockSize, offsetY + r * blockSize, blockSize, blockSize);
        if(!gameboyMode) {
          nextCtx.fillStyle = "rgba(255,255,255,0.12)";
          nextCtx.fillRect(offsetX + c * blockSize + 1, offsetY + r * blockSize + 1, blockSize - 2, 3);
        }
        nextCtx.strokeStyle = gameboyMode ? "#0f380f" : "rgba(0,0,0,0.35)";
        nextCtx.lineWidth = 1;
        nextCtx.strokeRect(offsetX + c * blockSize, offsetY + r * blockSize, blockSize, blockSize);
      }
    }
  }
}

function draw() {
  ctx.drawImage(bgCanvas, 0, 0);
  drawBoard();
  drawGhost();
  drawCurrentPiece();
  drawParticles();
}

// ─── INPUT LOGIC (DAS + KEYBOARD) ─────────────────────────────
const keys = {};
let dasKey = null;
let dasTimer = 0;
let dasRepeatTimer = 0;

document.addEventListener("keydown", (e) => {
  if (keys[e.key]) return;
  keys[e.key] = true;
  if (gameOver) return;
  if (e.key === "p" || e.key === "P") { togglePause(); return; }
  if (paused) return;

  switch (e.key) {
    case "ArrowLeft": moveLeft(); dasKey = "ArrowLeft"; dasTimer = 0; dasRepeatTimer = 0; break;
    case "ArrowRight": moveRight(); dasKey = "ArrowRight"; dasTimer = 0; dasRepeatTimer = 0; break;
    case "ArrowDown": softDrop(); dasKey = "ArrowDown"; dasTimer = 0; dasRepeatTimer = 0; break;
    case "ArrowUp": rotatePiece(); break;
    case " ": e.preventDefault(); hardDrop(); break;
    case "c": case "C": holdCurrentPiece(); break;
  }
});
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  if (e.key === dasKey) { dasKey = null; dasTimer = 0; dasRepeatTimer = 0; }
});

function processDAS(delta) {
  if (!dasKey || paused || gameOver) return;
  dasTimer += delta;
  if (dasTimer < DAS_DELAY) return;
  dasRepeatTimer += delta;
  if (dasRepeatTimer >= DAS_RATE) {
    dasRepeatTimer -= DAS_RATE;
    switch (dasKey) {
      case "ArrowLeft": moveLeft(); break;
      case "ArrowRight": moveRight(); break;
      case "ArrowDown": softDrop(); break;
    }
  }
}

// ─── GAMEPAD SUPPORT ─────────────────────────────────────────
let gpPrev = { left:false, right:false, down:false, up:false, hold:false, hardDrop:false };
function pollGamepads() {
  const gp = navigator.getGamepads()[0];
  if (!gp || gameOver || paused) return;

  const btn = (i) => gp.buttons[i]?.pressed;
  
  // D-Pad or Left Stick
  const left = btn(14) || gp.axes[0] < -0.5;
  const right = btn(15) || gp.axes[0] > 0.5;
  const down = btn(13) || gp.axes[1] > 0.5;
  const up = btn(0) || btn(1) || btn(2) || btn(3) || btn(12); // Any face button or D-Pad Up rotates
  const hold = btn(4) || btn(5) || btn(6) || btn(7); // Any shoulder button
  const hardDropBtn = gp.axes[1] < -0.8; // Hard up on stick, or we can map something else. Lets stick to standard face buttons for rotate.

  // Simulate DAS via simulating keyboard vars
  if (left && !gpPrev.left) { moveLeft(); dasKey="ArrowLeft"; dasTimer=0; }
  else if (!left && gpPrev.left && dasKey==="ArrowLeft") dasKey=null;

  if (right && !gpPrev.right) { moveRight(); dasKey="ArrowRight"; dasTimer=0; }
  else if (!right && gpPrev.right && dasKey==="ArrowRight") dasKey=null;

  if (down && !gpPrev.down) { softDrop(); dasKey="ArrowDown"; dasTimer=0; }
  else if (!down && gpPrev.down && dasKey==="ArrowDown") dasKey=null;

  if (up && !gpPrev.up) rotatePiece();
  if (hold && !gpPrev.hold) holdCurrentPiece();
  
  gpPrev = { left, right, down, up, hold };
}

// ─── GAME LOOP ───────────────────────────────────────────────
function update(time = performance.now()) {
  if (gameOver) return;
  if (paused) {
    lastTime = time;
    animationId = requestAnimationFrame(update);
    return;
  }

  let delta = time - lastTime;
  lastTime = time;

  if (delta > 200) delta = 16.66; // Smooth frame correction

  pollGamepads();
  processDAS(delta);
  updateParticles(delta);

  if (flashTimer > 0) flashTimer = Math.max(0, flashTimer - delta);

  if (isLanding) {
    lockTimer += delta;
    if (!collides(currentPiece, 0, 1)) {
      isLanding = false;
      lockTimer = 0;
    } else if (lockTimer >= LOCK_DELAY || lockMoves >= LOCK_MAX_MOVES) {
      lockPiece();
    }
  }

  dropCounter += delta;
  if (dropCounter >= dropInterval) {
    moveDown();
    dropCounter = 0;
  }

  draw();
  animationId = requestAnimationFrame(update);
}

// ─── OVERLAYS & MOBILE ───────────────────────────────────────
function showGameOver() {
  gameOver = true;
  if (animationId) cancelAnimationFrame(animationId);
  playSound("gameover");
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 350);
  document.getElementById("finalScore").textContent = String(score).padStart(6, "0");
  document.getElementById("finalLines").textContent = linesCleared;
  document.getElementById("finalLevel").textContent = level;
  const screen = document.getElementById("gameOverScreen");
  const text = document.getElementById("gameOverText");
  screen.style.display = "flex";
  text.style.animation = "none";
  text.offsetHeight;
  text.style.animation = "slam 0.7s ease forwards";
}
function togglePause() {
  if (gameOver) return;
  paused = !paused;
  document.getElementById("pauseScreen").style.display = paused ? "flex" : "none";
  if (!paused) { lastTime = performance.now(); dropCounter = 0; }
}
function restartGame() {
  document.getElementById("pauseScreen").style.display = "none";
  document.getElementById("gameOverScreen").style.display = "none";
  board = createBoard(); score = 0; level = 1; linesCleared = 0;
  gameOver = false; paused = false; dropCounter = 0; dropInterval = SPEED_CURVE[0];
  holdPiece = null; holdUsed = false; lockTimer = 0; lockMoves = 0; isLanding = false;
  combo = -1; flashRows = []; flashTimer = 0; bag = []; particles = []; floatTexts = [];
  currentPiece = null; nextPiece = null;
  spawnPiece(); updateHUD();
  if (animationId) cancelAnimationFrame(animationId);
  lastTime = performance.now();
  animationId = requestAnimationFrame(update);
}
function exitGame() {
  if (animationId) cancelAnimationFrame(animationId);
  gameOver = true;
  document.getElementById("pauseScreen").style.display = "none";
  document.getElementById("gameOverScreen").style.display = "none";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = gameboyMode ? "#0f380f" : "rgba(255,255,255,0.06)";
  ctx.font = gameboyMode ? "bold 20px 'Share Tech Mono'" : "20px Orbitron";
  ctx.textAlign = "center";
  ctx.fillText("THANKS FOR PLAYING", canvas.width / 2, canvas.height / 2);
}

function mobileMoveLeft()  { if (!gameOver && !paused) { moveLeft(); dasKey="ArrowLeft"; } }
function mobileMoveRight() { if (!gameOver && !paused) { moveRight(); dasKey="ArrowRight"; } }
function mobileRotate()    { if (!gameOver && !paused) rotatePiece(); }
function mobileHardDrop()  { if (!gameOver && !paused) hardDrop(); }
function mobileHold()      { if (!gameOver && !paused) holdCurrentPiece(); }

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  Object.values(soundSources).forEach(s => { s.play().then(()=> { s.pause(); s.currentTime = 0; }).catch(()=>{}); });
}, { passive: false });

document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });

document.addEventListener("touchend", (e) => {
  dasKey = null; // Stop DAS on touch release
  if (gameOver || paused) return;

  let touchEndX = e.changedTouches[0].clientX;
  let touchEndY = e.changedTouches[0].clientY;
  let dx = touchEndX - touchStartX;
  let dy = touchEndY - touchStartY;

  // Swipe processing
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal swipe
    if (dx > 30) moveRight();
    else if (dx < -30) moveLeft();
  } else {
    // Vertical swipe
    if (dy > 40) hardDrop();
    else if (dy > 15 && dy <= 40) softDrop();
  }
});

// ─── INIT ────────────────────────────────────────────────────
function init() {
  setTimeout(() => initBgCache(), 100); // Give CSS time to apply variable overrides
  board = createBoard();
  dropInterval = SPEED_CURVE[0];
  spawnPiece();
  updateHUD();
  lastTime = performance.now();
  animationId = requestAnimationFrame(update);
}

init();