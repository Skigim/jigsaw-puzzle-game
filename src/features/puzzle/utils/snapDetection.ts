import type { PieceState, Point, GameConfig, GameSize } from '@/types/puzzle';
import { SNAP_THRESHOLD } from '@/constants/puzzle';

export interface SnapResult {
  shouldSnap: boolean;
  shiftX: number;
  shiftY: number;
  targetGroupId?: string;
  shouldLock?: boolean;
}

export function detectNeighborSnap(
  piece: PieceState,
  groupMembers: PieceState[],
  allPieces: PieceState[],
  snapThreshold: number = SNAP_THRESHOLD
): SnapResult {
  for (const member of groupMembers) {
    const others = allPieces.filter(p => p.groupId !== member.groupId);

    for (const other of others) {
      const isNeighbor = (Math.abs(member.row - other.row) + Math.abs(member.col - other.col)) === 1;
      if (!isNeighbor) continue;

      if (member.rotation % 360 !== other.rotation % 360) continue;

      const targetRelX = member.solvedX - other.solvedX;
      const targetRelY = member.solvedY - other.solvedY;

      const actualRelX = member.currentX - other.currentX;
      const actualRelY = member.currentY - other.currentY;

      const dist = Math.hypot(actualRelX - targetRelX, actualRelY - targetRelY);

      if (dist < snapThreshold) {
        const idealMemberX = other.currentX + targetRelX;
        const idealMemberY = other.currentY + targetRelY;
        const shiftX = idealMemberX - member.currentX;
        const shiftY = idealMemberY - member.currentY;

        return {
          shouldSnap: true,
          shiftX,
          shiftY,
          targetGroupId: other.groupId,
          shouldLock: other.isLocked
        };
      }
    }
  }

  return { shouldSnap: false, shiftX: 0, shiftY: 0 };
}

export function detectBoardSnap(
  groupMembers: PieceState[],
  boardOffset: Point,
  gameSize: GameSize,
  config: GameConfig,
  snapThreshold: number = SNAP_THRESHOLD
): SnapResult {
  for (const member of groupMembers) {
    const pad = (member.width - (gameSize.width / config.cols)) / 2;

    const targetVisX = member.solvedX + boardOffset.x - pad;
    const targetVisY = member.solvedY + boardOffset.y - pad;

    const dist = Math.hypot(member.currentX - targetVisX, member.currentY - targetVisY);

    if (dist < snapThreshold && member.rotation % 360 === 0) {
      const snapShiftX = targetVisX - member.currentX;
      const snapShiftY = targetVisY - member.currentY;

      return {
        shouldSnap: true,
        shiftX: snapShiftX,
        shiftY: snapShiftY,
        shouldLock: true
      };
    }
  }

  return { shouldSnap: false, shiftX: 0, shiftY: 0 };
}

export function mergeGroups(
  pieces: PieceState[],
  sourceGroupId: string,
  targetGroupId: string,
  shiftX: number,
  shiftY: number,
  shouldLock: boolean
): PieceState[] {
  return pieces.map(p => {
    if (p.groupId === sourceGroupId) {
      return {
        ...p,
        currentX: p.currentX + shiftX,
        currentY: p.currentY + shiftY,
        groupId: targetGroupId,
        isLocked: p.isLocked || shouldLock,
        zIndex: shouldLock ? 0 : 1
      };
    }
    return p;
  });
}

export function lockGroup(
  pieces: PieceState[],
  groupId: string,
  shiftX: number,
  shiftY: number
): PieceState[] {
  return pieces.map(p => {
    if (p.groupId === groupId) {
      return {
        ...p,
        currentX: p.currentX + shiftX,
        currentY: p.currentY + shiftY,
        isLocked: true,
        zIndex: 0,
        rotation: 0
      };
    }
    return p;
  });
}
