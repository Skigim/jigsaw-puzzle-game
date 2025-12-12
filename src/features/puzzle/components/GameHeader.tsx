import { Image as ImageIcon, Maximize, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GameHeaderProps {
  progress: number;
  showPreview: boolean;
  onTogglePreview: () => void;
  onReset: () => void;
  hasImage: boolean;
}

export function GameHeader({
  progress,
  showPreview,
  onTogglePreview,
  onReset,
  hasImage
}: GameHeaderProps) {
  return (
    <header className="bg-card p-4 border-b border-border shadow-md z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <ImageIcon size={20} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            SnapPuzzle
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {hasImage && (
            <Badge variant="secondary" className="px-3 py-1.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mr-2">
                Progress
              </span>
              <span className="font-mono text-primary">{progress}%</span>
            </Badge>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showPreview ? 'default' : 'ghost'}
                  size="icon"
                  onClick={onTogglePreview}
                  disabled={!hasImage}
                >
                  <Maximize size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Preview</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onReset}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/20"
                >
                  <X size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
