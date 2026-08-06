import React, { useState } from 'react';
import { PageId } from '../../types';
import { ASSET_IMAGES } from '../../data/assets';
import { useLanguageContext } from '../../context/LanguageContext';
import { 
  Sparkles, ArrowRight, Play, Home, Mail, Video, TrendingUp, Plane, 
  X, PhoneCall, ShieldCheck, CheckCircle2, Zap, BarChart3, Bot, Send, Volume2
} from 'lucide-react';

interface PublicHomePageProps {
  isDarkMode: boolean;
  setCurrentPage: (page: PageId) => void;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({ setCurrentPage }) => {
  const { t } = useLanguageContext();

  // Modals state
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showCallCopilotModal, setShowCallCopilotModal] = useState(false);
  const [showExitReadyModal, setShowExitReadyModal] = useState(false);

  // CallCopilot interactive state
  const [callActive, setCallActive] = useState(false);
  const [callTranscript, setCallTranscript] = useState<string[]>([
    "CallCopilot AI active...",
    "Tone detection: Confident & Positive (Score 96%)",
    "AI Suggestion: Offer the 30-day free trial"
  ]);

  const handleSimulateCallAction = () => {
    setCallActive(true);
    setTimeout(() => {
      setCallTranscript(prev => [
        ...prev,
        "Live Analysis: Caller asks about GDPR compliance.",
        "AI SUGGESTED RESPONSE: 'All BizOS data is stored in ISO 27001 sovereign clusters.'"
      ]);
    }, 1500);
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans relative overflow-x-hidden animate-fade-in pb-16" style={{ backgroundColor: '#0e051e' }}>
      
      {/* Background Cyber-Nexus Light Rays / Neon Purple Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#d946ef]/25 via-[#8b5cf6]/15 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-[#d946ef]/10 rounded-full blur-[140px]" />
        <div className="absolute top-2/3 -right-40 w-[600px] h-[600px] bg-[#8b5cf6]/15 rounded-full blur-[140px]" />
        
        {/* Curving neon line SVG overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100,200 C300,50 800,400 1600,100" stroke="#d946ef" strokeWidth="2" fill="none" className="animate-pulse" />
          <path d="M-100,400 C400,600 900,200 1800,500" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
          <path d="M-100,700 C500,300 1100,800 1900,300" stroke="#f472b6" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-16">
        
        {/* Hero Section matching exact screenshot 1 layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-6">
          
          {/* Left Text Block */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e0a38]/80 border border-[#d946ef]/40 text-[11px] font-mono text-[#f472b6] shadow-[0_0_15px_rgba(217,70,239,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#f472b6] animate-ping" />
              <span className="tracking-widest uppercase">{t('heroBadge')}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              {t('heroTitlePrefix')}<span className="bg-gradient-to-r from-[#f472b6] via-[#d946ef] to-[#fb923c] bg-clip-text text-transparent">{t('heroTitleHighlight')}</span>{t('heroTitleSuffix')}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-xl">
              {t('heroSubtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setCurrentPage('pricing')}
                className="px-7 py-3.5 rounded-2xl text-sm font-bold text-slate-950 bg-gradient-to-r from-[#f472b6] via-[#d946ef] to-[#fb923c] hover:opacity-95 transition-all cursor-pointer shadow-[0_0_25px_rgba(244,114,182,0.4)] flex items-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <span>{t('heroTryFree')}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={() => setShowDemoModal(true)}
                className="px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-[#1a0c33]/80 border border-white/20 hover:border-[#f472b6] hover:bg-white/10 transition-all cursor-pointer flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center text-white text-[10px]">
                  <Play className="w-2.5 h-2.5 fill-white translate-x-0.5" />
                </div>
                <span>{t('heroWatchDemo')}</span>
              </button>
            </div>

          </div>

          {/* Right Hero Graphic */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <div 
              onClick={() => setShowDemoModal(true)}
              className="relative w-full max-w-xl group cursor-pointer"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#d946ef] to-[#8b5cf6] rounded-3xl blur-xl opacity-40 group-hover:opacity-75 transition-opacity" />
              
              <div className="relative rounded-3xl bg-[#140826] p-2 border border-[#d946ef]/50 shadow-[0_0_50px_rgba(217,70,239,0.3)] overflow-hidden">
                <img
                  src={ASSET_IMAGES.bizosCurvedDashboard}
                  alt="BizOS Curved Dashboard Interface"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto rounded-2xl object-cover transform transition-transform duration-700 group-hover:scale-[1.02]"
                />
                
                {/* Floating HUD Telemetry Badge */}
                <div className="absolute bottom-4 right-4 px-3.5 py-2 rounded-xl bg-[#120826]/90 border border-[#f472b6]/60 backdrop-blur-md shadow-lg flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white font-bold">Cyber-Nexus 100% Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Section: Feature cards */}
        <section className="space-y-8 pt-12 border-t border-white/10">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('modulesTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              {t('modulesSubtitle')}
            </p>
          </div>

          {/* 5 Cards Grid for GMAO modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Assets */}
            <div 
              onClick={() => setCurrentPage('members')}
              className="p-5 rounded-2xl bg-[#140826]/80 border border-[#d946ef]/25 hover:border-[#f472b6] transition-all cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-[0_0_25px_rgba(217,70,239,0.2)] hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[#1f0b38] border border-[#d946ef]/40 flex items-center justify-center text-[#f472b6] group-hover:scale-110 transition-transform">
                  <Home className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#f472b6] transition-colors">
                  {t('cardAssetsTitle')}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  {t('cardAssetsDesc')}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-1 text-[11px] font-bold text-[#f472b6] group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                <span>{t('cardAssetsBtn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Work Orders */}
            <div 
              onClick={() => setCurrentPage('bookings')}
              className="p-5 rounded-2xl bg-[#140826]/80 border border-[#d946ef]/25 hover:border-[#f472b6] transition-all cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-[0_0_25px_rgba(217,70,239,0.2)] hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[#1f0b38] border border-[#d946ef]/40 flex items-center justify-center text-[#f472b6] group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#f472b6] transition-colors">
                  {t('cardWorkOrdersTitle')}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  {t('cardWorkOrdersDesc')}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-[#f472b6] transition-colors">
                <span>{t('cardWorkOrdersBtn')}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Card 3: AI Predictions */}
            <div 
              onClick={() => setCurrentPage('analytics')}
              className="p-5 rounded-2xl bg-[#140826]/80 border border-[#d946ef]/25 hover:border-[#f472b6] transition-all cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-[0_0_25px_rgba(217,70,239,0.2)] hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[#1f0b38] border border-[#d946ef]/40 flex items-center justify-center text-[#f472b6] group-hover:scale-110 transition-transform">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#f472b6] transition-colors">
                  {t('cardAiTitle')}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  {t('cardAiDesc')}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-[#f472b6] transition-colors">
                <span>{t('cardAiBtn')}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Card 4: Mobile PWA */}
            <div 
              onClick={() => setCurrentPage('mobile_pwa')}
              className="p-5 rounded-2xl bg-[#140826]/80 border border-[#d946ef]/25 hover:border-[#f472b6] transition-all cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-[0_0_25px_rgba(217,70,239,0.2)] hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[#1f0b38] border border-[#d946ef]/40 flex items-center justify-center text-[#f472b6] group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#f472b6] transition-colors">
                  {t('cardMobileTitle')}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  {t('cardMobileDesc')}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-[#f472b6] transition-colors">
                <span>{t('cardMobileBtn')}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Card 5: IoT Telemetry */}
            <div 
              onClick={() => setCurrentPage('visitors')}
              className="p-5 rounded-2xl bg-[#140826]/80 border border-[#d946ef]/25 hover:border-[#f472b6] transition-all cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-[0_0_25px_rgba(217,70,239,0.2)] hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-[#1f0b38] border border-[#d946ef]/40 flex items-center justify-center text-[#f472b6] group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#f472b6] transition-colors">
                  {t('cardTelemetryTitle')}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  {t('cardTelemetryDesc')}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-[#f472b6] transition-colors">
                <span>{t('cardTelemetryBtn')}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* Demo Interactive Holographic Cockpit Modal featuring Image 2 */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-[#120826] border border-[#d946ef]/60 p-6 shadow-2xl space-y-4 animate-fade-in relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#f472b6]" />
                <h3 className="font-bold text-white text-lg">Cockpit Exécutif Holographique BizOS</h3>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image 2 Display Asset */}
            <div className="relative rounded-2xl overflow-hidden border border-[#d946ef]/40 shadow-2xl">
              <img
                src={ASSET_IMAGES.bizosExecutiveHud}
                alt="Executive BizOS Holographic HUD Cockpit"
                referrerPolicy="no-referrer"
                className="w-full h-[400px] object-cover object-center"
              />

              {/* Overlay HUD Controls */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#120826]/90 border border-[#f472b6]/50 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-white font-mono font-bold">Système BizOS Cyber-Nexus : Opérationnel</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowDemoModal(false); setCurrentPage('meet_ai'); }}
                    className="px-4 py-2 rounded-xl bg-[#d946ef] text-white font-bold cursor-pointer hover:bg-[#e056f7]"
                  >
                    Lancer MeetAI Mobile
                  </button>
                  <button
                    onClick={() => { setShowDemoModal(false); setCurrentPage('inbox_ai'); }}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold cursor-pointer hover:bg-white/20"
                  >
                    Ouvrir InboxAI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CallCopilot Interactive Modal */}
      {showCallCopilotModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#140826] border border-[#d946ef]/60 p-6 shadow-2xl space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#d946ef] flex items-center justify-center text-white">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">CallCopilot IA</h3>
                  <p className="text-xs text-slate-400">Assistance vocale & analyse de sentiment en direct</p>
                </div>
              </div>
              <button
                onClick={() => setShowCallCopilotModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Call Simulator Box */}
            <div className="p-4 rounded-2xl bg-[#1b0a33] border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[#f472b6]">
                <span className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>{callActive ? "Appel Stratégique en Cours..." : "Prêt à démarrer l'appel"}</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">IA Active</span>
              </div>

              <div className="h-40 overflow-y-auto space-y-2 p-2 bg-black/30 rounded-xl text-slate-300">
                {callTranscript.map((line, idx) => (
                  <p key={idx} className="text-[11px] leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>

              <button
                onClick={handleSimulateCallAction}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#f472b6] to-[#d946ef] text-white font-bold text-xs cursor-pointer hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Simuler une question client & suggestion IA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ExitReady Interactive Modal */}
      {showExitReadyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#140826] border border-[#d946ef]/60 p-6 shadow-2xl space-y-4 animate-fade-in relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#d946ef] flex items-center justify-center text-white">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">ExitReady M&A Data Room</h3>
                  <p className="text-xs text-slate-400">Préparation à la valorisation & Data Room Virtuelle</p>
                </div>
              </div>
              <button
                onClick={() => setShowExitReadyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#1b0a33] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Score de Préparation Audit :</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm">94/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="w-[94%] h-full bg-gradient-to-r from-emerald-500 to-[#d946ef]" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs">Documents Générés Automatiquement :</h4>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span>1. Bilans Financiers Q1-Q3.pdf</span>
                  <span className="text-emerald-400 font-mono text-[10px]">Prêt</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span>2. Registre des brevets et propriété intellectuelle.pdf</span>
                  <span className="text-emerald-400 font-mono text-[10px]">Prêt</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span>3. Conformité RGPD & ISO 27001.pdf</span>
                  <span className="text-emerald-400 font-mono text-[10px]">Prêt</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowExitReadyModal(false)}
                  className="w-full py-2.5 rounded-xl bg-[#d946ef] text-white font-bold cursor-pointer hover:bg-[#e056f7]"
                >
                  Exporter la Data Room Complète (.ZIP)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
