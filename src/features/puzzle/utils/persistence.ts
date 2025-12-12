import type { PieceState, GameConfig, GameSize } from '@/types/puzzle';

const STORAGE_KEY = 'jigsaw-puzzle-state';

export interface PersistedState {
  imageUrl: string | null;
  config: GameConfig;
  pieces: PieceState[];
  gameSize: GameSize;
  savedAt: number;
}

export function saveGameState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save game state:', error);
  }
}

export function loadGameState(): PersistedState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const state = JSON.parse(stored) as PersistedState;
    
    // Validate basic structure
    if (!state.pieces || !Array.isArray(state.pieces)) {
      return null;
    }
    
    return state;
  } catch (error) {
    console.warn('Failed to load game state:', error);
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear game state:', error);
  }
}

export function hasPersistedState(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
