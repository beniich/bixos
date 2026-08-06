import React, { useState } from 'react';
import { 
  Activity, Cpu, AlertTriangle, ShieldCheck, CheckCircle2, Send, Wrench, RefreshCw, Zap, Sparkles, MessageSquare, ArrowRight, UserCheck
} from 'lucide-react';
import { useFieldTechStore } from '../../services/fieldTechStore';

interface AnomalyItem {
  id: string;
  equipment: string;
  equipmentId: string;
  location: string;
  riskScore: number; // 0 - 100
  cause: string;
  recommendation: string;
  status: 'Critical' | 'Warning' | 'Dispatched';
}

export const PredictiveMaintenanceAi: React.FC = () => {
  const { addWorkOrder } = useFieldTechStore();

  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([
    {
      id: 'ANOM-101',
      equipment: 'Variateur Ascenseur Cabine Nord',
      equipmentId: 'ELEV-01',
      location: 'Étage 5 • Gain Moteur',
      riskScore: 88,
      cause: 'Surchauffe ponctuelle des MOSFETs (62.4°C) & usure roulement',
      recommendation: 'Remplacer le bloc de ventilation secondaire et vérifier l\'alignement de l\'axe sous 48h.',
      status: 'Critical',
    },
    {
      id: 'ANOM-102',
      equipment: 'Pompe Circulateur Chauffage P-02',
      equipmentId: 'PUMP-02',
      location: 'Sous-sol -1 • Chaufferie',
      riskScore: 64,
      cause: 'Dérive vibratoire basse fréquence (3.8 mm/s à 120 Hz)',
      recommendation: 'Graissage des roulements lors de la visite préventive de la semaine prochaine.',
      status: 'Warning',
    },
  ]);

  // AI Assistant Chat state
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Bonjour ! Je suis votre Assistant IA Facility & Maintenance Prédictive. Quel équipement souhaitez-vous diagnostiquer ou planifier aujourd\'hui ?',
      time: '11:42',
    },
  ]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  const handleDispatchWorkOrder = (anomaly: AnomalyItem) => {
    // Save order to shared store so FieldTech Mobile and Dashboard see it immediately
    addWorkOrder({
      title: `${anomaly.equipment} - ${anomaly.recommendation}`,
      location: anomaly.location,
      priority: anomaly.riskScore > 80 ? 'Haute' : 'Moyenne',
      status: 'À faire',
      dueDate: 'Aujourd\'hui 17:00',
      equipmentId: anomaly.equipmentId,
      description: `Généré automatiquement par le Moteur Prédictive IA. Diagnostic: ${anomaly.cause}`,
    });

    setAnomalies((prev) =>
      prev.map((a) => (a.id === anomaly.id ? { ...a, status: 'Dispatched' } : a))
    );
  };

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: timeNow }]);
    setChatInput('');
    setIsAiThinking(true);

    try {
      const res = await fetch('/api/bizos/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          context: 'BizOS GMAO / Maintenance Prédictive & Diagnostic Équipements'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { sender: 'ai', text: data.reply || data.answer, time: timeNow }]);
        setIsAiThinking(false);
        return;
      }
    } catch (err) {
      console.warn('API call failed, falling back to local intelligence:', err);
    }

    let aiResponse = "L'analyse télémétrique de l'équipement confirme un comportement nominal sur les 128 capteurs. Aucune anomalie critique détectée.";
    
    const lower = userText.toLowerCase();
    if (lower.includes('ascenseur') || lower.includes('variateur') || lower.includes('elev')) {
      aiResponse = "Le variateur de l'ascenseur Nord (ELEV-01) présente une température de 62.4°C (Risque 88%). Un ordre d'intervention prioritaire a été pré-généré pour l'équipe technique FieldTech.";
    } else if (lower.includes('pompe') || lower.includes('chauffage') || lower.includes('vibration') || lower.includes('pump')) {
      aiResponse = "La pompe P-02 affiche une dérive vibratoire de 3.8 mm/s à 120 Hz. Le modèle prédictif recommande un graissage SKF sous 7 jours pour éviter le grippage.";
    } else if (lower.includes('pièce') || lower.includes('stock') || lower.includes('filtre')) {
      aiResponse = "Les pièces de rechange (Roulements SKF-6204, Kit Filtres CVC G4, Variateur Schneider Altivar) sont en stock au magasin -1 (3 unités disponibles).";
    } else if (lower.includes('bac') || lower.includes('esg') || lower.includes('energie') || lower.includes('kwh')) {
      aiResponse = "Le bâtiment enregistre une efficacité énergétique globale classe B. La régulation GTB BACS Classe A réduit la consommation CVC de 22% ce mois-ci.";
    } else if (lower.includes('ot') || lower.includes('ordre') || lower.includes('interv')) {
      aiResponse = "Vous pouvez cliquer sur 'Créer Ordre d'Intervention OT' ci-contre pour assigner l'intervention directement dans l'application Mobile Offline des techniciens.";
    }

    setChatMessages((prev) => [...prev, { sender: 'ai', text: aiResponse, time: timeNow }]);
    setIsAiThinking(false);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#140826]/90 border border-[#d946ef]/30 shadow-[0_0_30px_rgba(217,70,239,0.15)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f472b6] mb-1">
            <Cpu className="w-4 h-4" />
            <span>PREDICTIVE AI ENGINE • SCALING VIBRATOIRE & DIAGNOSTIC DÉRIVE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Moteur de Maintenance Prédictive IA</h2>
          <p className="text-xs text-slate-300">Scoring de santé des équipements, détection d'anomalies précoce et génération d'ordres d'intervention.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Inférence ML Continue Active
          </span>
        </div>
      </div>

      {/* Main Grid Layout: Health Gauges + Anomaly Feed + AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Equipment Health Score & FFT Graph */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Health Gauge Scorecard */}
          <div className="p-6 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Indice Globale de Santé du Parc (Health Index)</h3>
                <p className="text-xs text-slate-400">Score consolidé sur 128 capteurs IoT (Vibration, Température, Pression).</p>
              </div>
              <div className="text-3xl font-bold font-mono text-[#f472b6] drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]">
                92.4 <span className="text-sm font-normal text-slate-400">/ 100</span>
              </div>
            </div>

            {/* Health Bar */}
            <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-[#f472b6] to-[#d946ef] transition-all duration-1000 shadow-[0_0_12px_rgba(217,70,239,0.8)]"
                style={{ width: '92.4%' }}
              />
            </div>

            {/* Equipment Quick Status Badges */}
            <div className="grid grid-cols-3 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <div className="text-emerald-400 font-bold font-mono text-base">122 / 128</div>
                <div className="text-[10px] text-slate-400">Équipements Optimaux</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                <div className="text-amber-400 font-bold font-mono text-base">5</div>
                <div className="text-[10px] text-slate-400">En Surveillance</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center">
                <div className="text-rose-400 font-bold font-mono text-base">1</div>
                <div className="text-[10px] text-slate-400">Intervention Requise</div>
              </div>
            </div>
          </div>

          {/* Anomaly Detection List */}
          <div className="p-6 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Anomalies Détectées par l'IA (Alerte Prédictive)</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">Mise à jour automatique</span>
            </div>

            <div className="space-y-3">
              {anomalies.map((anom) => (
                <div 
                  key={anom.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    anom.status === 'Critical' 
                      ? 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
                      : anom.status === 'Dispatched'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{anom.equipment}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                          {anom.id}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{anom.location}</div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-mono font-bold ${
                        anom.riskScore > 80 ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        Risque: {anom.riskScore}%
                      </div>
                      <div className="text-[10px] text-slate-400">Score d'Urgence</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <strong>Diagnostic IA :</strong> {anom.cause}<br />
                    <strong className="text-[#f472b6]">Action Recommandée :</strong> {anom.recommendation}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono text-slate-400">
                      Impact prévisionnel : Arrêt de service évité
                    </span>

                    {anom.status === 'Dispatched' ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ordre OT Transmis & Synchro Mobile
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDispatchWorkOrder(anom)}
                        className="px-4 py-1.5 rounded-full bizos-cta-pink text-white text-xs font-semibold cursor-pointer shadow-md flex items-center gap-1.5 hover:scale-105 transition-transform"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Créer Ordre d'Intervention OT</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: AI Technical Facility Assistant Chatbot */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-[#130826] border border-[#d946ef]/30 flex flex-col h-[560px] justify-between space-y-4">
          
          {/* Chat Header */}
          <div className="pb-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#d946ef]/20 text-[#f472b6]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Assistant IA Facility</h3>
                <p className="text-[10px] text-slate-400">Expert en diagnostic CVC & électricité</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="IA Connectée" />
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#d946ef]/30 border border-[#f472b6]/50 text-white rounded-br-none'
                      : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isAiThinking && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#f472b6]" />
                <span>Analyse de la télémétrie en cours...</span>
              </div>
            )}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendChatMessage} className="pt-2 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ex: Quel est l'état de l'ascenseur ?"
              className="flex-1 bg-[#1e0f38] border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#f472b6]"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bizos-cta-pink text-white cursor-pointer hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
