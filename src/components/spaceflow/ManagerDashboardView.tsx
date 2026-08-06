import React, { useState } from 'react';
import { PageId } from '../../types';
import { 
  Building2, Box, Leaf, Cpu, Smartphone, BarChart3, ShieldCheck, Zap, ArrowRight, Bell, Calendar, Activity, Sparkles
} from 'lucide-react';
import { BimDigitalTwinViewer } from './BimDigitalTwinViewer';
import { EnergyEsgCopilot } from './EnergyEsgCopilot';
import { PredictiveMaintenanceAi } from './PredictiveMaintenanceAi';
import { FieldTechMobileView } from './FieldTechMobileView';

interface ManagerDashboardViewProps {
  onNavigate?: (page: PageId) => void;
  isDarkMode?: boolean;
}

export const ManagerDashboardView: React.FC<ManagerDashboardViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bim' | 'energy' | 'predictive' | 'field'>('overview');

  return (
    <div className="relative min-h-screen p-4 sm:p-6 lg:p-8 font-sans text-white animate-fade-in space-y-8">
      
      {/* Executive Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#d946ef]/20">
        <div>
          <div className="flex items-center gap-2 text-[#f472b6] font-mono text-xs tracking-widest uppercase mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>FIELDTECH & BIZOS UNIFIED DASHBOARD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight">
            Tableau de Bord <span className="bizos-title-pink text-[#f472b6] drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]">FieldTech OS</span>
          </h1>
          <p className="text-sm text-slate-300 mt-1 font-light">
            Supervision 360° du bâtiment : BIM 3D, Décret BACS, Inférence Prédictive & Mobilité Terrain.
          </p>
        </div>

        {/* Header Quick Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#140826]/90 border border-[#d946ef]/30 px-4 py-2 rounded-2xl text-xs font-mono text-white flex items-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Serveur Cloud SQL & IoT Actifs</span>
          </div>

          <div className="bg-[#140826]/90 border border-[#d946ef]/30 px-4 py-2 rounded-2xl text-xs font-mono text-slate-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#f472b6]" />
            <span>Aujourd'hui, 05 Août 2026</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs for the 5 Module Prototypes */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 text-xs font-medium no-scrollbar">
        
        {/* Tab 1: Overview */}
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 rounded-2xl transition-all cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#d946ef]/30 text-white border border-[#f472b6] font-semibold shadow-[0_0_15px_rgba(217,70,239,0.3)]'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#f472b6]" />
          <span>Vue d'Ensemble</span>
        </button>

        {/* Tab 2: BIM 3D */}
        <button
          onClick={() => setActiveTab('bim')}
          className={`px-4 py-3 rounded-2xl transition-all cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${
            activeTab === 'bim'
              ? 'bg-[#d946ef]/30 text-white border border-[#f472b6] font-semibold shadow-[0_0_15px_rgba(217,70,239,0.3)]'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Box className="w-4 h-4 text-[#f472b6]" />
          <span>Visionneuse BIM 3D & Jumeau</span>
        </button>

        {/* Tab 3: Energy ESG */}
        <button
          onClick={() => setActiveTab('energy')}
          className={`px-4 py-3 rounded-2xl transition-all cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${
            activeTab === 'energy'
              ? 'bg-[#d946ef]/30 text-white border border-[#f472b6] font-semibold shadow-[0_0_15px_rgba(217,70,239,0.3)]'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Leaf className="w-4 h-4 text-emerald-400" />
          <span>Analyse Énergétique ESG</span>
        </button>

        {/* Tab 4: Predictive AI */}
        <button
          onClick={() => setActiveTab('predictive')}
          className={`px-4 py-3 rounded-2xl transition-all cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${
            activeTab === 'predictive'
              ? 'bg-[#d946ef]/30 text-white border border-[#f472b6] font-semibold shadow-[0_0_15px_rgba(217,70,239,0.3)]'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4 text-amber-400" />
          <span>Maintenance Prédictive IA</span>
        </button>

        {/* Tab 5: FieldTech Mobile */}
        <button
          onClick={() => setActiveTab('field')}
          className={`px-4 py-3 rounded-2xl transition-all cursor-pointer flex items-center gap-2.5 whitespace-nowrap ${
            activeTab === 'field'
              ? 'bg-[#d946ef]/30 text-white border border-[#f472b6] font-semibold shadow-[0_0_15px_rgba(217,70,239,0.3)]'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4 text-[#f472b6]" />
          <span>FieldTech Mobile & Offline</span>
        </button>

      </div>

      {/* Render Active Module */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-2">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Disponibilité Équipements</span>
                <Activity className="w-4 h-4 text-[#f472b6]" />
              </div>
              <div className="text-3xl font-bold font-mono text-white">99.4%</div>
              <div className="text-[10px] text-emerald-400 font-medium">SLA Respecté (+0.8%)</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-2">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Consommation vs Objectif</span>
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-emerald-400">-18.4%</div>
              <div className="text-[10px] text-slate-400">Période Référence Operat</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-2">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>BIM IFC Models loaded</span>
                <Box className="w-4 h-4 text-[#f472b6]" />
              </div>
              <div className="text-3xl font-bold font-mono text-white">12,480</div>
              <div className="text-[10px] text-slate-400">Éléments 3D Maillés</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-2">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>OT Clôturés ce Mois</span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-bold font-mono text-white">142 / 148</div>
              <div className="text-[10px] text-amber-400 font-medium">6 En cours sur le terrain</div>
            </div>

          </div>

          {/* Core Feature Shortcuts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Shortcut 1: BIM 3D */}
            <div 
              onClick={() => setActiveTab('bim')}
              className="p-6 rounded-2xl bg-[#130826] border border-[#d946ef]/30 hover:border-[#f472b6] transition-all cursor-pointer space-y-4 group shadow-[0_0_20px_rgba(217,70,239,0.1)] hover:shadow-[0_0_30px_rgba(217,70,239,0.2)]"
            >
              <div className="p-3 rounded-2xl bg-[#d946ef]/20 text-[#f472b6] w-fit group-hover:scale-110 transition-transform">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#f472b6] transition-colors flex items-center justify-between">
                  <span>Visionneuse BIM 3D</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Naviguez dans le modèle IFC 4.3 de la tour, superposez la carte thermique des capteurs et inspectez les sous-systèmes CVC.
                </p>
              </div>
            </div>

            {/* Shortcut 2: Energy ESG */}
            <div 
              onClick={() => setActiveTab('energy')}
              className="p-6 rounded-2xl bg-[#130826] border border-[#d946ef]/30 hover:border-[#f472b6] transition-all cursor-pointer space-y-4 group shadow-[0_0_20px_rgba(217,70,239,0.1)] hover:shadow-[0_0_30px_rgba(217,70,239,0.2)]"
            >
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 w-fit group-hover:scale-110 transition-transform">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#f472b6] transition-colors flex items-center justify-between">
                  <span>Analyse Énergétique ESG</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Conformité Décret BACS & Operat, télé-relevé Linky et simulateur de ROI pour la rénovation énergétique.
                </p>
              </div>
            </div>

            {/* Shortcut 3: Predictive AI */}
            <div 
              onClick={() => setActiveTab('predictive')}
              className="p-6 rounded-2xl bg-[#130826] border border-[#d946ef]/30 hover:border-[#f472b6] transition-all cursor-pointer space-y-4 group shadow-[0_0_20px_rgba(217,70,239,0.1)] hover:shadow-[0_0_30px_rgba(217,70,239,0.2)]"
            >
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 w-fit group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#f472b6] transition-colors flex items-center justify-between">
                  <span>Maintenance Prédictive IA</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Health Index 92.4/100, détection précoce d'anomalies vibratoires et assistant IA conversationnel.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTab === 'bim' && <BimDigitalTwinViewer />}
      {activeTab === 'energy' && <EnergyEsgCopilot />}
      {activeTab === 'predictive' && <PredictiveMaintenanceAi />}
      {activeTab === 'field' && <FieldTechMobileView />}

    </div>
  );
};
