import React, { useState } from 'react';
import { PageId } from '../../types';
import { 
  PhoneCall, Sparkles, Mic, MicOff, Video, ShieldAlert, Zap, 
  MessageSquare, CheckCircle2, Play, User, ArrowLeft, RefreshCw, Layers
} from 'lucide-react';

interface CallCopilotViewProps {
  isDarkMode?: boolean;
  setCurrentPage?: (page: PageId) => void;
}

export const CallCopilotView: React.FC<CallCopilotViewProps> = ({ setCurrentPage }) => {
  const [callActive, setCallActive] = useState(false);
  const [activeObjection, setActiveObjection] = useState<string | null>("Prix trop élevé par rapport à la concurrence");
  const [crmLogged, setCrmLogged] = useState(false);

  const handleSimulateObjection = (type: string) => {
    if (type === 'price') {
      setActiveObjection("Prix trop élevé : Le prospect hésite sur l'engagement annuel.");
    } else if (type === 'security') {
      setActiveObjection("Conformité & RGPD : Le prospect demande des garanties sur l'hébergement des données.");
    } else if (type === 'integration') {
      setActiveObjection("Délai d'intégration : Crainte d'un temps de migration trop long (> 2 semaines).");
    }
  };

  const handleLogCrm = () => {
    setCrmLogged(true);
    setTimeout(() => setCrmLogged(false), 3500);
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#e1e3e8] font-sans p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in border border-white/10 rounded-3xl my-2 shadow-2xl relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-96 bg-[#03b5d3]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          {setCurrentPage && (
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>CallCopilot</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#03b5d3]/20 border border-[#03b5d3]/40 text-[#03b5d3] font-mono font-bold">
                Real-Time AI Whisperer
              </span>
            </h1>
            <p className="text-sm text-slate-400 font-light mt-1">
              Gagnez plus de deals grâce à un coach commercial IA en direct pendant vos appels.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setCallActive(!callActive)}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-2 shadow-lg ${
            callActive 
              ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse' 
              : 'bg-[#03b5d3] hover:bg-[#0298b2] text-slate-950 shadow-[0_0_20px_rgba(3,181,211,0.3)]'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>{callActive ? 'Terminer l\'Appel en Direct' : 'Démarrer la Démo d\'Appel'}</span>
        </button>
      </header>

      {/* Simulator Interface: Video Stream + Live Copilot Whispers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Live Video Call Area (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#14181f] border border-white/10 p-6 flex flex-col justify-between h-[500px] relative overflow-hidden">
          
          {/* Status Badge */}
          <div className="flex justify-between items-center z-10">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs">
              <span className={`w-2 h-2 rounded-full ${callActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="font-mono text-white">{callActive ? 'EN DIRECT : Marc (CEO Prospect)' : 'PROSPECT EN ATTENTE'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">00:14:22</span>
            </div>
          </div>

          {/* Video Placeholder Content */}
          <div className="my-auto text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#03b5d3] to-[#7c3aed] p-1 mx-auto shadow-[0_0_30px_rgba(3,181,211,0.4)]">
              <div className="w-full h-full rounded-full bg-[#14181f] flex items-center justify-center text-3xl font-bold text-white">
                M
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Marc Vernet</h3>
              <p className="text-xs text-slate-400">CEO @ Nexus Software Solutions</p>
            </div>

            {/* Live Audio Waves animation */}
            <div className="flex items-center justify-center gap-1 h-8">
              {[40, 70, 30, 90, 50, 80, 20, 60, 100, 40].map((h, i) => (
                <div 
                  key={i} 
                  className="w-1.5 bg-[#03b5d3] rounded-full transition-all duration-300"
                  style={{ height: callActive ? `${h}%` : '20%' }}
                />
              ))}
            </div>
          </div>

          {/* Call Control Toolbar */}
          <div className="flex items-center justify-center gap-4 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 z-10">
            <button className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <button className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
              <Video className="w-4 h-4" />
            </button>
            <button 
              onClick={handleLogCrm}
              className="px-4 py-2 rounded-xl bg-[#03b5d3]/20 border border-[#03b5d3]/40 text-[#03b5d3] text-xs font-bold hover:bg-[#03b5d3]/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Loguer dans le CRM</span>
            </button>
          </div>

        </div>

        {/* Right: AI Copilot Whispers & Battlecards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card 1: Active Objection Alert */}
          <div className="p-5 rounded-2xl bg-[#1a202c] border border-[#03b5d3]/40 space-y-3 relative overflow-hidden shadow-[0_0_25px_rgba(3,181,211,0.15)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#03b5d3] flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Objection Détectée par l'IA</span>
              </h3>
              <span className="text-[10px] font-mono bg-[#03b5d3]/20 text-[#03b5d3] px-2 py-0.5 rounded-full font-bold">
                Temps réel
              </span>
            </div>

            <p className="text-xs font-semibold text-white bg-black/40 p-3 rounded-xl border border-white/10">
              {activeObjection}
            </p>

            <div className="space-y-2">
              <h4 className="text-[11px] font-mono text-slate-400 uppercase">Réponse Recommandée (Argumentaire ROI)</h4>
              <p className="text-xs text-slate-200 leading-relaxed font-light p-3 rounded-xl bg-[#03b5d3]/10 border border-[#03b5d3]/20">
                "Marc, je comprends tout à fait. Nos clients observent un retour sur investissement complet dès le 2ème mois grâce à la réduction de 40% des tâches manuelles de saisie."
              </p>
            </div>
          </div>

          {/* Simulation Trigger Buttons */}
          <div className="p-4 rounded-2xl bg-[#14181f] border border-white/10 space-y-3">
            <h4 className="text-xs font-mono text-slate-400 uppercase">Tester le Coach IA (Simulations)</h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button 
                onClick={() => handleSimulateObjection('price')}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#03b5d3]/50 text-[11px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                Objection Prix
              </button>
              <button 
                onClick={() => handleSimulateObjection('security')}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#03b5d3]/50 text-[11px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                Objection RGPD
              </button>
              <button 
                onClick={() => handleSimulateObjection('integration')}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#03b5d3]/50 text-[11px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                Délai Migration
              </button>
            </div>
          </div>

          {crmLogged && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Compte-rendu et objections automatiquement synchronisés dans Salesforce / HubSpot !</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
