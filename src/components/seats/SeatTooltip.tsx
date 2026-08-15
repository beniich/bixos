import React from 'react';
import { Seat, SeatCategory } from '../../types/seat';

interface SeatTooltipProps {
  seat: Seat | null;
  category: SeatCategory | undefined;
  x: number;
  y: number;
}

export const SeatTooltip: React.FC<SeatTooltipProps> = ({ seat, category, x, y }) => {
  if (!seat) return null;

  const isAvailable = seat.status === 'AVAILABLE';
  const price = (category?.basePrice || 0) + (seat.pricing?.fees || 0);

  return (
    <div 
      className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-4"
      style={{ left: x, top: y }}
    >
      <div className="glass-card-purple p-3 rounded-lg shadow-xl min-w-[150px] border border-white/10 relative">
        {/* Triangle pointer */}
        <div className="absolute left-1/2 bottom-0 w-3 h-3 bg-[#1a0b3c] border-b border-r border-white/10 transform -translate-x-1/2 translate-y-1/2 rotate-45"></div>
        
        <div className="flex justify-between items-start mb-2">
          <div className="font-bold text-white text-lg">
            {seat.row}{seat.number}
          </div>
          {isAvailable && (
            <div className="text-fuchsia-400 font-bold">
              {price.toFixed(2)}€
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-300">
          {category?.name || 'Standard'}
        </div>
        
        <div className="mt-2 text-xs">
          {isAvailable ? (
            <span className="text-green-400 font-medium flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> Disponible
            </span>
          ) : (
            <span className="text-red-400 font-medium flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Indisponible
            </span>
          )}
        </div>
        
        {seat.accessible && (
          <div className="mt-1 text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded inline-block">
            ♿ Accès PMR
          </div>
        )}
      </div>
    </div>
  );
};
