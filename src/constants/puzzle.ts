import type { SampleImage, DifficultyPreset } from '@/types/puzzle';

export const SNAP_THRESHOLD = 30;

export const TAB_SIZE_RATIO = 0.25;
export const PAD_MULTIPLIER = 0.5;
export const IMAGE_SCALE_FACTOR = 0.75; // Reduced from 0.9 to fit better
export const RANDOM_POSITION_MARGIN = 50;

export const SAMPLE_IMAGES: SampleImage[] = [
  { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80", label: "Mountains" },
  { url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=80", label: "Cat" },
  { url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1000&q=80", label: "City" },
  { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80", label: "Forest" }
];

export const DIFFICULTY_PRESETS: DifficultyPreset[] = [
  { label: 'Easy', rows: 3, cols: 4 },
  { label: 'Medium', rows: 4, cols: 6 },
  { label: 'Hard', rows: 6, cols: 9 }
];
