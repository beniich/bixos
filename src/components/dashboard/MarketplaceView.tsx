import React from 'react';
import { ShoppingBag, ShoppingCart, Store, CheckCircle2 } from 'lucide-react';

interface MarketplaceViewProps {
  isDarkMode: boolean;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ isDarkMode }) => {
  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const items = [
    { id: 'MK-1', name: 'Daikin VRV V Filtres antibactériens Set', vendor: 'Daikin Applied', price: '240 €', rating: '4.9 ★' },
    { id: 'MK-2', name: 'Schneider Electric Smart Meter Module', vendor: 'Schneider Electric', price: '890 €', rating: '5.0 ★' },
    { id: 'MK-3', name: 'Otis Gen2 Huile synthétique de guidage', vendor: 'Otis Elevator', price: '120 €', rating: '4.8 ★' },
    { id: 'MK-4', name: 'Grundfos Capteur pression différentielle', vendor: 'Grundfos', price: '340 €', rating: '4.9 ★' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">MARKETPLACE FOURNISSEURS CERTIFIÉS CAFM</h2>
          <p className={`text-xs ${subText}`}>Commande directe de composants, pièces détachées et interventions partenaires</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <div key={it.id} className={`${cardBg} p-5 rounded-2xl border space-y-3 hover:border-orange-500/50 transition-all`}>
            <span className="text-[10px] font-bold text-amber-400">{it.rating}</span>
            <h4 className="text-sm font-black">{it.name}</h4>
            <div className={`text-xs ${subText}`}>Fournisseur: {it.vendor}</div>
            <div className="pt-2 border-t border-slate-500/20 flex items-center justify-between text-xs">
              <span className="text-orange-400 font-bold">{it.price}</span>
              <button
                onClick={() => alert(`Article ${it.name} ajouté au panier d'achat CAFM.`)}
                className="px-3 py-1.5 rounded-lg btn-gradient-orange text-white text-[10px] font-bold cursor-pointer"
              >
                COMMANDER
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
