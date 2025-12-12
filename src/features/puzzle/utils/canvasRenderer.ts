import { TAB_SIZE_RATIO } from '@/constants/puzzle';

export function drawPuzzlePath(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  shape: number[]
): void {
  const [top, right, bottom, left] = shape;
  const tabSize = Math.min(width, height) * TAB_SIZE_RATIO;

  ctx.beginPath();
  ctx.moveTo(0, 0);

  if (top === 0) {
    ctx.lineTo(width, 0);
  } else {
    drawTab(ctx, width, tabSize, top, false, false, width, height);
  }

  if (right === 0) {
    ctx.lineTo(width, height);
  } else {
    drawTab(ctx, height, tabSize, right, true, false, width, height);
  }

  if (bottom === 0) {
    ctx.lineTo(0, height);
  } else {
    drawTab(ctx, width, tabSize, bottom, false, true, width, height);
  }

  if (left === 0) {
    ctx.lineTo(0, 0);
  } else {
    drawTab(ctx, height, tabSize, left, true, true, width, height);
  }

  ctx.closePath();
}

export function drawTab(
  ctx: CanvasRenderingContext2D,
  length: number,
  size: number,
  type: number,
  isVertical: boolean,
  isReverse: boolean,
  pieceWidth: number,
  pieceHeight: number
): void {
  const width = pieceWidth;
  const height = pieceHeight;

  let ax = 0, ay = 0;
  let nx = 0, ny = 0;

  if (!isVertical && !isReverse) {
    ax = 1; ay = 0; nx = 0; ny = -1;
  } else if (isVertical && !isReverse) {
    ax = 0; ay = 1; nx = 1; ny = 0;
  } else if (!isVertical && isReverse) {
    ax = -1; ay = 0; nx = 0; ny = 1;
  } else if (isVertical && isReverse) {
    ax = 0; ay = -1; nx = -1; ny = 0;
  }

  let originX = 0, originY = 0;
  if (!isVertical && !isReverse) { originX = 0; originY = 0; }
  if (isVertical && !isReverse) { originX = width; originY = 0; }
  if (!isVertical && isReverse) { originX = width; originY = height; }
  if (isVertical && isReverse) { originX = 0; originY = height; }

  const pt = (l: number, n: number) => {
    const actualN = n * type;
    return {
      x: originX + (l * length * ax) + (actualN * nx),
      y: originY + (l * length * ay) + (actualN * ny)
    };
  };

  const s1 = 0.35;
  const s2 = 0.65;
  const h = size * 1.2;

  const p1 = pt(s1, 0);
  ctx.lineTo(p1.x, p1.y);

  const top = pt(0.5, h);

  ctx.bezierCurveTo(
    pt(s1 + 0.1, 0).x, pt(s1 + 0.1, 0).y,
    pt(0.5 - 0.15, h).x, pt(0.5 - 0.15, h).y,
    top.x, top.y
  );

  ctx.bezierCurveTo(
    pt(0.5 + 0.15, h).x, pt(0.5 + 0.15, h).y,
    pt(s2 - 0.1, 0).x, pt(s2 - 0.1, 0).y,
    pt(s2, 0).x, pt(s2, 0).y
  );

  const end = pt(1.0, 0);
  ctx.lineTo(end.x, end.y);
}

export function generatePieceImage(
  image: HTMLImageElement,
  row: number,
  col: number,
  shape: [number, number, number, number],
  pieceWidth: number,
  pieceHeight: number,
  finalWidth: number,
  finalHeight: number,
  pad: number
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  const baseX = col * pieceWidth;
  const baseY = row * pieceHeight;

  canvas.width = pieceWidth + pad * 2;
  canvas.height = pieceHeight + pad * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(pad, pad);

  drawPuzzlePath(ctx, pieceWidth, pieceHeight, shape);
  ctx.clip();

  ctx.drawImage(
    image,
    -baseX, -baseY,
    finalWidth, finalHeight
  );

  ctx.restore();
  ctx.save();
  ctx.translate(pad, pad);

  // Draw outline
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  drawPuzzlePath(ctx, pieceWidth, pieceHeight, shape);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  return canvas.toDataURL('image/png');
}

export function generateShapeMatrix(rows: number, cols: number): number[][][] {
  const shapeMatrix: number[][][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null).map(() => [0, 0, 0, 0]));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c < cols - 1) {
        const type = Math.random() > 0.5 ? 1 : -1;
        shapeMatrix[r][c][1] = type;
        shapeMatrix[r][c + 1][3] = -type;
      }
      if (r < rows - 1) {
        const type = Math.random() > 0.5 ? 1 : -1;
        shapeMatrix[r][c][2] = type;
        shapeMatrix[r + 1][c][0] = -type;
      }
    }
  }

  return shapeMatrix;
}
