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
