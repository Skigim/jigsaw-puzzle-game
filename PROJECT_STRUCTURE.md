# Project Directory Structure

## 📂 Complete File Tree

```
jigsaw-puzzle-game/
├── public/
├── src/
│   ├── types/
│   │   └── puzzle.ts                          # TypeScript interfaces & types
│   │
│   ├── constants/
│   │   └── puzzle.ts                          # Game constants
│   │
│   ├── features/
│   │   └── puzzle/
│   │       ├── components/
│   │       │   ├── GameHeader.tsx             # Top navigation bar
│   │       │   ├── Sidebar.tsx                # Left control panel
│   │       │   ├── ImageUploader.tsx          # Image selection UI
│   │       │   ├── DifficultySelector.tsx     # Difficulty buttons
│   │       │   ├── InstructionsCard.tsx       # How-to-play guide
│   │       │   ├── GameBoard.tsx              # Main play area
│   │       │   ├── PuzzlePiece.tsx            # Individual piece
│   │       │   └── VictoryModal.tsx           # Completion dialog
│   │       │
│   │       ├── hooks/
│   │       │   ├── useImageLoader.ts          # Image loading logic
│   │       │   ├── usePuzzleGenerator.ts      # Piece generation
│   │       │   ├── usePieceDragging.ts        # Drag & drop logic
│   │       │   └── usePuzzleGame.ts           # Main game orchestrator
│   │       │
│   │       └── utils/
│   │           ├── canvasRenderer.ts          # Canvas drawing functions
│   │           ├── snapDetection.ts           # Snap logic
│   │           └── geometryHelpers.ts         # Math utilities
│   │
│   ├── components/
│   │   └── ui/                                # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── badge.tsx
│   │       ├── separator.tsx
│   │       ├── scroll-area.tsx
│   │       ├── tooltip.tsx
│   │       └── ...
│   │
│   ├── hooks/
│   │   └── use-mobile.ts                      # Existing hook
│   │
│   ├── lib/
│   │   └── utils.ts                           # Utility helpers
│   │
│   ├── styles/
│   │   └── theme.css                          # Theme variables
│   │
│   ├── App.tsx                                # Main app (simplified)
│   ├── main.tsx                               # Entry point
│   ├── index.css                              # Global styles
│   └── ErrorFallback.tsx                      # Error boundary
│
├── components.json                            # shadcn/ui config
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── package.json
├── PRD.md                                     # Product requirements
├── REFACTOR_PLAN.md                           # This refactor plan
├── PROJECT_STRUCTURE.md                       # This file
└── README.md
```

## 📊 Module Dependency Graph

```
App.tsx
  └─> usePuzzleGame (main orchestrator)
        ├─> useImageLoader
        ├─> usePuzzleGenerator
        │     ├─> canvasRenderer
        │     └─> geometryHelpers
        └─> usePieceDragging
              ├─> snapDetection
              └─> geometryHelpers

Components Tree:
  App.tsx
    ├─> GameHeader
    ├─> Sidebar
    │     ├─> ImageUploader
    │     ├─> DifficultySelector
    │     └─> InstructionsCard
    ├─> GameBoard
    │     └─> PuzzlePiece (array)
    └─> VictoryModal
```

## 🎯 Feature Isolation

Each feature module is self-contained:

### `/features/puzzle/`
- **Components**: UI elements specific to puzzle game
- **Hooks**: Game logic and state management
- **Utils**: Pure functions for puzzle mechanics

This structure allows:
- Easy addition of new game modes
- Testing individual features
- Code reuse across different views
- Clear separation of concerns

## 📦 Import Examples

```typescript
// Types
import type { PieceState, GameConfig } from '@/types/puzzle';

// Constants
import { SNAP_THRESHOLD, SAMPLE_IMAGES } from '@/constants/puzzle';

// Hooks
import { usePuzzleGame } from '@/features/puzzle/hooks/usePuzzleGame';

// Components
import { GameHeader } from '@/features/puzzle/components/GameHeader';
import { Button } from '@/components/ui/button';

// Utilities
import { drawPuzzlePath } from '@/features/puzzle/utils/canvasRenderer';
import { detectNeighborSnap } from '@/features/puzzle/utils/snapDetection';
```

## 🔄 Migration Path

### Phase 1: Foundation (No UI changes)
1. Create types/puzzle.ts
2. Create constants/puzzle.ts
3. Create utility functions
4. Create hooks (reusing existing logic)

### Phase 2: Component Extraction (UI preserved)
1. Create PuzzlePiece component
2. Create GameBoard component
3. Create modal components
4. Create sidebar components

### Phase 3: shadcn/ui Integration
1. Replace custom buttons with Button component
2. Replace modal with Dialog component
3. Add Card components
4. Add Tooltip components
5. Style refinements

### Phase 4: Final Integration
1. Update App.tsx to use new components
2. Remove old code
3. Test thoroughly
4. Performance optimization

