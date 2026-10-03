// ============================================================
//  Tests — scoring.test.js
// ============================================================

import test from "node:test";
import assert from "node:assert/strict";
import { calculateScore, detectTSpin } from "../src/engine/scoring.js";
import { Board } from "../src/engine/board.js";
import { createPiece } from "../src/engine/pieces.js";

test("Single, Double, Triple, Tetris score calculations", () => {
  // Level 1
  const single = calculateScore({ linesCleared: 1, level: 1, isTSpin: false, isMini: false, isPerfectClear: false, b2bActive: false, currentCombo: -1 });
  assert.equal(single.points, 100);
  assert.equal(single.actionText, "SINGLE");

  const double = calculateScore({ linesCleared: 2, level: 1, isTSpin: false, isMini: false, isPerfectClear: false, b2bActive: false, currentCombo: -1 });
  assert.equal(double.points, 300);

  const triple = calculateScore({ linesCleared: 3, level: 1, isTSpin: false, isMini: false, isPerfectClear: false, b2bActive: false, currentCombo: -1 });
  assert.equal(triple.points, 500);

  const tetris = calculateScore({ linesCleared: 4, level: 1, isTSpin: false, isMini: false, isPerfectClear: false, b2bActive: false, currentCombo: -1 });
  assert.equal(tetris.points, 800);
  assert.equal(tetris.nextB2bActive, true);

  // Level 3 Tetris with B2B
  const b2bTetris = calculateScore({ linesCleared: 4, level: 3, isTSpin: false, isMini: false, isPerfectClear: false, b2bActive: true, currentCombo: -1 });
  assert.equal(b2bTetris.points, 1200 * 3);
  assert.equal(b2bTetris.actionText, "B2B TETRIS");
});

test("T-Spin Single, Double, Triple score calculations", () => {
  const tss = calculateScore({ linesCleared: 1, level: 1, isTSpin: true, isMini: false, isPerfectClear: false, b2bActive: false, currentCombo: -1 });
  assert.equal(tss.points, 800);
  assert.equal(tss.nextB2bActive, true);

  const tsd = calculateScore({ linesCleared: 2, level: 2, isTSpin: true, isMini: false, isPerfectClear: false, b2bActive: true, currentCombo: -1 });
  assert.equal(tsd.points, 1800 * 2);
  assert.equal(tsd.actionText, "B2B T-SPIN DOUBLE");

  const tst = calculateScore({ linesCleared: 3, level: 1, isTSpin: true, isMini: false, isPerfectClear: false, b2bActive: false, currentCombo: -1 });
  assert.equal(tst.points, 1600);
});

test("Combos accumulate correctly", () => {
  // First clear (combo 0)
  const c0 = calculateScore({ linesCleared: 1, level: 1, isTSpin: false, isMini: false, isPerfectClear: false, b2bActive: false, currentCombo: -1 });
  assert.equal(c0.newCombo, 0);
  assert.equal(c0.points, 100);

  // Second clear (combo 1: +50 * 1 * 1)
  const c1 = calculateScore({ linesCleared: 1, level: 1, isTSpin: false, isMini: false, isPerfectClear: false, b2bActive: false, currentCombo: 0 });
  assert.equal(c1.newCombo, 1);
  assert.equal(c1.points, 100 + 50);

  // Third clear (combo 2: +50 * 2 * 1)
  const c2 = calculateScore({ linesCleared: 1, level: 1, isTSpin: false, isMini: false, isPerfectClear: false, b2bActive: false, currentCombo: 1 });
  assert.equal(c2.newCombo, 2);
  assert.equal(c2.points, 100 + 100);
});

test("Perfect Clear bonus is applied", () => {
  const pcSingle = calculateScore({ linesCleared: 1, level: 2, isTSpin: false, isMini: false, isPerfectClear: true, b2bActive: false, currentCombo: -1 });
  assert.equal(pcSingle.perfectClearPoints, 800 * 2);
  assert.equal(pcSingle.points, (100 + 800) * 2);

  const pcTetris = calculateScore({ linesCleared: 4, level: 1, isTSpin: false, isMini: false, isPerfectClear: true, b2bActive: false, currentCombo: -1 });
  assert.equal(pcTetris.perfectClearPoints, 2000);
  assert.equal(pcTetris.points, 800 + 2000);
});

test("T-Spin 3-corner detection distinguishes full vs mini", () => {
  const board = new Board(10, 20);
  const piece = createPiece("T");
  piece.x = 4;
  piece.y = 15;
  piece.rotation = 0; // Pointing up: front corners are NW (x=4, y=15), NE (x=6, y=15)
                      // Center is cx=5, cy=16

  // Put blocks at NW, NE, and SW
  board.grid[15][4] = "#ffffff"; // NW (front)
  board.grid[15][6] = "#ffffff"; // NE (front)
  board.grid[17][4] = "#ffffff"; // SW (rear)

  const fullResult = detectTSpin(piece, board, true, 0);
  assert.equal(fullResult.isTSpin, true);
  assert.equal(fullResult.isMini, false); // Both front corners occupied!

  // Now remove NE and fill SE so we have NW (1 front) + SW and SE (2 rear)
  board.grid[15][6] = 0;          // NE cleared
  board.grid[17][6] = "#ffffff"; // SE (rear)

  const miniResult = detectTSpin(piece, board, true, 0);
  assert.equal(miniResult.isTSpin, true);
  assert.equal(miniResult.isMini, true); // Only 1 front corner occupied -> Mini!
});
