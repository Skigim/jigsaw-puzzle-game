import { RefreshCw, PanelLeftClose, PanelLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import type { GameConfig, SampleImage, DifficultyPreset } from '@/types/puzzle';
import { ImageUploader } from './ImageUploader';
import { DifficultySelector } from './DifficultySelector';
import { InstructionsCard } from './InstructionsCard';

interface SidebarProps {
  hasImage: boolean;
  imageUrl: string | null;
  config: GameConfig;
  onConfigChange: (config: GameConfig) => void;
  onImageUpload: (file: File) => void;
  onSampleLoad: (url: string) => void;
  onGeneratePuzzle: () => void;
  hasPieces: boolean;
  isComplete: boolean;
  loading: boolean;
  samples: SampleImage[];
  presets: DifficultyPreset[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  hasImage,
  imageUrl,
  config,
  onConfigChange,
  onImageUpload,
  onSampleLoad,
  onGeneratePuzzle,
  hasPieces,
  isComplete,
  loading,
  samples,
  presets,
  collapsed,
  onToggleCollapse
}: SidebarProps) {
  return (
    <aside 
      className={`flex-shrink-0 bg-card border-r border-border flex flex-col z-10 shadow-xl transition-all duration-300 ease-in-out ${
        collapsed ? 'w-12' : 'w-80'
      }`}
    >
      {/* Toggle button */}
      <div className={`p-2 border-b border-border flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </Button>
      </div>

      {/* Sidebar content - hidden when collapsed */}
      {!collapsed && (
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          {!hasImage ? (
            <ImageUploader
              onUpload={onImageUpload}
              onLoadSample={onSampleLoad}
              samples={samples}
            />
          ) : (
            <ScrollArea className="flex-1">
              <div className="space-y-6">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-background shadow-inner">
                  <img src={imageUrl!} alt="Preview" className="w-full h-full object-contain opacity-50" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {samples.map((sample) => (
                    <button
                      key={sample.label}
                      onClick={() => onSampleLoad(sample.url)}
                      className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <img
                        src={sample.url}
                        alt={sample.label}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-xs font-medium text-white">{sample.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <Separator />

                <DifficultySelector
                  currentConfig={config}
                  onChange={onConfigChange}
                  presets={presets}
                  disabled={hasPieces}
                />

                <Separator />

                <InstructionsCard />

                {!hasPieces && (
                  <Button
                    onClick={onGeneratePuzzle}
                    disabled={loading}
                    className="w-full shadow-lg"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 animate-spin" size={18} />
                        Generating...
                      </>
                    ) : (
                      'Start Puzzle'
                    )}
                  </Button>
                )}

                {hasPieces && !isComplete && (
                  <Button
                    onClick={onGeneratePuzzle}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Scramble / Restart
                  </Button>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </aside>
  );
}
