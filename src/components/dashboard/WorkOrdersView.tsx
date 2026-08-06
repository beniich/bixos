import React, { useState } from 'react';
import { ClipboardList, Plus, Filter, CheckCircle2, AlertTriangle, Clock, User, Wrench } from 'lucide-react';

interface WorkOrdersViewProps {
  isDarkMode: boolean;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({ isDarkMode }) => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [workOrders, setWorkOrders] = useState([
    { id: 'WO-8821', title: 'Remplacement Filtres CTA Nord', asset: 'HVAC-NORTH-01', tech: 'Tarik B. (Superadmin)', status: 'IN_PROGRESS', priority: 'HIGH', date: '2026-08-03' },
    { id: 'WO-8822', title: 'Inspection Pression Pompes Incendie', asset: 'FIRE-PUMP-01', tech: 'Karim V. (Tech #04)', status: 'PENDING', priority: 'CRITICAL', date: '2026-08-03' },
    { id: 'WO-8823', title: 'Audit Harmoniques TGBT', asset: 'PWR-SUB-01', tech: 'Sophie L. (Tech #02)', status: 'COMPLETED', priority: 'MEDIUM', date: '2026-08-02' },
    { id: 'WO-8824', title: 'Lubrification Cabine Ascenseur', asset: 'ELEV-WEST-02', tech: 'Otis Tech Dispatch', status: 'IN_PROGRESS', priority: 'HIGH', date: '2026-08-01' },
    { id: 'WO-8825', title: 'Détartrage Échangeur Chiller', asset: 'HVAC-NORTH-01', tech: 'Daikin Field Agent', status: 'PENDING', priority: 'MEDIUM', date: '2026-07-31' },
  ]);

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const filteredWO = workOrders.filter(w => filterStatus === 'ALL' || w.status === filterStatus);

  const handleStatusToggle = (id: string) => {
    setWorkOrders(prev => prev.map(w => {
      if (w.id === id) {
        const next = w.status === 'PENDING' ? 'IN_PROGRESS' : w.status === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';
        return { ...w, status: next };
      }
      return w;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">GESTION DES ORDRES DE TRAVAIL (GMAO)</h2>
          <p className={`text-xs ${subText}`}>Planification, attribution techniciens et suivi de résolution</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold ${isDarkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
          >
            <option value="ALL">Tous Statuts</option>
            <option value="PENDING">EN ATTENTE</option>
            <option value="IN_PROGRESS">EN COURS</option>
            <option value="COMPLETED">COMPLÉTÉ</option>
          </select>

          <button
            onClick={() => {
              const newId = `WO-${Math.floor(Math.random() * 8999 + 1000)}`;
              setWorkOrders([
                { id: newId, title: 'Maintenance Capteurs VRC Atrium', asset: 'SENSOR-NODE-09', tech: 'Tarik B.', status: 'PENDING', priority: 'HIGH', date: '2026-08-03' },
                ...workOrders
              ]);
            }}
            className="px-4 py-2 rounded-xl btn-gradient-orange text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>ÉMETTRE OT</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredWO.map((wo) => (
          <div key={wo.id} className={`${cardBg} p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-500/50 transition-all`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-mono text-[10px] font-bold">
                  {wo.id}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  wo.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  wo.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-500/10 text-slate-300'
                }`}>
                  {wo.priority}
                </span>
                <span className={`text-[10px] font-bold uppercase ${
                  wo.status === 'COMPLETED' ? 'text-emerald-400' : wo.status === 'IN_PROGRESS' ? 'text-cyan-400 animate-pulse' : 'text-amber-400'
                }`}>
                  • {wo.status}
                </span>
              </div>
              <h4 className="text-sm font-bold">{wo.title}</h4>
              <div className={`text-xs ${subText} flex flex-wrap items-center gap-3`}>
                <span>Équipement: <strong className="text-slate-200">{wo.asset}</strong></span>
                <span>Technicien: <strong className="text-orange-400">{wo.tech}</strong></span>
                <span>Date: {wo.date}</span>
              </div>
            </div>

            <button
              onClick={() => handleStatusToggle(wo.id)}
              className="px-3 py-2 rounded-xl border border-slate-500/30 bg-black/20 text-xs font-bold hover:bg-orange-500 hover:text-white transition-all cursor-pointer shrink-0"
            >
              CHANGER STATUT
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
