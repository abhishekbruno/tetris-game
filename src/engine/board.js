// ============================================================
//  TETRIS — board.js
//  Board management, collision detection, and line clearing
// ============================================================

import { COLS, ROWS } from "./constants.js";
import { TETROMINOES } from "./pieces.js";

export class Board {
  constructor(cols = COLS, rows = ROWS) {
    this.cols = cols;
    this.rows = rows;
    this.grid = this.createGrid();
  }

  createGrid() {
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
  }

  clear() {
    this.grid = this.createGrid();
  }

  /**
   * Tests whether a piece at (piece.x + dx, piece.y + dy) with rotation `rot` collides with board or bounds.
   * If rot is undefined, uses piece.rotation.
   */
  collides(piece, dx = 0, dy = 0, rot = piece.rotation) {
    const shape = TETROMINOES[piece.id].shapes[rot];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const nx = piece.x + c + dx;
        const ny = piece.y + r + dy;

        // Horizontal and floor bounds
        if (nx < 0 || nx >= this.cols || ny >= this.rows) {
          return true;
        }

        // Above the ceiling is allowed for rotation / spawn
        if (ny >= 0 && this.grid[ny][nx] !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Locks the piece into the board grid.
   * Returns true if any block was locked above row 0 (or all valid).
   */
  lockPiece(piece) {
    const shape = piece.shape;
    let lockedAboveCeiling = false;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const nx = piece.x + c;
        const ny = piece.y + r;

        if (ny < 0) {
          lockedAboveCeiling = true;
        } else if (ny < this.rows && nx >= 0 && nx < this.cols) {
          this.grid[ny][nx] = piece.color;
        }
      }
    }

    return { lockedAboveCeiling };
  }

  /**
   * Finds all full row indices (from top to bottom).
   */
  findFullLines() {
    const full = [];
    for (let r = 0; r < this.rows; r++) {
      if (this.grid[r].every(cell => cell !== 0)) {
        full.push(r);
      }
    }
    return full;
  }

  /**
   * Removes full rows and inserts empty rows at the top.
   * @param {number[]} rowIndices
   */
  clearLines(rowIndices) {
    if (!rowIndices || rowIndices.length === 0) return 0;

    // Sort ascending
    const sorted = [...rowIndices].sort((a, b) => a - b);
    for (const r of sorted) {
      this.grid.splice(r, 1);
      this.grid.unshift(Array(this.cols).fill(0));
    }

    return sorted.length;
  }

  /**
   * Returns true if every cell in the board is empty.
   */
  isPerfectClear() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] !== 0) return false;
      }
    }
    return true;
  }

  /**
   * Calculates the ghost Y coordinate for a given piece.
   */
  getGhostY(piece) {
    let ghostY = piece.y;
    while (!this.collides(piece, 0, ghostY - piece.y + 1)) {
      ghostY++;
    }
    return ghostY;
  }
}
