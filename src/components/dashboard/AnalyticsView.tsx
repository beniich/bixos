import React from 'react';
import { BarChart3, Download, TrendingUp, Zap, ShieldCheck, DollarSign } from 'lucide-react';

interface AnalyticsViewProps {
  isDarkMode: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ isDarkMode }) => {
  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">ANALYTIQUE & PERFORMANCE ÉNERGÉTIQUE</h2>
          <p className={`text-xs ${subText}`}>Rapports de consommation, empreinte carbone et projections budgétaires</p>
        </div>
        <button
          onClick={() => alert("Rapport analytique complet CSV / PDF téléchargé.")}
          className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>EXPORTER RAPPORT</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} p-5 rounded-2xl border space-y-2`}>
          <div className="flex justify-between items-center text-xs font-bold text-orange-400">
            <span>CONSOMMATION KWH (MOIS)</span>
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black">124,500 kWh</div>
          <div className="text-[10px] text-emerald-400 font-bold">-8.4% vs mois dernier</div>
        </div>

        <div className={`${cardBg} p-5 rounded-2xl border space-y-2`}>
          <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
            <span>EMPREINTE CARBONE CO2</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black">14.2 T. CO2</div>
          <div className="text-[10px] text-emerald-400 font-bold">Conforme ISO 50001</div>
        </div>

        <div className={`${cardBg} p-5 rounded-2xl border space-y-2`}>
          <div className="flex justify-between items-center text-xs font-bold text-cyan-400">
            <span>ROI OPEX MAINTENANCE</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black">+3.2x</div>
          <div className="text-[10px] text-cyan-400 font-bold">Économies prédictives IA</div>
        </div>
      </div>

      {/* Analytics Chart Simulation */}
      <div className={`${cardBg} p-6 rounded-2xl border space-y-4`}>
        <h3 className="text-xs font-black uppercase tracking-wider">COURBE DE CHARGE ÉLECTRIQUE MENSUELLE (KW)</h3>
        <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-dashed border-slate-500/30 pb-2">
          {[45, 62, 78, 90, 82, 95, 110, 88, 72, 60, 52, 68].map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full bg-gradient-to-t from-orange-600 to-amber-400 rounded-t-sm" style={{ height: `${val}%` }} />
              <span className={`text-[9px] font-mono ${subText}`}>M{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
