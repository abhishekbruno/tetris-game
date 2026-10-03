// ============================================================
//  Tests — board.test.js
// ============================================================

import test from "node:test";
import assert from "node:assert/strict";
import { Board } from "../src/engine/board.js";
import { createPiece } from "../src/engine/pieces.js";

test("Board initializes with empty grid", () => {
  const board = new Board(10, 20);
  assert.equal(board.cols, 10);
  assert.equal(board.rows, 20);
  assert.equal(board.isPerfectClear(), true);
});

test("Board detects floor and wall collisions", () => {
  const board = new Board(10, 20);
  const piece = createPiece("O"); // 2x2, x=4, y=0

  assert.equal(board.collides(piece, 0, 0), false);
  assert.equal(board.collides(piece, -5, 0), true); // left wall
  assert.equal(board.collides(piece, 5, 0), true);  // right wall
  assert.equal(board.collides(piece, 0, 19), true); // floor
});

test("Board locks piece and detects full lines", () => {
  const board = new Board(10, 20);

  // Fill bottom row except cells 4, 5
  for (let c = 0; c < 10; c++) {
    if (c !== 4 && c !== 5) {
      board.grid[19][c] = "#ffffff";
    }
  }

  const piece = createPiece("O"); // x=4, y=0
  piece.y = 18; // occupies y=18 and y=19 at x=4, 5

  board.lockPiece(piece);

  const fullLines = board.findFullLines();
  assert.deepEqual(fullLines, [19]);

  const clearedCount = board.clearLines(fullLines);
  assert.equal(clearedCount, 1);
  assert.equal(board.grid[19].every(c => c === 0), false); // row 18 shifted down
  assert.equal(board.grid[19][4], piece.color);
  assert.equal(board.grid[19][5], piece.color);
});

test("Board detects Perfect Clear", () => {
  const board = new Board(10, 20);

  // Fill bottom row completely
  for (let c = 0; c < 10; c++) {
    board.grid[19][c] = "#00e5ff";
  }

  assert.equal(board.isPerfectClear(), false);
  board.clearLines([19]);
  assert.equal(board.isPerfectClear(), true);
});

test("Board calculates ghost Y position accurately", () => {
  const board = new Board(10, 20);
  const piece = createPiece("I"); // 4x4 matrix, blocks in row 1, spawn y = -1, blocks at board y=0
  // Lowest row of I in rotation 0 is board row 0
  const ghostY = board.getGhostY(piece);
  assert.equal(ghostY, 18); // Row 1 of piece is at 18+1 = 19 (bottom of board)
});
