import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  EcoAssetBooking, 
  TicketSeatItem, 
  TicketingLog,
  FirestoreSeat,
  loadLocalBookings, 
  saveLocalBookings,
  getBackendModePreference,
  saveBackendModePreference,
  subscribeToFirestoreBookings,
  saveBookingToFirestore,
  updateBookingStatusInFirestore,
  subscribeToFirestoreSeats,
  updateSeatInFirestore,
  subscribeToFirestoreLogs,
  saveLogToFirestore,
  EcoAssetEvent,
  subscribeToFirestoreEvents,
  saveEventToFirestore,
  deleteEventInFirestore
} from '../services/ticketingService';

interface TicketingContextType {
  isBackendConnected: boolean;
  toggleBackendMode: () => void;
  selectedVenue: string;
  setSelectedVenue: (venue: string) => void;
  cartSeats: TicketSeatItem[];
  toggleCartSeat: (seat: TicketSeatItem) => void;
  clearCart: () => void;
  bookings: EcoAssetBooking[];
  activeBooking: EcoAssetBooking | null;
  setActiveBooking: (booking: EcoAssetBooking | null) => void;
  logs: TicketingLog[];
  firestoreSeats: Record<string, FirestoreSeat>;
  updateSeatStatus: (seatId: string, status: 'available' | 'occupied' | 'selected', ticketId?: string) => Promise<void>;
  createBooking: (paymentData: { name: string; email: string; paymentMethod: string }) => Promise<EcoAssetBooking>;
  checkInTicket: (ticketCodeOrId: string) => Promise<{ success: boolean; message: string; booking?: EcoAssetBooking }>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  addLog: (action: string, type: 'info' | 'success' | 'warning' | 'error', details: string) => void;
  resetDemoData: () => void;
  totalRevenue: number;
  totalSeatsBooked: number;

  // Events Service (BizOS)
  events: EcoAssetEvent[];
  activeEvent: EcoAssetEvent | null;
  setActiveEvent: (event: EcoAssetEvent | null) => void;
  saveEvent: (event: EcoAssetEvent) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
}

const DEFAULT_EVENTS: EcoAssetEvent[] = [
  {
    id: 'evt-esport-2026',
    title: 'Finale Arène eSport 2026',
    description: 'Le plus grand affrontement eSport de l\'année sur League of Legends avec cube LED 360° et ambiance survoltée.',
    venueName: 'Arena E-Sport BizOS',
    startDate: '2026-10-26T20:00:00.000Z',
    endDate: '2026-10-26T23:30:00.000Z',
    capacity: 1500,
    basePrice: 149,
    speaker: 'Faker (T1) & Gotaga',
    status: 'PUBLISHED',
    ticketPrices: {
      standard: 149,
      premium: 249,
      vip: 499
    }
  },
  {
    id: 'evt-jazz-2026',
    title: 'Concert Jazz Night',
    description: 'Une nuit magique sous le signe du jazz classique et contemporain, avec des artistes de renommée internationale.',
    venueName: 'Opéra Garnier BizOS',
    startDate: '2026-12-15T19:30:00.000Z',
    endDate: '2026-12-15T22:30:00.000Z',
    capacity: 500,
    basePrice: 89,
    speaker: 'Diana Krall & Ibrahim Maalouf',
    status: 'PUBLISHED',
    ticketPrices: {
      standard: 89,
      premium: 149,
      vip: 299
    }
  },
  {
    id: 'evt-kart-2026',
    title: 'Grand Tournoi de Kart Connecté',
    description: 'Pilotez des karts électriques connectés IoT avec restitution des statistiques de télémétrie en direct.',
    venueName: 'Circuit Karting BizOS',
    startDate: '2026-09-18T14:00:00.000Z',
    endDate: '2026-09-18T18:00:00.000Z',
    capacity: 200,
    basePrice: 35,
    speaker: 'Squeezie & Gotaga',
    status: 'DRAFT',
    ticketPrices: {
      standard: 35,
      premium: 59,
      vip: 120
    }
  },
  {
    id: 'evt-football-gala',
    title: 'Match Gala France-Brésil',
    description: 'Rencontre historique de football caritatif réunissant les légendes du ballon rond au profit de l\'UNICEF.',
    venueName: 'Stade BizOS',
    startDate: '2026-06-12T21:00:00.000Z',
    endDate: '2026-06-12T23:00:00.000Z',
    capacity: 80000,
    basePrice: 75,
    speaker: 'Zinedine Zidane & Ronaldinho',
    status: 'ARCHIVED',
    ticketPrices: {
      standard: 75,
      premium: 150,
      vip: 450
    }
  }
];

const TicketingContext = createContext<TicketingContextType | undefined>(undefined);

export const TicketingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(getBackendModePreference());
  const [selectedVenue, setSelectedVenue] = useState<string>('Arena E-Sport BizOS');
  const [cartSeats, setCartSeats] = useState<TicketSeatItem[]>([
    { id: 'g1-5', section: 'Grandstand A', row: '5', seatNum: 12, price: 149, type: 'regular' },
    { id: 'g1-6', section: 'Grandstand A', row: '5', seatNum: 13, price: 149, type: 'regular' }
  ]);
  const [localBookings, setLocalBookings] = useState<EcoAssetBooking[]>(loadLocalBookings());
  const [firestoreBookings, setFirestoreBookings] = useState<EcoAssetBooking[]>([]);
  const [firestoreSeats, setFirestoreSeats] = useState<Record<string, FirestoreSeat>>({});
  const [firestoreLogs, setFirestoreLogs] = useState<TicketingLog[]>([]);
  const [activeBooking, setActiveBooking] = useState<EcoAssetBooking | null>(null);
  
  // Events state variables
  const [localEvents, setLocalEvents] = useState<EcoAssetEvent[]>(() => {
    try {
      const raw = localStorage.getItem('ecoasset_events_v2');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_EVENTS;
  });
  const [firestoreEvents, setFirestoreEvents] = useState<EcoAssetEvent[]>([]);
  const [activeEvent, setActiveEvent] = useState<EcoAssetEvent | null>(null);

  const [logs, setLogs] = useState<TicketingLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      action: 'Système Initialisé',
      type: 'info',
      details: 'Service EcoAsset Ticketing connecté en temps réel aux collections Firestore cloud'
    }
  ]);

  // Sync events & localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecoasset_events_v2', JSON.stringify(localEvents));
    } catch {}
  }, [localEvents]);

  // Sync state & localStorage
  useEffect(() => {
    saveLocalBookings(localBookings);
    if (!activeBooking && localBookings.length > 0) {
      setActiveBooking(localBookings[0]);
    }
  }, [localBookings]);

  // Subscribe to Firestore if mode enabled
  useEffect(() => {
    let unsubBookings: (() => void) | undefined;
    let unsubSeats: (() => void) | undefined;
    let unsubLogs: (() => void) | undefined;
    let unsubEvents: (() => void) | undefined;

    if (isBackendConnected) {
      unsubBookings = subscribeToFirestoreBookings(
        (remoteBookings) => {
          if (remoteBookings.length > 0) {
            setFirestoreBookings(remoteBookings);
          }
        },
        (err) => console.warn('Firestore fallback to local mode:', err)
      );

      unsubSeats = subscribeToFirestoreSeats(
        (remoteSeats) => {
          setFirestoreSeats(remoteSeats);
        },
        (err) => console.warn('Firestore seats fallback:', err)
      );

      unsubLogs = subscribeToFirestoreLogs(
        (remoteLogs) => {
          if (remoteLogs.length > 0) {
            setFirestoreLogs(remoteLogs);
          }
        },
        (err) => console.warn('Firestore logs fallback:', err)
      );

      unsubEvents = subscribeToFirestoreEvents(
        (remoteEvents) => {
          if (remoteEvents.length > 0) {
            setFirestoreEvents(remoteEvents);
          }
        },
        (err) => console.warn('Firestore events fallback:', err)
      );
    }

    return () => {
      if (unsubBookings) unsubBookings();
      if (unsubSeats) unsubSeats();
      if (unsubLogs) unsubLogs();
      if (unsubEvents) unsubEvents();
    };
  }, [isBackendConnected]);

  // Combine events
  const eventsMap = new Map<string, EcoAssetEvent>();
  localEvents.forEach(e => eventsMap.set(e.id, e));
  if (isBackendConnected && firestoreEvents.length > 0) {
    firestoreEvents.forEach(e => eventsMap.set(e.id, e));
  }
  const allEvents = Array.from(eventsMap.values());

  // Handle active event default setting
  useEffect(() => {
    if (!activeEvent && allEvents.length > 0) {
      setActiveEvent(allEvents[0]);
    }
  }, [allEvents, activeEvent]);

  // Sync selectedVenue with activeEvent.venueName
  useEffect(() => {
    if (activeEvent) {
      setSelectedVenue(activeEvent.venueName);
    }
  }, [activeEvent]);

  // Combine bookings
  const bookingsMap = new Map<string, EcoAssetBooking>();
  localBookings.forEach(b => bookingsMap.set(b.id, b));
  if (isBackendConnected) {
    firestoreBookings.forEach(b => bookingsMap.set(b.id, b));
  }
  const allBookings = Array.from(bookingsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Combine logs
  const allLogs = isBackendConnected && firestoreLogs.length > 0
    ? [...firestoreLogs, ...logs.filter(l => !firestoreLogs.some(fl => fl.id === l.id))]
    : logs;

  const addLog = (action: string, type: 'info' | 'success' | 'warning' | 'error', details: string) => {
    const newLog: TicketingLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      action,
      type,
      details
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);

    if (isBackendConnected) {
      saveLogToFirestore(newLog);
    }
  };

  const updateSeatStatus = async (seatId: string, status: 'available' | 'occupied' | 'selected', ticketId?: string) => {
    const seatInfo = cartSeats.find(s => s.id === seatId);
    const firestoreSeatData: FirestoreSeat = {
      id: seatId,
      section: seatInfo?.section || 'Arena',
      price: seatInfo?.price || 149,
      status,
      ticketId
    };
    setFirestoreSeats(prev => ({ ...prev, [seatId]: firestoreSeatData }));

    if (isBackendConnected) {
      await updateSeatInFirestore(firestoreSeatData);
    }
  };

  const toggleBackendMode = () => {
    const next = !isBackendConnected;
    setIsBackendConnected(next);
    saveBackendModePreference(next);
    addLog(
      'Changement de Mode Sync',
      next ? 'success' : 'info',
      next ? 'Mode Backend Firestore (Live Online) Activé' : 'Mode Simulée Local (Offline-first) Activé'
    );
  };

  const toggleCartSeat = (seat: TicketSeatItem) => {
    setCartSeats(prev => {
      const exists = prev.some(s => s.id === seat.id);
      if (exists) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  };

  const clearCart = () => setCartSeats([]);

  const createBooking = async (paymentData: { name: string; email: string; paymentMethod: string }): Promise<EcoAssetBooking> => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const bookingId = `BIZOS-${randomDigits}`;
    const ticketCode = `ECO-2024-${randomDigits}`;
    const totalPrice = cartSeats.reduce((sum, s) => sum + s.price, 0);

    const newBooking: EcoAssetBooking = {
      id: bookingId,
      ticketCode,
      eventName: activeEvent ? activeEvent.title : 'Finale Arène eSport 2026',
      venueName: selectedVenue,
      eventDate: activeEvent 
        ? new Date(activeEvent.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
        : '26 Octobre 2026',
      eventTime: activeEvent 
        ? new Date(activeEvent.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) 
        : '20:00',
      customerName: paymentData.name || 'Client EcoAsset',
      customerEmail: paymentData.email || 'client@bizos.io',
      seats: [...cartSeats],
      totalPrice: totalPrice || 149,
      status: 'CONFIRMED',
      paymentMethod: paymentData.paymentMethod || 'Carte Bancaire',
      createdAt: new Date().toISOString(),
      isMock: !isBackendConnected
    };

    // Save locally
    setLocalBookings(prev => [newBooking, ...prev]);
    setActiveBooking(newBooking);
    clearCart();

    addLog(
      'Nouvelle Réservation',
      'success',
      `Commande #${bookingId} créée avec ${newBooking.seats.length} siège(s) - ${newBooking.totalPrice} €`
    );

    // Save to Firestore if connected
    if (isBackendConnected) {
      const ok = await saveBookingToFirestore(newBooking);
      if (ok) {
        addLog('Sync Firestore', 'success', `Réservation ${bookingId} synchronisée sur la base Firestore cloud.`);
      } else {
        addLog('Sync Firestore Notice', 'warning', `Réservation enregistrée localement (mode hybride).`);
      }
    }

    return newBooking;
  };

  const checkInTicket = async (ticketCodeOrId: string): Promise<{ success: boolean; message: string; booking?: EcoAssetBooking }> => {
    const term = ticketCodeOrId.trim().toUpperCase();
    if (!term) {
      return { success: false, message: 'Code de billet invalide' };
    }

    const found = allBookings.find(
      b => b.id.toUpperCase() === term || b.ticketCode.toUpperCase() === term || b.id.toUpperCase().endsWith(term)
    );

    if (!found) {
      addLog('Scan Check-in', 'error', `Code inconnu: ${term}`);
      return { success: false, message: 'Aucun billet trouvé pour ce code' };
    }

    if (found.status === 'CHECKED_IN') {
      addLog('Scan Check-in', 'warning', `Billet ${found.id} déjà validé à ${found.checkedInAt || 'précédemment'}`);
      return { 
        success: false, 
        message: `Ce billet a déjà été scanné et validé !`,
        booking: found 
      };
    }

    const checkInTime = new Date().toISOString();
    const updated: EcoAssetBooking = {
      ...found,
      status: 'CHECKED_IN',
      checkedInAt: checkInTime
    };

    setLocalBookings(prev => prev.map(b => b.id === found.id ? updated : b));
    if (activeBooking?.id === found.id) {
      setActiveBooking(updated);
    }

    addLog(
      'Validation Check-in',
      'success',
      `Accès autorisé pour ${found.customerName} (${found.id}) - Sièges: ${found.seats.map(s => s.id).join(', ')}`
    );

    if (isBackendConnected) {
      await updateBookingStatusInFirestore(found.id, 'CHECKED_IN', { checkedInAt: checkInTime });
    }

    return {
      success: true,
      message: `Accès Validé ! Bienvenue ${found.customerName}`,
      booking: updated
    };
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    const found = allBookings.find(b => b.id === bookingId);
    if (!found) return false;

    const updated: EcoAssetBooking = {
      ...found,
      status: 'CANCELLED'
    };

    setLocalBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
    if (activeBooking?.id === bookingId) {
      setActiveBooking(updated);
    }

    addLog('Annulation Billet', 'warning', `Billet ${bookingId} annulé.`);

    if (isBackendConnected) {
      await updateBookingStatusInFirestore(bookingId, 'CANCELLED');
    }

    return true;
  };

  const saveEvent = async (event: EcoAssetEvent): Promise<boolean> => {
    const isNew = !allEvents.some(e => e.id === event.id);
    
    // Save to local state
    setLocalEvents(prev => {
      const exists = prev.some(e => e.id === event.id);
      if (exists) {
        return prev.map(e => e.id === event.id ? event : e);
      } else {
        return [...prev, event];
      }
    });

    if (activeEvent?.id === event.id || !activeEvent) {
      setActiveEvent(event);
    }

    addLog(
      isNew ? 'Création Événement' : 'Mise à jour Événement',
      'success',
      `L'événement '${event.title}' a été ${isNew ? 'créé' : 'mis à jour'} avec succès. Statut: ${event.status}`
    );

    if (isBackendConnected) {
      const ok = await saveEventToFirestore(event);
      if (ok) {
        addLog('Sync Firestore', 'success', `Événement '${event.title}' sauvegardé sur le Cloud.`);
      }
    }
    return true;
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    const found = allEvents.find(e => e.id === eventId);
    if (!found) return false;

    setLocalEvents(prev => prev.filter(e => e.id !== eventId));
    if (activeEvent?.id === eventId) {
      setActiveEvent(null);
    }

    addLog(
      'Suppression Événement',
      'warning',
      `L'événement '${found.title}' a été supprimé.`
    );

    if (isBackendConnected) {
      await deleteEventInFirestore(eventId);
    }
    return true;
  };

  const resetDemoData = () => {
    localStorage.removeItem('ecoasset_ticketing_bookings_v2');
    localStorage.removeItem('ecoasset_events_v2');
    setLocalBookings(loadLocalBookings());
    setLocalEvents(DEFAULT_EVENTS);
    setActiveEvent(DEFAULT_EVENTS[0]);
    addLog('Réinitialisation Data', 'info', 'Données de démonstration réinitialisées.');
  };

  const totalRevenue = allBookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const totalSeatsBooked = allBookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.seats.length, 0);

  return (
    <TicketingContext.Provider value={{
      isBackendConnected,
      toggleBackendMode,
      selectedVenue,
      setSelectedVenue,
      cartSeats,
      toggleCartSeat,
      clearCart,
      bookings: allBookings,
      activeBooking,
      setActiveBooking,
      logs: allLogs,
      firestoreSeats,
      updateSeatStatus,
      createBooking,
      checkInTicket,
      cancelBooking,
      addLog,
      resetDemoData,
      totalRevenue,
      totalSeatsBooked,
      
      // Events API (BizOS)
      events: allEvents,
      activeEvent,
      setActiveEvent,
      saveEvent,
      deleteEvent
    }}>
      {children}
    </TicketingContext.Provider>
  );
};

const defaultContextValue: TicketingContextType = {
  isBackendConnected: false,
  toggleBackendMode: () => {},
  selectedVenue: 'Arena E-Sport BizOS',
  setSelectedVenue: () => {},
  cartSeats: [],
  toggleCartSeat: () => {},
  clearCart: () => {},
  bookings: [],
  activeBooking: null,
  setActiveBooking: () => {},
  logs: [],
  firestoreSeats: {},
  updateSeatStatus: async () => {},
  createBooking: async () => ({} as any),
  checkInTicket: async () => ({ success: false, message: '' }),
  cancelBooking: async () => false,
  addLog: () => {},
  resetDemoData: () => {},
  totalRevenue: 0,
  totalSeatsBooked: 0,
  
  // Events Stubs (BizOS)
  events: [],
  activeEvent: null,
  setActiveEvent: () => {},
  saveEvent: async () => false,
  deleteEvent: async () => false
};

export const useTicketing = () => {
  const context = useContext(TicketingContext);
  if (!context) {
    return defaultContextValue;
  }
  return context;
};
