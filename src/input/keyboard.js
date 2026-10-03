// ============================================================
//  TETRIS — keyboard.js
//  Keyboard input handling with DAS and ARR
// ============================================================

import { DAS_DELAY, DAS_RATE } from "../engine/constants.js";

export class KeyboardHandler {
  constructor(engine) {
    this.engine = engine;
    this.keys = {};
    this.dasKey = null;
    this.dasTimer = 0;
    this.dasRepeatTimer = 0;

    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onKeyUp = this.handleKeyUp.bind(this);

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  handleKeyDown(e) {
    // If repeat is already tracked, ignore
    if (this.keys[e.key]) return;
    this.keys[e.key] = true;

    // Pause toggle
    if (e.key === "p" || e.key === "P" || e.key === "Escape") {
      this.engine.togglePause();
      return;
    }

    if (this.engine.state !== "PLAYING") return;

    switch (e.key) {
      case "ArrowLeft":
      case "a":
      case "A":
        this.engine.moveLeft();
        this.dasKey = "left";
        this.dasTimer = 0;
        this.dasRepeatTimer = 0;
        break;

      case "ArrowRight":
      case "d":
      case "D":
        this.engine.moveRight();
        this.dasKey = "right";
        this.dasTimer = 0;
        this.dasRepeatTimer = 0;
        break;

      case "ArrowDown":
      case "s":
      case "S":
        this.engine.softDrop();
        this.dasKey = "down";
        this.dasTimer = 0;
        this.dasRepeatTimer = 0;
        break;

      case "ArrowUp":
      case "w":
      case "W":
      case "x":
      case "X":
        this.engine.rotateCW();
        break;

      case "z":
      case "Z":
      case "Control":
        this.engine.rotateCCW();
        break;

      case " ":
        e.preventDefault();
        this.engine.hardDrop();
        break;

      case "c":
      case "C":
      case "Shift":
        this.engine.hold();
        break;
    }
  }

  handleKeyUp(e) {
    this.keys[e.key] = false;

    const isLeftKey = e.key === "ArrowLeft" || e.key === "a" || e.key === "A";
    const isRightKey = e.key === "ArrowRight" || e.key === "d" || e.key === "D";
    const isDownKey = e.key === "ArrowDown" || e.key === "s" || e.key === "S";

    if ((this.dasKey === "left" && isLeftKey) ||
        (this.dasKey === "right" && isRightKey) ||
        (this.dasKey === "down" && isDownKey)) {
      this.dasKey = null;
      this.dasTimer = 0;
      this.dasRepeatTimer = 0;
    }
  }

  update(delta) {
    if (!this.dasKey || this.engine.state !== "PLAYING") return;

    this.dasTimer += delta;
    if (this.dasTimer < DAS_DELAY) return;

    this.dasRepeatTimer += delta;
    while (this.dasRepeatTimer >= DAS_RATE) {
      this.dasRepeatTimer -= DAS_RATE;
      if (this.dasKey === "left") this.engine.moveLeft();
      else if (this.dasKey === "right") this.engine.moveRight();
      else if (this.dasKey === "down") this.engine.softDrop();
    }
  }
}
