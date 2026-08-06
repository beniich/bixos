import React, { useState } from 'react';
import { PageId, Language } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { Mail, Phone, MapPin, Send, CheckCircle2, ZoomIn, ZoomOut } from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate, language: propLang }) => {
  const { t, language } = useTranslation(propLang);
  const [mapZoom, setMapZoom] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header matching Image 11 */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
          {t('contactTitle', language)}
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 font-light max-w-3xl">
          {t('contactSubtitle', language)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Form matching Image 11 */}
        <div className="lg:col-span-7">
          <div className="glass-card-purple rounded-3xl p-8 border border-orange-500/40 shadow-2xl space-y-6 glow-border">
            <h3 className="text-2xl font-bold text-white">Talk to a Solution Architect</h3>

            {submitted ? (
              <div className="p-8 text-center space-y-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                <h4 className="text-xl font-bold text-white">Message Transmitted!</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Thank you, <span className="text-orange-400 font-bold">{formData.name}</span>. An expert engineer will respond to your inquiry (<span className="font-mono text-white">{formData.email}</span>) within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">
                    {language === 'FR' ? 'Sujet' : language === 'DE' ? 'Betreff' : language === 'ES' ? 'Asunto' : 'Subject'}
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={language === 'FR' ? 'Demande de renseignement...' : 'Facility Security / Demo Request'}
                    className="w-full glass-card rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-orange-500 border border-white/10 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-gray-300 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={language === 'FR' ? 'Décrivez vos besoins...' : 'Describe your facility management & hardware security needs...'}
                    className="w-full glass-card rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-orange-500 border border-white/10 placeholder-gray-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-gradient-orange text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-wider glow-orange hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('contactExpert', language)}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Info & Map Column matching Image 11 */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Info Card */}
          <div className="glass-card-purple rounded-3xl p-6 border border-white/10 space-y-4">
            <h4 className="text-sm font-mono font-bold text-orange-400 uppercase tracking-wider">
              Global Support Headquarters
            </h4>

            <div className="space-y-3 text-xs text-gray-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <span>123 Sovereign Blvd, Innovation District, Tech City 54321</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span className="font-mono">support@sovereigndevice.com</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span className="font-mono">+1 (555) 123-4567 (24/7 Hotline)</span>
              </div>
            </div>
          </div>

          {/* Interactive Dark Map Canvas matching Image 11 */}
          <div className="glass-card rounded-3xl p-4 border border-orange-500/30 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white uppercase">Headquarters Map</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setMapZoom(Math.min(mapZoom + 0.2, 1.8))}
                  className="p-1.5 rounded-lg glass-card text-gray-300 hover:text-white"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMapZoom(Math.max(mapZoom - 0.2, 0.8))}
                  className="p-1.5 rounded-lg glass-card text-gray-300 hover:text-white"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#080214] border border-white/10 flex items-center justify-center">
              <svg
                className="w-full h-full transition-transform duration-300"
                style={{ transform: `scale(${mapZoom})` }}
                viewBox="0 0 400 250"
                fill="none"
              >
                {/* Street grid background */}
                <path d="M 0 50 L 400 50 M 0 100 L 400 100 M 0 150 L 400 150 M 0 200 L 400 200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <path d="M 100 0 L 100 250 M 200 0 L 200 250 M 300 0 L 300 250" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                
                {/* Main Avenue */}
                <path d="M 0 125 L 400 125" stroke="#ff8a3d" strokeWidth="2" strokeOpacity="0.4" />
                <path d="M 200 0 L 200 250" stroke="#ff8a3d" strokeWidth="2" strokeOpacity="0.4" />

                {/* Pulsing Locator Pin */}
                <g transform="translate(200, 125)">
                  <circle cx="0" cy="0" r="18" fill="rgba(255, 107, 0, 0.2)" className="animate-ping" />
                  <circle cx="0" cy="0" r="8" fill="#ff5e00" stroke="#ffffff" strokeWidth="2" />
                </g>
              </svg>

              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-orange-500/40 text-[10px] font-mono text-orange-400">
                HQ Lat: 48.8566, Lon: 2.3522
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
