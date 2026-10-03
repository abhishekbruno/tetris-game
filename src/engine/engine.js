// ============================================================
//  TETRIS — engine.js
//  Core Tetris Engine Coordinator
// ============================================================

import {
  COLS,
  ROWS,
  LOCK_DELAY,
  LOCK_MAX_MOVES,
  FLASH_DURATION,
  SPEED_CURVE,
  GameState
} from "./constants.js";
import { Board } from "./board.js";
import { Bag } from "./bag.js";
import { createPiece } from "./pieces.js";
import { attemptRotation } from "./srs.js";
import { detectTSpin, calculateScore } from "./scoring.js";

export class TetrisEngine {
  constructor(options = {}) {
    this.board = new Board(options.cols || COLS, options.rows || ROWS);
    this.bag = new Bag(options.rng || Math.random);

    this.state = GameState.PLAYING;
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.combo = -1;
    this.b2bActive = false;

    this.currentPiece = null;
    this.holdPiece = null;
    this.holdUsed = false;

    // Movement & lock delay tracking
    this.dropCounter = 0;
    this.dropInterval = SPEED_CURVE[0];
    this.lockTimer = 0;
    this.lockMoves = 0;
    this.isLanding = false;
    this.lastActionWasRotate = false;
    this.lastKickIndex = -1;

    // Line clear animation state
    this.flashRows = [];
    this.flashTimer = 0;
    this.pendingClearData = null;

    // Event hooks
    this.events = {
      onPieceMove: options.onPieceMove || (() => {}),
      onPieceRotate: options.onPieceRotate || (() => {}),
      onLock: options.onLock || (() => {}),
      onLineClearStart: options.onLineClearStart || (() => {}),
      onLineClearComplete: options.onLineClearComplete || (() => {}),
      onHold: options.onHold || (() => {}),
      onGameOver: options.onGameOver || (() => {}),
      onLevelUp: options.onLevelUp || (() => {}),
      onScore: options.onScore || (() => {}),
      onStateChange: options.onStateChange || (() => {})
    };

    this.spawnPiece();
  }

  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
    this.events.onStateChange(this.state);
  }

  reset() {
    this.board.clear();
    this.bag.reset();
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.combo = -1;
    this.b2bActive = false;
    this.holdPiece = null;
    this.holdUsed = false;
    this.dropCounter = 0;
    this.dropInterval = SPEED_CURVE[0];
    this.lockTimer = 0;
    this.lockMoves = 0;
    this.isLanding = false;
    this.lastActionWasRotate = false;
    this.lastKickIndex = -1;
    this.flashRows = [];
    this.flashTimer = 0;
    this.pendingClearData = null;
    this.setState(GameState.PLAYING);
    this.spawnPiece();
  }

  spawnPiece() {
    this.currentPiece = this.bag.next();
    this.lockTimer = 0;
    this.lockMoves = 0;
    this.isLanding = this.board.collides(this.currentPiece, 0, 1);
    this.lastActionWasRotate = false;
    this.lastKickIndex = -1;

    // If spawned piece collides immediately, game over!
    if (this.board.collides(this.currentPiece, 0, 0)) {
      this.setState(GameState.GAME_OVER);
      this.events.onGameOver();
    }
  }

  hold() {
    if (this.state !== GameState.PLAYING || this.holdUsed) return false;

    this.holdUsed = true;
    this.lastActionWasRotate = false;
    this.lastKickIndex = -1;

    const currentId = this.currentPiece.id;

    if (!this.holdPiece) {
      this.holdPiece = createPiece(currentId);
      this.spawnPiece();
    } else {
      const prevHoldId = this.holdPiece.id;
      this.holdPiece = createPiece(currentId);
      this.currentPiece = createPiece(prevHoldId);
      this.lockTimer = 0;
      this.lockMoves = 0;
      this.isLanding = this.board.collides(this.currentPiece, 0, 1);

      if (this.board.collides(this.currentPiece, 0, 0)) {
        this.setState(GameState.GAME_OVER);
        this.events.onGameOver();
        return true;
      }
    }

    this.events.onHold(this.holdPiece);
    return true;
  }

  moveLeft() {
    if (this.state !== GameState.PLAYING) return false;
    if (!this.board.collides(this.currentPiece, -1, 0)) {
      this.currentPiece.x--;
      this.lastActionWasRotate = false;
      this.lastKickIndex = -1;
      this.handleLockDelayReset();
      this.events.onPieceMove(this.currentPiece);
      return true;
    }
    return false;
  }

  moveRight() {
    if (this.state !== GameState.PLAYING) return false;
    if (!this.board.collides(this.currentPiece, 1, 0)) {
      this.currentPiece.x++;
      this.lastActionWasRotate = false;
      this.lastKickIndex = -1;
      this.handleLockDelayReset();
      this.events.onPieceMove(this.currentPiece);
      return true;
    }
    return false;
  }

  rotateCW() {
    return this.rotate(1);
  }

  rotateCCW() {
    return this.rotate(-1);
  }

  rotate(dir) {
    if (this.state !== GameState.PLAYING) return false;

    const result = attemptRotation(this.currentPiece, dir, (piece, dx, dy, rot) => {
      return this.board.collides(piece, dx, dy, rot);
    });

    if (result.success) {
      this.currentPiece.rotation = result.newRotation;
      this.currentPiece.x += result.kickOffset[0];
      this.currentPiece.y += result.kickOffset[1];
      this.lastActionWasRotate = true;
      this.lastKickIndex = result.kickIndex;
      this.handleLockDelayReset();
      this.events.onPieceRotate(this.currentPiece);
      return true;
    }

    return false;
  }

  handleLockDelayReset() {
    // Check whether the piece is now supported from below
    const currentlyOnFloor = this.board.collides(this.currentPiece, 0, 1);

    if (currentlyOnFloor) {
      if (this.isLanding && this.lockMoves < LOCK_MAX_MOVES) {
        this.lockTimer = 0;
        this.lockMoves++;
      }
      this.isLanding = true;
    } else {
      // In mid-air: reset landing state
      this.isLanding = false;
      this.lockTimer = 0;
    }
  }

  softDrop() {
    if (this.state !== GameState.PLAYING) return false;

    if (!this.board.collides(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
      this.score += 1;
      this.lastActionWasRotate = false;
      this.lastKickIndex = -1;
      this.isLanding = this.board.collides(this.currentPiece, 0, 1);
      if (!this.isLanding) {
        this.lockTimer = 0;
      }
      this.events.onPieceMove(this.currentPiece);
      this.events.onScore({ added: 1, total: this.score, reason: 'softDrop' });
      return true;
    } else {
      this.isLanding = true;
      return false;
    }
  }

  hardDrop() {
    if (this.state !== GameState.PLAYING) return 0;

    let dropDist = 0;
    while (!this.board.collides(this.currentPiece, 0, 1)) {
      this.currentPiece.y++;
      dropDist++;
    }

    const addedPoints = dropDist * 2;
    this.score += addedPoints;
    this.lastActionWasRotate = false;
    this.lastKickIndex = -1;

    this.events.onScore({ added: addedPoints, total: this.score, reason: 'hardDrop' });
    this.lockPiece();
    return dropDist;
  }

  lockPiece() {
    if (this.state !== GameState.PLAYING) return;

    // Detect T-Spin before locking into board grid
    const tspinResult = detectTSpin(
      this.currentPiece,
      this.board,
      this.lastActionWasRotate,
      this.lastKickIndex
    );

    // Lock piece blocks onto board
    const { lockedAboveCeiling } = this.board.lockPiece(this.currentPiece);

    this.events.onLock(this.currentPiece);
    this.holdUsed = false;

    if (lockedAboveCeiling) {
      this.setState(GameState.GAME_OVER);
      this.events.onGameOver();
      return;
    }

    // Check full lines
    const fullRows = this.board.findFullLines();

    if (fullRows.length > 0) {
      // Transition to line clear state to prevent async race condition!
      this.setState(GameState.LINE_CLEAR);
      this.flashRows = fullRows;
      this.flashTimer = FLASH_DURATION;
      this.pendingClearData = {
        fullRows,
        isTSpin: tspinResult.isTSpin,
        isMini: tspinResult.isMini
      };
      this.events.onLineClearStart({
        rows: fullRows,
        isTSpin: tspinResult.isTSpin,
        isMini: tspinResult.isMini
      });
    } else {
      // 0 lines cleared (could be T-Spin 0 lines)
      if (tspinResult.isTSpin) {
        const scoreResult = calculateScore({
          linesCleared: 0,
          level: this.level,
          isTSpin: true,
          isMini: tspinResult.isMini,
          isPerfectClear: false,
          b2bActive: this.b2bActive,
          currentCombo: this.combo
        });
        this.score += scoreResult.points;
        this.combo = scoreResult.newCombo;
        this.events.onScore({ added: scoreResult.points, total: this.score, detail: scoreResult });
      } else {
        this.combo = -1;
      }
      this.spawnPiece();
    }
  }

  completeLineClear() {
    if (!this.pendingClearData) return;

    const { fullRows, isTSpin, isMini } = this.pendingClearData;

    // Remove rows from board
    this.board.clearLines(fullRows);
    this.linesCleared += fullRows.length;

    // Check perfect clear
    const isPerfectClear = this.board.isPerfectClear();

    // Calculate score
    const scoreResult = calculateScore({
      linesCleared: fullRows.length,
      level: this.level,
      isTSpin,
      isMini,
      isPerfectClear,
      b2bActive: this.b2bActive,
      currentCombo: this.combo
    });

    this.score += scoreResult.points;
    this.combo = scoreResult.newCombo;
    this.b2bActive = scoreResult.nextB2bActive;

    // Level progression (every 10 lines)
    const newLevel = Math.floor(this.linesCleared / 10) + 1;
    let leveledUp = false;
    if (newLevel > this.level) {
      this.level = newLevel;
      const speedIdx = Math.min(this.level - 1, SPEED_CURVE.length - 1);
      this.dropInterval = SPEED_CURVE[speedIdx];
      leveledUp = true;
    }

    this.events.onLineClearComplete({
      rows: fullRows,
      linesCleared: fullRows.length,
      scoreResult,
      leveledUp,
      level: this.level,
      totalScore: this.score
    });

    if (leveledUp) {
      this.events.onLevelUp(this.level);
    }

    this.pendingClearData = null;
    this.flashRows = [];
    this.flashTimer = 0;

    // Return to playing state and spawn next piece
    this.setState(GameState.PLAYING);
    this.spawnPiece();
  }

  update(delta) {
    if (this.state === GameState.PAUSED || this.state === GameState.GAME_OVER) {
      return;
    }

    // Line clear animation in progress
    if (this.state === GameState.LINE_CLEAR) {
      this.flashTimer -= delta;
      if (this.flashTimer <= 0) {
        this.completeLineClear();
      }
      return;
    }

    // Check lock delay
    this.isLanding = this.board.collides(this.currentPiece, 0, 1);

    if (this.isLanding) {
      this.lockTimer += delta;
      if (this.lockTimer >= LOCK_DELAY || this.lockMoves >= LOCK_MAX_MOVES) {
        this.lockPiece();
        return;
      }
    } else {
      this.lockTimer = 0;
    }

    // Normal gravity drop
    this.dropCounter += delta;
    if (this.dropCounter >= this.dropInterval) {
      this.dropCounter = 0;
      if (!this.board.collides(this.currentPiece, 0, 1)) {
        this.currentPiece.y++;
        this.lastActionWasRotate = false;
        this.lastKickIndex = -1;
        this.isLanding = this.board.collides(this.currentPiece, 0, 1);
        this.events.onPieceMove(this.currentPiece);
      } else {
        this.isLanding = true;
      }
    }
  }

  togglePause() {
    if (this.state === GameState.GAME_OVER) return;

    if (this.state === GameState.PAUSED) {
      this.setState(this.previousState || GameState.PLAYING);
    } else {
      this.previousState = this.state;
      this.setState(GameState.PAUSED);
    }
  }
}
