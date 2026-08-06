import React, { useState, useEffect } from 'react';
import { PageId, Language, CAFMAsset } from '../../types';
import {
  LayoutDashboard,
  Box,
  MapPin,
  ClipboardList,
  Wrench,
  BarChart3,
  FileText,
  Cpu,
  Layers,
  Eye,
  Database,
  Bell,
  Building2,
  FileSpreadsheet,
  Bot,
  Sliders,
  CreditCard,
  ShoppingBag,
  Store,
  Coins,
  Vote,
  Rocket,
  GitCompare,
  TrendingUp,
  Activity,
  Shield,
  Sun,
  Moon,
  LogOut,
  RefreshCw,
  Key
} from 'lucide-react';

import { DashboardOverviewView } from '../dashboard/DashboardOverviewView';
import { AssetsView } from '../dashboard/AssetsView';
import { SpacesView } from '../dashboard/SpacesView';
import { WorkOrdersView } from '../dashboard/WorkOrdersView';
import { MaintenanceView } from '../dashboard/MaintenanceView';
import { AnalyticsView } from '../dashboard/AnalyticsView';
import { LeasesView } from '../dashboard/LeasesView';
import { CmmsView } from '../dashboard/CmmsView';
import { DigitalTwinView } from '../dashboard/DigitalTwinView';
import { BimViewerView } from '../dashboard/BimViewerView';
import { ErpIntegrationView } from '../dashboard/ErpIntegrationView';
import { NotificationsView } from '../dashboard/NotificationsView';
import { MultiTenantView } from '../dashboard/MultiTenantView';
import { PdfExportsView } from '../dashboard/PdfExportsView';
import { AiAssistantView } from '../dashboard/AiAssistantView';
import { SettingsView } from '../dashboard/SettingsView';
import { BillingView } from '../dashboard/BillingView';
import { MarketplaceView } from '../dashboard/MarketplaceView';
import { VendorView } from '../dashboard/VendorView';
import { Web3DeFiViews } from '../dashboard/Web3DeFiViews';
import { LicensesAdminView } from '../dashboard/LicensesAdminView';

interface CAFMDashboardPageProps {
  onNavigate: (page: PageId) => void;
  language?: Language;
}

const INITIAL_ASSETS: CAFMAsset[] = [
  {
    id: 'ast-01',
    code: 'HVAC-NORTH-01',
    name: 'Chiller Unité Principale Nord',
    category: 'HVAC',
    location: 'Bâtiment A - Toiture',
    floor: 'R+5',
    status: 'OPERATIONAL',
    healthScore: 96,
    temperature: 18.4,
    powerUsageKw: 42.5,
    lastMaintenance: '2026-07-15',
    nextScheduled: '2026-08-20',
    serialNumber: 'DAIKIN-9942-X',
    vendor: 'Daikin Applied',
  },
  {
    id: 'ast-02',
    code: 'ELEV-WEST-02',
    name: 'Ascenseur Panoramique Ouest',
    category: 'ELEVATOR',
    location: 'Bâtiment B - Atrium',
    floor: 'R+0 à R+12',
    status: 'WARNING',
    healthScore: 74,
    temperature: 28.1,
    powerUsageKw: 18.2,
    lastMaintenance: '2026-06-02',
    nextScheduled: '2026-08-05',
    serialNumber: 'OTIS-GEN2-331',
    vendor: 'Otis Elevator',
  },
  {
    id: 'ast-03',
    code: 'PWR-SUB-01',
    name: 'Sous-Station Électrique HTA/BT',
    category: 'ENERGY_GRID',
    location: 'Bâtiment C - Sous-Sol',
    floor: 'SS-2',
    status: 'OPERATIONAL',
    healthScore: 99,
    temperature: 22.0,
    powerUsageKw: 185.0,
    lastMaintenance: '2026-07-01',
    nextScheduled: '2026-09-01',
    serialNumber: 'SCHNEIDER-SM6-24',
    vendor: 'Schneider Electric',
  },
  {
    id: 'ast-04',
    code: 'FIRE-PUMP-01',
    name: 'Groupe Motopompe Incendie (RIA)',
    category: 'FIRE_SAFETY',
    location: 'Local Technique SS1',
    floor: 'SS-1',
    status: 'OPERATIONAL',
    healthScore: 92,
    temperature: 19.5,
    powerUsageKw: 5.5,
    lastMaintenance: '2026-07-28',
    nextScheduled: '2026-08-28',
    serialNumber: 'GRUNDFOS-NK-80',
    vendor: 'Grundfos',
  },
  {
    id: 'ast-05',
    code: 'HVAC-EAST-02',
    name: 'Centrale Traitement d\'Air (CTA) Est',
    category: 'HVAC',
    location: 'Bâtiment A - Aile Est',
    floor: 'R+3',
    status: 'CRITICAL',
    healthScore: 48,
    temperature: 34.2,
    powerUsageKw: 68.0,
    lastMaintenance: '2026-05-10',
    nextScheduled: '2026-08-01',
    serialNumber: 'CARRIER-39HQ-11',
    vendor: 'Carrier',
  },
];

export const CAFMDashboardPage: React.FC<CAFMDashboardPageProps> = ({ onNavigate, language = 'FR' }) => {
  // Mode sombre enable dark cyber sovereign theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');

  // Live Telemetry & Server sync state
  const [telemetryValues, setTelemetryValues] = useState([5.2, 2.3, 7.3, 1.8, 7.1]);
  const [syncTime, setSyncTime] = useState('21:29:51');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [assets, setAssets] = useState<CAFMAsset[]>(INITIAL_ASSETS);

  // Initial backend fetch for Assets
  useEffect(() => {
    fetch('/api/assets')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Backend offline');
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAssets(data);
        }
      })
      .catch(() => {
        // Fallback to initial assets
      });
  }, []);

  // Telemetry ticker interval linked to /api/telemetry/live
  useEffect(() => {
    const fetchTelemetry = () => {
      fetch('/api/telemetry/live')
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            const now = new Date();
            setSyncTime(now.toTimeString().split(' ')[0]);
            if (Array.isArray(data.telemetryValues)) {
              setTelemetryValues(data.telemetryValues);
            }
          } else {
            const now = new Date();
            setSyncTime(now.toTimeString().split(' ')[0]);
            setTelemetryValues((prev) =>
              prev.map((v) => parseFloat((v + (Math.random() * 0.4 - 0.2)).toFixed(1)))
            );
          }
        })
        .catch(() => {
          const now = new Date();
          setSyncTime(now.toTimeString().split(' ')[0]);
          setTelemetryValues((prev) =>
            prev.map((v) => parseFloat((v + (Math.random() * 0.4 - 0.2)).toFixed(1)))
          );
        });
    };

    const timer = setInterval(fetchTelemetry, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetch('/api/telemetry/live')
      .then((res) => res.json())
      .then((data) => {
        const now = new Date();
        setSyncTime(now.toTimeString().split(' ')[0]);
        if (data && Array.isArray(data.telemetryValues)) {
          setTelemetryValues(data.telemetryValues);
        }
      })
      .catch(() => {
        const now = new Date();
        setSyncTime(now.toTimeString().split(' ')[0]);
      })
      .finally(() => {
        setTimeout(() => setIsRefreshing(false), 500);
      });
  };

  const handleAddAsset = (newAsset: CAFMAsset) => {
    setAssets([newAsset, ...assets]);
    fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAsset),
    }).catch((err) => console.error('Error posting asset to backend:', err));
  };

  const menuSections = [
    {
      title: 'PRINCIPAL',
      items: [
        { id: 'dashboard', label: 'TABLEAU DE BORD', icon: LayoutDashboard },
        { id: 'assets', label: 'ACTIFS', icon: Box },
        { id: 'spaces', label: 'ESPACES', icon: MapPin },
        { id: 'work-orders', label: 'ORDRES DE TRAVAIL', icon: ClipboardList },
        { id: 'maintenance', label: 'MAINTENANCE', icon: Wrench },
        { id: 'analytics', label: 'ANALYTIQUE', icon: BarChart3 },
        { id: 'leases', label: 'BAUX', icon: FileText },
      ],
    },
    {
      title: 'MODULES AVANCÉS',
      items: [
        { id: 'cmms', label: 'CMMS / GMAO', icon: Cpu },
        { id: 'digital-twin', label: 'JUMEAU NUMÉRIQUE', icon: Layers },
        { id: 'bim', label: 'VISUALISEUR BIM', icon: Eye },
        { id: 'erp', label: 'INTÉGRATION ERP', icon: Database },
        { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell },
        { id: 'tenants', label: 'MULTI-TENANT', icon: Building2 },
        { id: 'exports', label: 'EXPORTS PDF', icon: FileSpreadsheet },
        { id: 'ai', label: 'ASSISTANT IA', icon: Bot },
        { id: 'settings', label: 'PARAMÈTRES ORG.', icon: Sliders },
        { id: 'billing', label: 'FACTURATION', icon: CreditCard },
        { id: 'marketplace', label: 'MARKETPLACE', icon: ShoppingBag },
        { id: 'vendor', label: 'VENDOR', icon: Store },
      ],
    },
    {
      title: 'WEB3 & DEFI',
      items: [
        { id: 'staking', label: 'STAKING CAFM', icon: Coins },
        { id: 'dao', label: 'GOUVERNANCE DAO', icon: Vote },
        { id: 'launchpad', label: 'IDO LAUNCHPAD', icon: Rocket },
        { id: 'bridge', label: 'CROSS-CHAIN BRIDGE', icon: GitCompare },
        { id: 'oracle', label: 'ORACLE PRICES', icon: TrendingUp },
        { id: 'perpetuals', label: 'PERPETUALS TRADING', icon: Activity },
        { id: 'options', label: 'OPTIONS TRADING', icon: Shield },
      ],
    },
    {
      title: 'ADMIN',
      items: [
        { id: 'licenses', label: 'LICENCES', icon: Key },
      ],
    },
  ];

  // Theme-dependent canvas classes
  const bgCanvas = isDarkMode ? 'bg-[#090218] bg-main-radial text-slate-100' : 'bg-[#f8fafc] text-slate-900';
  const sidebarBg = isDarkMode ? 'glass-card-purple border-white/10' : 'bg-white border-slate-200';

  return (
    <div className={`min-h-screen flex font-mono ${bgCanvas} transition-colors duration-200 -mx-4 sm:-mx-6 -my-8`}>
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`w-72 shrink-0 border-r flex flex-col justify-between ${sidebarBg} p-4 z-20 sticky top-0 h-screen overflow-y-auto`}>
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-2 border-b border-white/10 pb-4">
            <div className="w-9 h-9 rounded-xl btn-gradient-orange flex items-center justify-center text-white shadow-md font-sans font-black text-lg">
              R
            </div>
            <div>
              <div className={`font-extrabold text-xs tracking-wider uppercase ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                SUPERADMIN HQ
              </div>
              <div className="text-[10px] font-bold text-orange-400 tracking-widest uppercase">
                FACILITY MANAGEMENT
              </div>
            </div>
          </div>

          {/* Nav Categories */}
          <nav className="space-y-6 text-xs">
            {menuSections.map((sec) => (
              <div key={sec.title} className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 tracking-wider px-3 uppercase">
                  {sec.title}
                </div>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentRoute(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-bold tracking-wide transition-all cursor-pointer ${
                        isActive
                          ? isDarkMode
                            ? 'bg-orange-500/20 text-orange-400 border-l-4 border-orange-500 font-extrabold shadow-sm'
                            : 'bg-slate-100 text-slate-900 border-l-4 border-orange-500 font-extrabold shadow-sm'
                          : isDarkMode
                          ? 'text-slate-300 hover:text-white hover:bg-white/5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-3 pt-6 border-t border-white/10">
          <div className={`flex items-center justify-between p-2.5 rounded-xl border ${isDarkMode ? 'border-white/10 bg-black/20 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'} text-xs font-bold`}>
            <div className="flex items-center gap-2 text-[11px]">
              {isDarkMode ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>{isDarkMode ? 'MODE SOMBRE' : 'MODE CLAIR'}</span>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${isDarkMode ? 'bg-orange-500' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className={`p-3 rounded-xl border ${isDarkMode ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'} space-y-2`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg btn-gradient-orange flex items-center justify-center font-bold text-white text-xs">
                TB
              </div>
              <div className="truncate">
                <div className={`text-xs font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} truncate`}>Tarik Benaich</div>
                <div className="text-[10px] text-orange-400 font-bold tracking-wider uppercase">SUPERADMIN</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> EN LIGNE
              </span>
              <button
                onClick={() => onNavigate('home')}
                className="text-slate-400 hover:text-rose-400 flex items-center gap-1 font-bold cursor-pointer transition-all"
              >
                <LogOut className="w-3 h-3" />
                <span>DÉCONNEXION</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT ROUTE CONTAINER */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-x-hidden">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'} uppercase`}>
              {currentRoute === 'dashboard' && 'OVERVIEW EXECUTIVE'}
              {currentRoute === 'assets' && 'INVENTAIRE DES ACTIFS'}
              {currentRoute === 'spaces' && 'GESTION DES ESPACES'}
              {currentRoute === 'work-orders' && 'ORDRES DE TRAVAIL (GMAO)'}
              {currentRoute === 'maintenance' && 'PLAN DE MAINTENANCE'}
              {currentRoute === 'analytics' && 'ANALYTIQUE & PERFORMANCE'}
              {currentRoute === 'leases' && 'GESTION DES BAUX'}
              {currentRoute === 'licenses' && 'STOCK LICENCES SUPER ADMIN'}
              {!['dashboard','assets','spaces','work-orders','maintenance','analytics','leases','licenses'].includes(currentRoute) && currentRoute.replace('-', ' ').toUpperCase()}
            </h1>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mt-1">
              <span className="w-2 h-2 rounded-sm bg-emerald-500 animate-pulse" />
              <span>SYNC SOCKET.IO: {syncTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className={`px-4 py-2 rounded-xl border ${isDarkMode ? 'border-white/10 bg-black/20 text-slate-200' : 'border-slate-200 bg-white text-slate-700'} hover:border-orange-500/50 text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
              <span>ACTUALISER</span>
            </button>

            <button
              onClick={() => setCurrentRoute('notifications')}
              className={`p-2.5 rounded-xl border ${isDarkMode ? 'border-white/10 bg-black/20 text-slate-200' : 'border-slate-200 bg-white text-slate-700'} hover:border-orange-500/50 shadow-sm relative cursor-pointer`}
            >
              <Bell className="w-4 h-4 text-orange-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
            </button>
          </div>
        </div>

        {/* ROUTE COMPONENT RENDERING */}
        {currentRoute === 'dashboard' && (
          <DashboardOverviewView
            isDarkMode={isDarkMode}
            syncTime={syncTime}
            telemetryValues={telemetryValues}
            assets={assets}
            onNavigateRoute={(route) => setCurrentRoute(route)}
            onAddAsset={handleAddAsset}
          />
        )}

        {currentRoute === 'assets' && (
          <AssetsView isDarkMode={isDarkMode} assets={assets} onAddAsset={handleAddAsset} />
        )}

        {currentRoute === 'spaces' && <SpacesView isDarkMode={isDarkMode} />}
        {currentRoute === 'work-orders' && <WorkOrdersView isDarkMode={isDarkMode} />}
        {currentRoute === 'maintenance' && <MaintenanceView isDarkMode={isDarkMode} />}
        {currentRoute === 'analytics' && <AnalyticsView isDarkMode={isDarkMode} />}
        {currentRoute === 'leases' && <LeasesView isDarkMode={isDarkMode} />}
        {currentRoute === 'cmms' && <CmmsView isDarkMode={isDarkMode} />}
        {currentRoute === 'digital-twin' && <DigitalTwinView isDarkMode={isDarkMode} />}
        {currentRoute === 'bim' && <BimViewerView isDarkMode={isDarkMode} />}
        {currentRoute === 'erp' && <ErpIntegrationView isDarkMode={isDarkMode} />}
        {currentRoute === 'notifications' && <NotificationsView isDarkMode={isDarkMode} />}
        {currentRoute === 'tenants' && <MultiTenantView isDarkMode={isDarkMode} />}
        {currentRoute === 'exports' && <PdfExportsView isDarkMode={isDarkMode} />}
        {currentRoute === 'ai' && <AiAssistantView isDarkMode={isDarkMode} />}
        {currentRoute === 'settings' && <SettingsView isDarkMode={isDarkMode} />}
        {currentRoute === 'billing' && <BillingView isDarkMode={isDarkMode} />}
        {currentRoute === 'marketplace' && <MarketplaceView isDarkMode={isDarkMode} />}
        {currentRoute === 'vendor' && <VendorView isDarkMode={isDarkMode} />}

        {['staking', 'dao', 'launchpad', 'bridge', 'oracle', 'perpetuals', 'options'].includes(currentRoute) && (
          <Web3DeFiViews isDarkMode={isDarkMode} subRoute={currentRoute} />
        )}

        {currentRoute === 'licenses' && <LicensesAdminView isDarkMode={isDarkMode} />}

      </main>

    </div>
  );
};
