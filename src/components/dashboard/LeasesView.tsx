import React, { useState } from 'react';
import { FileText, Plus, Building2, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';

interface LeasesViewProps {
  isDarkMode: boolean;
}

export const LeasesView: React.FC<LeasesViewProps> = ({ isDarkMode }) => {
  const [leases, setLeases] = useState([
    { id: 'LSE-001', tenant: 'Apex Real Estate Corp', space: 'Atrium Central - Aile Est', area: '450 m²', rent: '14,500 €/m', status: 'ACTIVE', expiry: '2028-12-31' },
    { id: 'LSE-002', tenant: 'TechLabs Innovation SAS', space: 'Open Space Innovation', area: '320 m²', rent: '9,800 €/m', status: 'ACTIVE', expiry: '2027-06-30' },
    { id: 'LSE-003', tenant: 'BioHealth Pharma Europe', space: 'Rooftop Lounge Executive', area: '210 m²', rent: '7,200 €/m', status: 'RENEWAL_DUE', expiry: '2026-09-15' },
  ]);

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">GESTION DES BAUX & LOCATAIRES</h2>
          <p className={`text-xs ${subText}`}>Contrats commerciaux, quittancement et renouvellements de baux</p>
        </div>
        <button
          onClick={() => {
            const newId = `LSE-00${leases.length + 1}`;
            setLeases([
              ...leases,
              { id: newId, tenant: 'Nouveau Locataire Corp', space: 'Bureau R+2', area: '180 m²', rent: '5,000 €/m', status: 'ACTIVE', expiry: '2029-01-01' }
            ]);
          }}
          className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>NOUVEAU BAIL</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leases.map((l) => (
          <div key={l.id} className={`${cardBg} p-5 rounded-2xl border space-y-3 hover:border-orange-500/50 transition-all`}>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 font-mono text-[10px] font-bold">
                {l.id}
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                l.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {l.status}
              </span>
            </div>

            <h4 className="text-sm font-black text-slate-100">{l.tenant}</h4>
            <div className={`text-xs ${subText}`}>{l.space} ({l.area})</div>

            <div className="pt-2 border-t border-slate-500/20 flex items-center justify-between text-xs">
              <span className="font-bold text-orange-400">{l.rent}</span>
              <span className={`text-[10px] ${subText}`}>Fin: {l.expiry}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
