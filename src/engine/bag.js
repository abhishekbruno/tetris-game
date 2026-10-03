// ============================================================
//  TETRIS — bag.js
//  7-Bag Randomizer
// ============================================================

import { PIECE_IDS, createPiece } from "./pieces.js";

export class Bag {
  constructor(rng = Math.random) {
    this.rng = rng;
    this.bag = [];
    this.queue = [];
    // Pre-fill queue with at least 7 pieces
    this.ensureQueue(7);
  }

  generateBag() {
    const newBag = [...PIECE_IDS];
    // Fisher-Yates shuffle
    for (let i = newBag.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [newBag[i], newBag[j]] = [newBag[j], newBag[i]];
    }
    return newBag;
  }

  ensureQueue(minSize = 7) {
    while (this.queue.length < minSize) {
      if (this.bag.length === 0) {
        this.bag = this.generateBag();
      }
      this.queue.push(this.bag.shift());
    }
  }

  /**
   * Retrieves and removes the next piece from the queue.
   */
  next() {
    this.ensureQueue(8);
    const id = this.queue.shift();
    return createPiece(id);
  }

  /**
   * Looks ahead in the queue without consuming pieces.
   * @param {number} count Number of upcoming pieces to peek.
   * @returns {Array<string>} Array of piece IDs.
   */
  peek(count = 1) {
    this.ensureQueue(count + 1);
    return this.queue.slice(0, count);
  }

  reset() {
    this.bag = [];
    this.queue = [];
    this.ensureQueue(7);
  }
}
