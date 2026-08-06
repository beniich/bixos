import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import {
  PageId,
  Language,
  BackgroundTheme,
  BrandVariant,
} from '../types';
import {
  Shield,
  Layers,
  Sparkles,
  Globe,
  Menu,
  X,
  Palette,
  ChevronDown,
  UserCheck,
  Key,
} from 'lucide-react';

interface HeaderProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  bgTheme: BackgroundTheme;
  onBgThemeChange: (theme: BackgroundTheme) => void;
  brand: BrandVariant;
  onBrandChange: (brand: BrandVariant) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  language: propLang,
  onLanguageChange,
  bgTheme,
  onBgThemeChange,
  brand,
  onBrandChange,
}) => {
  const { t, language } = useTranslation(propLang);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const navItems: { id: PageId; label: Record<Language, string> }[] = [
    {
      id: 'home',
      label: { FR: 'SOLUTIONS', EN: 'SOLUTIONS', DE: 'LÖSUNGEN', ES: 'SOLUCIONES' },
    },
    {
      id: 'dashboard',
      label: { FR: 'DASHBOARD CAFM', EN: 'CAFM DASHBOARD', DE: 'CAFM DASHBOARD', ES: 'PANEL CAFM' },
    },
    {
      id: 'architecture',
      label: { FR: 'ARCHITECTURE', EN: 'ARCHITECTURE', DE: 'ARCHITEKTUR', ES: 'ARQUITECTURA' },
    },
    {
      id: 'pricing',
      label: { FR: 'TARIFS', EN: 'PRICING', DE: 'PREISE', ES: 'TARIFAS' },
    },
    {
      id: 'support',
      label: { FR: 'SUPPORT', EN: 'SUPPORT', DE: 'SUPPORT', ES: 'SOPORTE' },
    },
    {
      id: 'security',
      label: { FR: 'SÉCURITÉ', EN: 'SECURITY', DE: 'SICHERHEIT', ES: 'SEGURIDAD' },
    },
    {
      id: 'demo',
      label: { FR: 'DÉMO', EN: 'DEMO', DE: 'DEMO', ES: 'DEMO' },
    },
    {
      id: 'workspace',
      label: { FR: 'WORKSPACE GOOGLE', EN: 'GOOGLE WORKSPACE', DE: 'GOOGLE WORKSPACE', ES: 'GOOGLE WORKSPACE' },
    },
    {
      id: 'licenses',
      label: { FR: 'STOCK LICENCES', EN: 'LICENSES STOCK', DE: 'LIZENZEN STOCK', ES: 'STOCK LICENCIAS' },
    },
    {
      id: 'blog',
      label: { FR: 'BLOG', EN: 'BLOG', DE: 'BLOG', ES: 'BLOG' },
    },
    {
      id: 'contact',
      label: { FR: 'CONTACT', EN: 'CONTACT', DE: 'KONTAKT', ES: 'CONTACTO' },
    },
  ];

  const brandOptions: BrandVariant[] = ['CAFM Pro', 'Sovereign Device Nexus', 'ReclamTrack Pro'];

  const themeOptions: { id: BackgroundTheme; name: string }[] = [
    { id: 'circuit', name: 'Circuit PCB' },
    { id: 'building', name: 'Building 3D Wireframe' },
    { id: 'waves', name: 'Wave Lines' },
    { id: 'nodes', name: 'Connected Nodes' },
    { id: 'brain', name: 'Neural Circuit' },
    { id: 'map', name: 'Global Map Arcs' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto glass-header rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl border border-white/10">
        
        {/* Brand Selector Logo */}
        <div className="relative">
          <button
            onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            title="Click to switch Brand Theme"
          >
            <div className="w-9 h-9 rounded-xl btn-gradient-orange flex items-center justify-center text-white glow-orange-sm group-hover:scale-105 transition-transform">
              {brand === 'CAFM Pro' && <Layers className="w-5 h-5" />}
              {brand === 'Sovereign Device Nexus' && <Shield className="w-5 h-5" />}
              {brand === 'ReclamTrack Pro' && <Sparkles className="w-5 h-5" />}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  {brand === 'ReclamTrack Pro' ? (
                    <>
                      RECLAMTRACK <span className="text-orange-500">PRO</span>
                    </>
                  ) : (
                    brand
                  )}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-orange-400/80 font-mono block -mt-1">
                Cyber-Sovereign Platform
              </span>
            </div>
          </button>

          {/* Brand Switcher Dropdown */}
          {brandDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-60 glass-card-purple rounded-xl p-2 z-50 shadow-2xl border border-orange-500/30">
              <p className="text-xs font-mono text-gray-400 px-3 py-1 uppercase border-b border-white/10 mb-1">
                Select Visual Branding
              </p>
              {brandOptions.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    onBrandChange(b);
                    setBrandDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    brand === b
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{b}</span>
                  {brand === b && <span className="w-2 h-2 rounded-full bg-orange-500 glow-orange-sm" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-wider uppercase text-gray-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`transition-all duration-200 hover:text-white relative py-1 cursor-pointer ${
                activePage === item.id ? 'text-orange-400 font-extrabold' : 'hover:text-orange-300'
              }`}
            >
              {item.label[language]}
              {activePage === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 btn-gradient-orange rounded-full glow-orange-sm" />
              )}
            </button>
          ))}
        </nav>

        {/* Right Tools & CTA */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Background Theme Selector */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="p-2 rounded-lg glass-card hover:border-orange-500/50 text-gray-300 hover:text-orange-400 transition-colors flex items-center gap-1.5 text-xs font-mono"
              title="Change Canvas Graphic Theme"
            >
              <Palette className="w-4 h-4 text-orange-400" />
              <span className="hidden xl:inline capitalize">{bgTheme}</span>
            </button>

            {themeDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-52 glass-card-purple rounded-xl p-2 z-50 shadow-2xl border border-orange-500/30">
                <p className="text-[11px] font-mono text-gray-400 px-3 py-1 uppercase border-b border-white/10 mb-1">
                  Background Visual
                </p>
                {themeOptions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onBgThemeChange(t.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      bgTheme === t.id
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="px-2.5 py-1.5 rounded-lg glass-card hover:border-orange-500/50 text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <span>{language}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-28 glass-card-purple rounded-xl p-1 z-50 shadow-2xl border border-orange-500/30">
                {(['FR', 'EN', 'DE', 'ES'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      onLanguageChange(l);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-center px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      language === l
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={() => onNavigate('login')}
            className="text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
          >
            {language === 'FR' ? 'CONNEXION' : language === 'ES' ? 'CONEXIÓN' : 'LOGIN'}
          </button>

          {/* Glowing CTA Button */}
          <button
            onClick={() => onNavigate('demo')}
            className="btn-gradient-orange text-white px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider glow-orange hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{language === 'FR' ? 'DÉMARRER' : language === 'ES' ? 'EMPEZAR' : 'GET STARTED'}</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl glass-card text-gray-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-orange-400" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 glass-card-purple rounded-2xl p-6 border border-orange-500/30 space-y-4 shadow-2xl animate-fade-in z-50">
          <div className="grid grid-cols-2 gap-2 border-b border-white/10 pb-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${
                  activePage === item.id
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {item.label[language]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Lang:</span>
              {(['FR', 'EN', 'DE', 'ES'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => onLanguageChange(l)}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    language === l ? 'bg-orange-500 text-white' : 'text-gray-400'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-xl glass-card text-xs font-bold text-center text-white"
              >
                Login
              </button>
              <button
                onClick={() => {
                  onNavigate('demo');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 rounded-xl btn-gradient-orange text-xs font-bold text-center text-white glow-orange"
              >
                Démarrer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
