import React, { useState, useEffect, useRef } from 'react';
import { SeatMap2D } from '../seats/SeatMap2D';
import { SeatLegend } from '../seats/SeatLegend';
import { SeatTooltip } from '../seats/SeatTooltip';
import { CategoryFilter } from '../seats/CategoryFilter';
import { SelectionSummary } from '../seats/SelectionSummary';
import { useSeatSelection } from '../../hooks/useSeatSelection';
import { getVenueLayout, generateArenaLayout } from '../../services/seatService';
import { VenueLayout, Seat } from '../../types/seat';
import { Loader2 } from 'lucide-react';

interface VenueViewerProps {
  venueId: string;
  eventId: string;
  onReservationComplete: (holdId: string) => void;
}

export const VenueViewer: React.FC<VenueViewerProps> = ({ venueId, eventId, onReservationComplete }) => {
  const sessionId = useRef(`session_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`).current;
  
  const [layout, setLayout] = useState<VenueLayout | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  
  const {
    allSeats,
    selectedSeats,
    selectedSeatIds,
    toggleSeat,
    clearSelection,
    reserveSelection,
    isHolding,
    isLoading: seatsLoading,
    error,
    totalAmount,
    timeRemaining
  } = useSeatSelection({ venueId, eventId, sessionId, maxSeats: 10 });

  useEffect(() => {
    // Fetch layout definition
    const fetchLayout = async () => {
      try {
        const data = await getVenueLayout(venueId);
        if (data) {
          setLayout(data);
          // By default, activate all categories
          setActiveCategories(new Set(data.categories.map(c => c.id)));
        } else {
          // Fallback to local generated layout if venue not found in DB
          console.warn('Venue not found in DB, using fallback layout');
          const fallbackSeats = generateArenaLayout();
          setLayout({
            id: venueId,
            venueId,
            name: 'Arena Virtuelle',
            width: 1200,
            height: 900,
            stage: { x: 500, y: 40, width: 200, height: 60, label: 'SCÈNE' },
            sections: [],
            seats: fallbackSeats as unknown as Seat[],
            categories: [
              { id: 'cat-vip', venueId, name: 'VIP', color: '#f59e0b', basePrice: 299, perks: [] },
              { id: 'cat-premium', venueId, name: 'Premium', color: '#10b981', basePrice: 149, perks: [] },
              { id: 'cat-std', venueId, name: 'Standard', color: '#3b82f6', basePrice: 79, perks: [] }
            ]
          });
          setActiveCategories(new Set(['cat-vip', 'cat-premium', 'cat-std']));
        }
      } catch (err) {
        console.error('Erreur chargement layout', err);
      }
    };
    
    fetchLayout();
  }, [venueId]);

  const handleToggleCategory = (catId: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        if (next.size > 1) next.delete(catId); // Prevent deselecting all
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const handleSeatHover = (seatId: string, event: React.PointerEvent) => {
    const seat = allSeats.find(s => s.id === seatId);
    if (seat) {
      setHoveredSeat(seat);
      setTooltipPos({ x: event.clientX, y: event.clientY });
    }
  };

  const handleReservation = async () => {
    const hold = await reserveSelection();
    if (hold) {
      onReservationComplete(hold.id);
    }
  };

  if (!layout) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] glass-card rounded-xl">
        <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white">Chargement du plan de salle...</h2>
      </div>
    );
  }

  // Filter seats based on active categories for display
  const visibleSeats = allSeats.filter(seat => activeCategories.has(seat.categoryId));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Colonne gauche : Plan de salle */}
      <div className="lg:col-span-2 flex flex-col">
        <CategoryFilter 
          categories={layout.categories}
          activeCategories={activeCategories}
          onToggleCategory={handleToggleCategory}
        />
        
        <div 
          className="relative"
          onPointerMove={(e) => {
            // Keep tooltip tracking mouse roughly over map
            if (hoveredSeat) {
               // Update pos? Typically we might let CSS or SVG handle hover, 
               // but for absolute precision we rely on pointerMove
            }
          }}
        >
          <SeatMap2D 
            layout={layout}
            seats={visibleSeats.length > 0 ? visibleSeats : (layout.seats as Seat[])}
            selectedSeatIds={selectedSeatIds}
            onSeatClick={toggleSeat}
            isLoading={seatsLoading}
          />

          <SeatTooltip 
            seat={hoveredSeat} 
            category={layout.categories.find(c => c.id === hoveredSeat?.categoryId)}
            x={tooltipPos.x} 
            y={tooltipPos.y} 
          />
        </div>
        
        <SeatLegend categories={layout.categories} />
      </div>

      {/* Colonne droite : Panier & Récapitulatif */}
      <div className="lg:col-span-1 h-[600px]">
        <SelectionSummary 
          selectedSeats={selectedSeats}
          categories={layout.categories}
          totalAmount={totalAmount}
          isHolding={isHolding}
          timeRemaining={timeRemaining}
          error={error}
          onClear={clearSelection}
          onReserve={handleReservation}
        />
      </div>

    </div>
  );
};
