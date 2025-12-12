import { useState, useCallback, RefObject } from 'react';
import type { PieceState, Point } from '@/types/puzzle';
import { rotateGroupAround90Degrees } from '../utils/geometryHelpers';
import { detectNeighborSnap, detectBoardSnap, mergeGroups, lockGroup } from '../utils/snapDetection';

interface UsePieceDraggingProps {
  pieces: PieceState[];
  setPieces: React.Dispatch<React.SetStateAction<PieceState[]>>;
  gameSize: { width: number; height: number };
  config: { rows: number; cols: number };
  containerRef: RefObject<HTMLDivElement | null>;
  boardRef: RefObject<HTMLDivElement | null>;
  isComplete: boolean;
}

export function usePieceDragging({
  pieces,
  setPieces,
  gameSize,
  config,
  containerRef,
  boardRef,
  isComplete
}: UsePieceDraggingProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activePieceId, setActivePieceId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [groupDragOffsets, setGroupDragOffsets] = useState<Record<number, Point>>({});

  const rotateGroup = useCallback((clickedPiece: PieceState) => {
    setPieces(prev => {
      const centerPiece = prev.find(p => p.id === clickedPiece.id)!;
      const pivotX = centerPiece.currentX;
      const pivotY = centerPiece.currentY;

      return prev.map(p => {
        if (p.groupId === clickedPiece.groupId && !p.isLocked) {
          const rotated = rotateGroupAround90Degrees(p.currentX, p.currentY, pivotX, pivotY);
          // Don't use modulo - let rotation accumulate so CSS animates correctly
          // (270 → 360 instead of 270 → 0 which animates backwards)
          return {
            ...p,
            currentX: rotated.x,
            currentY: rotated.y,
            rotation: p.rotation + 90
          };
        }
        return p;
      });
    });
  }, [setPieces]);

  const handlePointerDown = useCallback((e: React.PointerEvent, piece: PieceState) => {
    if (e.button === 2) {
      e.preventDefault();
      rotateGroup(piece);
      return;
    }

    if (piece.isLocked || isComplete || !containerRef.current) return;

    e.preventDefault();
    setIsDragging(true);
    setActivePieceId(piece.id);

    const containerRect = containerRef.current.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - containerRect.left - piece.currentX,
      y: e.clientY - containerRect.top - piece.currentY
    });

    const groupMembers = pieces.filter(p => p.groupId === piece.groupId);
    const relativeOffsets: Record<number, Point> = {};

    groupMembers.forEach(p => {
      relativeOffsets[p.id] = {
        x: p.currentX - piece.currentX,
        y: p.currentY - piece.currentY
      };
    });
    setGroupDragOffsets(relativeOffsets);

    setPieces(prev => prev.map(p =>
      p.groupId === piece.groupId ? { ...p, zIndex: 100 } : { ...p, zIndex: p.isLocked ? 0 : 1 }
    ));
  }, [pieces, setPieces, isComplete, containerRef, rotateGroup]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || activePieceId === null || !containerRef.current) return;

    e.preventDefault();
    const containerRect = containerRef.current.getBoundingClientRect();

    const newLeaderX = e.clientX - containerRect.left - dragOffset.x;
    const newLeaderY = e.clientY - containerRect.top - dragOffset.y;

    setPieces(prev => prev.map(p => {
      const offset = groupDragOffsets[p.id];
      if (offset) {
        return {
          ...p,
          currentX: newLeaderX + offset.x,
          currentY: newLeaderY + offset.y
        };
      }
      return p;
    }));
  }, [isDragging, activePieceId, dragOffset, groupDragOffsets, containerRef, setPieces]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging || activePieceId === null) return;

    const leader = pieces.find(p => p.id === activePieceId);

    if (leader) {
      const groupMembers = pieces.filter(p => p.groupId === leader.groupId);

      // Try neighbor snap first
      const neighborSnap = detectNeighborSnap(leader, groupMembers, pieces);

      if (neighborSnap.shouldSnap && neighborSnap.targetGroupId) {
        setPieces(prev => mergeGroups(
          prev,
          leader.groupId,
          neighborSnap.targetGroupId!,
          neighborSnap.shiftX,
          neighborSnap.shiftY,
          neighborSnap.shouldLock || false
        ));
      } else {
        // Try board snap - use getBoundingClientRect for accurate position with transforms
        let boardOffset = { x: 0, y: 0 };
        if (boardRef.current && containerRef.current) {
          const boardRect = boardRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          boardOffset = {
            x: boardRect.left - containerRect.left,
            y: boardRect.top - containerRect.top
          };
        }

        const boardSnap = detectBoardSnap(groupMembers, boardOffset, gameSize, config);

        if (boardSnap.shouldSnap && boardSnap.shouldLock) {
          setPieces(prev => lockGroup(prev, leader.groupId, boardSnap.shiftX, boardSnap.shiftY));
        }
      }
    }

    setIsDragging(false);
    setActivePieceId(null);
    setGroupDragOffsets({});
  }, [isDragging, activePieceId, pieces, setPieces, gameSize, config, boardRef]);

  return {
    isDragging,
    activePieceId,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}
