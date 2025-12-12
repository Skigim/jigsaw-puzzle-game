import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GameConfig, DifficultyPreset } from '@/types/puzzle';

interface DifficultySelectorProps {
  currentConfig: GameConfig;
  onChange: (config: GameConfig) => void;
  presets: DifficultyPreset[];
  disabled?: boolean;
}

export function DifficultySelector({
  currentConfig,
  onChange,
  presets,
  disabled = false
}: DifficultySelectorProps) {
  const pieceCount = currentConfig.rows * currentConfig.cols;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Difficulty</span>
          <Badge variant="outline" className="ml-2">
            {pieceCount} pieces
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {presets.map((preset) => {
            const isSelected = currentConfig.rows === preset.rows && currentConfig.cols === preset.cols;
            return (
              <Button
                key={preset.label}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ rows: preset.rows, cols: preset.cols })}
                disabled={disabled}
                className="flex-1"
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
