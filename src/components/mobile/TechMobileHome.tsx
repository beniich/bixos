import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { 
  ClipboardList, MapPin, Camera, Wifi, WifiOff, Battery,
  Clock, CheckCircle2,
} from 'lucide-react';
import { PageId } from '../../types';

interface Props {
  onNavigate: (page: PageId, params?: Record<string, any>) => void;
}

export function TechMobileHome({ onNavigate }: Props) {
  const { user, profile } = useAuth();
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const orgId = profile?.organizationId;
  const uid = user?.uid;

  useEffect(() => {
    if (!uid || !orgId) return;
    const q = query(
      collection(db, 'organizations', orgId, 'claims'),
      where('assignedTechId', '==', uid),
      where('status', 'in', ['OPENED', 'DIAGNOSING', 'INTERVENING', 'AWAITING_PARTS']),
      orderBy('priority', 'desc'),
      orderBy('slaDueAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMyClaims(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error('[TechMobile] Firebase error:', err);
    });
    return () => unsub();
  }, [uid, orgId]);

  const stats = {
    total: myClaims.length,
    critical: myClaims.filter(c => c.priority === 'CRITICAL').length,
    overdue: myClaims.filter(c => c.slaDueAt && c.slaDueAt < Date.now()).length,
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-white font-sans">
      {/* Top bar */}
      <div className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-sm">
              {profile?.displayName?.charAt(0) || 'T'}
            </div>
            <span className="font-bold text-sm">Bonjour {profile?.displayName?.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            {online ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-orange-400 animate-pulse" />
            )}
            <button
              onClick={() => onNavigate('dashboard')} // Simule le scan / ou dashboard complet
              className="p-2 bg-violet-600 rounded-lg"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-4 grid grid-cols-3 gap-2">
        {[
          { label: 'Mes tâches', value: stats.total, color: 'violet' },
          { label: 'Critiques', value: stats.critical, color: 'red' },
          { label: 'En retard', value: stats.overdue, color: 'orange' },
        ].map(s => (
          <div key={s.label} className={`bg-${s.color}-500/10 border border-${s.color}-500/30 rounded-xl p-3 text-center`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Claims list */}
      <div className="px-4 space-y-3">
        <h2 className="font-bold flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-violet-400" /> 
          Interventions en cours
        </h2>
        
        {myClaims.length === 0 ? (
          <div className="bg-slate-900/30 rounded-xl p-8 text-center border border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2 opacity-50" />
            <p className="text-slate-400">Aucune tâche assignée</p>
          </div>
        ) : (
          myClaims.map(claim => (
            <button
              key={claim.id}
              onClick={() => onNavigate('tech_claim_detail' as PageId, { claimId: claim.id })}
              className="w-full bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-xl p-4 text-left transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{claim.title}</h3>
                <PriorityBadge priority={claim.priority} />
              </div>
              <p className="text-sm text-slate-400 line-clamp-2 mb-2">{claim.description}</p>
              <div className="flex items-center justify-between text-xs mt-3">
                <span className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {claim.siteName ?? claim.siteId ?? 'Site inconnu'}
                </span>
                <span className={isOverdue(claim) ? 'text-red-400 font-medium' : 'text-slate-400'}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatSLATime(claim)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 grid grid-cols-4 z-20">
        {[
          { id: 'tech_mobile_home', icon: ClipboardList, label: 'Tâches' },
          { id: 'dashboard', icon: Camera, label: 'Scan' },
          { id: 'tech_history', icon: Clock, label: 'Historique' },
          { id: 'settings', icon: Battery, label: 'Profil' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id as PageId)}
            className={`py-3 flex flex-col items-center gap-1 ${
              id === 'tech_mobile_home' ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { bg: string; label: string }> = {
    CRITICAL: { bg: 'bg-red-500/20 text-red-400 border border-red-500/50', label: 'CRITIQUE' },
    HIGH:     { bg: 'bg-orange-500/20 text-orange-400 border border-orange-500/50', label: 'HAUTE' },
    MEDIUM:   { bg: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50', label: 'MOY' },
    LOW:      { bg: 'bg-green-500/20 text-green-400 border border-green-500/50', label: 'BASSE' },
  };
  const c = config[priority] ?? config.MEDIUM;
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${c.bg}`}>{c.label}</span>;
}

function isOverdue(claim: any) {
  const due = claim.slaDueAt;
  return due && due < Date.now() && !['CLOSED', 'RESOLVED'].includes(claim.status);
}

function formatSLATime(claim: any) {
  const due = claim.slaDueAt;
  if (!due) return '—';
  const diff = due - Date.now();
  if (diff < 0) return `Retard ${Math.abs(Math.round(diff/60000))}m`;
  if (diff < 3600000) return `${Math.round(diff/60000)}m rest.`;
  return `${Math.round(diff/3600000)}h rest.`;
}
