import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CompareSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

const CompareSlider: React.FC<CompareSliderProps> = ({ beforeImage, afterImage, className }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const position = Math.max(0, Math.min(100, (x / width) * 100));
    
    setSliderPosition(position);
  }, [isResizing]);

  const handleTouchMove = useCallback((e: TouchEvent | React.TouchEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const touch = (e as any).touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;
    const position = Math.max(0, Math.min(100, (x / width) * 100));
    
    setSliderPosition(position);
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove as any);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove as any);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none rounded-xl border border-slate-700 shadow-2xl ${className}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background) */}
      <img 
        src={afterImage} 
        alt="Processed" 
        className="block w-full h-auto object-contain" 
        draggable={false}
      />
      
      {/* Before Image (Overlay clipped) */}
      <div 
        className="absolute top-0 left-0 h-full w-full"
        style={{ 
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` 
        }}
      >
        <img 
          src={beforeImage} 
          alt="Original" 
          className="block w-full h-full object-contain" 
          draggable={false}
        />
        <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 text-xs rounded font-medium backdrop-blur-sm">
          Original
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-emerald-500/80 text-white px-2 py-1 text-xs rounded font-medium backdrop-blur-sm">
        Processed
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
            <path d="m15 18-6-6 6-6" transform="rotate(180 12 12)"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CompareSlider;