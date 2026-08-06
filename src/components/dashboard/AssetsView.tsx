import React, { useState } from 'react';
import { Search, Plus, Filter, Box, Eye, Edit3, Trash2, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { CAFMAsset } from '../../types';

interface AssetsViewProps {
  isDarkMode: boolean;
  assets: CAFMAsset[];
  onAddAsset: (asset: CAFMAsset) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({ isDarkMode, assets, onAddAsset }) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<CAFMAsset | null>(null);

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || a.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher code, nom, localisation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full ${isDarkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono focus:outline-none focus:border-orange-500`}
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold ${isDarkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
          >
            <option value="ALL">Toutes Catégories</option>
            <option value="HVAC">HVAC / CVC</option>
            <option value="ELEVATOR">ASCENSEURS</option>
            <option value="ENERGY_GRID">ÉLECTRICITÉ</option>
            <option value="FIRE_SAFETY">SÉCURITÉ INCENDIE</option>
          </select>
        </div>

        <button
          onClick={() => {
            const code = `AST-${Math.floor(Math.random() * 899 + 100)}`;
            onAddAsset({
              id: `ast-${Date.now()}`,
              code,
              name: 'Unité CTA Secondaire Ouest',
              category: 'HVAC',
              location: 'Bâtiment C - R+1',
              floor: 'R+1',
              status: 'OPERATIONAL',
              healthScore: 94,
              temperature: 20.2,
              powerUsageKw: 22.0,
              lastMaintenance: '2026-07-20',
              nextScheduled: '2026-08-30',
              serialNumber: 'CT-9912-B',
              vendor: 'Carrier France',
            });
          }}
          className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>NOUVEL ÉQUIPEMENT</span>
        </button>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((ast) => (
          <div key={ast.id} className={`${cardBg} p-5 rounded-2xl space-y-4 border hover:border-orange-500/50 transition-all`}>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold font-mono">
                {ast.code}
              </span>
              <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                ast.status === 'OPERATIONAL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                ast.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {ast.status}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-black tracking-tight">{ast.name}</h4>
              <p className={`text-xs ${subText} mt-0.5`}>{ast.vendor} • S/N: {ast.serialNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-500/20">
              <div>
                <span className={`block text-[10px] ${subText}`}>LOCALISATION</span>
                <span className="font-bold">{ast.location}</span>
              </div>
              <div>
                <span className={`block text-[10px] ${subText}`}>SCORE SANTÉ</span>
                <span className="font-bold text-emerald-400">{ast.healthScore}%</span>
              </div>
              <div>
                <span className={`block text-[10px] ${subText}`}>TEMPÉRATURE</span>
                <span className="font-bold">{ast.temperature} °C</span>
              </div>
              <div>
                <span className={`block text-[10px] ${subText}`}>PUISSANCE</span>
                <span className="font-bold">{ast.powerUsageKw} kW</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className={`text-[10px] ${subText}`}>Maint: {ast.nextScheduled}</span>
              <button
                onClick={() => setSelectedAsset(ast)}
                className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold hover:bg-orange-500 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>INSPECTER</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Asset Inspection Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg ${cardBg} rounded-3xl p-6 border shadow-2xl space-y-4 relative`}>
            <button onClick={() => setSelectedAsset(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              ✕
            </button>
            <h3 className="text-lg font-black uppercase text-orange-500 flex items-center gap-2">
              <Box className="w-5 h-5" />
              FICHE DÉTAILLÉE : {selectedAsset.code}
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black/20 border border-slate-500/20 space-y-1">
                <div className="text-sm font-bold">{selectedAsset.name}</div>
                <div className={subText}>Catégorie: {selectedAsset.category} | Fournisseur: {selectedAsset.vendor}</div>
                <div className={subText}>Numéro de série: {selectedAsset.serialNumber}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black/20 border border-slate-500/20">
                  <div className={`text-[10px] ${subText}`}>Dernière maintenance</div>
                  <div className="font-bold text-slate-200 mt-1">{selectedAsset.lastMaintenance}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/20 border border-slate-500/20">
                  <div className={`text-[10px] ${subText}`}>Prochaine maintenance</div>
                  <div className="font-bold text-orange-400 mt-1">{selectedAsset.nextScheduled}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`Diagnostic IoT téléversé pour ${selectedAsset.code}`);
                  setSelectedAsset(null);
                }}
                className="w-full py-2.5 rounded-xl btn-gradient-orange text-white font-bold text-xs cursor-pointer"
              >
                LANCER DIAGNOSTIC IOT TEMPS RÉEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
