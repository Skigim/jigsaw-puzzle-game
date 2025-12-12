import { useState, useCallback, useRef, RefObject, useEffect } from 'react';
import type { PieceState, Point } from '@/types/puzzle';
import { rotateGroupAround90Degrees } from '../utils/geometryHelpers';
import { detectNeighborSnap, detectBoardSnap, mergeGroups, lockGroup } from '../utils/snapDetection';

const DOUBLE_TAP_DELAY = 300; // ms

interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface UsePieceDraggingProps {
  pieces: PieceState[];
  setPieces: React.Dispatch<React.SetStateAction<PieceState[]>>;
  gameSize: { width: number; height: number };
  config: { rows: number; cols: number };
  containerRef: RefObject<HTMLDivElement | null>;
  boardRef: RefObject<HTMLDivElement | null>;
  isComplete: boolean;
  viewport: ViewportState;
}

export function usePieceDragging({
  pieces,
  setPieces,
  gameSize,
  config,
  containerRef,
  boardRef,
  isComplete,
  viewport
}: UsePieceDraggingProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activePieceId, setActivePieceId] = useState<number | null>(null);
  const [selectedPieceIds, setSelectedPieceIds] = useState<Set<number>>(new Set());
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [groupDragOffsets, setGroupDragOffsets] = useState<Record<number, Point>>({});
  
  // Selection box state
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isSelectingBox, setIsSelectingBox] = useState<boolean>(false);
  
  // Double-tap detection
  const lastTapRef = useRef<{ pieceId: number; time: number } | null>(null);
  
  // Use ref for viewport to avoid stale closures while keeping callbacks stable
  const viewportRef = useRef(viewport);
  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  // Ref for pieces to avoid stale closures
  const piecesRef = useRef(pieces);
  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);

  // Ref for selectedPieceIds
  const selectedPieceIdsRef = useRef(selectedPieceIds);
  useEffect(() => {
    selectedPieceIdsRef.current = selectedPieceIds;
  }, [selectedPieceIds]);

  const rotateGroup = useCallback((clickedPiece: PieceState) => {
    setPieces(prev => {
      const centerPiece = prev.find(p => p.id === clickedPiece.id)!;
      const pivotX = centerPiece.currentX;
      const pivotY = centerPiece.currentY;

      return prev.map(p => {
        if (p.groupId === clickedPiece.groupId && !p.isLocked) {
          const rotated = rotateGroupAround90Degrees(p.currentX, p.currentY, pivotX, pivotY);
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
    // Right-click to rotate (desktop)
    if (e.button === 2) {
      e.preventDefault();
      rotateGroup(piece);
      return;
    }

    if (piece.isLocked || isComplete || !containerRef.current) return;

    // Double-tap detection for rotation (mobile-friendly)
    const now = Date.now();
    const lastTap = lastTapRef.current;
    
    if (lastTap && lastTap.pieceId === piece.id && (now - lastTap.time) < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      lastTapRef.current = null;
      rotateGroup(piece);
      return;
    }
    
    lastTapRef.current = { pieceId: piece.id, time: now };

    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setActivePieceId(piece.id);

    const containerRect = containerRef.current.getBoundingClientRect();
    const vp = viewportRef.current;
    const contentX = (e.clientX - containerRect.left - vp.x) / vp.scale;
    const contentY = (e.clientY - containerRect.top - vp.y) / vp.scale;

    setDragOffset({
      x: contentX - piece.currentX,
      y: contentY - piece.currentY
    });

    // Determine which pieces to move
    const currentSelected = selectedPieceIdsRef.current;
    const isPartOfSelection = currentSelected.has(piece.id);
    
    let piecesToMove: PieceState[];
    if (isPartOfSelection && currentSelected.size > 0) {
      // Move all selected pieces and their groups
      const allIds = new Set<number>();
      currentSelected.forEach(id => {
        const p = piecesRef.current.find(pp => pp.id === id);
        if (p) {
          piecesRef.current.filter(pp => pp.groupId === p.groupId).forEach(pp => allIds.add(pp.id));
        }
      });
      piecesToMove = piecesRef.current.filter(p => allIds.has(p.id));
    } else {
      // Clear multi-selection when clicking a non-selected piece
      setSelectedPieceIds(new Set());
      // Just move the piece's group
      piecesToMove = piecesRef.current.filter(p => p.groupId === piece.groupId);
    }

    const relativeOffsets: Record<number, Point> = {};
    piecesToMove.forEach(p => {
      relativeOffsets[p.id] = {
        x: p.currentX - piece.currentX,
        y: p.currentY - piece.currentY
      };
    });
    setGroupDragOffsets(relativeOffsets);

    // Bring all moving pieces to front
    const movingIds = new Set(piecesToMove.map(p => p.id));
    setPieces(prev => prev.map(p =>
      movingIds.has(p.id) ? { ...p, zIndex: 100 } : { ...p, zIndex: p.isLocked ? 0 : 1 }
    ));
  }, [isComplete, containerRef, rotateGroup, setPieces]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const vp = viewportRef.current;
    const contentX = (e.clientX - containerRect.left - vp.x) / vp.scale;
    const contentY = (e.clientY - containerRect.top - vp.y) / vp.scale;

    // Handle selection box drawing
    if (isSelectingBox && selectionBox) {
      setSelectionBox(prev => prev ? { ...prev, endX: contentX, endY: contentY } : null);
      return;
    }

    // Handle piece dragging
    if (!isDragging || activePieceId === null) return;

    e.preventDefault();

    const newLeaderX = contentX - dragOffset.x;
    const newLeaderY = contentY - dragOffset.y;

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
  }, [isDragging, isSelectingBox, selectionBox, activePieceId, dragOffset, groupDragOffsets, containerRef, setPieces]);

  const handlePointerUp = useCallback(() => {
    // Handle selection box completion
    if (isSelectingBox && selectionBox) {
      const minX = Math.min(selectionBox.startX, selectionBox.endX);
      const maxX = Math.max(selectionBox.startX, selectionBox.endX);
      const minY = Math.min(selectionBox.startY, selectionBox.endY);
      const maxY = Math.max(selectionBox.startY, selectionBox.endY);
      
      // Find all pieces within the selection box (check piece center)
      const selected = new Set<number>();
      piecesRef.current.forEach(p => {
        if (p.isLocked) return;
        const centerX = p.currentX + p.pieceWidth / 2;
        const centerY = p.currentY + p.pieceHeight / 2;
        if (centerX >= minX && centerX <= maxX && centerY >= minY && centerY <= maxY) {
          selected.add(p.id);
        }
      });
      
      setSelectedPieceIds(selected);
      setSelectionBox(null);
      setIsSelectingBox(false);
      return;
    }

    if (!isDragging || activePieceId === null) return;

    const leader = piecesRef.current.find(p => p.id === activePieceId);

    if (leader) {
      const movingPieceIds = Object.keys(groupDragOffsets).map(Number);
      const groupMembers = piecesRef.current.filter(p => movingPieceIds.includes(p.id));

      // Only do snap detection if we're moving a single group (not multi-selection)
      if (selectedPieceIdsRef.current.size === 0) {
        const neighborSnap = detectNeighborSnap(leader, groupMembers, piecesRef.current);

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
          let boardOffset = { x: 0, y: 0 };
          if (boardRef.current && containerRef.current) {
            const boardRect = boardRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            const vp = viewportRef.current;
            boardOffset = {
              x: (boardRect.left - containerRect.left - vp.x) / vp.scale,
              y: (boardRect.top - containerRect.top - vp.y) / vp.scale
            };
          }

          const boardSnap = detectBoardSnap(groupMembers, boardOffset, gameSize, config);

          if (boardSnap.shouldSnap && boardSnap.shouldLock) {
            setPieces(prev => lockGroup(prev, leader.groupId, boardSnap.shiftX, boardSnap.shiftY));
          }
        }
      }
    }

    setIsDragging(false);
    setGroupDragOffsets({});
  }, [isDragging, isSelectingBox, selectionBox, activePieceId, groupDragOffsets, setPieces, gameSize, config, boardRef, containerRef]);

  // Start selection box when clicking empty space
  const startSelectionBox = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current || isDragging) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const vp = viewportRef.current;
    const contentX = (e.clientX - containerRect.left - vp.x) / vp.scale;
    const contentY = (e.clientY - containerRect.top - vp.y) / vp.scale;
    
    setIsSelectingBox(true);
    setSelectionBox({
      startX: contentX,
      startY: contentY,
      endX: contentX,
      endY: contentY
    });
    setActivePieceId(null);
  }, [containerRef, isDragging]);

  // Clear selection when clicking empty space (without drag)
  const clearSelection = useCallback(() => {
    if (!isDragging && !isSelectingBox) {
      setActivePieceId(null);
      setSelectedPieceIds(new Set());
    }
  }, [isDragging, isSelectingBox]);

  return {
    isDragging,
    activePieceId,
    selectedPieceIds,
    selectionBox,
    isSelectingBox,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    startSelectionBox,
    clearSelection
  };
}
