import { MousePointer2, RotateCw, Link } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InstructionsCard() {
  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="text-sm">How to Play</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <MousePointer2 size={14} className="text-primary flex-shrink-0" />
          <span>Drag to move groups</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCw size={14} className="text-primary flex-shrink-0" />
          <span><strong>Right-click</strong> to rotate group</span>
        </div>
        <div className="flex items-center gap-2">
          <Link size={14} className="text-primary flex-shrink-0" />
          <span>Neighbors snap together automatically</span>
        </div>
      </CardContent>
    </Card>
  );
}
