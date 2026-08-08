import React from 'react';
import { Store, ShieldCheck, Clock, Users } from 'lucide-react';

interface VendorViewProps {
  isDarkMode: boolean;
}

export const VendorView: React.FC<VendorViewProps> = ({ isDarkMode }) => {
  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black uppercase text-orange-500">PORTAIL VENDOR PARTNER (STRIPE CONNECT)</h2>
        <p className={`text-xs ${subText}`}>Espace réservé aux prestataires de maintenance et techniciens extérieurs dispatchés</p>
      </div>

      <div className={`${cardBg} p-6 rounded-2xl border space-y-4`}>
        <h3 className="text-xs font-black uppercase text-orange-500">ENGAGEMENTS SLA & INTERVENTIONS REÇUES</h3>
        <div className="space-y-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-black/20 border border-slate-500/20 flex justify-between items-center">
            <div>
              <div className="font-bold text-slate-200">Daikin Applied France - Contrat CVC 2026</div>
              <div className={subText}>SLA Réponse: &lt; 2h | Taux Réussite: 99.4%</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">CERTIFIÉ</span>
          </div>
          <div className="p-3 rounded-xl bg-black/20 border border-slate-500/20 flex justify-between items-center">
            <div>
              <div className="font-bold text-slate-200">Otis Elevator Maintenance SAS</div>
              <div className={subText}>SLA Réponse: &lt; 1h | Taux Réussite: 98.8%</div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">CERTIFIÉ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
