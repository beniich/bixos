import React, { useState } from 'react';
import { PageId, Language } from '../../types';
import { TESTIMONIALS } from '../../data/mockData';
import { useTranslation } from '../../hooks/useTranslation';
import { Star, Building2, Quote, ArrowRight } from 'lucide-react';

interface TestimonialsPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({ onNavigate, language: propLang }) => {
  const { t, language } = useTranslation(propLang);
  const [filter, setFilter] = useState('All');

  const industries = ['All', 'Enterprise Real Estate', 'Smart Data Centers', 'Municipal Infrastructure'];

  const filtered = filter === 'All' ? TESTIMONIALS : TESTIMONIALS.filter((t) => t.industry === filter);

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header matching Image 5 */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
          {t('testimonialsTitle', language)}
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 font-light max-w-3xl">
          {t('testimonialsSubtitle', language)}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        {industries.map((ind) => (
          <button
            key={ind}
            onClick={() => setFilter(ind)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === ind
                ? 'btn-gradient-orange text-white glow-orange-sm'
                : 'glass-card text-gray-300 hover:text-white'
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Testimonials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="glass-card-purple rounded-3xl p-8 border border-white/10 space-y-6 flex flex-col justify-between shadow-2xl relative"
          >
            <div className="space-y-4">
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-orange-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-gray-200 leading-relaxed font-light italic">
                "{t.quote}"
              </p>
            </div>

            {/* Author details */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{t.author}</h4>
                <p className="text-xs text-orange-400 font-mono">
                  {t.role}, {t.company}
                </p>
              </div>
              <Building2 className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Case Study CTA */}
      <div className="glass-card p-8 rounded-3xl border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 glow-border">
        <div>
          <h3 className="text-2xl font-bold text-white">Read Full Case Study PDFs</h3>
          <p className="text-xs text-gray-300 font-mono">How Apex Corp reduced HVAC energy consumption by 34% in 6 months.</p>
        </div>
        <button
          onClick={() => onNavigate('demo')}
          className="btn-gradient-orange text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider glow-orange flex items-center gap-2 flex-shrink-0"
        >
          <span>Download Case Studies</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
