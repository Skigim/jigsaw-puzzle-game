export interface Point {
  x: number;
  y: number;
}

export interface PieceState {
  id: number;
  groupId: string;
  solvedX: number;
  solvedY: number;
  currentX: number;
  currentY: number;
  rotation: number;
  row: number;
  col: number;
  shape: [number, number, number, number];
  isLocked: boolean;
  width: number;
  height: number;
  imgData: string;
  zIndex: number;
  pieceWidth: number;
  pieceHeight: number;
  pad: number;
}

export interface GameConfig {
  rows: number;
  cols: number;
}

export interface GameSize {
  width: number;
  height: number;
}

export interface SampleImage {
  url: string;
  label: string;
}

export interface DifficultyPreset {
  label: string;
  rows: number;
  cols: number;
}
