import React from "react";
import { useGame } from "@/contexts/GameContext";
import GameTile from "./GameTile";

const GameBoard = () => {
  const { state, dispatch } = useGame();

  // When cursor or currentRow changes, move DOM focus to the active tile so
  // :focus visual doesn't remain on a previous tile.
  React.useEffect(() => {
    // small timeout to ensure DOM updated
    const t = setTimeout(() => {
      const selector = `.tile[data-row="${state.currentRow}"][data-col="${state.cursor}"]`;
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) el.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [state.cursor, state.currentRow]);

  // Renderiza mensagem de erro quando houver
  const renderError = () => {
    if (!state.error) return null;

    return (
      <div className="mt-2 p-2 text-red-500 text-center font-medium">
        {state.error}
      </div>
    );
  };

  const renderBoard = (boardIndex: number) => {
    const board = state.boards[boardIndex];
    
    return (
      <div className="flex flex-col gap-1">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((tile, colIndex) => {
              // Check if this is the current row and add current guess
              let displayTile = tile;
              if (rowIndex === state.currentRow) {
                displayTile = {
                  letter: state.currentGuess[colIndex] || "",
                  status: state.currentGuess[colIndex] ? "filled" as const : tile.status,
                };
              }

              return (
                <GameTile
                  key={colIndex}
                  tile={displayTile}
                  isActive={rowIndex === state.currentRow && state.cursor === colIndex}
                  animationDelay={colIndex * 100}
                  row={rowIndex}
                  col={colIndex}
                  onClick={() => {
                    if (rowIndex === state.currentRow) {
                      dispatch({ type: 'SET_CURSOR', payload: colIndex });
                    }
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const getBoardLayout = () => {
    switch (state.mode) {
      case "dueto":
        // desktop: 2 columns; mobile: 2 columns. larger vertical gap between boards
  return "grid grid-cols-2 md:grid-cols-2 gap-x-[10px] gap-y-[14px] sm:gap-x-5 sm:gap-y-6 md:gap-x-8 md:gap-y-8 justify-center items-start";
      case "quarteto":
        // desktop: 4 columns; mobile: 2 columns (2x2 layout) with more vertical spacing
  return "grid grid-cols-2 md:grid-cols-4 gap-x-[10px] gap-y-[14px] sm:gap-x-6 sm:gap-y-6 md:gap-x-8 md:gap-y-8 justify-center items-start";
      default:
        // Termo: center single board; increase spacing on mobile so tiles are larger
        return "flex justify-center w-full";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] py-6">
      <div className={`${getBoardLayout()} ${state.mode === 'dueto' || state.mode === 'quarteto' ? 'multi-boards' : ''}`}>
        {state.boards.map((_, boardIndex) => (
          <div key={boardIndex} className="flex justify-center w-full">
            {renderBoard(boardIndex)}
          </div>
        ))}
      </div>
      
      {state.error && (
        <div className="mt-4 p-2 text-red-500 text-center font-medium bg-red-50 rounded-md">
          {state.error}
        </div>
      )}
      
      {state.gameStatus !== "playing" && (
        <div className="mt-8 text-center">
          <p className="text-lg font-semibold mb-2">
            {state.gameStatus === "won" ? "Parabéns! 🎉" : "Que pena! 😔"}
          </p>
          <div className="text-sm text-muted-foreground">
            {state.gameStatus === "lost" && (
              <p>
                {state.solutions.length > 1 ? "As palavras eram: " : "A palavra era: "}
                <span className="font-mono font-bold">
                  {state.solutions.join(", ")}
                </span>
              </p>
            )}
            {state.gameStatus === "won" && (
              <p>
                Você acertou em {state.maxAttempts - state.attemptsLeft} tentativa{state.maxAttempts - state.attemptsLeft !== 1 ? "s" : ""}!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;