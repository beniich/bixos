import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  ArrowLeft, Clock, MapPin, Wrench, Camera, CheckCircle2,
  AlertTriangle, Loader2, Play, Check, ChevronRight, User,
} from 'lucide-react';
import { PageId } from '../../types';

interface Props {
  claimId: string;
  onNavigate: (page: PageId) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPENED:          { label: 'Ouvert',            color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  DIAGNOSING:      { label: 'Diagnostic',         color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  INTERVENING:     { label: 'Intervention',       color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  AWAITING_PARTS:  { label: 'Att. pièces',        color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  RESOLVED:        { label: 'Résolu',             color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  CLOSED:          { label: 'Clôturé',            color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' },
};

const NEXT_STATUS: Record<string, string> = {
  OPENED:          'DIAGNOSING',
  DIAGNOSING:      'INTERVENING',
  INTERVENING:     'RESOLVED',
  AWAITING_PARTS:  'INTERVENING',
};

const NEXT_LABEL: Record<string, string> = {
  OPENED:          'Commencer le diagnostic',
  DIAGNOSING:      'Démarrer l\'intervention',
  INTERVENING:     'Marquer comme résolu',
  AWAITING_PARTS:  'Reprendre l\'intervention',
};

export function TechClaimDetail({ claimId, onNavigate }: Props) {
  const { profile } = useAuth();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'actions' | 'history'>('details');

  const orgId = profile?.organizationId;

  useEffect(() => {
    if (!orgId || !claimId) return;
    const unsub = onSnapshot(
      doc(db, 'organizations', orgId, 'claims', claimId),
      (snap) => {
        if (snap.exists()) {
          setClaim({ id: snap.id, ...snap.data() });
        }
        setLoading(false);
      }
    );
    return () => unsub();
  }, [orgId, claimId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!orgId || !claimId || updating) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'organizations', orgId, 'claims', claimId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === 'RESOLVED' ? { resolvedAt: serverTimestamp() } : {}),
      });
    } catch (err) {
      console.error('[TechClaimDetail] Update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!orgId || !claimId || !note.trim()) return;
    setUpdating(true);
    try {
      const commentsRef = doc(db, 'organizations', orgId, 'claims', claimId);
      await updateDoc(commentsRef, {
        techNotes: [...(claim.techNotes || []), {
          text: note.trim(),
          by: profile?.displayName,
          at: Date.now(),
        }],
        updatedAt: serverTimestamp(),
      });
      setNote('');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <AlertTriangle className="w-12 h-12 text-orange-400" />
        <p className="text-gray-400">Intervention introuvable</p>
        <button
          onClick={() => onNavigate('tech_mobile_home' as PageId)}
          className="px-4 py-2 bg-violet-600 rounded-lg"
        >
          Retour
        </button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[claim.status] ?? STATUS_CONFIG.OPENED;
  const nextStatus = NEXT_STATUS[claim.status];
  const nextLabel = NEXT_LABEL[claim.status];
  const isResolved = ['RESOLVED', 'CLOSED'].includes(claim.status);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => onNavigate('tech_mobile_home' as PageId)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm truncate">{claim.title}</h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          {(['details', 'actions', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-violet-500 text-violet-400'
                  : 'text-slate-500'
              }`}
            >
              {tab === 'details' ? 'Détails' : tab === 'actions' ? 'Actions' : 'Historique'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* ────── TAB DETAILS ────── */}
        {activeTab === 'details' && (
          <>
            {/* Priority */}
            <div className={`p-4 rounded-xl border ${
              claim.priority === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' :
              claim.priority === 'HIGH' ? 'bg-orange-500/10 border-orange-500/30' :
              'bg-slate-800/50 border-slate-700'
            }`}>
              <p className="text-xs text-slate-400 mb-1 font-mono uppercase tracking-wider">Priorité</p>
              <p className="font-bold text-lg">{claim.priority ?? '—'}</p>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <MapPin className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">Localisation</p>
                <p className="font-semibold">{claim.siteName ?? claim.siteId ?? 'Non défini'}</p>
                {claim.assetId && <p className="text-sm text-slate-400 mt-0.5">Asset: {claim.assetId}</p>}
              </div>
            </div>

            {/* SLA Timer */}
            <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <Clock className="w-5 h-5 text-fuchsia-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">Délai SLA</p>
                {claim.slaDueAt ? (
                  <p className={`font-bold ${claim.slaDueAt < Date.now() ? 'text-red-400' : 'text-white'}`}>
                    {claim.slaDueAt < Date.now()
                      ? `⏰ Dépassé de ${Math.round((Date.now() - claim.slaDueAt) / 60000)} min`
                      : `${Math.round((claim.slaDueAt - Date.now()) / 60000)} min restants`
                    }
                  </p>
                ) : <p className="text-slate-400">—</p>}
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-slate-300 leading-relaxed">{claim.description ?? '—'}</p>
            </div>

            {/* Assigned by */}
            {claim.reporterName && (
              <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <User className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">Rapporté par</p>
                  <p className="font-semibold">{claim.reporterName}</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ────── TAB ACTIONS ────── */}
        {activeTab === 'actions' && (
          <>
            {/* Status change CTA */}
            {!isResolved && nextStatus && (
              <button
                onClick={() => handleStatusChange(nextStatus)}
                disabled={updating}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
              >
                {updating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                {nextLabel}
              </button>
            )}

            {isResolved && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <div>
                  <p className="font-bold text-green-400">Intervention terminée</p>
                  <p className="text-xs text-slate-400">Cette tâche est marquée comme {statusCfg.label}</p>
                </div>
              </div>
            )}

            {/* Add Tech Note */}
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Note technicien</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Décrivez les actions effectuées, les pièces utilisées..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none min-h-[100px]"
              />
              <button
                onClick={handleAddNote}
                disabled={!note.trim() || updating}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Enregistrer la note
              </button>
            </div>

            {/* Awaiting Parts option */}
            {claim.status === 'INTERVENING' && (
              <button
                onClick={() => handleStatusChange('AWAITING_PARTS')}
                disabled={updating}
                className="w-full py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl font-semibold text-purple-300 text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Wrench className="w-4 h-4" />
                En attente de pièces
              </button>
            )}
          </>
        )}

        {/* ────── TAB HISTORY ────── */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {(claim.techNotes ?? []).length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>Aucune note pour le moment</p>
              </div>
            ) : (
              [...(claim.techNotes ?? [])].reverse().map((note: any, i: number) => (
                <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-violet-400">{note.by}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(note.at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{note.text}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
