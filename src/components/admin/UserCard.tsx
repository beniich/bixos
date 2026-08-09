import React from 'react';
import { Shield, Mail, Phone, Briefcase, MoreVertical, CheckCircle, Clock, Ban, XCircle } from 'lucide-react';
import { UserRole, UserStatus, ROLE_CONFIG, Environment } from '../../types/database';

interface UserCardProps {
  user: any;
  environments: Environment[];
  onEdit: () => void;
  roleLabel?: { label: string; color: string; icon: string };
  compact?: boolean;
}

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; icon: React.ReactNode }> = {
  ACTIVE:               { label: 'Actif',              color: 'text-emerald-400', icon: <CheckCircle className="w-3 h-3" /> },
  PENDING_INVITATION:   { label: 'Invitation envoyée', color: 'text-yellow-400',  icon: <Clock className="w-3 h-3" /> },
  INACTIVE:             { label: 'Inactif',            color: 'text-gray-400',    icon: <Ban className="w-3 h-3" /> },
  SUSPENDED:            { label: 'Suspendu',           color: 'text-red-400',     icon: <XCircle className="w-3 h-3" /> },
};

export const UserCard: React.FC<UserCardProps> = ({ user, environments, onEdit, roleLabel, compact = false }) => {
  const role = user.role as UserRole;
  const config = ROLE_CONFIG[role] ?? roleLabel;
  const statusInfo = STATUS_CONFIG[user.status as UserStatus] ?? STATUS_CONFIG['ACTIVE'];

  const assignedEnvs = environments.filter(e =>
    user.environmentIds?.includes(e.id) || user.environmentId === e.id
  );

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white/3 hover:bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
          {user.avatar ? (
            <img src={user.avatar} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
          ) : (
            (user.displayName || user.email || '?')[0].toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{user.displayName || user.email}</div>
          <div className="text-xs text-gray-500 truncate">{user.jobTitle || user.email}</div>
        </div>
        <div className={`flex items-center gap-1 text-xs ${statusInfo.color}`}>
          {statusInfo.icon}
        </div>
        <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/3 hover:bg-white/5 border border-white/5 hover:border-violet-500/20 rounded-2xl p-5 transition-all group">
      <div className="flex items-start justify-between mb-4">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-base font-bold text-white flex-shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
            ) : (
              (user.displayName || user.email || '?')[0].toUpperCase()
            )}
          </div>
          <div>
            <div className="font-semibold text-white">{user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}</div>
            <div className="text-xs text-gray-400">{user.jobTitle || 'Aucune fonction définie'}</div>
          </div>
        </div>
        {/* Actions */}
        <button onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-xs rounded-lg transition-all border border-violet-500/30">
          Modifier
        </button>
      </div>

      {/* Role badge + Status */}
      <div className="flex items-center gap-2 mb-3">
        {config && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            {config.icon} {config.label}
          </span>
        )}
        <span className={`flex items-center gap-1 text-xs ${statusInfo.color}`}>
          {statusInfo.icon} {statusInfo.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-gray-600" />
          <span className="truncate">{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-gray-600" />
            <span>{user.phone}</span>
          </div>
        )}
        {user.department && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-gray-600" />
            <span>{user.department}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {user.skills && user.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {user.skills.slice(0, 3).map((skill: string) => (
            <span key={skill} className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-300/80 text-xs rounded-full">
              {skill}
            </span>
          ))}
          {user.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-white/5 text-gray-500 text-xs rounded-full">+{user.skills.length - 3}</span>
          )}
        </div>
      )}

      {/* Assigned Environments */}
      {assignedEnvs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="text-xs text-gray-500 mb-1.5">Environnements assignés</div>
          <div className="flex flex-wrap gap-1.5">
            {assignedEnvs.slice(0, 2).map(env => (
              <span key={env.id} className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300/80 text-xs rounded-full">
                {env.name}
              </span>
            ))}
            {assignedEnvs.length > 2 && (
              <span className="px-2 py-0.5 bg-white/5 text-gray-500 text-xs rounded-full">+{assignedEnvs.length - 2}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
