import React, { createContext, useContext, useReducer, ReactNode } from "react";

export type GameMode = "termo" | "dueto" | "quarteto" | "aleatorio";

export type TileStatus = "empty" | "filled" | "correct" | "present" | "absent";

export interface GameTile {
  letter: string;
  status: TileStatus;
}

export interface GameState {
  mode: GameMode;
  currentGuess: string;
  guesses: string[];
  gameStatus: "playing" | "won" | "lost";
  currentRow: number;
  solutions: string[];
  keyboardStatus: Record<string, TileStatus>;
  attemptsLeft: number;
  maxAttempts: number;
  boards: GameTile[][][]; // Multiple boards for dueto/quarteto modes
}

type GameAction =
  | { type: "SET_MODE"; payload: GameMode }
  | { type: "ADD_LETTER"; payload: string }
  | { type: "REMOVE_LETTER" }
  | { type: "SUBMIT_GUESS" }
  | { type: "SET_GAME_STATUS"; payload: "playing" | "won" | "lost" }
  | { type: "RESET_GAME" }
  | { type: "SET_SOLUTIONS"; payload: string[] }
  | { type: "SET_CURRENT_GUESS"; payload: string };

// Sample word lists for each mode
const WORD_LISTS = {
  termo: ["TURMA", "CARRO", "CASA", "LIVRO", "MESA", "CADEIRA", "PORTA", "JANELA"],
  dueto: [
    ["TURMA", "CARRO"], 
    ["CASA", "LIVRO"], 
    ["MESA", "CADEIRA"]
  ],
  quarteto: [
    ["TURMA", "CARRO", "CASA", "LIVRO"],
    ["MESA", "CADEIRA", "PORTA", "JANELA"]
  ],
  aleatorio: ["TURMA", "CARRO", "CASA", "LIVRO", "MESA", "CADEIRA", "PORTA", "JANELA"]
};

const getMaxAttempts = (mode: GameMode): number => {
  switch (mode) {
    case "termo": return 6;
    case "dueto": return 7;
    case "quarteto": return 8;
    case "aleatorio": return 6;
    default: return 6;
  }
};

const getRandomSolutions = (mode: GameMode): string[] => {
  switch (mode) {
    case "termo":
    case "aleatorio":
      return [WORD_LISTS.termo[Math.floor(Math.random() * WORD_LISTS.termo.length)]];
    case "dueto":
      return WORD_LISTS.dueto[Math.floor(Math.random() * WORD_LISTS.dueto.length)];
    case "quarteto":
      return WORD_LISTS.quarteto[Math.floor(Math.random() * WORD_LISTS.quarteto.length)];
    default:
      return ["TURMA"];
  }
};

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
  currentGuess: "",
  guesses: [],
  gameStatus: "playing",
  currentRow: 0,
  solutions: ["TURMA"],
  keyboardStatus: {},
  attemptsLeft: 6,
  maxAttempts: 6,
  boards: createInitialBoards("termo", 6),
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "SET_MODE":
      const maxAttempts = getMaxAttempts(action.payload);
      const solutions = getRandomSolutions(action.payload);
      return {
        ...initialState,
        mode: action.payload,
        maxAttempts,
        attemptsLeft: maxAttempts,
        solutions,
        boards: createInitialBoards(action.payload, maxAttempts),
      };
    
    case "ADD_LETTER":
      if (state.currentGuess.length < 5 && state.gameStatus === "playing") {
        return {
          ...state,
          currentGuess: state.currentGuess + action.payload,
        };
      }
      return state;
    
    case "REMOVE_LETTER":
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1),
      };
    
    case "SUBMIT_GUESS":
      if (state.currentGuess.length === 5 && state.gameStatus === "playing") {
        const newGuesses = [...state.guesses, state.currentGuess];
        const newBoards = state.boards.map((board, boardIndex) => {
          const newBoard = [...board];
          const solution = state.solutions[boardIndex];
          
          // Update current row with guess results
          newBoard[state.currentRow] = state.currentGuess.split("").map((letter, index) => {
            let status: TileStatus = "absent";
            if (solution[index] === letter) {
              status = "correct";
            } else if (solution.includes(letter)) {
              status = "present";
            }
            return { letter, status };
          });
          
          return newBoard;
        });
        
        // Update keyboard status
        const newKeyboardStatus = { ...state.keyboardStatus };
        state.currentGuess.split("").forEach((letter, index) => {
          const isCorrectInAnyBoard = state.solutions.some(solution => solution[index] === letter);
          const isPresentInAnyBoard = state.solutions.some(solution => solution.includes(letter));
          
          if (isCorrectInAnyBoard) {
            newKeyboardStatus[letter] = "correct";
          } else if (isPresentInAnyBoard && newKeyboardStatus[letter] !== "correct") {
            newKeyboardStatus[letter] = "present";
          } else if (!isPresentInAnyBoard) {
            newKeyboardStatus[letter] = "absent";
          }
        });
        
        // Check win condition - all solutions must be guessed
        const hasWon = state.solutions.every(solution => 
          newGuesses.includes(solution)
        );
        
        const newAttemptsLeft = state.attemptsLeft - 1;
        const hasLost = newAttemptsLeft === 0 && !hasWon;
        
        return {
          ...state,
          currentGuess: "",
          guesses: newGuesses,
          currentRow: state.currentRow + 1,
          boards: newBoards,
          keyboardStatus: newKeyboardStatus,
          attemptsLeft: newAttemptsLeft,
          gameStatus: hasWon ? "won" : hasLost ? "lost" : "playing",
        };
      }
      return state;
    
    case "SET_GAME_STATUS":
      return {
        ...state,
        gameStatus: action.payload,
      };
    
    case "RESET_GAME":
      const newMaxAttempts = getMaxAttempts(state.mode);
      const newSolutions = getRandomSolutions(state.mode);
      return {
        ...initialState,
        mode: state.mode,
        maxAttempts: newMaxAttempts,
        attemptsLeft: newMaxAttempts,
        solutions: newSolutions,
        boards: createInitialBoards(state.mode, newMaxAttempts),
      };
    
    case "SET_SOLUTIONS":
      return {
        ...state,
        solutions: action.payload,
      };
    
    case "SET_CURRENT_GUESS":
      return {
        ...state,
        currentGuess: action.payload,
      };
    
    default:
      return state;
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
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