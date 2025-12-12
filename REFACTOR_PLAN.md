# Jigsaw Puzzle Game - Refactor Plan

## 📁 New Directory Structure

```
src/
├── types/
│   └── puzzle.ts                    # Core TypeScript interfaces
├── constants/
│   └── puzzle.ts                    # Constants (SNAP_THRESHOLD, SAMPLE_IMAGES)
├── features/
│   └── puzzle/
│       ├── components/
│       │   ├── GameHeader.tsx       # Header with title, progress, controls
│       │   ├── Sidebar.tsx          # Left sidebar with image selection and config
│       │   ├── GameBoard.tsx        # Main game area with pieces
│       │   ├── PuzzlePiece.tsx      # Individual puzzle piece component
│       │   ├── VictoryModal.tsx     # Victory celebration modal
│       │   ├── ImageUploader.tsx    # Image upload section
│       │   ├── DifficultySelector.tsx # Difficulty selection buttons
│       │   └── InstructionsCard.tsx # How to play instructions
│       ├── hooks/
│       │   ├── usePuzzleGame.ts     # Main game state and logic
│       │   ├── usePuzzleGenerator.ts # Puzzle generation logic
│       │   ├── usePieceDragging.ts  # Dragging interaction logic
│       │   └── useImageLoader.ts    # Image loading logic
│       └── utils/
│           ├── canvasRenderer.ts    # Canvas drawing functions (drawPuzzlePath, drawTab)
│           ├── snapDetection.ts     # Snap logic (neighbor & board snapping)
│           └── geometryHelpers.ts   # Geometric calculations
├── components/
│   └── ui/                          # Existing shadcn/ui components
└── App.tsx                          # Simplified main component
```

---

## 🔧 Refactoring Breakdown

### 1. **Types & Interfaces** → `src/types/puzzle.ts`
Extract all TypeScript interfaces:
- `Point`
- `PieceState`
- `GameConfig`
- `GameSize`
- `SampleImage`

---

### 2. **Constants** → `src/constants/puzzle.ts`
Extract configuration constants:
- `SNAP_THRESHOLD = 30`
- `SAMPLE_IMAGES` array
- `DIFFICULTY_PRESETS` (Easy, Medium, Hard configurations)
- `TAB_SIZE_RATIO = 0.25`
- `PAD_MULTIPLIER = 0.5`

---

### 3. **Utility Functions**

#### `src/features/puzzle/utils/canvasRenderer.ts`
Canvas-related drawing logic:
- `drawPuzzlePath(ctx, width, height, shape)`
- `drawTab(ctx, length, size, type, isVertical, isReverse, pieceWidth, pieceHeight)`
- `generatePieceImage(image, row, col, shape, pieceWidth, pieceHeight, finalWidth, finalHeight)`

#### `src/features/puzzle/utils/snapDetection.ts`
Snapping logic:
- `detectNeighborSnap(piece, allPieces, snapThreshold)`
- `detectBoardSnap(piece, boardOffset, gameSize, config, snapThreshold)`
- `mergeGroups(pieces, sourceGroupId, targetGroupId, shiftX, shiftY, shouldLock)`

#### `src/features/puzzle/utils/geometryHelpers.ts`
Geometric calculations:
- `calculateImageDimensions(image, containerWidth, containerHeight, scaleFactor)`
- `calculateEffectiveDimensions(width, height, rotation)`
- `getRandomPosition(containerWidth, containerHeight, effectiveWidth, effectiveHeight, margin)`
- `rotatePoint(point, pivot, angleDegrees)`

---

### 4. **Custom Hooks**

#### `src/features/puzzle/hooks/useImageLoader.ts`
**Purpose:** Handle image loading from upload or samples
**State:**
- `image: HTMLImageElement | null`
- `imageUrl: string | null`
**Methods:**
- `loadFromFile(file: File)`
- `loadFromUrl(url: string)`
- `resetImage()`

#### `src/features/puzzle/hooks/usePuzzleGenerator.ts`
**Purpose:** Generate puzzle pieces from image
**Dependencies:** `useImageLoader`, canvas utilities
**State:**
- `pieces: PieceState[]`
- `gameSize: GameSize`
- `loading: boolean`
**Methods:**
- `generatePuzzle(config: GameConfig, containerRef: RefObject<HTMLDivElement>)`
- `resetPuzzle()`

#### `src/features/puzzle/hooks/usePieceDragging.ts`
**Purpose:** Handle piece dragging, rotation, and snapping
**State:**
- `isDragging: boolean`
- `activePieceId: number | null`
- `dragOffset: Point`
- `groupDragOffsets: Record<number, Point>`
**Methods:**
- `handlePointerDown(e, piece)`
- `handlePointerMove(e)`
- `handlePointerUp()`
- `rotateGroup(piece)`

#### `src/features/puzzle/hooks/usePuzzleGame.ts`
**Purpose:** Orchestrate all game logic (main hook)
**Combines:**
- `useImageLoader`
- `usePuzzleGenerator`
- `usePieceDragging`
**Additional State:**
- `config: GameConfig`
- `isComplete: boolean`
- `showPreview: boolean`
**Methods:**
- `setConfig(config)`
- `togglePreview()`
- `resetGame()`

---

### 5. **UI Components**

#### `src/features/puzzle/components/GameHeader.tsx`
**Props:** `progress: number`, `showPreview: boolean`, `onTogglePreview: () => void`, `onReset: () => void`, `hasImage: boolean`
**shadcn/ui Used:** `Button`

#### `src/features/puzzle/components/ImageUploader.tsx`
**Props:** `onUpload: (file: File) => void`, `onLoadSample: (url: string) => void`, `samples: SampleImage[]`
**shadcn/ui Used:** `Button`, `Card`

#### `src/features/puzzle/components/DifficultySelector.tsx`
**Props:** `currentConfig: GameConfig`, `onChange: (config: GameConfig) => void`, `pieceCount: number`
**shadcn/ui Used:** `Button`, `Badge`

#### `src/features/puzzle/components/InstructionsCard.tsx`
**Props:** None (static display)
**shadcn/ui Used:** `Card`

#### `src/features/puzzle/components/Sidebar.tsx`
**Props:** Combines ImageUploader, DifficultySelector, InstructionsCard
**shadcn/ui Used:** `ScrollArea`, `Separator`

#### `src/features/puzzle/components/PuzzlePiece.tsx`
**Props:** `piece: PieceState`, `isDragging: boolean`, `isActive: boolean`, `onPointerDown: (e, piece) => void`
**Memoized:** Use `React.memo` for performance

#### `src/features/puzzle/components/GameBoard.tsx`
**Props:** `pieces: PieceState[]`, `gameSize: GameSize`, `showPreview: boolean`, `imageUrl: string | null`, dragging handlers
**Contains:** PuzzlePiece array, board overlay, preview image

#### `src/features/puzzle/components/VictoryModal.tsx`
**Props:** `isOpen: boolean`, `onClose: () => void`, `onNewPuzzle: () => void`
**shadcn/ui Used:** `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Button`

---

## 🎨 shadcn/ui Component Replacements

### Current Custom Elements → shadcn/ui Replacements

| Current Implementation | Replace With | File Location |
|------------------------|--------------|---------------|
| `<button className="px-6 py-3 bg-primary...">` | `<Button variant="default" size="lg">` | Multiple locations |
| `<button className="p-2 hover:bg-secondary...">` | `<Button variant="ghost" size="icon">` | GameHeader |
| `<button className="px-3 py-2 rounded-md...">` | `<Button variant="outline" size="sm">` | DifficultySelector |
| Custom modal div | `<Dialog>` component | VictoryModal |
| Custom card divs | `<Card>`, `<CardHeader>`, `<CardContent>` | Sidebar sections |
| Progress badge | `<Badge variant="secondary">` | GameHeader |
| Custom scroll area | `<ScrollArea>` | Sidebar |
| Divider lines | `<Separator />` | Sidebar |
| Tooltip-able buttons | Wrap with `<TooltipProvider>` + `<Tooltip>` | GameHeader icons |

---

## 📋 Component Catalogue with shadcn/ui Usage

### **GameHeader.tsx**
```tsx
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Replace custom buttons with:
<Button variant="ghost" size="icon" onClick={onTogglePreview}>
  <Maximize size={20} />
</Button>

// Replace progress display with:
<Badge variant="secondary" className="font-mono">
  {progress}%
</Badge>
```

### **ImageUploader.tsx**
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Replace custom card with:
<Card className="border-dashed">
  <CardContent className="flex flex-col items-center">
    {/* Upload UI */}
  </CardContent>
</Card>

// Replace browse button:
<Button size="lg" asChild>
  <label>
    Browse Files
    <input type="file" className="hidden" />
  </label>
</Button>
```

### **DifficultySelector.tsx**
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Replace difficulty buttons:
<Button 
  variant={isSelected ? "default" : "outline"}
  onClick={() => onChange(config)}
>
  {label}
</Button>

// Show piece count:
<Badge variant="outline">{pieceCount} pieces</Badge>
```

### **Sidebar.tsx**
```tsx
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Wrap content:
<ScrollArea className="h-full">
  <ImageUploader />
  <Separator className="my-6" />
  <DifficultySelector />
  <Separator className="my-6" />
  <InstructionsCard />
</ScrollArea>
```

### **VictoryModal.tsx**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Replace custom modal:
<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Puzzle Solved!</DialogTitle>
      <DialogDescription>
        Great job! You've successfully assembled the image.
      </DialogDescription>
    </DialogHeader>
    <div className="flex gap-2 justify-end">
      <Button variant="secondary" onClick={onClose}>Close</Button>
      <Button onClick={onNewPuzzle}>New Puzzle</Button>
    </div>
  </DialogContent>
</Dialog>
```

### **InstructionsCard.tsx**
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card className="bg-secondary/50">
  <CardHeader>
    <CardTitle className="text-sm">How to Play</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2 text-xs">
    {/* Instructions */}
  </CardContent>
</Card>
```

---

## 🚀 Implementation Order

1. ✅ **Create directory structure**
2. 📝 **Create types and constants files**
3. 🔧 **Extract utility functions** (pure functions, no dependencies)
4. 🪝 **Build custom hooks** (bottom-up: image loader → generator → dragging → main game)
5. 🎨 **Create UI components** (leaf components first: pieces → modals → sections → containers)
6. ♻️ **Refactor App.tsx** to use new hooks and components
7. 🧪 **Test the refactored application**

---

## ✅ Benefits After Refactor

- **Maintainability:** Clear separation of concerns, easier to locate and fix bugs
- **Reusability:** Hooks and utilities can be reused or extended
- **Testability:** Pure functions and isolated hooks are easier to unit test
- **Consistency:** Using shadcn/ui provides consistent styling and behavior
- **Performance:** Memoized components prevent unnecessary re-renders
- **Accessibility:** shadcn/ui components have built-in a11y features
- **Type Safety:** Better type inference with smaller, focused modules
- **Developer Experience:** Easier to onboard new developers, clearer code structure

---

## 📊 File Size Comparison

| Before | After |
|--------|-------|
| App.tsx: 806 lines | App.tsx: ~150 lines |
| Total files: 1 | Total files: ~20 |
| | Better IDE navigation |
| | Improved code splitting |

