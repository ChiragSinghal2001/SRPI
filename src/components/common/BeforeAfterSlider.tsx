import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Columns,
  SplitSquareVertical,
  Move,
  Maximize2,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: string; // e.g., 'aspect-video' | 'aspect-4/3'
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Move-in Baseline',
  afterLabel = 'Move-out Inspection',
  aspectRatio = 'aspect-[16/10]',
  className,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle slider drag (mouse + touch)
  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDownSlider = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStartSlider = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      } else if (isPanning && zoomLevel > 1) {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        setPanOffset((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        panStartRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    const onStop = () => {
      setIsDragging(false);
      setIsPanning(false);
    };

    if (isDragging || isPanning) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onStop);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onStop);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onStop);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onStop);
    };
  }, [isDragging, isPanning, handleMove, zoomLevel]);

  // Zoom controls
  const zoomIn = () => setZoomLevel((z) => Math.min(3, +(z + 0.35).toFixed(2)));
  const zoomOut = () =>
    setZoomLevel((z) => {
      const next = Math.max(1, +(z - 0.35).toFixed(2));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSliderPosition(50);
  };

  const handlePanStart = (e: React.MouseEvent) => {
    if (zoomLevel > 1 && !isDragging) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  return (
    <div className={cn('flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm', className)}>
      {/* Top Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 gap-2 text-xs select-none">
        {/* Mode Toggle */}
        <div className="inline-flex items-center rounded-lg bg-slate-200/80 dark:bg-slate-700 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all',
              viewMode === 'slider'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            )}
            title="Draggable split slider"
          >
            <SplitSquareVertical size={14} />
            <span>Split Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all',
              viewMode === 'side-by-side'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            )}
            title="Side-by-side dual view"
          >
            <Columns size={14} />
            <span>Side-by-Side</span>
          </button>
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoomLevel <= 1}
            aria-label="Zoom out"
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
          >
            <ZoomOut size={16} />
          </button>
          <span className="w-12 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoomLevel >= 3}
            aria-label="Zoom in"
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={resetView}
            aria-label="Reset view"
            title="Reset Zoom & Pan"
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 ml-1"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      {viewMode === 'slider' ? (
        <div
          ref={containerRef}
          onMouseDown={handlePanStart}
          className={cn(
            'relative overflow-hidden w-full select-none bg-slate-950',
            aspectRatio,
            zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-ew-resize'
          )}
        >
          {/* Zoom & Pan container */}
          <div
            className="w-full h-full relative origin-center transition-transform duration-75"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
            }}
          >
            {/* Background Image: After (Move-out) */}
            <img
              src={afterImage}
              alt={afterLabel}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* Foreground Image: Before (Move-in) clipped with clip-path */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
              }}
            >
              <img
                src={beforeImage}
                alt={beforeLabel}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>

          {/* Draggable Divider Line */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-auto cursor-ew-resize"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDownSlider}
            onTouchStart={handleTouchStartSlider}
          >
            {/* Vertical White Line with shadow */}
            <div className="w-0.5 h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)]" />

            {/* Handle Thumb Button */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-brand-accent shadow-lg flex items-center justify-center text-brand-accent"
              role="slider"
              aria-valuenow={sliderPosition}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Image comparison slider"
            >
              <Move size={14} className="rotate-90 sm:rotate-0" />
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wide uppercase border border-white/20">
              {beforeLabel}
            </span>
          </div>
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded bg-blue-600/80 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wide uppercase border border-white/20">
              {afterLabel}
            </span>
          </div>

          {zoomLevel > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-slate-200 text-xs flex items-center gap-1.5 shadow-md">
                <Maximize2 size={12} /> Drag to Pan
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Side-by-Side Dual View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-slate-950">
          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="px-2 py-0.5 rounded bg-black/70 text-white text-xs font-semibold">
                {beforeLabel}
              </span>
            </div>
            <img
              src={beforeImage}
              alt={beforeLabel}
              className={cn('w-full object-cover', aspectRatio)}
            />
          </div>

          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="px-2 py-0.5 rounded bg-blue-600/80 text-white text-xs font-semibold">
                {afterLabel}
              </span>
            </div>
            <img
              src={afterImage}
              alt={afterLabel}
              className={cn('w-full object-cover', aspectRatio)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BeforeAfterSlider;
