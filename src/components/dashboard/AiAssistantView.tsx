import React, { useState } from 'react';
import { Bot, Send, Sparkles, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AiAssistantViewProps {
  isDarkMode: boolean;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ isDarkMode }) => {
  const [messages, setMessages] = useState([
    { sender: 'AI', text: 'Bonjour ! Je suis l\'Assistant Copilot IA Rezidet CAFM. Comment puis-je vous aider dans la gestion de vos équipements aujourd\'hui ?' },
    { sender: 'USER', text: 'Analyse l\'anomalie de température sur l\'Ascenseur Panoramique Ouest.' },
    { sender: 'AI', text: 'Analyse Télémétrique effectuée : La sonde de température de la cabine indiquait 28.1°C (seuil recommandé : <25°C). La cause probable est un encrassement de la grille de ventilation du moteur OTIS-GEN2. Je recommande la création d\'un ordre de travail préventif.' }
  ]);
  const [input, setInput] = useState('');

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { sender: 'USER', text: userMsg }]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: `Réponse IA Copilot pour "${userMsg}" : Les métriques de consommation électrique indiquent une stabilité globale avec un gain de 18% d'efficacité sur la zone HVAC Nord.`
        }
      ]);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">ASSISTANT COPILOT IA (PREDICTIVE CAFM AGENT)</h2>
          <p className={`text-xs ${subText}`}>Diagnostic prédictif des pannes et optimisation automatique des consommations</p>
        </div>
      </div>

      <div className={`${cardBg} p-6 rounded-3xl border h-[480px] flex flex-col justify-between`}>
        <div className="space-y-4 overflow-y-auto pr-2 flex-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 text-xs ${
                m.sender === 'USER' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'AI' && (
                <div className="w-7 h-7 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl max-w-xl text-xs font-mono leading-relaxed ${
                  m.sender === 'USER'
                    ? 'btn-gradient-orange text-white'
                    : isDarkMode
                    ? 'bg-black/30 border border-white/10 text-slate-100'
                    : 'bg-slate-100 border border-slate-200 text-slate-900'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-3 pt-4 border-t border-slate-500/20">
          <input
            type="text"
            placeholder="Posez une question sur vos actifs, consommations ou maintenance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`flex-1 ${isDarkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-orange-500`}
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>ENVOYER</span>
          </button>
        </form>
      </div>
    </div>
  );
};
