export interface PersistedStats {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: Record<number, number>;
}

const STORAGE_KEY = 'termo_stats_v1';

const defaultStats = (maxAttempts = 6): PersistedStats => ({
  gamesPlayed: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: Array.from({ length: maxAttempts }, (_, i) => 0).reduce((acc, _, idx) => {
    acc[idx + 1] = 0; return acc;
  }, {} as Record<number, number>)
});

export const loadStats = (maxAttempts = 6): PersistedStats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats(maxAttempts);
    const parsed = JSON.parse(raw);
    // ensure distribution keys exist
    if (!parsed.distribution) parsed.distribution = defaultStats(maxAttempts).distribution;
    return parsed as PersistedStats;
  } catch (e) {
    console.error('Failed to load stats', e);
    return defaultStats(maxAttempts);
  }
};

export const saveStats = (stats: PersistedStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
};

export const resetStats = (maxAttempts = 6) => {
  const s = defaultStats(maxAttempts);
  saveStats(s);
  return s;
};
