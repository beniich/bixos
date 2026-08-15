import React, { useState } from 'react';
import { Eye, Layers, Box, ChevronRight, CheckCircle2 } from 'lucide-react';

interface BimViewerViewProps {
  isDarkMode: boolean;
}

export const BimViewerView: React.FC<BimViewerViewProps> = ({ isDarkMode }) => {
  const [activeFloor, setActiveFloor] = useState('R+0');
  const [activeLayer, setActiveLayer] = useState('HVAC');

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">VISUALISEUR MAQUETTE NUMÉRIQUE BIM (IFC 4.0)</h2>
          <p className={`text-xs ${subText}`}>Exploration 3D des réseaux CVC, électricité, plomberie et structure</p>
        </div>
        <div className="flex items-center gap-2">
          {['R+0', 'R+1', 'R+2', 'R+3', 'Rooftop'].map((fl) => (
            <button
              key={fl}
              onClick={() => setActiveFloor(fl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFloor === fl ? 'btn-gradient-orange text-white' : 'bg-black/20 text-slate-400 border border-slate-500/20'
              }`}
            >
              {fl}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={`${cardBg} p-5 rounded-2xl border space-y-4`}>
          <h3 className="text-xs font-black uppercase text-orange-500">CALQUES TECHNIQUES</h3>
          <div className="space-y-2">
            {[
              { id: 'HVAC', label: 'Réseau CVC / Gaine Air' },
              { id: 'ELEC', label: 'Gaine Câbles Électriques' },
              { id: 'PLUMBING', label: 'Réseau Hydraulique / Eau' },
              { id: 'STRUCT', label: 'Poutres & Structures' },
            ].map((lyr) => (
              <button
                key={lyr.id}
                onClick={() => setActiveLayer(lyr.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  activeLayer === lyr.id ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-black/20 border-slate-500/20 text-slate-300'
                }`}
              >
                {lyr.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-3 ${cardBg} p-6 rounded-3xl border h-96 flex flex-col justify-between relative overflow-hidden`}>
          <div className="flex items-center justify-between text-xs font-mono border-b border-slate-500/20 pb-3">
            <span>IFC MODEL: REZIDET_TOWER_MAIN_v4.IFC</span>
            <span className="text-orange-400 font-bold">NIVEAU: {activeFloor} | COUCHE: {activeLayer}</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            <Box className="w-16 h-16 text-orange-500 animate-bounce" />
            <div className="text-sm font-black text-white uppercase">REPRÉSENTATION BIM 3D INTERACTIVE</div>
            <p className="text-xs text-slate-400 max-w-md">
              Affichage des métadonnées IFC4 pour la couche {activeLayer} au niveau {activeFloor}. Détection des collisions active (0 conflit).
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-500/20 pt-3">
            <span>ÉLÉMENTS CHARGÉS: 1,420 IFC_OBJECTS</span>
            <span className="text-emerald-400 font-bold">COLLISION CHECK: OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
