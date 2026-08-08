import React, { useState, useEffect } from 'react';
import { VisitorPass } from '../../types';
import { 
  UserCheck, UserPlus, Clock, QrCode, CheckCircle2, Search, X, RefreshCw, Building2, MessageSquare 
} from 'lucide-react';

interface VisitorsViewProps {
  isDarkMode: boolean;
}

export const VisitorsView: React.FC<VisitorsViewProps> = ({ isDarkMode }) => {
  const [visitors, setVisitors] = useState<VisitorPass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [chatAlerting, setChatAlerting] = useState<string | null>(null);

  // Modal invite
  const [showModal, setShowModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [timeSlot, setTimeSlot] = useState('14:30 - 16:00');
  const [purpose, setPurpose] = useState('Rendez-vous investisseur');

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200 shadow-sm';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const mainTitleText = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const valueText = isDarkMode ? 'text-slate-100' : 'text-slate-800';

  const loadVisitors = () => {
    setIsLoading(true);
    fetch('/api/visitors/today')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setVisitors(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  const handleCheckInVisitor = async (id: string) => {
    try {
      const res = await fetch(`/api/visitors/${id}/check-in`, { method: 'POST' });
      if (res.ok) {
        setToast('Visiteur enregistré à l\'accueil ! L\'hôte a été notifié par SMS.');
        loadVisitors();
        setTimeout(() => setToast(''), 4000);
      }
    } catch {
      setToast('Erreur check-in.');
    }
  };

  const handleInviteVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName) return;

    try {
      const res = await fetch('/api/visitors/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName,
          visitorEmail,
          hostMemberId: 'mem-101',
          timeSlot,
          purpose,
        })
      });

      if (res.ok) {
        setToast(`Pass Visiteur généré pour ${visitorName} !`);
        setShowModal(false);
        setVisitorName('');
        setVisitorEmail('');
        loadVisitors();
        setTimeout(() => setToast(''), 4000);
      }
    } catch {
      setToast('Erreur d\'invitation.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black uppercase tracking-tight flex items-center gap-2.5 ${mainTitleText}`}>
            <UserCheck className="w-6 h-6 text-orange-500" />
            <span>ACCUEIL & REGISTRE DES VISITEURS DU JOUR ({visitors.length})</span>
          </h2>
          <p className={`text-xs ${subText}`}>Gestion du contrôle d'accès aux bornes, notifications Google Chat et impression des badges</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadVisitors}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-extrabold flex items-center gap-2 shadow-md cursor-pointer hover:opacity-90 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>ENREGISTRER UN VISITEUR</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold text-center">
          {toast}
        </div>
      )}

      {/* Visitors List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visitors.map((v) => (
          <div key={v.id} className={`${cardBg} p-5 rounded-2xl border space-y-4 flex flex-col justify-between`}>
            <div className="flex items-start justify-between">
              <div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  v.status === 'CHECKED_IN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {v.status === 'CHECKED_IN' ? 'ENREGISTRÉ À L\'ACCUEIL' : 'ATTENDU AUJOURD\'HUI'}
                </span>
                <h3 className="font-bold text-base text-slate-100 mt-2">{v.visitorName}</h3>
                <div className={`text-xs ${subText} font-mono`}>{v.visitorEmail}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Hôte d'accueil:</span>
                <span className="font-bold text-slate-200">{v.hostMemberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Créneau horaire:</span>
                <span className="font-bold text-amber-400">{v.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Objet de la visite:</span>
                <span className="font-bold text-slate-300 truncate max-w-[150px]">{v.purpose || 'Rendez-vous'}</span>
              </div>
            </div>

            {v.status !== 'CHECKED_IN' ? (
              <button
                onClick={() => handleCheckInVisitor(v.id)}
                className="w-full py-2.5 rounded-xl btn-gradient-orange text-white font-extrabold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>EFFECTUER LE CHECK-IN ACCUEIL</span>
              </button>
            ) : (
              <div className="py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-center text-xs font-bold border border-emerald-500/20">
                ✅ Badge Actif sur l'Espace
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Invite Visitor */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cardBg} w-full max-w-md p-6 rounded-2xl border space-y-4 shadow-2xl`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black uppercase text-orange-400 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>INVITER UN VISITEUR / HÔTE</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteVisitor} className="space-y-3 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${subText}`}>Nom Complet du Visiteur</label>
                <input
                  type="text"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Alexandre Renard"
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${subText}`}>Email du Visiteur</label>
                <input
                  type="email"
                  required
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  placeholder="a.renard@entreprise.fr"
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${subText}`}>Créneau Horaire</label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="14:30 - 16:00"
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${subText}`}>Objet du Rendez-vous</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Présentation projet"
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 font-bold hover:bg-white/20 transition-all cursor-pointer"
                >
                  ANNULER
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-gradient-orange text-white font-extrabold hover:opacity-90 transition-all cursor-pointer shadow-md"
                >
                  ENVOYER PASS QR INVITÉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
