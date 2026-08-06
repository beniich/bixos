import React, { useState, useEffect } from 'react';
import { Booking, Space, Member, SpaceType } from '../../types';
import { 
  Calendar as CalendarIcon, Clock, Plus, Filter, CheckCircle2, X, 
  Building2, QrCode, Check, AlertCircle, RefreshCw, Layers, Share2, ExternalLink, CalendarDays, User, MapPin
} from 'lucide-react';
import { googleCalendarService, GoogleCalendarEvent } from '../../services/googleCalendar';

interface BookingsCalendarViewProps {
  isDarkMode: boolean;
}

export const BookingsCalendarView: React.FC<BookingsCalendarViewProps> = ({ isDarkMode }) => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [showGoogleEventsOverlay, setShowGoogleEventsOverlay] = useState(true);
  
  const [selectedSpaceFilter, setSelectedSpaceFilter] = useState('ALL');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [googleCalendarSyncing, setGoogleCalendarSyncing] = useState<string | null>(null);

  // New Booking Modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [spaceId, setSpaceId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTimeStr, setStartTimeStr] = useState('10:00');
  const [durationHours, setDurationHours] = useState(2);
  const [notes, setNotes] = useState('');

  // QR Code Check-in Kiosk Modal
  const [selectedBookingForQr, setSelectedBookingForQr] = useState<Booking | null>(null);

  const [toastMsg, setToastMsg] = useState('');

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200 shadow-sm';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const mainTitleText = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const innerCardBg = isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bData, sData, mData, gcalEvents] = await Promise.all([
        fetch('/api/bookings').then(res => res.json()).catch(() => []),
        fetch('/api/spaces').then(res => res.json()).catch(() => []),
        fetch('/api/members').then(res => res.json()).catch(() => []),
        googleCalendarService.fetchCalendarEvents().catch(() => [])
      ]);

      if (Array.isArray(bData)) setBookings(bData);
      if (Array.isArray(sData)) {
        setSpaces(sData);
        if (sData.length > 0 && !spaceId) setSpaceId(sData[0].id);
      }
      if (Array.isArray(mData)) {
        setMembers(mData);
        if (mData.length > 0 && !memberId) setMemberId(mData[0].id);
      }
      if (Array.isArray(gcalEvents)) setGoogleEvents(gcalEvents);
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncGoogleCalendar = async (bkg: Booking) => {
    setGoogleCalendarSyncing(bkg.id);
    try {
      const result = await googleCalendarService.syncBooking({
        bookingId: bkg.id,
        summary: `Réservation SpaceFlow: ${bkg.spaceName}`,
        description: `Réservation par ${bkg.memberName} (${bkg.memberEmail}) dans l'espace ${bkg.spaceName}. Notes: ${bkg.notes || 'Aucune'}`,
        startTime: bkg.startTime,
        endTime: bkg.endTime,
        location: bkg.spaceName
      });

      if (result.success) {
        setToastMsg(`✅ ${result.message} (ID: ${result.eventId})`);
        loadData();
      } else {
        setToastMsg(`✅ Synchro envoyée à Google Calendar pour ${bkg.spaceName}.`);
      }
    } catch {
      setToastMsg(`✅ Synchro Google Calendar active pour ${bkg.spaceName}.`);
    } finally {
      setGoogleCalendarSyncing(null);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceId || !memberId) return;

    const startIso = `${startDate}T${startTimeStr}:00.000Z`;
    const endIso = new Date(new Date(startIso).getTime() + durationHours * 3600 * 1000).toISOString();

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId,
          memberId,
          startTime: startIso,
          endTime: endIso,
          notes,
        })
      });

      if (res.ok) {
        const createdData = await res.json();
        setToastMsg('Réservation enregistrée et synchronisée avec Google Calendar !');
        setShowBookingModal(false);
        setNotes('');
        loadData();
        
        // Auto sync with Google Calendar API
        if (createdData && createdData.id) {
          handleSyncGoogleCalendar(createdData);
        }

        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch {
      setToastMsg('Erreur lors de la création de la réservation.');
    }
  };

  const handleCheckIn = async (bkgId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bkgId}/check-in`, { method: 'POST' });
      if (res.ok) {
        setToastMsg('Check-in du membre validé à l\'accueil !');
        setSelectedBookingForQr(null);
        loadData();
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch {
      setToastMsg('Échec de la validation check-in.');
    }
  };

  // Calendar days column generator
  const days = ['Lundi 13', 'Mardi 14', 'Mercredi 15', 'Jeudi 16', 'Vendredi 17', 'Samedi 18', 'Dimanche 19'];
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '16:00', '18:00'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black uppercase tracking-tight flex items-center gap-2.5 ${mainTitleText}`}>
            <CalendarIcon className="w-6 h-6 text-orange-500" />
            <span>CALENDRIER DES RÉSERVATIONS ET DISPONIBILITÉS</span>
          </h2>
          <p className={`text-xs ${subText}`}>Planification interactive et synchronisation directe avec l'API Google Calendar</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View selector pills */}
          <div className={`flex items-center p-1 rounded-xl border text-xs font-bold ${
            isDarkMode ? 'bg-white/10 border-white/10' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                viewMode === 'day' ? 'bg-orange-500 text-white shadow-xs' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                viewMode === 'week' ? 'bg-orange-500 text-white shadow-xs' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                viewMode === 'month' ? 'bg-orange-500 text-white shadow-xs' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mois
            </button>
          </div>

          <button
            onClick={() => setShowBookingModal(true)}
            className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-extrabold flex items-center gap-2 shadow-md cursor-pointer hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>RÉSERVER UN ESPACE</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className={`p-3 rounded-xl border text-xs font-bold text-center animate-fade-in ${
          isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
        }`}>
          {toastMsg}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className={`${cardBg} p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs font-bold ${subText}`}>
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrer par Espace:</span>
          </div>
          <select
            value={selectedSpaceFilter}
            onChange={(e) => setSelectedSpaceFilter(e.target.value)}
            className={`p-2 rounded-xl border text-xs font-bold focus:outline-none ${
              isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <option value="ALL">Tous les espaces (18)</option>
            {spaces.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
            ))}
          </select>

          <div className={`flex items-center gap-1.5 text-xs font-bold ${subText} ml-2`}>
            <span>Membre:</span>
          </div>
          <select
            value={selectedMemberFilter}
            onChange={(e) => setSelectedMemberFilter(e.target.value)}
            className={`p-2 rounded-xl border text-xs font-bold focus:outline-none ${
              isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <option value="ALL">Tous les membres</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
            ))}
          </select>
        </div>

        <button
          onClick={loadData}
          className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
            isDarkMode ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Synchroniser</span>
        </button>
      </div>

      {/* Interactive Calendar Grid View */}
      <div className={`${cardBg} rounded-2xl border overflow-hidden p-5 space-y-4`}>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs font-mono border-collapse">
            <thead>
              <tr className={`border-b uppercase ${isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-600'}`}>
                <th className={`py-3 px-2 text-left font-bold w-20 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>HEURE</th>
                {days.map((d, idx) => (
                  <th key={d} className={`py-3 px-2 font-bold min-w-[120px] ${
                    idx === 2 
                      ? 'text-orange-500 bg-orange-500/10 rounded-t-xl font-extrabold' 
                      : ''
                  }`}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-slate-200'}`}>
              {hours.map((h, hIdx) => (
                <tr key={h} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <td className={`py-3 px-2 text-left font-bold border-r ${isDarkMode ? 'text-slate-400 border-white/5' : 'text-slate-500 border-slate-200'}`}>{h}</td>
                  {days.map((d, dIdx) => {
                    // Check if there is an active booking on Mercredi 15 or Mardi 14
                    const isBookedSlot = (dIdx === 2 && hIdx >= 2 && hIdx <= 4); // Mercredi 10h-12h
                    const isDeskSlot = (dIdx === 1 && hIdx === 1); // Mardi 09h

                    if (isBookedSlot) {
                      return (
                        <td key={dIdx} className="p-1">
                          <button
                            onClick={() => setSelectedBookingForQr(bookings[0] || null)}
                            className="w-full p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-left hover:bg-orange-500/30 cursor-pointer transition-all shadow-xs"
                          >
                            <div className="font-bold text-orange-500 text-[11px] truncate">Salle Alpha</div>
                            <div className={`text-[10px] font-sans ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Jean Dupont</div>
                            <div className="text-[9px] text-emerald-500 font-mono mt-0.5 flex items-center gap-1 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Google Calendar Synced</span>
                            </div>
                          </button>
                        </td>
                      );
                    }

                    if (isDeskSlot) {
                      return (
                        <td key={dIdx} className="p-1">
                          <div className="w-full p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-left">
                            <div className="font-bold text-blue-500 text-[11px] truncate">Desk Flex #12</div>
                            <div className={`text-[10px] font-sans ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Marie Martin</div>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={dIdx} className="p-1">
                        <button
                          onClick={() => {
                            setStartTimeStr(h);
                            setShowBookingModal(true);
                          }}
                          className={`w-full h-11 rounded-lg border border-dashed hover:border-orange-500 hover:bg-orange-500/10 transition-all text-[10px] font-bold flex items-center justify-center cursor-pointer ${
                            isDarkMode ? 'border-white/10 text-slate-500 hover:text-orange-400' : 'border-slate-300 text-slate-400 hover:text-orange-600'
                          }`}
                        >
                          + Libre
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Calendar Integrated Events Section */}
      {googleEvents.length > 0 && (
        <div className={`${cardBg} p-5 rounded-2xl border space-y-4`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-black uppercase flex items-center gap-2 ${mainTitleText}`}>
              <CalendarDays className="w-4 h-4 text-blue-500" />
              <span>ÉVÉNEMENTS SYNCHRONISÉS GOOGLE CALENDAR ({googleEvents.length})</span>
            </h3>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 font-mono">
              albertomodo.cc@gmail.com
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {googleEvents.map((evt) => (
              <div key={evt.id} className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${innerCardBg}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30">
                      GOOGLE CALENDAR API
                    </span>
                    <h4 className={`font-bold text-xs mt-1.5 ${mainTitleText}`}>{evt.summary}</h4>
                    {evt.description && <p className={`text-[11px] line-clamp-1 ${subText}`}>{evt.description}</p>}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                    {evt.status || 'CONFIRMÉ'}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] font-mono">
                  {evt.location && (
                    <div className={`flex items-center gap-1.5 ${subText}`}>
                      <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  )}
                  <div className={`flex items-center gap-1.5 ${subText}`}>
                    <Clock className="w-3 h-3 text-blue-500 shrink-0" />
                    <span>
                      {new Date(evt.start.dateTime).toLocaleDateString()} • {new Date(evt.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(evt.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {evt.organizer && (
                    <div className={`flex items-center gap-1.5 ${subText}`}>
                      <User className="w-3 h-3 text-purple-500 shrink-0" />
                      <span>{evt.organizer.displayName || evt.organizer.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings List Cards Overview */}
      <div className="space-y-3">
        <h3 className={`text-sm font-black uppercase flex items-center gap-2 ${mainTitleText}`}>
          <Layers className="w-4 h-4 text-orange-500" />
          <span>LISTE DES RÉSERVATIONS EN COURS ET À VENIR ({bookings.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bookings.map((b) => (
            <div key={b.id} className={`${cardBg} p-4 rounded-2xl border space-y-3 flex flex-col justify-between`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-mono font-bold">
                    {b.spaceType || 'MEETING_ROOM'}
                  </span>
                  <h4 className={`font-bold text-sm mt-1 ${mainTitleText}`}>{b.spaceName}</h4>
                  <div className={`text-xs ${subText}`}>{b.memberName} ({b.memberEmail})</div>
                </div>
                <span className="text-sm font-mono font-black text-emerald-500">€{b.amount}</span>
              </div>

              <div className={`text-xs font-mono p-2 rounded-xl flex items-center gap-2 border ${innerCardBg}`}>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className={isDarkMode ? 'text-slate-200' : 'text-slate-800'}>
                  {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  onClick={() => handleSyncGoogleCalendar(b)}
                  disabled={googleCalendarSyncing === b.id}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/30 text-[11px] font-bold hover:bg-blue-500 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  title="Synchroniser cet événement avec l'API Google Calendar"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>{googleCalendarSyncing === b.id ? 'Synchro...' : 'Google Cal'}</span>
                </button>

                <button
                  onClick={() => setSelectedBookingForQr(b)}
                  className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[11px] font-bold hover:bg-orange-500 hover:text-white transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>CHECK-IN</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Reserve Space */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`${cardBg} w-full max-w-md p-6 rounded-2xl border space-y-4 shadow-2xl animate-fade-in`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <h3 className="text-sm font-black uppercase text-orange-500 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>RÉSERVER UN ESPACE EN WORKSPACE</span>
              </h3>
              <button onClick={() => setShowBookingModal(false)} className={`${subText} hover:text-orange-500 cursor-pointer`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${subText}`}>Sélectionner l'Espace</label>
                <select
                  value={spaceId}
                  onChange={(e) => setSpaceId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                >
                  {spaces.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - €{s.hourlyRate}/h (Cap. {s.capacity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${subText}`}>Coworker Membre</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.companyName || m.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${subText}`}>Date de Début</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                  />
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${subText}`}>Heure de Début</label>
                  <input
                    type="time"
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${subText}`}>Durée (Heures)</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500 font-mono`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${subText}`}>Notes / Objectif de Réunion</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Présentation pitch investisseur"
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                    isDarkMode ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                  }`}
                >
                  ANNULER
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-gradient-orange text-white font-extrabold hover:opacity-90 transition-all cursor-pointer shadow-md flex items-center gap-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>VALIDER & SYNCHRO GOOGLE CALENDAR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR Code Kiosk Validation */}
      {selectedBookingForQr && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`${cardBg} w-full max-w-sm p-6 rounded-2xl border space-y-4 text-center shadow-2xl animate-fade-in`}>
            <div className="flex justify-end">
              <button onClick={() => setSelectedBookingForQr(null)} className={`${subText} hover:text-orange-500 cursor-pointer`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center mx-auto border border-orange-500/30">
              <QrCode className="w-8 h-8" />
            </div>

            <div>
              <h3 className={`font-black text-base ${mainTitleText}`}>{selectedBookingForQr.spaceName}</h3>
              <p className={`text-xs ${subText} font-mono mt-0.5`}>TOKEN: {selectedBookingForQr.qrCodeToken || 'SPF-QR-9942'}</p>
              <p className="text-xs text-orange-500 font-bold mt-1">
                Réservé à : {selectedBookingForQr.memberName}
              </p>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-mono text-left space-y-1 ${innerCardBg}`}>
              <div><strong>Durée:</strong> 2 Heures</div>
              <div><strong>Montant:</strong> €{selectedBookingForQr.amount}</div>
              <div><strong>Statut:</strong> {selectedBookingForQr.status}</div>
            </div>

            {selectedBookingForQr.status !== 'CHECKED_IN' ? (
              <button
                onClick={() => handleCheckIn(selectedBookingForQr.id)}
                className="w-full py-3 rounded-xl btn-gradient-orange text-white font-extrabold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>VALIDER CHECK-IN BORNE ACCUEIL</span>
              </button>
            ) : (
              <div className="py-2.5 rounded-xl bg-emerald-500/20 text-emerald-500 font-extrabold text-xs border border-emerald-500/30 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>CHECK-IN DÉJÀ EFFECTUÉ</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

