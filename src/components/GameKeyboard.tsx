import React, { useCallback } from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

const GameKeyboard = () => {
  const { state, dispatch } = useGame();

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
  ];

  const handleKeyPress = useCallback((key: string) => {
    if (state.gameStatus !== "playing") return;

    if (key === "ENTER") {
      dispatch({ type: "SUBMIT_GUESS" });
    } else if (key === "⌫") {
      dispatch({ type: "REMOVE_LETTER" });
    } else {
      dispatch({ type: "ADD_LETTER", payload: key });
    }
  }, [state.gameStatus, dispatch]);

  const handleLetterClick = useCallback((letter: string) => {
    if (state.gameStatus !== "playing") return;
    
    // If the letter is already in the current guess, remove the last occurrence
    if (state.currentGuess.includes(letter)) {
      const lastIndex = state.currentGuess.lastIndexOf(letter);
      const newGuess = state.currentGuess.slice(0, lastIndex) + state.currentGuess.slice(lastIndex + 1);
      // We need to update the context to support this
      dispatch({ type: "SET_CURRENT_GUESS", payload: newGuess });
    } else if (state.currentGuess.length < 5) {
      // Add the letter if there's space
      dispatch({ type: "ADD_LETTER", payload: letter });
    }
  }, [state.gameStatus, state.currentGuess, dispatch]);

  const getKeyClass = (key: string) => {
    const baseClass = "key h-12 flex items-center justify-center min-w-[2.5rem] px-2";
    
    if (key === "ENTER" || key === "⌫") {
      return cn(baseClass, "min-w-[4rem] text-xs");
    }

    const status = state.keyboardStatus[key];
    switch (status) {
      case "correct":
        return cn(baseClass, "key-correct");
      case "present":
        return cn(baseClass, "key-present");
      case "absent":
        return cn(baseClass, "key-absent");
      default:
        return baseClass;
    }
  };

  // Handle physical keyboard input
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      
      if (key === "ENTER") {
        handleKeyPress("ENTER");
      } else if (key === "BACKSPACE") {
        handleKeyPress("⌫");
      } else if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.gameStatus, handleKeyPress]);

  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-4">
      <div className="flex flex-col gap-2">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key) => {
              const isLetter = /^[A-Z]$/.test(key);
              return (
                <Button
                  key={key}
                  onClick={() => isLetter ? handleLetterClick(key) : handleKeyPress(key)}
                  className={getKeyClass(key)}
                  disabled={state.gameStatus !== "playing"}
                  variant="ghost"
                >
                  {key === "⌫" ? <Delete className="h-4 w-4" /> : key}
                </Button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameKeyboard;