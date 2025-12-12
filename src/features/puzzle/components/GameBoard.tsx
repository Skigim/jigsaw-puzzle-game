import { RefObject } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { PieceState, GameSize } from '@/types/puzzle';
import { PuzzlePiece } from './PuzzlePiece';
import { useViewport } from '../hooks/useViewport';
import { Button } from '@/components/ui/button';

interface GameBoardProps {
  pieces: PieceState[];
  gameSize: GameSize;
  showPreview: boolean;
  imageUrl: string | null;
  isDragging: boolean;
  activePieceId: number | null;
  boardRef: RefObject<HTMLDivElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent, piece: PieceState) => void;
  hasImage: boolean;
}

export function GameBoard({
  pieces,
  gameSize,
  showPreview,
  imageUrl,
  isDragging,
  activePieceId,
  boardRef,
  containerRef,
  onPointerDown,
  hasImage
}: GameBoardProps) {
  const {
    viewport,
    isPanning,
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    resetViewport,
    zoomIn,
    zoomOut
  } = useViewport(containerRef);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-w-0 min-h-0 overflow-hidden"
      style={{
        cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : 'default',
        backgroundColor: 'oklch(0.12 0.01 240)',
        position: 'relative'
      }}
      onWheel={handleWheel}
      onPointerDown={handlePanStart}
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
          const isInActiveGroup = pieces.find(p => p.id === activePieceId)?.groupId === piece.groupId;
          return (
            <PuzzlePiece
              key={piece.id}
              piece={piece}
              isDragging={isDragging}
              isActive={isInActiveGroup}
              onPointerDown={onPointerDown}
            />
          );
        })}
      </div>

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
