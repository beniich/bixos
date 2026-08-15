import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, MessageSquare, Wrench, Zap, Sparkles, ArrowRight,
  Building2, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, 
  Settings2, Activity, CalendarClock, MapPin
} from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { SiteManagerModal } from './SiteManagerModal';

const STATUS_OPTIONS = [
  { value: 'NORMAL', label: '🟢 Normal', color: '#10b981', healthDelta: 0, priority: 'LOW' },
  { value: 'PANNE', label: '🔴 Panne', color: '#ef4444', healthDelta: -50, priority: 'CRITICAL' },
  { value: 'INTERVENTION', label: '🟡 Intervention', color: '#f59e0b', healthDelta: -20, priority: 'HIGH' },
  { value: 'MAINTENANCE', label: '🔧 Maintenance', color: '#3b82f6', healthDelta: -5, priority: 'MEDIUM' },
];

const UPCOMING_INTERVENTIONS = [
  { id: 'INT-001', date: 'Demain, 08:00', asset: 'HVAC-04 (Aile B)', type: 'Préventive', tech: 'Marc Leblanc', status: 'Planifiée' },
  { id: 'INT-002', date: 'Demain, 14:00', asset: 'Ascenseur Nord', type: 'Corrective', tech: 'Sophie Martin', status: 'En attente pièces' },
  { id: 'INT-003', date: '12 Août, 09:00', asset: 'Compresseur C-2', type: 'Inspection', tech: 'Auto-assignation', status: 'Créée par IA' },
];

export const CafmGmaoDashboard: React.FC = () => {
  // --- STATE ---
  const [sites, setSites] = useState<any[]>([]);
  const [activeSiteId, setActiveSiteId] = useState('');
  const [isSiteManagerOpen, setIsSiteManagerOpen] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [reason, setReason] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [submittingLive, setSubmittingLive] = useState(false);
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDesc, setLiveDesc] = useState('');
  const [liveCategory, setLiveCategory] = useState('INTERVENTION');

  const [liveFeed, setLiveFeed] = useState<any[]>([
    { id: 1, type: 'claim_created', actorRole: 'Admin', actorName: 'Jean Dupont', title: 'Remplacement compresseur CVC', desc: 'Prévoir l\'arrêt de la machine demain.', time: 'il y a 2m' },
    { id: 2, type: 'status_changed', actorRole: 'Technicien', actorName: 'Marc L.', title: 'Intervention Démarrée', desc: 'Changement filtre à air sur Aile B', time: 'il y a 15m' },
  ]);

  useEffect(() => {
    const q = query(collection(db, 'sites'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty && loadingSites) {
        // Auto-seed demo sites if empty
        const initialSites = [
          { name: 'Site Principal', city: 'Paris', health: 92, status: 'NORMAL', assets: { active: 145, maintenance: 12, broken: 3 } },
          { name: 'Entrepôt Logistique', city: 'Lyon', health: 78, status: 'INTERVENTION', assets: { active: 89, maintenance: 5, broken: 2 } },
          { name: 'Bureaux R&D', city: 'Nantes', health: 98, status: 'NORMAL', assets: { active: 42, maintenance: 1, broken: 0 } },
        ];
        for (const s of initialSites) {
          await addDoc(collection(db, 'sites'), { ...s, createdAt: serverTimestamp() });
        }
      } else {
        const fetchedSites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSites(fetchedSites);
        setLoadingSites(false);
        if (fetchedSites.length > 0 && !activeSiteId) {
          setActiveSiteId(fetchedSites[0].id);
        }
      }
    }, (error) => {
      console.error("Error loading sites:", error);
      setLoadingSites(false);
    });

    return () => unsubscribe();
  }, [loadingSites, activeSiteId]);

  const activeSite = sites.find(s => s.id === activeSiteId) || sites[0] || {
    name: 'Chargement...', city: '', health: 100, status: 'NORMAL', assets: { active: 0, maintenance: 0, broken: 0 }
  };
  
  const totalAssets = (activeSite?.assets?.active || 0) + (activeSite?.assets?.maintenance || 0) + (activeSite?.assets?.broken || 0);

  // --- HANDLERS ---
  const handleStatusChange = () => {
    if (!selectedStatus || !reason) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setLiveFeed([
        { id: Date.now(), type: 'status_changed', actorRole: 'Admin', actorName: 'Admin BizOS', title: `Statut modifié: ${selectedStatus}`, desc: reason, time: 'À l\'instant' },
        ...liveFeed
      ]);
      setSelectedStatus('');
      setReason('');
    }, 1000);
  };

  const handlePublishLive = () => {
    if (!liveTitle || !liveDesc) return;
    setSubmittingLive(true);
    setTimeout(() => {
      setSubmittingLive(false);
      setLiveFeed([
        { id: Date.now(), type: 'claim_created', actorRole: 'Admin', actorName: 'Admin BizOS', title: liveTitle, desc: liveDesc, time: 'À l\'instant' },
        ...liveFeed
      ]);
      setLiveTitle('');
      setLiveDesc('');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in text-white">
      {/* HEADER & SITE SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
            Tableau de Bord GMAO
          </h1>
          <p className="text-slate-400">
            Supervision des actifs, réclamations et interventions en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#130826] p-2 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-2 pl-2">
            <Building2 className="w-5 h-5 text-violet-400" />
            <select
              value={activeSiteId}
              onChange={(e) => setActiveSiteId(e.target.value)}
              className="bg-transparent border-none text-white focus:ring-0 font-semibold cursor-pointer outline-none"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id} className="bg-gray-900">{s.name} ({s.city})</option>
              ))}
            </select>
          </div>
          <div className="w-px h-8 bg-white/10 mx-1" />
          <button 
            onClick={() => setIsSiteManagerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold flex items-center gap-2 transition-colors border border-white/5"
          >
            <Settings2 className="w-4 h-4" />
            Gérer les sites (Admin)
          </button>
        </div>
      </div>

      {/* VUE D'ENSEMBLE DES ACTIFS (KPI CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard 
          title="Total des Actifs" 
          value={totalAssets} 
          icon={<Building2 className="w-6 h-6 text-violet-400" />}
          trend={`${activeSite.health}% Santé globale`}
          trendColor="text-emerald-400"
          bg="bg-violet-950/20 border-violet-500/20"
        />
        <KpiCard 
          title="Actifs Opérationnels" 
          value={activeSite.assets.active} 
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
          trend="Fonctionnement nominal"
          trendColor="text-slate-400"
          bg="bg-emerald-950/20 border-emerald-500/20"
        />
        <KpiCard 
          title="En Maintenance" 
          value={activeSite.assets.maintenance} 
          icon={<Wrench className="w-6 h-6 text-blue-400" />}
          trend="Préventif en cours"
          trendColor="text-blue-400"
          bg="bg-blue-950/20 border-blue-500/20"
        />
        <KpiCard 
          title="En Panne (Critique)" 
          value={activeSite.assets.broken} 
          icon={<AlertCircle className="w-6 h-6 text-rose-400" />}
          trend="Intervention requise"
          trendColor="text-rose-400"
          bg="bg-rose-950/20 border-rose-500/20"
        />
      </div>

      {/* DEUX COLONNES PRINCIPALES : ACTIONS & FLUX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PILIER 1: Changement de Statut Site */}
        <div className="bg-[#130826] border border-[#d946ef]/20 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#d946ef]/10 blur-[80px] -z-10 rounded-full" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(124,58,237,0.3)] border border-violet-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Déclarer Panne / Alerte</h2>
              <p className="text-sm text-slate-400">
                Sur le site : <span className="text-white font-semibold">{activeSite.name}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Statut d'urgence</label>
              <div className="grid grid-cols-2 gap-3">
                {STATUS_OPTIONS.map(status => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                      selectedStatus === status.value
                        ? 'bg-opacity-20 scale-105 shadow-lg'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    style={{
                      backgroundColor: selectedStatus === status.value ? `${status.color}30` : undefined,
                      borderColor: selectedStatus === status.value ? status.color : 'rgba(255,255,255,0.1)',
                      borderWidth: '1px',
                      color: selectedStatus === status.value ? '#fff' : status.color,
                    }}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Détails de l'incident <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Décrivez le problème observé..."
                rows={2}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-[#d946ef] focus:outline-none transition-colors"
              />
            </div>
            
            <button
              onClick={handleStatusChange}
              disabled={submitting || !selectedStatus || !reason}
              className="w-full py-3 mt-2 bizos-cta-pink font-bold rounded-xl text-white disabled:opacity-50 transition-all flex justify-center items-center gap-2"
            >
              {submitting ? 'Mise à jour...' : <><Zap className="w-5 h-5" /> Signaler l'incident</>}
            </button>
          </div>
        </div>

        {/* PILIER 2: Saisie Directe Admin & Collaborateur */}
        <div className="bg-[#130826] border border-cyan-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] -z-10 rounded-full" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-500/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Flux Collaboratif (Temps Réel)</h2>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <select
                value={liveCategory}
                onChange={(e) => setLiveCategory(e.target.value)}
                className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:border-cyan-500 outline-none w-1/3"
              >
                <option value="INTERVENTION">Intervention</option>
                <option value="NOTE">Note Interne</option>
              </select>
              <input
                type="text"
                value={liveTitle}
                onChange={(e) => setLiveTitle(e.target.value)}
                placeholder="Titre de l'action..."
                className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:border-cyan-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={liveDesc}
                onChange={(e) => setLiveDesc(e.target.value)}
                placeholder="Détails techniques..."
                className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:border-cyan-500 outline-none"
              />
              <button
                onClick={handlePublishLive}
                disabled={submittingLive || !liveTitle || !liveDesc}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl disabled:opacity-50 text-xs whitespace-nowrap transition-colors"
              >
                {submittingLive ? '...' : 'Publier'}
              </button>
            </div>
          </div>

          {/* FLUX LIVE */}
          <div className="flex-1 border-t border-white/10 pt-4 overflow-hidden flex flex-col">
            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {liveFeed.map(msg => (
                <div key={msg.id} className="bg-black/30 rounded-xl p-3 border border-white/5">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        msg.actorRole === 'Admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-orange-500/20 text-orange-300'
                      }`}>
                        {msg.actorRole}
                      </span>
                      <span className="text-xs font-semibold">{msg.actorName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{msg.time}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white/90">{msg.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{msg.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TABLEAU RÉCAPITULATIF : INTERVENTIONS À VENIR */}
      <div className="bg-[#130826] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Interventions à Venir</h2>
              <p className="text-sm text-slate-400">Planification des 7 prochains jours sur {activeSite.name}</p>
            </div>
          </div>
          <button className="text-sm font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1">
            Voir le planning <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-wider">
                <th className="pb-3 font-medium">Date & Heure</th>
                <th className="pb-3 font-medium">Équipement (Asset)</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Technicien Assigné</th>
                <th className="pb-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {UPCOMING_INTERVENTIONS.map((int, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 text-white font-medium">{int.date}</td>
                  <td className="py-4 text-slate-300">{int.asset}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase ${
                      int.type === 'Préventive' ? 'bg-blue-500/20 text-blue-300' :
                      int.type === 'Corrective' ? 'bg-orange-500/20 text-orange-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {int.type}
                    </span>
                  </td>
                  <td className="py-4 text-slate-400 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                      {int.tech.charAt(0)}
                    </div>
                    {int.tech}
                  </td>
                  <td className="py-4">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        int.status.includes('Planifiée') ? 'bg-emerald-400' :
                        int.status.includes('attente') ? 'bg-yellow-400' : 'bg-purple-400'
                      }`} />
                      {int.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL GESTION DES SITES (ADMIN) */}
      {isSiteManagerOpen && (
        <SiteManagerModal sites={sites} onClose={() => setIsSiteManagerOpen(false)} />
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---
function KpiCard({ title, value, icon, trend, trendColor, bg }: any) {
  return (
    <div className={`p-5 rounded-2xl border ${bg} flex flex-col justify-between backdrop-blur-sm`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-300">{title}</h3>
        <div className="p-2 rounded-xl bg-black/30 border border-white/5">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className={`text-xs font-medium ${trendColor}`}>{trend}</div>
      </div>
    </div>
  );
}
