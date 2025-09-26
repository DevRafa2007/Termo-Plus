import { GameTile as GameTileType } from "@/contexts/GameContext";
import { cn } from "@/lib/utils";

interface GameTileProps {
  tile: GameTileType;
  isActive?: boolean;
  animationDelay?: number;
}

const GameTile = ({ tile, isActive = false, animationDelay = 0 }: GameTileProps) => {
  const getTileClass = () => {
    const baseClass = "tile";
    
    switch (tile.status) {
      case "correct":
        return cn(baseClass, "tile-correct");
      case "present":
        return cn(baseClass, "tile-present");
      case "absent":
        return cn(baseClass, "tile-absent");
      case "filled":
        return cn(baseClass, "tile-filled", isActive && "border-primary");
      default:
        return cn(baseClass, "tile-empty");
    }
  };

  return (
    <div
      className={getTileClass()}
      style={{
        animationDelay: tile.status !== "empty" && tile.status !== "filled" 
          ? `${animationDelay}ms` 
          : undefined
      }}
    >
      {tile.letter}
    </div>
  );
};

export default GameTile;