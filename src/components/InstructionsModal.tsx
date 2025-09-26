import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GameTile from "./GameTile";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionsModal = ({ isOpen, onClose }: InstructionsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Como Jogar
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-sm">
          <p>
            Descubra a palavra certa em 6 tentativas. Depois de cada tentativa, 
            as peças mostram o quão perto você está da solução.
          </p>

          {/* Examples */}
          <div className="space-y-4">
            <div>
              <div className="flex gap-1 mb-2">
                <GameTile tile={{ letter: "T", status: "correct" }} />
                <GameTile tile={{ letter: "U", status: "absent" }} />
                <GameTile tile={{ letter: "R", status: "absent" }} />
                <GameTile tile={{ letter: "M", status: "absent" }} />
                <GameTile tile={{ letter: "A", status: "absent" }} />
              </div>
              <p>
                A letra <span className="font-bold text-game-correct">T</span> faz 
                parte da palavra e está na posição correta.
              </p>
            </div>

            <div>
              <div className="flex gap-1 mb-2">
                <GameTile tile={{ letter: "V", status: "absent" }} />
                <GameTile tile={{ letter: "I", status: "absent" }} />
                <GameTile tile={{ letter: "O", status: "present" }} />
                <GameTile tile={{ letter: "L", status: "absent" }} />
                <GameTile tile={{ letter: "A", status: "absent" }} />
              </div>
              <p>
                A letra <span className="font-bold text-game-present">O</span> faz 
                parte da palavra mas em outra posição.
              </p>
            </div>

            <div>
              <div className="flex gap-1 mb-2">
                <GameTile tile={{ letter: "P", status: "absent" }} />
                <GameTile tile={{ letter: "U", status: "absent" }} />
                <GameTile tile={{ letter: "L", status: "absent" }} />
                <GameTile tile={{ letter: "G", status: "absent" }} />
                <GameTile tile={{ letter: "A", status: "absent" }} />
              </div>
              <p>
                A letra <span className="font-bold text-game-absent">G</span> não 
                faz parte da palavra.
              </p>
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-2 text-xs text-muted-foreground border-t pt-4">
            <p>
              Os acentos são preenchidos automaticamente, e não são considerados 
              nas dicas.
            </p>
            <p>As palavras podem possuir letras repetidas.</p>
            <p>Uma palavra nova aparece a cada dia.</p>
          </div>

          {/* Game modes */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Modos de Jogo</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold">TERMO:</span> 1 palavra, 6 tentativas
              </div>
              <div>
                <span className="font-bold">DUETO:</span> 2 palavras simultâneas, 7 tentativas
              </div>
              <div>
                <span className="font-bold">QUARTETO:</span> 4 palavras simultâneas, 8 tentativas
              </div>
              <div>
                <span className="font-bold">ALEATÓRIO:</span> Palavras aleatórias, 5 jogos por dia
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstructionsModal;