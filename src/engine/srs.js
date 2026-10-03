// ============================================================
//  TETRIS — srs.js
//  Super Rotation System (SRS) Wall Kick & Rotation Logic
// ============================================================

// Kick offsets in screen coordinates [dx, dy] where +x is right, +y is DOWN.
// JLSTZ standard kick table
export const JLSTZ_KICKS = {
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

// I piece kick table
export const I_KICKS = {
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

/**
 * Attempts to rotate a piece clockwise (dir = 1) or counter-clockwise (dir = -1).
 * Returns { success, newRotation, kickOffset, kickIndex } or null if rotation failed.
 */
export function attemptRotation(piece, dir, collidesFn) {
  if (piece.id === "O") {
    // O piece does not rotate in standard SRS
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
