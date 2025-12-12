import { useState, useCallback, RefObject } from 'react';
import type { PieceState, GameConfig, GameSize } from '@/types/puzzle';
import { PAD_MULTIPLIER } from '@/constants/puzzle';
import { calculateImageDimensions, calculateEffectiveDimensions, getRandomPosition } from '../utils/geometryHelpers';
import { generatePieceImage, generateShapeMatrix } from '../utils/canvasRenderer';

export function usePuzzleGenerator() {
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const [gameSize, setGameSize] = useState<GameSize>({ width: 0, height: 0 });
  const [loading, setLoading] = useState<boolean>(false);

  const generatePuzzle = useCallback(async (
    image: HTMLImageElement,
    config: GameConfig,
    containerRef: RefObject<HTMLDivElement | null>
  ) => {
    if (!image || !containerRef.current) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 50));

    const { rows, cols } = config;
    
    // Use getBoundingClientRect for accurate dimensions
    const rect = containerRef.current.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    const dimensions = calculateImageDimensions(image, containerWidth, containerHeight);
    setGameSize(dimensions);

    const pieceWidth = dimensions.width / cols;
    const pieceHeight = dimensions.height / rows;
    const shapeMatrix = generateShapeMatrix(rows, cols);

    const newPieces: PieceState[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const shape = shapeMatrix[r][c] as [number, number, number, number];
        const baseX = c * pieceWidth;
        const baseY = r * pieceHeight;
        const pad = Math.max(pieceWidth, pieceHeight) * PAD_MULTIPLIER;

        const canvasWidth = pieceWidth + pad * 2;
        const canvasHeight = pieceHeight + pad * 2;

        const imgData = generatePieceImage(
          image,
          r,
          c,
          shape,
          pieceWidth,
          pieceHeight,
          dimensions.width,
          dimensions.height,
          pad
        );

        const randomRot = Math.floor(Math.random() * 4) * 90;
        const effectiveDimensions = calculateEffectiveDimensions(canvasWidth, canvasHeight, randomRot);
        const randomPosition = getRandomPosition(
          containerWidth,
          containerHeight,
          effectiveDimensions.width,
          effectiveDimensions.height
        );

        // Clamp positions to ensure they stay within container bounds
        const clampedX = Math.max(0, Math.min(randomPosition.x, containerWidth - effectiveDimensions.width));
        const clampedY = Math.max(0, Math.min(randomPosition.y, containerHeight - effectiveDimensions.height));

        newPieces.push({
          id: r * cols + c,
          groupId: `${r * cols + c}`,
          solvedX: baseX,
          solvedY: baseY,
          currentX: clampedX,
          currentY: clampedY,
          rotation: randomRot,
          row: r,
          col: c,
          shape,
          isLocked: false,
          width: canvasWidth,
          height: canvasHeight,
          imgData,
          zIndex: 1,
          pieceWidth,
          pieceHeight,
          pad
        });
      }
    }

    setPieces(newPieces);
    setLoading(false);
  }, []);

  const resetPuzzle = useCallback(() => {
    setPieces([]);
    setGameSize({ width: 0, height: 0 });
  }, []);

  const restoreState = useCallback((savedPieces: PieceState[], savedGameSize: GameSize) => {
    setPieces(savedPieces);
    setGameSize(savedGameSize);
  }, []);

  return {
    pieces,
    setPieces,
    gameSize,
    loading,
    generatePuzzle,
    resetPuzzle,
    restoreState
  };
}
