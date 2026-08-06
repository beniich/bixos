import React, { useState } from 'react';
import { CreditCard, Download, CheckCircle2, DollarSign } from 'lucide-react';

interface BillingViewProps {
  isDarkMode: boolean;
}

export const BillingView: React.FC<BillingViewProps> = ({ isDarkMode }) => {
  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">FACTURATION & PAIEMENTS STRIPE</h2>
          <p className={`text-xs ${subText}`}>Abonnement Enterprise, jetons de crédits IA et historique des factures</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${cardBg} p-6 rounded-2xl border space-y-3`}>
          <div className="text-xs font-bold text-orange-400">PLAN ACTIF</div>
          <div className="text-2xl font-black">ENTERPRISE HQ</div>
          <p className={`text-xs ${subText}`}>Accès illimité aux 77 routes CAFM, Socket.io et jumeau numérique 3D.</p>
          <div className="pt-2 text-xs font-bold text-emerald-400">Renouvellement: 01 Sep 2026</div>
        </div>

        <div className={`${cardBg} p-6 rounded-2xl border space-y-3 md:col-span-2`}>
          <h3 className="text-xs font-black uppercase text-orange-500">HISTORIQUE DES FACTURES STRIPE</h3>
          <div className="space-y-2 text-xs font-mono">
            {[
              { id: 'INV-2026-008', date: '01 Août 2026', amount: '2,490.00 €', status: 'PAYÉ' },
              { id: 'INV-2026-007', date: '01 Juillet 2026', amount: '2,490.00 €', status: 'PAYÉ' },
            ].map((inv) => (
              <div key={inv.id} className="p-3 rounded-xl bg-black/20 border border-slate-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold">{inv.id} • {inv.date}</div>
                  <div className="text-emerald-400 text-[10px]">{inv.status}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-orange-400">{inv.amount}</span>
                  <button onClick={() => alert(`Téléchargement facture ${inv.id}`)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
