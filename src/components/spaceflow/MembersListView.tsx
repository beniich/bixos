import React, { useState, useEffect } from 'react';
import { Member, MemberPlan, MemberStatus } from '../../types';
import { 
  Users, Search, Filter, Plus, Mail, CheckCircle2, AlertCircle, 
  Trash2, Edit3, Send, RefreshCw, X, Building, Phone
} from 'lucide-react';

interface MembersListViewProps {
  isDarkMode: boolean;
}

export const MembersListView: React.FC<MembersListViewProps> = ({ isDarkMode }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Modal create member state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState<MemberPlan>('HOT_DESK');
  const [newFee, setNewFee] = useState<number>(250);

  // Toast / notification
  const [actionMsg, setActionMsg] = useState('');

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200 shadow-sm';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const mainTitleText = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const valueText = isDarkMode ? 'text-slate-100' : 'text-slate-800';

  const fetchMembers = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedPlan !== 'ALL') params.append('plan', selectedPlan);
    if (selectedStatus !== 'ALL') params.append('status', selectedStatus);

    fetch(`/api/members?${params.toString()}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, [search, selectedPlan, selectedStatus]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newEmail) return;

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
          companyName: newCompany,
          phone: newPhone,
          plan: newPlan,
          monthlyFee: newFee,
        }),
      });

      if (res.ok) {
        setActionMsg(`Membre ${newFirstName} ${newLastName} créé avec succès !`);
        setShowAddModal(false);
        setNewFirstName('');
        setNewLastName('');
        setNewEmail('');
        setNewCompany('');
        setNewPhone('');
        fetchMembers();
        setTimeout(() => setActionMsg(''), 4000);
      }
    } catch {
      setActionMsg('Erreur lors de la création du membre.');
    }
  };

  const handleInviteMember = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/members/${id}/invite`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Invitation envoyée via l'API Gmail à ${name} !`);
        setTimeout(() => setActionMsg(''), 4000);
      }
    } catch {
      setActionMsg('Échec de l\'envoi de l\'invitation.');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce membre ?')) return;
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setActionMsg('Membre supprimé.');
        fetchMembers();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch {
      setActionMsg('Erreur de suppression.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black uppercase tracking-tight flex items-center gap-2.5 ${mainTitleText}`}>
            <Users className="w-6 h-6 text-orange-500" />
            <span>GESTION DES MEMBRES COWORKERS ({members.length})</span>
          </h2>
          <p className={`text-xs ${subText}`}>Annuaire centralisé des abonnés, suivi des plans et envoi d'invitations d'accès</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-extrabold flex items-center gap-2 shadow-md cursor-pointer hover:opacity-90 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>AJOUTER UN MEMBRE</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold text-center">
          {actionMsg}
        </div>
      )}

      {/* Filter Bar */}
      <div className={`${cardBg} p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4`}>
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, entreprise..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:border-orange-500 ${
              isDarkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Plan:</span>
          </div>
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className={`p-2 rounded-xl border text-xs font-bold focus:outline-none ${
              isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="ALL">Tous les plans</option>
            <option value="HOT_DESK">Hot Desk (€250)</option>
            <option value="DEDICATED">Bureau Dédié (€450)</option>
            <option value="PRIVATE_OFFICE">Bureau Privé (€1800)</option>
            <option value="DAY_PASS">Day Pass (€80)</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 ml-2">
            <span>Statut:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`p-2 rounded-xl border text-xs font-bold focus:outline-none ${
              isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="PENDING">En attente</option>
            <option value="EXPIRED">Expiré</option>
          </select>

          <button
            onClick={fetchMembers}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className={`${cardBg} rounded-2xl border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                <th className="py-3 px-4">MEMBRE</th>
                <th className="py-3 px-4">ENTREPRISE</th>
                <th className="py-3 px-4">PLAN ABONNEMENT</th>
                <th className="py-3 px-4">STATUT</th>
                <th className="py-3 px-4">COTISATION</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-bold">
                    Aucun membre trouvé correspondant à vos critères.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={m.firstName}
                          className="w-9 h-9 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <div className={`font-bold ${valueText}`}>{m.firstName} {m.lastName}</div>
                          <div className={`text-[11px] font-mono ${subText}`}>{m.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className={`font-medium ${valueText}`}>{m.companyName || 'Indépendant'}</div>
                      <div className={`text-[10px] font-mono ${subText}`}>{m.phone || 'N/A'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide ${
                        m.plan === 'PRIVATE_OFFICE' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        m.plan === 'DEDICATED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        m.plan === 'HOT_DESK' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                      }`}>
                        {m.plan}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5 w-fit ${
                        m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        m.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span>{m.status}</span>
                      </span>
                    </td>

                    <td className={`py-3 px-4 font-mono font-bold ${valueText}`}>
                      €{m.monthlyFee} / mois
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleInviteMember(m.id, `${m.firstName} ${m.lastName}`)}
                          className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
                          title="Envoyer invitation par Gmail API"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Member */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${cardBg} w-full max-w-md p-6 rounded-2xl border space-y-4 shadow-2xl`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black uppercase text-orange-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>INSCRIRE UN NOUVEAU MEMBRE</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${subText}`}>Prénom</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Jean"
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                  />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${subText}`}>Nom</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Dupont"
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${subText}`}>Email Professionnel</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="jean.dupont@entreprise.fr"
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${subText}`}>Entreprise / Société</label>
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Tech Corp"
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                  />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${subText}`}>Téléphone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${subText}`}>Formule Abonnement</label>
                  <select
                    value={newPlan}
                    onChange={(e) => {
                      const p = e.target.value as MemberPlan;
                      setNewPlan(p);
                      if (p === 'DEDICATED') setNewFee(450);
                      else if (p === 'PRIVATE_OFFICE') setNewFee(1800);
                      else if (p === 'DAY_PASS') setNewFee(80);
                      else setNewFee(250);
                    }}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                  >
                    <option value="HOT_DESK">Hot Desk (€250)</option>
                    <option value="DEDICATED">Bureau Dédié (€450)</option>
                    <option value="PRIVATE_OFFICE">Bureau Privé (€1800)</option>
                    <option value="DAY_PASS">Day Pass (€80)</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${subText}`}>Cotisation (€ / mois)</label>
                  <input
                    type="number"
                    value={newFee}
                    onChange={(e) => setNewFee(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500 font-mono`}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 font-bold hover:bg-white/20 transition-all cursor-pointer"
                >
                  ANNULER
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-gradient-orange text-white font-extrabold hover:opacity-90 transition-all cursor-pointer shadow-md"
                >
                  ENREGISTRER LE MEMBRE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
