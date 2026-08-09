import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { PageId } from '../../types';
import {
  Users, Building2, Package, FileText, AlertCircle, BarChart3,
  Settings, ChevronRight, Zap, UserPlus,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  setCurrentPage: (page: PageId) => void;
}

interface AdminCounts {
  users: number;
  environments: number;
  assets: number;
  claims: number;
  openClaims: number;
}

function AdminStatCard({
  icon: Icon, label, value, color, onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'violet' | 'cyan' | 'emerald' | 'orange' | 'red';
  onClick: () => void;
}) {
  const colors = {
    violet:  'from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400',
    cyan:    'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400',
    orange:  'from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400',
    red:     'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400',
  };
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 hover:scale-105 transition-all text-left w-full`}
    >
      <Icon className="w-8 h-8 mb-3" />
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </button>
  );
}

function ModuleCard({
  title, description, icon: Icon, color, stats, onClick,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  stats: Record<string, number | string>;
  onClick: () => void;
}) {
  const hoverColors: Record<string, string> = {
    violet:  'hover:border-violet-500/50 hover:bg-violet-500/5',
    cyan:    'hover:border-cyan-500/50 hover:bg-cyan-500/5',
    emerald: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
    orange:  'hover:border-orange-500/50 hover:bg-orange-500/5',
    pink:    'hover:border-pink-500/50 hover:bg-pink-500/5',
    gray:    'hover:border-gray-500/50 hover:bg-gray-500/5',
  };
  return (
    <button
      onClick={onClick}
      className={`bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 transition-all group ${hoverColors[color] ?? ''} text-left w-full`}
    >
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-10 h-10 text-gray-400 group-hover:text-violet-400 transition-colors" />
        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
      </div>
      <h3 className="text-lg font-bold mb-1 text-white">{title}</h3>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      {Object.keys(stats).length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(stats).slice(0, 3).map(([k, v]) => (
            <span key={k} className="px-2 py-0.5 bg-gray-800/50 rounded text-gray-400">
              <span className="text-gray-500">{k}:</span>{' '}
              <span className="font-mono text-gray-200">{v}</span>
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

export function SuperAdminDashboard({ setCurrentPage }: SuperAdminDashboardProps) {
  const { user, profile } = useAuth();
  const [counts, setCounts] = useState<AdminCounts>({
    users: 0, environments: 0, assets: 0, claims: 0, openClaims: 0,
  });
  const [usersByRole, setUsersByRole] = useState<Record<string, number>>({});
  const [assetsByStatus, setAssetsByStatus] = useState<Record<string, number>>({});

  const orgId = profile?.organizationId || user?.uid;

  useEffect(() => {
    if (!orgId) return;

    const unsubs: (() => void)[] = [];

    // Users — real-time
    unsubs.push(onSnapshot(
      collection(db, 'organizations', orgId, 'users'),
      snap => {
        const byRole: Record<string, number> = {};
        snap.docs.forEach(d => {
          const role = d.data().role as string;
          byRole[role] = (byRole[role] ?? 0) + 1;
        });
        setCounts(c => ({ ...c, users: snap.size }));
        setUsersByRole(byRole);
      }
    ));

    // Environments
    unsubs.push(onSnapshot(
      collection(db, 'organizations', orgId, 'environments'),
      snap => setCounts(c => ({ ...c, environments: snap.size }))
    ));

    // CAFM Assets
    unsubs.push(onSnapshot(
      collection(db, 'organizations', orgId, 'cafmAssets'),
      snap => {
        const byStatus: Record<string, number> = {};
        snap.docs.forEach(d => {
          const s = d.data().status as string;
          byStatus[s] = (byStatus[s] ?? 0) + 1;
        });
        setCounts(c => ({ ...c, assets: snap.size }));
        setAssetsByStatus(byStatus);
      }
    ));

    // Claims
    unsubs.push(onSnapshot(
      collection(db, 'organizations', orgId, 'claims'),
      snap => {
        const open = snap.docs.filter(d =>
          !['CLOSED', 'RESOLVED', 'CANCELLED'].includes(d.data().status)
        ).length;
        setCounts(c => ({ ...c, claims: snap.size, openClaims: open }));
      }
    ));

    return () => unsubs.forEach(u => u());
  }, [orgId]);

  // Guard : only Admins & Super Admins
  const allowedRoles = ['Admin', 'SUPER_ADMIN', 'ORG_MANAGER', 'SITE_ADMIN'];
  if (profile && !allowedRoles.includes(profile.role as string)) {
    return (
      <div className="p-12 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-400">Accès refusé</h2>
        <p className="text-gray-400 mt-2">Vous n'avez pas les droits pour accéder à ce panneau.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 text-white animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
          🎛️ Centre de Contrôle Admin
        </h1>
        <p className="text-gray-400 mt-2">
          Gérez tous les utilisateurs, environnements et actifs CAFM de votre organisation.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <AdminStatCard icon={Users}        label="Utilisateurs"    value={counts.users}        color="violet"  onClick={() => setCurrentPage('admin_users')} />
        <AdminStatCard icon={Building2}    label="Environnements"  value={counts.environments} color="cyan"    onClick={() => setCurrentPage('admin_environments')} />
        <AdminStatCard icon={Package}      label="Assets CAFM"     value={counts.assets}       color="emerald" onClick={() => setCurrentPage('admin_cafm')} />
        <AdminStatCard icon={FileText}     label="Réclamations"    value={counts.claims}       color="orange"  onClick={() => setCurrentPage('dashboard')} />
        <AdminStatCard icon={AlertCircle}  label="En cours"        value={counts.openClaims}   color="red"     onClick={() => setCurrentPage('dashboard')} />
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <ModuleCard
          title="👥 Utilisateurs & Rôles"
          description="Gérer Admins, Collaborateurs, Techniciens"
          icon={Users}
          color="violet"
          stats={Object.fromEntries(Object.entries(usersByRole).slice(0, 3))}
          onClick={() => setCurrentPage('admin_users')}
        />
        <ModuleCard
          title="🌍 Environnements"
          description="Sites, Bâtiments, Zones, Salles"
          icon={Building2}
          color="cyan"
          stats={{ total: counts.environments }}
          onClick={() => setCurrentPage('admin_environments')}
        />
        <ModuleCard
          title="🏢 CAFM Assets"
          description="Équipements, IoT, Maintenance"
          icon={Package}
          color="emerald"
          stats={Object.fromEntries(Object.entries(assetsByStatus).slice(0, 3))}
          onClick={() => setCurrentPage('admin_cafm')}
        />
        <ModuleCard
          title="📋 Réclamations"
          description="Suivi des pannes et interventions"
          icon={FileText}
          color="orange"
          stats={{ total: counts.claims, 'en cours': counts.openClaims }}
          onClick={() => setCurrentPage('dashboard')}
        />
        <ModuleCard
          title="📊 Analytics & Rapports"
          description="KPIs, rapports mensuels, audits"
          icon={BarChart3}
          color="pink"
          stats={{}}
          onClick={() => setCurrentPage('analytics')}
        />
        <ModuleCard
          title="⚙️ Configuration"
          description="Permissions, rôles, paramètres org."
          icon={Settings}
          color="gray"
          stats={{}}
          onClick={() => setCurrentPage('settings')}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" /> Actions Rapides
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '📨', label: 'Inviter un utilisateur', page: 'admin_users' as PageId },
            { icon: '🏗️', label: 'Créer un environnement', page: 'admin_environments' as PageId },
            { icon: '📦', label: 'Ajouter un asset CAFM',  page: 'admin_cafm' as PageId },
            { icon: '🔗', label: 'Gérer les assignations',  page: 'admin_users' as PageId },
          ].map(({ icon, label, page }) => (
            <button
              key={label}
              onClick={() => setCurrentPage(page)}
              className="bg-gray-900/50 border border-gray-800 hover:border-violet-500/50 hover:bg-violet-500/5 rounded-xl p-4 flex items-center gap-3 transition-all text-left"
            >
              <span className="text-2xl">{icon}</span>
              <span className="font-medium text-sm text-white">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
