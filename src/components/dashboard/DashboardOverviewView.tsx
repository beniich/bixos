import React, { useState } from 'react';
import {
  Box,
  Activity,
  ClipboardList,
  MapPin,
  TrendingUp,
  Building2,
  Cpu,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { CAFMAsset } from '../../types';

interface DashboardOverviewViewProps {
  isDarkMode: boolean;
  syncTime: string;
  telemetryValues: number[];
  assets: CAFMAsset[];
  onNavigateRoute: (route: string) => void;
  onAddAsset: (asset: CAFMAsset) => void;
}

export const DashboardOverviewView: React.FC<DashboardOverviewViewProps> = ({
  isDarkMode,
  syncTime,
  telemetryValues,
  assets,
  onNavigateRoute,
  onAddAsset
}) => {
  const [showCreateAssetModal, setShowCreateAssetModal] = useState(false);
  const [showQuickWOModal, setShowQuickWOModal] = useState(false);

  // New Asset Form state
  const [newAssetCode, setNewAssetCode] = useState('HVAC-SOUTH-03');
  const [newAssetName, setNewAssetName] = useState('Unité Centrale CTA Sud');
  const [newAssetCategory, setNewAssetCategory] = useState('HVAC');
  const [newAssetLocation, setNewAssetLocation] = useState('Bâtiment B - Toiture');
  const [newAssetVendor, setNewAssetVendor] = useState('Carrier');

  // Quick WO Form state
  const [woTitle, setWoTitle] = useState('Maintenance Préventive Pompe RIA');
  const [woPriority, setWoPriority] = useState('HIGH');
  const [woTech, setWoTech] = useState('TECH #04 - Karim V.');

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const badgeBg = isDarkMode ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700';

  const handleCreateAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: CAFMAsset = {
      id: `ast-${Date.now()}`,
      code: newAssetCode,
      name: newAssetName,
      category: newAssetCategory as any,
      location: newAssetLocation,
      floor: 'R+2',
      status: 'OPERATIONAL',
      healthScore: 98,
      temperature: 21.0,
      powerUsageKw: 35.0,
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextScheduled: '2026-09-15',
      serialNumber: `SN-${Math.floor(Math.random() * 899999 + 100000)}`,
      vendor: newAssetVendor,
    };
    onAddAsset(created);
    setShowCreateAssetModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Quick Action Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
            REZIDET CAFM v4.2 • VUE D'ENSEMBLE EXPÉCUTIVE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateAssetModal(true)}
            className="px-4 py-2 rounded-xl btn-gradient-orange text-white text-xs font-bold flex items-center gap-2 shadow-md hover:brightness-110 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>NOUVEL ACTIF</span>
          </button>
          <button
            onClick={() => setShowQuickWOModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer border border-slate-700"
          >
            <Zap className="w-4 h-4 text-orange-400" />
            <span>CRÉER ORDRE DE TRAVAIL</span>
          </button>
        </div>
      </div>

      {/* 8 Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Assets */}
        <div className={`${cardBg} p-5 rounded-2xl flex flex-col justify-between h-36 transition-all hover:border-orange-500/40`}>
          <div className="flex items-start justify-between">
            <div className={`w-9 h-9 rounded-xl ${badgeBg} flex items-center justify-center`}>
              <Box className="w-5 h-5 text-orange-500" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              100% ACTIFS
            </span>
          </div>
          <div>
            <div className="text-3xl font-black">{assets.length}</div>
            <div className={`text-[11px] font-bold uppercase ${subText} mt-1`}>TOTAL DES ACTIFS</div>
            <div className="text-[10px] text-emerald-500 font-bold mt-0.5">{assets.length} OK • 0 PANNE</div>
          </div>
        </div>

        {/* Card 2: Availability */}
        <div className={`${cardBg} p-5 rounded-2xl flex flex-col justify-between h-36 transition-all hover:border-orange-500/40`}>
          <div className="flex items-start justify-between">
            <div className={`w-9 h-9 rounded-xl ${badgeBg} flex items-center justify-center`}>
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              ↑ 2.3%
            </span>
          </div>
          <div>
            <div className="text-3xl font-black">99.8%</div>
            <div className={`text-[11px] font-bold uppercase ${subText} mt-1`}>DISPONIBILITÉ RÉSEAU</div>
            <div className="text-[10px] text-emerald-500 font-bold mt-0.5">SLA ATTEINT</div>
          </div>
        </div>

        {/* Card 3: Pending Work Orders */}
        <div className={`${cardBg} p-5 rounded-2xl flex flex-col justify-between h-36 transition-all hover:border-orange-500/40`}>
          <div className="flex items-start justify-between">
            <div className={`w-9 h-9 rounded-xl ${badgeBg} flex items-center justify-center`}>
              <ClipboardList className="w-5 h-5 text-amber-500" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
              5 EN COURS
            </span>
          </div>
          <div>
            <div className="text-3xl font-black">10</div>
            <div className={`text-[11px] font-bold uppercase ${subText} mt-1`}>ORDRES DE TRAVAIL</div>
            <div className="text-[10px] text-amber-500 font-bold mt-0.5">2 URGENTS • 8 HAUTS</div>
          </div>
        </div>

        {/* Card 4: Occupancy Rate */}
        <div className={`${cardBg} p-5 rounded-2xl flex flex-col justify-between h-36 transition-all hover:border-orange-500/40`}>
          <div className="flex items-start justify-between">
            <div className={`w-9 h-9 rounded-xl ${badgeBg} flex items-center justify-center`}>
              <MapPin className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              ↑ 1.8%
            </span>
          </div>
          <div>
            <div className="text-3xl font-black">84%</div>
            <div className={`text-[11px] font-bold uppercase ${subText} mt-1`}>OCCUPATION ESPACES</div>
            <div className="text-[10px] text-slate-400 font-bold mt-0.5">18/22 ZONES ACTIVES</div>
          </div>
        </div>

        {/* Card 5: Maintenance Cost */}
        <div className={`${cardBg} p-5 rounded-2xl flex flex-col justify-between h-36 transition-all hover:border-orange-500/40`}>
          <div className="flex items-start justify-between">
            <div className={`w-9 h-9 rounded-xl ${badgeBg} flex items-center justify-center text-sm font-bold text-orange-400`}>
              $
            </div>
          </div>
          <div>
            <div className="text-3xl font-black">14.2k €</div>
            <div className={`text-[11px] font-bold uppercase ${subText} mt-1`}>COÛT MAINTENANCE</div>
            <div className="text-[10px] text-slate-400 font-bold mt-0.5">BUDGET OPTIMISÉ -12%</div>
          </div>
        </div>

        {/* Card 6: Savings */}
        <div className={`${cardBg} p-5 rounded-2xl flex flex-col justify-between h-36 transition-all hover:border-orange-500/40`}>
          <div className="flex items-start justify-between">
            <div className={`w-9 h-9 rounded-xl ${badgeBg} flex items-center justify-center`}>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              ↑ 18.4%
            </span>
          </div>
          <div>
            <div className="text-3xl font-black">28.5%</div>
            <div className={`text-[11px] font-bold uppercase ${subText} mt-1`}>ÉCONOMIES ÉNERGIE</div>
            <div className="text-[10px] text-emerald-400 font-bold mt-0.5">VS MÊME PÉRIODE 2025</div>
          </div>
        </div>

        {/* Card 7: Rental Revenue */}
        <div className={`${cardBg} p-5 rounded-2xl flex flex-col justify-between h-36 transition-all hover:border-orange-500/40`}>
          <div className="flex items-start justify-between">
            <div className={`w-9 h-9 rounded-xl ${badgeBg} flex items-center justify-center`}>
              <Building2 className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black">142.8k €</div>
            <div className={`text-[11px] font-bold uppercase ${subText} mt-1`}>REVENUS LOCATIFS</div>
            <div className="text-[10px] text-slate-400 font-bold mt-0.5">12 BAUX ACTIFS</div>
          </div>
        </div>

        {/* Card 8: Active Sensors */}
        <div className={`${cardBg} p-5 rounded-2xl flex flex-col justify-between h-36 transition-all hover:border-orange-500/40`}>
          <div className="flex items-start justify-between">
            <div className={`w-9 h-9 rounded-xl ${badgeBg} flex items-center justify-center`}>
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black">48</div>
            <div className={`text-[11px] font-bold uppercase ${subText} mt-1`}>CAPTEURS IOT EN LIGNE</div>
            <div className="text-[10px] text-purple-400 font-bold mt-0.5">SOCKET.IO LIVE TELEMETRY</div>
          </div>
        </div>
      </div>

      {/* Live Telemetry Ticker Bar */}
      <div className={`${cardBg} p-4 rounded-2xl flex flex-wrap items-center gap-4 text-xs font-bold border`}>
        <div className="flex items-center gap-2 text-orange-500 uppercase tracking-wider">
          <span className="w-2.5 h-2.5 bg-orange-500 rounded-sm animate-pulse" />
          <span>TELEMETRY CAPTEURS EN DIRECT ({syncTime})</span>
        </div>
        <div className="h-4 w-px bg-slate-500/30" />
        {telemetryValues.map((val, idx) => (
          <div key={idx} className={`flex items-center gap-2 px-3 py-1 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            <span className={subText}>VIBRATION #{idx + 1}</span>
            <span className="text-orange-400 font-black">{val} Hz</span>
          </div>
        ))}
      </div>

      {/* Charts Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Work Orders Bar Chart */}
        <div className={`lg:col-span-2 ${cardBg} p-6 rounded-2xl space-y-6`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <span>ACTIVITÉ DES ORDRES DE TRAVAIL (7 DERNIERS JOURS)</span>
            </h3>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-orange-500 rounded-sm" /> CRÉÉS</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> COMPLÉTÉS</span>
            </div>
          </div>

          <div className="h-52 w-full flex items-end justify-between gap-4 pt-6 border-b border-dashed border-slate-500/30 pb-2">
            {[
              { day: 'mar.', created: 4, done: 3 },
              { day: 'mer.', created: 6, done: 5 },
              { day: 'jeu.', created: 3, done: 4 },
              { day: 'ven.', created: 8, done: 7 },
              { day: 'sam.', created: 2, done: 2 },
              { day: 'dim.', created: 1, done: 1 },
              { day: 'lun.', created: 10, done: 9 },
            ].map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full max-w-[44px] flex items-end justify-center gap-1.5 h-full">
                  <div className="w-3 bg-orange-500 rounded-t-sm transition-all" style={{ height: `${(item.created / 10) * 100}%` }} />
                  <div className="w-3 bg-emerald-500 rounded-t-sm transition-all" style={{ height: `${(item.done / 10) * 100}%` }} />
                </div>
                <span className={`text-[10px] font-bold uppercase ${subText}`}>{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Status Donut / Breakdown */}
        <div className={`${cardBg} p-6 rounded-2xl space-y-6`}>
          <h3 className="text-xs font-black uppercase tracking-wider">
            RÉPARTITION DU STATUT DES ÉQUIPEMENTS
          </h3>

          <div className="flex flex-col items-center justify-center py-2 space-y-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-emerald-500" strokeDasharray="80, 100" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-400" strokeDasharray="15, 100" strokeDashoffset="-80" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-rose-500" strokeDasharray="5, 100" strokeDashoffset="-95" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black">95%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">SANTE MOY.</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold w-full pt-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> OPÉRATIONNEL (80%)
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm" /> MAINTENANCE (15%)
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm" /> PANNE (5%)
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 bg-slate-600 rounded-sm" /> ARCHIVÉ (0%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3 Detailed Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work Orders */}
        <div className={`${cardBg} p-6 rounded-2xl space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-500/20 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider">DERNIERS ORDRES DE TRAVAIL</h3>
            <button onClick={() => onNavigateRoute('work-orders')} className="text-[11px] font-bold text-orange-400 hover:underline cursor-pointer">
              TOUS &gt;
            </button>
          </div>
          <div className="space-y-3">
            {[
              { id: 'wo-101', title: 'Remplacement Filtres CTA Nord', node: 'AHU-NORTH-01', priority: 'HIGH', tech: 'Tech #01' },
              { id: 'wo-102', title: 'Contrôle Pression Pompe RIA', node: 'FIRE-PUMP-01', priority: 'HIGH', tech: 'Tech #04' },
              { id: 'wo-103', title: 'Audit Harmoniques TGBT', node: 'PWR-SUB-01', priority: 'MEDIUM', tech: 'Tech #02' },
              { id: 'wo-104', title: 'Lubrification Cabine Ascenseur', node: 'ELEV-WEST-02', priority: 'HIGH', tech: 'Tech #03' },
            ].map((wo) => (
              <div key={wo.id} className={`p-3 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div>
                  <div className="text-xs font-bold">{wo.title}</div>
                  <div className={`text-[10px] ${subText} mt-0.5`}>{wo.node} • {wo.tech}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-bold">
                  {wo.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast / Preventive Schedule */}
        <div className={`${cardBg} p-6 rounded-2xl space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-500/20 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider">AGENDA PRÉVISIONNEL (7J)</h3>
            <button onClick={() => onNavigateRoute('maintenance')} className="text-[11px] font-bold text-orange-400 hover:underline cursor-pointer">
              CALENDRIER &gt;
            </button>
          </div>
          <div className="space-y-3">
            {[
              { date: 'Demain, 09:00', task: 'Test Démarrage Groupe Électrogène', loc: 'SS-2' },
              { date: '05 Août, 14:00', task: 'Inspection Thermographique Armoires', loc: 'R+3' },
              { date: '07 Août, 10:30', task: 'Remplacement Sondes CO2 Atrium', loc: 'Hall A' },
            ].map((ev, i) => (
              <div key={i} className={`p-3 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-orange-400">{ev.date}</div>
                  <div className="text-xs font-semibold">{ev.task}</div>
                  <div className={`text-[10px] ${subText}`}>{ev.loc}</div>
                </div>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Live Alerts Feed */}
        <div className={`${cardBg} p-6 rounded-2xl space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-500/20 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider">ALERTES SYSTÈME ACTIVES</h3>
            <button onClick={() => onNavigateRoute('notifications')} className="text-[11px] font-bold text-orange-400 hover:underline cursor-pointer">
              ALERTES (2) &gt;
            </button>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Température Élevée</span>
                <span className="text-[9px]">Il y a 12m</span>
              </div>
              <p className="text-[11px] text-amber-300">Ascenseur Panoramique Ouest dépasse 28°C.</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Pression Basse CTA</span>
                <span className="text-[9px]">Il y a 45m</span>
              </div>
              <p className="text-[11px] text-rose-300">Delta Pression Filtre CTA Est critique.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE ASSET MODAL */}
      {showCreateAssetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md ${cardBg} rounded-3xl p-6 border shadow-2xl space-y-4 relative`}>
            <button onClick={() => setShowCreateAssetModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black uppercase tracking-wider text-orange-500 flex items-center gap-2">
              <Box className="w-5 h-5" />
              AJOUTER UN ÉQUIPEMENT / ACTIF
            </h3>
            <form onSubmit={handleCreateAssetSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">CODE ÉQUIPEMENT</label>
                <input type="text" required value={newAssetCode} onChange={(e) => setNewAssetCode(e.target.value)} className="w-full bg-black/20 border border-slate-500/30 rounded-xl px-3 py-2 font-mono" />
              </div>
              <div>
                <label className="block font-bold mb-1">DÉSIGNATION</label>
                <input type="text" required value={newAssetName} onChange={(e) => setNewAssetName(e.target.value)} className="w-full bg-black/20 border border-slate-500/30 rounded-xl px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">CATÉGORIE</label>
                  <select value={newAssetCategory} onChange={(e) => setNewAssetCategory(e.target.value)} className="w-full bg-black/20 border border-slate-500/30 rounded-xl px-3 py-2">
                    <option value="HVAC">HVAC / CVC</option>
                    <option value="ELEVATOR">ASCENSEUR</option>
                    <option value="ENERGY_GRID">ÉLECTRICITÉ</option>
                    <option value="FIRE_SAFETY">SÉCURITÉ INCENDIE</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">FOURNISSEUR</label>
                  <input type="text" value={newAssetVendor} onChange={(e) => setNewAssetVendor(e.target.value)} className="w-full bg-black/20 border border-slate-500/30 rounded-xl px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">LOCALISATION</label>
                <input type="text" value={newAssetLocation} onChange={(e) => setNewAssetLocation(e.target.value)} className="w-full bg-black/20 border border-slate-500/30 rounded-xl px-3 py-2" />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl btn-gradient-orange text-white font-bold text-xs shadow-lg cursor-pointer">
                ENREGISTRER L'ACTIF
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QUICK WORK ORDER MODAL */}
      {showQuickWOModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md ${cardBg} rounded-3xl p-6 border shadow-2xl space-y-4 relative`}>
            <button onClick={() => setShowQuickWOModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black uppercase tracking-wider text-orange-500 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Nouveau Ordre de Travail
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">INTITULÉ DE L'INTERVENTION</label>
                <input type="text" value={woTitle} onChange={(e) => setWoTitle(e.target.value)} className="w-full bg-black/20 border border-slate-500/30 rounded-xl px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">PRIORITÉ</label>
                  <select value={woPriority} onChange={(e) => setWoPriority(e.target.value)} className="w-full bg-black/20 border border-slate-500/30 rounded-xl px-3 py-2">
                    <option value="HIGH">HAUTE</option>
                    <option value="CRITICAL">CRITIQUE</option>
                    <option value="MEDIUM">MOYENNE</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">TECHNICIEN</label>
                  <input type="text" value={woTech} onChange={(e) => setWoTech(e.target.value)} className="w-full bg-black/20 border border-slate-500/30 rounded-xl px-3 py-2" />
                </div>
              </div>
              <button
                onClick={() => {
                  alert(`Ordre de travail "${woTitle}" transmis au technicien ${woTech} via Socket.io!`);
                  setShowQuickWOModal(false);
                }}
                className="w-full py-3 rounded-xl btn-gradient-orange text-white font-bold text-xs shadow-lg cursor-pointer"
              >
                EMETTRE L'ORDRE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
