import React from "react";
import { useGame, GameMode } from "@/contexts/GameContext";
import { getLoadError, getCommonLoadError } from "@/utils/wordUtils";
import { Button } from "@/components/ui/button";
import { HelpCircle, BarChart3, Settings } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

interface GameHeaderProps {
  onShowStats: () => void;
  onShowInstructions: () => void;
}

const GameHeader = ({ onShowStats, onShowInstructions }: GameHeaderProps) => {
  const { state, dispatch } = useGame();
  const [hidden, setHidden] = React.useState(false);
  const [hideLoadWarning, setHideLoadWarning] = React.useState(false);

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
        {/* Navigation tabs and content */}
        <div className={`header-content ${hidden ? 'header-hidden' : ''}`}>
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
        </div>

        {/* Header with title and actions */}
        <div className="flex items-center justify-center gap-4">
          <div className={`header-actions flex items-center space-x-2 absolute left-4 ${hidden ? 'header-hidden' : ''}`}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
              onClick={onShowInstructions}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>

          <h1 className="text-2xl font-bold uppercase tracking-wider text-center">
            {state.mode === "aleatorio" ? "TERMO" : state.mode.toUpperCase()}
          </h1>

          <div className={`header-actions flex items-center space-x-2 absolute right-4 transition-opacity duration-300 ${hidden ? 'opacity-0 invisible' : 'opacity-100'}`}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
              onClick={onShowStats}
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
              onClick={() => dispatch({ type: 'TOGGLE_AUTO_ADVANCE' })}
              title={state.autoAdvance ? 'Avanço automático: ON' : 'Avanço automático: OFF'}
              aria-pressed={state.autoAdvance}
            >
              <Settings className={`h-5 w-5 ${state.autoAdvance ? '' : 'opacity-50'}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => setHidden(true)}
              aria-label="Esconder"
            >
              <EyeOff className="h-5 w-5" />
            </Button>
          </div>

          {/* Floating reveal button when header is hidden */}
          <div className={`absolute right-3 transition-opacity duration-300 ${!hidden ? 'opacity-0 invisible' : 'opacity-100'}`}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
              onClick={() => setHidden(false)} 
              aria-label="Mostrar"
            >
              <Eye className="h-5 w-5" />
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

      {/* Load warning banner: shown when lexicon failed to load but common words available */}
      { !hideLoadWarning && (getLoadError() || getCommonLoadError()) && (
        <div className="container mx-auto px-4 mt-2">
          <div className="bg-yellow-600/10 border border-yellow-500 text-yellow-200 px-3 py-2 rounded-md text-sm flex items-start justify-between">
            <div>
              <strong>Aviso:</strong>{' '}
              {getLoadError() ? 'O léxico completo não foi carregado (404). O jogo usará a lista reduzida de palavras.' : ''}
            </div>
            <div>
              <button onClick={() => setHideLoadWarning(true)} className="text-yellow-300 hover:underline">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default GameHeader;