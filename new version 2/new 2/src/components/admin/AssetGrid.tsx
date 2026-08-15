import React from 'react';
import { Edit2, Link2, AlertTriangle } from 'lucide-react';

export function AssetGrid({ assets, onEdit, onAssign }: any) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {assets.map((asset: any) => (
        <div key={asset.id} className="bg-gray-900/50 hover:bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-xl p-4 transition-all group">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              <div>
                <div className="font-mono text-xs text-gray-500">{asset.assetTag}</div>
                <h3 className="font-semibold leading-tight text-white">{asset.name}</h3>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
              <button onClick={() => onAssign(asset)} className="p-1.5 hover:bg-gray-800 rounded text-white"><Link2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => onEdit(asset)} className="p-1.5 hover:bg-gray-800 rounded text-white"><Edit2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div className="text-xs text-gray-400 mb-2">Statut: {asset.status}</div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${asset.healthScore}%` }} />
            </div>
            <span className="text-xs font-mono text-white">{asset.healthScore}%</span>
          </div>
          {asset.predictedFailureDate && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 text-xs text-orange-300">
              <AlertTriangle className="w-3 h-3 inline mr-1" /> Prédiction IA de panne imminente
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
