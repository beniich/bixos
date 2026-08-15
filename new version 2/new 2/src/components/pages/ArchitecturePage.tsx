import React, { useState } from 'react';
import { PageId, Language } from '../../types';
import { Network, Database, Brain, Activity, Shield, Cpu, ChevronRight } from 'lucide-react';

interface ArchitecturePageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const ArchitecturePage: React.FC<ArchitecturePageProps> = ({ language }) => {
  const [activeNode, setActiveNode] = useState('brain');

  const nodes = [
    { id: 'brain', icon: Brain, label: 'BizOS AI Core', color: 'text-[#ffaaf7]', border: 'border-[#ffaaf7]' },
    { id: 'db', icon: Database, label: 'Sovereign DB', color: 'text-[#ffb95a]', border: 'border-[#ffb95a]' },
    { id: 'network', icon: Network, label: 'Edge Topology', color: 'text-[#e1e3e4]', border: 'border-white/20' },
    { id: 'shield', icon: Shield, label: 'Security Layer', color: 'text-[#e1e3e4]', border: 'border-white/20' },
  ];

  return (
    <div className="relative min-h-screen pt-12 pb-24 px-4 sm:px-8 font-sans text-[#e1e3e4] animate-fade-in" style={{ backgroundColor: '#180f22' }}>
      <style>{`
        .biz-glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .biz-ambient-glow {
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(255, 170, 247, 0.1) 0%, rgba(24, 15, 34, 0) 70%);
            border-radius: 50%;
            z-index: 0;
            pointer-events: none;
        }
        .biz-text-gradient {
            background: linear-gradient(135deg, #ffaaf7 0%, #ffb95a 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .pulse-border {
            animation: pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-border {
            0%, 100% { border-color: rgba(255, 170, 247, 0.5); box-shadow: 0 0 20px rgba(255, 170, 247, 0.2); }
            50% { border-color: rgba(255, 185, 90, 0.8); box-shadow: 0 0 40px rgba(255, 185, 90, 0.4); }
        }
      `}</style>

      {/* Ambient Glows */}
      <div className="biz-ambient-glow top-20 left-10"></div>
      <div className="biz-ambient-glow bottom-20 right-10" style={{ background: 'radial-gradient(circle, rgba(255, 185, 90, 0.1) 0%, rgba(24, 15, 34, 0) 70%)' }}></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-light mb-2">Data <span className="biz-text-gradient font-normal">Topology</span></h1>
            <p className="text-[#d5c1cf] font-light">Interactive Infrastructure Mapping & AI Core Analysis</p>
          </div>
          <div className="flex items-center gap-4 biz-glass-card rounded-full p-2 pr-6 border-[#ffaaf7]/30">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxQrCV__MRzk690YgkC1usNipMo99M7kiETZVfQgfbfTPfgbnPfzshPJPnJR3RjHJ1UFbJH5YFdVD0Uwmbfn3QxINqJrcBhPH-paaQVObQS7Ub8OYO_UIZ_Q0BWd7lZP-95qiDBCe4cLymO8iZO7tWanDApZoA7lXZr1hee-NyIkK2I659iTkED6uKWwhMr3D9cQm71Izy8ZQOwUO16SLqAXPD6AbFVB1TmFcGjjJxTtK0XSQiCBfc" 
              alt="Holographic Avatar" 
              className="w-10 h-10 rounded-full border border-[#ffaaf7]/50"
            />
            <div>
              <div className="text-xs text-[#d5c1cf] uppercase tracking-wider font-semibold">AI Assistant</div>
              <div className="text-sm font-light text-white">System Nominal</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topology Graph Area */}
          <div className="lg:col-span-2 biz-glass-card rounded-2xl p-8 min-h-[500px] flex items-center justify-center relative overflow-hidden border-[#ffaaf7]/20">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
            
            <div className="relative z-10 grid grid-cols-2 gap-12 w-full max-w-lg">
              {nodes.map((node) => {
                const Icon = node.icon;
                const isActive = activeNode === node.id;
                return (
                  <div 
                    key={node.id}
                    onClick={() => setActiveNode(node.id)}
                    className={`flex flex-col items-center gap-4 cursor-pointer transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <div className={`w-24 h-24 rounded-2xl bg-black/40 border-2 backdrop-blur-md flex items-center justify-center transition-all ${isActive ? 'pulse-border ' + node.border : node.border}`}>
                      <Icon className={`w-10 h-10 ${node.color}`} strokeWidth={isActive ? 1.5 : 1} />
                    </div>
                    <span className={`text-sm tracking-wide ${isActive ? 'font-medium text-white' : 'font-light text-[#d5c1cf]'}`}>
                      {node.label}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Connecting Lines (Simulated SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.3 }}>
              <line x1="25%" y1="25%" x2="75%" y2="75%" stroke="#ffaaf7" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="75%" y1="25%" x2="25%" y2="75%" stroke="#ffb95a" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Node Details Panel */}
          <div className="flex flex-col gap-6">
            <div className="biz-glass-card rounded-2xl p-6 flex-grow border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-normal text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#ffaaf7]" />
                  Telemetry Data
                </h3>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffaaf7] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ffaaf7]"></span>
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                  <div className="text-xs text-[#d5c1cf] uppercase tracking-wider mb-1">Processing Rate</div>
                  <div className="text-2xl font-light text-white">42.8 <span className="text-sm text-[#ffb95a]">GB/s</span></div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                  <div className="text-xs text-[#d5c1cf] uppercase tracking-wider mb-1">Active Clusters</div>
                  <div className="text-2xl font-light text-white">1,024 <span className="text-sm text-[#ffaaf7]">Nodes</span></div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                  <div className="text-xs text-[#d5c1cf] uppercase tracking-wider mb-1">Global Latency</div>
                  <div className="text-2xl font-light text-white">12 <span className="text-sm text-[#d5c1cf]">ms</span></div>
                </div>
              </div>
            </div>

            <div className="biz-glass-card rounded-2xl p-6 border-[#ffaaf7]/20 bg-gradient-to-br from-[#ffaaf7]/5 to-transparent">
              <h4 className="font-medium text-white mb-2">Automated Optimization</h4>
              <p className="text-sm text-[#d5c1cf] font-light leading-relaxed mb-4">
                BizOS AI has successfully re-routed 14% of query loads to edge servers for maximum efficiency.
              </p>
              <button className="text-xs font-semibold uppercase tracking-widest text-[#ffaaf7] hover:text-[#ffb95a] transition-colors flex items-center gap-1">
                View Audit Log <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
