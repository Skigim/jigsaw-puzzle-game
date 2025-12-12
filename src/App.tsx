import { useState, useRef, useEffect } from 'react';
import { Upload, RefreshCw, Maximize, Check, Image as ImageIcon, Settings, X, RotateCw, MousePointer2, Link } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface PieceState {
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

interface GameConfig {
  rows: number;
  cols: number;
}

const SNAP_THRESHOLD = 30;

const SAMPLE_IMAGES = [
  { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80", label: "Mountains" },
  { url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=80", label: "Cat" },
  { url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1000&q=80", label: "City" },
  { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80", label: "Forest" }
];

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [config, setConfig] = useState<GameConfig>({ rows: 4, cols: 6 });
  const [pieces, setPieces] = useState<PieceState[]>([]);
  const [gameSize, setGameSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [activePieceId, setActivePieceId] = useState<number | null>(null);
  const [groupDragOffsets, setGroupDragOffsets] = useState<Record<number, Point>>({});
  
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImageUrl(img.src);
        setPieces([]);
        setIsComplete(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const loadSampleImage = (url: string) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      setImage(img);
      setImageUrl(url);
      setPieces([]);
      setIsComplete(false);
    };
    img.src = url;
  };



  const generatePuzzle = async () => {
    if (!image || !containerRef.current) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 50));

    const { rows, cols } = config;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const imgRatio = image.width / image.height;
    const containerRatio = containerWidth / containerHeight;

    let finalWidth, finalHeight;
    if (imgRatio > containerRatio) {
      finalWidth = containerWidth * 0.9;
      finalHeight = finalWidth / imgRatio;
    } else {
      finalHeight = containerHeight * 0.9;
      finalWidth = finalHeight * imgRatio;
    }

    setGameSize({ width: finalWidth, height: finalHeight });

    const pieceWidth = finalWidth / cols;
    const pieceHeight = finalHeight / rows;

    const shapeMatrix: number[][][] = Array(rows).fill(null).map(() => Array(cols).fill(null).map(() => [0, 0, 0, 0]));

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

    const newPieces: PieceState[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const shape = shapeMatrix[r][c] as [number, number, number, number];
        
        const baseX = c * pieceWidth;
        const baseY = r * pieceHeight;
        
        const pad = Math.max(pieceWidth, pieceHeight) * 0.5;
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
        
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        drawPuzzlePath(ctx, pieceWidth, pieceHeight, shape);
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        const imgData = canvas.toDataURL('image/png');

        const randomRot = Math.floor(Math.random() * 4) * 90;
        
        let effectiveWidth = canvas.width;
        let effectiveHeight = canvas.height;
        if (randomRot === 90 || randomRot === 270) {
          effectiveWidth = canvas.height;
          effectiveHeight = canvas.width;
        }

        const margin = 50;
        const maxX = Math.max(margin, containerWidth - effectiveWidth - margin);
        const maxY = Math.max(margin, containerHeight - effectiveHeight - margin);

        const randomX = Math.random() * (maxX - margin) + margin;
        const randomY = Math.random() * (maxY - margin) + margin;

        newPieces.push({
          id: r * cols + c,
          groupId: `${r * cols + c}`,
          solvedX: baseX,
          solvedY: baseY,
          currentX: randomX,
          currentY: randomY,
          rotation: randomRot,
          row: r,
          col: c,
          shape,
          isLocked: false,
          width: canvas.width,
          height: canvas.height,
          imgData,
          zIndex: 1,
          pieceWidth,
          pieceHeight,
          pad
        });
      }
    }

    setPieces(newPieces);
    setIsComplete(false);
    setLoading(false);
  };

  const drawPuzzlePath = (ctx: CanvasRenderingContext2D, width: number, height: number, shape: number[]) => {
    const [top, right, bottom, left] = shape;
    const tabSize = Math.min(width, height) * 0.25;
    
    ctx.beginPath();
    ctx.moveTo(0, 0);

    if (top === 0) ctx.lineTo(width, 0);
    else drawTab(ctx, width, tabSize, top, false, false, width, height);

    if (right === 0) ctx.lineTo(width, height);
    else drawTab(ctx, height, tabSize, right, true, false, width, height);

    if (bottom === 0) ctx.lineTo(0, height);
    else drawTab(ctx, width, tabSize, bottom, false, true, width, height);

    if (left === 0) ctx.lineTo(0, 0);
    else drawTab(ctx, height, tabSize, left, true, true, width, height);
    
    ctx.closePath();
  };

  const drawTab = (
    ctx: CanvasRenderingContext2D, 
    length: number, 
    size: number, 
    type: number,
    isVertical: boolean,
    isReverse: boolean,
    pieceWidth: number,
    pieceHeight: number
  ) => {
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
  };

  const rotateGroup = (clickedPiece: PieceState) => {
    setPieces(prev => {
        const groupMembers = prev.filter(p => p.groupId === clickedPiece.groupId);
        const centerPiece = prev.find(p => p.id === clickedPiece.id)!;
        
        const pivotX = centerPiece.currentX;
        const pivotY = centerPiece.currentY;

        return prev.map(p => {
            if (p.groupId === clickedPiece.groupId && !p.isLocked) {
                const dx = p.currentX - pivotX;
                const dy = p.currentY - pivotY;
                
                const newDx = -dy;
                const newDy = dx;
                
                return { 
                    ...p, 
                    currentX: pivotX + newDx, 
                    currentY: pivotY + newDy,
                    rotation: (p.rotation + 90) % 360
                };
            }
            return p;
        });
    });
  };

  const handlePointerDown = (e: React.PointerEvent, piece: PieceState) => {
    if (e.button === 2) {
        e.preventDefault();
        rotateGroup(piece);
        return;
    }

    if (piece.isLocked || isComplete) return;

    e.preventDefault();
    setIsDragging(true);
    setActivePieceId(piece.id);
    
    const containerRect = containerRef.current!.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - containerRect.left - piece.currentX,
      y: e.clientY - containerRect.top - piece.currentY
    });

    const groupMembers = pieces.filter(p => p.groupId === piece.groupId);
    const relativeOffsets: Record<number, Point> = {};
    
    groupMembers.forEach(p => {
        relativeOffsets[p.id] = {
            x: p.currentX - piece.currentX,
            y: p.currentY - piece.currentY
        };
    });
    setGroupDragOffsets(relativeOffsets);

    setPieces(prev => prev.map(p => 
        p.groupId === piece.groupId ? { ...p, zIndex: 100 } : { ...p, zIndex: p.isLocked ? 0 : 1 }
    ));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || activePieceId === null || !containerRef.current) return;
    
    e.preventDefault();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const newLeaderX = e.clientX - containerRect.left - dragOffset.x;
    const newLeaderY = e.clientY - containerRect.top - dragOffset.y;
    
    setPieces(prev => prev.map(p => {
      const offset = groupDragOffsets[p.id];
      if (offset) {
        return { 
            ...p, 
            currentX: newLeaderX + offset.x, 
            currentY: newLeaderY + offset.y 
        };
      }
      return p;
    }));
  };

  const handlePointerUp = () => {
    if (!isDragging || activePieceId === null) return;

    const leader = pieces.find(p => p.id === activePieceId);
    
    if (leader) {
      const groupMembers = pieces.filter(p => p.groupId === leader.groupId);
      
      const { width: totalW, height: totalH } = gameSize;
      
      let merged = false;
      
      for (const member of groupMembers) {
        if (merged) break;

        const others = pieces.filter(p => p.groupId !== member.groupId);

        for (const other of others) {
           const isNeighbor = (Math.abs(member.row - other.row) + Math.abs(member.col - other.col)) === 1;
           if (!isNeighbor) continue;

           if (member.rotation % 360 !== other.rotation % 360) continue;
           
           const targetRelX = member.solvedX - other.solvedX;
           const targetRelY = member.solvedY - other.solvedY;
           
           const actualRelX = member.currentX - other.currentX;
           const actualRelY = member.currentY - other.currentY;
           
           const dist = Math.hypot(actualRelX - targetRelX, actualRelY - targetRelY);
           
           if (dist < SNAP_THRESHOLD) {
             const idealMemberX = other.currentX + targetRelX;
             const idealMemberY = other.currentY + targetRelY;
             const shiftX = idealMemberX - member.currentX;
             const shiftY = idealMemberY - member.currentY;
             
             const targetGroupId = other.groupId;
             const isTargetLocked = other.isLocked;

             setPieces(prev => prev.map(p => {
                if (p.groupId === leader.groupId) {
                    return {
                        ...p,
                        currentX: p.currentX + shiftX,
                        currentY: p.currentY + shiftY,
                        groupId: targetGroupId,
                        isLocked: p.isLocked || isTargetLocked,
                        zIndex: isTargetLocked ? 0 : 1
                    };
                }
                return p;
             }));
             
             merged = true;
             break;
           }
        }
      }

      if (!merged) {
          let boardOffsetX = 0;
          let boardOffsetY = 0;
          if (boardRef.current) {
              boardOffsetX = boardRef.current.offsetLeft;
              boardOffsetY = boardRef.current.offsetTop;
          }

          let snapShiftX = 0;
          let snapShiftY = 0;
          let shouldLock = false;

          for (const member of groupMembers) {
              const pad = (member.width - (gameSize.width / config.cols)) / 2;
              
              const targetVisX = member.solvedX + boardOffsetX - pad;
              const targetVisY = member.solvedY + boardOffsetY - pad;
              
              const dist = Math.hypot(member.currentX - targetVisX, member.currentY - targetVisY);
              
              if (dist < SNAP_THRESHOLD && member.rotation % 360 === 0) {
                  snapShiftX = targetVisX - member.currentX;
                  snapShiftY = targetVisY - member.currentY;
                  shouldLock = true;
                  break;
              }
          }

          if (shouldLock) {
              setPieces(prev => prev.map(p => {
                  if (p.groupId === leader.groupId) {
                      return {
                          ...p,
                          currentX: p.currentX + snapShiftX,
                          currentY: p.currentY + snapShiftY,
                          isLocked: true,
                          zIndex: 0,
                          rotation: 0
                      };
                  }
                  return p;
              }));
          }
      }
    }

    setIsDragging(false);
    setActivePieceId(null);
    setGroupDragOffsets({});
  };
  
  useEffect(() => {
    if (pieces.length > 0 && pieces.every(p => p.isLocked)) {
      setIsComplete(true);
    }
  }, [pieces]);

  return (
    <div 
      className="min-h-screen bg-background text-foreground flex flex-col select-none overflow-hidden"
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onContextMenu={(e) => e.preventDefault()}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <header className="bg-card p-4 border-b border-border shadow-md z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <ImageIcon size={20} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              SnapPuzzle
            </h1>
          </div>

          <div className="flex items-center gap-4">
             {image && (
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Progress</span>
                    <span className="font-mono text-primary">
                        {Math.round((pieces.filter(p => p.isLocked).length / Math.max(pieces.length, 1)) * 100)}%
                    </span>
                </div>
             )}
            
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-md transition-colors ${showPreview ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}
              title="Toggle Preview"
              disabled={!image}
            >
              <Maximize size={20} />
            </button>
            <button 
              onClick={() => {
                 setImage(null);
                 setPieces([]);
              }}
              className="p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-md transition-colors"
              title="Reset"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex overflow-hidden relative">
        
        <aside className="w-80 bg-card border-r border-border p-6 flex flex-col gap-8 z-10 shadow-xl overflow-y-auto">
          {!image ? (
            <div className="flex-1 flex flex-col space-y-8">
              <div className="flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border rounded-xl p-8 bg-card/50">
                <div className="bg-secondary p-4 rounded-full">
                  <Upload size={32} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Upload Photo</h3>
                  <p className="text-sm text-muted-foreground mt-1">Choose an image to start</p>
                </div>
                <label className="mt-4 px-6 py-2.5 bg-primary hover:opacity-90 text-primary-foreground font-medium rounded-lg cursor-pointer transition-all shadow-lg active:scale-95">
                  Browse Files
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Or try a sample</span>
                  <div className="h-px bg-border flex-1" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.label}
                      onClick={() => loadSampleImage(sample.url)}
                      className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <img 
                        src={sample.url} 
                        alt={sample.label}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-xs font-medium text-white">{sample.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
                  <div className="h-px bg-border flex-1" />
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-background shadow-inner">
                  <img src={imageUrl!} alt="Preview" className="w-full h-full object-contain opacity-50" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.label}
                      onClick={() => loadSampleImage(sample.url)}
                      className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <img 
                        src={sample.url} 
                        alt={sample.label}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-xs font-medium text-white">{sample.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-background shadow-inner">
                  <img src={imageUrl!} alt="Preview" className="w-full h-full object-contain opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            { label: 'Hard', r: 6, c: 9 }
                        ].map((mode) => (
                            <button
                                key={mode.label}
                                onClick={() => setConfig({ rows: mode.r, cols: mode.c })}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                    config.rows === mode.r 
                                    ? 'bg-primary text-primary-foreground shadow-lg' 
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                            >
                                {mode.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-secondary/50 p-3 rounded-lg border border-border/50 text-xs text-muted-foreground space-y-2">
                        <div className="flex items-center gap-2">
                            <MousePointer2 size={14} className="text-primary"/>
                            <span>Drag to move groups</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <RotateCw size={14} className="text-primary"/>
                            <span><strong>Right-click</strong> to rotate group</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link size={14} className="text-primary"/>
                            <span>Neighbors snap together automatically</span>
                        </div>
                    </div>

                    {pieces.length === 0 && (
                        <button 
                            onClick={generatePuzzle}
                            disabled={loading}
                            className="w-full mt-4 py-3 bg-accent hover:opacity-90 text-accent-foreground font-bold rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : 'Start Puzzle'}
                        </button>
                    )}
                    
                    {pieces.length > 0 && !isComplete && (
                        <button 
                            onClick={generatePuzzle}
                            className="w-full py-2 border border-border text-muted-foreground hover:bg-secondary rounded-lg text-sm transition-colors"
                        >
                            Scramble / Restart
                        </button>
                    )}
                </div>
              </div>
            </>
          )}
        </aside>

        <div 
            ref={containerRef}
            className="flex-1 relative overflow-hidden flex items-center justify-center p-8"
            style={{ 
                cursor: isDragging ? 'grabbing' : 'default',
                backgroundImage: 'radial-gradient(circle at center, oklch(0.20 0.01 240) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                backgroundColor: 'oklch(0.12 0.01 240)'
            }}
        >
          {pieces.length > 0 && (
            <div 
                ref={boardRef}
                className="absolute border-2 border-border/30 bg-card/20 rounded-lg shadow-2xl"
                style={{ width: gameSize.width, height: gameSize.height }}
            >
                {showPreview && imageUrl && (
                    <img 
                        src={imageUrl} 
                        className="w-full h-full opacity-20 object-fill pointer-events-none filter grayscale" 
                        alt="" 
                    />
                )}
            </div>
          )}

          {pieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute select-none touch-none"
              style={{
                transform: `translate3d(${piece.currentX}px, ${piece.currentY}px, 0) rotate(${piece.rotation}deg)`,
                width: piece.width,
                height: piece.height,
                zIndex: piece.zIndex,
                pointerEvents: 'none',
                transition: isDragging && pieces.find(p => p.id === activePieceId)?.groupId === piece.groupId
                    ? 'none'
                    : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                filter: piece.isLocked ? 'none' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
              }}
            >
              <img 
                src={piece.imgData} 
                alt={`Piece ${piece.id}`}
                className="w-full h-full pointer-events-none"
                style={{ 
                    filter: piece.isLocked ? 'brightness(1.0)' : 'brightness(1.1)' 
                }}
              />
              {!piece.isLocked && (
                <div
                  className="absolute"
                  style={{
                    left: piece.pad,
                    top: piece.pad,
                    width: piece.pieceWidth,
                    height: piece.pieceHeight,
                    cursor: 'grab',
                    pointerEvents: 'auto'
                  }}
                  onPointerDown={(e) => handlePointerDown(e, piece)}
                />
              )}
            </div>
          ))}

          {!image && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-muted-foreground/20 text-6xl font-black tracking-tighter opacity-20" style={{ transform: 'rotate(12deg)' }}>SNAP</p>
            </div>
          )}
          
          {isComplete && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-card p-8 rounded-2xl border border-border shadow-2xl text-center max-w-md mx-4">
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Check size={40} className="text-accent-foreground" strokeWidth={3} />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Puzzle Solved!</h2>
                    <p className="text-muted-foreground mb-8">Great job! You've successfully assembled the image.</p>
                    <button 
                        onClick={() => setIsComplete(false)}
                        className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-lg transition-colors"
                    >
                        Close
                    </button>
                    <button 
                        onClick={() => {
                            setPieces([]);
                            setIsComplete(false);
                        }}
                        className="ml-4 px-6 py-3 bg-primary hover:opacity-90 text-primary-foreground font-semibold rounded-lg transition-colors shadow-lg"
                    >
                        New Puzzle
                    </button>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
