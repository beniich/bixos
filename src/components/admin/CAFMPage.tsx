import React, { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { AssetGrid } from './AssetGrid';
import { AssetFormModal } from './AssetFormModal';
import { AssetAssignmentModal } from './AssetAssignmentModal';

export function CAFMPage() {
  const [assets, setAssets] = useState<any[]>([
    { id: '1', assetTag: 'HVAC-01', name: 'Groupe Froid Toiture', type: 'HVAC', status: 'OPERATIONAL', healthScore: 92 },
    { id: '2', assetTag: 'ELEV-02', name: 'Ascenseur Sud', type: 'ELEVATOR', status: 'BROKEN', healthScore: 14, predictedFailureDate: new Date() },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [assigningAsset, setAssigningAsset] = useState<any>(null);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-950 to-slate-900 text-white animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-400" /> CAFM — Assets & Équipements
          </h1>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvel équipement
        </button>
      </div>

      <AssetGrid assets={assets} environments={[]} users={[]} onEdit={() => setShowForm(true)} onAssign={(a: any) => setAssigningAsset(a)} />

      {showForm && <AssetFormModal onClose={() => setShowForm(false)} />}
      {assigningAsset && <AssetAssignmentModal asset={assigningAsset} users={[{id: '1', displayName: 'Marc Leblanc'}]} onClose={() => setAssigningAsset(null)} />}
    </div>
  );
}
