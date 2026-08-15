import React from 'react';
import { PageId, Language } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { ASSET_IMAGES } from '../../data/assets';
import { Eye, Target, Cpu, Leaf, BarChart2 } from 'lucide-react';

interface VisionPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const VisionPage: React.FC<VisionPageProps> = ({ onNavigate, language: propLang }) => {
  const { t, language } = useTranslation(propLang);
  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
      
      {/* Hero Outer Frame Container matching Page Example 2 */}
      <section className="relative glass-card-purple outer-frame rounded-3xl p-8 md:p-12 overflow-hidden border border-white/10 shadow-2xl">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              CAFM Pro: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-orange-400">
                Our Vision & Mission
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed">
              {t('visionSubtitle', language)}
            </p>
          </div>

          {/* Hero Right Image (Futuristic Smart City Network) */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <img
              src={ASSET_IMAGES.smartCity3d}
              alt="CAFM Pro Futuristic Smart City"
              referrerPolicy="no-referrer"
              className="w-full max-w-lg h-auto object-contain rounded-2xl drop-shadow-[0_20px_50px_rgba(147,51,234,0.3)] hover:scale-[1.02] transition-transform duration-700"
            />
          </div>

        </div>

        {/* Our Vision & Our Mission Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 mt-8 border-t border-white/10">
          
          {/* Our Vision */}
          <div className="glass-panel card-glow-bottom rounded-2xl p-6 flex items-start gap-5 hover:bg-white/5 transition-colors">
            <div className="shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-orange-400">
              <Eye className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Our Vision</h3>
              <p className="text-sm text-gray-300 leading-relaxed font-light">
                To revolutionize facility management through intelligent, connected data, creating smarter, sustainable environments for critical infrastructure worldwide.
              </p>
            </div>
          </div>

          {/* Our Mission */}
          <div className="glass-panel card-glow-bottom rounded-2xl p-6 flex items-start gap-5 hover:bg-white/5 transition-colors">
            <div className="shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-orange-400">
              <Target className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Our Mission</h3>
              <p className="text-sm text-gray-300 leading-relaxed font-light">
                Providing cutting-edge CAFM solutions that empower organizations to optimize operations, reduce energy overhead, and enhance tenant user experiences.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* 3 Pillars Row (Intelligent Optimization, Sustainability Focus, Data-Driven Decisions) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pillar 1 */}
        <div className="glass-panel card-glow-bottom rounded-2xl p-6 flex items-start gap-4 hover:bg-white/5 transition-colors">
          <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-orange-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Intelligent Optimization</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Autonomous micro-adjustments in building climate and power consumption powered by AI telemetry.
            </p>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="glass-panel card-glow-bottom rounded-2xl p-6 flex items-start gap-4 hover:bg-white/5 transition-colors">
          <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-orange-400">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Sustainability Focus</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Providing sustainable CAFM algorithms that empower organizations to reach net-zero operational goals.
            </p>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="glass-panel card-glow-bottom rounded-2xl p-6 flex items-start gap-4 hover:bg-white/5 transition-colors">
          <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-orange-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Data-Driven Decisions</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Advanced analytics to secure, determine, and visualize persistent asset logs and predictive audits.
            </p>
          </div>
        </div>

      </div>

      {/* Join Banner */}
      <div className="glass-card p-10 rounded-3xl border border-orange-500/30 text-center space-y-6 glow-border">
        <h3 className="text-3xl font-bold text-white">Join the Sovereign Future</h3>
        <p className="text-sm text-gray-300 max-w-xl mx-auto font-light">
          Partner with CAFM Pro & Sovereign Device Nexus to safeguard your commercial real estate assets today.
        </p>
        <button
          onClick={() => onNavigate('contact')}
          className="btn-gradient-orange text-white px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider glow-orange cursor-pointer hover:scale-105 transition-transform"
        >
          Contact Our Leadership
        </button>
      </div>

    </div>
  );
};

