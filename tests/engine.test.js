// ============================================================
//  Tests — engine.test.js
// ============================================================

import test from "node:test";
import assert from "node:assert/strict";
import { TetrisEngine } from "../src/engine/engine.js";
import { GameState } from "../src/engine/constants.js";
import { createPiece } from "../src/engine/pieces.js";

test("Engine initializes in PLAYING state with piece and bag", () => {
  const engine = new TetrisEngine();
  assert.equal(engine.state, GameState.PLAYING);
  assert.ok(engine.currentPiece);
  assert.equal(engine.holdPiece, null);
  assert.equal(engine.holdUsed, false);
});

test("Hold can only be used once per piece drop", () => {
  const engine = new TetrisEngine();
  const firstPieceId = engine.currentPiece.id;

  // First hold succeeds
  const hold1 = engine.hold();
  assert.equal(hold1, true);
  assert.equal(engine.holdPiece.id, firstPieceId);
  assert.equal(engine.holdUsed, true);

  // Second hold in same turn fails
  const hold2 = engine.hold();
  assert.equal(hold2, false);

  // Hard drop locks piece and spawns new piece, resetting holdUsed
  engine.hardDrop();
  assert.equal(engine.holdUsed, false);

  // Hold can now be used again (swapping with the held piece)
  const hold3 = engine.hold();
  assert.equal(hold3, true);
  assert.equal(engine.currentPiece.id, firstPieceId);
});

test("Pause and Resume toggle state correctly", () => {
  const engine = new TetrisEngine();
  assert.equal(engine.state, GameState.PLAYING);

  engine.togglePause();
  assert.equal(engine.state, GameState.PAUSED);

  // Inputs should be rejected while paused
  const moved = engine.moveLeft();
  assert.equal(moved, false);

  engine.togglePause();
  assert.equal(engine.state, GameState.PLAYING);
});

test("Line clear completes without premature spawning", () => {
  const engine = new TetrisEngine();

  // Fill bottom row except cells 4, 5
  for (let c = 0; c < 10; c++) {
    if (c !== 4 && c !== 5) {
      engine.board.grid[19][c] = "#ffffff";
    }
  }

  // Force currentPiece to be O piece at x=4, y=18
  engine.currentPiece = createPiece("O");
  engine.currentPiece.x = 4;
  engine.currentPiece.y = 18;

  // Lock the piece to trigger line clear
  engine.lockPiece();

  // Engine must be in LINE_CLEAR state (not PLAYING yet)
  assert.equal(engine.state, GameState.LINE_CLEAR);
  assert.equal(engine.flashRows.length, 1);

  // While in LINE_CLEAR, update handles the flash timer
  engine.update(100);
  assert.equal(engine.state, GameState.LINE_CLEAR);

  // Finish flash timer
  engine.update(200);

  // Now lines are cleared, score added, and engine is back to PLAYING with a new piece
  assert.equal(engine.state, GameState.PLAYING);
  assert.equal(engine.linesCleared, 1);
  assert.equal(engine.score, 100);
});

test("Game over triggered on top out", () => {
  let gameOverFired = false;
  const engine = new TetrisEngine({
    onGameOver: () => { gameOverFired = true; }
  });

  // Fill the top rows to force spawn collision
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 10; c++) {
      engine.board.grid[r][c] = "#ff0000";
    }
  }

  engine.spawnPiece();
  assert.equal(engine.state, GameState.GAME_OVER);
  assert.equal(gameOverFired, true);
});
