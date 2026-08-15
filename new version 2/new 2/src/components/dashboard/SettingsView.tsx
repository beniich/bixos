import React, { useState } from 'react';
import { Sliders, Save, ShieldCheck } from 'lucide-react';

interface SettingsViewProps {
  isDarkMode: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ isDarkMode }) => {
  const [orgName, setOrgName] = useState('Superadmin HQ Facility Management');
  const [currency, setCurrency] = useState('EUR (€)');
  const [timezone, setTimezone] = useState('Europe/Paris (UTC+1)');

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black uppercase text-orange-500">PARAMÈTRES ORGANISATIONNEL & RÈGLES SÉCURITÉ</h2>
        <p className={`text-xs ${subText}`}>Configuration globale de l'environnement CAFM, devises et rôles JWT</p>
      </div>

      <div className={`${cardBg} p-6 rounded-3xl border space-y-4 max-w-xl`}>
        <div className="space-y-3 text-xs font-mono">
          <div>
            <label className="block font-bold mb-1">NOM ORGANISATION</label>
            <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full bg-black/20 border border-slate-500/30 rounded-xl px-3 py-2 text-slate-100" />
          </div>
          <div>
            <label className="block font-bold mb-1">DEVISE PRINCIPALE</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-black/20 border border-slate-500/30 rounded-xl px-3 py-2 text-slate-100">
              <option value="EUR (€)">EUR (€) - Euro</option>
              <option value="USD ($)">USD ($) - US Dollar</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1">FUSEAU HORAIRE</label>
            <input type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full bg-black/20 border border-slate-500/30 rounded-xl px-3 py-2 text-slate-100" />
          </div>
        </div>

        <button
          onClick={() => alert("Paramètres mis à jour avec succès.")}
          className="w-full py-3 rounded-xl btn-gradient-orange text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>ENREGISTRER PARAMÈTRES</span>
        </button>
      </div>
    </div>
  );
};
