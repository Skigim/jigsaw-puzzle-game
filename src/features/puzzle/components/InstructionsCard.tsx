import { MousePointer2, RotateCw, Link, Move, ZoomIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMobileDetection } from '@/hooks/use-mobile';

export function InstructionsCard() {
  const { showMobileControls } = useMobileDetection();

  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="text-sm">How to Play</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <MousePointer2 size={14} className="text-primary flex-shrink-0" />
          <span>Drag to move pieces</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCw size={14} className="text-primary flex-shrink-0" />
          <span>
            {showMobileControls 
              ? <><strong>Double-tap</strong> to rotate</>
              : <><strong>Right-click</strong> or <strong>double-click</strong> to rotate</>
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link size={14} className="text-primary flex-shrink-0" />
          <span>Neighbors snap together automatically</span>
        </div>
        <div className="flex items-center gap-2">
          <ZoomIn size={14} className="text-primary flex-shrink-0" />
          <span><strong>Scroll</strong> to zoom in/out</span>
        </div>
        <div className="flex items-center gap-2">
          <Move size={14} className="text-primary flex-shrink-0" />
          <span><strong>Ctrl+drag</strong> or <strong>middle-click</strong> to pan</span>
        </div>
      </CardContent>
    </Card>
  );
}
