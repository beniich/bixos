import React, { useState, useEffect } from 'react';
import { PageId, Language, LicenseKey, LicensePlan, LicenseStatus, LicenseStats } from '../../types';
import { LicenseStore } from '../../services/licenseStore';
import {
  Key,
  Plus,
  Search,
  Download,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  RefreshCw,
  X,
  Check,
  Shield,
  Layers,
  Sparkles,
  Users,
  HardDrive,
  Calendar,
  AlertTriangle,
  Info,
  SlidersHorizontal,
} from 'lucide-react';

interface LicensesAdminPageProps {
  onNavigate: (page: PageId) => void;
  language?: Language;
}

const STATUS_CONFIG: Record<
  LicenseStatus,
  { label: Record<string, string>; color: string; icon: React.FC<{ className?: string }> }
> = {
  AVAILABLE: {
    label: { FR: 'Disponible', EN: 'Available', DE: 'Verfügbar', ES: 'Disponible' },
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: CheckCircle2,
  },
  USED: {
    label: { FR: 'Utilisée', EN: 'Used', DE: 'Verwendet', ES: 'Usada' },
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    icon: Key,
  },
  EXPIRED: {
    label: { FR: 'Expirée', EN: 'Expired', DE: 'Abgelaufen', ES: 'Expirada' },
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: Clock,
  },
  REVOKED: {
    label: { FR: 'Révoquée', EN: 'Revoked', DE: 'Widerrufen', ES: 'Revocada' },
    color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    icon: Ban,
  },
};

const PLAN_BADGES: Record<LicensePlan, { name: string; style: string }> = {
  FREE: { name: 'FREE', style: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
  PRO: { name: 'PRO', style: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  ENTERPRISE: { name: 'ENTERPRISE', style: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
};

export const LicensesAdminPage: React.FC<LicensesAdminPageProps> = ({ onNavigate, language = 'FR' }) => {
  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('cafm_admin_authenticated') === 'true';
  });
  const [adminEmailInput, setAdminEmailInput] = useState('tarikbenaich@gmail.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  const [licenses, setLicenses] = useState<LicenseKey[]>([]);
  const [stats, setStats] = useState<LicenseStats>({
    total: 0,
    available: 0,
    used: 0,
    revoked: 0,
    expired: 0,
    byPlan: { FREE: 0, PRO: 0, ENTERPRISE: 0 },
  });

  const [filters, setFilters] = useState<{ status: string; plan: string; search: string }>({
    status: '',
    plan: '',
    search: '',
  });

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Key Validation Test Widget State
  const [testKeyInput, setTestKeyInput] = useState('');
  const [testResult, setTestResult] = useState<{ valid: boolean; reason?: string; license?: LicenseKey } | null>(null);

  const loadData = () => {
    const list = LicenseStore.list(filters);
    const currentStats = LicenseStore.getStats();
    setLicenses(list);
    setStats(currentStats);
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadData();
    }
  }, [filters, isAdminAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);

    const emailTrimmed = adminEmailInput.trim().toLowerCase();
    const passTrimmed = adminPasswordInput.trim();

    if (emailTrimmed === 'tarikbenaich@gmail.com' && passTrimmed === '0000_-tr') {
      sessionStorage.setItem('cafm_admin_authenticated', 'true');
      setIsAdminAuthenticated(true);
      showToast('Authentification Administrateur Réussie');
    } else {
      setAdminAuthError('Identifiants administrateur incorrects. Accès refusé.');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('cafm_admin_authenticated');
    setIsAdminAuthenticated(false);
    setAdminPasswordInput('');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast(`Clé copiée dans le presse-papier: ${key}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRevoke = (id: string) => {
    const reason = prompt('Raison de la révocation de cette licence :');
    if (!reason) return;
    const revoked = LicenseStore.revoke(id, reason);
    if (revoked) {
      showToast('Licence révoquée avec succès');
      loadData();
    }
  };

  const handleExportCSV = () => {
    const csvContent = LicenseStore.exportCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cafm-pro-licenses-stock-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export CSV téléchargé');
  };

  const handleResetStock = () => {
    if (confirm('Réinitialiser le stock aux 20 licences de démonstration initiales ?')) {
      LicenseStore.resetToSeed();
      loadData();
      showToast('Stock réinitialisé à 20 licences');
    }
  };

  const handleTestKeyValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testKeyInput) return;
    const res = LicenseStore.validateKey(testKeyInput);
    setTestResult(res);
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 animate-fade-in">
        <div className="glass-card-purple outer-frame rounded-3xl p-8 border border-orange-500/30 shadow-2xl space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto glow-orange-sm">
            <Shield className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-mono font-bold tracking-wider mb-2">
              PORTAIL SUPER ADMIN RESTREINT
            </div>
            <h1 className="text-2xl font-extrabold text-white">Accès Stock Licences</h1>
            <p className="text-xs text-gray-300 mt-1">
              Connectez-vous avec vos identifiants administrateur du site pour gérer le stock de licences pré-générées.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-300 font-bold mb-1">
                Utilisateur / Email Admin
              </label>
              <input
                type="email"
                required
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="tarikbenaich@gmail.com"
                className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-gray-300 font-bold mb-1">
                Mot de Passe Admin
              </label>
              <input
                type="password"
                required
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            {adminAuthError && (
              <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{adminAuthError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl btn-gradient-orange text-white text-xs font-bold glow-orange hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>Accéder au Stock Administrateur</span>
            </button>
          </form>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-gray-400 space-y-1 font-mono">
            <div className="text-gray-300 font-bold">Accès autorisé :</div>
            <div>User: <span className="text-orange-400">tarikbenaich@gmail.com</span></div>
            <div>Passe: <span className="text-orange-400">0000_-tr</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-card-purple border border-orange-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="glass-card-purple outer-frame rounded-3xl p-8 border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-orange-500/30 text-xs font-mono text-orange-400">
                <Key className="w-3.5 h-3.5 text-orange-400" />
                <span>SUPER ADMIN PORTAL & STOCK CONTROL</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Connecté: tarikbenaich@gmail.com</span>
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Tableau de Licences Prêtes
            </h1>
            <p className="text-sm sm:text-base text-gray-300 font-light mt-2 max-w-2xl">
              Gestion du stock de clés de licence pré-générées à usage unique. Visualisez la disponibilité, générez des lots de clés et distribuez-les aux entreprises.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAdminLogout}
              className="glass-card hover:bg-rose-500/20 text-rose-300 px-4 py-3 rounded-2xl text-xs font-semibold transition-all border border-rose-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="glass-card hover:bg-white/10 text-white px-5 py-3 rounded-2xl text-xs font-semibold transition-all border border-white/15 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Exporter CSV</span>
            </button>

            <button
              onClick={() => setShowGenerateModal(true)}
              className="btn-gradient-orange text-white px-6 py-3 rounded-2xl text-xs font-bold glow-orange hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Générer des licences</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stock disponible */}
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-emerald-400 font-bold">Stock Disponible</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{stats.available}</div>
          <p className="text-xs text-gray-400 mt-1">Prêtes à être consommées</p>
        </div>

        {/* Utilisées */}
        <div className="glass-card p-6 rounded-2xl border border-blue-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-blue-400 font-bold">Utilisées</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Key className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{stats.used}</div>
          <p className="text-xs text-gray-400 mt-1">Attribuées à des comptes actifs</p>
        </div>

        {/* Révoquées */}
        <div className="glass-card p-6 rounded-2xl border border-rose-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-rose-400 font-bold">Révoquées</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Ban className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{stats.revoked}</div>
          <p className="text-xs text-gray-400 mt-1">Accès ou clé désactivée</p>
        </div>

        {/* Total Générées */}
        <div className="glass-card p-6 rounded-2xl border border-purple-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-purple-300 font-bold">Total Stock</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{stats.total}</div>
          <p className="text-xs text-gray-400 mt-1">PRO ({stats.byPlan.PRO}) • ENT ({stats.byPlan.ENTERPRISE})</p>
        </div>

      </div>

      {/* Live Key Validation Sandbox Widget */}
      <div className="glass-card-purple p-6 rounded-3xl border border-orange-500/30 space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-orange-400" />
          <div>
            <h3 className="text-base font-bold text-white">Tester / Valider une Clé de Licence</h3>
            <p className="text-xs text-gray-400">Simule la vérification qu'effectue le formulaire d'inscription en temps réel.</p>
          </div>
        </div>

        <form onSubmit={handleTestKeyValidation} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ex: CAFM-PRO-9821-44B1-8890-C102"
            value={testKeyInput}
            onChange={(e) => setTestKeyInput(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 font-mono"
          />
          <button
            type="submit"
            className="btn-gradient-orange text-white px-6 py-3 rounded-2xl text-xs font-bold glow-orange hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Vérifier</span>
          </button>
        </form>

        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
              testResult.valid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.valid ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold text-sm">
                {testResult.valid ? '✅ Clé Valide et Prête pour Inscription' : `❌ Clé Invalide : ${testResult.reason}`}
              </div>
              {testResult.license && (
                <div className="font-mono text-[11px] text-gray-300 space-y-0.5">
                  <div>Plan: <span className="text-orange-400 font-bold">{testResult.license.plan}</span></div>
                  <div>Max Utilisateurs: {testResult.license.maxUsers} • Max Équipements: {testResult.license.maxAssets}</div>
                  <div>Statut actuel: <span className="uppercase font-bold">{testResult.license.status}</span></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher clé, email, entreprise..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-orange-500"
          >
            <option value="">Tous les Statuts</option>
            <option value="AVAILABLE">Disponible ({stats.available})</option>
            <option value="USED">Utilisée ({stats.used})</option>
            <option value="EXPIRED">Expirée ({stats.expired})</option>
            <option value="REVOKED">Révoquée ({stats.revoked})</option>
          </select>

          {/* Plan Filter */}
          <select
            value={filters.plan}
            onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-orange-500"
          >
            <option value="">Tous les Plans</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={loadData}
            className="p-2 glass-card rounded-xl text-gray-300 hover:text-orange-400 hover:border-orange-500/40 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetStock}
            className="text-[11px] font-mono text-gray-400 hover:text-orange-400 underline px-2 cursor-pointer"
            title="Réinitialiser le stock d'exemple"
          >
            Réinitialiser Stock Initial (20)
          </button>
        </div>

      </div>

      {/* Main License Inventory Table */}
      <div className="glass-card-purple rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] font-mono uppercase tracking-wider text-gray-400">
                <th className="py-4 px-6">Clé de Licence</th>
                <th className="py-4 px-4">Plan</th>
                <th className="py-4 px-4">Statut</th>
                <th className="py-4 px-6">Utilisée par / Organisation</th>
                <th className="py-4 px-4">Générée le</th>
                <th className="py-4 px-4">Expire le</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400 space-y-3">
                    <Key className="w-12 h-12 mx-auto text-gray-600 opacity-40" />
                    <p className="text-base font-semibold text-gray-300">Aucune licence ne correspond aux filtres</p>
                    <p className="text-xs text-gray-500">Générez de nouvelles licences ou modifiez vos critères de recherche.</p>
                  </td>
                </tr>
              ) : (
                licenses.map((license) => {
                  const statusConf = STATUS_CONFIG[license.status];
                  const StatusIcon = statusConf.icon;
                  const planBadge = PLAN_BADGES[license.plan];

                  return (
                    <tr key={license.id} className="hover:bg-white/5 transition-colors group">
                      
                      {/* Key Code + Copy */}
                      <td className="py-4 px-6 font-mono font-bold">
                        <div className="flex items-center gap-2">
                          <span className="bg-black/50 border border-white/15 px-3 py-1.5 rounded-xl text-white tracking-wider text-xs">
                            {license.key}
                          </span>
                          <button
                            onClick={() => handleCopy(license.key)}
                            className="p-1.5 glass-card rounded-lg text-gray-400 hover:text-orange-400 hover:border-orange-500/40 transition-colors cursor-pointer"
                            title="Copier la clé"
                          >
                            {copiedKey === license.key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider ${planBadge.style}`}>
                          {planBadge.name}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${statusConf.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusConf.label[language] || statusConf.label['FR']}</span>
                        </span>
                      </td>

                      {/* Used By Info */}
                      <td className="py-4 px-6 text-gray-300">
                        {license.usedByEmail ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-white">{license.usedByName || 'Utilisateur'}</div>
                            <div className="text-[11px] text-gray-400 font-mono">{license.usedByEmail}</div>
                            {license.usedByOrgName && (
                              <div className="text-[10px] text-orange-400 font-mono">🏢 {license.usedByOrgName}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 font-mono italic">— Libre</span>
                        )}
                      </td>

                      {/* Generated Date */}
                      <td className="py-4 px-4 text-gray-400 font-mono text-[11px]">
                        {new Date(license.generatedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Expires Date */}
                      <td className="py-4 px-4 text-gray-400 font-mono text-[11px]">
                        {license.expiresAt ? (
                          new Date(license.expiresAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        ) : (
                          'Permanent'
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {license.status === 'AVAILABLE' && (
                          <button
                            onClick={() => handleRevoke(license.id)}
                            className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl glass-card border border-rose-500/30 hover:bg-rose-500/20 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Révoquer</span>
                          </button>
                        )}
                        {license.status === 'REVOKED' && (
                          <span className="text-[10px] text-rose-400/70 font-mono italic">
                            {license.revokedReason || 'Révoquée'}
                          </span>
                        )}
                        {license.status === 'USED' && (
                          <span className="text-[10px] text-blue-400/80 font-mono">Actif</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch License Generation Modal */}
      {showGenerateModal && (
        <GenerateModal
          onClose={() => setShowGenerateModal(false)}
          onSuccess={() => {
            setShowGenerateModal(false);
            loadData();
            showToast('Nouveau lot de licences généré !');
          }}
        />
      )}

    </div>
  );
};

// Internal Subcomponent: Generate Batch Modal
interface GenerateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const GenerateModal: React.FC<GenerateModalProps> = ({ onClose, onSuccess }) => {
  const [plan, setPlan] = useState<LicensePlan>('PRO');
  const [quantity, setQuantity] = useState<number>(20);
  const [durationDays, setDurationDays] = useState<number>(365);
  const [maxUsers, setMaxUsers] = useState<number>(25);
  const [maxAssets, setMaxAssets] = useState<number>(1000);
  const [notes, setNotes] = useState<string>('Lot pré-généré pour partenaires & abonnements Q1');
  const [generatedBatch, setGeneratedBatch] = useState<LicenseKey[] | null>(null);
  const [copiedBatch, setCopiedBatch] = useState(false);

  // Auto update limits when plan changes
  useEffect(() => {
    if (plan === 'FREE') {
      setMaxUsers(1);
      setMaxAssets(50);
    } else if (plan === 'PRO') {
      setMaxUsers(25);
      setMaxAssets(1000);
    } else if (plan === 'ENTERPRISE') {
      setMaxUsers(999);
      setMaxAssets(99999);
    }
  }, [plan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = LicenseStore.generateBatch({
      plan,
      quantity,
      durationDays,
      maxUsers,
      maxAssets,
      notes,
      generatedBy: 'Super Admin Portal',
    });
    setGeneratedBatch(created);
  };

  const handleCopyAllBatch = () => {
    if (!generatedBatch) return;
    const allKeysText = generatedBatch.map((l) => l.key).join('\n');
    navigator.clipboard.writeText(allKeysText);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card-purple outer-frame rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-orange-500/30 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl btn-gradient-orange flex items-center justify-center text-white glow-orange-sm">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Générer un Lot de Licences</h2>
              <p className="text-xs text-gray-400">Créez des clés prêtes en stock à usage unique</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 glass-card rounded-xl text-gray-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!generatedBatch ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Select Plan */}
            <div>
              <label className="block text-xs font-mono uppercase text-gray-300 font-bold mb-2">
                Plan de la Licence
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['FREE', 'PRO', 'ENTERPRISE'] as LicensePlan[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlan(p)}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                      plan === p
                        ? 'bg-orange-500 text-white border-orange-400 glow-orange-sm'
                        : 'glass-card text-gray-300 hover:bg-white/5 border-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-300 font-bold mb-2">
                  Quantité de Clés (Stock)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-300 font-bold mb-2">
                  Durée de Validité (Jours)
                </label>
                <input
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 365)}
                  className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Limits maxUsers and maxAssets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-300 font-bold mb-2">
                  Limite Utilisateurs
                </label>
                <input
                  type="number"
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(parseInt(e.target.value) || 1)}
                  className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-300 font-bold mb-2">
                  Limite Équipements / Assets
                </label>
                <input
                  type="number"
                  value={maxAssets}
                  onChange={(e) => setMaxAssets(parseInt(e.target.value) || 10)}
                  className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-mono uppercase text-gray-300 font-bold mb-2">
                Notes d'attribution (Optionnel)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Lot pour clients partenaires entreprise Q1 2026"
                className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl glass-card text-xs font-semibold text-gray-300 hover:text-white cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-2xl btn-gradient-orange text-white text-xs font-bold glow-orange hover:scale-[1.02] cursor-pointer"
              >
                Générer {quantity} Clés {plan}
              </button>
            </div>

          </form>
        ) : (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
              <div className="text-base font-bold text-white">{generatedBatch.length} Licences Générées avec Succès !</div>
              <p className="text-xs text-emerald-300/80">Elles sont désormais enregistrées dans le stock en statut DISPONIBLE.</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-white/10 max-h-60 overflow-y-auto space-y-2">
              {generatedBatch.map((lic, idx) => (
                <div key={lic.id} className="flex items-center justify-between text-xs font-mono py-1.5 px-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-gray-400 w-6">{idx + 1}.</span>
                  <span className="text-orange-400 font-bold flex-1">{lic.key}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(lic.key)}
                    className="p-1 hover:text-white text-gray-400 cursor-pointer"
                    title="Copier"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopyAllBatch}
                className="flex-1 py-3 rounded-2xl glass-card border border-orange-500/40 text-orange-400 hover:bg-orange-500/20 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedBatch ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBatch ? 'Toutes les clés copiées !' : 'Tout Copier en Bloc'}</span>
              </button>

              <button
                onClick={onSuccess}
                className="flex-1 py-3 rounded-2xl btn-gradient-orange text-white text-xs font-bold glow-orange hover:scale-105 cursor-pointer"
              >
                Terminer & Fermer
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
