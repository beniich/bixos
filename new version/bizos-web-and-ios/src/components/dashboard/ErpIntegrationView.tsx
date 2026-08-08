import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle2, Zap } from 'lucide-react';

interface ErpIntegrationViewProps {
  isDarkMode: boolean;
}

export const ErpIntegrationView: React.FC<ErpIntegrationViewProps> = ({ isDarkMode }) => {
  const [connectors, setConnectors] = useState([
    { id: 'ERP-SAP', name: 'SAP S/4HANA Enterprise', status: 'CONNECTED', lastSync: '12 min', records: '14,200 synced' },
    { id: 'ERP-DYN', name: 'Microsoft Dynamics 365 Finance', status: 'CONNECTED', lastSync: '1h', records: '8,450 synced' },
    { id: 'ERP-ORA', name: 'Oracle Fusion Cloud ERP', status: 'STANDBY', lastSync: 'Hier', records: '2,100 synced' },
  ]);

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">CONNECTEURS DE SYNCHRONISATION ERP</h2>
          <p className={`text-xs ${subText}`}>Intégration bidirectionnelle des commandes d'achat, coûts et inventaires SAP/Dynamics/Oracle</p>
        </div>
        <button
          onClick={() => alert("Synchronisation complète ERP déclenchée. Flux JSON validés.")}
          className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          <span>SYNCHRONISER ERP MAINTENANT</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {connectors.map((c) => (
          <div key={c.id} className={`${cardBg} p-5 rounded-2xl border space-y-3 hover:border-orange-500/50 transition-all`}>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 font-mono text-[10px] font-bold">
                {c.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {c.status}
              </span>
            </div>

            <h4 className="text-sm font-black">{c.name}</h4>
            <div className={`text-xs ${subText}`}>{c.records}</div>

            <div className="pt-2 border-t border-slate-500/20 text-[10px] font-bold text-orange-400">
              Dernière synchro: {c.lastSync}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
