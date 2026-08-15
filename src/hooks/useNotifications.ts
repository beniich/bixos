import { useEffect, useState, useCallback } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  doc, updateDoc, writeBatch, limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { BizOSNotification } from '../types/notifications';

export function useNotifications(options?: { limit?: number; unreadOnly?: boolean }) {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<BizOSNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const orgId = profile?.organizationId;
  const uid = user?.id;

  useEffect(() => {
    if (!uid || !orgId) return;

    const constraints: any[] = [
      orderBy('createdAt', 'desc'),
      limit(options?.limit ?? 50),
    ];

    if (options?.unreadOnly) {
      constraints.unshift(where('isRead', '==', false));
    }

    const q = query(
      collection(db, 'organizations', orgId, 'users', uid, 'notifications'),
      ...constraints
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as BizOSNotification[];
      
      setNotifications(items);
      setUnreadCount(items.filter(n => !n.isRead).length);
      setLoading(false);
    });

    return () => unsub();
  }, [uid, orgId, options?.limit, options?.unreadOnly]);

  const markAsRead = useCallback(async (notifId: string) => {
    if (!uid || !orgId) return;
    try {
      const token = localStorage.getItem('biz_access_token');
      await fetch('/api/notifications/mark-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ notifId })
      });
      // La mise à jour UI sera gérée par le listener onSnapshot
    } catch (e) {
      console.error(e);
    }
  }, [uid, orgId]);

  const markAllAsRead = useCallback(async () => {
    if (!uid || !orgId) return;
    try {
      const token = localStorage.getItem('biz_access_token');
      await fetch('/api/notifications/mark-all-as-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });
    } catch (e) {
      console.error(e);
    }
  }, [uid, orgId]);

  const archive = useCallback(async (notifId: string) => {
    if (!uid || !orgId) return;
    await updateDoc(doc(db, 'organizations', orgId, 'users', uid, 'notifications', notifId), {
      isArchived: true,
      archivedAt: Date.now(),
    });
  }, [uid, orgId]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    archive,
  };
}
