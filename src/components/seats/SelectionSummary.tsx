import React from 'react';
import { Seat, SeatCategory } from '../../types/seat';
import { ShoppingCart, Trash2, CreditCard, Clock, AlertTriangle } from 'lucide-react';

interface SelectionSummaryProps {
  selectedSeats: Seat[];
  categories: SeatCategory[];
  totalAmount: number;
  isHolding: boolean;
  timeRemaining?: number;
  onClear: () => void;
  onReserve: () => void;
  error?: string | null;
}

export const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  selectedSeats,
  categories,
  totalAmount,
  isHolding,
  timeRemaining,
  onClear,
  onReserve,
  error
}) => {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (selectedSeats.length === 0) {
    return (
      <div className="glass-card p-6 rounded-xl text-center flex flex-col items-center justify-center min-h-[300px] border border-white/10">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <ShoppingCart className="text-gray-400" size={24} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Aucun siège sélectionné</h3>
        <p className="text-gray-400 max-w-xs">
          Cliquez sur les sièges disponibles sur le plan pour commencer votre sélection.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl border border-white/10 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="text-fuchsia-400" />
          Votre Sélection
        </h3>
        <span className="bg-fuchsia-500/20 text-fuchsia-300 px-3 py-1 rounded-full text-sm font-medium">
          {selectedSeats.length} siège{selectedSeats.length > 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {timeRemaining !== undefined && timeRemaining > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-amber-400" size={18} />
            <span className="text-amber-200 text-sm">Temps restant</span>
          </div>
          <span className="text-amber-400 font-mono font-bold text-lg">
            {formatTime(timeRemaining)}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 mb-6">
        {selectedSeats.map(seat => {
          const category = categories.find(c => c.id === seat.categoryId);
          const price = (category?.basePrice || 0) + (seat.pricing?.fees || 0);

          return (
            <div key={seat.id} className="bg-white/5 rounded-lg p-3 flex justify-between items-center border border-white/5">
              <div>
                <div className="text-white font-bold text-lg leading-tight">
                  {seat.row}{seat.number}
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: category?.color || '#fff' }}
                  />
                  {category?.name || 'Standard'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-fuchsia-400 font-bold">{price.toFixed(2)}€</div>
                {seat.pricing?.fees ? (
                  <div className="text-xs text-gray-500">incl. frais</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-center mb-6 pt-4 border-t border-white/10">
          <span className="text-gray-300">Total à payer</span>
          <span className="text-3xl font-bold text-white">{totalAmount.toFixed(2)}€</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onClear}
            className="flex items-center justify-center gap-2 py-3 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
          >
            <Trash2 size={18} />
            Vider
          </button>
          
          <button 
            onClick={onReserve}
            disabled={isHolding}
            className="bizos-cta-pink rounded-lg py-3 flex items-center justify-center gap-2 font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isHolding ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard size={18} />
                Réserver
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
