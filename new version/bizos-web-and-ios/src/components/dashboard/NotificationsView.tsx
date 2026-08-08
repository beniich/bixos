import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, Info, Trash2, Mail, Send, RefreshCw, ShieldCheck } from 'lucide-react';

interface NotificationsViewProps {
  isDarkMode: boolean;
}

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  snippet: string;
  sentAt: string;
  status: string;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ isDarkMode }) => {
  const [notifs, setNotifs] = useState([
    { id: '1', level: 'CRITICAL', title: 'Température Seuil Élevé', msg: 'Ascenseur Panoramique Ouest dépasse 28°C.', time: 'Il y a 12 minutes' },
    { id: '2', level: 'WARNING', title: 'Pression Filtre Basse', msg: 'Centrale Traitement d\'Air Est nécessite un changement de filtre.', time: 'Il y a 45 minutes' },
    { id: '3', level: 'INFO', title: 'Ordre de Travail Clôturé', msg: 'WO-8823 Audit Harmoniques TGBT complété par Sophie L.', time: 'Il y a 2 heures' },
  ]);

  // Gmail API state
  const [gmailConnected, setGmailConnected] = useState(true);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [recipient, setRecipient] = useState('tech-support@cafmpro.com');
  const [emailSubject, setEmailSubject] = useState('[ALERTE CAFM] Intervention urgente requise');
  const [emailBody, setEmailBody] = useState('Une anomalie critique a été détectée sur la centrale de traitement d\'air Est. Merci d\'intervenir immédiatement.');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState('');

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const fetchEmailLogs = () => {
    fetch('/api/gmail/messages')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setEmailLogs(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetch('/api/gmail/status')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.connected) setGmailConnected(true);
      })
      .catch(() => {});

    fetchEmailLogs();
  }, []);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !emailSubject) return;

    setIsSending(true);
    setSendSuccessMsg('');

    try {
      const res = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject: emailSubject,
          body: emailBody
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendSuccessMsg('Email envoyé avec succès via l\'API Gmail !');
        fetchEmailLogs();
        setTimeout(() => setSendSuccessMsg(''), 4000);
      } else {
        setSendSuccessMsg('Erreur lors de l\'envoi de l\'email.');
      }
    } catch {
      setSendSuccessMsg('Serveur indisponible.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-400" />
            <span>CENTRE DE NOTIFICATIONS & INTÉGRATION GMAIL API</span>
          </h2>
          <p className={`text-xs ${subText}`}>Journal des alertes système IoT & Dispatch d'emails via Google Workspace Gmail API</p>
        </div>
        <button
          onClick={() => setNotifs([])}
          className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold hover:bg-rose-500 hover:text-white transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>EFFACER NOTIFICATIONS</span>
        </button>
      </div>

      {/* Gmail Connection Status Card */}
      <div className={`${cardBg} p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>GMAIL API GOOGLE WORKSPACE CONNECTÉE</span>
            </div>
            <p className={`text-xs ${subText} mt-0.5`}>
              Compte actif: <span className="font-mono text-orange-400">albertomodo.cc@gmail.com</span> | Scopes: gmail.readonly, gmail.send
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            OAuth 2.0 Actif
          </span>
        </div>
      </div>

      {/* Grid: Send Email Alert Form & System Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Form: Dispatch Alert Email via Gmail */}
        <div className={`${cardBg} p-6 rounded-2xl border space-y-4`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-black uppercase flex items-center gap-2 text-orange-400">
              <Mail className="w-4 h-4" />
              <span>ENVOYER UNE ALERTE EMAIL (GMAIL API)</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              DIRECT DISPATCH
            </span>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-3 text-xs">
            <div>
              <label className={`block font-bold mb-1 ${subText}`}>Destinataire (Equipe / Fournisseur)</label>
              <input
                type="email"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="ex: maintenance@fournisseur.com"
                className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} font-mono focus:outline-none focus:border-orange-500`}
              />
            </div>

            <div>
              <label className={`block font-bold mb-1 ${subText}`}>Objet du Message</label>
              <input
                type="text"
                required
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Objet de l'alerte..."
                className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} font-mono focus:outline-none focus:border-orange-500`}
              />
            </div>

            <div>
              <label className={`block font-bold mb-1 ${subText}`}>Corps de l'Alerte Technique</label>
              <textarea
                rows={3}
                required
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} font-mono focus:outline-none focus:border-orange-500`}
              />
            </div>

            {sendSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold text-center">
                {sendSuccessMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 rounded-xl btn-gradient-orange text-white font-extrabold flex items-center justify-center gap-2 shadow-md cursor-pointer hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>ENVOYER VIA GMAIL API</span>
            </button>
          </form>
        </div>

        {/* System IoT Live Alert Notifications */}
        <div className={`${cardBg} p-6 rounded-2xl border space-y-4`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-black uppercase flex items-center gap-2 text-orange-400">
              <Bell className="w-4 h-4" />
              <span>ALERTES SYSTÈME IOT EN TEMPS RÉEL</span>
            </h3>
            <span className="text-[10px] font-mono text-orange-400">{notifs.length} Actives</span>
          </div>

          <div className="space-y-3">
            {notifs.length === 0 ? (
              <div className={`p-8 text-center text-xs font-bold ${subText}`}>
                Aucune notification en attente.
              </div>
            ) : (
              notifs.map((n) => (
                <div key={n.id} className="p-3.5 rounded-xl border border-white/10 bg-black/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      n.level === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      n.level === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {n.level}
                    </span>
                    <span className={`text-[10px] ${subText}`}>{n.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100">{n.title}</h4>
                  <p className={`text-[11px] ${subText}`}>{n.msg}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Gmail API Dispatch History Table */}
      <div className={`${cardBg} p-6 rounded-2xl border space-y-4`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-sm font-black uppercase flex items-center gap-2 text-emerald-400">
            <Mail className="w-4 h-4" />
            <span>HISTORIQUE DES EMAILS EXPÉDIÉS VIA GMAIL API</span>
          </h3>
          <button
            onClick={fetchEmailLogs}
            className="text-xs font-bold text-orange-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> ACTU
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <th className="py-2 px-3">ID MSG</th>
                <th className="py-2 px-3">DESTINATAIRE</th>
                <th className="py-2 px-3">OBJET DU MESSAGE</th>
                <th className="py-2 px-3">DATE D'ENVOI</th>
                <th className="py-2 px-3">STATUT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {emailLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    Aucun email dans l'historique d'envoi.
                  </td>
                </tr>
              ) : (
                emailLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="py-2.5 px-3 font-bold text-orange-400">{log.id}</td>
                    <td className="py-2.5 px-3">{log.to}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">{log.subject}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(log.sentAt).toLocaleTimeString('fr-FR')} - {new Date(log.sentAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

