import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { getRandomWord, fiveLetterWords, isWordLoaded, isValidGuess, getLoadError } from "../utils/wordUtils";
import { evaluateSolutionGuess } from '../utils/evaluateGuess';
import { loadStats, saveStats, PersistedStats } from '@/lib/stats';
import WinModal from '@/components/WinModal';

// ...

export type GameMode = "termo" | "dueto" | "quarteto" | "aleatorio";

export type TileStatus = "empty" | "filled" | "correct" | "present" | "absent";

export interface GameTile {
  letter: string;
  status: TileStatus;
}

export interface GameState {
  mode: GameMode;
  currentGuess: string[]; // array of 5 letters ("" when empty)
  guesses: string[];
  gameStatus: "playing" | "won" | "lost";
  currentRow: number;
  solutions: string[];
  keyboardStatus: Record<string, TileStatus>;
  attemptsLeft: number;
  maxAttempts: number;
  boards: GameTile[][][]; // Multiple boards for dueto/quarteto modes
  error?: string; // Mensagem de erro para feedback do usuário
  hidden?: boolean; // permite esconder o tabuleiro quando desejado
  cursor: number; // coluna ativa (0-4)
  autoAdvance: boolean; // se true, o cursor avança após inserir
}

type GameAction =
  | { type: "SET_MODE"; payload: GameMode }
  | { type: "SET_HIDDEN"; payload: boolean }
  | { type: "SET_CURSOR"; payload: number }
  | { type: "TOGGLE_AUTO_ADVANCE" }
  | { type: "ADD_LETTER"; payload: string }
  | { type: "REMOVE_LETTER" }
  | { type: "SUBMIT_GUESS" }
  | { type: "SET_GAME_STATUS"; payload: "playing" | "won" | "lost" }
  | { type: "RESET_GAME" }
  | { type: "SET_SOLUTIONS"; payload: string[] }
  | { type: "SET_CURRENT_GUESS"; payload: string | string[] }
  | { type: "SET_ERROR"; payload: string | undefined };

const getMaxAttempts = (mode: GameMode): number => {
  switch (mode) {
    case "termo": return 6;
    case "dueto": return 7;
    case "quarteto": return 8;
    case "aleatorio": return 6;
    default: return 6;
  }
};

const getRandomSolutions = (mode: GameMode, previousSolutions: string[] = []): string[] => {
  const getValidWord = (previousWord: string | null): string => {
    if (!isWordLoaded()) {
      throw new Error('O léxico ainda não foi carregado');
    }
    
    const word = getRandomWord(previousWord);
    if (!word) {
      throw new Error('Não foi possível obter uma palavra válida');
    }
    return word;
  };

  try {
    switch (mode) {
      case "termo":
      case "aleatorio": {
        const word = getValidWord(previousSolutions[0] || null);
        return [word];
      }
      case "dueto": {
        const newWordsDueto: string[] = [];
        newWordsDueto.push(getValidWord(previousSolutions[0] || null));
        newWordsDueto.push(getValidWord(newWordsDueto[0]));
        return newWordsDueto;
      }
      case "quarteto": {
        const newWordsQuarteto: string[] = [];
        newWordsQuarteto.push(getValidWord(previousSolutions[0] || null));
        newWordsQuarteto.push(getValidWord(newWordsQuarteto[0]));
        newWordsQuarteto.push(getValidWord(newWordsQuarteto[1]));
        newWordsQuarteto.push(getValidWord(newWordsQuarteto[2]));
        return newWordsQuarteto;
      }
      default:
        return [getValidWord(null)];
    }
  } catch (error) {
    console.error('Erro ao gerar soluções:', error);
    throw error;
  }
}
const createInitialBoards = (mode: GameMode, maxAttempts: number): GameTile[][][] => {
  const numBoards = mode === "termo" || mode === "aleatorio" ? 1 : 
                   mode === "dueto" ? 2 : 4;
  
  return Array(numBoards).fill(null).map(() =>
    Array(maxAttempts).fill(null).map(() =>
      Array(5).fill({ letter: "", status: "empty" as TileStatus })
    )
  );
};

const initialState: GameState = {
  mode: "termo",
  currentGuess: Array(5).fill("") ,
  guesses: [],
  gameStatus: "playing",
  currentRow: 0,
  solutions: [],
  keyboardStatus: {},
  attemptsLeft: 6,
  maxAttempts: 6,
  boards: createInitialBoards("termo", 6),
  error: undefined,
  hidden: false,
  cursor: 0,
  autoAdvance: true,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
      case "SET_MODE": {
        const maxAttempts = getMaxAttempts(action.payload);
        const solutions = getRandomSolutions(action.payload);
        return {
          ...initialState,
          mode: action.payload,
          maxAttempts,
          attemptsLeft: maxAttempts,
          solutions,
          boards: createInitialBoards(action.payload, maxAttempts),
          error: undefined,
          currentGuess: Array(5).fill(""),
          cursor: 0,
        };
      }
    
    case "ADD_LETTER": {
      if (state.gameStatus !== "playing") return state;

      const newGuess = [...state.currentGuess];
      const idx = Math.max(0, Math.min(4, state.cursor));
      newGuess[idx] = action.payload;

      // advance cursor if autoAdvance enabled
      const nextCursor = state.autoAdvance ? (idx < 4 ? idx + 1 : 4) : idx;

      return {
        ...state,
        currentGuess: newGuess,
        cursor: nextCursor,
      };
    }

    case "TOGGLE_AUTO_ADVANCE":
      return {
        ...state,
        autoAdvance: !state.autoAdvance,
      };
    
    case "REMOVE_LETTER": {
      const newGuess = [...state.currentGuess];

      // If the cursor position has a letter, remove only that letter.
      const idx = Math.max(0, Math.min(4, state.cursor));
      if (newGuess[idx] && newGuess[idx] !== "") {
        newGuess[idx] = "";
        return {
          ...state,
          currentGuess: newGuess,
          cursor: idx,
        };
      }

      // Fallback: remove last filled letter
      let last = -1;
      for (let i = 4; i >= 0; i--) {
        if (newGuess[i] && newGuess[i] !== "") {
          last = i;
          break;
        }
      }
      if (last === -1) return state;
      newGuess[last] = "";
      return {
        ...state,
        currentGuess: newGuess,
        cursor: last,
      };
    }
    
    case "SUBMIT_GUESS": {
      if (state.gameStatus !== "playing") return state;
      // ensure all positions filled
      if (state.currentGuess.some((c) => c === "")) return state;

      const guessStr = state.currentGuess.join("");
      if (!isValidGuess(guessStr)) {
        console.error('Palavra inválida');
        return state;
      }

      const newGuesses = [...state.guesses, guessStr];

      // evaluateSolutionGuess imported from utils
      const newBoards = state.boards.map((board, boardIndex) => {
        const newBoard = [...board];
        const solution = state.solutions[boardIndex];

        if (!solution) {
          console.error(`No solution found for board ${boardIndex}`);
          return board;
        }

        const statuses = evaluateSolutionGuess(solution, guessStr);
        newBoard[state.currentRow] = state.currentGuess.map((letter, index) => ({
          letter,
          status: statuses[index],
        }));

        return newBoard;
      });

      // Update keyboard status using evaluated statuses across boards for this guess
      const newKeyboardStatus = { ...state.keyboardStatus };
      for (let i = 0; i < 5; i++) {
        const letter = state.currentGuess[i];
        // Collect statuses across boards at this position
        const statusesAtPos = newBoards.map(b => b[state.currentRow][i].status);
        if (statusesAtPos.some(s => s === "correct")) {
          newKeyboardStatus[letter] = "correct";
        } else if (statusesAtPos.some(s => s === "present") && newKeyboardStatus[letter] !== "correct") {
          newKeyboardStatus[letter] = "present";
        } else if (!statusesAtPos.some(s => s === "present" || s === "correct")) {
          // Only set absent if we don't already have a better status
          if (!newKeyboardStatus[letter]) newKeyboardStatus[letter] = "absent";
        }
      }

      const hasWon = state.solutions.every(solution => newGuesses.includes(solution));
      const newAttemptsLeft = state.attemptsLeft - 1;
      const hasLost = newAttemptsLeft === 0 && !hasWon;

      return {
        ...state,
        currentGuess: Array(5).fill(""),
        cursor: 0,
        guesses: newGuesses,
        currentRow: state.currentRow + 1,
        boards: newBoards,
        keyboardStatus: newKeyboardStatus,
        attemptsLeft: newAttemptsLeft,
        gameStatus: hasWon ? "won" : hasLost ? "lost" : "playing",
      };
    }
    
    case "SET_GAME_STATUS":
      return {
        ...state,
        gameStatus: action.payload,
      };

    case "SET_HIDDEN":
      return {
        ...state,
        hidden: action.payload,
      };

    case "SET_CURSOR":
      return {
        ...state,
        cursor: Math.max(0, Math.min(4, action.payload)),
      };
    
    case "RESET_GAME": {
      const newMaxAttempts = getMaxAttempts(state.mode);
      const newSolutions = getRandomSolutions(state.mode, state.solutions);
      return {
        ...initialState,
        mode: state.mode,
        maxAttempts: newMaxAttempts,
        attemptsLeft: newMaxAttempts,
        solutions: newSolutions,
        boards: createInitialBoards(state.mode, newMaxAttempts),
      };
    }
    
    case "SET_SOLUTIONS":
      return {
        ...state,
        solutions: action.payload,
      };
    
    case "SET_CURRENT_GUESS": {
      let arr: string[] = Array(5).fill("");
      if (typeof action.payload === 'string') {
        const s = action.payload as string;
        const chars = s.split("");
        for (let i = 0; i < Math.min(5, chars.length); i++) arr[i] = chars[i];
      } else if (Array.isArray(action.payload)) {
        arr = action.payload.slice(0,5).concat(Array(5).fill("")).slice(0,5);
      }

      // find first empty to set cursor
      const firstEmpty = arr.findIndex(c => c === "");

      return {
        ...state,
        currentGuess: arr,
        cursor: firstEmpty === -1 ? 4 : firstEmpty,
      };
    }
    
    default:
      return state;
  }
};

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isReady, setIsReady] = React.useState(false);
  const [showWin, setShowWin] = React.useState(false);
  const prevGameStatusRef = React.useRef<string | null>(null);

  useEffect(() => {
    const checkWordsLoaded = () => {
      if (isWordLoaded() && fiveLetterWords.length > 0) {
        setIsReady(true);
        try {
          const solutions = getRandomSolutions("termo");
          dispatch({ type: "SET_SOLUTIONS", payload: solutions });
          dispatch({ type: "SET_MODE", payload: "termo" });
        } catch (err) {
          console.error('Erro ao inicializar soluções:', err);
          dispatch({ type: "SET_ERROR", payload: 'Erro ao inicializar palavras do jogo' });
        }
      } else {
        const error = getLoadError();
        if (error) {
          console.error('Erro ao carregar palavras:', error);
          dispatch({ type: "SET_ERROR", payload: 'Erro ao carregar palavras do jogo' });
        } else {
          setTimeout(checkWordsLoaded, 100);
        }
      }
    };
    checkWordsLoaded();
  }, []);

  // Watch for game end to persist stats and show win modal
  useEffect(() => {
    const prev = prevGameStatusRef.current;
    if (prev !== state.gameStatus) {
      // transition detected
      if (state.gameStatus === 'won' || state.gameStatus === 'lost') {
        try {
          const attempts = state.maxAttempts - state.attemptsLeft;
          const stats = loadStats(state.maxAttempts);

          stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
          if (state.gameStatus === 'won') {
            stats.wins = (stats.wins || 0) + 1;
            stats.currentStreak = (stats.currentStreak || 0) + 1;
            stats.maxStreak = Math.max(stats.maxStreak || 0, stats.currentStreak);
            // increment distribution bucket (attempts)
            stats.distribution[attempts] = (stats.distribution[attempts] || 0) + 1;
            setShowWin(true);
          } else {
            stats.currentStreak = 0;
          }

          saveStats(stats as PersistedStats);
        } catch (e) {
          console.error('Failed to persist stats', e);
        }
      }
    }
    prevGameStatusRef.current = state.gameStatus;
  }, [state.gameStatus, state.attemptsLeft, state.maxAttempts]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Carregando...</h2>
          {state.error && (
            <p className="text-red-500">{state.error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
      <WinModal isOpen={showWin} onClose={() => setShowWin(false)} />
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};