import React from 'react';
import { Search, Filter } from 'lucide-react';
import { UserStatus } from '../../types/database';

interface FilterState {
  role: string;
  status: string;
  search: string;
}

interface UserFilterBarProps {
  filter: FilterState;
  onChange: (f: FilterState) => void;
  users: any[];
}

const STATUS_OPTIONS: { value: UserStatus | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'ACTIVE', label: '✅ Actif' },
  { value: 'PENDING_INVITATION', label: '📧 Invitation en attente' },
  { value: 'INACTIVE', label: '⏸️ Inactif' },
  { value: 'SUSPENDED', label: '🚫 Suspendu' },
];

export const UserFilterBar: React.FC<UserFilterBarProps> = ({ filter, onChange, users }) => {
  const filteredCount = users.filter(u => {
    if (filter.role && u.role !== filter.role) return false;
    if (filter.status && u.status !== filter.status) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!u.displayName?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q)) return false;
    }
    return true;
  }).length;

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher par nom, email..."
          value={filter.search}
          onChange={e => onChange({ ...filter, search: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      <div className="relative">
        <select
          value={filter.status}
          onChange={e => onChange({ ...filter, status: e.target.value })}
          className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 pr-8 cursor-pointer"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>

      <div className="text-sm text-gray-500 whitespace-nowrap">{filteredCount} résultats</div>

      {(filter.role || filter.status || filter.search) && (
        <button
          onClick={() => onChange({ role: '', status: '', search: '' })}
          className="px-3 py-2 text-xs bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg hover:bg-red-500/20 transition-colors"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
};
