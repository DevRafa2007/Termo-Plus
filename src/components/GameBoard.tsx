import { useGame } from "@/contexts/GameContext";
import GameTile from "./GameTile";

const GameBoard = () => {
  const { state } = useGame();

  const renderBoard = (boardIndex: number) => {
    const board = state.boards[boardIndex];
    
    return (
      <div className="flex flex-col gap-1">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((tile, colIndex) => {
              // Check if this is the current row and add current guess
              let displayTile = tile;
              if (rowIndex === state.currentRow && state.currentGuess.length > colIndex) {
                displayTile = {
                  letter: state.currentGuess[colIndex],
                  status: "filled" as const,
                };
              }
              
              return (
                <GameTile
                  key={colIndex}
                  tile={displayTile}
                  isActive={rowIndex === state.currentRow}
                  animationDelay={colIndex * 100}
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
        return "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8";
      case "quarteto":
        return "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6";
      default:
        return "flex justify-center";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-8">
      <div className={getBoardLayout()}>
        {state.boards.map((_, boardIndex) => (
          <div key={boardIndex} className="flex justify-center">
            {renderBoard(boardIndex)}
          </div>
        ))}
      </div>
      
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