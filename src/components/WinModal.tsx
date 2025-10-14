import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useGame } from "@/contexts/GameContext";

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WinModal = ({ isOpen, onClose }: WinModalProps) => {
  const { state, dispatch } = useGame();

  const handleShare = () => {
    const attempts = state.maxAttempts - state.attemptsLeft;
    const emojiGrid = state.boards[0]
      .slice(0, attempts)
      .map(row => row.map(tile => (tile.status === 'correct' ? '🟩' : tile.status === 'present' ? '🟨' : '⬛')).join(''))
      .join('\n');

    const shareText = `${state.mode.toUpperCase()} ✅\n${attempts}/${state.maxAttempts}\n\n${emojiGrid}`;
    if (navigator.share) navigator.share({ title: 'TERMO - Vitória', text: shareText });
    else navigator.clipboard.writeText(shareText);
  };

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-foreground">Você acertou! 🎉</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">Parabéns — você acertou a palavra!</p>
          <div className="flex gap-3">
            <Button onClick={handleShare} className="flex-1 bg-primary text-primary-foreground">
              <Share2 className="h-4 w-4 mr-2" /> Compartilhar
            </Button>
            <Button variant="outline" onClick={handlePlayAgain} className="flex-1">
              Jogar novamente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WinModal;
