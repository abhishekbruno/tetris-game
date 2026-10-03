// ============================================================
//  TETRIS — gamepad.js
//  Gamepad Controller Support
// ============================================================

export class GamepadHandler {
  constructor(engine) {
    this.engine = engine;
    this.prev = {
      left: false,
      right: false,
      down: false,
      rotateCW: false,
      rotateCCW: false,
      hardDrop: false,
      hold: false,
      pause: false
    };

    this.dasDir = null;
    this.dasTimer = 0;
    this.dasRepeat = 0;
  }

  poll(delta) {
    if (!navigator.getGamepads) return;
    const gp = navigator.getGamepads()[0];
    if (!gp) return;

    const btn = (i) => Boolean(gp.buttons[i]?.pressed);
    const axisX = gp.axes[0] || 0;
    const axisY = gp.axes[1] || 0;

    // Pause toggle
    const pause = btn(9) || btn(8); // Start / Select
    if (pause && !this.prev.pause) {
      this.engine.togglePause();
    }
    this.prev.pause = pause;

    if (this.engine.state !== "PLAYING") return;

    // D-Pad or Left Stick
    const left = btn(14) || axisX < -0.5;
    const right = btn(15) || axisX > 0.5;
    const down = btn(13) || axisY > 0.5;
    const rotateCW = btn(0) || btn(3) || btn(12); // A, Y, D-Pad Up
    const rotateCCW = btn(2) || btn(1);           // X, B
    const hardDrop = btn(12) && axisY < -0.7;     // D-Pad Up or hard stick up
    const hold = btn(4) || btn(5) || btn(6) || btn(7); // Bumpers / Triggers

    // Initial presses
    if (left && !this.prev.left) {
      this.engine.moveLeft();
      this.dasDir = "left";
      this.dasTimer = 0;
      this.dasRepeat = 0;
    } else if (!left && this.prev.left && this.dasDir === "left") {
      this.dasDir = null;
    }

    if (right && !this.prev.right) {
      this.engine.moveRight();
      this.dasDir = "right";
      this.dasTimer = 0;
      this.dasRepeat = 0;
    } else if (!right && this.prev.right && this.dasDir === "right") {
      this.dasDir = null;
    }

    if (down && !this.prev.down) {
      this.engine.softDrop();
      this.dasDir = "down";
      this.dasTimer = 0;
      this.dasRepeat = 0;
    } else if (!down && this.prev.down && this.dasDir === "down") {
      this.dasDir = null;
    }

    // Auto-repeat
    if (this.dasDir) {
      this.dasTimer += delta;
      if (this.dasTimer >= 160) {
        this.dasRepeat += delta;
        while (this.dasRepeat >= 45) {
          this.dasRepeat -= 45;
          if (this.dasDir === "left") this.engine.moveLeft();
          else if (this.dasDir === "right") this.engine.moveRight();
          else if (this.dasDir === "down") this.engine.softDrop();
        }
      }
    }

    if (rotateCW && !this.prev.rotateCW) this.engine.rotateCW();
    if (rotateCCW && !this.prev.rotateCCW) this.engine.rotateCCW();
    if (hold && !this.prev.hold) this.engine.hold();

    this.prev = { left, right, down, rotateCW, rotateCCW, hardDrop, hold, pause };
  }
}
