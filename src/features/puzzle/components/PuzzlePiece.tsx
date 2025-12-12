import { memo } from 'react';
import type { PieceState } from '@/types/puzzle';

interface PuzzlePieceProps {
  piece: PieceState;
  isDragging: boolean;
  isActive: boolean;
  isSelected: boolean;
  onPointerDown: (e: React.PointerEvent, piece: PieceState) => void;
}

export const PuzzlePiece = memo(function PuzzlePiece({
  piece,
  isDragging,
  isActive,
  isSelected,
  onPointerDown
}: PuzzlePieceProps) {
  // Use will-change only when actively dragging this piece for GPU acceleration
  const willChange = isDragging && isActive ? 'transform' : 'auto';
  
  // Subtle highlight for selected pieces (not locked)
  const selectionShadow = isSelected && !piece.isLocked
    ? '0 0 0 3px oklch(0.7 0.15 220 / 0.7), 0 4px 8px rgba(0,0,0,0.4)'
    : piece.isLocked ? 'none' : '0 4px 8px rgba(0,0,0,0.4)';
  
  return (
    <div
      className="absolute select-none touch-none"
      style={{
        transform: `translate3d(${piece.currentX}px, ${piece.currentY}px, 0) rotate(${piece.rotation}deg)`,
        width: piece.width,
        height: piece.height,
        zIndex: piece.zIndex,
        pointerEvents: 'none',
        willChange,
        // Only apply transition when not actively dragging this group
        transition: isDragging && isActive
          ? 'none'
          : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >
      <img
        src={piece.imgData}
        alt={`Piece ${piece.id}`}
        className="w-full h-full pointer-events-none"
        style={{
          boxShadow: selectionShadow,
          borderRadius: '2px',
          transition: 'box-shadow 0.15s ease'
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
