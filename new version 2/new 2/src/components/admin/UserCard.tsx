import React from 'react';
import { Mail, Edit2, CheckCircle2 } from 'lucide-react';

export function UserCard({ user, onEdit, roleLabel, compact = false }: any) {
  return (
    <div className={`bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-violet-500/50 rounded-xl p-4 transition-all group ${compact ? '' : 'flex items-start gap-4'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold">
            {user.displayName?.charAt(0) ?? '?'}
          </div>
          <div>
            <h3 className="font-semibold text-white">{user.displayName}</h3>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <button onClick={onEdit} className="p-1.5 hover:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit2 className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
