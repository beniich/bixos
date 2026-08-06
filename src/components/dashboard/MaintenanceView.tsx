import React, { useState } from 'react';
import { Wrench, Calendar, CheckCircle2, Clock, AlertTriangle, Play } from 'lucide-react';

interface MaintenanceViewProps {
  isDarkMode: boolean;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ isDarkMode }) => {
  const [plans, setPlans] = useState([
    { id: 'PM-01', title: 'Test Trimestriel Démarrage Groupe Électrogène', asset: 'PWR-SUB-01', freq: 'Trimestriel', nextDate: '2026-08-05', status: 'DUE_SOON' },
    { id: 'PM-02', title: 'Inspection Thermographique Armoires TGBT', asset: 'PWR-SUB-01', freq: 'Semestriel', nextDate: '2026-08-12', status: 'SCHEDULED' },
    { id: 'PM-03', title: 'Vidange & Lubrification Pompes RIA Incendie', asset: 'FIRE-PUMP-01', freq: 'Mensuel', nextDate: '2026-08-18', status: 'SCHEDULED' },
    { id: 'PM-04', title: 'Remplacement Filtres Hephaistose CTA Est', asset: 'HVAC-EAST-02', freq: 'Trimestriel', nextDate: '2026-08-25', status: 'SCHEDULED' },
  ]);

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">PLAN DE MAINTENANCE PRÉVENTIVE (PMP)</h2>
          <p className={`text-xs ${subText}`}>Calendrier automatisé des opérations réglementaires et préventives</p>
        </div>
        <button
          onClick={() => {
            alert("Planning PMP synchronisé avec le calendrier de l'équipe technique.");
          }}
          className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-bold shadow-md cursor-pointer"
        >
          LANCER CYCLE PRÉVENTIF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <div key={p.id} className={`${cardBg} p-5 rounded-2xl border space-y-3 hover:border-orange-500/50 transition-all`}>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 font-mono text-[10px] font-bold">
                {p.id} • {p.freq}
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                p.status === 'DUE_SOON' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {p.status}
              </span>
            </div>

            <h4 className="text-sm font-black">{p.title}</h4>
            <div className={`text-xs ${subText}`}>Équipement cible: <strong className="text-slate-200">{p.asset}</strong></div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-500/20 text-xs">
              <span className="text-orange-400 font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Échéance: {p.nextDate}
              </span>
              <button
                onClick={() => alert(`Ordre de travail généré immédiatement pour ${p.title}`)}
                className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold hover:bg-orange-500 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                <span>DÉCLENCHER</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
