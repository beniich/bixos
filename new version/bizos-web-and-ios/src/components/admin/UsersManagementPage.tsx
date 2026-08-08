import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { UserFormModal } from './UserFormModal';
import { UserCard } from './UserCard';
import { UserFilterBar } from './UserFilterBar';
import { User, UserPlus, Download } from 'lucide-react';

const ROLE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  SUPER_ADMIN:  { label: 'Super Admin',     color: 'bg-red-500/20 text-red-300 border-red-500/30',     icon: '👑' },
  ORG_MANAGER:  { label: 'Org Manager',     color: 'bg-violet-500/20 text-violet-300 border-violet-500/30', icon: '👔' },
  SITE_ADMIN:   { label: 'Admin Site',      color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: '🏢' },
  COLLABORATOR: { label: 'Collaborateur',   color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',  icon: '👤' },
  TECHNICIAN:   { label: 'Technicien',      color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: '🔧' },
  CAFM_MANAGER: { label: 'Manager CAFM',    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: '🏢' },
  AUDITOR:      { label: 'Auditeur',        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: '📋' },
  CLIENT_VIEWER:{ label: 'Client',          color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',   icon: '👁️' },
};

export function UsersManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([
    { id: '1', displayName: 'Admin BizOS', role: 'SUPER_ADMIN', status: 'ACTIVE', email: 'admin@bizos.com' },
    { id: '2', displayName: 'Marc Leblanc', role: 'TECHNICIAN', status: 'ACTIVE', email: 'marc@bizos.com' },
    { id: '3', displayName: 'Sophie Martin', role: 'COLLABORATOR', status: 'ACTIVE', email: 'sophie@bizos.com' },
  ]);
  const [environments, setEnvironments] = useState<any[]>([]);
  const [filter, setFilter] = useState({ role: '', status: '', search: '' });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const filtered = users.filter(u => {
    if (filter.role && u.role !== filter.role) return false;
    if (filter.status && u.status !== filter.status) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!u.displayName?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const groupedByRole = filtered.reduce((acc: Record<string, any[]>, u) => {
    if (!acc[u.role]) acc[u.role] = [];
    acc[u.role].push(u);
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-950 to-slate-900 text-white animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <User className="w-8 h-8 text-violet-400" /> Gestion des Utilisateurs
          </h1>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg font-semibold flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Inviter un utilisateur
        </button>
      </div>

      <UserFilterBar filter={filter} onChange={setFilter} users={users} />

      <div className="grid grid-cols-8 gap-3 mb-6">
        {Object.entries(ROLE_LABELS).map(([role, config]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <button key={role} onClick={() => setFilter(f => ({ ...f, role: f.role === role ? '' : role }))} className={`p-3 rounded-xl border transition-all ${filter.role === role ? 'ring-2 ring-violet-500 ' : ''} ${config.color}`}>
              <div className="text-2xl mb-1">{config.icon}</div>
              <div className="text-xs opacity-80">{config.label}</div>
              <div className="text-2xl font-bold mt-1">{count}</div>
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedByRole).map(([role, roleUsers]) => {
          const config = ROLE_LABELS[role];
          return (
            <div key={role} className="bg-gray-900/30 backdrop-blur rounded-2xl border border-gray-800 p-5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">{config?.icon}</span> {config?.label}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {roleUsers.map(u => (
                  <UserCard key={u.id} user={u} environments={environments} onEdit={() => setEditingUser(u)} roleLabel={ROLE_LABELS[u.role] || ROLE_LABELS.COLLABORATOR} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showInviteModal && <UserFormModal mode="invite" environments={environments} onSubmit={() => setShowInviteModal(false)} onClose={() => setShowInviteModal(false)} />}
      {editingUser && <UserFormModal mode="edit" user={editingUser} environments={environments} onSubmit={() => setEditingUser(null)} onClose={() => setEditingUser(null)} />}
    </div>
  );
}
