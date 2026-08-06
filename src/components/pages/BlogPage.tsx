import React, { useState } from 'react';
import { PageId, Language, Article } from '../../types';
import { ARTICLES } from '../../data/mockData';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Clock, User, ArrowRight, X } from 'lucide-react';

interface BlogPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate, language: propLang }) => {
  const { t, language } = useTranslation(propLang);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const categories = ['All', 'Security', 'AI & Intelligence', 'Compliance', 'Platform', 'Research', 'Guide'];

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesCat = activeCategory === 'All' || art.category === activeCategory;
    const matchesQuery =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
      
      {/* Title Header matching Image 6 */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
          {t('blogTitle', language)}
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 font-light max-w-3xl">
          {t('blogSubtitle', language)}
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'btn-gradient-orange text-white glow-orange-sm'
                  : 'glass-card text-gray-300 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full glass-card rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:outline-none focus:border-orange-500 border border-white/10"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="glass-card-purple rounded-3xl overflow-hidden border border-white/10 space-y-4 hover:border-orange-500/50 transition-all cursor-pointer group shadow-2xl flex flex-col justify-between"
          >
            <div>
              {/* Image banner */}
              <div className="relative h-48 overflow-hidden bg-purple-950">
                <img
                  src={art.image}
                  alt={art.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-orange-500/90 text-white font-mono font-bold text-[10px] uppercase px-3 py-1 rounded-full backdrop-blur-md">
                  {art.category}
                </span>
              </div>

              {/* Title & Excerpt */}
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{art.excerpt}</p>
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="px-6 pb-6 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-400" />
                <span>{art.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>{art.readTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card-purple w-full max-w-2xl rounded-3xl p-8 border border-orange-500/50 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-6 right-6 p-2 rounded-xl glass-card text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase">
              {selectedArticle.category}
            </span>

            <h2 className="text-3xl font-extrabold text-white leading-tight">{selectedArticle.title}</h2>

            <div className="flex items-center gap-4 text-xs font-mono text-gray-400 border-y border-white/10 py-3">
              <span>By {selectedArticle.author}</span>
              <span>•</span>
              <span>{selectedArticle.date}</span>
              <span>•</span>
              <span>{selectedArticle.readTime}</span>
            </div>

            <p className="text-sm text-gray-200 leading-relaxed">{selectedArticle.content}</p>

            <div className="glass-card p-4 rounded-xl border border-white/10 text-xs text-gray-300 leading-relaxed font-mono">
              [SECURITY NOTE]: All articles in the Sovereign Device Nexus research library are cryptographically signed and peer-reviewed by cybersecurity architects.
            </div>

            <button
              onClick={() => setSelectedArticle(null)}
              className="w-full btn-gradient-orange text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              Close Article
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
