import React, { useState } from 'react';
import { Layers, Activity, RefreshCw, Cpu, Zap, Camera, ShieldCheck } from 'lucide-react';

interface DigitalTwinViewProps {
  isDarkMode: boolean;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({ isDarkMode }) => {
  const [selectedNode, setSelectedNode] = useState('NODE-HVAC-NORTH');
  const [nodes, setNodes] = useState([
    { id: 'NODE-HVAC-NORTH', name: 'Jumeau Chiller Unité Nord', health: 98, temp: '18.4 °C', vibe: '1.2 Hz', power: '42.5 kW', status: 'SYNCHRONIZED' },
    { id: 'NODE-ELEVATOR-WEST', name: 'Jumeau Ascenseur Panoramique', health: 74, temp: '28.1 °C', vibe: '4.8 Hz', power: '18.2 kW', status: 'WARNING' },
    { id: 'NODE-TRANSFORMER-01', name: 'Jumeau Sous-Station HTA', health: 99, temp: '22.0 °C', vibe: '0.8 Hz', power: '185 kW', status: 'SYNCHRONIZED' },
  ]);

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const active = nodes.find(n => n.id === selectedNode) || nodes[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">JUMEAU NUMÉRIQUE TEMPS RÉEL (DIGITAL TWIN)</h2>
          <p className={`text-xs ${subText}`}>Modélisation comportementale et synchronisation télémétrique Socket.io</p>
        </div>
        <button
          onClick={() => alert("Snapshot 3D de l'état du bâtiment sauvegardé avec succès.")}
          className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Camera className="w-4 h-4" />
          <span>CAPTURER SNAPSHOT</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nodes Selector */}
        <div className="space-y-3">
          {nodes.map((n) => (
            <div
              key={n.id}
              onClick={() => setSelectedNode(n.id)}
              className={`${cardBg} p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedNode === n.id ? 'border-orange-500 ring-2 ring-orange-500/30' : 'hover:border-slate-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-orange-400">{n.id}</span>
                <span className={`text-[9px] font-bold ${n.status === 'SYNCHRONIZED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  • {n.status}
                </span>
              </div>
              <h4 className="text-sm font-bold mt-1">{n.name}</h4>
              <div className={`text-xs ${subText} mt-1`}>Santé: <strong className="text-emerald-400">{n.health}%</strong></div>
            </div>
          ))}
        </div>

        {/* Live Simulation Display Canvas */}
        <div className={`lg:col-span-2 ${cardBg} p-6 rounded-3xl border space-y-6 flex flex-col justify-between`}>
          <div className="flex items-center justify-between border-b border-slate-500/20 pb-3">
            <h3 className="text-xs font-black uppercase text-orange-500">
              SIMULATION BEHAVIORAL : {active.name}
            </h3>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold animate-pulse">
              LIVE YJS / CRDT SOCKET ACTIVE
            </span>
          </div>

          <div className="h-56 bg-black/40 rounded-2xl border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-radial from-orange-500/10 via-transparent to-transparent pointer-events-none" />
            <Cpu className="w-12 h-12 text-orange-400 animate-pulse" />
            <div>
              <div className="text-sm font-black text-white">{active.name}</div>
              <div className="text-xs text-slate-400 font-mono mt-1">
                Temp: <span className="text-orange-400">{active.temp}</span> | Vib: <span className="text-orange-400">{active.vibe}</span> | Power: <span className="text-orange-400">{active.power}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className={subText}>Sync Frame: #109,241</span>
            <button
              onClick={() => alert(`Réétalonnage des capteurs exécuté pour ${active.id}`)}
              className="px-4 py-2 rounded-xl border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white font-bold text-xs cursor-pointer transition-all"
            >
              RÉÉTALONNER CAPTEURS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
