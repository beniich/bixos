import React, { useState } from 'react';
import { PageId } from '../../types';
import { 
  TrendingUp, ShieldCheck, DollarSign, Sliders, FileText, Download, 
  ArrowRight, Sparkles, Building2, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, Lock
} from 'lucide-react';

interface ExitReadyViewProps {
  isDarkMode?: boolean;
  setCurrentPage?: (page: PageId) => void;
}

export const ExitReadyView: React.FC<ExitReadyViewProps> = ({ setCurrentPage }) => {
  const [ebitdaMultiple, setEbitdaMultiple] = useState<number>(12.5);
  const [growthRate, setGrowthRate] = useState<number>(25);
  const [activeTab, setActiveTab] = useState<'6M' | '12M'>('12M');
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);

  // Dynamic Valuation calculation based on sliders
  const baseArr = 2.0; // $2M ARR
  const projectedValuation = (baseArr * (1 + growthRate / 100) * ebitdaMultiple).toFixed(1);

  const handleGenerateDoc = (docType: string) => {
    setGeneratedDoc(`Le document "${docType}" a été généré avec succès avec les métriques actuelles ($${projectedValuation}M) !`);
    setTimeout(() => setGeneratedDoc(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in border border-white/10 rounded-3xl my-2 shadow-2xl relative overflow-hidden">
      
      {/* Background Ambient Lights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#7c3aed]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
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
              <span>ExitReady Valuation</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold">
                M&A Ready
              </span>
            </h1>
            <p className="text-sm text-slate-400 font-light mt-1">
              Modélisation en temps réel de la valorisation d'entreprise et simulateur de scénarios d'exit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleGenerateDoc('CIM Executive Memorandum')}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Générer le CIM Memo</span>
          </button>
        </div>
      </header>

      {generatedDoc && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{generatedDoc}</span>
          </div>
          <button onClick={() => setGeneratedDoc(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {/* Grid Row 1: Key Valuation Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live Enterprise Value (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#161b22] border border-white/10 space-y-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Valorisation d'Entreprise Estimée</span>
              <div className="text-4xl font-extrabold text-white font-mono mt-1">${projectedValuation}M</div>
              <p className="text-xs text-emerald-400 font-mono mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+16.9% YTD par rapport au baseline $21.2M</span>
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
              {(['6M', '12M'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg transition-all font-mono text-xs cursor-pointer ${
                    activeTab === tab ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Line Chart Graphic */}
          <div className="h-40 w-full pt-4 relative">
            <svg className="w-full h-full text-emerald-400 stroke-current stroke-2 fill-none overflow-visible" viewBox="0 0 400 100">
              <defs>
                <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,80 Q50,70 100,60 T200,45 T300,25 T400,10" />
              <path d="M0,80 Q50,70 100,60 T200,45 T300,25 T400,10 V100 H0 Z" fill="url(#valGrad)" stroke="none" />
              <circle cx="400" cy="10" r="5" fill="#10b981" className="animate-ping" />
              <circle cx="400" cy="10" r="4" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* Exit Readiness Score (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#161b22] border border-white/10 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-bold text-white">Score de Préparation à l'Exit</h3>
              <p className="text-xs text-slate-400">Audit de due-diligence automatisé</p>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="flex items-center justify-center gap-6 my-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                <circle cx="56" cy="56" r="48" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="301" strokeDashoffset="45" strokeLinecap="round" />
              </svg>
              <span className="absolute text-2xl font-extrabold text-white font-mono">85<span className="text-xs font-normal text-slate-400">/100</span></span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Santé Financière</span>
                <div className="w-32 bg-white/10 h-2 rounded-full overflow-hidden mt-1">
                  <div className="bg-emerald-400 h-full w-[92%]" />
                </div>
              </div>
              <div>
                <span className="text-slate-400">Position Marché</span>
                <div className="w-32 bg-white/10 h-2 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#7c3aed] h-full w-[78%]" />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-light text-center">
            Prêt pour due diligence. Débloquez les offres LOI fermes en atteignant 90+.
          </p>
        </div>

      </div>

      {/* Grid Row 2: What-If Simulator + Auto Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Simulator Sliders (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#161b22] border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>Simulateur de Scénarios "What-If"</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
              Dynamique
            </span>
          </div>

          <div className="space-y-5">
            {/* Multiple Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Multiple d'EBITDA</span>
                <span className="font-mono text-emerald-400">{ebitdaMultiple}x</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="20" 
                step="0.5"
                value={ebitdaMultiple}
                onChange={(e) => setEbitdaMultiple(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-white/10 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>5x (Standard)</span>
                <span>12.5x (Moyenne SaaS)</span>
                <span>20x (Licorne)</span>
              </div>
            </div>

            {/* Growth Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Croissance Chiffre d'Affaires (+%)</span>
                <span className="font-mono text-emerald-400">+{growthRate}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={growthRate}
                onChange={(e) => setGrowthRate(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-white/10 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100% ARR Boost</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <span className="text-xs font-bold text-white">Valorisation Projetée selon ces paramètres :</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">${projectedValuation}M</span>
          </div>
        </div>

        {/* Auto Documents (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#161b22] border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#7c3aed]" />
            <span>Documents M&A Auto-Générés</span>
          </h3>

          <div className="space-y-3">
            <button 
              onClick={() => handleGenerateDoc('Lettre d\'Intention LOI')}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 flex items-center justify-between text-left cursor-pointer transition-all group"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-400">Lettre d'Intention (LOI)</div>
                <div className="text-[11px] text-slate-400">Préalable d'acquisition rédigé par l'agent</div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
            </button>

            <button 
              onClick={() => handleGenerateDoc('Term Sheet M&A')}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 flex items-center justify-between text-left cursor-pointer transition-all group"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-400">Term Sheet Standardisé</div>
                <div className="text-[11px] text-slate-400">Clauses de valorisation & d'earn-out</div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
            </button>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 opacity-60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Checklist Due Diligence Complète</span>
                </div>
                <div className="text-[11px] text-slate-400">Débloqué lorsque le score ExitReady atteint 90+</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Target Acquirers Section */}
      <div className="p-6 rounded-2xl bg-[#161b22] border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          <span>Acquéreurs Stratégiques Compatibles</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-bold text-sm text-white">Marketfoo</span>
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">92% Match</span>
            </div>
            <p className="text-xs text-slate-400">Récemment levé $50M Series C, recherche une synergie produit en Europe.</p>
            <button className="w-full py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold cursor-pointer hover:bg-emerald-500/20 transition-all">
              Mise en relation Conseiller
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-bold text-sm text-white">SalesCore</span>
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">85% Match</span>
            </div>
            <p className="text-xs text-slate-400">Leader CRM US visant l'intégration de la couche IA de BizOS.</p>
            <button className="w-full py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold cursor-pointer hover:bg-emerald-500/20 transition-all">
              Mise en relation Conseiller
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-bold text-sm text-white">Nexus Tech</span>
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">78% Match</span>
            </div>
            <p className="text-xs text-slate-400">Conglomérat Enterprise Software étudiant les opportunités M&A Q4.</p>
            <button className="w-full py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold cursor-pointer hover:bg-emerald-500/20 transition-all">
              Mise en relation Conseiller
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
