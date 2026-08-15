import React, { useState } from 'react';
import { MapPin, Users, Thermometer, Droplets, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

interface SpacesViewProps {
  isDarkMode: boolean;
}

export const SpacesView: React.FC<SpacesViewProps> = ({ isDarkMode }) => {
  const [spaces, setSpaces] = useState([
    { id: 'sp-1', name: 'Atrium Central', building: 'Bâtiment A', floor: 'R+0', area: '450 m²', capacity: 150, occupancy: '68%', temp: '21.5°C', humidity: '45%', status: 'OPTIMAL' },
    { id: 'sp-2', name: 'Open Space Innovation', building: 'Bâtiment B', floor: 'R+3', area: '320 m²', capacity: 80, occupancy: '82%', temp: '22.8°C', humidity: '50%', status: 'OPTIMAL' },
    { id: 'sp-3', name: 'Salle de Conférence Alpha', building: 'Bâtiment A', floor: 'R+1', area: '120 m²', capacity: 40, occupancy: '100%', temp: '24.1°C', humidity: '58%', status: 'HIGH_TEMP' },
    { id: 'sp-4', name: 'Data Center / Server Room', building: 'Bâtiment C', floor: 'SS-1', area: '180 m²', capacity: 10, occupancy: '20%', temp: '18.2°C', humidity: '38%', status: 'OPTIMAL' },
    { id: 'sp-5', name: 'Rooftop Lounge Executive', building: 'Bâtiment A', floor: 'R+5', area: '210 m²', capacity: 60, occupancy: '45%', temp: '23.0°C', humidity: '42%', status: 'OPTIMAL' },
  ]);

  const [showAddSpace, setShowAddSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('Espace Coworking Ouest');

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">CARTOGRAPHIE DES ESPACES & ZONES</h2>
          <p className={`text-xs ${subText}`}>Suivi de la température, humidité et taux d'occupation en temps réel</p>
        </div>
        <button
          onClick={() => setShowAddSpace(true)}
          className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>AJOUTER UNE ZONE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces.map((sp) => (
          <div key={sp.id} className={`${cardBg} p-5 rounded-2xl space-y-4 border hover:border-orange-500/50 transition-all`}>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold font-mono">
                {sp.building} • {sp.floor}
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                sp.status === 'OPTIMAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {sp.status}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-black">{sp.name}</h4>
              <p className={`text-xs ${subText}`}>Surface: {sp.area} | Capacité: {sp.capacity} p.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-500/20">
              <div className="flex flex-col">
                <span className={`text-[10px] ${subText} flex items-center gap-1`}><Users className="w-3 h-3" /> Occup.</span>
                <span className="font-bold text-orange-400">{sp.occupancy}</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] ${subText} flex items-center gap-1`}><Thermometer className="w-3 h-3" /> Temp.</span>
                <span className="font-bold">{sp.temp}</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] ${subText} flex items-center gap-1`}><Droplets className="w-3 h-3" /> Humid.</span>
                <span className="font-bold">{sp.humidity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddSpace && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md ${cardBg} rounded-3xl p-6 border shadow-2xl space-y-4`}>
            <h3 className="text-base font-black text-orange-500 uppercase">Créer un Nouvel Espace</h3>
            <input
              type="text"
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
              className="w-full bg-black/20 border border-slate-500/30 rounded-xl px-3 py-2 text-xs"
            />
            <button
              onClick={() => {
                setSpaces([
                  ...spaces,
                  {
                    id: `sp-${Date.now()}`,
                    name: newSpaceName,
                    building: 'Bâtiment A',
                    floor: 'R+2',
                    area: '150 m²',
                    capacity: 35,
                    occupancy: '10%',
                    temp: '20.5°C',
                    humidity: '40%',
                    status: 'OPTIMAL'
                  }
                ]);
                setShowAddSpace(false);
              }}
              className="w-full py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-bold cursor-pointer"
            >
              ENREGISTRER
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
