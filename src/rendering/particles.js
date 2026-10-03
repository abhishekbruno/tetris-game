// ============================================================
//  TETRIS — particles.js
//  Cyberpunk Particle Engine & Floating Announcement Texts
// ============================================================

import { SIZE } from "../engine/constants.js";

export class ParticleEngine {
  constructor() {
    this.particles = [];
    this.floatTexts = [];
  }

  reset() {
    this.particles = [];
    this.floatTexts = [];
  }

  spawnBlockParticles(x, y, color, count = 4, isGameboy = false) {
    const finalColor = isGameboy ? "#0f380f" : color;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x * SIZE + SIZE / 2,
        y: y * SIZE + SIZE / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14 - 3,
        life: 1.0,
        decay: 0.025 + Math.random() * 0.015,
        color: finalColor,
        size: Math.random() * 6 + 2
      });
    }
  }

  spawnLineClearExplosion(rows, cols, boardGrid, isGameboy = false) {
    for (const r of rows) {
      for (let c = 0; c < cols; c++) {
        const color = boardGrid[r][c] || "#00e5ff";
        this.spawnBlockParticles(c, r, color, 5, isGameboy);
      }
    }
  }

  spawnHardDropBlast(piece, startY, isGameboy = false) {
    const shape = piece.shape;
    const color = isGameboy ? "#0f380f" : piece.color;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const bx = piece.x + c;
        const by = piece.y + r;
        this.spawnBlockParticles(bx, by, color, 3, isGameboy);

        if (piece.y - startY > 3) {
          // Trail particle
          this.particles.push({
            x: bx * SIZE + SIZE / 2,
            y: (by - 1) * SIZE + SIZE / 2,
            vx: (Math.random() - 0.5) * 3,
            vy: -2,
            life: 0.6,
            decay: 0.04,
            color: isGameboy ? "#306230" : "#ffffff",
            size: 3
          });
        }
      }
    }
  }

  spawnText(msg, x, y, color = "#00e5ff", isGameboy = false) {
    const finalColor = isGameboy ? "#0f380f" : color;
    this.floatTexts.push({
      msg,
      x,
      y,
      life: 1.0,
      decay: 0.012,
      color: finalColor,
      scale: 1.4
    });
  }

  update(delta) {
    const d = delta / 16.66;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vy += 0.7 * d; // gravity
      p.x += p.vx * d;
      p.y += p.vy * d;
      p.life -= p.decay * d;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const t = this.floatTexts[i];
      t.y -= 0.6 * d;
      t.life -= t.decay * d;
      if (t.scale > 1.0) {
        t.scale = Math.max(1.0, t.scale - 0.04 * d);
      }
      if (t.life <= 0) {
        this.floatTexts.splice(i, 1);
      }
    }
  }

  draw(ctx, isGameboy = false) {
    // Draw particles
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    // Draw floating texts
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const t of this.floatTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.life);
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      ctx.font = isGameboy ? "bold 15px 'Share Tech Mono'" : "900 16px 'Orbitron', sans-serif";
      
      // Shadow / glow
      if (!isGameboy) {
        ctx.shadowColor = t.color;
        ctx.shadowBlur = 12;
      }

      ctx.fillStyle = t.color;
      ctx.fillText(t.msg, 0, 0);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}
