import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useGame } from "@/contexts/GameContext";
import { useEffect, useState } from "react";
import { loadStats, resetStats, PersistedStats } from "@/lib/stats";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatsModal = ({ isOpen, onClose }: StatsModalProps) => {
  const { state, dispatch } = useGame();
  const [timeUntilNext, setTimeUntilNext] = useState("");
  const [persistedStats, setPersistedStats] = useState<PersistedStats | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilNext(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const s = loadStats(state.maxAttempts);
    setPersistedStats(s);
  }, [state.maxAttempts, state.gameStatus]);

  const handleShare = () => {
    const gameResult = state.gameStatus === "won" ? "✅" : "❌";
    const attempts = state.maxAttempts - state.attemptsLeft;
    const modeText = state.mode === "aleatorio" ? "TERMO" : state.mode.toUpperCase();
    
    // Create emoji grid representation
    const emojiGrid = state.boards[0]
      .slice(0, attempts)
      .map(row => 
        row.map(tile => {
          switch (tile.status) {
            case "correct": return "🟩";
            case "present": return "🟨";
            case "absent": return "⬛";
            default: return "⬜";
          }
        }).join("")
      ).join("\n");

    const shareText = `${modeText} ${gameResult}\n${attempts}/${state.maxAttempts}\n\n${emojiGrid}\n\nhttps://termo.game`;

    if (navigator.share) {
      navigator.share({
        title: `${modeText} - Resultado`,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      // You could add a toast notification here
    }
  };

  const handlePlayAgain = () => {
    dispatch({ type: "RESET_GAME" });
    onClose();
  };

  const handleResetStats = () => {
    resetStats(state.maxAttempts);
    setPersistedStats(loadStats(state.maxAttempts));
  };

  const stats = persistedStats || {
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: {}
  };
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  const attempts = state.maxAttempts - state.attemptsLeft;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-foreground">
            progresso
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Game result */}
          {state.gameStatus !== "playing" && (
            <div className="text-center">
              <p className="text-lg font-semibold mb-2 text-foreground">
                {state.gameStatus === "won" ? "Parabéns! 🎉" : "Que pena! 😔"}
              </p>
              {state.gameStatus === "lost" && (
                <p className="text-sm text-muted-foreground">
                  A palavra era: <span className="font-bold text-foreground">{state.solutions[0]}</span>
                </p>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground">{stats.gamesPlayed}</div>
              <div className="text-xs text-muted-foreground">jogos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">{winRate}%</div>
              <div className="text-xs text-muted-foreground">de vitórias</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">{stats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">sequência</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">{stats.maxStreak}</div>
              <div className="text-xs text-muted-foreground">melhor</div>
            </div>
          </div>

          {/* Distribution */}
          <div>
            <h3 className="text-center font-semibold mb-4 text-foreground">distribuição de tentativas</h3>
            <div className="space-y-2">
              {Array.from({ length: state.maxAttempts }, (_, i) => i + 1).map(num => (
                <div key={num} className="flex items-center gap-2">
                  <div className="w-4 text-sm font-medium text-foreground">{num}</div>
                  <div className="flex-1 bg-muted-foreground/20 h-7 rounded relative overflow-hidden">
                    <div
                      className={`h-full rounded transition-all duration-500 ${
                        state.gameStatus === "won" && attempts === num
                          ? "bg-primary"
                          : "bg-muted-foreground/40"
                      }`}
                      style={{
                        width: (stats.distribution && stats.distribution[num]) > 0 ? "100%" : "4px"
                      }}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm font-bold text-foreground">
                      {(stats.distribution && stats.distribution[num]) || 0}
                    </div>
                  </div>
                </div>
              ))}
              {state.gameStatus === "lost" && (
                <div className="flex items-center gap-2">
                  <div className="w-4 text-sm">💀</div>
                  <div className="flex-1 bg-muted-foreground/20 h-7 rounded relative overflow-hidden">
                    <div className="h-full bg-destructive rounded" style={{ width: "100%" }} />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm font-bold text-foreground">
                      1
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Next word countdown */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">próxima palavra em</p>
            <p className="text-2xl font-mono font-bold text-foreground">{timeUntilNext}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleShare}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              size="lg"
            >
              <Share2 className="h-4 w-4 mr-2" />
              compartilhe
            </Button>
            <Button
              onClick={handlePlayAgain}
              variant="outline"
              className="flex-1 border-border hover:bg-muted"
              size="lg"
            >
              Jogar Novamente
            </Button>
          </div>
          <div className="mt-2 flex justify-center">
            <Button variant="ghost" onClick={handleResetStats} className="text-xs text-muted-foreground">Redefinir estatísticas</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatsModal;