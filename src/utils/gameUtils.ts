// Game utility functions for word validation and processing

/**
 * Normalize a word by removing accents and converting to uppercase
 */
export const normalizeWord = (word: string): string => {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
};

/**
 * Check if a word is valid (5 letters, only Portuguese characters)
 */
export const isValidWord = (word: string): boolean => {
  const normalized = normalizeWord(word);
  return /^[A-Z]{5}$/.test(normalized);
};

/**
 * Validate a guess against a solution and return tile statuses
 */
export const validateGuess = (guess: string, solution: string): Array<{ letter: string; status: 'correct' | 'present' | 'absent' }> => {
  const normalizedGuess = normalizeWord(guess);
  const normalizedSolution = normalizeWord(solution);
  
  const result = [];
  const solutionLetterCount: { [key: string]: number } = {};
  
  // Count occurrences of each letter in the solution
  for (const letter of normalizedSolution) {
    solutionLetterCount[letter] = (solutionLetterCount[letter] || 0) + 1;
  }
  
  // First pass: mark correct letters
  for (let i = 0; i < 5; i++) {
    const guessLetter = normalizedGuess[i];
    const solutionLetter = normalizedSolution[i];
    
    if (guessLetter === solutionLetter) {
      result[i] = { letter: guessLetter, status: 'correct' };
      solutionLetterCount[guessLetter]--;
    } else {
      result[i] = { letter: guessLetter, status: 'absent' };
    }
  }
  
  // Second pass: mark present letters
  for (let i = 0; i < 5; i++) {
    if (result[i].status === 'absent') {
      const guessLetter = normalizedGuess[i];
      if (solutionLetterCount[guessLetter] > 0) {
        result[i].status = 'present';
        solutionLetterCount[guessLetter]--;
      }
    }
  }
  
  return result;
};

/**
 * Generate emoji representation of the game result
 */
export const generateEmojiGrid = (guesses: string[], solutions: string[]): string => {
  return guesses.map(guess => {
    // For multiple solutions, use the first one for emoji generation
    const validation = validateGuess(guess, solutions[0]);
    return validation.map(tile => {
      switch (tile.status) {
        case 'correct': return '🟩';
        case 'present': return '🟨';
        case 'absent': return '⬛';
        default: return '⬜';
      }
    }).join('');
  }).join('\n');
};

/**
 * Get display name for game mode
 */
export const getModeDisplayName = (mode: string): string => {
  switch (mode) {
    case 'termo': return 'TERMO';
    case 'dueto': return 'DUETO';
    case 'quarteto': return 'QUARTETO';
    case 'aleatorio': return 'TERMO';
    default: return 'TERMO';
  }
};

/**
 * Check if all solutions have been guessed
 */
export const checkWinCondition = (guesses: string[], solutions: string[]): boolean => {
  return solutions.every(solution => 
    guesses.some(guess => normalizeWord(guess) === normalizeWord(solution))
  );
};

/**
 * Get random words for different game modes
 */
export const getRandomWords = (mode: string, count: number = 1): string[] => {
  // Extended word list - in a real app, this would come from a comprehensive Portuguese dictionary
  const wordList = [
    'TURMA', 'CARRO', 'CASA', 'LIVRO', 'MESA', 'CADEIRA', 'PORTA', 'JANELA',
    'PLANTA', 'PAPEL', 'CANETA', 'LAPIS', 'ESCOLA', 'PRAIA', 'MONTE', 'CIDADE',
    'CAMPO', 'FLOR', 'AGUA', 'FOGO', 'TERRA', 'VENTO', 'CHUVA', 'SOL',
    'LUA', 'ESTRELA', 'NUVEM', 'MAR', 'RIO', 'LAGO', 'PONTE', 'CARRO',
    'MOTO', 'AVIAO', 'TREM', 'BARCO', 'BICI', 'ONIBUS', 'METRO', 'TAXI',
    'GATO', 'CAO', 'PATO', 'GALO', 'VACA', 'BOI', 'PORCO', 'OVELHA'
  ];
  
  const shuffled = [...wordList].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};