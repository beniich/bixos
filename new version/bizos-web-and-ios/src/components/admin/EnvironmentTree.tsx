import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2 } from 'lucide-react';

const TYPE_ICONS: Record<string, string> = { BUILDING: '🏢', FLOOR: '🏬', ROOM: '🚪', TECHNICAL_ROOM: '⚡' };

export function EnvironmentTree({ environments, onEdit, onAddChild }: any) {
  const roots = environments.filter((e: any) => !e.parentId);
  return (
    <div className="space-y-1">
      {roots.map((env: any) => <TreeNode key={env.id} env={env} allEnvs={environments} level={0} onEdit={onEdit} onAddChild={onAddChild} />)}
    </div>
  );
}

function TreeNode({ env, allEnvs, level, onEdit, onAddChild }: any) {
  const [expanded, setExpanded] = useState(true);
  const children = allEnvs.filter((e: any) => e.parentId === env.id);

  return (
    <div>
      <div className="flex items-center gap-2 p-2 hover:bg-gray-800/50 rounded-lg group" style={{ paddingLeft: `${level * 24 + 8}px` }}>
        <button onClick={() => setExpanded(!expanded)} className="w-5 h-5 flex items-center justify-center" disabled={!children.length}>
          {children.length > 0 ? (expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : null}
        </button>
        <span className="text-lg">{TYPE_ICONS[env.type] ?? '📍'}</span>
        <span className="font-mono text-xs text-gray-500">{env.code}</span>
        <span className="font-semibold text-white">{env.name}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button onClick={() => onAddChild(env.id)} className="p-1.5 hover:bg-gray-700 rounded"><Plus className="w-3.5 h-3.5" /></button>
          <button onClick={() => onEdit(env)} className="p-1.5 hover:bg-gray-700 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {expanded && children.map((child: any) => <TreeNode key={child.id} env={child} allEnvs={allEnvs} level={level + 1} onEdit={onEdit} onAddChild={onAddChild} />)}
    </div>
  );
}
