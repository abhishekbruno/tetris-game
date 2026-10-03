// ============================================================
//  TETRIS — pieces.js
//  SRS standard 4 rotation states for each tetromino
// ============================================================

export const TETROMINOES = {
  I: {
    id: "I",
    color: "#00e5ff", // cyan
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
    spawnOffset: { x: 3, y: -1 } // y = -1 puts row 1 at board y=0
  },

  J: {
    id: "J",
    color: "#2255ff", // blue
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
    color: "#ff8800", // orange
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
    color: "#ffe600", // yellow
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
    color: "#00ff88", // green
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
    color: "#aa00ff", // purple
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
    color: "#ff2d78", // pink
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

export const PIECE_IDS = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

export function createPiece(id) {
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
