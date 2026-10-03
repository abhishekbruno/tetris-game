// src/engine/constants.js
var COLS = 10;
var ROWS = 20;
var SIZE = 30;
var DAS_DELAY = 160;
var DAS_RATE = 45;
var LOCK_DELAY = 500;
var LOCK_MAX_MOVES = 15;
var FLASH_DURATION = 250;
var SPEED_CURVE = [
  800,
  715,
  632,
  549,
  466,
  383,
  300,
  216,
  133,
  100,
  83,
  83,
  83,
  67,
  67,
  67,
  50,
  50,
  50,
  33,
  33,
  33,
  20
];
var GameState = {
  MENU: "MENU",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  LINE_CLEAR: "LINE_CLEAR",
  GAME_OVER: "GAME_OVER"
};

// src/engine/pieces.js
var TETROMINOES = {
  I: {
    id: "I",
    color: "#00e5ff",
    // cyan
    shapes: [
      // 0: Spawn
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      // 1: Right (Clockwise)
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
      ],
      // 2: 180
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0]
      ],
      // 3: Left (Counter-Clockwise)
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
      ]
    ],
    spawnOffset: { x: 3, y: -1 }
    // y = -1 puts row 1 at board y=0
  },
  J: {
    id: "J",
    color: "#2255ff",
    // blue
    shapes: [
      // 0
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      // 1 (R)
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0]
      ],
      // 2
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1]
      ],
      // 3 (L)
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
      ]
    ],
    spawnOffset: { x: 3, y: 0 }
  },
  L: {
    id: "L",
    color: "#ff8800",
    // orange
    shapes: [
      // 0
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
      ],
      // 1 (R)
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
      ],
      // 2
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0]
      ],
      // 3 (L)
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
      ]
    ],
    spawnOffset: { x: 3, y: 0 }
  },
  O: {
    id: "O",
    color: "#ffe600",
    // yellow
    shapes: [
      [
        [1, 1],
        [1, 1]
      ],
      [
        [1, 1],
        [1, 1]
      ],
      [
        [1, 1],
        [1, 1]
      ],
      [
        [1, 1],
        [1, 1]
      ]
    ],
    spawnOffset: { x: 4, y: 0 }
  },
  S: {
    id: "S",
    color: "#00ff88",
    // green
    shapes: [
      // 0
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
      ],
      // 1 (R)
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1]
      ],
      // 2
      [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0]
      ],
      // 3 (L)
      [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0]
      ]
    ],
    spawnOffset: { x: 3, y: 0 }
  },
  T: {
    id: "T",
    color: "#aa00ff",
    // purple
    shapes: [
      // 0
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      // 1 (R)
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0]
      ],
      // 2
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
      ],
      // 3 (L)
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0]
      ]
    ],
    spawnOffset: { x: 3, y: 0 }
  },
  Z: {
    id: "Z",
    color: "#ff2d78",
    // pink
    shapes: [
      // 0
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
      ],
      // 1 (R)
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0]
      ],
      // 2
      [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1]
      ],
      // 3 (L)
      [
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0]
      ]
    ],
    spawnOffset: { x: 3, y: 0 }
  }
};
var PIECE_IDS = ["I", "J", "L", "O", "S", "T", "Z"];
function createPiece(id) {
  const def = TETROMINOES[id];
  if (!def) throw new Error(`Unknown piece id: ${id}`);
  return {
    id: def.id,
    color: def.color,
    rotation: 0,
    x: def.spawnOffset.x,
    y: def.spawnOffset.y,
    get shape() {
      return def.shapes[this.rotation];
    }
  };
}

// src/engine/board.js
var Board = class {
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
        if (nx < 0 || nx >= this.cols || ny >= this.rows) {
          return true;
        }
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
      if (this.grid[r].every((cell) => cell !== 0)) {
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
};

// src/engine/bag.js
var Bag = class {
  constructor(rng = Math.random) {
    this.rng = rng;
    this.bag = [];
    this.queue = [];
    this.ensureQueue(7);
  }
  generateBag() {
    const newBag = [...PIECE_IDS];
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
};

// src/engine/srs.js
var JLSTZ_KICKS = {
  // 0 -> 1 (CW)
  "0->1": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  // 1 -> 0 (CCW)
  "1->0": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  // 1 -> 2 (CW)
  "1->2": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  // 2 -> 1 (CCW)
  "2->1": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  // 2 -> 3 (CW)
  "2->3": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  // 3 -> 2 (CCW)
  "3->2": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  // 3 -> 0 (CW)
  "3->0": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  // 0 -> 3 (CCW)
  "0->3": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]]
};
var I_KICKS = {
  // 0 -> 1 (CW)
  "0->1": [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  // 1 -> 0 (CCW)
  "1->0": [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  // 1 -> 2 (CW)
  "1->2": [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  // 2 -> 1 (CCW)
  "2->1": [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  // 2 -> 3 (CW)
  "2->3": [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  // 3 -> 2 (CCW)
  "3->2": [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  // 3 -> 0 (CW)
  "3->0": [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  // 0 -> 3 (CCW)
  "0->3": [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]]
};
function attemptRotation(piece, dir, collidesFn) {
  if (piece.id === "O") {
    return { success: true, newRotation: 0, kickOffset: [0, 0], kickIndex: 0 };
  }
  const fromRot = piece.rotation;
  const toRot = (fromRot + dir + 4) % 4;
  const transitionKey = `${fromRot}->${toRot}`;
  const kickTable = piece.id === "I" ? I_KICKS : JLSTZ_KICKS;
  const kicks = kickTable[transitionKey] || [[0, 0]];
  for (let i = 0; i < kicks.length; i++) {
    const [dx, dy] = kicks[i];
    if (!collidesFn(piece, dx, dy, toRot)) {
      return {
        success: true,
        newRotation: toRot,
        kickOffset: [dx, dy],
        kickIndex: i
      };
    }
  }
  return { success: false, newRotation: fromRot, kickOffset: [0, 0], kickIndex: -1 };
}

// src/engine/scoring.js
function detectTSpin(piece, board, lastActionWasRotate, kickIndex) {
  if (piece.id !== "T" || !lastActionWasRotate) {
    return { isTSpin: false, isMini: false };
  }
  const cx = piece.x + 1;
  const cy = piece.y + 1;
  const corners = {
    nw: isOccupied(board, cx - 1, cy - 1),
    ne: isOccupied(board, cx + 1, cy - 1),
    se: isOccupied(board, cx + 1, cy + 1),
    sw: isOccupied(board, cx - 1, cy + 1)
  };
  const totalCorners = (corners.nw ? 1 : 0) + (corners.ne ? 1 : 0) + (corners.se ? 1 : 0) + (corners.sw ? 1 : 0);
  if (totalCorners < 3) {
    return { isTSpin: false, isMini: false };
  }
  let frontA = false;
  let frontB = false;
  switch (piece.rotation) {
    case 0:
      frontA = corners.nw;
      frontB = corners.ne;
      break;
    case 1:
      frontA = corners.ne;
      frontB = corners.se;
      break;
    case 2:
      frontA = corners.se;
      frontB = corners.sw;
      break;
    case 3:
      frontA = corners.sw;
      frontB = corners.nw;
      break;
  }
  if (frontA && frontB) {
    return { isTSpin: true, isMini: false };
  }
  if (kickIndex === 4) {
    return { isTSpin: true, isMini: false };
  }
  return { isTSpin: true, isMini: true };
}
function isOccupied(board, x, y) {
  if (x < 0 || x >= board.cols || y >= board.rows) return true;
  if (y < 0) return false;
  return board.grid[y][x] !== 0;
}
function calculateScore({
  linesCleared,
  level,
  isTSpin,
  isMini,
  isPerfectClear,
  b2bActive,
  currentCombo
}) {
  let baseScore = 0;
  let actionText = "";
  let isDifficult = false;
  let nextB2bActive = b2bActive;
  let appliedB2B = false;
  let newCombo = currentCombo;
  if (isTSpin) {
    isDifficult = linesCleared > 0;
    if (isMini) {
      if (linesCleared === 0) {
        baseScore = 100;
        actionText = "T-SPIN MINI";
      } else if (linesCleared === 1) {
        baseScore = b2bActive ? 300 : 200;
        appliedB2B = b2bActive;
        actionText = b2bActive ? "B2B T-SPIN MINI SINGLE" : "T-SPIN MINI SINGLE";
      } else {
        baseScore = b2bActive ? 600 : 400;
        appliedB2B = b2bActive;
        actionText = b2bActive ? "B2B T-SPIN MINI DOUBLE" : "T-SPIN MINI DOUBLE";
      }
    } else {
      if (linesCleared === 0) {
        baseScore = 400;
        actionText = "T-SPIN";
      } else if (linesCleared === 1) {
        baseScore = b2bActive ? 1200 : 800;
        appliedB2B = b2bActive;
        actionText = b2bActive ? "B2B T-SPIN SINGLE" : "T-SPIN SINGLE";
      } else if (linesCleared === 2) {
        baseScore = b2bActive ? 1800 : 1200;
        appliedB2B = b2bActive;
        actionText = b2bActive ? "B2B T-SPIN DOUBLE" : "T-SPIN DOUBLE";
      } else if (linesCleared >= 3) {
        baseScore = b2bActive ? 2400 : 1600;
        appliedB2B = b2bActive;
        actionText = b2bActive ? "B2B T-SPIN TRIPLE" : "T-SPIN TRIPLE";
      }
    }
  } else {
    switch (linesCleared) {
      case 1:
        baseScore = 100;
        actionText = "SINGLE";
        break;
      case 2:
        baseScore = 300;
        actionText = "DOUBLE";
        break;
      case 3:
        baseScore = 500;
        actionText = "TRIPLE";
        break;
      case 4:
        isDifficult = true;
        baseScore = b2bActive ? 1200 : 800;
        appliedB2B = b2bActive;
        actionText = b2bActive ? "B2B TETRIS" : "TETRIS";
        break;
    }
  }
  if (linesCleared > 0) {
    if (isDifficult) {
      nextB2bActive = true;
    } else {
      nextB2bActive = false;
    }
    newCombo = currentCombo + 1;
  } else {
    newCombo = -1;
  }
  let totalPoints = baseScore * level;
  if (newCombo > 0) {
    totalPoints += 50 * newCombo * level;
  }
  let perfectClearPoints = 0;
  if (isPerfectClear) {
    switch (linesCleared) {
      case 1:
        perfectClearPoints = 800 * level;
        break;
      case 2:
        perfectClearPoints = 1200 * level;
        break;
      case 3:
        perfectClearPoints = 1800 * level;
        break;
      case 4:
        perfectClearPoints = (appliedB2B ? 3200 : 2e3) * level;
        break;
      default:
        perfectClearPoints = 800 * level;
        break;
    }
    totalPoints += perfectClearPoints;
  }
  return {
    points: totalPoints,
    baseScore,
    actionText,
    isDifficult,
    nextB2bActive,
    appliedB2B,
    newCombo,
    isPerfectClear,
    perfectClearPoints
  };
}

// src/engine/engine.js
var TetrisEngine = class {
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
    this.events = {
      onPieceMove: options.onPieceMove || (() => {
      }),
      onPieceRotate: options.onPieceRotate || (() => {
      }),
      onLock: options.onLock || (() => {
      }),
      onLineClearStart: options.onLineClearStart || (() => {
      }),
      onLineClearComplete: options.onLineClearComplete || (() => {
      }),
      onHold: options.onHold || (() => {
      }),
      onGameOver: options.onGameOver || (() => {
      }),
      onLevelUp: options.onLevelUp || (() => {
      }),
      onScore: options.onScore || (() => {
      }),
      onStateChange: options.onStateChange || (() => {
      })
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
    const currentlyOnFloor = this.board.collides(this.currentPiece, 0, 1);
    if (currentlyOnFloor) {
      if (this.isLanding && this.lockMoves < LOCK_MAX_MOVES) {
        this.lockTimer = 0;
        this.lockMoves++;
      }
      this.isLanding = true;
    } else {
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
      this.events.onScore({ added: 1, total: this.score, reason: "softDrop" });
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
    this.events.onScore({ added: addedPoints, total: this.score, reason: "hardDrop" });
    this.lockPiece();
    return dropDist;
  }
  lockPiece() {
    if (this.state !== GameState.PLAYING) return;
    const tspinResult = detectTSpin(
      this.currentPiece,
      this.board,
      this.lastActionWasRotate,
      this.lastKickIndex
    );
    const { lockedAboveCeiling } = this.board.lockPiece(this.currentPiece);
    this.events.onLock(this.currentPiece);
    this.holdUsed = false;
    if (lockedAboveCeiling) {
      this.setState(GameState.GAME_OVER);
      this.events.onGameOver();
      return;
    }
    const fullRows = this.board.findFullLines();
    if (fullRows.length > 0) {
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
    this.board.clearLines(fullRows);
    this.linesCleared += fullRows.length;
    const isPerfectClear = this.board.isPerfectClear();
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
    this.setState(GameState.PLAYING);
    this.spawnPiece();
  }
  update(delta) {
    if (this.state === GameState.PAUSED || this.state === GameState.GAME_OVER) {
      return;
    }
    if (this.state === GameState.LINE_CLEAR) {
      this.flashTimer -= delta;
      if (this.flashTimer <= 0) {
        this.completeLineClear();
      }
      return;
    }
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
};

// src/rendering/renderer.js
var Renderer = class {
  constructor(canvas2, nextCanvas2, holdCanvas2) {
    this.canvas = canvas2;
    this.ctx = canvas2.getContext("2d");
    this.nextCanvas = nextCanvas2;
    this.nextCtx = nextCanvas2 ? nextCanvas2.getContext("2d") : null;
    this.holdCanvas = holdCanvas2;
    this.holdCtx = holdCanvas2 ? holdCanvas2.getContext("2d") : null;
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
    const shape = def.shapes[0];
    const blockSize = 20;
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
    const alpha = disabled ? 0.35 : 1;
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
  render(engine2, particleEngine) {
    this.ctx.drawImage(this.bgCanvas, 0, 0);
    this.drawBoard(engine2.board, engine2.flashRows, engine2.flashTimer);
    if (engine2.state === "PLAYING" && engine2.currentPiece) {
      const ghostY = engine2.board.getGhostY(engine2.currentPiece);
      this.drawGhost(engine2.currentPiece, ghostY);
      this.drawCurrentPiece(engine2.currentPiece);
    }
    if (particleEngine) {
      particleEngine.draw(this.ctx, this.isGameboy);
    }
    if (this.nextCtx) {
      const nextPieceId = engine2.bag.peek(1)[0];
      this.drawPreview(this.nextCtx, nextPieceId ? { id: nextPieceId } : null);
    }
    if (this.holdCtx) {
      this.drawPreview(this.holdCtx, engine2.holdPiece, engine2.holdUsed);
    }
  }
};

// src/rendering/particles.js
var ParticleEngine = class {
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
        life: 1,
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
      life: 1,
      decay: 0.012,
      color: finalColor,
      scale: 1.4
    });
  }
  update(delta) {
    const d = delta / 16.66;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.vy += 0.7 * d;
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
      if (t.scale > 1) {
        t.scale = Math.max(1, t.scale - 0.04 * d);
      }
      if (t.life <= 0) {
        this.floatTexts.splice(i, 1);
      }
    }
  }
  draw(ctx, isGameboy = false) {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const t of this.floatTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.life);
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);
      ctx.font = isGameboy ? "bold 15px 'Share Tech Mono'" : "900 16px 'Orbitron', sans-serif";
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
};

// src/audio/sound.js
var SoundManager = class {
  constructor() {
    this.muted = false;
    this.audioCtx = null;
    this.audioUnlocked = false;
    this.sources = {
      move: this.createAudio("sounds/move.wav"),
      rotate: this.createAudio("sounds/rotate.wav"),
      clear: this.createAudio("sounds/clear.wav"),
      gameover: this.createAudio("sounds/gameover.wav")
    };
    this.unlockListener = () => this.unlockAudio();
    window.addEventListener("pointerdown", this.unlockListener, { once: true });
    window.addEventListener("keydown", this.unlockListener, { once: true });
  }
  createAudio(src) {
    if (typeof Audio === "undefined") return null;
    try {
      const a = new Audio(src);
      a.volume = 0.4;
      a.onerror = () => {
      };
      return a;
    } catch {
      return null;
    }
  }
  unlockAudio() {
    if (this.audioUnlocked) return;
    this.audioUnlocked = true;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
        if (this.audioCtx.state === "suspended") {
          this.audioCtx.resume();
        }
      }
    } catch (_) {
    }
    Object.values(this.sources).forEach((audio) => {
      if (audio) {
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
        }).catch(() => {
        });
      }
    });
    window.removeEventListener("pointerdown", this.unlockListener);
    window.removeEventListener("keydown", this.unlockListener);
  }
  play(key) {
    if (this.muted) return;
    const audio = this.sources[key];
    if (audio) {
      try {
        const clone = audio.cloneNode();
        clone.volume = audio.volume;
        clone.play().catch(() => {
          this.synth(key);
        });
        return;
      } catch {
        this.synth(key);
        return;
      }
    }
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
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const t = now + idx * 0.04;
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.15);
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
            gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.25);
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
            gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.2);
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
            gain.gain.exponentialRampToValueAtTime(1e-3, t + 0.2);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.2);
          });
          break;
        }
      }
    } catch (_) {
    }
  }
};

// src/storage/stats.js
var STATS_KEY = "tetris_cyberpunk_stats";
var DEFAULT_STATS = {
  highScore: 0,
  gamesPlayed: 0,
  totalLines: 0,
  highestLevel: 1,
  tetrises: 0,
  tspins: 0,
  perfectClears: 0,
  maxCombo: 0
};
var StatsManager = class {
  constructor() {
    this.stats = this.loadStats();
  }
  loadStats() {
    if (typeof localStorage === "undefined") {
      return { ...DEFAULT_STATS };
    }
    try {
      const data = localStorage.getItem(STATS_KEY);
      if (data) {
        return { ...DEFAULT_STATS, ...JSON.parse(data) };
      }
    } catch (_) {
    }
    return { ...DEFAULT_STATS };
  }
  saveStats() {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
    } catch (_) {
    }
  }
  getHighScore() {
    return this.stats.highScore;
  }
  recordGame({ score, lines, level, maxCombo, tetrises = 0, tspins = 0, perfectClears = 0 }) {
    this.stats.gamesPlayed++;
    this.stats.totalLines += lines;
    this.stats.highestLevel = Math.max(this.stats.highestLevel, level);
    this.stats.maxCombo = Math.max(this.stats.maxCombo, maxCombo);
    this.stats.tetrises += tetrises;
    this.stats.tspins += tspins;
    this.stats.perfectClears += perfectClears;
    const isNewHigh = score > this.stats.highScore;
    if (isNewHigh) {
      this.stats.highScore = score;
    }
    this.saveStats();
    return { isNewHigh, stats: this.stats };
  }
};

// src/input/keyboard.js
var KeyboardHandler = class {
  constructor(engine2) {
    this.engine = engine2;
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
    if (this.keys[e.key]) return;
    this.keys[e.key] = true;
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
    if (this.dasKey === "left" && isLeftKey || this.dasKey === "right" && isRightKey || this.dasKey === "down" && isDownKey) {
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
};

// src/input/touch.js
var TouchHandler = class {
  constructor(engine2, canvasElement) {
    this.engine = engine2;
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
    const touch2 = e.touches[0];
    this.touchStartX = touch2.clientX;
    this.touchStartY = touch2.clientY;
    this.touchStartTime = performance.now();
    this.hasMoved = false;
    e.preventDefault();
  }
  handleTouchMove(e) {
    if (this.engine.state !== "PLAYING") return;
    e.preventDefault();
    const touch2 = e.touches[0];
    const dx = touch2.clientX - this.touchStartX;
    const dy = touch2.clientY - this.touchStartY;
    const stepX = 26;
    if (Math.abs(dx) >= stepX) {
      if (dx > 0) {
        this.engine.moveRight();
      } else {
        this.engine.moveLeft();
      }
      this.touchStartX = touch2.clientX;
      this.hasMoved = true;
    }
    const stepY = 26;
    if (dy >= stepY) {
      this.engine.softDrop();
      this.touchStartY = touch2.clientY;
      this.hasMoved = true;
    }
  }
  handleTouchEnd(e) {
    if (this.engine.state !== "PLAYING") return;
    e.preventDefault();
    const duration = performance.now() - this.touchStartTime;
    if (!this.hasMoved && duration < 250) {
      this.engine.rotateCW();
    }
  }
};

// src/input/gamepad.js
var GamepadHandler = class {
  constructor(engine2) {
    this.engine = engine2;
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
    const pause = btn(9) || btn(8);
    if (pause && !this.prev.pause) {
      this.engine.togglePause();
    }
    this.prev.pause = pause;
    if (this.engine.state !== "PLAYING") return;
    const left = btn(14) || axisX < -0.5;
    const right = btn(15) || axisX > 0.5;
    const down = btn(13) || axisY > 0.5;
    const rotateCW = btn(0) || btn(3) || btn(12);
    const rotateCCW = btn(2) || btn(1);
    const hardDrop = btn(12) && axisY < -0.7;
    const hold = btn(4) || btn(5) || btn(6) || btn(7);
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
};

// src/main.js
var canvas = document.getElementById("game");
var nextCanvas = document.getElementById("next");
var holdCanvas = document.getElementById("hold");
var scoreVal = document.getElementById("scoreVal");
var linesVal = document.getElementById("linesVal");
var levelVal = document.getElementById("levelVal");
var scoreSide = document.getElementById("scoreSide");
var linesSide = document.getElementById("linesSide");
var levelSide = document.getElementById("levelSide");
var levelBar = document.getElementById("levelBar");
var highScoreSide = document.getElementById("highScoreSide");
var comboSide = document.getElementById("comboSide");
var b2bSide = document.getElementById("b2bSide");
var pauseScreen = document.getElementById("pauseScreen");
var gameOverScreen = document.getElementById("gameOverScreen");
var gameOverText = document.getElementById("gameOverText");
var finalScore = document.getElementById("finalScore");
var finalLines = document.getElementById("finalLines");
var finalLevel = document.getElementById("finalLevel");
var finalHighScore = document.getElementById("finalHighScore");
var sound = new SoundManager();
var stats = new StatsManager();
var particles = new ParticleEngine();
var renderer = new Renderer(canvas, nextCanvas, holdCanvas);
var gameboyMode = false;
var animationId = null;
var lastTime = 0;
var maxComboThisGame = 0;
var tetrisesThisGame = 0;
var tspinsThisGame = 0;
var perfectClearsThisGame = 0;
var engine = new TetrisEngine({
  onPieceMove: (piece) => {
    sound.play("move");
  },
  onPieceRotate: (piece) => {
    sound.play("rotate");
  },
  onLock: (piece) => {
    particles.spawnHardDropBlast(piece, piece.y, gameboyMode);
  },
  onHold: (piece) => {
    sound.play("hold");
    particles.spawnBlockParticles(
      piece.x + piece.shape[0].length / 2,
      piece.y,
      "#ffffff",
      8,
      gameboyMode
    );
  },
  onLineClearStart: ({ rows, isTSpin }) => {
    sound.play("clear");
    particles.spawnLineClearExplosion(rows, engine.board.cols, engine.board.grid, gameboyMode);
  },
  onLineClearComplete: ({ linesCleared, scoreResult, leveledUp, level }) => {
    if (linesCleared === 4) {
      tetrisesThisGame++;
    }
    if (scoreResult.isTSpin) {
      tspinsThisGame++;
      sound.play("tspin");
    }
    if (scoreResult.isPerfectClear) {
      perfectClearsThisGame++;
      sound.play("perfectclear");
      particles.spawnText("PERFECT CLEAR!", canvas.width / 2, 220, "#00ff88", gameboyMode);
    }
    maxComboThisGame = Math.max(maxComboThisGame, scoreResult.newCombo);
    if (scoreResult.actionText) {
      const textColor = scoreResult.isDifficult ? "#ff2d78" : "#00e5ff";
      particles.spawnText(scoreResult.actionText, canvas.width / 2, 170, textColor, gameboyMode);
    }
    if (scoreResult.newCombo >= 2) {
      particles.spawnText(`COMBO x${scoreResult.newCombo}!`, canvas.width / 2, 120, "#ff8800", gameboyMode);
    }
    if (leveledUp) {
      sound.play("levelup");
      particles.spawnText(`LEVEL UP! [${level}]`, canvas.width / 2, 70, "#ffe600", gameboyMode);
    }
    updateHUD();
  },
  onScore: ({ added, total, reason, detail }) => {
    updateHUD();
  },
  onGameOver: () => {
    sound.play("gameover");
    document.body.classList.add("shake");
    setTimeout(() => document.body.classList.remove("shake"), 350);
    const record = stats.recordGame({
      score: engine.score,
      lines: engine.linesCleared,
      level: engine.level,
      maxCombo: maxComboThisGame,
      tetrises: tetrisesThisGame,
      tspins: tspinsThisGame,
      perfectClears: perfectClearsThisGame
    });
    finalScore.textContent = String(engine.score).padStart(6, "0");
    finalLines.textContent = engine.linesCleared;
    finalLevel.textContent = engine.level;
    if (finalHighScore) {
      finalHighScore.textContent = String(stats.getHighScore()).padStart(6, "0");
    }
    gameOverScreen.style.display = "flex";
    gameOverText.style.animation = "none";
    gameOverText.offsetHeight;
    gameOverText.style.animation = "slam 0.7s ease forwards";
    updateHUD();
  },
  onStateChange: (state) => {
    if (state === GameState.PAUSED) {
      pauseScreen.style.display = "flex";
    } else if (state === GameState.PLAYING) {
      pauseScreen.style.display = "none";
      gameOverScreen.style.display = "none";
    }
  }
});
var keyboard = new KeyboardHandler(engine);
var touch = new TouchHandler(engine, canvas);
var gamepad = new GamepadHandler(engine);
function updateHUD() {
  const pad = (n, len) => String(n).padStart(len, "0");
  if (scoreVal) scoreVal.textContent = pad(engine.score, 6);
  if (linesVal) linesVal.textContent = pad(engine.linesCleared, 2);
  if (levelVal) levelVal.textContent = pad(engine.level, 2);
  if (scoreSide) scoreSide.textContent = engine.score;
  if (linesSide) linesSide.textContent = engine.linesCleared;
  if (levelSide) levelSide.textContent = engine.level;
  if (highScoreSide) highScoreSide.textContent = stats.getHighScore();
  if (comboSide) comboSide.textContent = engine.combo > 0 ? `x${engine.combo}` : "0";
  if (b2bSide) {
    b2bSide.textContent = engine.b2bActive ? "ACTIVE" : "OFF";
    b2bSide.style.color = engine.b2bActive ? "var(--pink)" : "var(--muted)";
  }
  if (levelBar) {
    levelBar.style.width = engine.linesCleared % 10 / 10 * 100 + "%";
  }
}
function toggleGameboyMode() {
  gameboyMode = !gameboyMode;
  document.body.classList.toggle("gameboy-mode", gameboyMode);
  renderer.setGameboyMode(gameboyMode);
}
function restartGame() {
  pauseScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  maxComboThisGame = 0;
  tetrisesThisGame = 0;
  tspinsThisGame = 0;
  perfectClearsThisGame = 0;
  particles.reset();
  engine.reset();
  updateHUD();
  lastTime = performance.now();
  if (animationId) cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
}
function exitGame() {
  if (animationId) cancelAnimationFrame(animationId);
  engine.setState(GameState.GAME_OVER);
  pauseScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = gameboyMode ? "#0f380f" : "rgba(255,255,255,0.06)";
  ctx.font = gameboyMode ? "bold 20px 'Share Tech Mono'" : "20px Orbitron";
  ctx.textAlign = "center";
  ctx.fillText("THANKS FOR PLAYING", canvas.width / 2, canvas.height / 2);
}
function togglePause() {
  engine.togglePause();
}
document.getElementById("btnGameboy")?.addEventListener("click", toggleGameboyMode);
document.getElementById("btnPause")?.addEventListener("click", togglePause);
document.getElementById("btnResume")?.addEventListener("click", togglePause);
document.getElementById("btnRestartPause")?.addEventListener("click", restartGame);
document.getElementById("btnExitPause")?.addEventListener("click", exitGame);
document.getElementById("btnPlayAgain")?.addEventListener("click", restartGame);
document.getElementById("btnExitGameOver")?.addEventListener("click", exitGame);
window.toggleGameboyMode = toggleGameboyMode;
window.togglePause = togglePause;
window.restartGame = restartGame;
window.exitGame = exitGame;
function gameLoop(time = performance.now()) {
  if (engine.state === GameState.GAME_OVER) return;
  let delta = time - lastTime;
  lastTime = time;
  if (delta > 200) delta = 16.66;
  gamepad.poll(delta);
  keyboard.update(delta);
  engine.update(delta);
  particles.update(delta);
  renderer.render(engine, particles);
  animationId = requestAnimationFrame(gameLoop);
}
updateHUD();
lastTime = performance.now();
animationId = requestAnimationFrame(gameLoop);
export {
  exitGame,
  restartGame,
  toggleGameboyMode,
  togglePause
};
