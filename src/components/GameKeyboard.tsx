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
    ["Z", "X", "C", "V", "B", "N", "M"],
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
    dispatch({ type: "ADD_LETTER", payload: letter });
  }, [state.gameStatus, state.currentGuess.length, dispatch]);

  const getKeyClass = (key: string) => {
    // responsive min-width: slightly smaller on very small screens to avoid overflow,
    // but still touch-friendly on most devices
    const baseClass = "key h-11 sm:h-12 flex items-center justify-center min-w-[1.6rem] sm:min-w-[2.4rem] px-2";
    
    if (key === "ENTER") {
      // ENTER exact width: 72px on mobile (4.5rem)
      return cn(baseClass, "min-w-[4.5rem] sm:min-w-[5.5rem] px-3 font-medium");
    }

    if (key === "⌫") {
      return cn(baseClass, "min-w-[2.4rem]");
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
    <div className="w-full max-w-lg mx-auto px-2 pb-4 safe-bottom">
      <div className="flex flex-col gap-2 w-full">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 w-full flex-wrap">
            {row.map((key) => (
              <Button
                key={key}
                onClick={() => handleLetterClick(key)}
                className={getKeyClass(key)}
                disabled={state.gameStatus !== "playing"}
                variant="ghost"
              >
                {key}
              </Button>
            ))}
            {rowIndex === 2 && (
              // append ENTER and BACKSPACE at the end of the last row
              <>
                <Button onClick={() => handleKeyPress('⌫')} className={getKeyClass('⌫')} variant="ghost">
                  <Delete className="h-5 w-5" />
                </Button>
                <Button onClick={() => handleKeyPress('ENTER')} className={cn(getKeyClass('ENTER'), 'md:flex-none')} variant="ghost">
                  ENTER
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameKeyboard;