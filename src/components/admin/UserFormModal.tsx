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
