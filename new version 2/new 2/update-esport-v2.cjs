const fs = require('fs');

const code = `import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTicketing } from '../../context/TicketingContext';
import { 
  Maximize, Minimize, ShoppingCart, Map as MapIcon, GripHorizontal, 
  FileText, HelpCircle, Settings, Armchair, PieChart, DollarSign, 
  CheckCircle2, Wrench, RefreshCw, X
} from 'lucide-react';

interface Seat {
  id: string;
  x: number;
  y: number;
  status: 'occupied' | 'available' | 'selected';
  section: string;
  row: string;
  seatNum: number;
  price: number;
  type: 'regular' | 'vip' | 'premium';
  ticketId?: string;
}

const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const rows = 3;
  const seatsPerRow = 24;
  
  for (let r = 0; r < rows; r++) {
    for (let s = 0; s < seatsPerRow; s++) {
      const angle = (s / seatsPerRow) * Math.PI * 2;
      const radiusX = 350 + (r * 60);
      const radiusY = 180 + (r * 30);
      
      const cx = 800;
      const cy = 450; 

      const x = cx + Math.cos(angle) * radiusX;
      const y = cy + Math.sin(angle) * radiusY;

      const isVip = r === 0;
      
      seats.push({
        id: \`eso-\${r}-\${s}\`,
        x,
        y,
        status: Math.random() > 0.8 ? 'occupied' : 'available',
        section: isVip ? 'VIP' : \`Sector \${Math.floor(s/6) + 1}\`,
        row: \`R\${r+1}\`,
        seatNum: s + 1,
        price: isVip ? 150 : 80,
        type: isVip ? 'vip' : 'regular'
      });
    }
  }
  return seats;
};

export interface EsportArenaViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const EsportArenaView: React.FC<EsportArenaViewProps> = ({ onNavigateTab }) => {
  const { toggleCartSeat, firestoreSeats, updateSeatStatus, cartSeats } = useTicketing();
  const initialSeats = useMemo(() => generateSeats(), []);
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{x1: number, y1: number, x2: number, y2: number} | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [activeViewMode, setActiveViewMode] = useState('Seat Info');

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
            newTicketId = \`ESO-\${Math.floor(1000 + Math.random() * 9000)}\`;
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
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const selectedCartSeats = cartSeats.filter(s => s.id.startsWith('eso-'));
  const activeSeat = selectedCartSeats[selectedCartSeats.length - 1]; // Show details for the last selected seat

  return (
    <div ref={containerRef} className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-[#111415] text-[#e1e3e4] font-sans relative selection:bg-[#da70d6] selection:text-[#5a005d]">
      <style>{\`
        .glass-panel {
            background: rgba(17, 20, 21, 0.6);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .neon-glow-primary {
            box-shadow: 0 0 15px rgba(255, 170, 247, 0.3);
        }
        .neon-glow-secondary {
            box-shadow: 0 0 15px rgba(198, 131, 21, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(158, 139, 153, 0.3);
            border-radius: 10px;
        }
        .grid-bg {
            background-image: 
                linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 40px 40px;
        }
      \`}</style>

      {/* Main Layout */}
      <main className="flex-1 flex h-full overflow-hidden relative z-10">
        
        {/* Left SideNavBar */}
        <aside className="bg-[#0c0f10]/20 backdrop-blur-2xl border-r border-white/15 shadow-2xl h-full w-80 flex flex-col justify-between py-6 shrink-0 z-40">
          <div>
            <div className="px-8 mb-6">
              <h2 className="text-[20px] font-bold text-[#ffaaf7]">Arena Alpha</h2>
              <p className="text-[14px] text-[#d5c1cf]">eSport Championship</p>
            </div>
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveViewMode('Map View')}
                className={\`flex items-center gap-3 text-[12px] font-medium py-4 px-8 transition-all duration-300 translate-x-1 \${activeViewMode === 'Map View' ? 'bg-[#da70d6]/20 text-[#ffaaf7] border-l-4 border-[#ffaaf7] rounded-r-lg' : 'text-[#d5c1cf] opacity-60 hover:bg-white/5 hover:opacity-100'}\`}
              >
                <MapIcon className="w-5 h-5" /> Map View
              </button>
              <button 
                onClick={() => setActiveViewMode('Seat Info')}
                className={\`flex items-center gap-3 text-[12px] font-medium py-4 px-8 transition-all duration-300 translate-x-1 \${activeViewMode === 'Seat Info' ? 'bg-[#da70d6]/20 text-[#ffaaf7] border-l-4 border-[#ffaaf7] rounded-r-lg' : 'text-[#d5c1cf] opacity-60 hover:bg-white/5 hover:opacity-100'}\`}
              >
                <GripHorizontal className="w-5 h-5" /> Seat Info
              </button>
              <button 
                onClick={() => setActiveViewMode('Checkout')}
                className={\`flex items-center gap-3 text-[12px] font-medium py-4 px-8 transition-all duration-300 translate-x-1 \${activeViewMode === 'Checkout' ? 'bg-[#da70d6]/20 text-[#ffaaf7] border-l-4 border-[#ffaaf7] rounded-r-lg' : 'text-[#d5c1cf] opacity-60 hover:bg-white/5 hover:opacity-100'}\`}
              >
                <ShoppingCart className="w-5 h-5" /> Checkout
              </button>
              <button 
                onClick={() => setActiveViewMode('History')}
                className={\`flex items-center gap-3 text-[12px] font-medium py-4 px-8 transition-all duration-300 translate-x-1 \${activeViewMode === 'History' ? 'bg-[#da70d6]/20 text-[#ffaaf7] border-l-4 border-[#ffaaf7] rounded-r-lg' : 'text-[#d5c1cf] opacity-60 hover:bg-white/5 hover:opacity-100'}\`}
              >
                <FileText className="w-5 h-5" /> History
              </button>
              <button 
                onClick={() => setActiveViewMode('Support')}
                className={\`flex items-center gap-3 text-[12px] font-medium py-4 px-8 transition-all duration-300 translate-x-1 \${activeViewMode === 'Support' ? 'bg-[#da70d6]/20 text-[#ffaaf7] border-l-4 border-[#ffaaf7] rounded-r-lg' : 'text-[#d5c1cf] opacity-60 hover:bg-white/5 hover:opacity-100'}\`}
              >
                <HelpCircle className="w-5 h-5" /> Support
              </button>
            </nav>
          </div>
          <div className="px-8 mt-auto">
            <button className="w-full py-3 bg-gradient-to-r from-[#da70d6] to-[#c68315] text-white text-[12px] font-medium rounded-lg hover:scale-[1.02] transition-transform duration-300 mb-6 shadow-lg neon-glow-primary">
              Reserve Now
            </button>
            <button className="flex items-center gap-3 text-[12px] font-medium text-[#d5c1cf] py-4 opacity-60 hover:opacity-100 transition-all duration-300">
              <Settings className="w-5 h-5" /> Settings
            </button>
          </div>
        </aside>

        {/* Center Canvas: Interactive CAD Map */}
        <section className="flex-1 relative grid-bg flex flex-col overflow-hidden p-8">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ffaaf7]/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/2 w-[600px] h-[400px] bg-[#ffb95a]/5 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2"></div>
          
          {/* Fullscreen toggle button */}
          <button 
            onClick={toggleFullscreen}
            className="absolute top-8 right-8 z-50 p-2 text-[#d5c1cf] hover:text-[#ffaaf7] transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          {/* Stats Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 z-10">
            <div className="glass-panel p-6 rounded-xl flex items-center justify-between border-t border-t-white/20">
              <div>
                <p className="text-[12px] font-medium text-[#d5c1cf] mb-1">TOTAL SEATS</p>
                <p className="text-[20px] font-bold text-[#e1e3e4]">12,450</p>
              </div>
              <Armchair className="text-[#ffaaf7] w-8 h-8" />
            </div>
            <div className="glass-panel p-6 rounded-xl flex items-center justify-between border-t border-t-white/20">
              <div>
                <p className="text-[12px] font-medium text-[#d5c1cf] mb-1">CAPACITY</p>
                <div className="flex items-end gap-2">
                  <p className="text-[20px] font-bold text-[#e1e3e4]">87%</p>
                  <span className="text-[#ffb95a] text-[12px] mb-1">+2%</span>
                </div>
              </div>
              <PieChart className="text-[#ffb95a] w-8 h-8" />
            </div>
            <div className="glass-panel p-6 rounded-xl flex items-center justify-between border-t border-t-white/20">
              <div>
                <p className="text-[12px] font-medium text-[#d5c1cf] mb-1">REVENUE</p>
                <p className="text-[20px] font-bold text-[#e1e3e4]">$1.2M</p>
              </div>
              <DollarSign className="text-[#d0c1dc] w-8 h-8" />
            </div>
          </div>

          {/* CAD Map Container */}
          <div className="flex-1 glass-panel rounded-xl border-t border-t-white/20 relative overflow-hidden group flex items-center justify-center">
            
            {/* Background Map Image */}
            <img 
              src="https://lh3.googleusercontent.com/aida/AP1WRLsVWc2F-r846J_4tNTqQzvmaXKs8Pw-9n_DW9VF3NPt1zty1FxJlo-kfsOMdW7AbOxjsN5WwqHbgHA3ouR7SbgFwszjg09sGbBDJQxiOPCDugvfqJxZTiOZuIdpSdaIpQrL1SVoIXg03iWMKlH9KmdqZF1GM3cE7MCq6808m7ZtpBZqnXKb5KUGmByiZD8HeqLNaqXcAqsLnuKRVunaRRMPmzdov9zStGj4QOVW63aPNqVQAWo1AHGu6w"
              alt="Stadium CAD Map" 
              className="w-full h-full object-cover opacity-60 mix-blend-screen group-hover:scale-[1.01] transition-transform duration-700 ease-out absolute inset-0 pointer-events-none"
            />
            
            {/* SVG Seat Overlays */}
            <svg 
              ref={svgRef}
              className="absolute inset-0 w-full h-full pointer-events-auto select-none z-10" 
              viewBox="0 0 1600 900" 
              preserveAspectRatio="xMidYMid meet"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {selectionBox && (
                <rect 
                  x={Math.min(selectionBox.x1, selectionBox.x2)} 
                  y={Math.min(selectionBox.y1, selectionBox.y2)} 
                  width={Math.abs(selectionBox.x2 - selectionBox.x1)} 
                  height={Math.abs(selectionBox.y2 - selectionBox.y1)} 
                  fill="rgba(255, 170, 247, 0.2)" 
                  stroke="#ffaaf7" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                />
              )}
              {seats.map(seat => (
                <circle
                  key={seat.id}
                  cx={seat.x}
                  cy={seat.y}
                  r="6"
                  onClick={() => handleSeatClick(seat.id)}
                  fill={seat.status === 'selected' ? '#ffaaf7' : seat.status === 'occupied' ? '#5a005d' : 'transparent'}
                  stroke={seat.status === 'selected' ? '#ffffff' : seat.status === 'occupied' ? '#973497' : '#00f0ff'}
                  strokeWidth={seat.status === 'selected' ? "2" : "1.5"}
                  className={\`transition-all duration-300 \${seat.status !== 'occupied' ? 'cursor-pointer hover:stroke-white' : ''}\`}
                  style={{
                    filter: seat.status === 'selected' ? \`drop-shadow(0 0 12px #ffaaf7)\` : (seat.status === 'available' ? 'drop-shadow(0 0 4px #00f0ff)' : 'none')
                  }}
                />
              ))}
            </svg>
            
            {/* Legend inside map container */}
            <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
              <div className="glass-panel p-3 rounded-lg flex flex-col gap-2 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#da70d6] neon-glow-primary"></div>
                  <span className="text-[12px] font-medium text-[#d5c1cf]">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#323536] border border-[#9e8b99]"></div>
                  <span className="text-[12px] font-medium text-[#d5c1cf]">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#c68315] neon-glow-secondary"></div>
                  <span className="text-[12px] font-medium text-[#d5c1cf]">VIP</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Right Sidebar: Seat Detail Panel */}
        <aside className="w-96 border-l border-white/15 bg-[#0c0f10]/40 backdrop-blur-md flex flex-col p-8 overflow-y-auto custom-scrollbar z-30 shrink-0">
          
          {!activeSeat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <Armchair className="w-12 h-12 text-[#d5c1cf] mb-4" />
              <p className="text-[14px] text-[#d5c1cf]">Select a seat on the map<br/>to view details</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-[#da70d6]/20 border border-[#da70d6]/50 rounded-full text-[10px] font-medium text-[#ffaaf7] uppercase tracking-wider">SELECTED</span>
                  <button onClick={() => handleSeatClick(activeSeat.id)} className="text-[#d5c1cf] hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-[32px] font-bold text-[#e1e3e4]">{activeSeat.section}-{activeSeat.row}</h3>
                <p className="text-[14px] text-[#d5c1cf]">Seat {activeSeat.seatNum} • {activeSeat.type.toUpperCase()}</p>
              </div>

              <div className="space-y-6">
                {/* Status Card */}
                <div className="glass-panel p-6 rounded-xl border-t border-t-white/20">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[12px] font-medium text-[#d5c1cf] uppercase">STATUS</span>
                    <span className="text-[#ffaaf7] text-[12px] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Available
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-[#d5c1cf] uppercase">CURRENT PRICE</span>
                    <span className="text-[20px] font-bold text-[#ffb95a]">\${activeSeat.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Occupancy History */}
                <div className="glass-panel p-6 rounded-xl border-t border-t-white/20">
                  <h4 className="text-[12px] font-medium text-[#d5c1cf] uppercase mb-4">OCCUPANCY HISTORY</h4>
                  <div className="h-32 w-full flex items-end gap-2 justify-between">
                    {/* Faux Chart Bars */}
                    <div className="w-full bg-[#323536]/50 rounded-t-sm h-[40%] hover:bg-[#ffaaf7]/40 transition-colors relative group">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#111415] p-1 rounded text-[10px] hidden group-hover:block border border-white/10">40%</div>
                    </div>
                    <div className="w-full bg-[#323536]/50 rounded-t-sm h-[60%] hover:bg-[#ffaaf7]/40 transition-colors"></div>
                    <div className="w-full bg-[#323536]/50 rounded-t-sm h-[85%] hover:bg-[#ffaaf7]/40 transition-colors"></div>
                    <div className="w-full bg-[#ffaaf7]/40 rounded-t-sm h-[95%] border-t border-[#ffaaf7] neon-glow-primary"></div>
                    <div className="w-full bg-[#323536]/50 rounded-t-sm h-[70%] hover:bg-[#ffaaf7]/40 transition-colors"></div>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-medium text-[#d5c1cf]/50 uppercase">
                    <span>MON</span>
                    <span>FRI</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 mt-auto pt-6">
                  <button className="w-full py-3 bg-[#da70d6] text-[#5a005d] text-[12px] font-medium rounded-lg hover:scale-[1.02] transition-transform duration-300 shadow-lg">
                    Reserve Seat
                  </button>
                  <button className="w-full py-3 border border-[#9e8b99]/30 text-[#e1e3e4] text-[12px] font-medium rounded-lg hover:bg-white/5 transition-colors duration-300 flex items-center justify-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Mark Maintenance
                  </button>
                  <button className="w-full py-3 border border-[#9e8b99]/30 text-[#e1e3e4] text-[12px] font-medium rounded-lg hover:bg-white/5 transition-colors duration-300 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Update Pricing
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
};
`;
fs.writeFileSync('src/components/spaceflow/EsportArenaView.tsx', code);
console.log('done');
