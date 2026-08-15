import React, { useState } from 'react';
import { PageId, Language } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Play, Pause, Calendar, CheckCircle2, Video, Sparkles, Cpu, Activity } from 'lucide-react';

interface DemoPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const DemoPage: React.FC<DemoPageProps> = ({ onNavigate, language: propLang }) => {
  const { t, language } = useTranslation(propLang);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(35);
  const [booked, setBooked] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    dateTime: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBooked(true);
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
      
      {/* Title Header */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
          {t('demoTitle', language)}
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 font-light max-w-3xl">
          {t('demoSubtitle', language)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Video Player Mockup */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card-purple rounded-3xl p-6 border border-orange-500/30 space-y-4 shadow-2xl relative overflow-hidden">
            <h3 className="text-sm font-mono font-bold text-orange-400 uppercase tracking-wider">
              Interactive Demo Request Walkthrough
            </h3>

            {/* Video Canvas Container matching Image 8 */}
            <div className="relative aspect-video rounded-2xl overflow-hidden glass-card border border-white/10 flex items-center justify-center bg-black/40">
              
              {/* Background Video Simulation Graphic */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <svg className="w-full h-full" viewBox="0 0 500 300" fill="none">
                  <path d="M 50 150 Q 250 50 450 150" stroke="#ff8a3d" strokeWidth="2" strokeDasharray="5 5" />
                  <circle cx="250" cy="100" r="30" fill="rgba(255,107,0,0.2)" stroke="#ff8a3d" />
                </svg>
              </div>

              {/* Central Play/Pause Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 rounded-full btn-gradient-orange flex items-center justify-center text-white glow-orange hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>

              {/* Bottom Video Progress Bar */}
              <div className="absolute bottom-4 left-6 right-6 flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full btn-gradient-orange glow-orange"
                    style={{ width: `${isPlaying ? 65 : videoProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-gray-300">02:15 / 05:00</span>
              </div>
            </div>

            {/* 3 Quick Cards Below Video matching Image 8 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              
              <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-orange-400">
                  <Sparkles className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-white">AI-Driven Insights</h4>
                </div>
                <p className="text-[11px] text-gray-300">Automate work orders and predictive maintenance.</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-orange-400">
                  <Activity className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-white">Real-time Monitoring</h4>
                </div>
                <p className="text-[11px] text-gray-300">Optimize hardware assets across all facilities.</p>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-orange-400">
                  <Cpu className="w-4 h-4" />
                  <h4 className="text-xs font-bold text-white">Predictive Maintenance</h4>
                </div>
                <p className="text-[11px] text-gray-300">Reduce unplanned equipment downtime.</p>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Book a Meeting Form matching Image 8 */}
        <div className="lg:col-span-5">
          <div className="glass-card-purple rounded-3xl p-8 border border-orange-500/40 shadow-2xl space-y-6 glow-border">
            <h3 className="text-2xl font-bold text-white">{t('bookMeeting', language)}</h3>

            {booked ? (
              <div className="p-8 text-center space-y-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                <h4 className="text-xl font-bold text-white">Demo Scheduled!</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Thank you, <span className="text-orange-400 font-bold">{formData.name}</span>. A senior CAFM Pro solution architect will contact you shortly at <span className="font-mono text-white">{formData.email}</span> with calendar details.
                </p>
                <button
                  onClick={() => setBooked(false)}
                  className="btn-gradient-orange text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Schedule Another Demo
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">{t('fullName', language)}</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('fullName', language)}
                    className="w-full glass-card rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-orange-500 border border-white/10 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">{t('companyName', language)}</label>
                  <input
                    required
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder={t('companyName', language)}
                    className="w-full glass-card rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-orange-500 border border-white/10 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">{t('workEmail', language)}</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('workEmail', language)}
                    className="w-full glass-card rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-orange-500 border border-white/10 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">{t('phoneNumber', language)}</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('phoneNumber', language)}
                    className="w-full glass-card rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-orange-500 border border-white/10 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">{t('preferredDateTime', language)}</label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full glass-card rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-orange-500 border border-white/10"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-gradient-orange text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-wider glow-orange hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {t('scheduleDemo', language)}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
