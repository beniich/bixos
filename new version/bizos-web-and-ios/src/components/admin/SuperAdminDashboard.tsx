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
