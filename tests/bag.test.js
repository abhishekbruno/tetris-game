// ============================================================
//  Tests — bag.test.js
// ============================================================

import test from "node:test";
import assert from "node:assert/strict";
import { Bag } from "../src/engine/bag.js";
import { PIECE_IDS } from "../src/engine/pieces.js";

test("Each bag contains exactly one of each 7 tetrominoes", () => {
  const bag = new Bag();

  // Draw 10 consecutive bags (70 pieces)
  for (let b = 0; b < 10; b++) {
    const drawn = [];
    for (let p = 0; p < 7; p++) {
      const piece = bag.next();
      drawn.push(piece.id);
    }

    assert.equal(drawn.length, 7);
    const unique = new Set(drawn);
    assert.equal(unique.size, 7, `Bag ${b} does not have 7 unique pieces: ${drawn.join(",")}`);

    for (const expectedId of PIECE_IDS) {
      assert.ok(unique.has(expectedId), `Bag ${b} missing piece ${expectedId}`);
    }
  }
});

test("Peek looks ahead without consuming queue", () => {
  const bag = new Bag();
  const next3 = bag.peek(3);
  assert.equal(next3.length, 3);

  const piece1 = bag.next();
  assert.equal(piece1.id, next3[0]);

  const piece2 = bag.next();
  assert.equal(piece2.id, next3[1]);

  const piece3 = bag.next();
  assert.equal(piece3.id, next3[2]);
});
