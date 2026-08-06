import React, { useState, useEffect } from 'react';
import { Booking, Invoice } from '../../types';
import { 
  Smartphone, Calendar, CreditCard, Clock, UserPlus, QrCode, 
  Building2, CheckCircle2, ChevronRight, Zap, ArrowLeft, RefreshCw
} from 'lucide-react';

interface CoworkerMobilePwaViewProps {
  isDarkMode: boolean;
}

export const CoworkerMobilePwaView: React.FC<CoworkerMobilePwaViewProps> = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'book' | 'invoices' | 'usage' | 'visitor'>('book');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [toast, setToast] = useState('');

  // Quick book form
  const [selectedSpaceName, setSelectedSpaceName] = useState('Desk Flex #12 - Étage 1');
  const [bookSuccess, setBookSuccess] = useState(false);

  // Visitor invitation form
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [generatedPassQr, setGeneratedPassQr] = useState<string | null>(null);

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10'
    : 'bg-white text-slate-900 border-slate-200/80';

  useEffect(() => {
    fetch('/api/mobile/my-bookings')
      .then(res => res.ok ? res.json() : [])
      .then(data => setBookings(data))
      .catch(() => {});

    fetch('/api/mobile/my-invoices')
      .then(res => res.ok ? res.json() : [])
      .then(data => setInvoices(data))
      .catch(() => {});
  }, []);

  const handleQuickBook = async () => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: 'spc-01',
          memberId: 'mem-101',
          notes: 'Réservation mobile PWA',
        })
      });

      if (res.ok) {
        setBookSuccess(true);
        setTimeout(() => setBookSuccess(false), 4000);
      }
    } catch {
      setToast('Erreur réservation');
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
          purpose: 'Visite professionnelle coworker'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedPassQr(data.qrCodeToken || 'VIS-QR-9942');
        setVisitorName('');
        setVisitorEmail('');
      }
    } catch {
      setToast('Échec invitation visiteur.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-100 flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-orange-400" />
            <span>PORTAIL AUTONOME COWORKER (MOBILE PWA)</span>
          </h2>
          <p className="text-xs text-slate-400">Application mobile PWA pour la réservation 2-clics, le suivi des factures et l'invitation d'hôtes</p>
        </div>
      </div>

      {/* Smartphone Mockup Centered Frame */}
      <div className="flex justify-center py-4">
        <div className="w-full max-w-sm rounded-[40px] bg-slate-900 border-4 border-slate-700/80 shadow-2xl overflow-hidden text-slate-100 flex flex-col h-[650px] relative">
          
          {/* Phone Top Notch Bar */}
          <div className="bg-slate-950 px-6 py-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800">
            <span>09:41</span>
            <div className="w-16 h-3.5 bg-slate-800 rounded-full mx-auto" />
            <span>100% ⚡</span>
          </div>

          {/* Member App Header */}
          <div className="p-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                alt="Jean"
                className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
              />
              <div>
                <div className="font-black text-xs leading-none">JEAN DUPONT</div>
                <div className="text-[10px] opacity-80 font-mono mt-0.5">Hot Desk | Spaceflow Paris</div>
              </div>
            </div>
            <span className="p-1.5 rounded-lg bg-white/20 text-[10px] font-bold">PWA OK</span>
          </div>

          {/* Tab Navigation Controls */}
          <div className="grid grid-cols-4 bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400">
            <button
              onClick={() => setActiveTab('book')}
              className={`py-2.5 flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'book' ? 'text-orange-400 border-b-2 border-orange-400 bg-white/5' : ''}`}
            >
              <Calendar className="w-4 h-4" />
              <span>Réserver</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-2.5 flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'invoices' ? 'text-orange-400 border-b-2 border-orange-400 bg-white/5' : ''}`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Factures</span>
            </button>

            <button
              onClick={() => setActiveTab('usage')}
              className={`py-2.5 flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'usage' ? 'text-orange-400 border-b-2 border-orange-400 bg-white/5' : ''}`}
            >
              <Clock className="w-4 h-4" />
              <span>Usage</span>
            </button>

            <button
              onClick={() => setActiveTab('visitor')}
              className={`py-2.5 flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'visitor' ? 'text-orange-400 border-b-2 border-orange-400 bg-white/5' : ''}`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Visiteur</span>
            </button>
          </div>

          {/* Main App Content View Area */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-sans">
            
            {/* TAB 1: QUICK BOOKING */}
            {activeTab === 'book' && (
              <div className="space-y-4">
                <div className="font-black text-slate-100 uppercase text-xs flex items-center justify-between">
                  <span>📅 RÉSERVATION BURAUS 2-CLICS</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Dispo Immédiate</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Building2 className="w-4 h-4" />
                    <span>Bureau Flex #12 - Étage 1</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Aujourd'hui de 14:00 à 18:00 | Wifi 1Gbps, Café illimité</p>
                  
                  <button
                    onClick={handleQuickBook}
                    className="w-full py-2.5 rounded-xl btn-gradient-orange text-white font-extrabold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer mt-1"
                  >
                    RÉSERVER POUR 14H00
                  </button>
                </div>

                {bookSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-center text-[11px] font-bold">
                    ✅ Réservation confirmée ! Votre Pass QR a été généré.
                  </div>
                )}

                <div className="space-y-2">
                  <div className="font-bold text-slate-300 text-[11px]">MES RÉSERVATIONS ACTIVES</div>
                  {bookings.map(b => (
                    <div key={b.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-100">{b.spaceName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Aujourd'hui 10:30 - 12:30</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">CONFIRMÉ</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: INVOICES */}
            {activeTab === 'invoices' && (
              <div className="space-y-4">
                <div className="font-black text-slate-100 uppercase text-xs">💳 MES FACTURES & ABONNEMENT</div>

                <div className="space-y-2.5">
                  {invoices.map(inv => (
                    <div key={inv.id} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-100">{inv.number}</div>
                        <div className="text-[10px] text-slate-400">{inv.items[0]?.description || 'Abonnement'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Échéance: {inv.dueDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-400">€{inv.amount}</div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          inv.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: USAGE */}
            {activeTab === 'usage' && (
              <div className="space-y-4">
                <div className="font-black text-slate-100 uppercase text-xs">📊 MON USAGE DES ESPACES</div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-bold">Heures consommées ce mois</span>
                    <span className="font-mono font-black text-orange-400 text-sm">12h / 40h</span>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: '30%' }} />
                  </div>

                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>Semaine passée : 8h</span>
                    <span>Forfait Hot Desk</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: VISITOR PASS */}
            {activeTab === 'visitor' && (
              <div className="space-y-4">
                <div className="font-black text-slate-100 uppercase text-xs">👥 INVITER UN VISITEUR / HÔTE</div>

                <form onSubmit={handleInviteVisitor} className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Nom de l'invité</label>
                    <input
                      type="text"
                      required
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      placeholder="Alexandre Renard"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Email de l'invité</label>
                    <input
                      type="email"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      placeholder="alexandre@invest.fr"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl btn-gradient-orange text-white font-extrabold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
                  >
                    GÉNÉRER PASS INVITÉ QR
                  </button>
                </form>

                {generatedPassQr && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-emerald-300 text-xs">Pass QR Visiteur Valide !</div>
                    <div className="font-mono text-[10px] text-slate-300">TOKEN: {generatedPassQr}</div>
                    <p className="text-[10px] text-slate-400">Email d'accès envoyé à l'invité.</p>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Bottom App Navigation */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
            SPACEFLOW PWA v2.6 • Paris Central
          </div>
        </div>
      </div>
    </div>
  );
};
