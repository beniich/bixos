import React, { useState, useEffect, useRef } from 'react';
import { 
  Ticket, Map, QrCode, Mail, Calendar, ShieldCheck, Download, Code, Smartphone, 
  Store, Key, Printer, LayoutGrid, CreditCard, CheckCircle, BarChart, Bell, Search, 
  ChevronDown, User, Settings, Menu, ShoppingCart, Gamepad2, Database, Wifi, 
  Check, AlertTriangle, RefreshCw, Send, Lock, Copy, Eye, ExternalLink, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EsportArenaView } from './EsportArenaView';
import { EcoAssetDashboard } from './EcoAssetDashboard';
import { EcoAssetEventForm } from './EcoAssetEventForm';
import { TicketingProvider, useTicketing } from '../../context/TicketingContext';

export const EcoAssetPluginView: React.FC = () => {
  return (
    <TicketingProvider>
      <EcoAssetPluginMain />
    </TicketingProvider>
  );
};

const EcoAssetPluginMain: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('events');
  const { 
    isBackendConnected, 
    toggleBackendMode, 
    selectedVenue, 
    setSelectedVenue, 
    cartSeats, 
    bookings, 
    activeBooking,
    setActiveBooking,
    totalRevenue,
    logs,
    resetDemoData,
    events,
    activeEvent,
    setActiveEvent
  } = useTicketing();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 animate-fade-in font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Sync & Status Control Banner */}
        <div className="mb-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isBackendConnected ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-amber-500/10 border-amber-500/40 text-amber-400'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">
                  {isBackendConnected ? 'Backend Firestore Cloud Connecté' : 'Mode Simulée (Local Mock)'}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${isBackendConnected ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-amber-950 text-amber-300 border-amber-700'}`}>
                  {isBackendConnected ? 'Live Firestore' : 'Offline Storage'}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                <span>DB: ai-studio-bizoswebandios-18bec7a3-9311-456d-986d-a6c8f02a8c94</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Event Selector dropdown */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={activeEvent?.id || ''}
                onChange={(e) => {
                  const ev = events.find(item => item.id === e.target.value);
                  if (ev) setActiveEvent(ev);
                }}
                className="bg-transparent border-none text-white focus:outline-none font-semibold cursor-pointer max-w-[150px] md:max-w-[200px]"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id} className="bg-slate-900 text-white">
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden lg:flex items-center gap-4 text-xs text-slate-300 border-r border-slate-800 pr-4">
              <div>Lieu: <span className="text-cyan-400 font-semibold">{selectedVenue}</span></div>
              <div>Billets: <span className="text-purple-400 font-semibold">{bookings.length}</span></div>
              <div>Recettes: <span className="text-emerald-400 font-semibold">{totalRevenue} €</span></div>
            </div>

            <button
              onClick={toggleBackendMode}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isBackendConnected
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isBackendConnected ? 'Basculer en Mode Simulée' : 'Activer Firestore Cloud'}</span>
            </button>

            <button
              onClick={resetDemoData}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors"
              title="Réinitialiser les données de démo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-[0_0_25px_rgba(59,130,246,0.4)]">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-3 tracking-tight">
            EcoAsset Ticketing Plugin
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            La solution WordPress ultime pour la billetterie avancée. Lieux interactifs, check-in par QR code et CRM événementiel connecté.
          </p>
        </div>

        {/* Tab Navigation Primary */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-4">
          <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} icon={<Calendar />} label="Gestion Événements" />
          <TabButton active={activeTab === 'arena'} onClick={() => setActiveTab('arena')} icon={<Gamepad2 />} label="Plan Arène eSport" />
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<ShieldCheck />} label="Vue d'ensemble" />
          <TabButton active={activeTab === 'venues'} onClick={() => setActiveTab('venues')} icon={<LayoutGrid />} label="Bibliothèque" />
          <TabButton active={activeTab === 'seats'} onClick={() => setActiveTab('seats')} icon={<Map />} label={`Sélecteur (${cartSeats.length})`} />
          <TabButton active={activeTab === 'checkout'} onClick={() => setActiveTab('checkout')} icon={<CreditCard />} label="Paiement" />
          <TabButton active={activeTab === 'ticket'} onClick={() => setActiveTab('ticket')} icon={<Ticket />} label="E-Ticket" />
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart />} label="Analytics" />
          <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell />} label="Notifications" />
        </div>
        
        {/* Secondary Tech Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 opacity-85 scale-95">
          <TabButton active={activeTab === 'checkin'} onClick={() => setActiveTab('checkin')} icon={<QrCode />} label="Caisse & Scanner" />
          <TabButton active={activeTab === 'emails'} onClick={() => setActiveTab('emails')} icon={<Mail />} label="Emails & Crons" />
          <TabButton active={activeTab === 'pwa'} onClick={() => setActiveTab('pwa')} icon={<Smartphone />} label="Mobile PWA" />
          <TabButton active={activeTab === 'vendor'} onClick={() => setActiveTab('vendor')} icon={<Store />} label="Multi-Vendor" />
          <TabButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={<Key />} label="API REST & OAuth" />
          <TabButton active={activeTab === 'print'} onClick={() => setActiveTab('print')} icon={<Printer />} label="Impression Badges" />
        </div>

        {/* Tab Content Container */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 md:p-8 shadow-2xl min-h-[600px]">
          {activeTab === 'events' && <EventsManagerTab />}
          {activeTab === 'arena' && <EsportArenaView onNavigateTab={(tab) => setActiveTab(tab)} />}
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'venues' && <VenuesTab onSelectVenue={() => setActiveTab('arena')} />}
          {activeTab === 'seats' && <SeatsTab onProceedToCheckout={() => setActiveTab('checkout')} />}
          {activeTab === 'checkout' && <CheckoutTab onCheckoutComplete={() => setActiveTab('ticket')} />}
          {activeTab === 'ticket' && <TicketTab />}
          {activeTab === 'analytics' && <EcoAssetDashboard />}
          {activeTab === 'notifications' && <NotificationsTab />}
          
          {activeTab === 'checkin' && <CheckinTab />}
          {activeTab === 'emails' && <EmailsTab />}
          {activeTab === 'pwa' && <PWATab />}
          {activeTab === 'vendor' && <VendorTab />}
          {activeTab === 'api' && <ApiTab />}
          {activeTab === 'print' && <PrintTab />}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-300 cursor-pointer ${
      active 
        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-500 scale-[1.02]' 
        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/60'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-4 h-4' })}
    {label}
  </button>
);

// ----------------------------------------------------
// TAB 1: VENUES TAB (Bibliothèque des lieux)
// ----------------------------------------------------
const VenuesTab = ({ onSelectVenue }: { onSelectVenue: () => void }) => {
  const { selectedVenue, setSelectedVenue, addLog } = useTicketing();
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const venues = [
    { id: 1, name: "Arena E-Sport BizOS", cap: "1 500 places", type: "Sport", desc: "Configuration stadium high-tech avec cube LED 360°" },
    { id: 2, name: "Stade BizOS", cap: "80 000 places", type: "Sport", desc: "Complexe omnisport majeur avec gradins rétractables" },
    { id: 3, name: "Opéra Garnier BizOS", cap: "1 900 places", type: "Culture", desc: "Salle acoustique d'exception et loges dorées VIP" },
    { id: 4, name: "Centre de Conférence BizOS", cap: "12 000 places", type: "Business", desc: "Auditorium modulaire pour keynotes et salons d'entreprise" },
    { id: 5, name: "Bowling Strike Center BizOS", cap: "200 places", type: "Sport", desc: "Espace eSport lounge et pistes VIP privatables" },
    { id: 6, name: "Circuit Karting BizOS", cap: "1 500 places", type: "Sport", desc: "Circuit couvert avec stands connectés IoT" },
    { id: 7, name: "Musée d'Art Moderne BizOS", cap: "800 places", type: "Culture", desc: "Galerie immersive avec projection mapping 8K" },
    { id: 8, name: "Complexe Aquatique BizOS", cap: "2 500 places", type: "Sport", desc: "Bassin olympique avec gradins chauffés" },
  ];

  const filtered = venues.filter(v => {
    const matchesCat = filterCat === 'Tous' || v.type === filterCat;
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleChoose = (name: string) => {
    setSelectedVenue(name);
    addLog('Changement de Lieu', 'info', `Lieu actif défini sur ${name}`);
    onSelectVenue();
  };

  return (
    <div className="animate-fade-in space-y-8 bg-[#0a0f1c] p-6 md:p-8 rounded-3xl border border-slate-800 font-sans">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-white">Bibliothèque de Plans & Lieux BizOS</h2>
        <p className="text-cyan-400 text-sm">Sélectionnez un lieu pour charger sa géométrie 3D et sa grille de tarifs.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un lieu..." 
            className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-full py-3 pl-12 pr-4 text-white text-sm focus:outline-none transition-all" 
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['Tous', 'Sport', 'Culture', 'Business'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilterCat(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                filterCat === cat 
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10 shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                  : 'border-slate-800 text-slate-400 hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl h-56 border border-slate-800 animate-pulse p-4" />
          ))
        ) : (
          filtered.map((v) => {
            const isCurrent = selectedVenue === v.name;
            return (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                key={v.id} 
                onClick={() => handleChoose(v.name)}
                className={`bg-slate-900 rounded-2xl overflow-hidden border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isCurrent 
                    ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] bg-cyan-950/20' 
                    : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="h-36 bg-slate-950/80 relative p-4 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                  <Map className={`w-14 h-14 relative z-10 transition-transform group-hover:scale-110 ${isCurrent ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'text-slate-600'}`} />
                  <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-700 text-slate-300 text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md font-mono">
                    {v.cap}
                  </div>
                  {isCurrent && (
                    <div className="absolute top-3 left-3 bg-cyan-500 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3" /> ACTIF
                    </div>
                  )}
                </div>
                <div className="p-4 bg-slate-800/60 border-t border-slate-800/80 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base mb-1">{v.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{v.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{v.type}</span>
                    <span className="text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Ouvrir Plan &rarr;
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// TAB 2: SEATS TAB (Sélecteur de sièges)
// ----------------------------------------------------
const SeatsTab = ({ onProceedToCheckout }: { onProceedToCheckout: () => void }) => {
  const { selectedVenue, cartSeats, toggleCartSeat, clearCart } = useTicketing();
  const [zoomScale, setZoomScale] = useState(1);
  const [hoveredSeat, setHoveredSeat] = useState<{ id: string; section: string; price: number } | null>(null);

  const totalCartPrice = cartSeats.reduce((acc, s) => acc + s.price, 0);

  const isSelected = (seatId: string) => cartSeats.some(s => s.id === seatId);

  const handleSeatClick = (seatId: string, section: string, price: number, type: 'regular' | 'vip' = 'regular') => {
    toggleCartSeat({
      id: seatId,
      section,
      price,
      type
    });
  };

  return (
    <div className="animate-fade-in space-y-6 bg-[#111415] p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-300/80 uppercase tracking-widest font-semibold mb-1">
            <span>{selectedVenue}</span>
            <span>&gt;</span>
            <span className="text-purple-300">Sélecteur de Sièges 3D</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-purple-300 via-pink-300 to-amber-200 bg-clip-text text-transparent">
            Plan Interactif - {selectedVenue}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-white/10">
            <button onClick={() => setZoomScale(Math.min(zoomScale + 0.15, 1.4))} className="p-2 hover:bg-white/10 rounded-lg text-slate-300">
              <Search className="w-4 h-4" />
            </button>
            <button onClick={() => setZoomScale(Math.max(zoomScale - 0.15, 0.7))} className="p-2 hover:bg-white/10 rounded-lg text-slate-300">
              <Search className="w-4 h-4 transform rotate-90" />
            </button>
            <button onClick={() => setZoomScale(1)} className="px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 rounded-lg">Reset</button>
          </div>

          <div className="w-10 h-10 rounded-xl border border-purple-500/50 bg-purple-950/40 flex items-center justify-center text-purple-300 relative">
            <ShoppingCart className="w-5 h-5"/>
            {cartSeats.length > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-slate-900">
                {cartSeats.length}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* SVG Interactive Map */}
        <div className="xl:col-span-8 bg-slate-950/90 border border-purple-500/20 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden min-h-[520px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Map className="w-4 h-4 text-purple-400" /> Vue Scénique 3D
            </h3>
            <div className="text-xs text-slate-400">
              {hoveredSeat ? (
                <span className="text-purple-300 font-semibold bg-purple-900/40 px-3 py-1 rounded-full border border-purple-500/30">
                  {hoveredSeat.id} ({hoveredSeat.section}) - {hoveredSeat.price}€
                </span>
              ) : (
                <span className="italic">Cliquez sur un siège pour ajouter au panier</span>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <motion.div style={{ scale: zoomScale }} className="w-full max-w-[700px]">
              <svg viewBox="0 0 800 440" className="w-full h-auto">
                {/* Stage Center */}
                <g transform="translate(400, 160)">
                  <polygon points="0,-45 55,-22 55,22 0,45 -55,22 -55,-22" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" strokeWidth="2" />
                  <text x="0" y="4" fill="#e2e8f0" fontSize="11" fontWeight="700" textAnchor="middle">SCÈNE CENTRALE</text>
                </g>

                {/* VIP West */}
                <g transform="translate(140, 180) rotate(15)">
                  <rect x="-40" y="-60" width="80" height="120" rx="10" fill="rgba(245, 158, 11, 0.05)" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                  <text x="0" y="-70" fill="#f59e0b" fontSize="10" fontWeight="700" textAnchor="middle">VIP West</text>
                  {['VIP-W1', 'VIP-W2', 'VIP-W3', 'VIP-W4'].map((id, idx) => {
                    const active = isSelected(id);
                    const cx = idx % 2 === 0 ? -18 : 18;
                    const cy = idx < 2 ? -25 : 25;
                    return (
                      <circle
                        key={id}
                        cx={cx} cy={cy} r="10"
                        onClick={() => handleSeatClick(id, 'VIP West', 195, 'vip')}
                        onMouseEnter={() => setHoveredSeat({ id, section: 'VIP West', price: 195 })}
                        onMouseLeave={() => setHoveredSeat(null)}
                        className="cursor-pointer transition-all hover:scale-125"
                        fill={active ? "#ec4899" : "rgba(245, 158, 11, 0.3)"}
                        stroke={active ? "#ffffff" : "#f59e0b"}
                        strokeWidth="2"
                      />
                    );
                  })}
                </g>

                {/* VIP East */}
                <g transform="translate(660, 180) rotate(-15)">
                  <rect x="-40" y="-60" width="80" height="120" rx="10" fill="rgba(245, 158, 11, 0.05)" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                  <text x="0" y="-70" fill="#f59e0b" fontSize="10" fontWeight="700" textAnchor="middle">VIP East</text>
                  {['VIP-E1', 'VIP-E2', 'VIP-E3', 'VIP-E4'].map((id, idx) => {
                    const active = isSelected(id);
                    const cx = idx % 2 === 0 ? -18 : 18;
                    const cy = idx < 2 ? -25 : 25;
                    return (
                      <circle
                        key={id}
                        cx={cx} cy={cy} r="10"
                        onClick={() => handleSeatClick(id, 'VIP East', 195, 'vip')}
                        onMouseEnter={() => setHoveredSeat({ id, section: 'VIP East', price: 195 })}
                        onMouseLeave={() => setHoveredSeat(null)}
                        className="cursor-pointer transition-all hover:scale-125"
                        fill={active ? "#ec4899" : "rgba(245, 158, 11, 0.3)"}
                        stroke={active ? "#ffffff" : "#f59e0b"}
                        strokeWidth="2"
                      />
                    );
                  })}
                </g>

                {/* Grandstand Rows */}
                <g transform="translate(400, 250)">
                  {/* Arc 1 */}
                  <path d="M -160 30 A 160 160 0 0 0 160 30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="22" strokeLinecap="round" />
                  {[-120, -80, -40, 0, 40, 80, 120].map((x, i) => {
                    const id = `O-${i + 1}`;
                    const active = isSelected(id);
                    return (
                      <rect
                        key={id}
                        x={x - 8} y={30} width="16" height="16" rx="4"
                        onClick={() => handleSeatClick(id, 'Orchestra A', 149)}
                        onMouseEnter={() => setHoveredSeat({ id, section: 'Orchestra A', price: 149 })}
                        onMouseLeave={() => setHoveredSeat(null)}
                        className="cursor-pointer transition-all hover:scale-125"
                        fill={active ? "#ec4899" : "rgba(168, 85, 247, 0.3)"}
                        stroke={active ? "#ffffff" : "#a855f7"}
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  {/* Arc 2 */}
                  <path d="M -220 70 A 220 220 0 0 0 220 70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="24" strokeLinecap="round" />
                  {[-160, -120, -80, -40, 0, 40, 80, 120, 160].map((x, i) => {
                    const id = `K-${i + 10}`;
                    const active = isSelected(id);
                    return (
                      <rect
                        key={id}
                        x={x - 8} y={72} width="16" height="16" rx="4"
                        onClick={() => handleSeatClick(id, 'Mezzanine K', 125)}
                        onMouseEnter={() => setHoveredSeat({ id, section: 'Mezzanine K', price: 125 })}
                        onMouseLeave={() => setHoveredSeat(null)}
                        className="cursor-pointer transition-all hover:scale-125"
                        fill={active ? "#ec4899" : "rgba(59, 130, 246, 0.3)"}
                        stroke={active ? "#ffffff" : "#3b82f6"}
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </g>
              </svg>
            </motion.div>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-wrap gap-6 justify-center text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500" /><span className="text-slate-300">Disponible</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-pink-500 border border-white" /><span className="text-slate-300">Sélectionné ({cartSeats.length})</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" /><span className="text-slate-300">VIP Box</span></div>
          </div>
        </div>

        {/* Sidebar Cart */}
        <div className="xl:col-span-4 bg-slate-900/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-lg">Paniers de Sièges</h3>
              {cartSeats.length > 0 && (
                <button onClick={clearCart} className="text-xs text-rose-400 hover:underline">Vider</button>
              )}
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {cartSeats.length > 0 ? (
                cartSeats.map(s => (
                  <div key={s.id} className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl border border-white/5 text-sm">
                    <div>
                      <div className="text-white font-semibold">Siège {s.id}</div>
                      <div className="text-xs text-purple-300">{s.section}</div>
                    </div>
                    <div className="font-bold text-amber-300">{s.price} €</div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-xs text-center py-10 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                  Aucun siège sélectionné. Cliquez sur un siège dans la salle.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex justify-between text-base font-bold text-white mb-4">
              <span>Prix Total</span>
              <span className="text-amber-400 text-xl">{totalCartPrice} €</span>
            </div>

            <button
              onClick={onProceedToCheckout}
              disabled={cartSeats.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Passer au Paiement &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// TAB 3: CHECKOUT TAB (Paiement et confirmation)
// ----------------------------------------------------
const CheckoutTab = ({ onCheckoutComplete }: { onCheckoutComplete: () => void }) => {
  const { cartSeats, createBooking, selectedVenue, isBackendConnected } = useTicketing();
  const [customerName, setCustomerName] = useState('Alexandre Laurent');
  const [customerEmail, setCustomerEmail] = useState('alex.laurent@bizos.io');
  const [paymentMethod, setPaymentMethod] = useState('Carte Bancaire');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = cartSeats.reduce((sum, s) => sum + s.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await createBooking({
      name: customerName,
      email: customerEmail,
      paymentMethod
    });
    setIsProcessing(false);
    onCheckoutComplete();
  };

  return (
    <div className="animate-fade-in bg-[#03000a] p-6 md:p-8 rounded-3xl min-h-[580px] flex flex-col justify-between relative overflow-hidden font-sans border border-purple-900/50">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-purple-400" /> Formulaire de Paiement Sécurisé
          </h2>
          <p className="text-slate-400 text-xs mt-1">Lieu : <span className="text-purple-300 font-semibold">{selectedVenue}</span></p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full border ${isBackendConnected ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
          {isBackendConnected ? 'Firestore Synchronisé' : 'Mock Local Mode'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Left: Summary */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3">Récapitulatif de la Commande</h3>
            
            <div className="space-y-3 mb-6 max-h-[200px] overflow-y-auto">
              {cartSeats.length > 0 ? (
                cartSeats.map(s => (
                  <div key={s.id} className="flex justify-between items-center text-xs bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
                    <div>
                      <div className="text-white font-semibold">Siège {s.id}</div>
                      <div className="text-slate-400">{s.section}</div>
                    </div>
                    <div className="text-amber-400 font-bold">{s.price} €</div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs italic py-6 text-center">
                  Aucun siège personnalisé sélectionné. Un billet standard sera généré.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/10 text-xs">
            <div className="flex justify-between text-slate-400"><span>Sous-total</span><span>{totalPrice || 149} €</span></div>
            <div className="flex justify-between text-slate-400"><span>Frais de service BizOS</span><span>Offerts</span></div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
              <span>Total à payer</span>
              <span className="text-emerald-400 text-xl">{totalPrice || 149} €</span>
            </div>
          </div>
        </div>

        {/* Right: Payment form */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Elegant warning notice about Demo Mode limits */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start gap-2.5">
              <span className="text-sm shrink-0">⚠️</span>
              <div className="space-y-0.5">
                <span className="font-bold uppercase tracking-wider block text-amber-400">Environnement de Démo</span>
                <p className="text-slate-300 leading-normal">
                  Cette application est présentée à des fins de démonstration. Elle <strong>ne peut pas accepter de vrais paiements</strong> ni servir de vrais clients en l'état actuel.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-semibold">Nom & Prénom</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-semibold">Adresse Email</label>
                <input 
                  type="email" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs mb-1 font-semibold">Méthode de Paiement</label>
              <div className="grid grid-cols-3 gap-3">
                {['Carte Bancaire', 'Apple Pay', 'Crypto (BTC)'].map(m => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      paymentMethod === m 
                        ? 'border-purple-500 bg-purple-900/30 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-xl text-white font-bold text-base shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Traitement en cours...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Payer &amp; Obtenir le Billet ({totalPrice || 149} €)
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// TAB 4: TICKET TAB (Visualisation E-Ticket & QR)
// ----------------------------------------------------
const TicketTab = () => {
  const { bookings, activeBooking, setActiveBooking, addLog } = useTicketing();
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [sendStep, setSendStep] = useState(0);

  const displayTicket = activeBooking || bookings[0];

  useEffect(() => {
    if (displayTicket) {
      setEmailInput(displayTicket.customerEmail || '');
      setEmailSentSuccess(false);
      setSendStep(0);
    }
  }, [displayTicket]);

  const handleCopyCode = () => {
    if (!displayTicket) return;
    navigator.clipboard.writeText(displayTicket.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!displayTicket) return;
    setIsPrinting(true);
    addLog(
      'Impression Billet',
      'info',
      `Lancement de l'impression du billet #${displayTicket.id} pour ${displayTicket.customerName}`
    );
    
    setTimeout(() => {
      setIsPrinting(false);
      window.print();
    }, 1200);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayTicket || !emailInput.trim()) return;
    
    setIsSendingEmail(true);
    setSendStep(1);
    
    const interval = setInterval(() => {
      setSendStep(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          setIsSendingEmail(false);
          setEmailSentSuccess(true);
          addLog(
            'Email Billet Envoyé',
            'success',
            `Le billet #${displayTicket.id} pour "${displayTicket.eventName}" a été envoyé à ${emailInput}`
          );
          return 4;
        }
        return prev + 1;
      });
    }, 700);
  };

  return (
    <div className="animate-fade-in bg-[#070b19] p-4 md:p-8 rounded-3xl min-h-[580px] flex flex-col items-center justify-center relative overflow-hidden font-sans border border-slate-800">
      
      {/* Hide the rest of the application when printing is triggered */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible;
          }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
            border-radius: 0;
            border: 2px solid black;
          }
        }
      `}</style>

      <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-7 h-7 text-blue-400" /> Billet Électronique &amp; Impression
          </h2>
          <p className="text-slate-400 text-xs">Visualisation, envoi par email et impression instantanée de votre e-ticket.</p>
        </div>

        {/* Dropdown ticket picker */}
        {bookings.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400">Choisir Billet:</span>
            <select 
              value={displayTicket?.id || ''}
              onChange={(e) => {
                const found = bookings.find(b => b.id === e.target.value);
                if (found) setActiveBooking(found);
              }}
              className="bg-transparent text-white font-mono focus:outline-none cursor-pointer border-none"
            >
              {bookings.map(b => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.id} - {b.customerName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {displayTicket ? (
        <div className="w-full max-w-4xl space-y-6">
          {/* Main Ticket Layout */}
          <motion.div 
            id="printable-ticket"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 relative shadow-2xl flex flex-col md:flex-row gap-6 overflow-hidden"
          >
            {/* Lanyard eyelet hole representation */}
            <div className="absolute top-1/2 left-0 w-6 h-12 bg-slate-950 rounded-r-full -translate-y-1/2 border-r border-slate-800 hidden md:block" />
            <div className="absolute top-1/2 right-0 w-6 h-12 bg-slate-950 rounded-l-full -translate-y-1/2 border-l border-slate-800 hidden md:block" />

            {/* Left Details */}
            <div className="flex-1 space-y-4 border-b md:border-b-0 md:border-r border-slate-800/80 pb-6 md:pb-0 md:pr-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-800/80">
                  {displayTicket.ticketCode}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${displayTicket.status === 'CHECKED_IN' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-blue-950 text-blue-300 border border-blue-700'}`}>
                  {displayTicket.status === 'CHECKED_IN' ? '✓ VALIDÉ' : 'CONFIRMÉ'}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white leading-tight">{displayTicket.eventName}</h3>
                <p className="text-slate-300 text-sm mt-1">{displayTicket.venueName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[10px]">Titulaire</span>
                  <span className="text-white font-semibold text-sm">{displayTicket.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[10px]">Date &amp; Heure</span>
                  <span className="text-white font-semibold text-sm">{displayTicket.eventDate} à {displayTicket.eventTime}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block mb-1">Siège(s) Réservé(s)</span>
                <div className="flex flex-wrap gap-2">
                  {displayTicket.seats.map(s => (
                    <span key={s.id} className="bg-purple-950/50 border border-purple-800 text-purple-200 text-xs px-2.5 py-1 rounded-lg font-mono">
                      Siège {s.id} ({s.section})
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Code unique ID: <strong className="text-white font-mono">{displayTicket.id}</strong></span>
                <button onClick={handleCopyCode} className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer">
                  <Copy className="w-3 h-3" /> {copied ? 'Copié !' : 'Copier ID'}
                </button>
              </div>
            </div>

            {/* Right QR Code Section */}
            <div className="w-full md:w-56 flex flex-col items-center justify-center p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
              <div className="p-4 bg-white rounded-2xl shadow-[0_0_25px_rgba(59,130,246,0.15)] mb-3">
                <QrCode className="w-28 h-28 text-slate-950" />
              </div>
              <span className="text-xs text-slate-300 font-mono text-center font-bold uppercase tracking-wider">Scan pour Entrée</span>
              <span className="text-[10px] text-slate-500 mt-1">Cryptage TLS 256-bit BizOS</span>
            </div>
          </motion.div>

          {/* Ticket printing and email sending toolbar */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Print Toolbar Box */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-purple-400" />
                <h4 className="text-sm font-bold text-white">Impression du Billet</h4>
              </div>
              <p className="text-xs text-slate-400">Générez la version d'impression du billet pour guichet ou impression de reçus standard A4/A5.</p>
              
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPrinting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Préparation du flux d'impression...
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    Lancer l'impression (Imprimer)
                  </>
                )}
              </button>
            </div>

            {/* Email dispatch Box */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Envoyer le Billet par Email</h4>
              </div>
              
              <form onSubmit={handleSendEmail} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setEmailSentSuccess(false);
                    }}
                    placeholder="adresse.client@domaine.fr"
                    required
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingEmail ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {isSendingEmail && (
                  <div className="space-y-1.5 text-[10px] text-cyan-400/90 font-mono bg-cyan-950/20 p-2.5 rounded-lg border border-cyan-500/20">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                      <span>
                        {sendStep === 1 && 'Génération du ticket HD en cours...'}
                        {sendStep === 2 && 'Intégration du code QR sécurisé...'}
                        {sendStep === 3 && 'Acheminement via passerelle SMTP BizOS...'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: `${(sendStep / 3) * 100}%` }} />
                    </div>
                  </div>
                )}

                {emailSentSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Billet envoyé avec succès à <strong className="font-mono">{emailInput}</strong> !</span>
                  </motion.div>
                )}
              </form>
            </div>

          </div>

          {/* Email HTML Preview simulation drawer */}
          {emailSentSuccess && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-white rounded-2xl p-5 text-slate-800 border border-slate-200 mt-4 overflow-hidden shadow-inner font-sans relative"
            >
              <div className="absolute top-2 right-4 bg-slate-100 text-slate-600 font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-slate-300">
                Aperçu de la Boîte de Réception du Client
              </div>
              <div className="border-b border-slate-200 pb-3 mb-3">
                <div className="text-xs text-slate-500">De : <strong className="text-slate-700">billetterie@bizos.io</strong></div>
                <div className="text-xs text-slate-500">À : <strong className="text-slate-700">{emailInput}</strong></div>
                <div className="text-xs text-slate-500 mt-1">Objet : <strong className="text-slate-800">🎟️ Confirmation d'achat - Billet Officiel {displayTicket.id}</strong></div>
              </div>
              <div className="space-y-3.5 max-w-lg mx-auto py-2">
                <div className="text-center font-bold text-lg text-slate-900 border-b pb-2">EcoAsset eSports Platform</div>
                <p className="text-xs">Bonjour <strong>{displayTicket.customerName}</strong>,</p>
                <p className="text-xs">Nous vous confirmons l'achat de vos places pour l'événement <strong>{displayTicket.eventName}</strong> au <strong>{displayTicket.venueName}</strong>.</p>
                
                {/* Embedded mini ticket in email */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                  <div className="font-bold border-b pb-1 text-slate-700">RÉCAPITULATIF DE VOTRE COMMANDE :</div>
                  <div>Code de réservation : <span className="font-mono font-bold text-purple-600">{displayTicket.id}</span></div>
                  <div>Date : <span className="font-semibold">{displayTicket.eventDate} à {displayTicket.eventTime}</span></div>
                  <div>Sièges : <span className="font-semibold text-slate-700">{displayTicket.seats.map(s => `${s.id} (${s.section})`).join(', ')}</span></div>
                  <div className="flex flex-col items-center justify-center pt-3 border-t mt-2">
                    <QrCode className="w-24 h-24 text-slate-900" />
                    <span className="text-[10px] text-slate-500 font-mono mt-1">{displayTicket.ticketCode}</span>
                  </div>
                </div>
                
                <p className="text-[11px] text-slate-500 text-center border-t pt-3">Ce message contient votre titre d'accès unique. Conservez-le précieusement.</p>
              </div>
            </motion.div>
          )}

        </div>
      ) : (
        <div className="text-slate-400 text-sm italic py-12">
          Aucun billet disponible. Veuillez en réserver un via la section Sélecteur ou Arène.
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// TAB 5: ANALYTICS TAB (Indicateurs & Graphiques)
// ----------------------------------------------------
const AnalyticsTab = () => {
  const { bookings, totalRevenue, totalSeatsBooked } = useTicketing();

  const checkedInCount = bookings.filter(b => b.status === 'CHECKED_IN').length;
  const fillRate = Math.min(Math.round((totalSeatsBooked / 1500) * 100) || 12, 100);

  return (
    <div className="animate-fade-in bg-[#1a1f2e] p-6 md:p-8 rounded-3xl border border-slate-800 font-sans space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart className="w-6 h-6 text-orange-400" /> Dashboard Analytics BizOS
          </h2>
          <p className="text-slate-400 text-xs">Statistiques de vente et remplissage calculées en temps réel.</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-slate-800 border border-orange-500/50 text-orange-400 text-xs font-semibold hover:bg-slate-700 transition-colors">
          Exporter Rapport (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#22283a] p-4 rounded-2xl border border-slate-700">
          <span className="text-slate-400 text-xs font-medium">Recette Totale</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{totalRevenue} €</div>
          <span className="text-[10px] text-slate-500">+18.5% vs événement précédent</span>
        </div>
        <div className="bg-[#22283a] p-4 rounded-2xl border border-slate-700">
          <span className="text-slate-400 text-xs font-medium">Sièges Réservés</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{totalSeatsBooked}</div>
          <span className="text-[10px] text-slate-500">Capacité totale: 1 500</span>
        </div>
        <div className="bg-[#22283a] p-4 rounded-2xl border border-slate-700">
          <span className="text-slate-400 text-xs font-medium">Taux de Remplissage</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{fillRate} %</div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${fillRate}%` }} />
          </div>
        </div>
        <div className="bg-[#22283a] p-4 rounded-2xl border border-slate-700">
          <span className="text-slate-400 text-xs font-medium">Check-ins Validés</span>
          <div className="text-2xl font-bold text-pink-400 mt-1">{checkedInCount} / {bookings.length}</div>
          <span className="text-[10px] text-slate-500">Scannés au guichet Caisse</span>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// TAB 6: NOTIFICATIONS TAB (Logs du système)
// ----------------------------------------------------
const NotificationsTab = () => {
  const { logs, addLog } = useTicketing();

  return (
    <div className="animate-fade-in bg-[#141026] p-6 md:p-8 rounded-3xl border border-slate-800 font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-cyan-400" /> Journal de Notifications &amp; Webhooks
          </h2>
          <p className="text-slate-400 text-xs">Historique des événements système et réservations.</p>
        </div>
        <button 
          onClick={() => addLog('Test Notification', 'info', 'Notification de test déclenchée manuellement')}
          className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs"
        >
          Tester Alerte
        </button>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
        {logs.map((log) => (
          <div 
            key={log.id} 
            className={`p-4 rounded-xl border flex items-start justify-between gap-4 text-xs ${
              log.type === 'success' ? 'bg-emerald-950/20 border-emerald-800 text-emerald-200' :
              log.type === 'warning' ? 'bg-amber-950/20 border-amber-800 text-amber-200' :
              log.type === 'error' ? 'bg-rose-950/20 border-rose-800 text-rose-200' :
              'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}
          >
            <div>
              <div className="font-bold text-sm mb-1">{log.action}</div>
              <div>{log.details}</div>
            </div>
            <div className="text-[10px] font-mono opacity-60 whitespace-nowrap">{log.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// TAB 7: CHECKIN TAB (Caisse & Scanner de billets)
// ----------------------------------------------------
const CheckinTab = () => {
  const { checkInTicket, bookings } = useTicketing();
  const [inputCode, setInputCode] = useState('');
  const [resultMsg, setResultMsg] = useState<{ success: boolean; msg: string; booking?: any } | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode) return;
    const res = await checkInTicket(inputCode);
    setResultMsg({ success: res.success, msg: res.message, booking: res.booking });
  };

  const handleQuickScan = async (id: string) => {
    setInputCode(id);
    const res = await checkInTicket(id);
    setResultMsg({ success: res.success, msg: res.message, booking: res.booking });
  };

  return (
    <div className="animate-fade-in font-sans space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Left Col: Viewfinder & POS Input */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <QrCode className="w-5 h-5 text-cyan-400" />
              Scanner Optique
            </h3>
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              En ligne
            </span>
          </div>

          <div className="relative aspect-video bg-black rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center mb-6">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="w-3/4 h-3/4 border-2 border-dashed border-cyan-400/50 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-xl -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-xl translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-xl -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-xl translate-x-1 translate-y-1"></div>
              {/* Scan line */}
              <div className="w-full h-0.5 bg-cyan-400 absolute top-1/2 -translate-y-1/2 shadow-[0_0_10px_#00f0ff] animate-pulse"></div>
            </div>
            <p className="absolute bottom-4 text-xs text-slate-400 font-mono">En attente de scan 2D/QR...</p>
          </div>

          <form onSubmit={handleScan} className="flex gap-2 mt-auto">
            <input 
              type="text" 
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Code manuel (ex: BIZOS-892145)"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 focus:outline-none font-mono"
            />
            <button type="submit" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-sm rounded-xl cursor-pointer transition-colors">
              Valider
            </button>
          </form>
        </div>

        {/* Right Col: POS Terminal / Status */}
        <div className="space-y-6 flex flex-col">
          
          {/* Result Banner */}
          <div className={`p-6 rounded-3xl border flex items-center gap-4 transition-all ${
            !resultMsg ? 'bg-slate-900 border-slate-800 text-slate-400' :
            resultMsg.success ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}>
            <div className={`p-4 rounded-2xl ${
              !resultMsg ? 'bg-slate-800 text-slate-500' :
              resultMsg.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {!resultMsg ? <QrCode className="w-8 h-8" /> : 
               resultMsg.success ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>
            <div>
              <h4 className="font-bold text-lg">{!resultMsg ? 'Terminal Prêt' : resultMsg.success ? 'Accès Autorisé' : 'Accès Refusé'}</h4>
              <p className="text-sm opacity-80">{resultMsg?.msg || 'Scannez un billet pour commencer'}</p>
              {resultMsg?.booking && (
                <div className="mt-2 text-xs font-mono opacity-60">
                  Client: {resultMsg.booking.customerName} | Sièges: {resultMsg.booking.seats.length}
                </div>
              )}
            </div>
          </div>

          {/* Quick List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex-1 flex flex-col">
            <h3 className="text-white font-bold text-sm mb-4">File d'attente / Test Rapide</h3>
            <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2">
              {bookings.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Aucun billet dans la base</p>
              ) : bookings.slice(0, 10).map(b => (
                <div key={b.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/50 text-xs">
                  <div>
                    <span className="font-mono font-bold text-white">{b.id}</span>
                    <span className="text-slate-400 block mt-0.5">{b.customerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${b.status === 'CHECKED_IN' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900' : 'bg-blue-950/50 text-blue-400 border border-blue-900'}`}>
                      {b.status === 'CHECKED_IN' ? 'SCANNÉ' : 'VALIDE'}
                    </span>
                    <button 
                      onClick={() => handleQuickScan(b.id)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-colors"
                      title="Scanner"
                    >
                      <ScanIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper icon for scanner
const ScanIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect width="10" height="10" x="7" y="7" rx="2"/></svg>
);

// ----------------------------------------------------
// TAB: EVENTS MANAGER (BizOS Style CRM/Lifecycle Manager)
// ----------------------------------------------------
const EventsManagerTab = () => {
  const { 
    events, 
    activeEvent, 
    setActiveEvent, 
    saveEvent, 
    deleteEvent, 
    bookings, 
    addLog,
    isBackendConnected
  } = useTicketing();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('ALL');
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);

  // Form states for creating/editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formVenue, setFormVenue] = useState('Arena E-Sport BizOS');
  const [formStartDate, setFormStartDate] = useState('2026-10-26T20:00');
  const [formEndDate, setFormEndDate] = useState('2026-10-26T23:30');
  const [formCapacity, setFormCapacity] = useState(1500);
  const [formBasePrice, setFormBasePrice] = useState(149);
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formStatus, setFormStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  
  // Tiers prices
  const [priceStandard, setFormPriceStandard] = useState(149);
  const [pricePremium, setFormPricePremium] = useState(249);
  const [priceVip, setFormPriceVip] = useState(499);

  // Form Validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load event into editor
  const handleEditClick = (ev: any) => {
    setEditingId(ev.id);
    setFormTitle(ev.title);
    setFormDesc(ev.description || '');
    setFormVenue(ev.venueName);
    
    // Format dates for datetime-local input (YYYY-MM-DDTHH:MM)
    try {
      setFormStartDate(new Date(ev.startDate).toISOString().slice(0, 16));
      setFormEndDate(new Date(ev.endDate).toISOString().slice(0, 16));
    } catch {
      setFormStartDate('2026-10-26T20:00');
      setFormEndDate('2026-10-26T23:30');
    }
    
    setFormCapacity(ev.capacity);
    setFormBasePrice(ev.basePrice);
    setFormSpeaker(ev.speaker || '');
    setFormStatus(ev.status);
    setFormPriceStandard(ev.ticketPrices?.standard || ev.basePrice);
    setFormPricePremium(ev.ticketPrices?.premium || Math.round(ev.basePrice * 1.6));
    setFormPriceVip(ev.ticketPrices?.vip || Math.round(ev.basePrice * 3.3));
    setValidationErrors([]);
    setSuccessMessage(null);
  };

  // Reset form
  const handleResetForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDesc('');
    setFormVenue('Arena E-Sport BizOS');
    setFormStartDate('2026-10-26T20:00');
    setFormEndDate('2026-10-26T23:30');
    setFormCapacity(1500);
    setFormBasePrice(149);
    setFormSpeaker('');
    setFormStatus('DRAFT');
    setFormPriceStandard(149);
    setFormPricePremium(249);
    setFormPriceVip(499);
    setValidationErrors([]);
    setSuccessMessage(null);
  };

  // Submit event (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    // Validations
    if (!formTitle.trim()) {
      errors.push('Le titre de l\'événement est obligatoire.');
    }
    if (!formStartDate) {
      errors.push('La date de début est obligatoire.');
    }
    if (!formEndDate) {
      errors.push('La date de fin est obligatoire.');
    }

    const startMs = new Date(formStartDate).getTime();
    const endMs = new Date(formEndDate).getTime();
    const nowMs = Date.now();

    if (startMs < nowMs) {
      errors.push('La date de début doit être planifiée dans le futur.');
    }
    if (endMs <= startMs) {
      errors.push('La date de fin doit se situer après la date de début.');
    }
    if (formCapacity <= 0) {
      errors.push('La capacité maximale doit être supérieure à 0.');
    }
    if (formBasePrice < 0) {
      errors.push('Le tarif de base ne peut pas être négatif.');
    }
    if (priceStandard < 0 || pricePremium < 0 || priceVip < 0) {
      errors.push('Les tarifs par catégorie de billets doivent être supérieurs ou égaux à 0.');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setSuccessMessage(null);
      return;
    }

    // Prepare Event Object
    const eventId = editingId || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const eventObj = {
      id: eventId,
      title: formTitle.trim(),
      description: formDesc.trim(),
      venueName: formVenue,
      startDate: new Date(formStartDate).toISOString(),
      endDate: new Date(formEndDate).toISOString(),
      capacity: Number(formCapacity),
      basePrice: Number(formBasePrice),
      speaker: formSpeaker.trim() || 'Non assigné',
      status: formStatus,
      ticketPrices: {
        standard: Number(priceStandard),
        premium: Number(pricePremium),
        vip: Number(priceVip)
      }
    };

    // Save
    const success = await saveEvent(eventObj);
    if (success) {
      setSuccessMessage(editingId ? 'Événement mis à jour avec succès !' : 'Nouvel événement créé avec succès !');
      setValidationErrors([]);
      if (!editingId) {
        // Clear if new
        handleResetForm();
      } else {
        // Keep editing but update success state
        setEditingId(eventObj.id);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setValidationErrors(['Erreur de synchronisation avec la base de données.']);
    }
  };

  // Delete event with confirmation
  const handleDeleteClick = async (eventId: string, title: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'événement "${title}" ?`)) {
      const ok = await deleteEvent(eventId);
      if (ok) {
        addLog('Suppression Événement', 'warning', `L'événement ${title} a été effacé.`);
      }
    }
  };

  // Dynamic quick status change (Draft -> Published -> Archived)
  const handleQuickStatusChange = async (ev: any, nextStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    const updated = {
      ...ev,
      status: nextStatus
    };
    await saveEvent(updated);
  };

  // Index search and status filters
  const filteredEvents = events.filter(e => {
    const matchesSearch = 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalCount = events.length;
  const publishedCount = events.filter(e => e.status === 'PUBLISHED').length;
  const draftCount = events.filter(e => e.status === 'DRAFT').length;
  const archivedCount = events.filter(e => e.status === 'ARCHIVED').length;

  if (showAdvancedForm) {
    return (
      <EcoAssetEventForm 
        onCancel={() => setShowAdvancedForm(false)}
        onSubmit={async (values) => {
          const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const eventObj = {
            id: eventId,
            title: values.title.trim(),
            description: values.description.trim(),
            venueName: values.venueName,
            startDate: new Date(values.startDate).toISOString(),
            endDate: new Date(values.endDate).toISOString(),
            capacity: Number(values.capacity),
            basePrice: Number(values.priceStandard),
            speaker: values.speaker.trim() || 'Non assigné',
            status: 'DRAFT' as const,
            ticketPrices: {
              standard: Number(values.priceStandard),
              premium: Number(values.pricePremium),
              vip: Number(values.priceVip)
            }
          };
          const success = await saveEvent(eventObj);
          if (success) {
            addLog('Création Événement (Avancé)', 'success', `Nouvel événement "${values.title}" créé via l'assistant à étapes.`);
            setShowAdvancedForm(false);
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans text-white">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Total Événements</span>
            <span className="text-3xl font-bold font-mono mt-1 block">{totalCount}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Toutes catégories confondues</span>
          </div>
          <div className="p-3.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Publiés / Actifs</span>
            <span className="text-3xl font-bold font-mono text-emerald-400 mt-1 block">{publishedCount}</span>
            <span className="text-[10px] text-emerald-500/80 mt-1 block">Disponibles à la vente</span>
          </div>
          <div className="p-3.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Brouillons</span>
            <span className="text-3xl font-bold font-mono text-amber-400 mt-1 block">{draftCount}</span>
            <span className="text-[10px] text-amber-500/80 mt-1 block">En cours de rédaction</span>
          </div>
          <div className="p-3.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Archivés</span>
            <span className="text-3xl font-bold font-mono text-slate-400 mt-1 block">{archivedCount}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Événements passés</span>
          </div>
          <div className="p-3.5 bg-slate-800 rounded-xl text-slate-400 border border-slate-700">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col: Event database list */}
        <div className="lg:col-span-7 bg-[#13112b]/60 border border-purple-500/15 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-purple-400" />
                Base de Données Événements
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Registre de billetterie géré en temps réel.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAdvancedForm(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.3)] animate-pulse"
              >
                <span>✨ Assistant Événement (6 Étapes)</span>
              </button>

              <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${isBackendConnected ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                {isBackendConnected ? 'Firestore Synchronisé' : 'Local Sandbox'}
              </span>
            </div>
          </div>

          {/* Search bar and filter pills */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par titre, artiste, lieu ou description..." 
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl py-3 pl-11 pr-4 text-white text-xs focus:outline-none transition-all" 
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: 'ALL', label: 'Tous' },
                { value: 'DRAFT', label: 'Brouillons' },
                { value: 'PUBLISHED', label: 'Publiés' },
                { value: 'ARCHIVED', label: 'Archivés' },
              ].map(pill => (
                <button
                  key={pill.value}
                  onClick={() => setStatusFilter(pill.value as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    statusFilter === pill.value 
                      ? 'border-purple-500 text-purple-300 bg-purple-500/10 shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                      : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Event Cards List */}
          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {filteredEvents.length === 0 ? (
              <div className="text-slate-500 text-center py-16 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800/80">
                Aucun événement correspondant aux critères de recherche.
              </div>
            ) : (
              filteredEvents.map(ev => {
                const isActive = activeEvent?.id === ev.id;
                
                // Calculate actual bookings
                const bookedCount = bookings
                  .filter(b => b.eventName === ev.title && b.status !== 'CANCELLED')
                  .reduce((acc, b) => acc + b.seats.length, 0);
                
                const percentBooked = Math.min(Math.round((bookedCount / ev.capacity) * 100) || 0, 100);

                return (
                  <div 
                    key={ev.id}
                    className={`p-4 rounded-2xl border transition-all relative group flex flex-col justify-between ${
                      isActive 
                        ? 'bg-purple-950/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-mono text-purple-300 font-semibold uppercase bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
                            {ev.venueName}
                          </span>
                          <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                            ev.status === 'PUBLISHED' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' :
                            ev.status === 'DRAFT' ? 'bg-amber-950/50 text-amber-400 border-amber-800/50' :
                            'bg-slate-900 text-slate-400 border-slate-800'
                          }`}>
                            {ev.status === 'PUBLISHED' ? 'PUBLIÉ' : ev.status === 'DRAFT' ? 'BROUILLON' : 'ARCHIVÉ'}
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-base leading-tight group-hover:text-purple-300 transition-colors">
                          {ev.title}
                        </h4>
                        
                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                          {ev.description || 'Aucune description fournie.'}
                        </p>
                      </div>

                      {/* Right-aligned date */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-slate-300 block">
                          {new Date(ev.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                          {new Date(ev.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Meta info details */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-3.5 border-t border-slate-900/60 text-xs">
                      <div>
                        <span className="text-slate-500 block">Artiste / Intervenant</span>
                        <span className="text-slate-300 font-semibold">{ev.speaker}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tarif de base</span>
                        <span className="text-amber-400 font-bold font-mono">{ev.basePrice} €</span>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <span className="text-slate-500 block mb-1">Remplissage ({percentBooked}%)</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                percentBooked >= 80 ? 'bg-pink-500' :
                                percentBooked >= 50 ? 'bg-purple-500' : 'bg-cyan-400'
                              }`} 
                              style={{ width: `${percentBooked}%` }} 
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{bookedCount}/{ev.capacity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-900/80">
                      <div className="flex gap-2.5">
                        <button 
                          onClick={() => setActiveEvent(ev)}
                          className={`text-xs px-2.5 py-1 rounded-lg border cursor-pointer font-medium transition-all ${
                            isActive 
                              ? 'bg-purple-600 text-white border-purple-500' 
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                          }`}
                        >
                          {isActive ? 'Sélectionné' : 'Sélectionner'}
                        </button>

                        <button 
                          onClick={() => handleEditClick(ev)}
                          className="text-xs text-cyan-400 hover:text-white bg-cyan-950/20 hover:bg-cyan-900/40 border border-cyan-500/20 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          Éditer
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status lifecycle quick change */}
                        {ev.status === 'DRAFT' && (
                          <button
                            onClick={() => handleQuickStatusChange(ev, 'PUBLISHED')}
                            className="text-[10px] font-bold text-emerald-400 hover:underline px-2 py-1 bg-emerald-950/30 rounded border border-emerald-500/20"
                          >
                            Publier
                          </button>
                        )}
                        {ev.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleQuickStatusChange(ev, 'ARCHIVED')}
                            className="text-[10px] font-bold text-slate-400 hover:underline px-2 py-1 bg-slate-800 rounded border border-slate-700"
                          >
                            Archiver
                          </button>
                        )}
                        {ev.status === 'ARCHIVED' && (
                          <button
                            onClick={() => handleQuickStatusChange(ev, 'PUBLISHED')}
                            className="text-[10px] font-bold text-emerald-400 hover:underline px-2 py-1 bg-emerald-950/30 rounded border border-emerald-500/20"
                          >
                            Réactiver
                          </button>
                        )}

                        <button 
                          onClick={() => handleDeleteClick(ev.id, ev.title)}
                          className="text-xs text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/20 rounded transition-colors cursor-pointer"
                          title="Supprimer l'événement"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Event Editor and Relationship Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 blur-[60px] -z-10 rounded-full" />
          
          <div className="flex items-center gap-3 mb-6 border-b border-slate-800/80 pb-4">
            <div className="w-11 h-11 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {editingId ? 'Mode Édition' : 'Créer un Événement'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {editingId ? 'Modification d\'un événement existant' : 'Planifier un nouvel événement de billetterie'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {validationErrors.length > 0 && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl text-rose-200 text-xs space-y-1">
                {validationErrors.map((err, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-emerald-200 text-xs flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-xs mb-1 font-semibold">Titre de l'événement</label>
              <input 
                type="text" 
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="ex: Grande Finale Cup 2026"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs mb-1 font-semibold">Description</label>
              <textarea 
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="ex: Assistez au tournoi de l'année réunissant les plus grands champions de la scène..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
              />
            </div>

            {/* Relation: Venue Selection */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-semibold">Lieu de l'événement (Venue Relation)</label>
              <select
                value={formVenue}
                onChange={(e) => setFormVenue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="Arena E-Sport BizOS">Arena E-Sport BizOS (1 500 places)</option>
                <option value="Stade BizOS">Stade BizOS (80 000 places)</option>
                <option value="Opéra Garnier BizOS">Opéra Garnier BizOS (1 900 places)</option>
                <option value="Centre de Conférence BizOS">Centre de Conférence BizOS (12 000 places)</option>
                <option value="Circuit Karting BizOS">Circuit Karting BizOS (1 500 places)</option>
              </select>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-semibold">Date de début</label>
                <input 
                  type="datetime-local" 
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-semibold">Date de fin</label>
                <input 
                  type="datetime-local" 
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Capacity & Price Standard */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-semibold">Capacité maximale</label>
                <input 
                  type="number" 
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  placeholder="1500"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-semibold">Tarif de base (€)</label>
                <input 
                  type="number" 
                  value={formBasePrice}
                  onChange={(e) => {
                    const priceVal = Number(e.target.value);
                    setFormBasePrice(priceVal);
                    // auto-suggest pricing tiers
                    setFormPriceStandard(priceVal);
                    setFormPricePremium(Math.round(priceVal * 1.6));
                    setFormPriceVip(Math.round(priceVal * 3.3));
                  }}
                  placeholder="149"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Relation: Speakers */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-semibold">Artistes / Intervenants (Speaker Relation)</label>
              <input 
                type="text" 
                value={formSpeaker}
                onChange={(e) => setFormSpeaker(e.target.value)}
                placeholder="ex: Faker, Gotaga, Kameto"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Relations Section: Ticket Categories Pricing */}
            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Gamme de Prix (Ticket Tiers)</span>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Standard</span>
                  <input 
                    type="number" 
                    value={priceStandard}
                    onChange={(e) => setFormPriceStandard(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-center"
                  />
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Premium</span>
                  <input 
                    type="number" 
                    value={pricePremium}
                    onChange={(e) => setFormPricePremium(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-center"
                  />
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">VIP Luxe</span>
                  <input 
                    type="number" 
                    value={priceVip}
                    onChange={(e) => setFormPriceVip(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-center"
                  />
                </div>
              </div>
            </div>

            {/* Status lifecycle selector */}
            <div>
              <label className="block text-slate-300 text-xs mb-1 font-semibold">Statut Cycle de Vie (Lifecycle Manager)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'DRAFT', label: 'Brouillon' },
                  { value: 'PUBLISHED', label: 'Publier Direct' },
                  { value: 'ARCHIVED', label: 'Archivé' },
                ].map(item => (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => setFormStatus(item.value as any)}
                    className={`py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      formStatus === item.value 
                        ? 'border-purple-500 bg-purple-900/30 text-purple-300 font-bold' 
                        : 'border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit & Reset buttons */}
            <div className="pt-4 flex gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex-1 py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-xl text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Annuler Édition
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {editingId ? 'Sauvegarder Événement' : 'Créer l\'Événement'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

// Technical tabs
const OverviewTab = () => {
  const { bookings, isBackendConnected } = useTicketing();
  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-2xl p-6 border border-blue-500/20">
        <h3 className="text-xl font-bold mb-3 text-blue-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" /> Architecture Backend Connectée
        </h3>
        <p className="text-sm text-slate-300 mb-4">
          Status actuel : <strong className={isBackendConnected ? 'text-emerald-400' : 'text-amber-400'}>{isBackendConnected ? 'Firestore Synchronisé en Direct' : 'Mode Simulée Local'}</strong>
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-blue-400 block mb-1">ecoasset_bookings</span>
            {bookings.length} enregistrements enregistrés dans la collection Cloud.
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-purple-400 block mb-1">Database ID</span>
            ai-studio-bizoswebandios-18bec7a3-9311-456d-986d-a6c8f02a8c94
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailsTab = () => (
  <div className="animate-fade-in grid lg:grid-cols-2 gap-6 font-sans">
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-400"/> Crons &amp; Automatisations
          </h3>
          <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-1 rounded font-mono">DISPATCHER ACTIVE</span>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Confirmation Achat (QR)', schedule: 'Temps réel', status: 'Actif', last: 'Il y a 2 min' },
            { name: 'Rappel J-1 Spectateur', schedule: 'Tous les jours @ 08:00', status: 'Actif', last: '08:00 CE' },
            { name: 'Relance NPS Post-Event', schedule: 'J+1 après événement', status: 'En attente', last: '-' },
            { name: 'Export Comptable Quotidien', schedule: 'Tous les jours @ 23:55', status: 'Actif', last: 'Hier 23:55' }
          ].map((cron, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800/50">
              <div>
                <div className="text-sm font-bold text-slate-200">{cron.name}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">Schedule: {cron.schedule}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-emerald-400">{cron.status}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">Last: {cron.last}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5 text-slate-400" /> Preview Template Transactionnel
      </h3>
      <div className="flex-1 bg-white rounded-2xl p-6 flex flex-col text-slate-800 shadow-inner overflow-hidden relative">
        <div className="border-b border-slate-200 pb-4 mb-4 text-center">
          <h2 className="text-xl font-bold text-slate-900">EcoAsset eSports</h2>
          <p className="text-xs text-slate-500">Votre réservation est confirmée</p>
        </div>
        <div className="space-y-4 flex-1">
          <p className="text-sm">Bonjour <strong>Marc</strong>,</p>
          <p className="text-xs">Merci de votre achat pour l'événement <strong>Finale Arène eSport 2026</strong>. Veuillez présenter le QR code ci-dessous à l'entrée.</p>
          <div className="flex justify-center py-4">
            <QrCode className="w-32 h-32 text-slate-900" />
          </div>
          <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-center border border-slate-200">
            BIZOS-892145
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none"></div>
      </div>
    </div>
  </div>
);

const PWATab = () => (
  <div className="animate-fade-in flex flex-col md:flex-row gap-8 font-sans">
    <div className="flex-1 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl">
            <Smartphone className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">PWA Mobile (Offline-First)</h3>
            <p className="text-xs text-slate-400">Application agent de terrain pour scan réseau dégradé</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Service Worker</div>
            <div className="text-emerald-400 font-mono text-sm font-bold flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> INSTALLÉ</div>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Cache Local (IndexedDB)</div>
            <div className="text-cyan-400 font-mono text-sm font-bold">14.2 MB</div>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Synchro Différée</div>
            <div className="text-amber-400 font-mono text-sm font-bold flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> EN ATTENTE (0)</div>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Version App</div>
            <div className="text-white font-mono text-sm font-bold">v2.4.1-stable</div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="w-[300px] shrink-0 mx-auto">
      {/* Phone Mockup */}
      <div className="w-[280px] h-[580px] bg-black rounded-[3rem] border-[8px] border-slate-800 relative overflow-hidden shadow-2xl mx-auto flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 bg-slate-800 rounded-b-xl w-32 mx-auto z-10"></div>
        {/* Screen Content */}
        <div className="flex-1 bg-slate-900 text-white flex flex-col pt-8">
          <div className="px-5 pb-4 border-b border-slate-800 flex justify-between items-center">
            <span className="font-bold">EcoAsset Check-in</span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 p-5 flex flex-col items-center justify-center space-y-6">
            <div className="w-40 h-40 border-2 border-dashed border-cyan-400 rounded-2xl flex items-center justify-center relative">
              <div className="w-full h-0.5 bg-cyan-400 absolute top-1/2 -translate-y-1/2 shadow-[0_0_10px_#00f0ff] animate-pulse"></div>
            </div>
            <p className="text-xs text-center text-slate-400">Pointez l'appareil vers le QR code du billet.</p>
            <button className="w-full py-3 bg-cyan-600 rounded-xl font-bold text-sm">Saisie Manuelle</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const VendorTab = () => (
  <div className="animate-fade-in font-sans space-y-6">
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500/10 rounded-xl">
          <Store className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Multi-Vendor Marketplace</h3>
          <p className="text-xs text-slate-400">Gestion des organisateurs, quotas et reversements</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Revenus Organisateurs</div>
          <div className="text-emerald-400 font-mono text-2xl font-bold">124,500 €</div>
        </div>
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Commissions EcoAsset (15%)</div>
          <div className="text-cyan-400 font-mono text-2xl font-bold">18,675 €</div>
        </div>
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Payouts en attente</div>
          <div className="text-amber-400 font-mono text-2xl font-bold">3</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800">
              <th className="pb-3 font-semibold">Organisateur</th>
              <th className="pb-3 font-semibold">Événements</th>
              <th className="pb-3 font-semibold">Volume CA</th>
              <th className="pb-3 font-semibold">Commission</th>
              <th className="pb-3 font-semibold">Statut Payout</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            <tr className="border-b border-slate-800/50">
              <td className="py-4 font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">ES</div> eSport League</td>
              <td className="py-4">4 Actifs</td>
              <td className="py-4 font-mono">82,000 €</td>
              <td className="py-4 font-mono">15%</td>
              <td className="py-4"><span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-1 rounded font-bold">Payé</span></td>
            </tr>
            <tr className="border-b border-slate-800/50">
              <td className="py-4 font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">MG</div> Music Groove</td>
              <td className="py-4">1 Actif</td>
              <td className="py-4 font-mono">31,500 €</td>
              <td className="py-4 font-mono">12%</td>
              <td className="py-4"><span className="text-xs bg-amber-950 text-amber-400 px-2 py-1 rounded font-bold">En attente</span></td>
            </tr>
            <tr>
              <td className="py-4 font-bold flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 text-xs">TA</div> Tech Summit</td>
              <td className="py-4">2 À venir</td>
              <td className="py-4 font-mono">11,000 €</td>
              <td className="py-4 font-mono">15%</td>
              <td className="py-4"><span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded font-bold">Non éligible</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const ApiTab = () => (
  <div className="animate-fade-in font-sans space-y-6">
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Key className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">API REST &amp; Webhooks</h3>
            <p className="text-xs text-slate-400">Intégrations développeurs et authentification OAuth2</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors">
          Générer Token
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <h4 className="text-sm font-bold text-white mb-2">Clés API Actives</h4>
        {[
          { name: 'Production App Mobile', prefix: 'pk_live_8f92...', created: 'Il y a 2 mois', last: 'Aujourd\'hui' },
          { name: 'Intégration Zapier', prefix: 'pk_live_4a11...', created: 'Il y a 10 jours', last: 'Hier' }
        ].map((key, i) => (
          <div key={i} className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <div className="font-bold text-sm text-slate-200">{key.name}</div>
              <div className="text-xs text-amber-400 font-mono mt-1">{key.prefix}</div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>Créée: {key.created}</div>
              <div>Dernier appel: {key.last}</div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h4 className="text-sm font-bold text-white mb-3">Documentation Rapide</h4>
        <div className="bg-[#0b0f19] p-4 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto text-slate-300">
          <div className="text-emerald-400 mb-2">// Validate a ticket via API</div>
          <div><span className="text-pink-400">curl</span> -X POST https://api.ecoasset.io/v1/tickets/checkin \</div>
          <div className="ml-4">-H <span className="text-amber-300">"Authorization: Bearer pk_live_..."</span> \</div>
          <div className="ml-4">-H <span className="text-amber-300">"Content-Type: application/json"</span> \</div>
          <div className="ml-4">-d <span className="text-amber-300">'&#123;"ticket_id": "BIZOS-892145", "gate": "A1"&#125;'</span></div>
        </div>
      </div>
    </div>
  </div>
);

const PrintTab = () => {
  const { bookings, addLog } = useTicketing();
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [badgeRole, setBadgeRole] = useState<'VISITOR' | 'VIP' | 'STAFF' | 'SPEAKER' | 'EXHIBITOR'>('VISITOR');
  const [badgeCompany, setBadgeCompany] = useState('BizOS Suite');
  const [badgeSize, setBadgeSize] = useState<'pvc' | 'a6' | 'thermal'>('pvc');
  const [includeAvatar, setIncludeAvatar] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [sendStep, setSendStep] = useState(0);

  // Find booking or use simulated fallback
  const activeBooking = bookings.find(b => b.id === selectedBookingId) || bookings[0] || {
    id: 'BIZOS-892145',
    ticketCode: 'ECO-2026-892145',
    customerName: 'Marc Dupont',
    customerEmail: 'marc.dupont@bizos.io',
    eventName: 'Finale Arène eSport 2026',
    venueName: 'Arena E-Sport BizOS',
    seats: [{ id: 'S-A12', section: 'Secteur A', price: 149 }]
  };

  useEffect(() => {
    if (activeBooking) {
      setEmailInput(activeBooking.customerEmail || '');
      setEmailSentSuccess(false);
      setSendStep(0);
    }
  }, [selectedBookingId, bookings]);

  useEffect(() => {
    if (bookings.length > 0 && !selectedBookingId) {
      setSelectedBookingId(bookings[0].id);
    }
  }, [bookings]);

  const handlePrintBadge = () => {
    setIsPrinting(true);
    addLog(
      'Impression Badge',
      'info',
      `Impression du badge (${badgeRole}) pour ${activeBooking.customerName} - Format: ${badgeSize.toUpperCase()}`
    );

    setTimeout(() => {
      setIsPrinting(false);
      window.print();
    }, 1200);
  };

  const handleSendBadgeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSendingEmail(true);
    setSendStep(1);

    const interval = setInterval(() => {
      setSendStep(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          setIsSendingEmail(false);
          setEmailSentSuccess(true);
          addLog(
            'Email Badge Envoyé',
            'success',
            `Le badge d'accès (${badgeRole}) de ${activeBooking.customerName} a été envoyé par email à ${emailInput}`
          );
          return 4;
        }
        return prev + 1;
      });
    }, 700);
  };

  const getRoleConfig = () => {
    switch (badgeRole) {
      case 'VIP':
        return {
          bg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500',
          textColor: 'text-amber-950',
          borderColor: 'border-amber-500',
          label: '★ VIP ACCÈS ★',
          shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]'
        };
      case 'STAFF':
        return {
          bg: 'bg-rose-600',
          textColor: 'text-white',
          borderColor: 'border-rose-600',
          label: '⚡ STAFF ORGANISATEUR ⚡',
          shadow: 'shadow-[0_0_20px_rgba(225,29,72,0.2)]'
        };
      case 'SPEAKER':
        return {
          bg: 'bg-cyan-500',
          textColor: 'text-cyan-950',
          borderColor: 'border-cyan-500',
          label: '🎙️ INTERVENANT / CONFÉRENCIER',
          shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]'
        };
      case 'EXHIBITOR':
        return {
          bg: 'bg-purple-600',
          textColor: 'text-white',
          borderColor: 'border-purple-600',
          label: '📦 PARTENAIRE / EXPOSANT',
          shadow: 'shadow-[0_0_20px_rgba(147,51,234,0.2)]'
        };
      default:
        return {
          bg: 'bg-emerald-500',
          textColor: 'text-emerald-950',
          borderColor: 'border-emerald-500',
          label: '• VISITEUR STANDARD •',
          shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]'
        };
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <div className="animate-fade-in font-sans space-y-6">
      
      {/* Printable Badge CSS Rule */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-badge, #printable-badge * {
            visibility: visible;
          }
          #printable-badge {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(1.2);
            background: white !important;
            color: black !important;
            border: 3px solid black !important;
          }
        }
      `}</style>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
          <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
            <Printer className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Centre d'Impression &amp; Gestion des Badges</h3>
            <p className="text-xs text-slate-400">Générez des badges d'accréditations physiques, lancez l'impression ou envoyez-les directement par email.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Configuration */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Booking Selector */}
            <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl space-y-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">1. Sélection du Participant</span>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl p-3 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="" className="text-slate-400">-- Choisir un ticket de la liste --</option>
                    {bookings.map(b => (
                      <option key={b.id} value={b.id} className="bg-slate-950 text-white">
                        {b.id} - {b.customerName} ({b.seats.map(s => s.id).join(', ')})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-slate-500 self-center">
                  ou utilise le profil d'accréditation simulé par défaut.
                </div>
              </div>
            </div>

            {/* Badge Attributes */}
            <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl space-y-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">2. Personnalisation du Badge</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Role / Role tag */}
                <div>
                  <label className="block text-slate-300 text-xs mb-1.5 font-semibold">Rôle &amp; Accréditation</label>
                  <select
                    value={badgeRole}
                    onChange={(e: any) => setBadgeRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl p-3 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="VISITOR">Visiteur Standard</option>
                    <option value="VIP">VIP Gold</option>
                    <option value="STAFF">Organisateur / Staff</option>
                    <option value="SPEAKER">Intervenant / Conférencier</option>
                    <option value="EXHIBITOR">Partenaire / Exposant</option>
                  </select>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-slate-300 text-xs mb-1.5 font-semibold">Société / Affiliation</label>
                  <input
                    type="text"
                    value={badgeCompany}
                    onChange={(e) => setBadgeCompany(e.target.value)}
                    placeholder="ex: BizOS Inc."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl p-3 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Badge layout size */}
                <div>
                  <label className="block text-slate-300 text-xs mb-1.5 font-semibold">Format du Support</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'pvc', label: 'PVC CR80' },
                      { value: 'a6', label: 'A6 Conf' },
                      { value: 'thermal', label: '80mm' },
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setBadgeSize(opt.value as any)}
                        className={`py-2 px-1 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                          badgeSize === opt.value
                            ? 'border-pink-500 bg-pink-500/10 text-pink-300'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar checkbox options */}
                <div className="flex items-center gap-2.5 pt-6 pl-1">
                  <input
                    id="include-avatar"
                    type="checkbox"
                    checked={includeAvatar}
                    onChange={(e) => setIncludeAvatar(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-pink-600 focus:ring-pink-500 accent-pink-500 cursor-pointer"
                  />
                  <label htmlFor="include-avatar" className="text-slate-300 text-xs font-semibold cursor-pointer">
                    Inclure une Photo d'Identité (Avatar)
                  </label>
                </div>

              </div>
            </div>

            {/* Badge Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-4">
              
              {/* Trigger Print Button */}
              <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl space-y-3.5">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">3. Impression Badge</span>
                <p className="text-[11px] text-slate-500">Prépare le badge et déclenche le spooler d'impression physique locale ou thermique Zebra.</p>
                <button
                  onClick={handlePrintBadge}
                  disabled={isPrinting}
                  className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPrinting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Génération du flux spooler...
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4" />
                      Imprimer le Badge
                    </>
                  )}
                </button>
              </div>

              {/* Email Badge Panel */}
              <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl space-y-3">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">4. Envoyer le Badge par Email</span>
                
                <form onSubmit={handleSendBadgeEmail} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setEmailSentSuccess(false);
                      }}
                      placeholder="email.client@domaine.fr"
                      required
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSendingEmail}
                      className="bg-pink-600 hover:bg-pink-500 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                      title="Envoyer le badge"
                    >
                      {isSendingEmail ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {isSendingEmail && (
                    <div className="space-y-1 text-[10px] text-pink-400/95 font-mono bg-pink-950/20 p-2 rounded-lg border border-pink-500/10">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                        <span>
                          {sendStep === 1 && 'Génération du Badge vectoriel PDF...'}
                          {sendStep === 2 && 'Mise en page des crédits de sécurité...'}
                          {sendStep === 3 && 'Acheminement relais SMTP BizOS...'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-pink-400 h-full transition-all duration-500" style={{ width: `${(sendStep / 3) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  {emailSentSuccess && (
                    <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Badge envoyé à <strong className="font-mono">{emailInput}</strong> !</span>
                    </div>
                  )}
                </form>
              </div>

            </div>

          </div>

          {/* Right Panel: Live Badge Preview Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-4 self-start">Aperçu Réel du Badge</span>
            
            {/* Hanging Lanyard Mockup */}
            <div className="flex flex-col items-center select-none relative">
              
              {/* Lanyard Ring and clip */}
              <div className="w-4 h-12 bg-slate-800 rounded-b-lg border-x border-slate-700 shadow-md relative z-10">
                <div className="w-1.5 h-1.5 bg-slate-900 rounded-full absolute bottom-2 left-1/2 -translate-x-1/2" />
              </div>
              <div className="w-12 h-4 bg-slate-700 border border-slate-600 rounded-lg -mt-1 shadow relative z-20" />
              
              {/* Badge Container */}
              <div 
                id="printable-badge"
                className={`bg-white text-slate-900 p-5 rounded-2xl shadow-2xl flex flex-col items-center border border-slate-200 relative overflow-hidden transition-all duration-300 ${roleConfig.shadow} ${
                  badgeSize === 'pvc' ? 'w-60 h-[340px]' :
                  badgeSize === 'a6' ? 'w-64 h-[370px]' :
                  'w-56 h-[300px]'
                }`}
              >
                {/* Lanyard slot hole */}
                <div className="w-6 h-1.5 bg-slate-900/10 rounded-full mb-3" />

                {/* Banner Header Accent */}
                <div className={`w-full py-2.5 px-3 rounded-xl ${roleConfig.bg} ${roleConfig.textColor} text-center font-bold text-[10px] tracking-widest uppercase mb-4`}>
                  {roleConfig.label}
                </div>

                {/* Event Name */}
                <h4 className="text-center font-extrabold text-[11px] text-slate-500 uppercase tracking-wider leading-none mb-4">
                  {activeBooking.eventName}
                </h4>

                {/* Photo & Identity Section */}
                <div className="flex items-center gap-3.5 w-full border-b border-dashed border-slate-300 pb-4 mb-4">
                  {includeAvatar && (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Participant</span>
                    <h3 className="font-extrabold text-sm text-slate-900 truncate leading-tight">
                      {activeBooking.customerName}
                    </h3>
                    <span className="text-[11px] text-pink-600 font-bold tracking-tight block">
                      {badgeCompany}
                    </span>
                  </div>
                </div>

                {/* Access Codes / QR / Seats */}
                <div className="flex items-center justify-between w-full mt-auto">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">Emplacement</span>
                    <span className="font-bold font-mono text-[11px] text-slate-800 block">
                      {activeBooking.seats.map(s => s.id).join(', ')}
                    </span>
                    
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase mt-1.5">Identifiant</span>
                    <span className="font-mono text-[10px] text-slate-500 block">
                      {activeBooking.id}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2 border border-slate-200 rounded-xl">
                    <QrCode className="w-14 h-14 text-slate-900" />
                  </div>
                </div>

                {/* Safety Seal Line */}
                <div className={`absolute bottom-0 inset-x-0 h-1.5 ${roleConfig.bg}`} />
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Badge Email Preview simulation drawer */}
      {emailSentSuccess && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-white rounded-2xl p-5 text-slate-800 border border-slate-200 mt-4 overflow-hidden shadow-inner font-sans relative"
        >
          <div className="absolute top-2 right-4 bg-slate-100 text-slate-600 font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-slate-300">
            Aperçu de la Boîte de Réception du Client
          </div>
          <div className="border-b border-slate-200 pb-3 mb-3">
            <div className="text-xs text-slate-500">De : <strong className="text-slate-700">billetterie@bizos.io</strong></div>
            <div className="text-xs text-slate-500">À : <strong className="text-slate-700">{emailInput}</strong></div>
            <div className="text-xs text-slate-500 mt-1">Objet : <strong className="text-slate-800">🪪 Votre badge d'accréditation officiel - {activeBooking.eventName}</strong></div>
          </div>
          <div className="space-y-4 max-w-lg mx-auto py-2">
            <div className="text-center font-bold text-lg text-slate-900 border-b pb-2">Accréditation BizOS Events</div>
            <p className="text-xs">Bonjour <strong>{activeBooking.customerName}</strong>,</p>
            <p className="text-xs">Nous avons le plaisir de vous transmettre votre badge d'accréditation officiel pour l'événement <strong>{activeBooking.eventName}</strong>.</p>
            
            {/* Embedded simulation description */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="font-bold border-b pb-1 text-slate-700 uppercase">Informations de sécurité :</div>
              <div>Type d'accès : <span className={`font-bold uppercase ${badgeRole === 'VIP' ? 'text-amber-600' : 'text-slate-800'}`}>{badgeRole}</span></div>
              <div>Affiliation : <span className="font-semibold">{badgeCompany}</span></div>
              <div>Emplacement : <span className="font-semibold">{activeBooking.seats.map(s => s.id).join(', ')}</span></div>
              
              <div className="text-[11px] text-slate-500 italic mt-2 pt-2 border-t text-center">
                Veuillez présenter ce badge imprimé ou l'ajouter à votre portefeuille d'applications mobiles (PWA/Wallet).
              </div>
            </div>
            
            <p className="text-[11px] text-slate-500 text-center border-t pt-3">Pour toute assistance, contactez le guichet d'enregistrement.</p>
          </div>
        </motion.div>
      )}

    </div>
  );
};

