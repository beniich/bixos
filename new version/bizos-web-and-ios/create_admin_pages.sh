# SuperAdminDashboard
cat << 'INNER_EOF' > src/components/admin/SuperAdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import {
  Users, Building2, Package, FileText, Activity, TrendingUp,
  AlertCircle, CheckCircle2, ChevronRight, Settings, BarChart3,
} from 'lucide-react';

export function SuperAdminDashboard({ setCurrentPage }: any) {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    users: 0, environments: 0, assets: 0, claims: 0, openClaims: 0,
  });
  const [usersByRole, setUsersByRole] = useState<Record<string, number>>({});
  const [assetsByStatus, setAssetsByStatus] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user?.orgId) return;

    // Default mocks
    setCounts({ users: 12, environments: 5, assets: 45, claims: 8, openClaims: 3 });
    setUsersByRole({ SUPER_ADMIN: 1, TECHNICIAN: 4, COLLABORATOR: 7 });
    setAssetsByStatus({ OPERATIONAL: 38, MAINTENANCE: 4, BROKEN: 3 });
  }, [user?.orgId]);

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ORG_MANAGER') {
    return <div className="p-12 text-center text-red-400">🚫 Accès refusé</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
          🎛️ Centre de Contrôle Admin
        </h1>
        <p className="text-gray-400 mt-2">Gérez tous les utilisateurs, environnements et actifs CAFM</p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        <AdminStatCard icon={Users} label="Utilisateurs" value={counts.users} color="violet" onClick={() => setCurrentPage('admin_users')} />
        <AdminStatCard icon={Building2} label="Environnements" value={counts.environments} color="cyan" onClick={() => setCurrentPage('admin_environments')} />
        <AdminStatCard icon={Package} label="Assets CAFM" value={counts.assets} color="emerald" onClick={() => setCurrentPage('admin_cafm')} />
        <AdminStatCard icon={FileText} label="Réclamations" value={counts.claims} color="orange" onClick={() => setCurrentPage('cafm_gmao')} />
        <AdminStatCard icon={AlertCircle} label="En cours" value={counts.openClaims} color="red" onClick={() => setCurrentPage('cafm_gmao')} />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <ModuleCard
          title="👥 Utilisateurs & Rôles"
          description="Gérer Admins, Collaborateurs, Techniciens"
          icon={Users} color="violet" onClick={() => setCurrentPage('admin_users')} stats={usersByRole}
        />
        <ModuleCard
          title="🌍 Environnements"
          description="Sites, Bâtiments, Zones, Salles"
          icon={Building2} color="cyan" onClick={() => setCurrentPage('admin_environments')} stats={{ total: counts.environments }}
        />
        <ModuleCard
          title="🏢 CAFM Assets"
          description="Équipements, IoT, Maintenance"
          icon={Package} color="emerald" onClick={() => setCurrentPage('admin_cafm')} stats={assetsByStatus}
        />
      </div>
    </div>
  );
}

function AdminStatCard({ icon: Icon, label, value, color, onClick }: any) {
  const colors: Record<string, string> = {
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400',
  };
  return (
    <button onClick={onClick} className={`text-left bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 hover:scale-105 transition-transform`}>
      <Icon className="w-8 h-8 mb-3" />
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-3xl font-bold mt-1 text-white">{value}</p>
    </button>
  );
}

function ModuleCard({ title, description, icon: Icon, color, onClick, stats }: any) {
  const colors: Record<string, string> = {
    violet: 'hover:border-violet-500/50 hover:bg-violet-500/5',
    cyan: 'hover:border-cyan-500/50 hover:bg-cyan-500/5',
    emerald: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
    orange: 'hover:border-orange-500/50 hover:bg-orange-500/5',
    pink: 'hover:border-pink-500/50 hover:bg-pink-500/5',
    gray: 'hover:border-gray-500/50 hover:bg-gray-500/5',
  };
  return (
    <button onClick={onClick} className={`text-left bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 transition-all group ${colors[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-10 h-10 text-gray-400 group-hover:text-white" />
        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-transform" />
      </div>
      <h3 className="text-lg font-bold mb-1 text-white">{title}</h3>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      {Object.keys(stats).length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(stats).slice(0, 3).map(([k, v]) => (
            <span key={k} className="px-2 py-0.5 bg-gray-800/50 rounded text-white">
              <span className="text-gray-500">{k}:</span> <span className="font-mono">{String(v)}</span>
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
INNER_EOF

# UsersManagementPage
cat << 'INNER_EOF' > src/components/admin/UsersManagementPage.tsx
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
INNER_EOF

# UserFormModal
cat << 'INNER_EOF' > src/components/admin/UserFormModal.tsx
import React, { useState } from 'react';
import { X, Mail, User, Briefcase, MapPin, Tag } from 'lucide-react';

const ROLES = [
  { value: 'SUPER_ADMIN',   label: '👑 Super Admin',   desc: 'Tous les droits multi-tenant' },
  { value: 'ORG_MANAGER',   label: '👔 Org Manager',   desc: 'Gère toute l\'organisation' },
  { value: 'SITE_ADMIN',    label: '🏢 Admin Site',    desc: 'Admin d\'un ou plusieurs sites' },
  { value: 'CAFM_MANAGER',  label: '🏢 Manager CAFM',  desc: 'Gestion des actifs/équipements' },
  { value: 'COLLABORATOR',  label: '👤 Collaborateur', desc: 'Utilisateur métier' },
  { value: 'TECHNICIAN',    label: '🔧 Technicien',    desc: 'Intervention terrain' },
  { value: 'AUDITOR',       label: '📋 Auditeur',      desc: 'Lecture seule + rapports' },
  { value: 'CLIENT_VIEWER', label: '👁️ Client',        desc: 'Accès externe limité' },
];

export function UserFormModal({ mode, user, environments, onSubmit, onClose }: any) {
  const [formData, setFormData] = useState({
    email: user?.email ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    displayName: user?.displayName ?? '',
    role: user?.role ?? 'COLLABORATOR',
    environmentIds: [] as string[],
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4 text-white">
      <div className="bg-gray-900 border border-violet-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold">{mode === 'invite' ? '📨 Inviter un utilisateur' : '✏️ Modifier utilisateur'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-gray-400 mb-1">Nom affiché</label><input type="text" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white" required /></div>
            <div><label className="block text-xs text-gray-400 mb-1">Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white" required /></div>
          </div>
          <fieldset>
            <legend className="font-semibold mb-2">Rôle</legend>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setFormData({...formData, role: r.value})} className={`p-3 rounded-lg border text-left ${formData.role === r.value ? 'border-violet-500 bg-violet-500/10' : 'border-gray-700'}`}>
                  <div className="font-semibold">{r.label}</div>
                  <div className="text-xs text-gray-400">{r.desc}</div>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-800 rounded-lg">Annuler</button>
            <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg font-semibold">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}
INNER_EOF

# UserCard
cat << 'INNER_EOF' > src/components/admin/UserCard.tsx
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
INNER_EOF

# EnvironmentsPage
cat << 'INNER_EOF' > src/components/admin/EnvironmentsPage.tsx
import React, { useState } from 'react';
import { Building2, Plus, TreePine } from 'lucide-react';
import { EnvironmentTree } from './EnvironmentTree';
import { EnvironmentFormModal } from './EnvironmentFormModal';

export function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<any[]>([
    { id: '1', code: 'HQ', name: 'Paris HQ', type: 'BUILDING', status: 'NORMAL', healthScore: 100 },
    { id: '2', code: 'HQ-F1', name: 'Étage 1', type: 'FLOOR', parentId: '1', status: 'NORMAL', healthScore: 100 },
    { id: '3', code: 'HQ-R101', name: 'Salle Réunion B', type: 'ROOM', parentId: '2', status: 'NORMAL', healthScore: 100 },
  ]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-950 to-slate-900 text-white animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="w-8 h-8 text-cyan-400" /> Environnements
          </h1>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvel environnement
        </button>
      </div>

      <div className="bg-gray-900/30 backdrop-blur rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TreePine className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold">Arborescence</h2>
        </div>
        <EnvironmentTree environments={environments} onEdit={() => setShowModal(true)} onAddChild={() => setShowModal(true)} />
      </div>

      {showModal && <EnvironmentFormModal environments={environments} onSubmit={() => setShowModal(false)} onClose={() => setShowModal(false)} />}
    </div>
  );
}
INNER_EOF

# EnvironmentTree
cat << 'INNER_EOF' > src/components/admin/EnvironmentTree.tsx
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2 } from 'lucide-react';

const TYPE_ICONS: Record<string, string> = { BUILDING: '🏢', FLOOR: '🏬', ROOM: '🚪', TECHNICAL_ROOM: '⚡' };

export function EnvironmentTree({ environments, onEdit, onAddChild }: any) {
  const roots = environments.filter((e: any) => !e.parentId);
  return (
    <div className="space-y-1">
      {roots.map((env: any) => <TreeNode key={env.id} env={env} allEnvs={environments} level={0} onEdit={onEdit} onAddChild={onAddChild} />)}
    </div>
  );
}

function TreeNode({ env, allEnvs, level, onEdit, onAddChild }: any) {
  const [expanded, setExpanded] = useState(true);
  const children = allEnvs.filter((e: any) => e.parentId === env.id);

  return (
    <div>
      <div className="flex items-center gap-2 p-2 hover:bg-gray-800/50 rounded-lg group" style={{ paddingLeft: `${level * 24 + 8}px` }}>
        <button onClick={() => setExpanded(!expanded)} className="w-5 h-5 flex items-center justify-center" disabled={!children.length}>
          {children.length > 0 ? (expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : null}
        </button>
        <span className="text-lg">{TYPE_ICONS[env.type] ?? '📍'}</span>
        <span className="font-mono text-xs text-gray-500">{env.code}</span>
        <span className="font-semibold text-white">{env.name}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button onClick={() => onAddChild(env.id)} className="p-1.5 hover:bg-gray-700 rounded"><Plus className="w-3.5 h-3.5" /></button>
          <button onClick={() => onEdit(env)} className="p-1.5 hover:bg-gray-700 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {expanded && children.map((child: any) => <TreeNode key={child.id} env={child} allEnvs={allEnvs} level={level + 1} onEdit={onEdit} onAddChild={onAddChild} />)}
    </div>
  );
}
INNER_EOF

# CAFMPage
cat << 'INNER_EOF' > src/components/admin/CAFMPage.tsx
import React, { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { AssetGrid } from './AssetGrid';
import { AssetFormModal } from './AssetFormModal';
import { AssetAssignmentModal } from './AssetAssignmentModal';

export function CAFMPage() {
  const [assets, setAssets] = useState<any[]>([
    { id: '1', assetTag: 'HVAC-01', name: 'Groupe Froid Toiture', type: 'HVAC', status: 'OPERATIONAL', healthScore: 92 },
    { id: '2', assetTag: 'ELEV-02', name: 'Ascenseur Sud', type: 'ELEVATOR', status: 'BROKEN', healthScore: 14, predictedFailureDate: new Date() },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [assigningAsset, setAssigningAsset] = useState<any>(null);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-950 to-slate-900 text-white animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-400" /> CAFM — Assets & Équipements
          </h1>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvel équipement
        </button>
      </div>

      <AssetGrid assets={assets} environments={[]} users={[]} onEdit={() => setShowForm(true)} onAssign={(a: any) => setAssigningAsset(a)} />

      {showForm && <AssetFormModal onClose={() => setShowForm(false)} />}
      {assigningAsset && <AssetAssignmentModal asset={assigningAsset} users={[{id: '1', displayName: 'Marc Leblanc'}]} onClose={() => setAssigningAsset(null)} />}
    </div>
  );
}
INNER_EOF

# AssetGrid
cat << 'INNER_EOF' > src/components/admin/AssetGrid.tsx
import React from 'react';
import { Edit2, Link2, AlertTriangle } from 'lucide-react';

export function AssetGrid({ assets, onEdit, onAssign }: any) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {assets.map((asset: any) => (
        <div key={asset.id} className="bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-xl p-4 transition-all group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              <div>
                <div className="font-mono text-xs text-gray-500">{asset.assetTag}</div>
                <h3 className="font-semibold leading-tight text-white">{asset.name}</h3>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
              <button onClick={() => onAssign(asset)} className="p-1.5 hover:bg-gray-800 rounded text-white"><Link2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => onEdit(asset)} className="p-1.5 hover:bg-gray-800 rounded text-white"><Edit2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div className="text-xs text-gray-400 mb-2">Statut: {asset.status}</div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${asset.healthScore}%` }} />
            </div>
            <span className="text-xs font-mono text-white">{asset.healthScore}%</span>
          </div>
          {asset.predictedFailureDate && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 text-xs text-orange-300">
              <AlertTriangle className="w-3 h-3 inline mr-1" /> Prédiction IA de panne imminente
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
INNER_EOF

# AssetAssignmentModal
cat << 'INNER_EOF' > src/components/admin/AssetAssignmentModal.tsx
import React, { useState } from 'react';
import { X, HardHat, Wrench } from 'lucide-react';

export function AssetAssignmentModal({ asset, users, onClose }: any) {
  const [selectedUserId, setSelectedUserId] = useState('');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4 text-white">
      <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold flex items-center gap-2"><HardHat className="w-6 h-6 text-emerald-400" /> Assigner</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full px-3 py-2 bg-gray-800 rounded-lg">
            <option value="">Sélectionner un technicien</option>
            {users.map((u: any) => <option key={u.id} value={u.id}>{u.displayName}</option>)}
          </select>
          <button onClick={onClose} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold">Assigner</button>
        </div>
      </div>
    </div>
  );
}
INNER_EOF

