import type { Point, GameSize } from '@/types/puzzle';
import { IMAGE_SCALE_FACTOR, RANDOM_POSITION_MARGIN } from '@/constants/puzzle';

export function calculateImageDimensions(
  image: HTMLImageElement,
  containerWidth: number,
  containerHeight: number,
  scaleFactor: number = IMAGE_SCALE_FACTOR
): GameSize {
  const imgRatio = image.width / image.height;
  const containerRatio = containerWidth / containerHeight;

  let finalWidth: number;
  let finalHeight: number;

  if (imgRatio > containerRatio) {
    finalWidth = containerWidth * scaleFactor;
    finalHeight = finalWidth / imgRatio;
  } else {
    finalHeight = containerHeight * scaleFactor;
    finalWidth = finalHeight * imgRatio;
  }

  return { width: finalWidth, height: finalHeight };
}

export function calculateEffectiveDimensions(
  width: number,
  height: number,
  rotation: number
): { width: number; height: number } {
  if (rotation === 90 || rotation === 270) {
    return { width: height, height: width };
  }
  return { width, height };
}

export function getRandomPosition(
  containerWidth: number,
  containerHeight: number,
  effectiveWidth: number,
  effectiveHeight: number,
  margin: number = RANDOM_POSITION_MARGIN
): Point {
  const maxX = Math.max(margin, containerWidth - effectiveWidth - margin);
  const maxY = Math.max(margin, containerHeight - effectiveHeight - margin);

  const rangeX = Math.max(0, maxX - margin);
  const rangeY = Math.max(0, maxY - margin);

  const randomX = Math.random() * rangeX + margin;
  const randomY = Math.random() * rangeY + margin;

  return { x: randomX, y: randomY };
}

export function rotatePoint(point: Point, pivot: Point, angleDegrees: number): Point {
  const angleRad = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  const dx = point.x - pivot.x;
  const dy = point.y - pivot.y;

  return {
    x: pivot.x + (dx * cos - dy * sin),
    y: pivot.y + (dx * sin + dy * cos)
  };
}

export function rotateGroupAround90Degrees(
  currentX: number,
  currentY: number,
  pivotX: number,
  pivotY: number
): Point {
  const dx = currentX - pivotX;
  const dy = currentY - pivotY;

  // 90-degree rotation: (x, y) -> (-y, x)
  return {
    x: pivotX - dy,
    y: pivotY + dx
  };
}
