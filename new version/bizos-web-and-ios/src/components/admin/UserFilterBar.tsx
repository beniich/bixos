import React from 'react';

export function UserFilterBar({ filter, onChange, users }: any) {
  return (
    <div className="flex gap-2 mb-4 bg-gray-900/50 p-2 rounded-xl border border-gray-800">
      <input
        type="text"
        placeholder="Rechercher un utilisateur..."
        className="px-3 py-2 bg-gray-800 rounded-lg text-sm flex-1 outline-none focus:ring-1 focus:ring-violet-500 text-white"
        value={filter.search}
        onChange={(e) => onChange({ ...filter, search: e.target.value })}
      />
      <select 
        value={filter.status}
        onChange={(e) => onChange({ ...filter, status: e.target.value })}
        className="px-3 py-2 bg-gray-800 rounded-lg text-sm text-white"
      >
        <option value="">Tous les statuts</option>
        <option value="ACTIVE">Actif</option>
        <option value="INACTIVE">Inactif</option>
        <option value="PENDING_INVITATION">En attente</option>
      </select>
    </div>
  );
}
