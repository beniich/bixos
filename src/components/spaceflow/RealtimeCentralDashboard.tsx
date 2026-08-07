import React, { useState } from 'react';
import { 
  useRealtimeData, 
  RealtimeSite, 
  CollaboratorEntry 
} from '../../services/realtimeStore';
import { useFieldTechStore } from '../../services/fieldTechStore';
import { 
  Activity, AlertTriangle, CheckCircle2, Clock, Globe, MapPin, Zap, 
  Send, Plus, UserCheck, ShieldAlert, Sparkles, Filter, RefreshCw, 
  Layers, MessageSquare, Wrench, ChevronRight, Database, Wifi
} from 'lucide-react';

export const RealtimeCentralDashboard: React.FC = () => {
  const { sites, entries, isLiveConnected, updateSiteStatus, addCollaboratorEntry, addSite } = useRealtimeData();
  const { workOrders, addWorkOrder, updateWorkOrder } = useFieldTechStore();

  // Active User Persona (Admin vs Collaborator)
  const [activeRole, setActiveRole] = useState<'Admin' | 'Collaborateur' | 'Technicien'>('Admin');
  const [userName, setUserName] = useState<string>('Jean Dupont (Admin)');

  // Form states for submitting new real-time entry
  const [entryCategory, setEntryCategory] = useState<CollaboratorEntry['category']>('Intervention');
  const [entryTitle, setEntryTitle] = useState<string>('');
  const [entryContent, setEntryContent] = useState<string>('');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(sites[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick Site Status Modifier Modal/Section
  const [editingSiteId, setEditingSiteId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<RealtimeSite['status']>('operational');
  const [activeFailureText, setActiveFailureText] = useState<string>('');
  const [techAssignedText, setTechAssignedText] = useState<string>('');

  const handleRoleChange = (role: 'Admin' | 'Collaborateur' | 'Technicien') => {
    setActiveRole(role);
    if (role === 'Admin') setUserName('Jean Dupont (Admin)');
    else if (role === 'Collaborateur') setUserName('Marie Curie (Collaborateur)');
    else setUserName('Antoine Mercier (FieldTech #402)');
  };

  const handlePostEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim() || !entryContent.trim()) return;

    setIsSubmitting(true);
    const targetSite = sites.find(s => s.id === selectedSiteId);

    await addCollaboratorEntry({
      authorName: userName,
      authorRole: activeRole,
      category: entryCategory,
      title: entryTitle,
      content: entryContent,
      siteId: selectedSiteId,
      siteName: targetSite?.name || 'Général',
      status: 'Publié'
    });

    // Also if category is Panne / Incident, auto-update site status if selected
    if (entryCategory === 'Panne / Incident' && selectedSiteId) {
      await updateSiteStatus(selectedSiteId, 'panne', entryTitle, userName, userName);
    }

    setEntryTitle('');
    setEntryContent('');
    setIsSubmitting(false);
  };

  const handleUpdateSiteStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSiteId) return;

    await updateSiteStatus(
      editingSiteId, 
      newStatus, 
      activeFailureText, 
      techAssignedText,
      userName
    );

    // Auto-post a system entry
    const targetSite = sites.find(s => s.id === editingSiteId);
    await addCollaboratorEntry({
      authorName: userName,
      authorRole: activeRole,
      category: 'Modification Site',
      title: `Changement de statut: ${targetSite?.name}`,
      content: `Nouveau statut: ${newStatus.toUpperCase()}. ${activeFailureText ? `Détail: ${activeFailureText}` : ''}`,
      siteId: editingSiteId,
      siteName: targetSite?.name || 'Site'
    });

    setEditingSiteId('');
  };

  return (
    <div className="space-y-8 animate-fade-in text-white font-sans">
      
      {/* Realtime Connection Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-[#140826]/90 border border-[#d946ef]/40 shadow-[0_0_30px_rgba(217,70,239,0.25)] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d946ef]/30 to-[#8b5cf6]/40 border border-[#d946ef] flex items-center justify-center text-[#f472b6] shadow-[0_0_15px_rgba(217,70,239,0.5)]">
            <Wifi className={`w-6 h-6 ${isLiveConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                FIRESTORE LIVE SYNC ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">Backend ↔ API ↔ Frontend</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
              Hub Central <span className="bg-gradient-to-r from-[#f472b6] via-[#d946ef] to-[#fb923c] bg-clip-text text-transparent">Admin & Collaborateurs</span>
            </h1>
          </div>
        </div>

        {/* User Role Persona Switcher */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl font-mono text-xs">
          <span className="text-slate-400 text-[10px] uppercase px-2">View as:</span>
          {(['Admin', 'Collaborateur', 'Technicien'] as const).map(role => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeRole === role
                  ? 'bg-[#d946ef] text-white font-bold shadow-[0_0_10px_rgba(217,70,239,0.5)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Realtime Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Entry Form & Site Status Modifiers (Admin & Collaborator Input) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Add Real-Time Report/Entry */}
          <div className="p-6 rounded-3xl bg-[#140826]/90 border border-[#d946ef]/40 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#f472b6]" />
                <h2 className="font-bold text-base text-white">Saisie Directe Admin & Collaborateur</h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d946ef]/20 text-[#f472b6] border border-[#d946ef]/40">
                {activeRole}
              </span>
            </div>

            <form onSubmit={handlePostEntry} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-mono text-slate-300 mb-1">Auteur connecté</label>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:border-[#f472b6] outline-none" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-300 mb-1">Catégorie</label>
                  <select
                    value={entryCategory}
                    onChange={(e) => setEntryCategory(e.target.value as any)}
                    className="w-full bg-[#1e0a38] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:border-[#f472b6] outline-none cursor-pointer"
                  >
                    <option value="Intervention">Intervention</option>
                    <option value="Panne / Incident">Panne / Incident</option>
                    <option value="Contrôle Qualité">Contrôle Qualité</option>
                    <option value="Modification Site">Modification Site</option>
                    <option value="Note ESG">Note ESG</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-slate-300 mb-1">Site Concerné</label>
                  <select
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="w-full bg-[#1e0a38] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:border-[#f472b6] outline-none cursor-pointer"
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-slate-300 mb-1">Titre de l'information</label>
                <input 
                  type="text" 
                  placeholder="ex: Remplacement d'urgence compresseur CVC..." 
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#f472b6] outline-none" 
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-slate-300 mb-1">Description / Field Observations</label>
                <textarea 
                  rows={3} 
                  placeholder="Technical details, required parts, instructions for team..." 
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#f472b6] outline-none" 
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] hover:from-[#c026d3] hover:to-[#7c3aed] text-white font-bold font-mono text-xs shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publier en Temps Réel sur Firestore</span>
              </button>

            </form>
          </div>

          {/* Card 2: Modify Site Status & Active Failure */}
          <div className="p-6 rounded-3xl bg-[#140826]/90 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-base text-white">Changer Statut Site / Déclarer Panne</h2>
            </div>

            <form onSubmit={handleUpdateSiteStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-slate-300 mb-1">Sélectionner un site</label>
                <select
                  value={editingSiteId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    setEditingSiteId(sid);
                    const s = sites.find(x => x.id === sid);
                    if (s) {
                      setNewStatus(s.status);
                      setActiveFailureText(s.activeFailure || '');
                      setTechAssignedText(s.technicianAssigned || '');
                    }
                  }}
                  className="w-full bg-[#1e0a38] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:border-[#f472b6] outline-none cursor-pointer"
                >
                  <option value="">-- Choisir un site à modifier --</option>
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name} [{s.status.toUpperCase()}]</option>
                  ))}
                </select>
              </div>

              {editingSiteId && (
                <>
                  <div>
                    <label className="block font-mono text-slate-300 mb-1">Nouveau Statut Site</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['operational', 'panne', 'intervention'] as const).map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setNewStatus(st)}
                          className={`py-2 px-2 rounded-xl font-mono text-[11px] font-bold transition-all border cursor-pointer ${
                            newStatus === st
                              ? st === 'panne' ? 'bg-rose-600 border-rose-400 text-white' :
                                st === 'intervention' ? 'bg-amber-500 border-amber-300 text-slate-950' :
                                'bg-emerald-500 border-emerald-300 text-slate-950'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {st === 'operational' ? 'Normal' : st === 'panne' ? 'Panne' : 'Intervention'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-slate-300 mb-1">Avertissement / Description de la Panne</label>
                    <input 
                      type="text" 
                      placeholder="ex: Défaut d'isolement transformateur T2..." 
                      value={activeFailureText}
                      onChange={(e) => setActiveFailureText(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#f472b6] outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-slate-300 mb-1">Technicien Assigné</label>
                    <input 
                      type="text" 
                      placeholder="ex: Antoine Mercier (FieldTech #402)..." 
                      value={techAssignedText}
                      onChange={(e) => setTechAssignedText(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-[#f472b6] outline-none" 
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-mono text-xs shadow-lg transition-all cursor-pointer"
                  >
                    Enregistrer la mise à jour en direct
                  </button>
                </>
              )}
            </form>
          </div>

        </div>

        {/* Right Column: Live Feed & Synced Table (Real-time Stream) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Real-Time Collaborator Stream Feed */}
          <div className="p-6 rounded-3xl bg-[#140826]/90 border border-[#d946ef]/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#f472b6]" />
                <h2 className="font-bold text-base text-white">Flux en Direct des Collaborateurs & Admin</h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {entries.length} Messages Synchros
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {entries.map(item => (
                <div 
                  key={item.id} 
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#f472b6]/50 transition-all space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.authorRole === 'Admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                        item.authorRole === 'Technicien' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      }`}>
                        {item.authorRole}
                      </span>
                      <span className="font-bold text-xs text-white">{item.authorName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#f472b6] bg-[#d946ef]/20 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.siteName && (
                      <span className="text-[10px] font-mono text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.siteName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm text-white">{item.title}</h3>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Real-Time Sites Status Summary Table */}
          <div className="p-6 rounded-3xl bg-[#140826]/90 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-sky-400" />
                <h2 className="font-bold text-base text-white">État Temps Réel des Sites (Firestore)</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {sites.length} Sites Synchronisés
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2.5 px-3">Site</th>
                    <th className="py-2.5 px-3">Ville</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3">Score Santé</th>
                    <th className="py-2.5 px-3">Dernière MaJ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sites.map(s => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">{s.name}</td>
                      <td className="py-3 px-3 text-slate-300">{s.city}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          s.status === 'panne' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                          s.status === 'intervention' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#f472b6]">{s.healthScore}%</td>
                      <td className="py-3 px-3 text-slate-400 text-[10px]">
                        {s.updatedBy ? `${s.updatedBy}` : 'System'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
