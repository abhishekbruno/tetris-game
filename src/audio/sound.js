// ============================================================
//  TETRIS — sound.js
//  Sound Manager with Audio Pooling & Web Audio Synthesizer Fallback
// ============================================================

export class SoundManager {
  constructor() {
    this.muted = false;
    this.audioCtx = null;
    this.audioUnlocked = false;

    // Native sound files
    this.sources = {
      move: this.createAudio("sounds/move.wav"),
      rotate: this.createAudio("sounds/rotate.wav"),
      clear: this.createAudio("sounds/clear.wav"),
      gameover: this.createAudio("sounds/gameover.wav")
    };

    // Bind first interaction unlock
    this.unlockListener = () => this.unlockAudio();
    window.addEventListener("pointerdown", this.unlockListener, { once: true });
    window.addEventListener("keydown", this.unlockListener, { once: true });
  }

  createAudio(src) {
    if (typeof Audio === "undefined") return null;
    try {
      const a = new Audio(src);
      a.volume = 0.4;
      a.onerror = () => {};
      return a;
    } catch {
      return null;
    }
  }

  unlockAudio() {
    if (this.audioUnlocked) return;
    this.audioUnlocked = true;

    // Initialize Web Audio context
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
        if (this.audioCtx.state === "suspended") {
          this.audioCtx.resume();
        }
      }
    } catch (_) {}

    // Unlock HTML5 Audio elements
    Object.values(this.sources).forEach(audio => {
      if (audio) {
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
        }).catch(() => {});
      }
    });

    window.removeEventListener("pointerdown", this.unlockListener);
    window.removeEventListener("keydown", this.unlockListener);
  }

  play(key) {
    if (this.muted) return;

    // Check if we have a file for this sound
    const audio = this.sources[key];
    if (audio) {
      try {
        const clone = audio.cloneNode();
        clone.volume = audio.volume;
        clone.play().catch(() => {
          // Fall back to synth if file playback fails
          this.synth(key);
        });
        return;
      } catch {
        this.synth(key);
        return;
      }
    }

    // Otherwise synth sound
    this.synth(key);
  }

  synth(key) {
    if (this.muted || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      switch (key) {
        case "move": {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.05);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case "rotate": {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case "harddrop": {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case "hold": {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(880, now + 0.04);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case "clear": {
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const t = now + idx * 0.04;
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.15);
          });
          break;
        }

        case "tspin": {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.linearRampToValueAtTime(1200, now + 0.15);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.18);
          break;
        }

        case "perfectclear": {
          const freqs = [440, 554.37, 659.25, 880, 1108.73];
          freqs.forEach((freq, i) => {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const t = now + i * 0.06;
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
          });
          break;
        }

        case "levelup": {
          const freqs = [330, 440, 550, 660, 880];
          freqs.forEach((freq, i) => {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const t = now + i * 0.05;
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.2);
          });
          break;
        }

        case "gameover": {
          const freqs = [300, 260, 220, 160];
          freqs.forEach((freq, i) => {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const t = now + i * 0.1;
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.2);
          });
          break;
        }
      }
    } catch (_) {}
  }
}
