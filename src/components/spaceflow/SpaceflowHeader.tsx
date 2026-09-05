import React, { useState } from 'react';
import { GoogleAuthUser, PageId, Language } from '../../types';
import { 
  ChevronDown, Moon, Sun, LogIn, Mail, Sparkles, Shield, Cpu, Zap, Globe
} from 'lucide-react';
import { useLanguageContext } from '../../context/LanguageContext';
import { BizosLogo } from '../common/BizosLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SpaceflowHeaderProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  userRole?: string;
  googleUser?: GoogleAuthUser | null;
  onLogoutGoogle?: () => void;
}

export const SpaceflowHeader: React.FC<SpaceflowHeaderProps> = ({
  currentPage,
  setCurrentPage,
  isDarkMode,
  setIsDarkMode,
  isLoggedIn,
  setIsLoggedIn,
  googleUser,
  onLogoutGoogle,
}) => {
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguageContext();

  return (
    <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="bizos-header-glow rounded-2xl px-5 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo with Glowing Purple Chip & Circuit Traces */}
        <div className="flex items-center">
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center cursor-pointer group text-left"
          >
            <BizosLogo size="md" />
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#d1d5db]">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`transition-colors cursor-pointer hover:text-white ${
              currentPage === 'dashboard' ? 'text-[#f472b6] font-semibold drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]' : 'text-[#e5e7eb]'
            }`}
          >
            {t('navDashboard')}
          </button>

          <button
            onClick={() => setCurrentPage('members')}
            className={`transition-colors cursor-pointer hover:text-white flex items-center gap-1 ${
              currentPage === 'members' ? 'text-[#f472b6] font-semibold drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]' : 'text-[#e5e7eb]'
            }`}
          >
            <span>{t('navAssets')}</span>
          </button>

          <button
            onClick={() => setCurrentPage('bookings')}
            className={`transition-colors cursor-pointer hover:text-white flex items-center gap-1 ${
              currentPage === 'bookings' ? 'text-[#f472b6] font-semibold drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]' : 'text-[#e5e7eb]'
            }`}
          >
            <span>{t('navWorkOrders')}</span>
          </button>

          {/* Solutions Dropdown */}
          <div className="relative" onMouseLeave={() => setSolutionsOpen(false)}>
            <button
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              onMouseEnter={() => setSolutionsOpen(true)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[#e5e7eb]"
            >
              <span>{t('navFeatures')}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${solutionsOpen ? 'rotate-180 text-[#f472b6]' : ''}`} />
            </button>

            {solutionsOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-[#140826]/95 backdrop-blur-xl border border-[#d946ef]/40 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(217,70,239,0.2)] z-50 animate-fade-in space-y-1">
                <button
                  onClick={() => { setCurrentPage('cafm_gmao'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#d946ef]/20 transition-colors flex items-center justify-between text-xs text-white group"
                >
                  <span className="font-semibold text-[#f472b6] group-hover:text-white">CAFM Dashboard</span>
                  <span className="text-[10px] bg-[#d946ef]/30 text-white px-2 py-0.5 rounded-full font-mono">GMAO</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('admin_super'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#d946ef]/20 transition-colors flex items-center justify-between text-xs text-white group"
                >
                  <span className="font-semibold text-[#f472b6] group-hover:text-white">Super Admin Hub</span>
                  <span className="text-[10px] bg-red-500/30 text-white px-2 py-0.5 rounded-full font-mono">ROOT</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('today'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#d946ef]/20 transition-colors flex items-center justify-between text-xs text-white group"
                >
                  <span className="font-semibold text-[#f472b6] group-hover:text-white">{t('navToday')}</span>
                  <span className="text-[10px] bg-[#d946ef]/30 text-white px-2 py-0.5 rounded-full font-mono">Realtime</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('analytics'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#d946ef]/20 transition-colors flex items-center justify-between text-xs text-white group"
                >
                  <span className="font-semibold text-[#f472b6] group-hover:text-white">{t('navAiPredictions')}</span>
                  <span className="text-[10px] bg-[#d946ef]/30 text-white px-2 py-0.5 rounded-full font-mono">Gemini 2.5</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('mobile_pwa'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#d946ef]/20 transition-colors flex items-center justify-between text-xs text-white group"
                >
                  <span className="font-semibold text-[#f472b6] group-hover:text-white">{t('navMobilePwa')}</span>
                  <span className="text-[10px] bg-[#d946ef]/30 text-white px-2 py-0.5 rounded-full font-mono">Offline</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('visitors'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#d946ef]/20 transition-colors flex items-center justify-between text-xs text-white group"
                >
                  <span className="font-semibold text-[#f472b6] group-hover:text-white">{t('navTelemetry')}</span>
                  <span className="text-[10px] bg-[#03b5d3]/30 text-[#03b5d3] px-2 py-0.5 rounded-full font-mono">MQTT</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('licenses'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#d946ef]/15 transition-colors flex items-center justify-between text-xs text-[#e5e7eb]"
                >
                  <span>{t('navLicenses')}</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#f472b6]" />
                </button>

                <button
                  onClick={() => { setCurrentPage('schema'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#d946ef]/15 transition-colors flex items-center justify-between text-xs text-[#e5e7eb]"
                >
                  <span>{t('navSchema')}</span>
                  <span className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono">Nexus</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('wp_plugin'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-gradient-to-r from-[#d946ef]/30 to-[#f472b6]/20 border border-[#f472b6]/40 hover:border-[#f472b6] transition-all flex items-center justify-between text-xs text-white group font-bold shadow-sm"
                >
                  <span className="text-white group-hover:text-[#f472b6]">🔌 Plugin WP (BizOS)</span>
                  <span className="text-[10px] bg-[#f472b6] text-black px-2 py-0.5 rounded-full font-mono font-black animate-pulse">v2.1.0</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('ecoasset_plugin'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 mt-2 rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-500/40 hover:border-blue-400 transition-all flex items-center justify-between text-xs text-white group font-bold shadow-sm"
                >
                  <span className="text-white group-hover:text-blue-400">🎟️ Plugin WP (EcoAsset)</span>
                  <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-mono font-black">NEW</span>
                </button>

                <button
                  onClick={() => { setCurrentPage('venue_management'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 mt-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-2 text-xs text-white group"
                >
                  🏟️ Gestion Stades & Opéras
                </button>
                <button
                  onClick={() => { setCurrentPage('stadium_management'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 mt-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-2 text-xs text-white group"
                >
                  🏗️ Builder de Stades (DB)
                </button>

                <button
                  onClick={() => { setCurrentPage('arena_esport'); setSolutionsOpen(false); }}
                  className="w-full text-left px-3 py-2 mt-1 rounded-xl bg-gradient-to-r from-cyan-600/30 to-teal-600/30 border border-cyan-500/40 hover:border-cyan-300 transition-all flex items-center justify-between text-xs text-white group font-bold shadow-sm"
                >
                  <span className="text-white group-hover:text-cyan-300">🎮 Plan Arène eSport</span>
                  <span className="text-[10px] bg-cyan-500 text-black px-2 py-0.5 rounded-full font-mono font-black animate-pulse">LIVE</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setCurrentPage('pricing')}
            className={`transition-colors cursor-pointer hover:text-white ${
              currentPage === 'pricing' ? 'text-[#f472b6] font-semibold drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]' : 'text-[#e5e7eb]'
            }`}
          >
            {t('navPricing')}
          </button>

          <button
            onClick={() => setCurrentPage('architecture')}
            className={`transition-colors cursor-pointer hover:text-white ${
              currentPage === 'architecture' ? 'text-[#f472b6] font-semibold drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]' : 'text-[#e5e7eb]'
            }`}
          >
            {t('navAbout')}
          </button>
        </nav>

        {/* Header Right Actions matching exact screenshot: Connexion (Pill glass) & Démarrer gratuitement (glowing pink pill button) */}
        <div className="flex items-center gap-3">
          <PWAInstallButton />
          
          {/* Language Switcher (EN Default / FR Second) */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/20 text-xs text-white">
            <Globe className="w-3.5 h-3.5 text-[#f472b6] ml-1.5 mr-0.5" />
            <button
              onClick={() => setLanguage && setLanguage('EN')}
              className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                language === 'EN'
                  ? 'bg-[#d946ef] text-white shadow-[0_0_10px_rgba(217,70,239,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage && setLanguage('FR')}
              className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                language === 'FR'
                  ? 'bg-[#d946ef] text-white shadow-[0_0_10px_rgba(217,70,239,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              FR
            </button>
          </div>

          {googleUser || isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage('settings')}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/20 hover:border-[#f472b6] text-xs font-medium text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#f472b6] animate-pulse" />
                <span>My Workspace</span>
              </button>
              <button
                onClick={() => {
                  if (onLogoutGoogle) onLogoutGoogle();
                  setIsLoggedIn(false);
                }}
                className="p-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white text-xs cursor-pointer transition-all"
                title="Sign Out"
              >
                <LogIn className="w-4 h-4 rotate-180" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage('login')}
                className="px-5 py-2 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 text-xs font-medium text-white transition-all cursor-pointer"
              >
                {t('navLogin')}
              </button>
              <button
                onClick={() => setCurrentPage('login')}
                className="px-6 py-2 rounded-full bizos-cta-pink text-xs font-semibold text-white transition-all cursor-pointer shadow-[0_0_20px_rgba(217,70,239,0.4)]"
              >
                {t('getStarted')}
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
