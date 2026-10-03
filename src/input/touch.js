// ============================================================
//  TETRIS — touch.js
//  Touch & Mobile controls without ghost clicks or scrolling interference
// ============================================================

export class TouchHandler {
  constructor(engine, canvasElement) {
    this.engine = engine;
    this.canvas = canvasElement;

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.hasMoved = false;

    this.onTouchStart = this.handleTouchStart.bind(this);
    this.onTouchMove = this.handleTouchMove.bind(this);
    this.onTouchEnd = this.handleTouchEnd.bind(this);

    if (this.canvas) {
      this.canvas.addEventListener("touchstart", this.onTouchStart, { passive: false });
      this.canvas.addEventListener("touchmove", this.onTouchMove, { passive: false });
      this.canvas.addEventListener("touchend", this.onTouchEnd, { passive: false });
    }

    this.bindButtons();
  }

  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener("touchstart", this.onTouchStart);
      this.canvas.removeEventListener("touchmove", this.onTouchMove);
      this.canvas.removeEventListener("touchend", this.onTouchEnd);
    }
  }

  bindButtons() {
    const bindBtn = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;

      const trigger = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.engine.state === "PLAYING") {
          action();
        }
      };

      // Use pointerdown or touchstart, and suppress click
      el.addEventListener("pointerdown", trigger);
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    };

    bindBtn("btnMobileHold", () => this.engine.hold());
    bindBtn("btnMobileLeft", () => this.engine.moveLeft());
    bindBtn("btnMobileRotate", () => this.engine.rotateCW());
    bindBtn("btnMobileRotateCCW", () => this.engine.rotateCCW());
    bindBtn("btnMobileRight", () => this.engine.moveRight());
    bindBtn("btnMobileSoftDrop", () => this.engine.softDrop());
    bindBtn("btnMobileHardDrop", () => this.engine.hardDrop());
  }

  handleTouchStart(e) {
    if (this.engine.state !== "PLAYING") return;
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = performance.now();
    this.hasMoved = false;
    e.preventDefault();
  }

  handleTouchMove(e) {
    if (this.engine.state !== "PLAYING") return;
    e.preventDefault();

    const touch = e.touches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;

    // Incremental drag for horizontal movement
    const stepX = 26;
    if (Math.abs(dx) >= stepX) {
      if (dx > 0) {
        this.engine.moveRight();
      } else {
        this.engine.moveLeft();
      }
      this.touchStartX = touch.clientX;
      this.hasMoved = true;
    }

    // Incremental drag down for soft drop
    const stepY = 26;
    if (dy >= stepY) {
      this.engine.softDrop();
      this.touchStartY = touch.clientY;
      this.hasMoved = true;
    }
  }

  handleTouchEnd(e) {
    if (this.engine.state !== "PLAYING") return;
    e.preventDefault();

    const duration = performance.now() - this.touchStartTime;

    // Quick tap without movement -> rotate CW
    if (!this.hasMoved && duration < 250) {
      this.engine.rotateCW();
    }
  }
}
