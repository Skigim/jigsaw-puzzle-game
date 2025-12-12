import { useState } from 'react';
import { usePuzzleGame } from '@/features/puzzle/hooks/usePuzzleGame';
import { GameHeader } from '@/features/puzzle/components/GameHeader';
import { Sidebar } from '@/features/puzzle/components/Sidebar';
import { GameBoard } from '@/features/puzzle/components/GameBoard';
import { VictoryModal } from '@/features/puzzle/components/VictoryModal';
import { SAMPLE_IMAGES, DIFFICULTY_PRESETS } from '@/constants/puzzle';

export default function App() {
  const game = usePuzzleGame();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const progress = game.pieces.length > 0
    ? Math.round((game.pieces.filter(p => p.isLocked).length / game.pieces.length) * 100)
    : 0;

  const handleGeneratePuzzle = () => {
    game.handleGeneratePuzzle();
    setSidebarCollapsed(true);
  };


  return (
    <div
      className="fixed inset-0 bg-background text-foreground flex flex-col select-none overflow-hidden"
      onPointerUp={game.handlePointerUp}
      onPointerMove={game.handlePointerMove}
      onContextMenu={(e) => e.preventDefault()}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <GameHeader
        progress={progress}
        showPreview={game.showPreview}
        onTogglePreview={game.togglePreview}
        onReset={game.handleReset}
        hasImage={!!game.image}
      />

      <main className="flex-1 flex overflow-hidden min-h-0 min-w-0">
        <Sidebar
          hasImage={!!game.image}
          imageUrl={game.imageUrl}
          config={game.config}
          onConfigChange={game.setConfig}
          onImageUpload={game.handleImageUpload}
          onSampleLoad={game.handleSampleLoad}
          onGeneratePuzzle={handleGeneratePuzzle}
          hasPieces={game.pieces.length > 0}
          isComplete={game.isComplete}
          loading={game.loading}
          samples={SAMPLE_IMAGES}
          presets={DIFFICULTY_PRESETS}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <GameBoard
          pieces={game.pieces}
          gameSize={game.gameSize}
          showPreview={game.showPreview}
          imageUrl={game.imageUrl}
          isDragging={game.isDragging}
          activePieceId={game.activePieceId}
          selectedPieceIds={game.selectedPieceIds}
          selectionBox={game.selectionBox}
          isSelectingBox={game.isSelectingBox}
          boardRef={game.boardRef}
          containerRef={game.containerRef}
          onPointerDown={game.handlePointerDown}
          onStartSelectionBox={game.startSelectionBox}
          onClearSelection={game.clearSelection}
          hasImage={!!game.image}
          viewport={game.viewport}
          isPanning={game.isPanning}
          handleWheel={game.handleWheel}
          handlePanStart={game.handlePanStart}
          handlePanMove={game.handlePanMove}
          handlePanEnd={game.handlePanEnd}
          resetViewport={game.resetViewport}
          zoomIn={game.zoomIn}
          zoomOut={game.zoomOut}
        />
      </main>

      <VictoryModal
        isOpen={game.isComplete}
        onClose={() => game.setIsComplete(false)}
        onNewPuzzle={() => {
          game.setIsComplete(false);
          game.handleGeneratePuzzle();
        }}
      />
    </div>
  );
}
