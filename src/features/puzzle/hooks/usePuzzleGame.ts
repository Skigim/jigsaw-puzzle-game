import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameConfig } from '@/types/puzzle';
import { useImageLoader } from './useImageLoader';
import { usePuzzleGenerator } from './usePuzzleGenerator';
import { usePieceDragging } from './usePieceDragging';
import { saveGameState, loadGameState, clearGameState } from '../utils/persistence';

export function usePuzzleGame() {
  const [config, setConfig] = useState<GameConfig>({ rows: 4, cols: 6 });
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(true);

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
    clearGameState();
  }, [imageLoader, generator]);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  // Restore saved state on mount
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState && savedState.imageUrl && savedState.pieces.length > 0) {
      // Restore config
      setConfig(savedState.config);
      
      // Restore image
      imageLoader.loadFromUrl(savedState.imageUrl);
      
      // Restore puzzle state
      generator.restoreState(savedState.pieces, savedState.gameSize);
      
      // Check if already complete
      if (savedState.pieces.every(p => p.isLocked)) {
        setIsComplete(true);
      }
    }
    setIsRestoring(false);
  }, []);

  // Save state when pieces change
  useEffect(() => {
    if (isRestoring) return;
    if (generator.pieces.length > 0 && imageLoader.imageUrl) {
      saveGameState({
        imageUrl: imageLoader.imageUrl,
        config,
        pieces: generator.pieces,
        gameSize: generator.gameSize,
        savedAt: Date.now()
      });
    }
  }, [generator.pieces, generator.gameSize, imageLoader.imageUrl, config, isRestoring]);

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
