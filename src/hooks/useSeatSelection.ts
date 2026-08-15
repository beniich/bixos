// src/hooks/useSeatSelection.ts
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Seat, SeatHold } from '../types/seat';
import { holdSeats, releaseHold, subscribeToSeats } from '../services/seatService';
import { useAuth } from '../context/AuthContext';

export interface UseSeatSelectionProps {
  venueId: string;
  eventId: string;
  sessionId: string;
  maxSeats?: number;
}

export function useSeatSelection({ venueId, eventId, sessionId, maxSeats = 10 }: UseSeatSelectionProps) {
  const { user } = useAuth();
  const [allSeats, setAllSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [activeHold, setActiveHold] = useState<SeatHold | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to real-time seat status
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToSeats(venueId, (seats) => {
      setAllSeats(seats);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      // On unmount, release any active holds by this session if not confirmed
      releaseHold(Array.from(selectedSeatIds), sessionId).catch(console.error);
    };
  }, [venueId, sessionId, selectedSeatIds]);

  const selectedSeats = useMemo(() => {
    return allSeats.filter(s => selectedSeatIds.has(s.id));
  }, [allSeats, selectedSeatIds]);

  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => {
      const base = seat.pricing?.basePrice || 0;
      const fee = seat.pricing?.fees || 0;
      return sum + base + fee;
    }, 0);
  }, [selectedSeats]);

  const toggleSeat = useCallback((seatId: string) => {
    setError(null);
    setSelectedSeatIds(prev => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        if (next.size >= maxSeats) {
          setError(`Vous ne pouvez sélectionner que ${maxSeats} sièges maximum.`);
          return prev;
        }
        
        // Verify seat is available locally first
        const seat = allSeats.find(s => s.id === seatId);
        if (!seat || seat.status === 'BOOKED' || seat.status === 'BLOCKED') {
          setError(`Ce siège n'est plus disponible.`);
          return prev;
        }
        
        if (seat.status === 'RESERVED' && seat.reservedBy !== sessionId) {
          setError(`Ce siège est en cours de réservation par quelqu'un d'autre.`);
          return prev;
        }

        next.add(seatId);
      }
      return next;
    });
  }, [allSeats, maxSeats, sessionId]);

  const clearSelection = useCallback(() => {
    if (selectedSeatIds.size > 0) {
      releaseHold(Array.from(selectedSeatIds), sessionId).catch(console.error);
    }
    setSelectedSeatIds(new Set());
    setActiveHold(null);
    setError(null);
  }, [selectedSeatIds, sessionId]);

  const reserveSelection = useCallback(async () => {
    if (selectedSeatIds.size === 0) {
      setError('Aucun siège sélectionné');
      return null;
    }

    setIsHolding(true);
    setError(null);

    try {
      const hold = await holdSeats(
        Array.from(selectedSeatIds),
        eventId,
        sessionId,
        user?.id
      );
      setActiveHold(hold);
      setIsHolding(false);
      return hold;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réservation des sièges');
      setIsHolding(false);
      
      // Remove failed seats from selection
      // This is a naive cleanup: if hold fails, we clear all for safety
      setSelectedSeatIds(new Set());
      return null;
    }
  }, [selectedSeatIds, eventId, sessionId, user?.id]);

  const timeRemaining = useMemo(() => {
    if (!activeHold) return 0;
    const remaining = activeHold.expiresAt - Date.now();
    return Math.max(0, remaining);
  }, [activeHold]);

  return {
    allSeats,
    selectedSeats,
    selectedSeatIds,
    toggleSeat,
    clearSelection,
    reserveSelection,
    activeHold,
    isHolding,
    isLoading,
    error,
    totalAmount,
    timeRemaining
  };
}
