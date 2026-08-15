import React, { useState } from 'react';
import { PageId } from '../../types';
import { 
  Zap, Cpu, Database, Activity, ArrowLeft, RefreshCw, 
  DollarSign, Users, Package, BarChart3, MessageSquare, CheckCircle2
} from 'lucide-react';

interface SchemaViewProps {
  isDarkMode?: boolean;
  setCurrentPage?: (page: PageId) => void;
}

interface ModuleNode {
  id: string;
  label: string;
  category: string;
  status: 'ONLINE' | 'ACTIVE' | 'SYNCING';
  metric: string;
  color: string;
  x: number; // percentage
  y: number; // percentage
  description: string;
}

const NODES: ModuleNode[] = [
  {
    id: 'finance',
    label: 'FINANCE',
    category: 'Comptabilité & MRR',
    status: 'ONLINE',
    metric: '$12,400 MRR Sync',
    color: '#10b981',
    x: 20,
    y: 25,
    description: 'Gestion automatisée de la facturation Stripe, paiements récurrents et prévisions de trésorerie.'
  },
  {
    id: 'crm',
    label: 'CRM',
    category: 'Pipeline & Deals',
    status: 'ACTIVE',
    metric: '142 Deals Actifs',
    color: '#03b5d3',
    x: 80,
    y: 25,
    description: 'Synchronisation bidirectionnelle avec HubSpot/Salesforce et enregistrement automatique par CallCopilot.'
  },
  {
    id: 'analytics',
    label: 'ANALYTICS',
    category: 'ExitReady & Bi',
    status: 'ONLINE',
    metric: '$24.8M Val. Real-Time',
    color: '#da70d6',
    x: 20,
    y: 75,
    description: 'Calculateur de valorisation d\'entreprise en direct et préparation de dossiers d\'acquisitions.'
  },
  {
    id: 'support',
    label: 'COMMUNICATIONS',
    category: 'InboxAI & MeetAI',
    status: 'SYNCING',
    metric: '47 Emails • 3 Calls',
    color: '#ffb95a',
    x: 80,
    y: 75,
    description: 'Centralisation omnicanale des échanges (Slack, Teams, Email, Téléphone) avec résumés intelligents.'
  },
  {
    id: 'inventory',
    label: 'INVENTAIRE & ESPACES',
    category: 'Coworking & Ressources',
    status: 'ONLINE',
    metric: '94% Taux d\'Occupation',
    color: '#a78bfa',
    x: 50,
    y: 15,
    description: 'Gestion en temps réel des accès badges, bureaux réservés et capteurs IoT d\'occupation.'
  }
];

export const SchemaView: React.FC<SchemaViewProps> = ({ setCurrentPage }) => {
  const [selectedNode, setSelectedNode] = useState<ModuleNode>(NODES[0]);

  return (
    <div className="min-h-screen bg-[#090b0e] text-[#e1e4e8] font-sans p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in border border-white/10 rounded-3xl my-2 shadow-2xl relative overflow-hidden">
      
      {/* Background Micro Circuit Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#202632_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
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
              <span>Le Schéma Interactif</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#da70d6]/20 border border-[#da70d6]/40 text-[#ffaaf7] font-mono font-bold">
                BizOS Topology
              </span>
            </h1>
            <p className="text-sm text-slate-400 font-light mt-1">
              Cartographie interactive des flux de données et topologie réseau de l'écosystème BizOS
            </p>
          </div>
        </div>

        <button 
          onClick={() => setCurrentPage && setCurrentPage('architecture')}
          className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs cursor-pointer transition-all flex items-center gap-2"
        >
          <Cpu className="w-4 h-4 text-[#da70d6]" />
          <span>Documentation Technique Architecture</span>
        </button>
      </header>

      {/* Main Interactive Diagram Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Interactive Topology Graph Area (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0e1217] border border-white/10 p-6 h-[520px] relative overflow-hidden flex items-center justify-center">
          
          {/* SVG Connecting Paths */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Lines from Center (50, 50) to Satellite Nodes */}
            <line x1="50%" y1="50%" x2="20%" y2="25%" stroke="#da70d6" strokeWidth="2" strokeDasharray="6 6" className="animate-pulse" opacity="0.6" />
            <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="#03b5d3" strokeWidth="2" strokeDasharray="6 6" className="animate-pulse" opacity="0.6" />
            <line x1="50%" y1="50%" x2="20%" y2="75%" stroke="#da70d6" strokeWidth="2" strokeDasharray="6 6" className="animate-pulse" opacity="0.6" />
            <line x1="50%" y1="50%" x2="80%" y2="75%" stroke="#ffb95a" strokeWidth="2" strokeDasharray="6 6" className="animate-pulse" opacity="0.6" />
            <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="#a78bfa" strokeWidth="2" strokeDasharray="6 6" className="animate-pulse" opacity="0.6" />
          </svg>

          {/* Center Hub Node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-[#da70d6]/30 to-[#7c3aed]/40 border-2 border-[#da70d6] flex flex-col items-center justify-center text-center p-3 shadow-[0_0_40px_rgba(218,112,214,0.4)] z-20 animate-pulse">
            <Cpu className="w-8 h-8 text-[#ffaaf7] mb-1" />
            <span className="font-extrabold text-xs text-white tracking-widest font-mono">BIZOS CORE</span>
            <span className="text-[9px] text-[#ffaaf7] font-mono font-bold">100% SYNC</span>
          </div>

          {/* Render Satellite Nodes */}
          {NODES.map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 p-4 rounded-2xl border transition-all cursor-pointer z-20 flex flex-col items-center gap-1 min-w-[140px] text-center ${
                  isSelected 
                    ? 'bg-[#181d26] border-2 shadow-[0_0_25px_rgba(255,255,255,0.2)] scale-110' 
                    : 'bg-[#11151c]/90 border-white/20 hover:border-white/50 hover:scale-105'
                }`}
                style={{ 
                  top: `${node.y}%`, 
                  left: `${node.x}%`,
                  borderColor: isSelected ? node.color : undefined
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
                  <span className="font-bold text-xs text-white tracking-tight">{node.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{node.metric}</span>
              </button>
            );
          })}

        </div>

        {/* Selected Node Detail Inspector (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#0e1217] border border-white/10 p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{selectedNode.category}</span>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5" style={{ color: selectedNode.color }}>
                  {selectedNode.label}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {selectedNode.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-light">
              {selectedNode.description}
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-mono text-slate-400">Flux Télémétrique :</div>
              <div className="text-sm font-bold font-mono text-white flex items-center justify-between">
                <span>Débit Actuel</span>
                <span style={{ color: selectedNode.color }}>842.1 mb/s</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between font-mono">
                <span>Latence Nœud</span>
                <span>1.2 ms</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (setCurrentPage) {
                if (selectedNode.id === 'finance') setCurrentPage('billing');
                else if (selectedNode.id === 'crm') setCurrentPage('call_copilot');
                else if (selectedNode.id === 'analytics') setCurrentPage('exit_ready');
                else if (selectedNode.id === 'support') setCurrentPage('inbox_ai');
                else setCurrentPage('bookings');
              }
            }}
            className="w-full py-3 rounded-xl font-bold text-xs text-slate-950 transition-all cursor-pointer shadow-lg hover:scale-[1.02]"
            style={{ backgroundColor: selectedNode.color }}
          >
            Accéder au Module {selectedNode.label}
          </button>
        </div>

      </div>

    </div>
  );
};
