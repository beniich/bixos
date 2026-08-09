import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Settings } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { BizOSNotification } from '../../types/notifications';
import { PageId } from '../../types';

const PRIORITY_RING: Record<string, string> = {
  urgent: 'ring-4 ring-red-500/50',
  high: 'ring-2 ring-orange-500/50',
  medium: '',
  low: '',
};

interface Props {
  onNavigate?: (page: PageId) => void;
}

export function NotificationBell({ onNavigate }: Props) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, archive } = useNotifications({ limit: 20 });
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  const handleClickNotification = async (notif: BizOSNotification) => {
    await markAsRead(notif.id);
    if (notif.actionUrl && onNavigate) {
      // Pour une SPA, on devra peut-être parser l'actionUrl
      // En attendant, on peut router selon le besoin
      if (notif.actionUrl.includes('tech/')) onNavigate('tech_mobile_home' as PageId);
      else if (notif.actionUrl.includes('admin')) onNavigate('admin_super');
      else onNavigate('dashboard');
      setIsOpen(false);
    }
  };

  const grouped = groupByDate(filtered);
  const priority = getHighestPriority(notifications);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg hover:bg-slate-800 transition-colors ${
          unreadCount > 0 ? PRIORITY_RING[priority] : ''
        }`}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-violet-400 animate-pulse' : 'text-gray-400'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold">Notifications</h3>
              <p className="text-xs text-gray-400">
                {unreadCount > 0 ? `${unreadCount} non lues` : 'Tout est lu'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 hover:bg-slate-800 rounded text-xs flex items-center gap-1"
                  title="Tout marquer comme lu"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => { setIsOpen(false); onNavigate?.('settings'); }} className="p-1.5 hover:bg-slate-800 rounded">
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-800 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 text-sm transition-colors ${
                filter === 'all' ? 'border-b-2 border-violet-500 text-violet-400' : 'text-gray-400'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-2 text-sm transition-colors ${
                filter === 'unread' ? 'border-b-2 border-violet-500 text-violet-400' : 'text-gray-400'
              }`}
            >
              Non lues ({unreadCount})
            </button>
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                <p className="text-gray-400">Aucune notification</p>
              </div>
            ) : (
              Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <div className="px-4 py-1.5 text-xs text-gray-500 bg-slate-900/90 sticky top-0 z-10 backdrop-blur">
                    {date}
                  </div>
                  {items.map((notif: BizOSNotification) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onClick={() => handleClickNotification(notif)}
                      onArchive={() => archive(notif.id)}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function groupByDate(notifs: BizOSNotification[]) {
  const groups: Record<string, BizOSNotification[]> = {};
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  
  notifs.forEach(n => {
    const d = new Date(n.createdAt);
    let label: string;
    if (d >= today) label = "Aujourd'hui";
    else if (d >= yesterday) label = 'Hier';
    else label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  
  return groups;
}

function getHighestPriority(notifs: BizOSNotification[]): string {
  if (notifs.some(n => n.priority === 'urgent' && !n.isRead)) return 'urgent';
  if (notifs.some(n => n.priority === 'high' && !n.isRead)) return 'high';
  return 'medium';
}
