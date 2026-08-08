import React, { useState } from 'react';
import { PageId, Language } from '../../types';
import { FAQ_ITEMS } from '../../data/mockData';
import { useTranslation } from '../../hooks/useTranslation';
import {
  Search,
  HelpCircle,
  Video,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Bot,
  Send,
  X,
} from 'lucide-react';

interface SupportPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate, language: propLang }) => {
  const { t, language } = useTranslation(propLang);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    {
      sender: 'bot',
      text:
        language === 'FR'
          ? "Bonjour ! Je suis l'assistant IA CAFM Pro. Comment puis-je vous aider aujourd'hui ?"
          : language === 'DE'
          ? 'Hallo! Ich bin der KI-Assistent. Wie kann ich Ihnen heute helfen?'
          : language === 'ES'
          ? '¡Hola! Soy el asistente de IA. ¿Cómo puedo ayudarte hoy?'
          : "Hello! I am the AI assistant. How can I help you today with your facility devices?",
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const helpBannerText: Record<Language, string> = {
    FR: "Besoin d'aide supplémentaire ? Contactez notre équipe.",
    EN: "Need additional help? Contact our support team.",
    DE: "Benötigen Sie weitere Hilfe? Kontaktieren Sie unser Team.",
    ES: "¿Necesita ayuda adicional? Contacte a nuestro equipo.",
  };

  const chatBtnText: Record<Language, string> = {
    FR: "Discuter avec un expert",
    EN: "Chat with an Expert",
    DE: "Mit einem Experten chatten",
    ES: "Chatear con un experto",
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const q = item.question[language] || item.question.EN;
    const a = item.answer[language] || item.answer.EN;
    return q.toLowerCase().includes(searchQuery.toLowerCase()) || a.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const userText = inputMsg;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputMsg('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Analysis complete for "${userText}". All telemetry parameters remain optimal.`,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-16 animate-fade-in max-w-7xl mx-auto">
      
      {/* Title Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
          {t('supportTitle', language)}
        </h1>
        <p className="text-sm sm:text-lg text-gray-300 font-light">
          {t('supportSubtitle', language)}
        </p>
      </div>

      {/* Large Glowing Orange Search Bar matching Image 3 */}
      <div className="relative max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder', language)}
            className="w-full btn-gradient-orange text-white placeholder-white/80 rounded-full px-8 py-5 text-lg font-medium shadow-2xl glow-orange border-2 border-orange-400/50 focus:outline-none"
          />
          <Search className="w-7 h-7 text-white absolute right-6 pointer-events-none" />
        </div>
      </div>

      {/* 3 Main Glassmorphic Category Cards matching Image 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Card 1: FAQ */}
        <div className="glass-card-purple rounded-3xl p-8 border border-white/10 space-y-6 flex flex-col justify-between shadow-2xl hover:scale-[1.02] transition-transform">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-orange-400 tracking-tight">FAQ</h2>
            <ul className="space-y-2.5 text-sm text-gray-200">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>{language === 'FR' ? 'Questions fréquentes' : language === 'DE' ? 'Häufige Fragen' : language === 'ES' ? 'Preguntas frecuentes' : 'Frequently Asked Questions'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>{language === 'FR' ? 'Résolution de problèmes' : language === 'DE' ? 'Fehlerbehebung' : language === 'ES' ? 'Solución de problemas' : 'Troubleshooting'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>{language === 'FR' ? 'Guides de base' : language === 'DE' ? 'Grundlegende Leitfäden' : language === 'ES' ? 'Guías básicas' : 'Getting Started Guides'}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('faq-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-gradient-orange text-white py-3 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider glow-orange-sm hover:scale-105 transition-transform cursor-pointer"
          >
            {language === 'FR' ? 'Voir la FAQ' : language === 'DE' ? 'FAQ Anzeigen' : language === 'ES' ? 'Ver Preguntas' : 'Browse FAQ'}
          </button>
        </div>

        {/* Card 2: Tutoriels */}
        <div className="glass-card-purple rounded-3xl p-8 border border-white/10 space-y-6 flex flex-col justify-between shadow-2xl hover:scale-[1.02] transition-transform">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-orange-400 tracking-tight">
              {language === 'FR' ? 'Tutoriels' : language === 'DE' ? 'Anleitungen' : language === 'ES' ? 'Tutoriales' : 'Tutorials'}
            </h2>
            <ul className="space-y-2.5 text-sm text-gray-200">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>{language === 'FR' ? 'Vidéos de formation' : 'Training Videos'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>{language === 'FR' ? 'Documents techniques' : 'Technical Docs'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>{language === 'FR' ? 'Meilleures pratiques' : 'Best Practices'}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate('demo')}
            className="btn-gradient-orange text-white py-3 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider glow-orange-sm hover:scale-105 transition-transform cursor-pointer"
          >
            {language === 'FR' ? 'Accéder aux Tutoriels' : 'View Tutorials'}
          </button>
        </div>

        {/* Card 3: Contact */}
        <div className="glass-card-purple rounded-3xl p-8 border border-white/10 space-y-6 flex flex-col justify-between shadow-2xl hover:scale-[1.02] transition-transform">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-orange-400 tracking-tight">Contact</h2>
            <ul className="space-y-2.5 text-sm text-gray-200">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>{language === 'FR' ? 'Support technique' : 'Tech Support'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>{language === 'FR' ? 'Service client' : 'Customer Success'}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>{language === 'FR' ? 'Partenariats' : 'Partnerships'}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate('contact')}
            className="btn-gradient-orange text-white py-3 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider glow-orange-sm hover:scale-105 transition-transform cursor-pointer"
          >
            {language === 'FR' ? 'Nous Contacter' : 'Contact Support'}
          </button>
        </div>

      </div>

      {/* Accordion FAQ Section */}
      <div id="faq-section" className="glass-card-purple outer-frame rounded-3xl p-8 border border-white/10 space-y-6">
        <h2 className="text-3xl font-extrabold text-white tracking-tight text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-white hover:text-orange-400 transition-colors cursor-pointer text-base"
                >
                  <span>{faq.question[language] || faq.question.EN}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-sm text-gray-300 border-t border-white/5 leading-relaxed bg-white/5">
                    {faq.answer[language] || faq.answer.EN}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Expert Assistance Banner matching Image 3 */}
      <div className="text-center space-y-6 pt-6">
        <h3 className="text-2xl font-extrabold text-orange-400 tracking-tight">
          {helpBannerText[language]}
        </h3>

        <button
          onClick={() => setChatOpen(true)}
          className="bg-white text-gray-950 font-black px-10 py-4 rounded-full text-base shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer glow-orange"
        >
          {chatBtnText[language]}
        </button>
      </div>

      {/* AI Expert Chat Modal */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md glass-card-purple rounded-3xl p-6 border border-orange-500/50 shadow-2xl space-y-4 glow-border animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-orange-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Expert IA CAFM Pro</h4>
                <span className="text-[10px] text-emerald-400 font-mono">En ligne • Support 24/7</span>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-64 overflow-y-auto space-y-3 p-2 font-mono text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl max-w-[85%] ${
                  m.sender === 'user'
                    ? 'bg-orange-500/30 text-white border border-orange-500/40 ml-auto text-right'
                    : 'glass-card text-gray-200 border border-white/10 mr-auto'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 glass-card rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 border border-white/10"
            />
            <button
              type="submit"
              className="btn-gradient-orange p-2.5 rounded-xl text-white glow-orange-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
