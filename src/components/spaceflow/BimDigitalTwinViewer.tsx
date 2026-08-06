import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, Eye, EyeOff, Box, Activity, Thermometer, Zap, AlertTriangle, Search, Filter, RefreshCw, Maximize2, RotateCcw, ShieldCheck, CheckCircle2, ChevronRight, Info, Download, Wrench
} from 'lucide-react';
import { useFieldTechStore, EquipmentHotspot } from '../../services/fieldTechStore';

export const BimDigitalTwinViewer: React.FC = () => {
  const { equipment, addWorkOrder, updateEquipmentStatus } = useFieldTechStore();

  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  const [activeLayers, setActiveLayers] = useState({
    structure: true,
    hvac: true,
    electrical: true,
    plumbing: true,
    sensors: true,
  });
  const [showThermalHeatmap, setShowThermalHeatmap] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState<EquipmentHotspot | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rotationAngle, setRotationAngle] = useState(45);
  const [isRotating, setIsRotating] = useState(true);
  const [otCreatedSuccess, setOtCreatedSuccess] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter equipment based on floor and search
  const filteredEquipment = equipment.filter((eq) => {
    const matchesFloor = selectedFloor === 'All' || eq.floor.includes(selectedFloor) || (selectedFloor === 'Étage 3' && eq.floor.includes('Étage 3'));
    const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) || eq.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFloor && matchesSearch;
  });

  // Canvas 3D Rendering of Digital Twin Isometric Structure
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = (canvas.width = canvas.parentElement?.clientWidth || 700);
      const height = (canvas.height = 420);

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 20;
      const rad = (rotationAngle * Math.PI) / 180;

      // Draw Grid Base (Foundation)
      ctx.strokeStyle = 'rgba(217, 70, 239, 0.2)';
      ctx.lineWidth = 1;
      for (let i = -180; i <= 180; i += 40) {
        ctx.beginPath();
        const x1 = centerX + Math.cos(rad) * i - Math.sin(rad) * -180;
        const y1 = centerY + (Math.sin(rad) * i + Math.cos(rad) * -180) * 0.5;
        const x2 = centerX + Math.cos(rad) * i - Math.sin(rad) * 180;
        const y2 = centerY + (Math.sin(rad) * i + Math.cos(rad) * 180) * 0.5;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 3D Building Floor Slices Rendering
      const floors = [
        { label: 'Sous-sol -1', heightOffset: 120, color: 'rgba(139, 92, 246, 0.25)', border: '#8b5cf6' },
        { label: 'Rez-de-chaussée', heightOffset: 70, color: 'rgba(217, 70, 239, 0.25)', border: '#d946ef' },
        { label: 'Étage 1 & 2', heightOffset: 20, color: 'rgba(244, 114, 182, 0.25)', border: '#f472b6' },
        { label: 'Étage 3 & Roof CVC', heightOffset: -30, color: 'rgba(236, 72, 153, 0.35)', border: '#ec4899' },
      ];

      floors.forEach((fl, idx) => {
        // Filter floor if specific floor selected
        if (selectedFloor !== 'All' && !fl.label.includes(selectedFloor) && !(selectedFloor === 'Étage 3' && fl.label.includes('Roof'))) {
          return;
        }

        const size = 140;
        const h = fl.heightOffset;

        // Calculate corners in Isometric projection
        const p1 = { x: centerX + Math.cos(rad) * -size - Math.sin(rad) * -size, y: centerY + (Math.sin(rad) * -size + Math.cos(rad) * -size) * 0.5 - h };
        const p2 = { x: centerX + Math.cos(rad) * size - Math.sin(rad) * -size, y: centerY + (Math.sin(rad) * size + Math.cos(rad) * -size) * 0.5 - h };
        const p3 = { x: centerX + Math.cos(rad) * size - Math.sin(rad) * size, y: centerY + (Math.sin(rad) * size + Math.cos(rad) * size) * 0.5 - h };
        const p4 = { x: centerX + Math.cos(rad) * -size - Math.sin(rad) * size, y: centerY + (Math.sin(rad) * -size + Math.cos(rad) * size) * 0.5 - h };

        // Draw Floor Polygon
        ctx.fillStyle = showThermalHeatmap ? (idx === 3 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.25)') : fl.color;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = fl.border;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Floor Pillar Vertical Beams
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p1.x, p1.y + 40);
        ctx.moveTo(p2.x, p2.y); ctx.lineTo(p2.x, p2.y + 40);
        ctx.moveTo(p3.x, p3.y); ctx.lineTo(p3.x, p3.y + 40);
        ctx.moveTo(p4.x, p4.y); ctx.lineTo(p4.x, p4.y + 40);
        ctx.stroke();

        // Label Floor Slice
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText(fl.label, p1.x - 40, p1.y - 5);
      });

      if (isRotating) {
        setRotationAngle((prev) => (prev + 0.2) % 360);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [rotationAngle, isRotating, showThermalHeatmap, selectedFloor]);

  const handleExportSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `BIM_DigitalTwin_Snapshot_${selectedFloor}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateOtForEquip = (eq: EquipmentHotspot) => {
    addWorkOrder({
      title: `Maintenance sur ${eq.name}`,
      location: `Tour BizOS • ${eq.floor}`,
      priority: eq.status === 'Critical' ? 'Haute' : 'Moyenne',
      status: 'À faire',
      dueDate: 'Demain 10:00',
      equipmentId: eq.id,
      description: `Planifié depuis la visionneuse BIM 3D. Télémétrie: Temp=${eq.temp}, Vibration=${eq.vibration}.`,
    });

    setOtCreatedSuccess(`Ordre d'Intervention (OT) créé avec succès pour ${eq.id} !`);
    setTimeout(() => setOtCreatedSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#140826]/90 border border-[#d946ef]/30 shadow-[0_0_30px_rgba(217,70,239,0.15)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f472b6] mb-1">
            <Box className="w-4 h-4" />
            <span>DIGITAL TWIN & BIM IFC 4.3 REALTIME ENGINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Visionneuse BIM 3D & Jumeau Numérique</h2>
          <p className="text-xs text-slate-300">Modélisation spatiale de la tour, surcouche thermique et télémétrie équipements en temps réel.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSnapshot}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-white/5 border border-white/20 hover:border-[#f472b6] text-white flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-[#f472b6]" />
            <span>Export Snapshot 3D</span>
          </button>

          <button
            onClick={() => setShowThermalHeatmap(!showThermalHeatmap)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
              showThermalHeatmap 
                ? 'bg-[#ec4899] border-[#f472b6] text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]' 
                : 'bg-white/5 border-white/20 text-slate-300 hover:text-white'
            }`}
          >
            <Thermometer className="w-4 h-4 text-[#f472b6]" />
            <span>Heatmap Thermique {showThermalHeatmap ? 'Actif' : 'Inactif'}</span>
          </button>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className="p-2 rounded-xl bg-white/5 border border-white/20 text-slate-300 hover:text-white cursor-pointer"
            title={isRotating ? 'Mettre en pause la rotation 3D' : 'Lancer la rotation 3D'}
          >
            <RotateCcw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {otCreatedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span>{otCreatedSuccess}</span>
        </div>
      )}

      {/* Main 3D Canvas + Interactive Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: IFC Layer Filters & Floor Slices */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 rounded-2xl bg-[#130826]/90 border border-[#d946ef]/20 space-y-4">
            
            {/* Search Equipment Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un composant BIM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#1e0f38] border border-white/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f472b6]"
              />
            </div>

            <h3 className="text-xs font-mono font-bold text-[#f472b6] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Filtres Slices IFC</span>
            </h3>

            {/* Floor Selectors */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400">Étage ciblé :</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {['All', 'Étage 3', 'Étage 1', 'Sous-sol'].map((fl) => (
                  <button
                    key={fl}
                    onClick={() => setSelectedFloor(fl)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer font-medium ${
                      selectedFloor === fl 
                        ? 'bg-[#d946ef]/30 border-[#f472b6] text-white shadow-[0_0_10px_rgba(217,70,239,0.3)]' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {fl === 'All' ? 'Tour Entière' : fl}
                  </button>
                ))}
              </div>
            </div>

            {/* IFC System Toggles */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-[11px] text-slate-400">Systèmes Réseau (IFC) :</label>
              
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => setActiveLayers({ ...activeLayers, hvac: !activeLayers.hvac })}
                  className={`w-full p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    activeLayers.hvac ? 'bg-white/10 border-[#d946ef]/50 text-white' : 'bg-white/5 border-white/5 text-slate-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ec4899]" />
                    <span>Génie Climatique (CVC)</span>
                  </span>
                  {activeLayers.hvac ? <Eye className="w-3.5 h-3.5 text-[#f472b6]" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setActiveLayers({ ...activeLayers, electrical: !activeLayers.electrical })}
                  className={`w-full p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    activeLayers.electrical ? 'bg-white/10 border-[#d946ef]/50 text-white' : 'bg-white/5 border-white/5 text-slate-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                    <span>Courants Forts / TGBT</span>
                  </span>
                  {activeLayers.electrical ? <Eye className="w-3.5 h-3.5 text-[#f472b6]" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setActiveLayers({ ...activeLayers, plumbing: !activeLayers.plumbing })}
                  className={`w-full p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    activeLayers.plumbing ? 'bg-white/10 border-[#d946ef]/50 text-white' : 'bg-white/5 border-white/5 text-slate-500'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Plomberie & Fluides</span>
                  </span>
                  {activeLayers.plumbing ? <Eye className="w-3.5 h-3.5 text-[#f472b6]" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Clash Detection Indicator */}
            <div className="p-3 rounded-xl bg-[#d946ef]/10 border border-[#d946ef]/30 text-xs space-y-1">
              <div className="font-semibold text-[#f472b6] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Détection de Clashes IFC</span>
              </div>
              <p className="text-[10px] text-slate-300">0 conflit structurel majeur détecté sur le dernier build BIM IFC 4.3.</p>
            </div>

          </div>
        </div>

        {/* Center Canvas Column: 3D Render & Interactive Hotspots */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative rounded-2xl bg-[#090312] border border-[#d946ef]/30 overflow-hidden shadow-[inset_0_0_50px_rgba(217,70,239,0.1)] min-h-[420px] flex items-center justify-center">
            
            {/* Realtime Canvas */}
            <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

            {/* Overlay Hotspots for Equipment Sensors */}
            <div className="absolute inset-0 pointer-events-none">
              {filteredEquipment.map((eq) => {
                const isWarning = eq.status === 'Warning';
                const isCritical = eq.status === 'Critical';

                return (
                  <div
                    key={eq.id}
                    style={{ left: `${eq.x}%`, top: `${eq.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group"
                  >
                    <button
                      onClick={() => setSelectedEquip(eq)}
                      className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-125 cursor-pointer shadow-lg ${
                        isCritical 
                          ? 'bg-rose-500 text-white shadow-rose-500/50 animate-bounce' 
                          : isWarning 
                            ? 'bg-amber-500 text-white shadow-amber-500/50' 
                            : 'bg-[#d946ef] text-white shadow-[#d946ef]/50'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span className={`absolute -inset-1 rounded-full animate-ping opacity-75 ${
                        isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-[#f472b6]'
                      }`} />
                    </button>

                    {/* Tooltip Hover */}
                    <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block w-48 p-2.5 rounded-xl bg-[#130826]/95 border border-[#d946ef]/50 backdrop-blur-md shadow-2xl z-30 text-[11px]">
                      <div className="font-bold text-white mb-0.5">{eq.name}</div>
                      <div className="text-[10px] text-slate-300 font-mono">Temp: {eq.temp} • Power: {eq.power}</div>
                      <div className="mt-1 text-[9px] text-[#f472b6] font-semibold uppercase">Cliquez pour télémétrie complète</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Canvas Bottom Bar HUD */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 rounded-xl bg-[#130826]/80 backdrop-blur-md border border-white/10 text-xs text-slate-300 pointer-events-auto">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>BIM WebSocket Online</span>
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-[11px] font-mono text-[#f472b6]">FPS: 60 • Angle: {Math.round(rotationAngle)}°</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRotationAngle((prev) => prev - 15)}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono cursor-pointer"
                >
                  ◄ Tourner G
                </button>
                <button
                  onClick={() => setRotationAngle((prev) => prev + 15)}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono cursor-pointer"
                >
                  Tourner D ►
                </button>
              </div>
            </div>

          </div>

          {/* Selected Equipment Modal / Detail Card */}
          {selectedEquip && (
            <div className="p-5 rounded-2xl bg-[#140826] border border-[#d946ef]/40 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    selectedEquip.status === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-[#d946ef]/20 text-[#f472b6]'
                  }`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{selectedEquip.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {selectedEquip.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{selectedEquip.floor} • Type: {selectedEquip.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateOtForEquip(selectedEquip)}
                    className="px-3 py-1.5 rounded-xl bizos-cta-pink text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Planifier un OT</span>
                  </button>
                  <button
                    onClick={() => setSelectedEquip(null)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-300 cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>

              {/* Live Sensor Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-400 text-[10px]">Température de Fonctionnement</div>
                  <div className="text-lg font-mono font-bold text-white mt-0.5">{selectedEquip.temp}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-400 text-[10px]">Analyse Vibratoire FFT</div>
                  <div className="text-lg font-mono font-bold text-amber-400 mt-0.5">{selectedEquip.vibration}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-400 text-[10px]">Puissance Absorbée</div>
                  <div className="text-lg font-mono font-bold text-[#f472b6] mt-0.5">{selectedEquip.power}</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
