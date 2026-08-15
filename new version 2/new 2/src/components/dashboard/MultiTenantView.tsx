import React, { useState } from 'react';
import { Building2, Users, Shield, Plus, Key } from 'lucide-react';

interface MultiTenantViewProps {
  isDarkMode: boolean;
}

export const MultiTenantView: React.FC<MultiTenantViewProps> = ({ isDarkMode }) => {
  const [tenants, setTenants] = useState([
    { id: 'TNT-01', name: 'Apex Real Estate Paris', plan: 'ENTERPRISE', users: '24 / 50', status: 'ACTIVE', key: 'CAFM-TENANT-APX-99' },
    { id: 'TNT-02', name: 'TechLabs Space Management', plan: 'PRO', users: '12 / 20', status: 'ACTIVE', key: 'CAFM-TENANT-TCH-44' },
    { id: 'TNT-03', name: 'Global Logistics Hub', plan: 'ENTERPRISE', users: '45 / 100', status: 'ACTIVE', key: 'CAFM-TENANT-GLB-12' },
  ]);

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">GESTION MULTI-TENANT (ORGANISATIONS)</h2>
          <p className={`text-xs ${subText}`}>Isolation stricte des données Prisma par schéma tenant et quotas utilisateurs</p>
        </div>
        <button
          onClick={() => {
            const newId = `TNT-0${tenants.length + 1}`;
            setTenants([
              ...tenants,
              { id: newId, name: 'Nouvelle Organisation Partner', plan: 'PRO', users: '1 / 20', status: 'ACTIVE', key: `CAFM-TENANT-NEW-${Math.floor(Math.random() * 89 + 10)}` }
            ]);
          }}
          className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>AJOUTER ORGANISATION</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tenants.map((t) => (
          <div key={t.id} className={`${cardBg} p-5 rounded-2xl border space-y-3 hover:border-orange-500/50 transition-all`}>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 font-mono text-[10px] font-bold">
                {t.id}
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {t.plan}
              </span>
            </div>

            <h4 className="text-sm font-black">{t.name}</h4>
            <div className={`text-xs ${subText}`}>Sièges Occupés: <strong className="text-slate-200">{t.users}</strong></div>

            <div className="pt-2 border-t border-slate-500/20 text-[10px] font-mono text-orange-400 truncate">
              Key: {t.key}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
