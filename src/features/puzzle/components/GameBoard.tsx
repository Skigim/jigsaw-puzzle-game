import { RefObject, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { PieceState, GameSize } from '@/types/puzzle';
import { PuzzlePiece } from './PuzzlePiece';
import { Button } from '@/components/ui/button';
import type { SelectionBox } from '../hooks/usePieceDragging';

interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

interface GameBoardProps {
  pieces: PieceState[];
  gameSize: GameSize;
  showPreview: boolean;
  imageUrl: string | null;
  isDragging: boolean;
  activePieceId: number | null;
  selectedPieceIds: Set<number>;
  selectionBox: SelectionBox | null;
  isSelectingBox: boolean;
  boardRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent, piece: PieceState) => void;
  onStartSelectionBox: (e: React.PointerEvent) => void;
  onClearSelection: () => void;
  hasImage: boolean;
  // Viewport props (lifted from useViewport)
  viewport: ViewportState;
  isPanning: boolean;
  handleWheel: (e: React.WheelEvent) => void;
  handlePanStart: (e: React.PointerEvent) => void;
  handlePanMove: (e: React.PointerEvent) => void;
  handlePanEnd: () => void;
  resetViewport: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export function GameBoard({
  pieces,
  gameSize,
  showPreview,
  imageUrl,
  isDragging,
  activePieceId,
  selectedPieceIds,
  selectionBox,
  isSelectingBox,
  boardRef,
  containerRef,
  onPointerDown,
  onStartSelectionBox,
  onClearSelection,
  hasImage,
  viewport,
  isPanning,
  handleWheel,
  handlePanStart,
  handlePanMove,
  handlePanEnd,
  resetViewport,
  zoomIn,
  zoomOut
}: GameBoardProps) {
  // Memoize activeGroupId to avoid recalculating for each piece
  const activeGroupId = useMemo(() => {
    if (activePieceId === null) return null;
    return pieces.find(p => p.id === activePieceId)?.groupId ?? null;
  }, [activePieceId, pieces]);

  // Handler for container pointer down - starts selection box or panning
  const handleContainerPointerDown = (e: React.PointerEvent) => {
    // Middle mouse button or ctrl+click = pan
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      handlePanStart(e);
      return;
    }
    
    // Left click on empty space = start selection box
    if (e.button === 0 && !e.ctrlKey && hasImage) {
      onStartSelectionBox(e);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 min-w-0 min-h-0 overflow-hidden"
      style={{
        cursor: isSelectingBox ? 'crosshair' : isPanning ? 'grabbing' : isDragging ? 'grabbing' : 'default',
        backgroundColor: 'oklch(0.12 0.01 240)',
        position: 'relative'
      }}
      onWheel={handleWheel}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handlePanMove}
      onPointerUp={handlePanEnd}
      onPointerLeave={handlePanEnd}
    >
      {/* Zoom controls */}
      {hasImage && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1 bg-card/80 backdrop-blur-sm rounded-lg p-1 border border-border shadow-lg">
          <Button variant="ghost" size="icon" onClick={zoomIn} className="h-8 w-8" title="Zoom in">
            <ZoomIn size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={zoomOut} className="h-8 w-8" title="Zoom out">
            <ZoomOut size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={resetViewport} className="h-8 w-8" title="Reset view">
            <Maximize2 size={16} />
          </Button>
          <div className="text-[10px] text-center text-muted-foreground font-mono px-1">
            {Math.round(viewport.scale * 100)}%
          </div>
        </div>
      )}

      {/* Pannable/zoomable content layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transformOrigin: '0 0',
          backgroundImage: 'radial-gradient(circle at center, oklch(0.20 0.01 240) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {pieces.length > 0 && (
          <div
            ref={boardRef}
            className="absolute border-2 border-border/30 bg-card/20 rounded-lg shadow-2xl"
            style={{ 
              width: gameSize.width, 
              height: gameSize.height,
              right: '2rem',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          >
            {showPreview && imageUrl && (
              <img
                src={imageUrl}
                className="w-full h-full opacity-20 object-fill pointer-events-none filter grayscale"
                alt=""
              />
            )}
          </div>
        )}

        {pieces.map((piece) => {
          // Check if piece is selected via multi-selection OR single selection
          const isInActiveGroup = activeGroupId !== null && piece.groupId === activeGroupId;
          const isMultiSelected = selectedPieceIds.has(piece.id);
          
          return (
            <PuzzlePiece
              key={piece.id}
              piece={piece}
              isDragging={isDragging}
              isActive={isInActiveGroup}
              isSelected={isInActiveGroup || isMultiSelected}
              onPointerDown={onPointerDown}
            />
          );
        })}

        {/* Selection box */}
        {selectionBox && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.endX),
              top: Math.min(selectionBox.startY, selectionBox.endY),
              width: Math.abs(selectionBox.endX - selectionBox.startX),
              height: Math.abs(selectionBox.endY - selectionBox.startY),
              border: '2px dashed oklch(0.7 0.15 220 / 0.8)',
              backgroundColor: 'oklch(0.7 0.15 220 / 0.1)',
              borderRadius: '4px'
            }}
          />
        )}
      </div>

      {/* Click to clear selection (only when not doing other actions) */}
      {!isDragging && !isPanning && !isSelectingBox && (
        <div
          className="absolute inset-0"
          style={{ pointerEvents: 'none', zIndex: -1 }}
          onClick={onClearSelection}
        />
      )}

      {!hasImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p
            className="text-muted-foreground/20 text-6xl font-black tracking-tighter opacity-20"
            style={{ transform: 'rotate(12deg)' }}
          >
            SNAP
          </p>
        </div>
      )}
    </div>
  );
}
