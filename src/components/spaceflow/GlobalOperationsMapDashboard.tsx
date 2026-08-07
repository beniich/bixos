import React, { useState, useEffect, useRef } from 'react';
import { useRealtimeData } from '../../services/realtimeStore';
import { 
  Activity, AlertTriangle, CheckCircle2, Clock, Globe, MapPin, Zap, 
  TrendingUp, BarChart3, RefreshCw, Layers, ShieldCheck, Filter, Wrench, 
  X, ChevronRight, Cpu, Sparkles, Send, ArrowUpRight, Play, Maximize2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SiteLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  status: 'operational' | 'panne' | 'intervention';
  assetCount: number;
  activeFailure?: string;
  technicianAssigned?: string;
  slaRemaining?: string;
  healthScore: number;
  telemetry: {
    temp: number;
    vibration: number;
    powerKw: number;
  };
}

const INITIAL_SITES: SiteLocation[] = [
  {
    id: 'site-paris',
    name: 'Paris HQ & Tech Tower',
    city: 'Paris',
    country: 'France',
    lat: 48.8566,
    lng: 2.3522,
    status: 'operational',
    assetCount: 340,
    healthScore: 98,
    telemetry: { temp: 21.4, vibration: 0.12, powerKw: 420 }
  },
  {
    id: 'site-lyon',
    name: 'Lyon Hub Industrial CVC',
    city: 'Lyon',
    country: 'France',
    lat: 45.7640,
    lng: 4.8357,
    status: 'panne',
    assetCount: 180,
    activeFailure: 'Surchauffe Compresseur CVC - Pression > 8.4 Bar',
    technicianAssigned: 'Antoine Mercier (FieldTech #402)',
    slaRemaining: '00h 24m',
    healthScore: 54,
    telemetry: { temp: 42.8, vibration: 4.8, powerKw: 890 }
  },
  {
    id: 'site-marseille',
    name: 'Marseille Port & Logistics Terminal',
    city: 'Marseille',
    country: 'France',
    lat: 43.2965,
    lng: 5.3698,
    status: 'intervention',
    assetCount: 210,
    activeFailure: 'Maintenance préventive pompe de relevage B-02',
    technicianAssigned: 'Sophie Laurent (FieldTech #118)',
    slaRemaining: '01h 45m',
    healthScore: 82,
    telemetry: { temp: 26.1, vibration: 1.2, powerKw: 610 }
  },
  {
    id: 'site-frankfurt',
    name: 'Frankfurt Data Center Cooling Hub',
    city: 'Frankfurt',
    country: 'Germany',
    lat: 50.1109,
    lng: 8.6821,
    status: 'operational',
    assetCount: 520,
    healthScore: 99,
    telemetry: { temp: 18.2, vibration: 0.05, powerKw: 1450 }
  },
  {
    id: 'site-london',
    name: 'London Financial Tower Facility',
    city: 'London',
    country: 'UK',
    lat: 51.5074,
    lng: -0.1278,
    status: 'panne',
    assetCount: 290,
    activeFailure: 'Défaut D’isolement Transformateur HT-01',
    technicianAssigned: 'David Miller (FieldTech #209)',
    slaRemaining: '00h 12m',
    healthScore: 48,
    telemetry: { temp: 38.9, vibration: 3.9, powerKw: 730 }
  },
  {
    id: 'site-madrid',
    name: 'Madrid Operations Center',
    city: 'Madrid',
    country: 'Spain',
    lat: 40.4168,
    lng: -3.7038,
    status: 'intervention',
    assetCount: 160,
    activeFailure: 'Calibration Capteurs IoT Air Quality',
    technicianAssigned: 'Carlos Gomez (FieldTech #304)',
    slaRemaining: '02h 10m',
    healthScore: 88,
    telemetry: { temp: 24.0, vibration: 0.8, powerKw: 380 }
  },
  {
    id: 'site-ny',
    name: 'New York Regional Command',
    city: 'New York',
    country: 'USA',
    lat: 40.7128,
    lng: -74.0060,
    status: 'operational',
    assetCount: 680,
    healthScore: 97,
    telemetry: { temp: 20.8, vibration: 0.15, powerKw: 1820 }
  },
  {
    id: 'site-tokyo',
    name: 'Tokyo Tech Park Center',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lng: 139.6503,
    status: 'intervention',
    assetCount: 430,
    activeFailure: 'Inspection robotique conduits ventilation',
    technicianAssigned: 'Kenji Sato (FieldTech #801)',
    slaRemaining: '03h 05m',
    healthScore: 91,
    telemetry: { temp: 22.1, vibration: 0.4, powerKw: 950 }
  }
];

export const GlobalOperationsMapDashboard: React.FC = () => {
  const { sites: realtimeSites } = useRealtimeData();
  const [sites, setSites] = useState<SiteLocation[]>(INITIAL_SITES);
  const [filterStatus, setFilterStatus] = useState<'all' | 'panne' | 'intervention' | 'operational'>('all');
  const [selectedSite, setSelectedSite] = useState<SiteLocation | null>(INITIAL_SITES[1]); // Default select Lyon with panne
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Sync real-time sites from Firestore
  useEffect(() => {
    if (realtimeSites && realtimeSites.length > 0) {
      setSites(prev => {
        return realtimeSites.map(rs => {
          const existing = prev.find(p => p.id === rs.id);
          return {
            id: rs.id,
            name: rs.name,
            city: rs.city,
            country: rs.country,
            lat: rs.lat,
            lng: rs.lng,
            status: rs.status,
            assetCount: rs.assetCount,
            healthScore: rs.healthScore,
            activeFailure: rs.activeFailure || existing?.activeFailure,
            technicianAssigned: rs.technicianAssigned || existing?.technicianAssigned,
            slaRemaining: rs.slaRemaining || existing?.slaRemaining || '01h 00m',
            telemetry: existing?.telemetry || { temp: 22.0, vibration: 0.5, powerKw: 450 }
          };
        });
      });
    }
  }, [realtimeSites]);

  // Filter sites
  const filteredSites = sites.filter(s => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  const pannesCount = sites.filter(s => s.status === 'panne').length;
  const interventionsCount = sites.filter(s => s.status === 'intervention').length;
  const operationalCount = sites.filter(s => s.status === 'operational').length;

  // Initialize Leaflet Map dynamically
  useEffect(() => {
    let leafletMap: any = null;

    const initMap = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      try {
        const L = (await import('leaflet')).default;

        // Custom marker icons
        const createCustomIcon = (status: 'operational' | 'panne' | 'intervention') => {
          let color = '#34d399'; // green
          let bgGlow = 'rgba(52,211,153,0.6)';
          if (status === 'panne') {
            color = '#f43f5e'; // red
            bgGlow = 'rgba(244,63,94,0.8)';
          } else if (status === 'intervention') {
            color = '#fbbf24'; // yellow
            bgGlow = 'rgba(251,191,36,0.8)';
          }

          return L.divIcon({
            className: 'custom-map-marker',
            html: `
              <div style="
                position: relative;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  border-radius: 50%;
                  background: ${bgGlow};
                  animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>
                <div style="
                  position: relative;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: ${color};
                  border: 2px solid #ffffff;
                  box-shadow: 0 0 12px ${color};
                "></div>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
        };

        // Initialize Map focused on Europe
        leafletMap = L.map(mapContainerRef.current, {
          center: [46.2276, 2.2137],
          zoom: 4,
          zoomControl: false,
        });

        // Dark Map Tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(leafletMap);

        // Add Zoom Control at top right
        L.control.zoom({ position: 'topright' }).addTo(leafletMap);

        // Add Site Markers
        sites.forEach(site => {
          const marker = L.marker([site.lat, site.lng], {
            icon: createCustomIcon(site.status)
          }).addTo(leafletMap);

          marker.bindTooltip(`
            <div style="
              background: #140826; 
              color: white; 
              padding: 8px 12px; 
              border-radius: 10px; 
              border: 1px solid #d946ef;
              font-family: monospace;
              font-size: 11px;
            ">
              <strong style="color: #f472b6;">${site.name}</strong><br/>
              Status: ${site.status.toUpperCase()}<br/>
              Health Score: ${site.healthScore}/100
            </div>
          `, { direction: 'top', offset: [0, -10] });

          marker.on('click', () => {
            setSelectedSite(site);
            leafletMap.flyTo([site.lat, site.lng], 6, { duration: 1.2 });
          });
        });

        // Add Glowing Topology Connecting PolyLines (Arcs between Paris HQ and regional hubs)
        const paris = [48.8566, 2.3522];
        const connections = [
          [45.7640, 4.8357], // Lyon
          [43.2965, 5.3698], // Marseille
          [50.1109, 8.6821], // Frankfurt
          [51.5074, -0.1278], // London
          [40.4168, -3.7038], // Madrid
        ];

        connections.forEach(dest => {
          L.polyline([paris as [number, number], dest as [number, number]], {
            color: '#d946ef',
            weight: 1.5,
            opacity: 0.6,
            dashArray: '4, 8'
          }).addTo(leafletMap);
        });

        mapInstanceRef.current = leafletMap;
        setMapLoaded(true);
      } catch (err) {
        console.error('Failed to load Leaflet map:', err);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Refresh Telemetry Trigger
  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSites(prev => prev.map(s => ({
        ...s,
        telemetry: {
          temp: +(s.telemetry.temp + (Math.random() * 0.8 - 0.4)).toFixed(1),
          vibration: +(s.telemetry.vibration + (Math.random() * 0.1 - 0.05)).toFixed(2),
          powerKw: +(s.telemetry.powerKw + Math.floor(Math.random() * 10 - 5))
        }
      })));
      setIsRefreshing(false);
    }, 1000);
  };

  // Chart Data 1: Global Market & Capacity Penetration (Line Chart)
  const chartPenetrationData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: 'Capacité Réseau & IoT (%)',
        data: [72, 75, 88, 95, 92, 89, 94],
        borderColor: '#f472b6',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 160);
          gradient.addColorStop(0, 'rgba(244, 114, 182, 0.4)');
          gradient.addColorStop(1, 'rgba(244, 114, 182, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Charge CVC & Équipements',
        data: [50, 54, 78, 85, 81, 70, 76],
        borderColor: '#d946ef',
        borderDash: [4, 4],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      }
    ]
  };

  // Chart Data 2: Revenue & Maintenance Cost Metrics (Bar Chart)
  const chartRevenueData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août'],
    datasets: [
      {
        label: 'Coût Interventions (€k)',
        data: [42, 38, 55, 30, 28, 22, 19, 15],
        backgroundColor: '#d946ef',
        borderRadius: 6,
      },
      {
        label: 'Économies IA Prédictive (€k)',
        data: [65, 70, 82, 90, 105, 120, 135, 148],
        backgroundColor: '#34d399',
        borderRadius: 6,
      }
    ]
  };

  // Chart Data 3: Regional Performance & Failure Rate (Line Chart)
  const chartRegionalData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      {
        label: 'Europe (Uptime %)',
        data: [99.1, 98.8, 99.4, 99.6],
        borderColor: '#f472b6',
        tension: 0.3,
      },
      {
        label: 'Americas (Uptime %)',
        data: [98.5, 99.0, 98.9, 99.2],
        borderColor: '#38bdf8',
        tension: 0.3,
      },
      {
        label: 'APAC (Uptime %)',
        data: [97.8, 98.2, 98.7, 99.1],
        borderColor: '#fbbf24',
        tension: 0.3,
      }
    ]
  };

  // Chart Data 4: Forecasts & Failure Prevention Curve
  const chartForecastData = {
    labels: ['15-Août', '20-Août', '25-Août', '30-Août', '05-Sept'],
    datasets: [
      {
        label: 'Prédiction Pannes Gemini 2.5',
        data: [12, 8, 5, 3, 1],
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#140826',
        titleColor: '#f472b6',
        bodyColor: '#ffffff',
        borderColor: '#d946ef',
        borderWidth: 1,
        padding: 10,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10, family: 'monospace' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10, family: 'monospace' } }
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white font-sans">
      
      {/* Top Cyber Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-[#140826]/90 border border-[#d946ef]/40 shadow-[0_0_30px_rgba(217,70,239,0.25)] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d946ef]/30 to-[#8b5cf6]/40 border border-[#d946ef] flex items-center justify-center text-[#f472b6] shadow-[0_0_15px_rgba(217,70,239,0.5)]">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d946ef]/30 text-[#f472b6] font-bold tracking-widest uppercase">
                GLOBAL COMMAND CENTER & MAPS
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Topologie Globale & <span className="bg-gradient-to-r from-[#f472b6] via-[#d946ef] to-[#fb923c] bg-clip-text text-transparent">Pannes Temps Réel</span>
            </h1>
          </div>
        </div>

        {/* Quick Filters & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-[#d946ef] text-white font-bold shadow-[0_0_12px_rgba(217,70,239,0.6)]'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            Tous les sites ({sites.length})
          </button>

          <button
            onClick={() => setFilterStatus('panne')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'panne'
                ? 'bg-rose-600 text-white font-bold shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Pannes ({pannesCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus('intervention')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'intervention'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Interventions ({interventionsCount})</span>
          </button>

          <button
            onClick={() => setFilterStatus('operational')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'operational'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Normal ({operationalCount})</span>
          </button>

          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="p-2 rounded-full bg-white/5 border border-white/20 hover:border-[#f472b6] text-white transition-all cursor-pointer ml-2"
            title="Rafraîchir Télémétrie IoT"
          >
            <RefreshCw className={`w-4 h-4 text-[#f472b6] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

        </div>
      </div>

      {/* Main Curved Command Center Wall Layout matching Image 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Wall: Stacked High-Tech Analytics Charts (Image 1 Left Side) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          
          {/* Chart 1: Global Penetration & Capacity */}
          <div className="p-4 rounded-2xl bg-[#140826]/90 border border-[#d946ef]/30 shadow-lg relative overflow-hidden group hover:border-[#f472b6] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#f472b6]" />
                GLOBAL MARKET & CAPACITY
              </span>
              <span className="text-[10px] font-mono text-[#f472b6] bg-[#d946ef]/20 px-2 py-0.5 rounded">94% Max</span>
            </div>
            <div className="h-32 w-full">
              <Line data={chartPenetrationData} options={chartOptions} />
            </div>
          </div>

          {/* Chart 2: Revenue & Intervention Costs */}
          <div className="p-4 rounded-2xl bg-[#140826]/90 border border-[#d946ef]/30 shadow-lg relative overflow-hidden group hover:border-[#f472b6] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                REVENUE & MAINTENANCE COSTS
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">+148k€ Save</span>
            </div>
            <div className="h-32 w-full">
              <Bar data={chartRevenueData} options={chartOptions} />
            </div>
          </div>

          {/* Chart 3: Regional Performance */}
          <div className="p-4 rounded-2xl bg-[#140826]/90 border border-[#d946ef]/30 shadow-lg relative overflow-hidden group hover:border-[#f472b6] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                REGIONAL PERFORMANCE UPTIME
              </span>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded">EU 99.6%</span>
            </div>
            <div className="h-32 w-full">
              <Line data={chartRegionalData} options={chartOptions} />
            </div>
          </div>

          {/* Chart 4: Failure Forecasts */}
          <div className="p-4 rounded-2xl bg-[#140826]/90 border border-[#d946ef]/30 shadow-lg relative overflow-hidden group hover:border-[#f472b6] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                FORECAST PREDICTIVE FAILURE
              </span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">AI Gemini 2.5</span>
            </div>
            <div className="h-32 w-full">
              <Line data={chartForecastData} options={chartOptions} />
            </div>
          </div>

        </div>

        {/* Center/Right Stage: Real World Interactive Map (Image 1 Center Map) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          <div className="relative rounded-3xl bg-[#140826]/90 border border-[#d946ef]/40 shadow-[0_0_35px_rgba(217,70,239,0.2)] overflow-hidden min-h-[520px] flex-1">
            
            {/* Map Canvas Container */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-full min-h-[520px] z-10" 
            />

            {/* Map Overlay Badge Header */}
            <div className="absolute top-4 left-4 z-20 bg-[#140826]/90 backdrop-blur-md border border-[#d946ef]/50 px-4 py-2 rounded-2xl text-xs font-mono text-white flex items-center gap-3 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6] animate-ping" />
              <span>CARTE EN DIRECT DES SITES ET PANNES</span>
              <span className="text-[10px] text-slate-400">({filteredSites.length} visibles)</span>
            </div>

            {/* Selected Site Detail Inspector Panel Floating Card */}
            {selectedSite && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-20 bg-[#140826]/95 backdrop-blur-xl border border-[#d946ef] p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(217,70,239,0.3)] space-y-3 animate-fade-in">
                
                <div className="flex items-start justify-between border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        selectedSite.status === 'panne' ? 'bg-rose-500 animate-ping' :
                        selectedSite.status === 'intervention' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <h3 className="font-bold text-base text-white">{selectedSite.name}</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedSite.city}, {selectedSite.country}</p>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedSite(null)}
                    className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Status Alert if Panne */}
                {selectedSite.status === 'panne' && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs space-y-1">
                    <div className="font-bold font-mono flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                      <span>PANNE CRITIQUE DÉTECTÉE</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-light">{selectedSite.activeFailure}</p>
                    <div className="text-[10px] font-mono text-rose-300 pt-1 flex justify-between">
                      <span>Technicien: {selectedSite.technicianAssigned}</span>
                      <span className="font-bold">SLA: {selectedSite.slaRemaining}</span>
                    </div>
                  </div>
                )}

                {/* Status if Intervention */}
                {selectedSite.status === 'intervention' && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs space-y-1">
                    <div className="font-bold font-mono flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span>INTERVENTION TERRAIN EN COURS</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-light">{selectedSite.activeFailure}</p>
                    <div className="text-[10px] font-mono text-amber-300 pt-1 flex justify-between">
                      <span>Technicien: {selectedSite.technicianAssigned}</span>
                      <span>SLA: {selectedSite.slaRemaining}</span>
                    </div>
                  </div>
                )}

                {/* Telemetry Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-xs">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400">Temp CVC</div>
                    <div className={`font-bold ${selectedSite.telemetry.temp > 35 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedSite.telemetry.temp}°C
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400">Vibration</div>
                    <div className={`font-bold ${selectedSite.telemetry.vibration > 3.0 ? 'text-amber-400' : 'text-sky-400'}`}>
                      {selectedSite.telemetry.vibration} mm/s
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-slate-400">Puissance</div>
                    <div className="font-bold text-[#f472b6]">
                      {selectedSite.telemetry.powerKw} kW
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2 flex items-center gap-2">
                  <button className="w-full py-2 rounded-xl bg-[#d946ef] hover:bg-[#c026d3] text-white text-xs font-semibold font-mono transition-colors cursor-pointer shadow-[0_0_15px_rgba(217,70,239,0.5)] flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Lancer Diagnostic IA</span>
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Bottom Cyber Metrics Panel (Image 1 Bottom Row) */}
          <div className="p-5 rounded-3xl bg-[#140826]/90 border border-[#d946ef]/30 shadow-lg grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">Score Santé Global</div>
              <div className="text-2xl font-bold text-white mt-1">98.4%</div>
              <div className="text-[10px] text-emerald-400">SLA Conforme</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">Temps Moyen Résolution</div>
              <div className="text-2xl font-bold text-[#f472b6] mt-1">34.20 min</div>
              <div className="text-[10px] text-[#f472b6]">-12% vs Objectif</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">Pannes Évitées IA</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">87%</div>
              <div className="text-[10px] text-amber-400">Modèle Gemini 2.5</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">Valeur Actifs Surveillés</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">$4.1M</div>
              <div className="text-[10px] text-emerald-400">8 Sites Raccordés</div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
