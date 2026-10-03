// ============================================================
//  TETRIS — scoring.js
//  Standard Guideline Scoring, T-Spin Detection, B2B, Combos, Perfect Clears
// ============================================================

/**
 * Detects whether the locked T-piece is a T-Spin or T-Spin Mini.
 */
export function detectTSpin(piece, board, lastActionWasRotate, kickIndex) {
  if (piece.id !== "T" || !lastActionWasRotate) {
    return { isTSpin: false, isMini: false };
  }

  const cx = piece.x + 1;
  const cy = piece.y + 1;

  // 4 corners: NW, NE, SE, SW
  const corners = {
    nw: isOccupied(board, cx - 1, cy - 1),
    ne: isOccupied(board, cx + 1, cy - 1),
    se: isOccupied(board, cx + 1, cy + 1),
    sw: isOccupied(board, cx - 1, cy + 1)
  };

  const totalCorners = (corners.nw ? 1 : 0) + (corners.ne ? 1 : 0) +
                       (corners.se ? 1 : 0) + (corners.sw ? 1 : 0);

  if (totalCorners < 3) {
    return { isTSpin: false, isMini: false };
  }

  // Front corners point in the direction of the T's center protrusion
  let frontA = false;
  let frontB = false;

  switch (piece.rotation) {
    case 0: // Pointing Up
      frontA = corners.nw;
      frontB = corners.ne;
      break;
    case 1: // Pointing Right
      frontA = corners.ne;
      frontB = corners.se;
      break;
    case 2: // Pointing Down
      frontA = corners.se;
      frontB = corners.sw;
      break;
    case 3: // Pointing Left
      frontA = corners.sw;
      frontB = corners.nw;
      break;
  }

  // If both front corners are occupied -> full T-Spin
  if (frontA && frontB) {
    return { isTSpin: true, isMini: false };
  }

  // If 5th SRS kick test (index 4) was used -> elevated to full T-Spin (T-Spin Triple rule)
  if (kickIndex === 4) {
    return { isTSpin: true, isMini: false };
  }

  // Otherwise, 1 front corner + 2 rear corners occupied -> T-Spin Mini
  return { isTSpin: true, isMini: true };
}

function isOccupied(board, x, y) {
  if (x < 0 || x >= board.cols || y >= board.rows) return true;
  if (y < 0) return false; // Above ceiling is not considered occupied stack
  return board.grid[y][x] !== 0;
}

/**
 * Calculates score, action name, and B2B/combo state updates.
 */
export function calculateScore({
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
        // T-Spin Mini Double (extremely rare wall kick scenario)
        baseScore = b2bActive ? 600 : 400;
        appliedB2B = b2bActive;
        actionText = b2bActive ? "B2B T-SPIN MINI DOUBLE" : "T-SPIN MINI DOUBLE";
      }
    } else {
      // Full T-Spin
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
    // Normal line clears
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

  // Update B2B state
  if (linesCleared > 0) {
    if (isDifficult) {
      nextB2bActive = true;
    } else {
      nextB2bActive = false;
    }
    newCombo = currentCombo + 1;
  } else {
    // 0 lines cleared resets combo, but does NOT reset B2B
    newCombo = -1;
  }

  let totalPoints = baseScore * level;

  // Add Combo Bonus
  if (newCombo > 0) {
    totalPoints += 50 * newCombo * level;
  }

  // Add Perfect Clear Bonus
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
        perfectClearPoints = (appliedB2B ? 3200 : 2000) * level;
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
