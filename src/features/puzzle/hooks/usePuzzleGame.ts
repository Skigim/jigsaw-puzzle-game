import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameConfig } from '@/types/puzzle';
import { useImageLoader } from './useImageLoader';
import { usePuzzleGenerator } from './usePuzzleGenerator';
import { usePieceDragging } from './usePieceDragging';

export function usePuzzleGame() {
  const [config, setConfig] = useState<GameConfig>({ rows: 4, cols: 6 });
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const imageLoader = useImageLoader();
  const generator = usePuzzleGenerator();

  const dragging = usePieceDragging({
    pieces: generator.pieces,
    setPieces: generator.setPieces,
    gameSize: generator.gameSize,
    config,
    containerRef,
    boardRef,
    isComplete
  });

  const handleImageUpload = useCallback((file: File) => {
    imageLoader.loadFromFile(file);
    generator.resetPuzzle();
    setIsComplete(false);
  }, [imageLoader, generator]);

  const handleSampleLoad = useCallback((url: string) => {
    imageLoader.loadFromUrl(url);
    generator.resetPuzzle();
    setIsComplete(false);
  }, [imageLoader, generator]);

  const handleGeneratePuzzle = useCallback(() => {
    if (imageLoader.image) {
      generator.generatePuzzle(imageLoader.image, config, containerRef);
      setIsComplete(false);
    }
  }, [imageLoader.image, config, generator]);

  const handleReset = useCallback(() => {
    imageLoader.resetImage();
    generator.resetPuzzle();
    setIsComplete(false);
  }, [imageLoader, generator]);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  // Check for completion
  useEffect(() => {
    if (generator.pieces.length > 0 && generator.pieces.every(p => p.isLocked)) {
      setIsComplete(true);
    }
  }, [generator.pieces]);

  return {
    // Image state
    image: imageLoader.image,
    imageUrl: imageLoader.imageUrl,

    // Config
    config,
    setConfig,

    // Puzzle state
    pieces: generator.pieces,
    gameSize: generator.gameSize,
    loading: generator.loading,

    // UI state
    isComplete,
    setIsComplete,
    showPreview,

    // Dragging state
    isDragging: dragging.isDragging,
    activePieceId: dragging.activePieceId,

    // Refs
    containerRef,
    boardRef,

    // Actions
    handleImageUpload,
    handleSampleLoad,
    handleGeneratePuzzle,
    handleReset,
    togglePreview,
    handlePointerDown: dragging.handlePointerDown,
    handlePointerMove: dragging.handlePointerMove,
    handlePointerUp: dragging.handlePointerUp
  };
}
