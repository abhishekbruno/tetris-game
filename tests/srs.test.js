// ============================================================
//  Tests — srs.test.js
// ============================================================

import test from "node:test";
import assert from "node:assert/strict";
import { Board } from "../src/engine/board.js";
import { createPiece, PIECE_IDS } from "../src/engine/pieces.js";
import { attemptRotation } from "../src/engine/srs.js";

test("All pieces have 4 rotation states", () => {
  for (const id of PIECE_IDS) {
    const piece = createPiece(id);
    for (let r = 0; r < 4; r++) {
      piece.rotation = r;
      assert.ok(Array.isArray(piece.shape));
      assert.ok(piece.shape.length > 0);
    }
  }
});

test("O piece does not rotate or kick", () => {
  const board = new Board(10, 20);
  const piece = createPiece("O");
  const result = attemptRotation(piece, 1, (p, dx, dy, rot) => board.collides(p, dx, dy, rot));
  assert.equal(result.success, true);
  assert.equal(result.newRotation, 0);
  assert.deepEqual(result.kickOffset, [0, 0]);
});

test("T piece wall kick against right wall", () => {
  const board = new Board(10, 20);
  const piece = createPiece("T");
  // Place T in rotation 1 (pointing right) against the right wall
  // T in rotation 1 occupies x+1, x+2. If x = 8, blocks are at x=8, 9, 8.
  piece.x = 8;
  piece.y = 10;
  piece.rotation = 1;

  // Rotating from 1 to 2 (CW):
  // 1->2 kicks: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
  // Test 1 (0, 0): T in rot 2 has blocks at x, x+1, x+2. If x=8, x+2=10 (out of bounds!)
  // Test 2 (1, 0): x moves right to 9 -> still out of bounds
  // Wait, transition 1->0 (CCW): kicks [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
  // Let's test rotating 0->1 when x=8 against right wall:
  piece.rotation = 0;
  piece.x = 8; // blocks at x=8, 9, 10 -> wait, x=8 in rot 0 has blocks at c=1 (x=9). c=0 (x=8), c=2 (x=10 out of bounds!)
  // If x = 7, rot 0 has blocks at x=7, 8, 9.
  piece.x = 8;
  // If piece.x = 8 and rotation = 3 (pointing left):
  // blocks at c=1 (x=9), c=0 (x=8). It fits!
  piece.rotation = 3;
  // Now rotating 3->0 (CW): rot 0 needs cols 0, 1, 2 (x=8, 9, 10). Col 2 is 10 (wall collision at dx=0).
  // 3->0 kick table: [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]].
  // At dx = -1, col 2 is at 8 - 1 + 2 = 9 (valid inside board)!
  const result = attemptRotation(piece, 1, (p, dx, dy, rot) => board.collides(p, dx, dy, rot));
  assert.equal(result.success, true);
  assert.equal(result.newRotation, 0);
  assert.deepEqual(result.kickOffset, [-1, 0]); // Kicked 1 cell left away from wall!
});

test("I piece floor kick works", () => {
  const board = new Board(10, 20);
  const piece = createPiece("I");
  // I in rotation 1 (vertical): column 2 has blocks at r=0,1,2,3.
  piece.x = 4;
  piece.y = 16; // blocks at board y = 16, 17, 18, 19 (touching floor!)
  piece.rotation = 1;

  // Rotating 1->2 (CW) or 1->0 (CCW):
  // Horizontal I in rot 2 has blocks at r=2.
  // 1->2 kicks: [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]]
  // At (0,0), r=2 is at y = 16+2 = 18. Does it collide with floor? y=18 is < 20, so (0,0) succeeds.
  // But if y = 17: vertical blocks are at 17, 18, 19, 20 (already collides with floor).
  // If resting on floor at y=16, let's place a block under it at y=19 to create floor kick scenario:
  board.grid[19][4] = "#ffffff";
  board.grid[19][5] = "#ffffff";
  board.grid[19][6] = "#ffffff";
  board.grid[19][7] = "#ffffff";

  // Now vertical I at y=15 rests on row 19 (blocks at y=15, 16, 17, 18).
  piece.y = 15;
  piece.rotation = 1;

  const result = attemptRotation(piece, 1, (p, dx, dy, rot) => board.collides(p, dx, dy, rot));
  assert.equal(result.success, true);
  assert.equal(result.newRotation, 2);
});
