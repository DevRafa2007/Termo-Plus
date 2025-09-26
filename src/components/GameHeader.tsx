import { useGame, GameMode } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { HelpCircle, BarChart3, Settings } from "lucide-react";

interface GameHeaderProps {
  onShowStats: () => void;
  onShowInstructions: () => void;
}

const GameHeader = ({ onShowStats, onShowInstructions }: GameHeaderProps) => {
  const { state, dispatch } = useGame();

  const modes: { key: GameMode; label: string }[] = [
    { key: "termo", label: "termo" },
    { key: "dueto", label: "dueto" },
    { key: "quarteto", label: "quarteto" },
    { key: "aleatorio", label: "aleatório" },
  ];

  const handleModeChange = (mode: GameMode) => {
    dispatch({ type: "SET_MODE", payload: mode });
  };

  return (
    <header className="w-full bg-card border-b border-border">
      <div className="container mx-auto px-4 py-3">
        {/* Navigation tabs */}
        <nav className="flex justify-center mb-4">
          <div className="flex space-x-1 bg-secondary rounded-lg p-1">
            {modes.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                className={`nav-tab px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  state.mode === key
                    ? "nav-tab-active bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Header with title and actions */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground"
            onClick={onShowInstructions}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          
          <h1 className="text-2xl font-bold uppercase tracking-wider">
            {state.mode === "aleatorio" ? "TERMO" : state.mode.toUpperCase()}
          </h1>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
              onClick={onShowStats}
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Game info */}
        <div className="text-center mt-2">
          <p className="text-sm text-muted-foreground">
            {state.attemptsLeft} tentativa{state.attemptsLeft !== 1 ? "s" : ""} restante{state.attemptsLeft !== 1 ? "s" : ""}
          </p>
          {state.mode === "aleatorio" && (
            <p className="text-xs text-muted-foreground mt-1">
              Modo aleatório • 5 jogos por dia
            </p>
          )}
        </div>
      </div>
    </header>
  );
};

export default GameHeader;