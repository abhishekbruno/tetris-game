// ============================================================
//  TETRIS — stats.js
//  Local Storage Persistence for High Scores & Statistics
// ============================================================

const STATS_KEY = "tetris_cyberpunk_stats";

const DEFAULT_STATS = {
  highScore: 0,
  gamesPlayed: 0,
  totalLines: 0,
  highestLevel: 1,
  tetrises: 0,
  tspins: 0,
  perfectClears: 0,
  maxCombo: 0
};

export class StatsManager {
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
    } catch (_) {}
    return { ...DEFAULT_STATS };
  }

  saveStats() {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(this.stats));
    } catch (_) {}
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
}
