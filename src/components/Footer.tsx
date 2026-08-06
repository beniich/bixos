import React from 'react';
import { PageId, Language, BrandVariant } from '../types';
import { Facebook, Youtube, X } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  language?: Language;
  brand?: BrandVariant;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 my-12 animate-fade-in">
      {/* Dark Glass Container with Neon Wave Graphics (Exact Screenshot Replica) */}
      <div className="relative rounded-3xl bg-[#0c0517]/90 backdrop-blur-2xl border border-[#d946ef]/30 p-8 sm:p-12 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,70,239,0.15)]">
        
        {/* Electric Energy Waves Ambient Graphic (Left & Right background effects from screenshot) */}
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-gradient-to-tr from-[#d946ef]/30 via-[#8b5cf6]/20 to-transparent blur-3xl pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-gradient-to-tl from-[#ec4899]/30 via-[#d946ef]/20 to-transparent blur-3xl pointer-events-none"></div>
        
        {/* Light Wave SVG overlay trails as in screenshot */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 1000 300" preserveAspectRatio="none">
          <path d="M-100 250 Q 200 120 500 280 T 1100 150" fill="none" stroke="url(#pinkWaveGrad)" strokeWidth="3" />
          <path d="M-50 280 Q 300 180 600 290 T 1150 180" fill="none" stroke="url(#purpleWaveGrad)" strokeWidth="1.5" strokeDasharray="6 6" />
          <defs>
            <linearGradient id="pinkWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d946ef" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="purpleWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#d946ef" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* 4 Footer Columns as in screenshot: Produit, Entreprise, Ressources, Légal */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Produit */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-semibold tracking-tight mb-4">Produit</h4>
            <ul className="space-y-2.5 text-xs text-[#a78bfa]">
              <li>
                <button onClick={() => onNavigate('members')} className="hover:text-white transition-colors cursor-pointer">
                  InboxAI
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bookings')} className="hover:text-white transition-colors cursor-pointer">
                  MeetAI
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  VitalAI
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('analytics')} className="hover:text-white transition-colors cursor-pointer">
                  ExitReady
                </button>
              </li>
            </ul>
          </div>

          {/* Entreprise */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-semibold tracking-tight mb-4">Entreprise</h4>
            <ul className="space-y-2.5 text-xs text-[#a78bfa]">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">
                  Blog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('architecture')} className="hover:text-white transition-colors cursor-pointer">
                  Carrières
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">
                  Presse
                </button>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-semibold tracking-tight mb-4">Ressources</h4>
            <ul className="space-y-2.5 text-xs text-[#a78bfa]">
              <li>
                <button onClick={() => onNavigate('support')} className="hover:text-white transition-colors cursor-pointer">
                  Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('architecture')} className="hover:text-white transition-colors cursor-pointer">
                  API
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('support')} className="hover:text-white transition-colors cursor-pointer">
                  Documentation
                </button>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div className="space-y-3">
            <h4 className="text-white text-base font-semibold tracking-tight mb-4">Légal</h4>
            <ul className="space-y-2.5 text-xs text-[#a78bfa]">
              <li>
                <button onClick={() => onNavigate('architecture')} className="hover:text-white transition-colors cursor-pointer">
                  Confidentialité
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors cursor-pointer">
                  CGU
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('support')} className="hover:text-white transition-colors cursor-pointer">
                  Mentions Légales
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider line */}
        <div className="relative z-10 w-full h-[1px] bg-white/10 mb-6"></div>

        {/* Bottom row matching exact screenshot: Social icons left, Copyright middle, Logo B BizOS right */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94a3b8]">
          
          {/* Social Icons */}
          <div className="flex items-center gap-4 text-[#a78bfa]">
            <a href="#facebook" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors p-1" title="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#x" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors p-1 font-bold text-sm" title="X">
              𝕏
            </a>
            <a href="#youtube" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors p-1" title="YouTube">
              <Youtube className="w-4 h-4" />
            </a>
          </div>

          {/* Copyright text in French as screenshot */}
          <div className="text-[11px] font-mono tracking-wide text-[#94a3b8]">
            © 2024 BizOS Unified Systems. All rights reserved.
          </div>

          {/* Neon Logo B BizOS */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#d946ef]/20 border border-[#d946ef]/60 flex items-center justify-center text-[#f472b6] font-serif font-extrabold text-xs shadow-[0_0_10px_rgba(217,70,239,0.5)]">
              B
            </div>
            <span className="font-bold text-sm tracking-tight text-white drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]">
              BizOS
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
};
