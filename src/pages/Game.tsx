import { useState } from "react";
import { GameProvider } from "@/contexts/GameContext";
import GameHeader from "@/components/GameHeader";
import GameBoard from "@/components/GameBoard";
import GameKeyboard from "@/components/GameKeyboard";
import StatsModal from "@/components/StatsModal";
import InstructionsModal from "@/components/InstructionsModal";

const Game = () => {
  const [showStats, setShowStats] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <GameProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <GameHeader 
          onShowStats={() => setShowStats(true)}
          onShowInstructions={() => setShowInstructions(true)}
        />
        
        <main className="flex-1 flex flex-col justify-between py-4">
          <GameBoard />
          <GameKeyboard />
        </main>

        <StatsModal 
          isOpen={showStats} 
          onClose={() => setShowStats(false)} 
        />
        
        <InstructionsModal 
          isOpen={showInstructions} 
          onClose={() => setShowInstructions(false)} 
        />
      </div>
    </GameProvider>
  );
};

export default Game;