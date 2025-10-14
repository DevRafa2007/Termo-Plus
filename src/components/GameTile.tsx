import { GameTile as GameTileType } from "@/contexts/GameContext";
import { cn } from "@/lib/utils";

interface GameTileProps {
  tile: GameTileType;
  isActive?: boolean;
  animationDelay?: number;
  onClick?: () => void;
  row?: number;
  col?: number;
}

const GameTile = ({ tile, isActive = false, animationDelay = 0, onClick, row, col }: GameTileProps) => {
  const baseClass = "tile";

  // front is neutral; back gets colored classes depending on status
  const backStatusClass = tile.status === "correct" ? "tile-correct" :
                          tile.status === "present" ? "tile-present" :
                          tile.status === "absent" ? "tile-absent" : "";

  const isReveal = tile.status === "correct" || tile.status === "present" || tile.status === "absent";

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-row={typeof row === 'number' ? row : undefined}
      data-col={typeof col === 'number' ? col : undefined}
      className={cn(baseClass, isReveal && "reveal", onClick && 'cursor-pointer', isActive && 'cursor-active')}
      // keep perspective on container; animationDelay applied to inner rotation via style
    >
      <div
        className="tile-inner"
        style={{
          transitionDelay: isReveal ? `${animationDelay}ms` : undefined,
        }}
      >
  <div className={cn("tile-front", isActive && "border-primary")}>{tile.letter}</div>
        <div className={cn("tile-back", backStatusClass)}>{tile.letter}</div>
      </div>
    </div>
  );
};

export default GameTile;