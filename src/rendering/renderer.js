// ============================================================
//  TETRIS — renderer.js
//  Canvas Rendering Engine for Main Board, Next Piece, and Hold Piece
// ============================================================

import { COLS, ROWS, SIZE, FLASH_DURATION } from "../engine/constants.js";
import { TETROMINOES } from "../engine/pieces.js";

export class Renderer {
  constructor(canvas, nextCanvas, holdCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.nextCanvas = nextCanvas;
    this.nextCtx = nextCanvas ? nextCanvas.getContext("2d") : null;

    this.holdCanvas = holdCanvas;
    this.holdCtx = holdCanvas ? holdCanvas.getContext("2d") : null;

    this.isGameboy = false;
    this.ghostAlpha = 0.22;

    this.bgCanvas = document.createElement("canvas");
    this.bgCanvas.width = COLS * SIZE;
    this.bgCanvas.height = ROWS * SIZE;
    this.bgCtx = this.bgCanvas.getContext("2d");

    this.initBgCache();
  }

  setGameboyMode(enabled) {
    this.isGameboy = enabled;
    this.ghostAlpha = enabled ? 0.35 : 0.22;
    this.initBgCache();
  }

  initBgCache() {
    const bgColor = this.isGameboy ? "#8bac0f" : "#07070f";
    const bgGridColor = this.isGameboy ? "rgba(15, 56, 15, 0.2)" : "rgba(255, 255, 255, 0.04)";

    this.bgCtx.fillStyle = bgColor;
    this.bgCtx.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);

    this.bgCtx.strokeStyle = bgGridColor;
    this.bgCtx.lineWidth = 0.5;
    this.bgCtx.beginPath();

    for (let r = 0; r <= ROWS; r++) {
      this.bgCtx.moveTo(0, r * SIZE);
      this.bgCtx.lineTo(COLS * SIZE, r * SIZE);
    }
    for (let c = 0; c <= COLS; c++) {
      this.bgCtx.moveTo(c * SIZE, 0);
      this.bgCtx.lineTo(c * SIZE, ROWS * SIZE);
    }
    this.bgCtx.stroke();
  }

  drawBlock(ctx, x, y, color, alpha = 1, blockSize = SIZE) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);

    // Subtle inner bevel / highlight (skip in GameBoy mode for flat DMG look)
    if (!this.isGameboy && alpha > 0.5) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      ctx.fillRect(x * blockSize + 1, y * blockSize + 1, blockSize - 2, 3);
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(x * blockSize + 1, (y + 1) * blockSize - 3, blockSize - 2, 2);
    }

    ctx.strokeStyle = this.isGameboy ? "#0f380f" : "rgba(0, 0, 0, 0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    ctx.globalAlpha = 1;
  }

  drawBoard(board, flashRows = [], flashTimer = 0) {
    for (let r = 0; r < board.rows; r++) {
      for (let c = 0; c < board.cols; c++) {
        if (board.grid[r][c]) {
          if (flashTimer > 0 && flashRows.includes(r)) {
            // Pulsing bright flash during line clear
            const progress = flashTimer / FLASH_DURATION;
            const pulse = Math.sin(progress * Math.PI);
            const color = this.isGameboy ? "#9bbc0f" : "#ffffff";
            this.drawBlock(this.ctx, c, r, color, 0.5 + pulse * 0.5);
          } else {
            const clr = this.isGameboy ? "#306230" : board.grid[r][c];
            this.drawBlock(this.ctx, c, r, clr);
          }
        }
      }
    }
  }

  drawGhost(piece, ghostY) {
    if (!piece) return;
    if (ghostY === piece.y) return;

    const clr = this.isGameboy ? "#306230" : piece.color;
    const shape = piece.shape;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const by = ghostY + r;
          if (by >= 0) {
            this.drawBlock(this.ctx, piece.x + c, by, clr, this.ghostAlpha);
          }
        }
      }
    }
  }

  drawCurrentPiece(piece) {
    if (!piece) return;
    const clr = this.isGameboy ? "#0f380f" : piece.color;
    const shape = piece.shape;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const by = piece.y + r;
          if (by >= 0) {
            this.drawBlock(this.ctx, piece.x + c, by, clr);
          }
        }
      }
    }
  }

  drawPreview(targetCtx, piece, disabled = false) {
    if (!targetCtx) return;
    const w = targetCtx.canvas.width;
    const h = targetCtx.canvas.height;

    const bg = this.isGameboy ? "#8bac0f" : "#04040d";
    targetCtx.fillStyle = bg;
    targetCtx.fillRect(0, 0, w, h);

    if (!piece) return;

    const def = TETROMINOES[piece.id];
    // Always use spawn orientation (rotation 0) for previews
    const shape = def.shapes[0];
    const blockSize = 20;

    // Calculate bounding box of active blocks
    let minR = shape.length, maxR = -1, minC = shape[0].length, maxC = -1;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }

    const pieceWidth = (maxC - minC + 1) * blockSize;
    const pieceHeight = (maxR - minR + 1) * blockSize;
    const startX = Math.round((w - pieceWidth) / 2) - minC * blockSize;
    const startY = Math.round((h - pieceHeight) / 2) - minR * blockSize;

    let clr = this.isGameboy ? "#0f380f" : def.color;
    const alpha = disabled ? 0.35 : 1.0;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const x = startX + c * blockSize;
          const y = startY + r * blockSize;

          targetCtx.globalAlpha = alpha;
          targetCtx.fillStyle = clr;
          targetCtx.fillRect(x, y, blockSize, blockSize);

          if (!this.isGameboy && !disabled) {
            targetCtx.fillStyle = "rgba(255, 255, 255, 0.18)";
            targetCtx.fillRect(x + 1, y + 1, blockSize - 2, 2);
          }

          targetCtx.strokeStyle = this.isGameboy ? "#0f380f" : "rgba(0, 0, 0, 0.4)";
          targetCtx.lineWidth = 1;
          targetCtx.strokeRect(x, y, blockSize, blockSize);
          targetCtx.globalAlpha = 1;
        }
      }
    }
  }

  render(engine, particleEngine) {
    // Draw background
    this.ctx.drawImage(this.bgCanvas, 0, 0);

    // Draw locked blocks
    this.drawBoard(engine.board, engine.flashRows, engine.flashTimer);

    // Only draw ghost and active piece when in playing state
    if (engine.state === "PLAYING" && engine.currentPiece) {
      const ghostY = engine.board.getGhostY(engine.currentPiece);
      this.drawGhost(engine.currentPiece, ghostY);
      this.drawCurrentPiece(engine.currentPiece);
    }

    // Draw particles and floating announcements
    if (particleEngine) {
      particleEngine.draw(this.ctx, this.isGameboy);
    }

    // Draw previews
    if (this.nextCtx) {
      const nextPieceId = engine.bag.peek(1)[0];
      this.drawPreview(this.nextCtx, nextPieceId ? { id: nextPieceId } : null);
    }

    if (this.holdCtx) {
      this.drawPreview(this.holdCtx, engine.holdPiece, engine.holdUsed);
    }
  }
}
