import React, { useState } from 'react';
import { Cpu, Plus, AlertTriangle, CheckCircle2, Box, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface CmmsViewProps {
  isDarkMode: boolean;
}

export const CmmsView: React.FC<CmmsViewProps> = ({ isDarkMode }) => {
  const [parts, setParts] = useState([
    { id: 'PRT-101', name: 'Filtre HEPA Haute Capacité H13', category: 'HVAC', stock: 18, minStock: 5, unitPrice: '45.00 €', supplier: 'Daikin' },
    { id: 'PRT-102', name: 'Courroie de Transmission CTA', category: 'HVAC', stock: 3, minStock: 5, unitPrice: '28.50 €', supplier: 'Optibelt' },
    { id: 'PRT-103', name: 'Disjoncteur TGBT 250A 4P', category: 'ÉLECTRICITÉ', stock: 8, minStock: 2, unitPrice: '380.00 €', supplier: 'Schneider' },
    { id: 'PRT-104', name: 'Sonde de Pression Électronique RIA', category: 'INCENDIE', stock: 12, minStock: 4, unitPrice: '110.00 €', supplier: 'Grundfos' },
  ]);

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">CMMS / GMAO — GESTION DU STOCK DE PIÈCES DÉTACHÉES</h2>
          <p className={`text-xs ${subText}`}>Inventaire des composants, seuils de réapprovisionnement et commandes</p>
        </div>
        <button
          onClick={() => {
            const newId = `PRT-${Math.floor(Math.random() * 899 + 100)}`;
            setParts([
              ...parts,
              { id: newId, name: 'Joint d\'Étanchéité Vanne Chiller', category: 'HVAC', stock: 10, minStock: 3, unitPrice: '15.00 €', supplier: 'Daikin' }
            ]);
          }}
          className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>AJOUTER PIÈCE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {parts.map((p) => {
          const isLow = p.stock <= p.minStock;
          return (
            <div key={p.id} className={`${cardBg} p-5 rounded-2xl border space-y-3 hover:border-orange-500/50 transition-all`}>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 font-mono text-[10px] font-bold">
                  {p.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  isLow ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {isLow ? 'RÉAPPRO' : 'EN STOCK'}
                </span>
              </div>

              <h4 className="text-sm font-black">{p.name}</h4>
              <div className={`text-xs ${subText}`}>Fournisseur: {p.supplier}</div>

              <div className="pt-2 border-t border-slate-500/20 flex items-center justify-between text-xs">
                <div>
                  <span className={`block text-[9px] ${subText}`}>QUANTITÉ</span>
                  <span className={`font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>{p.stock} pcs</span>
                </div>
                <div>
                  <span className={`block text-[9px] ${subText}`}>P.U.</span>
                  <span className="font-bold">{p.unitPrice}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
