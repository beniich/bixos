import React, { useRef, useState, useEffect } from 'react';
import { Seat, VenueLayout } from '../../types/seat';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface SeatMap2DProps {
  layout: VenueLayout;
  seats: Seat[];
  selectedSeatIds: Set<string>;
  onSeatClick: (seatId: string) => void;
  isLoading?: boolean;
}

export const SeatMap2D: React.FC<SeatMap2DProps> = ({
  layout,
  seats,
  selectedSeatIds,
  onSeatClick,
  isLoading
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Center map on load
  useEffect(() => {
    if (containerRef.current && layout.width) {
      const { clientWidth, clientHeight } = containerRef.current;
      const scaleX = clientWidth / layout.width;
      const scaleY = clientHeight / layout.height;
      const initialScale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave margin
      setScale(initialScale);
      
      const dx = (clientWidth - layout.width * initialScale) / 2;
      const dy = (clientHeight - layout.height * initialScale) / 2;
      setPan({ x: dx, y: dy });
    }
  }, [layout]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newScale = Math.max(0.1, Math.min(scale * (1 + delta), 5));
    
    // Zoom towards mouse pointer
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const nextPanX = mouseX - (mouseX - pan.x) * (newScale / scale);
      const nextPanY = mouseY - (mouseY - pan.y) * (newScale / scale);
      
      setScale(newScale);
      setPan({ x: nextPanX, y: nextPanY });
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only pan on middle click, right click, or touch/drag on background (handled by stopping propagation on seats)
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeatIds.has(seat.id)) return '#d946ef'; // Fuchsia / Pink glowing
    if (seat.status === 'AVAILABLE') {
      const cat = layout.categories.find(c => c.id === seat.categoryId);
      return cat?.color || '#3b82f6';
    }
    if (seat.status === 'RESERVED') return '#f59e0b';
    if (seat.status === 'BOOKED') return '#4b5563';
    if (seat.status === 'BLOCKED') return '#ef4444';
    return '#3b82f6';
  };

  const resetView = () => {
    if (containerRef.current && layout.width) {
      const { clientWidth, clientHeight } = containerRef.current;
      const scaleX = clientWidth / layout.width;
      const scaleY = clientHeight / layout.height;
      const initialScale = Math.min(scaleX, scaleY) * 0.9;
      setScale(initialScale);
      setPan({
        x: (clientWidth - layout.width * initialScale) / 2,
        y: (clientHeight - layout.height * initialScale) / 2
      });
    }
  };

  return (
    <div className="relative w-full h-[600px] glass-card overflow-hidden rounded-xl border border-white/10 select-none">
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button onClick={() => setScale(s => Math.min(s * 1.2, 5))} className="p-2 glass-card rounded hover:bg-white/10 transition-colors">
          <ZoomIn size={20} className="text-white" />
        </button>
        <button onClick={() => setScale(s => Math.max(s / 1.2, 0.1))} className="p-2 glass-card rounded hover:bg-white/10 transition-colors">
          <ZoomOut size={20} className="text-white" />
        </button>
        <button onClick={resetView} className="p-2 glass-card rounded hover:bg-white/10 transition-colors">
          <Maximize size={20} className="text-white" />
        </button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div 
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: layout.width,
            height: layout.height,
            willChange: 'transform'
          }}
        >
          <svg width={layout.width} height={layout.height} className="pointer-events-none">
            
            {/* Stage / Scène */}
            {layout.stage && (
              <g className="opacity-80">
                <rect 
                  x={layout.stage.x} 
                  y={layout.stage.y} 
                  width={layout.stage.width} 
                  height={layout.stage.height}
                  rx="8"
                  fill="rgba(255, 255, 255, 0.05)"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="2"
                />
                <text 
                  x={layout.stage.x + layout.stage.width / 2} 
                  y={layout.stage.y + layout.stage.height / 2}
                  fill="rgba(255,255,255,0.5)"
                  fontSize="24"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="tracking-[0.5em]"
                >
                  {layout.stage.label || 'SCÈNE'}
                </text>
              </g>
            )}

            {/* Sections (Background indicators) */}
            {layout.sections.map(section => (
              <g key={section.id} className="opacity-10 pointer-events-none">
                {section.shape === 'RECTANGLE' && (
                  <rect
                    x={section.coordinates.x}
                    y={section.coordinates.y}
                    width={section.coordinates.width}
                    height={section.coordinates.height}
                    fill={section.color}
                    rx="16"
                  />
                )}
                {/* Text Label for section */}
                <text
                  x={section.coordinates.x + section.coordinates.width / 2}
                  y={section.coordinates.y + section.coordinates.height / 2}
                  fill={section.color}
                  fontSize="48"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  opacity="0.5"
                >
                  {section.name}
                </text>
              </g>
            ))}

            {/* Seats */}
            {seats.map(seat => {
              const isSelected = selectedSeatIds.has(seat.id);
              const isAvailable = seat.status === 'AVAILABLE';
              const color = getSeatColor(seat);
              
              return (
                <g 
                  key={seat.id} 
                  transform={`translate(${seat.x}, ${seat.y})`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent drag interference if possible
                    onSeatClick(seat.id);
                  }}
                  onPointerDown={(e) => e.stopPropagation()} // Prevent pan start when clicking seat
                  className={`pointer-events-auto transition-all duration-200 ${isAvailable ? 'cursor-pointer hover:scale-125' : 'cursor-not-allowed opacity-40'}`}
                >
                  {/* Outer Glow for selected */}
                  {isSelected && (
                    <circle r="12" fill={color} opacity="0.3" className="animate-pulse" />
                  )}
                  <circle 
                    r="8" 
                    fill={isAvailable || isSelected ? color : '#374151'} 
                    stroke={isSelected ? '#ffffff' : (isAvailable ? 'rgba(255,255,255,0.2)' : 'transparent')}
                    strokeWidth={isSelected ? "2" : "1"}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
