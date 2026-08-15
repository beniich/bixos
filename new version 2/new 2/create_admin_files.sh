mkdir -p src/components/admin
mkdir -p src/hooks

# useAuth
cat << 'INNER_EOF' > src/hooks/useAuth.ts
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<{ id: string, name: string, orgId: string, role: string, email: string } | null>({
    id: 'user-1',
    name: 'Admin BizOS',
    orgId: 'org-1',
    role: 'SUPER_ADMIN',
    email: 'admin@bizos.com'
  });

  return { user };
}
INNER_EOF

# useToast
cat << 'INNER_EOF' > src/hooks/useToast.ts
export const toast = {
  success: (msg: string) => console.log('Toast success:', msg),
  error: (msg: string) => console.log('Toast error:', msg),
  warning: (msg: string) => console.log('Toast warning:', msg),
  info: (msg: string) => console.log('Toast info:', msg),
};

export function useToast() {
  return { toast };
}
INNER_EOF

# UserFilterBar
cat << 'INNER_EOF' > src/components/admin/UserFilterBar.tsx
import React from 'react';

export function UserFilterBar({ filter, onChange, users }: any) {
  return (
    <div className="flex gap-2 mb-4 bg-gray-900/50 p-2 rounded-xl border border-gray-800">
      <input
        type="text"
        placeholder="Rechercher un utilisateur..."
        className="px-3 py-2 bg-gray-800 rounded-lg text-sm flex-1 outline-none focus:ring-1 focus:ring-violet-500 text-white"
        value={filter.search}
        onChange={(e) => onChange({ ...filter, search: e.target.value })}
      />
      <select 
        value={filter.status}
        onChange={(e) => onChange({ ...filter, status: e.target.value })}
        className="px-3 py-2 bg-gray-800 rounded-lg text-sm text-white"
      >
        <option value="">Tous les statuts</option>
        <option value="ACTIVE">Actif</option>
        <option value="INACTIVE">Inactif</option>
        <option value="PENDING_INVITATION">En attente</option>
      </select>
    </div>
  );
}
INNER_EOF

# EnvironmentFormModal
cat << 'INNER_EOF' > src/components/admin/EnvironmentFormModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

export function EnvironmentFormModal({ environment, parentId, environments, onSubmit, onClose }: any) {
  const [formData, setFormData] = useState({
    code: environment?.code || '',
    name: environment?.name || '',
    type: environment?.type || 'BUILDING',
    parentId: parentId || environment?.parentId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4 text-white">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-lg w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">{environment ? 'Modifier Environnement' : 'Nouvel Environnement'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Code</label>
            <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 bg-gray-800 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-gray-800 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 bg-gray-800 rounded-lg">
              <option value="BUILDING">Bâtiment</option>
              <option value="FLOOR">Étage</option>
              <option value="ROOM">Salle</option>
              <option value="TECHNICAL_ROOM">Local technique</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold">Enregistrer</button>
        </form>
      </div>
    </div>
  );
}
INNER_EOF

# AssetFormModal
cat << 'INNER_EOF' > src/components/admin/AssetFormModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

export function AssetFormModal({ asset, environments, onClose }: any) {
  const [formData, setFormData] = useState({
    name: asset?.name || '',
    assetTag: asset?.assetTag || '',
    type: asset?.type || 'HVAC',
    environmentId: asset?.environmentId || '',
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center p-4 text-white">
      <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">{asset ? 'Modifier Asset' : 'Nouvel Asset'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tag (ID)</label>
            <input type="text" value={formData.assetTag} onChange={e => setFormData({...formData, assetTag: e.target.value})} className="w-full px-3 py-2 bg-gray-800 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-gray-800 rounded-lg" required />
          </div>
          <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold">Enregistrer (Mock)</button>
        </form>
      </div>
    </div>
  );
}
INNER_EOF
