# Planning Guide

A browser-based jigsaw puzzle game that transforms uploaded images into interactive puzzles with realistic tab-and-slot piece shapes, drag-to-move mechanics, rotation, auto-snapping, and group merging.

**Experience Qualities**:
1. **Tactile** - Pieces should feel physical and responsive, with smooth dragging, satisfying snaps, and visual feedback that mimics handling real puzzle pieces.
2. **Immersive** - The dark interface recedes to let the puzzle shine, with subtle environmental cues (grid background, shadows) that enhance focus without distraction.
3. **Rewarding** - Progress indicators, snap confirmations, and victory celebrations provide continuous positive reinforcement throughout the puzzle-solving journey.

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a sophisticated interactive application with canvas rendering, complex geometric algorithms, multi-piece group management, collision detection, state synchronization, and real-time physics-based interactions.

## Essential Features

**Image Upload & Selection**
- Functionality: Users can upload custom images or select from curated samples
- Purpose: Personalization makes puzzles meaningful; samples reduce friction for first-time users
- Trigger: Click "Browse Files" button or click a sample thumbnail
- Progression: File selected → Image loaded → Preview displayed → Configuration options enabled → Ready to generate
- Success criteria: Image renders correctly, maintains aspect ratio, canvas operations work (no CORS issues on samples)

**Difficulty Configuration**
- Functionality: Adjustable grid size (rows × columns) determining piece count
- Purpose: Accommodate different skill levels and time commitments
- Trigger: Click difficulty preset buttons (Easy/Medium/Hard)
- Progression: Button clicked → Grid config updated → Piece count displayed → User confirms by starting puzzle
- Success criteria: Piece count accurately reflects grid dimensions, visual indicator shows selected difficulty

**Puzzle Generation**
- Functionality: Slices image into jigsaw pieces with authentic tab-and-slot interlocking shapes
- Purpose: Create the core gameplay experience with realistic puzzle mechanics
- Trigger: Click "Start Puzzle" button
- Progression: Button clicked → Loading state shown → Canvas renders each piece with tabs/slots → Pieces positioned randomly with random rotation → Pieces become interactive
- Success criteria: All pieces render with correct image portions, tabs/slots align between neighbors, pieces fully visible on screen

**Piece Interaction - Dragging**
- Functionality: Click-and-drag to move individual pieces or merged groups
- Purpose: Core mechanic for solving the puzzle
- Trigger: Pointer down on unlocked piece
- Progression: Pointer down → Drag offset calculated → Group members identified → Pointer move → All group pieces follow rigid-body motion → Pointer up → Check for snapping
- Success criteria: Smooth 60fps dragging, entire groups move together, pieces stay within bounds

**Piece Interaction - Rotation**
- Functionality: Right-click to rotate pieces/groups by 90° clockwise
- Purpose: Adds complexity and spatial reasoning challenge
- Trigger: Right-click (context menu disabled) on piece
- Progression: Right-click → Identify group → Calculate rotation pivot → Rotate all group members 90° around pivot → Update positions
- Success criteria: Smooth rotation animation, group maintains relative positions, pieces can be rotated to 0° for solving

**Neighbor Snapping**
- Functionality: When adjacent puzzle pieces are dragged near their correct relative positions, they snap together and merge into a group
- Purpose: Progressive assembly of the puzzle through connecting pieces
- Trigger: Release piece drag within snap threshold of a neighbor
- Progression: Pointer up → Check all group members vs all non-group pieces → Find grid neighbors → Calculate relative position accuracy → If within threshold → Align perfectly → Merge group IDs → Update z-index
- Success criteria: Pieces snap only to correct neighbors, merged groups move as one unit, visual alignment is pixel-perfect

**Board Locking**
- Functionality: When a piece/group is dragged to its solved position on the board with 0° rotation, it locks permanently
- Purpose: Provides structure and fixed reference points as puzzle progresses
- Trigger: Release piece drag near solved position with correct rotation
- Progression: Pointer up → Calculate board offset → Check distance to solved position → Check rotation is 0° → If within threshold → Snap to exact position → Set isLocked → Disable dragging
- Success criteria: Locked pieces cannot be moved, locked pieces provide anchor for neighbor snapping, all pieces eventually lock

**Progress Tracking**
- Functionality: Real-time percentage display of locked pieces
- Purpose: Motivation and progress visibility
- Trigger: Continuous monitoring of piece states
- Progression: Piece locked → Count updated → Percentage recalculated → Display refreshed → If 100% → Victory triggered
- Success criteria: Percentage updates immediately, reaches 100% only when all pieces locked

**Victory State**
- Functionality: Modal overlay celebrating puzzle completion
- Purpose: Clear goal achievement and option to continue playing
- Trigger: All pieces become locked (isLocked === true)
- Progression: Final piece locked → Victory check → Modal animates in → User can close or start new puzzle
- Success criteria: Modal appears only when 100% complete, options work correctly

**Preview Toggle**
- Functionality: Ghost overlay of original image on the board area
- Purpose: Visual reference for difficult sections
- Trigger: Click preview toggle button in header
- Progression: Button clicked → State toggled → Ghost image shown/hidden at 20% opacity
- Success criteria: Image aligns perfectly with board, doesn't interfere with piece interaction

## Edge Case Handling

- **Pieces Outside Viewport** - Initial randomization constrained to container bounds with safety buffer accounting for tab extensions
- **Rapid Clicking** - Pointer events use capture and preventDefault to avoid state desync; loading state disables controls
- **CORS Image Issues** - Sample images loaded with crossOrigin="Anonymous" to enable canvas operations
- **Group Rotation Edge Cases** - Locked pieces within groups cannot rotate; rotation uses consistent pivot point (clicked piece top-left)
- **Overlapping Snaps** - Priority system: neighbor snap takes precedence over board snap to prevent ambiguity
- **Mobile Touch** - Pointer events (not mouse events) ensure touch compatibility; right-click rotation works via long-press on mobile
- **Performance** - Pieces pre-rendered to data URLs to avoid real-time canvas operations during dragging; transform3d for GPU acceleration

## Design Direction

The design should evoke a **modern digital workshop** - a focused, professional environment for puzzle-solving that feels like premium software. Think dark ambient spaces that recede into the background, with vibrant accent colors highlighting interactive elements. The atmosphere should be calm and contemplative, with smooth animations and subtle shadows creating depth. Visual feedback should be immediate but understated, rewarding without being distracting.

## Color Selection

A sophisticated dark theme with bold accent colors that guide attention to interactive elements and progress.

- **Primary Color**: Rich Indigo (`oklch(0.55 0.18 265)`) - Communicates focus and intelligence; used for primary buttons, active states, and progress indicators
- **Secondary Colors**: 
  - Deep Slate (`oklch(0.20 0.01 240)`) - Foundations, backgrounds, surfaces
  - Lighter Slate (`oklch(0.30 0.01 240)`) - Cards, panels, elevated surfaces
- **Accent Color**: Vibrant Emerald (`oklch(0.65 0.20 155)`) - Success states, completion, "Start Puzzle" CTA - energetic and rewarding
- **Foreground/Background Pairings**: 
  - Background (Slate 950 `oklch(0.12 0.01 240)`): White text (`oklch(0.98 0 0)`) - Ratio 15.2:1 ✓
  - Card (Slate 800 `oklch(0.28 0.01 240)`): White text (`oklch(0.98 0 0)`) - Ratio 11.8:1 ✓
  - Primary Indigo (`oklch(0.55 0.18 265)`): White text (`oklch(0.98 0 0)`) - Ratio 5.2:1 ✓
  - Accent Emerald (`oklch(0.65 0.20 155)`): White text (`oklch(0.98 0 0)`) - Ratio 7.1:1 ✓

## Font Selection

Typography should feel **precise and contemporary**, balancing readability with technical refinement to match the geometric nature of puzzle-solving.

- **Primary Font**: Space Grotesk - A geometric sans-serif with subtle character that feels modern and approachable without being generic
- **Monospace**: JetBrains Mono - For numerical displays (progress %, piece counts) to emphasize data and precision

- **Typographic Hierarchy**:
  - H1 (App Title): Space Grotesk Bold/24px/tight tracking (-0.02em) - Gradient text for brand presence
  - H2 (Victory Title): Space Grotesk Bold/32px/tight tracking - Clear hierarchy in modals
  - H3 (Section Headers): Space Grotesk Medium/16px/normal tracking - Organizes sidebar sections
  - Body: Space Grotesk Regular/14px/relaxed leading (1.5) - Instructions, labels, descriptions
  - Data (Progress): JetBrains Mono Regular/14px/monospace - Numeric displays
  - Small (Hints): Space Grotesk Regular/12px/wide tracking (0.04em) - Uppercase labels and metadata

## Animations

Animations should create a sense of **tangible physicality** - pieces should feel like real objects with weight and momentum. Use spring-based easing for snapping (cubic-bezier(0.34, 1.56, 0.64, 1)) to create satisfying overshoot. Dragging should be immediate (no transition), while releases should settle smoothly (300ms). Rotation should be quick (200ms) to feel responsive. Victory modal should have staggered entrance (backdrop blur fade → card zoom-in) for drama. Hover states should be subtle (200ms color transitions) to avoid distraction. Loading spinner should use smooth rotation to indicate processing.

## Component Selection

- **Components**:
  - **Button** (shadcn) - All CTAs, difficulty presets, controls; customized with gradient backgrounds for primary actions, outline variants for secondary
  - **Card** (implicit via divs) - Sidebar sections, victory modal; using custom Tailwind classes for consistent elevation and borders
  - **Input** (file input) - Hidden with custom label styling for upload button
  - **Icons** (Lucide React) - Navigation, actions, status indicators; 16-20px sizing for consistency
  
- **Customizations**:
  - **Victory Modal** - Custom overlay with backdrop-blur and centered card; not using Dialog to avoid focus trap during puzzle
  - **Puzzle Pieces** - Fully custom canvas-rendered components with transform3d for performance
  - **Progress Badge** - Custom rounded-full pill with monospace font
  
- **States**:
  - Buttons: default → hover (brightness/color shift) → active (scale-95) → disabled (opacity-50)
  - Pieces: default (drop-shadow) → hover (grab cursor) → dragging (grabbing cursor, elevated z-index) → locked (no shadow, no pointer events)
  - Preview Toggle: inactive (muted) → active (indigo background, white icon)
  
- **Icon Selection**:
  - Upload - File upload action
  - ImageIcon - App branding
  - Settings - Configuration section
  - Maximize - Preview toggle
  - X - Close/reset actions
  - RefreshCw - Change image, scramble, loading spinner
  - Check - Victory/completion
  - MousePointer2, RotateCw, Link - Instruction icons
  
- **Spacing**:
  - Container padding: p-6 (24px) for sidebar, p-8 (32px) for game area
  - Component gaps: gap-4 (16px) for forms, gap-8 (32px) for major sections
  - Button padding: px-6 py-3 (24px/12px) for primary, px-3 py-2 (12px/8px) for secondary
  - Border radius: rounded-lg (0.5rem) for cards, rounded-full for pills/badges
  
- **Mobile**:
  - Sidebar becomes full-screen overlay with hamburger menu (< 768px)
  - Game area expands to full viewport
  - Pieces scale down to maintain visibility
  - Touch targets minimum 44×44px (already spec'd)
  - Instructions emphasize "tap and hold" for rotation instead of "right-click"
