import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { UserFormModal } from './UserFormModal';
import { UserCard } from './UserCard';
import { UserFilterBar } from './UserFilterBar';
import { Users, UserPlus, Download } from 'lucide-react';
import { UserRole, ROLE_CONFIG, Environment } from '../../types/database';

const ALL_ROLES: UserRole[] = [
  'SUPER_ADMIN', 'ORG_MANAGER', 'SITE_ADMIN', 'CAFM_MANAGER',
  'COLLABORATOR', 'TECHNICIAN', 'AUDITOR', 'CLIENT_VIEWER',
];

export function UsersManagementPage() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [filter, setFilter] = useState({ role: '', status: '', search: '' });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  const orgId = profile?.organizationId || user?.id;

  useEffect(() => {
    if (!orgId) return;

    // Users snapshot
    const unsubUsers = onSnapshot(
      collection(db, 'organizations', orgId, 'users'),
      snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('[Admin Users] Firestore error:', err)
    );

    // Environments snapshot
    const unsubEnvs = onSnapshot(
      collection(db, 'organizations', orgId, 'environments'),
      snap => setEnvironments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Environment))),
      err => console.error('[Admin Envs] Firestore error:', err)
    );

    return () => { unsubUsers(); unsubEnvs(); };
  }, [orgId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleInvite = async (data: any) => {
    if (!orgId) return;
    const userId = crypto.randomUUID();
    await setDoc(doc(db, 'organizations', orgId, 'users', userId), {
      ...data,
      id: userId,
      organizationId: orgId,
      status: 'PENDING_INVITATION',
      invitedById: user?.id,
      invitedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    showToast(`📨 Invitation préparée pour ${data.email}`);
    setShowInviteModal(false);
  };

  const handleUpdate = async (userId: string, data: any) => {
    if (!orgId) return;
    await updateDoc(doc(db, 'organizations', orgId, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    showToast('✅ Utilisateur mis à jour');
    setEditingUser(null);
  };

  const handleExport = () => {
    const csv = ['Email,Nom,Rôle,Statut,Département']
      .concat(users.map(u => `${u.email},${u.displayName},${u.role},${u.status},${u.department || ''}`))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'users_export.csv'; a.click();
  };

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
    <div className="min-h-screen p-6 text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-violet-600 text-white px-4 py-3 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-violet-400" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {users.length} utilisateurs · {Object.keys(groupedByRole).length} rôles actifs
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg font-semibold flex items-center gap-2 text-sm transition-all"
          >
            <UserPlus className="w-4 h-4" /> Inviter un utilisateur
          </button>
        </div>
      </div>

      {/* Role stat pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter(f => ({ ...f, role: '' }))}
          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${!filter.role ? 'bg-white/10 border-white/30 text-white' : 'bg-white/3 border-white/10 text-gray-400 hover:border-white/20'}`}
        >
          Tous ({users.length})
        </button>
        {ALL_ROLES.map(role => {
          const count = users.filter(u => u.role === role).length;
          if (count === 0) return null;
          const config = ROLE_CONFIG[role];
          return (
            <button
              key={role}
              onClick={() => setFilter(f => ({ ...f, role: f.role === role ? '' : role }))}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${filter.role === role ? `ring-1 ring-violet-500 ${config.color}` : `${config.color} opacity-60 hover:opacity-100`}`}
            >
              {config.icon} {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search + Filter bar */}
      <UserFilterBar filter={filter} onChange={setFilter} users={users} />

      {/* Users list */}
      {filter.role ? (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(u => (
            <UserCard key={u.id} user={u} environments={environments} onEdit={() => setEditingUser(u)} roleLabel={ROLE_CONFIG[u.role as UserRole]} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {ALL_ROLES.map(role => {
            const roleUsers = groupedByRole[role];
            if (!roleUsers || roleUsers.length === 0) return null;
            const config = ROLE_CONFIG[role];
            return (
              <div key={role} className="bg-white/2 backdrop-blur rounded-2xl border border-white/5 p-5">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">{config.icon}</span>
                  {config.label}
                  <span className="text-sm text-gray-500 font-normal">({roleUsers.length})</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {roleUsers.map(u => (
                    <UserCard key={u.id} user={u} environments={environments} onEdit={() => setEditingUser(u)} roleLabel={config} compact />
                  ))}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg">Aucun utilisateur trouvé</p>
              <p className="text-sm mt-1">Invitez votre premier utilisateur</p>
            </div>
          )}
        </div>
      )}

      {showInviteModal && (
        <UserFormModal mode="invite" environments={environments} onSubmit={handleInvite} onClose={() => setShowInviteModal(false)} />
      )}
      {editingUser && (
        <UserFormModal mode="edit" user={editingUser} environments={environments} onSubmit={(data) => handleUpdate(editingUser.id, data)} onClose={() => setEditingUser(null)} />
      )}
    </div>
  );
}
