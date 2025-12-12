import { RefObject } from 'react';
import type { PieceState, GameSize } from '@/types/puzzle';
import { PuzzlePiece } from './PuzzlePiece';

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
  return (
    <div
      ref={containerRef}
      className="flex-1 min-w-0 min-h-0 overflow-hidden"
      style={{
        cursor: isDragging ? 'grabbing' : 'default',
        backgroundImage: 'radial-gradient(circle at center, oklch(0.20 0.01 240) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundColor: 'oklch(0.12 0.01 240)',
        position: 'relative'
      }}
    >
      {pieces.length > 0 && (
        <div
          ref={boardRef}
          className="absolute border-2 border-border/30 bg-card/20 rounded-lg shadow-2xl"
          style={{ 
            width: gameSize.width, 
            height: gameSize.height,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
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
