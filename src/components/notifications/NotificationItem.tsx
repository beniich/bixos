import React from 'react';
import { Archive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BizOSNotification } from '../../types/notifications';

const TYPE_CONFIG: Record<string, { icon: string; bg: string }> = {
  claim_created:              { icon: '📋', bg: 'bg-blue-500/20' },
  claim_assigned:             { icon: '🔧', bg: 'bg-orange-500/20' },
  claim_status_changed:       { icon: '🔄', bg: 'bg-purple-500/20' },
  claim_resolved:             { icon: '✅', bg: 'bg-green-500/20' },
  claim_sla_breach:           { icon: '🚨', bg: 'bg-red-500/20' },
  claim_sla_warning:          { icon: '⚠️', bg: 'bg-orange-500/20' },
  claim_mention:              { icon: '💬', bg: 'bg-pink-500/20' },
  asset_assigned:             { icon: '🔗', bg: 'bg-cyan-500/20' },
  asset_health_critical:      { icon: '❤️🩹', bg: 'bg-red-500/20' },
  asset_predicted_failure:    { icon: '🤖', bg: 'bg-orange-500/20' },
  maintenance_due:            { icon: '🔔', bg: 'bg-violet-500/20' },
  maintenance_overdue:        { icon: '⏰', bg: 'bg-red-500/20' },
  iot_alert:                  { icon: '📡', bg: 'bg-yellow-500/20' },
  user_invited:               { icon: '📨', bg: 'bg-cyan-500/20' },
  subscription_expiring:      { icon: '💳', bg: 'bg-amber-500/20' },
  subscription_expired:       { icon: '🚫', bg: 'bg-red-500/20' },
};

const PRIORITY_BORDER: Record<string, string> = {
  urgent: 'border-l-4 border-red-500',
  high: 'border-l-4 border-orange-500',
  medium: 'border-l-2 border-violet-500',
  low: '',
};

interface Props {
  notification: BizOSNotification;
  onClick: () => void;
  onArchive: () => void;
}

export function NotificationItem({ notification, onClick, onArchive }: Props) {
  const config = TYPE_CONFIG[notification.type] ?? { icon: '🔔', bg: 'bg-gray-500/20' };
  const priorityBorder = PRIORITY_BORDER[notification.priority] ?? '';

  return (
    <div
      onClick={onClick}
      className={`group relative p-3 hover:bg-slate-800/50 cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-violet-500/5' : ''
      } ${priorityBorder}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center text-xl flex-shrink-0`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm ${!notification.isRead ? 'font-semibold text-white' : 'text-gray-300'}`}>
              {notification.title}
              {notification.count && notification.count > 1 && (
                <span className="ml-2 px-1.5 py-0.5 bg-violet-500/30 text-violet-300 text-xs rounded-full">
                  ×{notification.count}
                </span>
              )}
            </p>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: fr })}
          </p>
        </div>

        {/* Actions */}
        <button
          onClick={(e) => { e.stopPropagation(); onArchive(); }}
          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-700 rounded transition-opacity"
          title="Archiver"
        >
          <Archive className="w-3.5 h-3.5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
