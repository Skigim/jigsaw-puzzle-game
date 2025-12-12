import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewPuzzle: () => void;
}

export function VictoryModal({ isOpen, onClose, onNewPuzzle }: VictoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Check size={40} className="text-accent-foreground" strokeWidth={3} />
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl font-bold mb-2">Puzzle Solved!</DialogTitle>
            <DialogDescription className="text-base">
              Great job! You've successfully assembled the image.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onNewPuzzle} className="shadow-lg">
            New Puzzle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
