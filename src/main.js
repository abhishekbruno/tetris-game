// ============================================================
//  TETRIS — main.js  |  Cyberpunk Edition (Modular & Optimized)
// ============================================================

import { TetrisEngine } from "./engine/engine.js";
import { GameState, SPEED_CURVE } from "./engine/constants.js";
import { Renderer } from "./rendering/renderer.js";
import { ParticleEngine } from "./rendering/particles.js";
import { SoundManager } from "./audio/sound.js";
import { StatsManager } from "./storage/stats.js";
import { KeyboardHandler } from "./input/keyboard.js";
import { TouchHandler } from "./input/touch.js";
import { GamepadHandler } from "./input/gamepad.js";

// DOM Elements
const canvas = document.getElementById("game");
const nextCanvas = document.getElementById("next");
const holdCanvas = document.getElementById("hold");

const scoreVal = document.getElementById("scoreVal");
const linesVal = document.getElementById("linesVal");
const levelVal = document.getElementById("levelVal");

const scoreSide = document.getElementById("scoreSide");
const linesSide = document.getElementById("linesSide");
const levelSide = document.getElementById("levelSide");
const levelBar = document.getElementById("levelBar");
const highScoreSide = document.getElementById("highScoreSide");
const comboSide = document.getElementById("comboSide");
const b2bSide = document.getElementById("b2bSide");

const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const gameOverText = document.getElementById("gameOverText");
const finalScore = document.getElementById("finalScore");
const finalLines = document.getElementById("finalLines");
const finalLevel = document.getElementById("finalLevel");
const finalHighScore = document.getElementById("finalHighScore");

// Game Components
const sound = new SoundManager();
const stats = new StatsManager();
const particles = new ParticleEngine();
const renderer = new Renderer(canvas, nextCanvas, holdCanvas);

let gameboyMode = false;
let animationId = null;
let lastTime = 0;
let maxComboThisGame = 0;
let tetrisesThisGame = 0;
let tspinsThisGame = 0;
let perfectClearsThisGame = 0;

// Initialize Engine with Event Hooks
const engine = new TetrisEngine({
  onPieceMove: (piece) => {
    sound.play("move");
  },

  onPieceRotate: (piece) => {
    sound.play("rotate");
  },

  onLock: (piece) => {
    // Blast particles where it lands
    particles.spawnHardDropBlast(piece, piece.y, gameboyMode);
  },

  onHold: (piece) => {
    sound.play("hold");
    particles.spawnBlockParticles(
      piece.x + piece.shape[0].length / 2,
      piece.y,
      "#ffffff",
      8,
      gameboyMode
    );
  },

  onLineClearStart: ({ rows, isTSpin }) => {
    sound.play("clear");
    particles.spawnLineClearExplosion(rows, engine.board.cols, engine.board.grid, gameboyMode);
  },

  onLineClearComplete: ({ linesCleared, scoreResult, leveledUp, level }) => {
    if (linesCleared === 4) {
      tetrisesThisGame++;
    }

    if (scoreResult.isTSpin) {
      tspinsThisGame++;
      sound.play("tspin");
    }

    if (scoreResult.isPerfectClear) {
      perfectClearsThisGame++;
      sound.play("perfectclear");
      particles.spawnText("PERFECT CLEAR!", canvas.width / 2, 220, "#00ff88", gameboyMode);
    }

    maxComboThisGame = Math.max(maxComboThisGame, scoreResult.newCombo);

    // Floating text banner
    if (scoreResult.actionText) {
      const textColor = scoreResult.isDifficult ? "#ff2d78" : "#00e5ff";
      particles.spawnText(scoreResult.actionText, canvas.width / 2, 170, textColor, gameboyMode);
    }

    if (scoreResult.newCombo >= 2) {
      particles.spawnText(`COMBO x${scoreResult.newCombo}!`, canvas.width / 2, 120, "#ff8800", gameboyMode);
    }

    if (leveledUp) {
      sound.play("levelup");
      particles.spawnText(`LEVEL UP! [${level}]`, canvas.width / 2, 70, "#ffe600", gameboyMode);
    }

    updateHUD();
  },

  onScore: ({ added, total, reason, detail }) => {
    updateHUD();
  },

  onGameOver: () => {
    sound.play("gameover");
    document.body.classList.add("shake");
    setTimeout(() => document.body.classList.remove("shake"), 350);

    const record = stats.recordGame({
      score: engine.score,
      lines: engine.linesCleared,
      level: engine.level,
      maxCombo: maxComboThisGame,
      tetrises: tetrisesThisGame,
      tspins: tspinsThisGame,
      perfectClears: perfectClearsThisGame
    });

    finalScore.textContent = String(engine.score).padStart(6, "0");
    finalLines.textContent = engine.linesCleared;
    finalLevel.textContent = engine.level;
    if (finalHighScore) {
      finalHighScore.textContent = String(stats.getHighScore()).padStart(6, "0");
    }

    gameOverScreen.style.display = "flex";
    gameOverText.style.animation = "none";
    gameOverText.offsetHeight; // trigger reflow
    gameOverText.style.animation = "slam 0.7s ease forwards";

    updateHUD();
  },

  onStateChange: (state) => {
    if (state === GameState.PAUSED) {
      pauseScreen.style.display = "flex";
    } else if (state === GameState.PLAYING) {
      pauseScreen.style.display = "none";
      gameOverScreen.style.display = "none";
    }
  }
});

// Input Handlers
const keyboard = new KeyboardHandler(engine);
const touch = new TouchHandler(engine, canvas);
const gamepad = new GamepadHandler(engine);

// ─── HUD UPDATE ──────────────────────────────────────────────
function updateHUD() {
  const pad = (n, len) => String(n).padStart(len, "0");

  if (scoreVal) scoreVal.textContent = pad(engine.score, 6);
  if (linesVal) linesVal.textContent = pad(engine.linesCleared, 2);
  if (levelVal) levelVal.textContent = pad(engine.level, 2);

  if (scoreSide) scoreSide.textContent = engine.score;
  if (linesSide) linesSide.textContent = engine.linesCleared;
  if (levelSide) levelSide.textContent = engine.level;

  if (highScoreSide) highScoreSide.textContent = stats.getHighScore();
  if (comboSide) comboSide.textContent = engine.combo > 0 ? `x${engine.combo}` : "0";
  if (b2bSide) {
    b2bSide.textContent = engine.b2bActive ? "ACTIVE" : "OFF";
    b2bSide.style.color = engine.b2bActive ? "var(--pink)" : "var(--muted)";
  }

  if (levelBar) {
    levelBar.style.width = ((engine.linesCleared % 10) / 10) * 100 + "%";
  }
}

// ─── GAMEBOY MODE TOGGLE ─────────────────────────────────────
export function toggleGameboyMode() {
  gameboyMode = !gameboyMode;
  document.body.classList.toggle("gameboy-mode", gameboyMode);
  renderer.setGameboyMode(gameboyMode);
}

// ─── RESTART & EXIT ──────────────────────────────────────────
export function restartGame() {
  pauseScreen.style.display = "none";
  gameOverScreen.style.display = "none";

  maxComboThisGame = 0;
  tetrisesThisGame = 0;
  tspinsThisGame = 0;
  perfectClearsThisGame = 0;

  particles.reset();
  engine.reset();
  updateHUD();

  lastTime = performance.now();
  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}

export function exitGame() {
  if (animationId) cancelAnimationFrame(animationId);
  engine.setState(GameState.GAME_OVER);
  pauseScreen.style.display = "none";
  gameOverScreen.style.display = "none";

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = gameboyMode ? "#0f380f" : "rgba(255,255,255,0.06)";
  ctx.font = gameboyMode ? "bold 20px 'Share Tech Mono'" : "20px Orbitron";
  ctx.textAlign = "center";
  ctx.fillText("THANKS FOR PLAYING", canvas.width / 2, canvas.height / 2);
}

export function togglePause() {
  engine.togglePause();
}

// ─── ATTACH GLOBAL BUTTONS ───────────────────────────────────
document.getElementById("btnGameboy")?.addEventListener("click", toggleGameboyMode);
document.getElementById("btnPause")?.addEventListener("click", togglePause);
document.getElementById("btnResume")?.addEventListener("click", togglePause);
document.getElementById("btnRestartPause")?.addEventListener("click", restartGame);
document.getElementById("btnExitPause")?.addEventListener("click", exitGame);
document.getElementById("btnPlayAgain")?.addEventListener("click", restartGame);
document.getElementById("btnExitGameOver")?.addEventListener("click", exitGame);

// Export to window for backwards compatibility if needed
window.toggleGameboyMode = toggleGameboyMode;
window.togglePause = togglePause;
window.restartGame = restartGame;
window.exitGame = exitGame;

// ─── MAIN GAME LOOP ──────────────────────────────────────────
function gameLoop(time = performance.now()) {
  if (engine.state === GameState.GAME_OVER) return;

  let delta = time - lastTime;
  lastTime = time;

  // Cap delta to prevent huge jumps when tab was inactive
  if (delta > 200) delta = 16.66;

  // Inputs
  gamepad.poll(delta);
  keyboard.update(delta);

  // Engine state update
  engine.update(delta);

  // Particle physics update
  particles.update(delta);

  // Render frame
  renderer.render(engine, particles);

  animationId = requestAnimationFrame(gameLoop);
}

// Start game
updateHUD();
lastTime = performance.now();
animationId = requestAnimationFrame(gameLoop);
