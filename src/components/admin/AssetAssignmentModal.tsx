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
