import React from 'react';
import { SeatCategory } from '../../types/seat';

interface SeatLegendProps {
  categories: SeatCategory[];
}

export const SeatLegend: React.FC<SeatLegendProps> = ({ categories }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 glass-card rounded-lg mt-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-gray-500 opacity-50"></div>
        <span className="text-gray-400">Vendu / Indisponible</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
        <span className="text-gray-300">En cours de résa</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-fuchsia-500/30 border-2 border-white flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></div>
        </div>
        <span className="text-white font-medium">Sélectionné</span>
      </div>

      <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block"></div>

      {categories.map(cat => (
        <div key={cat.id} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" 
            style={{ backgroundColor: cat.color }}
          ></div>
          <span className="text-gray-200">{cat.name} ({cat.basePrice.toFixed(2)}€)</span>
        </div>
      ))}
    </div>
  );
};
