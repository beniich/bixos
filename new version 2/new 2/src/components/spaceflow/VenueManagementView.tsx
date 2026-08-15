import React, { useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, Cell } from 'recharts';
import { Users, Droplets, Zap, ChevronDown, Map, Shield, Activity, Settings, Maximize, Minimize, ShoppingCart } from 'lucide-react';
import { useTicketing } from '../../context/TicketingContext';

interface Seat {
  id: string;
  x: number;
  y: number;
  status: 'occupied' | 'available' | 'selected';
  tier: string;
  section: string;
  row: string;
  seatNum: number;
  price: number;
  type: 'regular' | 'vip' | 'premium';
  ticketId?: string;
}

const generateSeats = (venueId: string = 'opera'): Seat[] => {
  const seats: Seat[] = [];
  const cx = 500, cy = venueId === 'stadium' ? 500 : 900;
  
  if (venueId === 'opera') {
    // Lower tier blocks (4 blocks)
    const lowerAngles = [
      { start: -150, end: -125 },
      { start: -120, end: -95 },
      { start: -85, end: -60 },
      { start: -55, end: -30 }
    ];
    lowerAngles.forEach((block, bIdx) => {
      for (let row = 0; row < 6; row++) {
        let r = 400 + row * 22;
        let numSeats = 18 + Math.floor(row * 1.5);
        let angleStep = (block.end - block.start) / numSeats;
        for (let s = 0; s < numSeats; s++) {
          let angle = block.start + s * angleStep;
          let rad = angle * Math.PI / 180;
          let x = cx + Math.cos(rad) * r;
          let y = cy + Math.sin(rad) * r;
          
          const isCyanZone = (bIdx === 2 && row > 2 && s > 8);
          const rand = Math.random();
          const isAvailable = isCyanZone ? rand > 0.3 : rand > 0.9;
          seats.push({
            id: `${venueId}-L-${bIdx}-${row}-${s}`,
            x, y, tier: 'lower',
            status: isAvailable ? 'available' : 'occupied',
            section: 'Orchestre', row: `Rang ${row + 1}`, seatNum: s + 1,
            price: isCyanZone ? 150 : 80, type: isCyanZone ? 'vip' : 'regular'
          });
        }
      }
    });
    // Upper tier blocks
    const upperAngles = [
      { start: -155, end: -125 },
      { start: -120, end: -95 },
      { start: -85, end: -60 },
      { start: -55, end: -25 }
    ];
    upperAngles.forEach((block, bIdx) => {
      for (let row = 0; row < 5; row++) {
        let r = 580 + row * 22;
        let numSeats = 22 + Math.floor(row * 2);
        let angleStep = (block.end - block.start) / numSeats;
        for (let s = 0; s < numSeats; s++) {
          let angle = block.start + s * angleStep;
          let rad = angle * Math.PI / 180;
          let x = cx + Math.cos(rad) * r;
          let y = cy + Math.sin(rad) * r;
          
          const isCyanZone = (bIdx === 2);
          const rand = Math.random();
          const isAvailable = isCyanZone ? rand > 0.4 : rand > 0.95;
          seats.push({
            id: `${venueId}-U-${bIdx}-${row}-${s}`,
            x, y, tier: 'upper',
            status: isAvailable ? 'available' : 'occupied',
            section: 'Balcon', row: `Rang ${row + 1}`, seatNum: s + 1,
            price: isCyanZone ? 120 : 60, type: isCyanZone ? 'vip' : 'regular'
          });
        }
      }
    });
  } else if (venueId === 'stadium') {
    // Stadium layout (rectangular with rounded corners, or just an oval)
    for (let row = 0; row < 12; row++) {
      let rX = 200 + row * 18;
      let rY = 120 + row * 18;
      let numSeats = 60 + row * 10;
      let angleStep = (Math.PI * 2) / numSeats;
      for (let s = 0; s < numSeats; s++) {
        // Create an oval shape with a gap for the field entrance
        let rad = s * angleStep;
        if (rad > Math.PI * 0.45 && rad < Math.PI * 0.55) continue; // North entrance
        if (rad > Math.PI * 1.45 && rad < Math.PI * 1.55) continue; // South entrance
        
        let x = cx + Math.cos(rad) * rX;
        let y = cy + Math.sin(rad) * rY;
        
        const isVip = row < 2;
        const rand = Math.random();
        const isAvailable = rand > 0.7;
        seats.push({
          id: `${venueId}-${row}-${s}`,
          x, y, tier: row < 5 ? 'lower' : 'upper',
          status: isAvailable ? 'available' : 'occupied',
          section: `Tribune ${Math.floor(rad/(Math.PI/2)) + 1}`, row: `Rang ${row + 1}`, seatNum: s + 1,
          price: isVip ? 250 : 90, type: isVip ? 'vip' : 'regular'
        });
      }
    }
  } else if (venueId === 'esport') {
    // Esport Arena layout (hexagonal or circular focused on center)
    for (let row = 0; row < 8; row++) {
      let r = 150 + row * 25;
      let numSeats = 30 + row * 8;
      let angleStep = (Math.PI * 2) / numSeats;
      for (let s = 0; s < numSeats; s++) {
        let rad = s * angleStep;
        let x = cx + Math.cos(rad) * r;
        let y = cy + Math.sin(rad) * r;
        
        const isVip = row === 0;
        const rand = Math.random();
        const isAvailable = rand > 0.5;
        seats.push({
          id: `${venueId}-${row}-${s}`,
          x, y, tier: 'main',
          status: isAvailable ? 'available' : 'occupied',
          section: `Sector ${Math.floor((rad/(Math.PI*2)) * 6) + 1}`, row: `Rang ${row + 1}`, seatNum: s + 1,
          price: isVip ? 180 : 70, type: isVip ? 'vip' : 'regular'
        });
      }
    }
  } else {
    // default mini layout for Theatre
    for (let row = 0; row < 8; row++) {
      let r = 200 + row * 20;
      let numSeats = 30 + Math.floor(row * 2);
      let angleStep = Math.PI / numSeats;
      for (let s = 0; s < numSeats; s++) {
        let rad = Math.PI + s * angleStep;
        let x = cx + Math.cos(rad) * r;
        let y = cy + Math.sin(rad) * r;
        
        const isVip = row < 3 && s > numSeats/4 && s < numSeats*3/4;
        const rand = Math.random();
        const isAvailable = rand > 0.8;
        seats.push({
          id: `${venueId}-${row}-${s}`,
          x, y, tier: 'main',
          status: isAvailable ? 'available' : 'occupied',
          section: 'Parterre', row: `Rang ${row + 1}`, seatNum: s + 1,
          price: isVip ? 90 : 45, type: isVip ? 'vip' : 'regular'
        });
      }
    }
  }
  return seats;
};

const seatingData = [
  { name: 'S01', value: 800 },
  { name: 'S02', value: 600 },
  { name: 'S03', value: 750 },
  { name: 'S04', value: 900 },
  { name: 'S05', value: 850 },
  { name: 'S06', value: 650 },
];

const energyData = [
  { time: '08:00', value: 120 },
  { time: '10:00', value: 180 },
  { time: '12:00', value: 250 },
  { time: '14:00', value: 220 },
  { time: '16:00', value: 200 },
  { time: '18:00', value: 150 },
];

const airflowData = [
  { name: 'A01', val1: 400, val2: 200 },
  { name: 'A02', val1: 300, val2: 150 },
  { name: 'A03', val1: 500, val2: 250 },
  { name: 'A04', val1: 350, val2: 180 },
  { name: 'A05', val1: 450, val2: 220 },
];

export const VenueManagementView: React.FC = () => {
  const [activeVenue, setActiveVenue] = useState<string>('opera');
  const [seats, setSeats] = useState<Seat[]>([]);
  
  useEffect(() => {
    setSeats(generateSeats(activeVenue));
  }, [activeVenue]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{x1: number, y1: number, x2: number, y2: number} | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const { toggleCartSeat, firestoreSeats, updateSeatStatus, cartSeats } = useTicketing();

  useEffect(() => {
    if (Object.keys(firestoreSeats).length > 0) {
      setSeats(prevSeats =>
        prevSeats.map(seat => {
          const remote = firestoreSeats[seat.id];
          if (remote) {
            return {
              ...seat,
              status: remote.status,
              ticketId: remote.ticketId
            };
          }
          return seat;
        })
      );
    }
  }, [firestoreSeats]);

  const handleSeatClick = (seatId: string) => {
    setSeats(prevSeats =>
      prevSeats.map(seat => {
        if (seat.id === seatId) {
          if (seat.status === 'occupied') return seat;
          const nextStatus = seat.status === 'selected' ? 'available' : 'selected';
          
          let newTicketId = seat.ticketId;
          if (nextStatus === 'selected') {
            newTicketId = `OPERA-${Math.floor(1000 + Math.random() * 9000)}`;
          } else {
            newTicketId = undefined;
          }

          toggleCartSeat({
            id: seat.id,
            section: seat.section,
            row: seat.row,
            seatNum: seat.seatNum,
            price: seat.price,
            type: seat.type
          });

          updateSeatStatus(seatId, nextStatus, newTicketId);

          return {
            ...seat,
            status: nextStatus,
            ticketId: newTicketId
          };
        }
        return seat;
      })
    );
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    setIsSelecting(true);
    setSelectionBox({ x1: svgP.x, y1: svgP.y, x2: svgP.x, y2: svgP.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isSelecting || !selectionBox || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    setSelectionBox(prev => prev ? { ...prev, x2: svgP.x, y2: svgP.y } : null);
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionBox) {
      const minX = Math.min(selectionBox.x1, selectionBox.x2);
      const maxX = Math.max(selectionBox.x1, selectionBox.x2);
      const minY = Math.min(selectionBox.y1, selectionBox.y2);
      const maxY = Math.max(selectionBox.y1, selectionBox.y2);

      const seatsToSelect = seats.filter(seat => {
        return seat.x >= minX && seat.x <= maxX && seat.y >= minY && seat.y <= maxY;
      });

      if (seatsToSelect.length > 0) {
        setSeats(prevSeats => {
          const newSeats = [...prevSeats];
          seatsToSelect.forEach(selectedSeat => {
            if (selectedSeat.status === 'occupied') return;
            const index = newSeats.findIndex(s => s.id === selectedSeat.id);
            if (index !== -1 && newSeats[index].status === 'available') {
               newSeats[index] = { ...newSeats[index], status: 'selected' };
               
               toggleCartSeat({
                  id: selectedSeat.id,
                  section: selectedSeat.section,
                  row: selectedSeat.row,
                  seatNum: selectedSeat.seatNum,
                  price: selectedSeat.price,
                  type: selectedSeat.type
                });
            }
          });
          return newSeats;
        });
      }
    }
    setIsSelecting(false);
    setSelectionBox(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  return (
    <div className="flex h-screen bg-[#06080e] overflow-hidden font-sans text-slate-300 select-none">
      <style>{`
        .cad-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
      `}</style>
      
      {/* Sidebar - Venue Selection */}
      <aside className="w-64 border-r border-slate-800/50 bg-[#0a0d14] flex flex-col z-20 shadow-2xl relative">
        <div className="p-6 border-b border-slate-800/50">
          <h2 className="text-white font-bold text-lg mb-1 tracking-wide uppercase">Venue Manager</h2>
          <p className="text-[10px] text-slate-500 font-mono">BIM & CAD Integrated</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 px-2">Opéras & Théâtres</div>
          <button onClick={() => setActiveVenue('opera')} className={`w-full text-left p-3 rounded-xl ${activeVenue === 'opera' ? 'bg-cyan-950/30 border-cyan-900/50' : 'hover:bg-slate-900 border-transparent'} border flex items-center justify-between group transition-colors`}>
            <div>
              <div className="font-bold text-cyan-400 text-sm">Opéra National</div>
              <div className="text-[10px] text-slate-400 mt-1">Capacité: 2,400 places</div>
            </div>
            {activeVenue === 'opera' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>}
          </button>
          <button onClick={() => setActiveVenue('theatre')} className={`w-full text-left p-3 rounded-xl ${activeVenue === 'theatre' ? 'bg-cyan-950/30 border-cyan-900/50' : 'hover:bg-slate-900 border-transparent'} border flex items-center justify-between group transition-colors`}>
            <div><div className="font-bold text-slate-300 text-sm">Théâtre Antique</div>
            <div className="text-[10px] text-slate-500 mt-1">Capacité: 1,800 places</div></div>
            {activeVenue === 'theatre' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>}
          </button>

          <div className="text-[10px] uppercase font-bold text-slate-500 mt-6 mb-2 px-2">Stades & Arènes</div>
          <button onClick={() => setActiveVenue('stadium')} className={`w-full text-left p-3 rounded-xl ${activeVenue === 'stadium' ? 'bg-cyan-950/30 border-cyan-900/50' : 'hover:bg-slate-900 border-transparent'} border flex items-center justify-between group transition-colors`}>
            <div><div className="font-bold text-slate-300 text-sm">Orange Vélodrome</div>
            <div className="text-[10px] text-slate-500 mt-1">Capacité: 67,394 places</div></div>
            {activeVenue === 'stadium' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>}
          </button>
          <button onClick={() => setActiveVenue('esport')} className={`w-full text-left p-3 rounded-xl ${activeVenue === 'esport' ? 'bg-cyan-950/30 border-cyan-900/50' : 'hover:bg-slate-900 border-transparent'} border flex items-center justify-between group transition-colors`}>
            <div><div className="font-bold text-slate-300 text-sm">Arène eSport Alpha</div>
            <div className="text-[10px] text-slate-500 mt-1">Capacité: 5,000 places</div></div>
            {activeVenue === 'esport' && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>}
          </button>
        </div>

        <div className="p-4 border-t border-slate-800/50 space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">{cartSeats.length} Selected</span>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              ${cartSeats.reduce((acc, s) => acc + s.price, 0)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-slate-900 rounded-lg border border-slate-800 justify-center">
            <Activity className="w-4 h-4 text-emerald-400" /> System Online
          </div>
        </div>
      </aside>

      {/* Main CAD Viewer */}
      <main className="flex-1 relative overflow-hidden flex flex-col bg-[#0b101a]">
        
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800/50 flex items-center justify-between px-6 z-20 bg-[#0a0d14]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-bold tracking-widest text-sm">OPÉRA NATIONAL <span className="text-slate-500 mx-2">|</span> SEATING PLAN</h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#ffaaf7] rounded-sm"></span> Selected</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#d946ef] rounded-sm"></span> Occupied (87%)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#00f0ff] rounded-sm"></span> Available / VIP (13%)</div>
            <button onClick={toggleFullscreen} className="p-2 hover:bg-slate-800 rounded-lg ml-4 transition-colors">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button className="p-2 hover:bg-slate-800 rounded-lg"><Settings className="w-4 h-4" /></button>
          </div>
        </header>

        {/* CAD Canvas Area */}
        <div className="flex-1 relative cad-grid overflow-hidden">
          {/* Axis markers simulating CAD */}
          <div className="absolute top-0 inset-x-0 h-6 border-b border-slate-800/80 flex items-center text-[9px] font-mono text-slate-600 px-4 select-none">
            <div className="w-1/4">10 m</div>
            <div className="w-1/4 text-center">X [m]</div>
            <div className="w-1/4 text-right">20 m</div>
            <div className="w-1/4 text-right">30 m</div>
          </div>
          <div className="absolute inset-y-0 right-0 w-6 border-l border-slate-800/80 flex flex-col justify-between text-[9px] font-mono text-slate-600 py-4 select-none" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
            <div>10 m</div>
            <div className="text-center">Y [m]</div>
            <div className="text-right">20 m</div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 1000 1000" className="w-[120%] h-[120%] opacity-90" style={{ transform: 'translateY(-5%)' }}>
              
              {/* Structure lines mimicking the Opera architecture */}
              <g stroke="#ffffff" strokeWidth="1" opacity="0.15" fill="none">
                <path d="M50 900 Q 500 -200 950 900" />
                <path d="M100 900 Q 500 -100 900 900" />
                <path d="M150 900 Q 500 0 850 900" />
                <path d="M200 900 Q 500 100 800 900" />
                <path d="M250 900 Q 500 200 750 900" />
                <path d="M300 900 Q 500 300 700 900" />
                
                {/* Aisles / Stairs */}
                <path d="M 330 350 L 250 900" />
                <path d="M 460 300 L 450 900" />
                <path d="M 540 300 L 550 900" />
                <path d="M 670 350 L 750 900" />
                
                <path d="M 210 210 L 100 600" />
                <path d="M 790 210 L 900 600" />
              </g>

              {/* Render Seats */}
              {seats.map(seat => (
                <rect
                  key={seat.id}
                  x={seat.x}
                  y={seat.y}
                  width="14"
                  height="10"
                  rx="2"
                  onClick={() => handleSeatClick(seat.id)}
                  fill={seat.status === 'selected' ? '#ffaaf7' : 'transparent'}
                  stroke={seat.status === 'selected' ? '#ffffff' : seat.status === 'occupied' ? '#d946ef' : '#00f0ff'}
                  strokeWidth={seat.status === 'selected' ? "2.5" : "1.5"}
                  className={`transition-all duration-300 ${seat.status !== 'occupied' ? 'cursor-pointer hover:stroke-white' : ''}`}
                  transform={`rotate(${Math.atan2(seat.y - 900, seat.x - 500) * 180 / Math.PI + 90} ${seat.x + 7} ${seat.y + 5})`}
                  style={{
                    filter: `drop-shadow(0 0 ${seat.status === 'selected' ? '12px' : '4px'} ${seat.status === 'selected' ? '#ffaaf7' : seat.status === 'occupied' ? '#d946ef80' : '#00f0ff80'})`
                  }}
                />
              ))}

              {/* Text Annotations inside SVG */}
              <g className="font-mono text-sm tracking-widest font-bold">
                {/* Top Left - Occupied */}
                <text x="250" y="250" fill="#d946ef" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}>OCCUPIED (87%)</text>
                <path d="M 370 245 L 430 350" stroke="#d946ef" strokeWidth="1.5" fill="none" opacity="0.8" />
                <circle cx="430" cy="350" r="3" fill="#d946ef" />

                {/* Bottom Left - Occupied */}
                <text x="200" y="650" fill="#d946ef" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}>OCCUPIED (87%)</text>
                <path d="M 280 635 L 350 550" stroke="#d946ef" strokeWidth="1.5" fill="none" opacity="0.8" />
                <circle cx="350" cy="550" r="3" fill="#d946ef" />

                {/* Top Right - Available */}
                <text x="600" y="250" fill="#00f0ff" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}>AVAILABLE / VIP (13%)</text>
                <path d="M 600 245 L 530 350" stroke="#00f0ff" strokeWidth="1.5" fill="none" opacity="0.8" />
                <circle cx="530" cy="350" r="3" fill="#00f0ff" />

                {/* Bottom Right - Available */}
                <text x="650" y="600" fill="#00f0ff" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}>AVAILABLE / VIP (13%)</text>
                <path d="M 650 595 L 580 500" stroke="#00f0ff" strokeWidth="1.5" fill="none" opacity="0.8" />
                <circle cx="580" cy="500" r="3" fill="#00f0ff" />
              </g>

            </svg>
          </div>

          {/* Overlays / HUD Panels */}
          
          {/* Top Left Panel */}
          <div className="absolute top-10 left-10 w-64 bg-[#0a0d14]/80 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 shadow-2xl">
            <h3 className="text-[10px] font-mono text-slate-400 mb-4 tracking-widest uppercase flex items-center gap-2"><Users className="w-3 h-3" /> Seating Capacity</h3>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seatingData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {seatingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#d946ef' : '#00f0ff'} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Right Panel */}
          <div className="absolute top-10 right-14 w-64 bg-[#0a0d14]/80 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 shadow-2xl">
            <h3 className="text-[10px] font-mono text-slate-400 mb-4 tracking-widest uppercase flex items-center gap-2"><Zap className="w-3 h-3" /> Energy Usage</h3>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seatingData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="value" fill="#64748b" radius={[2, 2, 0, 0]} opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-mono mt-2 justify-center text-slate-500">
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#64748b] rounded-sm"></div> CAPACITY</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-400 rounded-sm"></div> AIRFLOW</div>
            </div>
          </div>

          {/* Bottom Right Panel 1 */}
          <div className="absolute bottom-40 right-14 w-64 bg-[#0a0d14]/80 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 shadow-2xl">
            <h3 className="text-[10px] font-mono text-slate-400 mb-4 tracking-widest uppercase flex items-center gap-2"><Droplets className="w-3 h-3" /> Airflow Usage</h3>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={airflowData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="val1" fill="#00f0ff" radius={[2, 2, 0, 0]} opacity={0.7} />
                  <Bar dataKey="val2" fill="#3b82f6" radius={[2, 2, 0, 0]} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Right Panel 2 */}
          <div className="absolute bottom-10 right-14 w-64 bg-[#0a0d14]/80 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 shadow-2xl">
            <h3 className="text-[10px] font-mono text-slate-400 mb-4 tracking-widest uppercase flex items-center gap-2"><Activity className="w-3 h-3" /> Energy Usage Trend</h3>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Area type="monotone" dataKey="value" stroke="#d946ef" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="value" stroke="#00f0ff" fillOpacity={1} fill="url(#colorValue2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Left Panel */}
          <div className="absolute bottom-10 left-10 w-64 bg-[#0a0d14]/80 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 shadow-2xl">
            <h3 className="text-[10px] font-mono text-slate-400 mb-4 tracking-widest uppercase flex items-center gap-2"><Users className="w-3 h-3" /> Seating Capacity Trend</h3>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seatingData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {seatingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00f0ff' : '#d946ef'} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};
