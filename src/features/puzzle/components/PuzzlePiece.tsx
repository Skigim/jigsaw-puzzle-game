import { memo } from 'react';
import type { PieceState } from '@/types/puzzle';

interface PuzzlePieceProps {
  piece: PieceState;
  isDragging: boolean;
  isActive: boolean;
  onPointerDown: (e: React.PointerEvent, piece: PieceState) => void;
}

export const PuzzlePiece = memo(function PuzzlePiece({
  piece,
  isDragging,
  isActive,
  onPointerDown
}: PuzzlePieceProps) {
  return (
    <div
      className="absolute select-none touch-none"
      style={{
        transform: `translate3d(${piece.currentX}px, ${piece.currentY}px, 0) rotate(${piece.rotation}deg)`,
        width: piece.width,
        height: piece.height,
        zIndex: piece.zIndex,
        pointerEvents: 'none',
        transition: isDragging && isActive
          ? 'none'
          : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        filter: piece.isLocked ? 'none' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
      }}
    >
      <img
        src={piece.imgData}
        alt={`Piece ${piece.id}`}
        className="w-full h-full pointer-events-none"
        style={{
          filter: piece.isLocked ? 'brightness(1.0)' : 'brightness(1.1)'
        }}
      />
      {!piece.isLocked && (
        <div
          className="absolute"
          style={{
            left: piece.pad,
            top: piece.pad,
            width: piece.pieceWidth,
            height: piece.pieceHeight,
            cursor: 'grab',
            pointerEvents: 'auto'
          }}
          onPointerDown={(e) => onPointerDown(e, piece)}
        />
      )}
    </div>
  );
});
