import React from 'react';
import { PageId, Language } from '../../types';
import { CHANGELOG_ITEMS } from '../../data/mockData';
import { useTranslation } from '../../hooks/useTranslation';
import { Sparkles, Tag, Calendar, CheckCircle2 } from 'lucide-react';

interface ChangelogPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const ChangelogPage: React.FC<ChangelogPageProps> = ({ onNavigate, language: propLang }) => {
  const { t, language } = useTranslation(propLang);
  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto">
      
      {/* Title Header matching Image 10 */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
          {t('changelogTitle', language)}
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 font-light">
          {t('changelogSubtitle', language)}
        </p>
      </div>

      {/* Timeline items */}
      <div className="relative border-l-2 border-orange-500/40 ml-4 sm:ml-8 space-y-10 pl-6 sm:pl-10">
        {CHANGELOG_ITEMS.map((item) => (
          <div key={item.id} className="relative group">
            
            {/* Timeline Node Icon */}
            <div className="absolute -left-[31px] sm:-left-[47px] top-1 w-6 h-6 rounded-full btn-gradient-orange flex items-center justify-center text-white glow-orange-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            {/* Content Glass Card */}
            <div className="glass-card-purple rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 shadow-2xl hover:border-orange-500/50 transition-colors">
              
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-white">{item.title}</span>
                  <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    {item.version}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span>{item.date}</span>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>

              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-mono font-bold text-orange-400 uppercase">Highlights:</h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-200">
                  {item.details.map((d, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
