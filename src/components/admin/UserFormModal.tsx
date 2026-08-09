import React from 'react';
import { X, Mail, User, Briefcase, Phone, Building2 } from 'lucide-react';
import { UserRole, ROLE_CONFIG, Environment } from '../../types/database';

const ROLES: UserRole[] = [
  'SUPER_ADMIN', 'ORG_MANAGER', 'SITE_ADMIN', 'CAFM_MANAGER',
  'COLLABORATOR', 'TECHNICIAN', 'AUDITOR', 'CLIENT_VIEWER',
];

const SKILL_OPTIONS = [
  'HVAC', 'Électricité HT/BT', 'Plomberie', 'Réseau informatique',
  'Cybersécurité', 'Mécanique', 'Automatisme', 'CVC', 'SSI',
  'Groupe électrogène', 'Onduleurs', 'Climatisation industrielle',
];

interface UserFormModalProps {
  mode: 'invite' | 'edit';
  user?: any;
  environments: Environment[];
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  mode, user, environments, onSubmit, onClose,
}) => {
  const [formData, setFormData] = React.useState({
    email: user?.email ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    displayName: user?.displayName ?? '',
    role: (user?.role ?? 'COLLABORATOR') as UserRole,
    jobTitle: user?.jobTitle ?? '',
    department: user?.department ?? '',
    phone: user?.phone ?? '',
    skills: (user?.skills ?? []) as string[],
    environmentIds: [] as string[],
    status: user?.status ?? 'PENDING_INVITATION',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'identity' | 'role' | 'environments' | 'skills'>('identity');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const finalData = {
        ...formData,
        displayName: formData.displayName || `${formData.firstName} ${formData.lastName}`.trim() || formData.email,
      };
      await onSubmit(finalData);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill],
    }));
  };

  const toggleEnv = (envId: string) => {
    setFormData(f => ({
      ...f,
      environmentIds: f.environmentIds.includes(envId) ? f.environmentIds.filter(e => e !== envId) : [...f.environmentIds, envId],
    }));
  };

  const tabs = [
    { id: 'identity', label: '👤 Identité' },
    { id: 'role', label: '🛡️ Rôle' },
    { id: 'environments', label: '🌍 Environnements' },
    { id: 'skills', label: '🔧 Compétences' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'invite' ? '📨 Inviter un utilisateur' : '✏️ Modifier l\'utilisateur'}
            </h2>
            {mode === 'edit' && <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-violet-400 border-b-2 border-violet-400 bg-violet-500/5'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {activeTab === 'identity' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                        placeholder="Prénom" value={formData.firstName}
                        onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nom</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                      placeholder="Nom de famille" value={formData.lastName}
                      onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input required type="email" disabled={mode === 'edit'}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                      placeholder="email@entreprise.com" value={formData.email}
                      onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Fonction</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                        placeholder="Responsable Technique" value={formData.jobTitle}
                        onChange={e => setFormData(f => ({ ...f, jobTitle: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Département</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                      placeholder="Maintenance / GMAO" value={formData.department}
                      onChange={e => setFormData(f => ({ ...f, department: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                      placeholder="+33 6 00 00 00 00" value={formData.phone}
                      onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                {mode === 'edit' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Statut</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-violet-500"
                      value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}>
                      <option value="ACTIVE">✅ Actif</option>
                      <option value="INACTIVE">⏸️ Inactif</option>
                      <option value="SUSPENDED">🚫 Suspendu</option>
                      <option value="PENDING_INVITATION">📧 Invitation en attente</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'role' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-4">Le rôle définit les permissions globales dans l'organisation.</p>
                {ROLES.map(role => {
                  const config = ROLE_CONFIG[role];
                  const isSelected = formData.role === role;
                  return (
                    <button key={role} type="button" onClick={() => setFormData(f => ({ ...f, role }))}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        isSelected ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500' : 'border-white/10 hover:border-white/20'
                      }`}>
                      <span className="text-2xl">{config.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-white">{config.label}</div>
                        <div className="text-sm text-gray-400">{config.description}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-600'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'environments' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-4">Sélectionnez les sites/zones accessibles par cet utilisateur.</p>
                {environments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Aucun environnement créé</p>
                  </div>
                ) : environments.map(env => {
                  const isSelected = formData.environmentIds.includes(env.id);
                  return (
                    <button key={env.id} type="button" onClick={() => toggleEnv(env.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${isSelected ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 hover:border-white/20'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-gray-600'}`}>
                        {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{env.name}</div>
                        <div className="text-xs text-gray-500">{env.type} · {env.code}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-4">Compétences techniques pour l'assignation automatique des interventions.</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(skill => {
                    const isSelected = formData.skills.includes(skill);
                    return (
                      <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                          isSelected ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        }`}>
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 rounded-lg font-semibold text-white transition-all">
              {submitting ? '⏳ En cours...' : mode === 'invite' ? '📨 Envoyer l\'invitation' : '✅ Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
