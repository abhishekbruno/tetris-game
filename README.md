# Tetris 🎮 — Cyberpunk Edition

A high-performance, mechanically authentic Tetris game featuring standard Super Rotation System (SRS), Guideline scoring, T-Spin detection, Back-to-Back bonuses, Perfect Clears, GameBoy DMG mode, Web Audio effects, and a neon cyberpunk aesthetic.

---

## 🚀 Features

- **Guideline Super Rotation System (SRS)**: Authentic 4-state rotation matrices with complete wall kick and floor kick tables for all tetrominoes (`I`, `J`, `L`, `O`, `S`, `T`, `Z`).
- **Guideline 7-Bag Randomizer**: Fair piece distribution with zero piece starvation or duplication.
- **T-Spin & T-Spin Mini Detection**: 3-corner detection distinguishing full T-Spins vs T-Spin Minis, supporting T-Spin Singles, Doubles, and Triples.
- **Back-to-Back (B2B) System**: Consecutive difficult line clears (Tetrises & T-Spins) grant a 1.5× score multiplier.
- **Perfect Clear (All Clear)**: Board sweep detection with massive score bonuses and visual effects.
- **Lock Delay & Anti-Stall**: 500ms lock delay with up to 15 resets on movement/rotation, preventing infinite stalling.
- **Line Clear Animation**: Flashing line clears without race conditions or premature piece spawning.
- **Hold System**: Dedicated HOLD preview card with single-use per turn enforcement.
- **Next Piece Queue**: Preview of upcoming pieces.
- **Ghost Piece**: Accurate drop preview with mode-specific transparency.
- **Scoring & Stats**: Guideline scoring with combo counter, level multiplier, high score, and lifetime stats stored in `localStorage`.
- **GameBoy Mode (`[ GB ]`)**: Instant toggle switching the palette to authentic GameBoy DMG olive greens and retro typography.
- **Audio Engine**: Sound pooling for existing audio files plus Web Audio API synthesizer for retro bleeps and drop impacts.
- **Comprehensive Controls**:
  - Full keyboard with configurable DAS/ARR, CW and CCW rotation.
  - Mobile touch drag/swipe gestures and on-screen control pad.
  - Gamepad controller support.

---

## 🎮 Controls

### Keyboard

| Key | Action |
|-----|--------|
| `←` / `→` or `A` / `D` | Move left / right (DAS auto-repeat supported) |
| `↑` / `W` / `X` | Rotate Clockwise |
| `Z` / `Ctrl` | Rotate Counter-Clockwise |
| `↓` / `S` | Soft Drop (+1 pt / cell) |
| `Space` | Hard Drop (+2 pts / cell, instant lock) |
| `C` / `Shift` | Hold Piece |
| `P` / `Esc` | Pause / Resume |

### Gamepad

| Button / Axis | Action |
|---------------|--------|
| D-Pad Left / Right or Left Stick | Move left / right |
| D-Pad Down or Left Stick Down | Soft Drop |
| A / Y / D-Pad Up | Rotate Clockwise |
| B / X | Rotate Counter-Clockwise |
| Bumpers / Triggers (L1/R1/L2/R2) | Hold Piece |
| Start / Select | Pause / Resume |

### Touch (Mobile)

- **Drag Left / Right**: Move piece smoothly
- **Drag Down**: Soft drop
- **Tap**: Rotate Clockwise
- **On-Screen Buttons**:
  - `HOLD` (C): Swap hold piece
  - `LEFT` (◀) / `RIGHT` (▶): Shift piece
  - `ROT CW` (↻): Rotate Clockwise
  - `ROT CCW` (↺): Rotate Counter-Clockwise
  - `SOFT` (▼): Soft drop
  - `DROP` (⤓): Hard drop

---

## 📁 Architecture

The project has been refactored into a decoupled, testable architecture:

```text
tetris-game-main/
├── src/
│   ├── engine/
│   │   ├── constants.js   # Game timings, dimensions, speeds, and state enums
│   │   ├── pieces.js      # Tetromino shapes and 4-state SRS matrices
│   │   ├── srs.js         # Standard SRS wall kick & floor kick tables
│   │   ├── bag.js         # 7-bag randomizer and queue peek
│   │   ├── board.js       # Grid management, collision, lock, line clearing, PC
│   │   ├── scoring.js     # Guideline scoring, T-Spin detection, B2B, combos
│   │   └── engine.js      # Core TetrisEngine coordinator and state machine
│   ├── input/
│   │   ├── keyboard.js    # Keyboard input with DAS/ARR
│   │   ├── touch.js       # Mobile touch and button handlers (no duplicate clicks)
│   │   └── gamepad.js     # Gamepad controller polling
│   ├── rendering/
│   │   ├── renderer.js    # 60 FPS Canvas renderer with cached background grid
│   │   └── particles.js   # Cyberpunk particle bursts and floating popups
│   ├── audio/
│   │   └── sound.js       # SoundManager with Web Audio synthesizer fallback
│   ├── storage/
│   │   └── stats.js       # LocalStorage high score & gameplay statistics
│   └── main.js            # Main browser entry point
├── tests/
│   ├── board.test.js      # Board collisions, locking, line clears, perfect clear
│   ├── srs.test.js        # 4 rotation states, JLSTZ kicks, I floor kicks
│   ├── bag.test.js        # 7-bag fairness and queue peeking
│   ├── scoring.test.js    # Action scores, T-Spin 3-corner detection, B2B, combos
│   └── engine.test.js     # State transitions, hold rules, lock delay, game over
├── index.html             # HUD, Game canvas, Hold canvas, Next canvas, Overlays
├── style.css              # Cyberpunk styling, GameBoy mode, responsive design
└── main.js                # Standalone bundled distribution for offline use
```

---

## 🧪 Testing

Run unit tests directly with Node's native test runner:

```bash
npm test
```

All 21 comprehensive unit tests verify:
- Board collision detection, line clear shifts, and perfect clears
- 4-state SRS rotation with horizontal and vertical wall/floor kicks
- 7-bag fairness across multiple consecutive bags without starvation
- Scoring, T-Spin mini/full distinction, B2B multipliers, and combos
- Engine state transitions, hold-once-per-turn rules, and game over handling

---

## 💻 Running the Game

Simply open `index.html` in any modern web browser, or run a local web server:

```bash
# Using Node
npm start
# or
node server.js
```