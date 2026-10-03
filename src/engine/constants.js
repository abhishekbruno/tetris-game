// ============================================================
//  TETRIS — constants.js
// ============================================================

export const COLS = 10;
export const ROWS = 20;
export const SIZE = 30;

// DAS — Delayed Auto Shift (hold-to-repeat movement)
export const DAS_DELAY = 160;  // ms before auto-repeat kicks in
export const DAS_RATE = 45;    // ms between repeats

// Lock delay — standard Guideline time to slide a piece after it lands
export const LOCK_DELAY = 500;     // ms before piece locks
export const LOCK_MAX_MOVES = 15;  // max moves/rotates before forced lock

// Line clear flash animation duration
export const FLASH_DURATION = 250; // ms

// NES/Guideline speed curve (ms per drop, indexed by level 1-20+)
export const SPEED_CURVE = [
  800, 715, 632, 549, 466, 383, 300, 216, 133, 100,
  83,  83,  83,  67,  67,  67,  50,  50,  50,  33,
  33,  33,  20
];

export const GameState = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  LINE_CLEAR: 'LINE_CLEAR',
  GAME_OVER: 'GAME_OVER'
};
