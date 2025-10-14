import { TileStatus } from '@/contexts/GameContext';

// Evaluate a single solution vs guess using Wordle rules (first pass corrects, second pass presents)
export function evaluateSolutionGuess(solution: string, guess: string): TileStatus[] {
  const sol = solution.toLowerCase();
  const g = guess.toLowerCase();
  const statusArr: TileStatus[] = Array(5).fill('absent');
  const counts: Record<string, number> = {};

  for (const ch of sol) {
    counts[ch] = (counts[ch] || 0) + 1;
  }

  for (let i = 0; i < 5; i++) {
    if (g[i] === sol[i]) {
      statusArr[i] = 'correct';
      counts[g[i]] = counts[g[i]] - 1;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (statusArr[i] === 'correct') continue;
    const ch = g[i];
    if (counts[ch] && counts[ch] > 0) {
      statusArr[i] = 'present';
      counts[ch] = counts[ch] - 1;
    } else {
      statusArr[i] = 'absent';
    }
  }

  return statusArr;
}

export default evaluateSolutionGuess;
