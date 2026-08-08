import React, { useState } from 'react';
import { Building2, Plus, TreePine } from 'lucide-react';
import { EnvironmentTree } from './EnvironmentTree';
import { EnvironmentFormModal } from './EnvironmentFormModal';

export function EnvironmentsPage() {
  const [environments, setEnvironments] = useState<any[]>([
    { id: '1', code: 'HQ', name: 'Paris HQ', type: 'BUILDING', status: 'NORMAL', healthScore: 100 },
    { id: '2', code: 'HQ-F1', name: 'Étage 1', type: 'FLOOR', parentId: '1', status: 'NORMAL', healthScore: 100 },
    { id: '3', code: 'HQ-R101', name: 'Salle Réunion B', type: 'ROOM', parentId: '2', status: 'NORMAL', healthScore: 100 },
  ]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-950 to-slate-900 text-white animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="w-8 h-8 text-cyan-400" /> Environnements
          </h1>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvel environnement
        </button>
      </div>

      <div className="bg-gray-900/30 backdrop-blur rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TreePine className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold">Arborescence</h2>
        </div>
        <EnvironmentTree environments={environments} onEdit={() => setShowModal(true)} onAddChild={() => setShowModal(true)} />
      </div>

      {showModal && <EnvironmentFormModal environments={environments} onSubmit={() => setShowModal(false)} onClose={() => setShowModal(false)} />}
    </div>
  );
}
