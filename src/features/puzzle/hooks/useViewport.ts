import { useState, useCallback, useRef, RefObject } from 'react';

interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 3;
const ZOOM_SENSITIVITY = 0.001;

export function useViewport(containerRef: RefObject<HTMLDivElement | null>) {
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; viewportX: number; viewportY: number } | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Zoom with scroll wheel
    e.preventDefault();
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new scale
    const delta = -e.deltaY * ZOOM_SENSITIVITY;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, viewport.scale * (1 + delta)));
    
    // Zoom toward mouse position
    const scaleRatio = newScale / viewport.scale;
    const newX = mouseX - (mouseX - viewport.x) * scaleRatio;
    const newY = mouseY - (mouseY - viewport.y) * scaleRatio;

    setViewport({ x: newX, y: newY, scale: newScale });
  }, [viewport, containerRef]);

  const handlePanStart = useCallback((e: React.PointerEvent) => {
    // Middle mouse button OR ctrl+left click to pan
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        viewportX: viewport.x,
        viewportY: viewport.y
      };
    }
  }, [viewport]);

  const handlePanMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning || !panStartRef.current) return;
    
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    
    setViewport(prev => ({
      ...prev,
      x: panStartRef.current!.viewportX + dx,
      y: panStartRef.current!.viewportY + dy
    }));
  }, [isPanning]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  const resetViewport = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 });
  }, []);

  const zoomIn = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      scale: Math.min(MAX_SCALE, prev.scale * 1.25)
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      scale: Math.max(MIN_SCALE, prev.scale / 1.25)
    }));
  }, []);

  return {
    viewport,
    isPanning,
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    resetViewport,
    zoomIn,
    zoomOut
  };
}
