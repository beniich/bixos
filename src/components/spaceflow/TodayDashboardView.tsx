import React, { useState } from 'react';
import { PageId } from '../../types';
import { 
  Sparkles, PhoneCall, Mail, Calendar, AlertTriangle, ArrowRight, 
  Search, Bell, Edit3, Video, CheckSquare, TrendingUp, ShieldAlert,
  Clock, Play, ChevronRight, Zap, CheckCircle2, UserCheck
} from 'lucide-react';

interface TodayDashboardViewProps {
  isDarkMode?: boolean;
  setCurrentPage?: (page: PageId) => void;
}

export const TodayDashboardView: React.FC<TodayDashboardViewProps> = ({ setCurrentPage }) => {
  const [startedDay, setStartedDay] = useState(false);
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const toggleAction = (id: string) => {
    setCompletedActions(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen text-[#e8dfee] font-sans relative overflow-x-hidden animate-fade-in p-4 sm:p-6 lg:p-8 space-y-8" style={{ backgroundColor: '#0A0A0B' }}>
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-4 border-b border-[#26262C]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Bonjour, Alex 👋
          </h1>
          <p className="text-sm text-slate-400 font-light mt-1">
            Mercredi 25 Octobre 2026 • Command Center BizOS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentPage && setCurrentPage('inbox_ai')}
            className="w-10 h-10 rounded-full bg-[#131316] border border-[#26262C] hover:border-[#d2bbff] flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
            title="Rechercher"
          >
            <Search className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setCurrentPage && setCurrentPage('inbox_ai')}
            className="w-10 h-10 rounded-full bg-[#131316] border border-[#26262C] hover:border-[#d2bbff] flex items-center justify-center text-slate-300 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          </button>
        </div>
      </header>

      {/* Main Grid: Left Canvas + Right Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Bloc 1: Daily Briefing ("Your day, distilled") */}
          <section className="p-6 rounded-2xl bg-[#131316] border border-[#26262C] shadow-2xl relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#d2bbff] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d2bbff]" />
                <span>Votre journée, distillée par l'IA</span>
              </h2>
              {startedDay && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Journée Lancée</span>
                </span>
              )}
            </div>

            <ul className="space-y-3 text-sm text-slate-200 font-light">
              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-[#03b5d3]/20 text-[#03b5d3] mt-0.5">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span><strong>3 appels stratégiques</strong> aujourd'hui — Enjeu élevé : Viviane à 14:00</span>
              </li>

              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-[#7c3aed]/20 text-[#d2bbff] mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <span><strong>47 nouveaux emails</strong> dans InboxAI — 4 marqués urgents par l'agent</span>
              </li>

              <li className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-[#a15100]/20 text-[#ffb784] mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <span><strong>2 réunions clés</strong> — Préparation du Board à 16:00 (MeetAI actif)</span>
              </li>
            </ul>

            {/* Vital Alert */}
            <div className="p-4 rounded-xl bg-[#a15100]/15 border border-[#a15100]/40 flex items-center gap-3 text-xs text-[#ffe0cd]">
              <AlertTriangle className="w-5 h-5 text-[#ffb784] shrink-0" />
              <p><strong>Alerte VitalAI :</strong> VRC (variabilité cardiaque) basse depuis 3 jours — une marche de 30 min est recommandée avant 15h.</p>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <button
                onClick={() => setStartedDay(true)}
                className="px-6 py-3 rounded-xl bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-bold text-sm cursor-pointer transition-all shadow-[0_0_20px_rgba(210,187,255,0.2)] flex items-center gap-2 hover:scale-[1.02]"
              >
                <span>{startedDay ? "Rapport du matin validé" : "Démarrer la journée"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Bloc 2: Quick Actions */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => setCurrentPage && setCurrentPage('inbox_ai')}
              className="p-4 rounded-2xl bg-[#131316] border border-[#26262C] hover:border-[#d2bbff] transition-all cursor-pointer group flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#1d1a24] group-hover:bg-[#7c3aed]/20 flex items-center justify-center text-slate-300 group-hover:text-[#d2bbff] transition-colors">
                <Edit3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Email IA</span>
            </button>

            <button
              onClick={() => setCurrentPage && setCurrentPage('call_copilot')}
              className="p-4 rounded-2xl bg-[#131316] border border-[#26262C] hover:border-[#03b5d3] transition-all cursor-pointer group flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#1d1a24] group-hover:bg-[#03b5d3]/20 flex items-center justify-center text-slate-300 group-hover:text-[#03b5d3] transition-colors">
                <PhoneCall className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-200">CallCopilot</span>
            </button>

            <button
              onClick={() => setCurrentPage && setCurrentPage('meet_ai')}
              className="p-4 rounded-2xl bg-[#131316] border border-[#26262C] hover:border-[#ffb784] transition-all cursor-pointer group flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#1d1a24] group-hover:bg-[#a15100]/20 flex items-center justify-center text-slate-300 group-hover:text-[#ffb784] transition-colors">
                <Video className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Rejoindre MeetAI</span>
            </button>

            <button
              onClick={() => setCurrentPage && setCurrentPage('exit_ready')}
              className="p-4 rounded-2xl bg-[#131316] border border-[#26262C] hover:border-emerald-400 transition-all cursor-pointer group flex flex-col items-center justify-center gap-2 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-[#1d1a24] group-hover:bg-emerald-500/20 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-200">ExitReady</span>
            </button>
          </section>

          {/* Bloc 3: Metrics Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1: MRR */}
            <div className="p-5 rounded-2xl bg-[#131316] border border-[#26262C] space-y-2">
              <p className="text-xs font-mono uppercase text-slate-400">MRR Mensuel</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold font-mono text-white">$12,400</p>
                <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                  +8% YTD
                </span>
              </div>
              <div className="w-full h-8 bg-[#1A1A1F] rounded overflow-hidden relative">
                <svg className="w-full h-full text-emerald-400 stroke-current stroke-2 fill-none" viewBox="0 0 100 30">
                  <path d="M0,25 L20,20 L40,22 L60,10 L80,15 L100,5" />
                </svg>
              </div>
            </div>

            {/* Card 2: Runway */}
            <div className="p-5 rounded-2xl bg-[#131316] border border-[#26262C] space-y-2">
              <p className="text-xs font-mono uppercase text-slate-400">Runway Trésorerie</p>
              <p className="text-2xl font-bold font-mono text-white">14 mois</p>
              <div className="w-full bg-[#1A1A1F] h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-[#7c3aed] h-full w-[75%]" />
              </div>
            </div>

            {/* Card 3: Vital Energy */}
            <div className="p-5 rounded-2xl bg-[#131316] border border-[#a15100]/40 space-y-2">
              <p className="text-xs font-mono uppercase text-slate-400">Énergie VitalAI</p>
              <p className="text-2xl font-bold font-mono text-[#ffb784]">62<span className="text-xs text-slate-400 font-normal">/100</span></p>
              <div className="w-full bg-[#1A1A1F] h-2 rounded-full overflow-hidden mt-3">
                <div className="bg-[#a15100] h-full w-[62%]" />
              </div>
            </div>

          </section>

        </div>

        {/* Right Column (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Next Event Card */}
          <div className="p-5 rounded-2xl bg-[#131316] border border-[#7c3aed]/40 relative overflow-hidden space-y-3">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#7c3aed]" />
            <p className="text-xs font-bold text-[#d2bbff] font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Dans 45 mins</span>
            </p>
            <h3 className="text-lg font-bold text-white">Board Prep Sync</h3>
            <p className="text-xs text-slate-400">avec Sarah & Investisseurs principaux</p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setCurrentPage && setCurrentPage('meet_ai')}
                className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-200 cursor-pointer"
              >
                Notes
              </button>
              <button
                onClick={() => setCurrentPage && setCurrentPage('meet_ai')}
                className="flex-1 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#8b5cf6] text-xs font-bold text-white cursor-pointer"
              >
                Rejoindre
              </button>
            </div>
          </div>

          {/* AI Actions Feed */}
          <div className="p-5 rounded-2xl bg-[#131316] border border-[#26262C] space-y-4">
            <h3 className="text-xs font-mono uppercase text-slate-400">Actions IA Suggérées</h3>

            <div className="space-y-3">
              <div 
                onClick={() => toggleAction('a1')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  completedActions.includes('a1') 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-400 line-through' 
                    : 'bg-white/5 border-white/10 hover:border-[#7c3aed]/50 text-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${completedActions.includes('a1') ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div>
                    <p className="text-xs font-bold">Répondre à Marc</p>
                    <p className="text-[11px] text-slate-400 font-light">Brouillon rédigé pour la projection Q3.</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => toggleAction('a2')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  completedActions.includes('a2') 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-400 line-through' 
                    : 'bg-white/5 border-white/10 hover:border-[#03b5d3]/50 text-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${completedActions.includes('a2') ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div>
                    <p className="text-xs font-bold">Préparer le Board Deck</p>
                    <p className="text-[11px] text-slate-400 font-light">Compilation des métriques MRR et Runway.</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => toggleAction('a3')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  completedActions.includes('a3') 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-400 line-through' 
                    : 'bg-white/5 border-white/10 hover:border-[#ffb784]/50 text-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${completedActions.includes('a3') ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div>
                    <p className="text-xs font-bold">Bloquer la plage Focus</p>
                    <p className="text-[11px] text-slate-400 font-light">Programmer 2 heures de travail profond à 15h.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schema & Architecture Link Widget */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1d1a24] to-[#131316] border border-white/10 text-center space-y-3">
            <Zap className="w-6 h-6 text-[#d2bbff] mx-auto" />
            <h4 className="text-sm font-bold text-white">Le Schéma Interactif BizOS</h4>
            <p className="text-xs text-slate-400 font-light">Explorez la topologie d'intégration et les flux télémétriques entre les 5 modules.</p>
            <button
              onClick={() => setCurrentPage && setCurrentPage('schema')}
              className="w-full py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#8b5cf6] text-white text-xs font-bold cursor-pointer transition-all"
            >
              Ouvrir la Topologie Nexus
            </button>
          </div>

        </aside>

      </div>

    </div>
  );
};
