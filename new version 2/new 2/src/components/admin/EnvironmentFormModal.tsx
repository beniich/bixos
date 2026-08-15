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
