// Estado do léxico
let fiveLetterWords: string[] = [];
let isWordsLoaded = false;
let loadError: string | null = null;

// Preferred common words (generated offline) used for solutions
let commonWords: string[] = [];
let isCommonLoaded = false;
let commonLoadError: string | null = null;

// Funções de utilidade para manipulação de texto
const removeAcentos = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const isValidWord = (word: string): boolean => {
  // Verifica se a palavra tem 5 letras e contém apenas caracteres válidos
  return word.length === 5 && /^[a-záàâãéèêíïóôõöúüç]*$/i.test(word);
};

// Carregamento e processamento do léxico
async function getWords() {
  try {
    // Try multiple paths to be robust on different hosts/build setups
    const candidatePaths = ['/lexico.txt', '/public/lexico.txt', './lexico.txt', '/assets/lexico.txt'];
    let response: Response | null = null;
    let lastErr: any = null;
    for (const p of candidatePaths) {
      try {
        response = await fetch(p);
        if (response.ok) break;
        lastErr = new Error(`HTTP error! status: ${response.status} for ${p}`);
        response = null;
      } catch (err) {
        lastErr = err;
        response = null;
      }
    }

    if (!response) {
      throw lastErr || new Error('Não foi possível buscar lexicon (paths tried: /lexico.txt, /public/lexico.txt, ./lexico.txt, /assets/lexico.txt)');
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Arquivo léxico vazio');
    }

    // Processa e filtra as palavras
    const allWords = text.split('\n')
      .map(word => word.trim().toLowerCase())
      .filter(word => isValidWord(word));

    if (allWords.length === 0) {
      throw new Error('Nenhuma palavra válida encontrada no léxico');
    }

  fiveLetterWords = allWords;
    isWordsLoaded = true;
    loadError = null;

    console.log(`Léxico carregado com ${fiveLetterWords.length} palavras válidas`);
  } catch (error) {
    console.error('Erro ao carregar palavras:', error);
    loadError = error instanceof Error ? error.message : 'Erro desconhecido ao carregar palavras';
    isWordsLoaded = false;
    fiveLetterWords = [];
  }
}

// Carrega também a lista de palavras comuns (preferida para soluções)
async function loadCommonWords() {
  try {
    const candidatePaths = ['/common-words.txt', '/public/common-words.txt', './common-words.txt', '/assets/common-words.txt'];
    let response: Response | null = null;
    let lastErr: any = null;
    for (const p of candidatePaths) {
      try {
        response = await fetch(p);
        if (response.ok) break;
        lastErr = new Error(`HTTP error! status: ${response.status} for ${p}`);
        response = null;
      } catch (err) {
        lastErr = err;
        response = null;
      }
    }

    if (!response) {
      throw lastErr || new Error('Não foi possível buscar common-words (paths tried)');
    }

    const text = await response.text();
    if (!text.trim()) {
      throw new Error('Arquivo common-words.txt vazio');
    }

    const words = text.split('\n')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length === 5 && /^[a-z]+$/.test(removeAcentos(w)));

    if (words.length === 0) {
      throw new Error('Nenhuma palavra válida encontrada em common-words.txt');
    }

    commonWords = words;
    isCommonLoaded = true;
    commonLoadError = null;
    console.log(`Common words carregadas com ${commonWords.length} palavras`);
  } catch (error) {
    console.warn('Não foi possível carregar common-words.txt (não crítico):', error);
    commonLoadError = error instanceof Error ? error.message : 'Erro desconhecido ao carregar common-words.txt';
    isCommonLoaded = false;
    commonWords = [];
  }
}

// Inicializa o carregamento das palavras
getWords();
loadCommonWords();

// Funções exportadas
export const isWordLoaded = () => isWordsLoaded;
export const getLoadError = () => loadError;
export { fiveLetterWords };

export const getRandomWord = (previousWord: string | null, words?: string[]): string | null => {
  // If caller provided a specific list, use it directly
  if (words && words.length > 0) {
    const pool = words;
    if (!isWordsLoaded || pool.length === 0) {
      console.error('Léxico não está carregado ou vazio');
      return null;
    }
    // pick random different from previousWord
    let attempts = 0;
    let newWord: string | null = null;
    do {
      newWord = pool[Math.floor(Math.random() * pool.length)];
      attempts++;
      if (attempts > 100) return null;
    } while (newWord === previousWord);
    return newWord;
  }

  if (!isWordsLoaded || fiveLetterWords.length === 0) {
    console.error('Léxico não está carregado ou vazio');
    return null;
  }

  // If common words are loaded, prefer them with high probability (e.g. 85%).
  const rand = Math.random();
  if (isCommonLoaded && commonWords.length > 0 && rand < 0.85) {
    // choose from commonWords
    let attempts = 0;
    let newWord: string | null = null;
    do {
      newWord = commonWords[Math.floor(Math.random() * commonWords.length)];
      attempts++;
      if (attempts > 100) return null;
    } while (newWord === previousWord);
    return newWord;
  }

  // Fallback: prefer words that look like "do dia a dia" using a simple heuristic:
  // - more vowels (good)
  // - avoid rare letters (k,w,y,x,z)
  // We'll score words and pick from top-scored subset with higher probability.
  const rareLetters = new Set(['k','w','y','x','z']);
  const vowels = new Set(['a','e','i','o','u']);

  const scoreWord = (w: string) => {
    let score = 0;
    for (const ch of w) {
      if (vowels.has(ch)) score += 2;
      if (rareLetters.has(ch)) score -= 3;
      // prefer shorter consonant clusters: reward alternating vowel/consonant
    }
    return score;
  };

  // Compute scores lazily for performance; create a scored list
  const scored: { word: string; score: number }[] = fiveLetterWords.map(w => ({ word: w, score: scoreWord(w) }));
  // sort descending by score
  scored.sort((a,b) => b.score - a.score);

  // Build preferred subset (top 30%)
  const topCount = Math.max(1, Math.floor(scored.length * 0.3));
  const preferred = scored.slice(0, topCount).map(s => s.word);

  // With 70% chance pick from preferred, else from whole list
  const pickFrom = Math.random() < 0.7 ? preferred : fiveLetterWords;

  let attempts = 0;
  let newWord: string | null = null;
  do {
    newWord = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    attempts++;
    if (attempts > 200) return null;
  } while (newWord === previousWord);

  return newWord;
};

// Função para validar tentativas do usuário
export const isValidGuess = (guess: string): boolean => {
  const normalizedGuess = removeAcentos(guess.toLowerCase());
  // Prefer the full lexicon when available
  if (fiveLetterWords && fiveLetterWords.length > 0) {
    return fiveLetterWords.some(word => removeAcentos(word) === normalizedGuess);
  }
  // Fallback to commonWords when lexicon not loaded
  if (commonWords && commonWords.length > 0) {
    return commonWords.some(word => removeAcentos(word) === normalizedGuess);
  }
  return false;
};

// Exports for common words
export const getCommonWords = () => commonWords;
export const isCommonWordsLoaded = () => isCommonLoaded;
export const getCommonLoadError = () => commonLoadError;
