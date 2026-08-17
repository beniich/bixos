/**
 * TicketAnalyticsDashboard.tsx
 * Dashboard analytics temps réel pour la billetterie.
 * - KPI Cards (total / validés / taux de présence / revenu)
 * - Répartition par tier (donut SVG)
 * - Top sections
 * - Graphe ventes par jour (canvas SVG)
 * - Feed check-in live
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  subscribeToTicketStats,
  subscribeToCheckInActivity,
  computeStats,
  type TicketStats,
  type CheckInActivity,
} from '../../services/analyticsService';
import type { TicketData } from '../../types/ticket';

// ============================================
// PROPS
// ============================================

interface Props {
  eventId: string;
  eventTitle?: string;
  /** Billets déjà chargés en mémoire (évite un double fetch) */
  ticketsFallback?: TicketData[];
}

// ============================================
// KPI CARD
// ============================================

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color: 'cyan' | 'green' | 'amber' | 'pink';
  icon: string;
  trend?: number; // % variation
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, color, icon, trend }) => {
  const colors = {
    cyan:  { border: 'var(--plugin-primary)', bg: 'var(--plugin-primary-soft)', text: 'var(--plugin-primary)' },
    green: { border: 'var(--plugin-success)',  bg: 'rgba(0,255,149,0.1)',       text: 'var(--plugin-success)' },
    amber: { border: 'var(--plugin-amber)',    bg: 'rgba(255,184,0,0.1)',       text: 'var(--plugin-amber)' },
    pink:  { border: 'var(--plugin-accent)',   bg: 'rgba(255,0,170,0.1)',       text: 'var(--plugin-accent)' },
  };
  const c = colors[color];

  return (
    <div style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 28, opacity: 0.3 }}>{icon}</div>
      <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--plugin-text-tertiary)', fontWeight: 700 }}>
        {label}
      </span>
      <span style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--plugin-font-display)', color: c.text, lineHeight: 1 }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: 11, color: 'var(--plugin-text-tertiary)' }}>{sub}</span>}
      {trend !== undefined && (
        <span style={{ fontSize: 11, color: trend >= 0 ? 'var(--plugin-success)' : 'var(--plugin-red)', fontWeight: 600 }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
};

// ============================================
// MINI DONUT SVG
// ============================================

interface DonutProps {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}

const MiniDonut: React.FC<DonutProps> = ({ segments, size = 120 }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const strokeWidth = size * 0.14;

  let cumAngle = -90;
  const paths = segments.map(seg => {
    const angle = (seg.value / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    const end = cumAngle;

    const startRad = (start * Math.PI) / 180;
    const endRad = (end * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const large = angle > 180 ? 1 : 0;

    return { d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, color: seg.color, label: seg.label, value: seg.value };
  });

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth={strokeWidth} strokeLinecap="round" />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize={size * 0.14} fontWeight="800" fontFamily="var(--plugin-font-display)">
        {total}
      </text>
      <text x={cx} y={cy + size * 0.1} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={size * 0.09}>
        billets
      </text>
    </svg>
  );
};

// ============================================
// MINI BAR CHART
// ============================================

interface BarChartProps {
  data: { date: string; sold: number; checkedIn: number }[];
}

const MiniBarChart: React.FC<BarChartProps> = ({ data }) => {
  if (!data.length) return <div style={{ color: 'var(--plugin-text-tertiary)', fontSize: 12, padding: 16, textAlign: 'center' }}>Pas de données</div>;

  const maxVal = Math.max(...data.map(d => Math.max(d.sold, d.checkedIn)), 1);
  const barW = Math.max(8, Math.min(28, Math.floor(400 / data.length) - 4));
  const chartH = 80;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={Math.max(400, data.length * (barW * 2 + 6))} height={chartH + 24} style={{ display: 'block' }}>
        {data.map((d, i) => {
          const x = i * (barW * 2 + 6) + 4;
          const soldH = Math.round((d.sold / maxVal) * chartH);
          const usedH = Math.round((d.checkedIn / maxVal) * chartH);
          const label = d.date.slice(5); // MM-DD

          return (
            <g key={i}>
              <rect x={x} y={chartH - soldH} width={barW} height={soldH} rx={3} fill="var(--plugin-primary)" opacity={0.5} />
              <rect x={x + barW + 2} y={chartH - usedH} width={barW} height={usedH} rx={3} fill="var(--plugin-success)" opacity={0.8} />
              {i % Math.max(1, Math.floor(data.length / 6)) === 0 && (
                <text x={x + barW} y={chartH + 16} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>{label}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--plugin-text-tertiary)', marginTop: 4 }}>
        <span><span style={{ color: 'var(--plugin-primary)' }}>■</span> Vendus</span>
        <span><span style={{ color: 'var(--plugin-success)' }}>■</span> Validés</span>
      </div>
    </div>
  );
};

// ============================================
// CHECK-IN FEED
// ============================================

const TIER_COLORS: Record<string, string> = {
  VIP:      '#ffb800',
  PREMIUM:  '#ff00aa',
  STANDARD: '#00e5ff',
};

const CheckInFeed: React.FC<{ items: CheckInActivity[] }> = ({ items }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
    {items.length === 0 ? (
      <div style={{ color: 'var(--plugin-text-tertiary)', fontSize: 12, padding: 24, textAlign: 'center' }}>
        Aucune activité pour le moment
      </div>
    ) : (
      items.map((a, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          background: 'var(--plugin-bg-deep)',
          borderRadius: 8,
          borderLeft: `3px solid ${TIER_COLORS[a.tier] ?? '#00e5ff'}`,
          animation: i === 0 ? 'slideIn 0.3s ease' : undefined,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--plugin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {a.holderName}
            </div>
            <div style={{ fontSize: 10, color: 'var(--plugin-text-tertiary)' }}>
              {a.seat} · Entrée {a.gate}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: TIER_COLORS[a.tier] ?? 'var(--plugin-primary)', fontWeight: 700 }}>{a.tier}</div>
            <div style={{ fontSize: 10, color: 'var(--plugin-text-tertiary)', fontFamily: 'var(--plugin-font-mono)' }}>
              {new Date(a.scannedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

// ============================================
// MAIN DASHBOARD
// ============================================

const EMPTY_STATS: TicketStats = {
  total: 0, valid: 0, used: 0, cancelled: 0,
  attendanceRate: 0, revenue: 0, avgTicketPrice: 0,
  byTier: {}, bySection: {}, byGate: {}, timelineByDay: [],
};

export const TicketAnalyticsDashboard: React.FC<Props> = ({
  eventId,
  eventTitle = 'Événement',
  ticketsFallback = [],
}) => {
  const [stats, setStats] = useState<TicketStats>(() =>
    ticketsFallback.length > 0 ? computeStats(ticketsFallback) : EMPTY_STATS
  );
  const [activity, setActivity] = useState<CheckInActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    setLoading(true);
    const unsub1 = subscribeToTicketStats(
      eventId,
      (s) => { setStats(s); setLoading(false); setLastUpdate(new Date()); },
      () => {
        // Fallback: compute from props
        if (ticketsFallback.length > 0) setStats(computeStats(ticketsFallback));
        setLoading(false);
      }
    );
    const unsub2 = subscribeToCheckInActivity(eventId, setActivity);
    return () => { unsub1(); unsub2(); };
  }, [eventId]);

  // When fallback tickets change and Firestore not configured
  useEffect(() => {
    if (!loading && ticketsFallback.length > 0 && stats.total === 0) {
      setStats(computeStats(ticketsFallback));
    }
  }, [ticketsFallback]);

  const tierSegments = useMemo(() => {
    const tierColors: Record<string, string> = { VIP: '#ffb800', PREMIUM: '#ff00aa', STANDARD: '#00e5ff', UNKNOWN: '#666' };
    return Object.entries(stats.byTier).map(([tier, data]) => ({
      label: tier,
      value: data.count,
      color: tierColors[tier] ?? '#00e5ff',
    }));
  }, [stats.byTier]);

  const topSections = useMemo(() =>
    Object.entries(stats.bySection)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5),
    [stats.bySection]
  );

  const cardStyle: React.CSSProperties = {
    background: 'var(--plugin-bg-card)',
    border: '1px solid var(--plugin-border)',
    borderRadius: 12,
    padding: 16,
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: 'var(--plugin-font-display)',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--plugin-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 12,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--plugin-font-display)', fontSize: 18, margin: 0, color: 'var(--plugin-text)' }}>
            📊 Analytics — {eventTitle}
          </h2>
          <p style={{ fontSize: 11, color: 'var(--plugin-text-tertiary)', margin: '4px 0 0' }}>
            Mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
            {loading && ' · Chargement…'}
          </p>
        </div>
        <div style={{
          padding: '4px 10px',
          background: activity.length > 0 ? 'rgba(0,255,149,0.1)' : 'var(--plugin-bg-deep)',
          border: `1px solid ${activity.length > 0 ? 'var(--plugin-success)' : 'var(--plugin-border)'}`,
          borderRadius: 20,
          fontSize: 11,
          color: activity.length > 0 ? 'var(--plugin-success)' : 'var(--plugin-text-tertiary)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          {activity.length > 0 && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--plugin-success)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          )}
          {activity.length > 0 ? 'Live Check-in actif' : 'En attente'}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KpiCard label="Total billets" value={stats.total} icon="🎫" color="cyan" sub={`${stats.valid} valides`} />
        <KpiCard label="Validés (Check-in)" value={stats.used} icon="✅" color="green" sub={`${stats.attendanceRate}% de taux`} />
        <KpiCard label="Taux de présence" value={`${stats.attendanceRate}%`} icon="📈" color="amber" sub={`${stats.cancelled} annulés`} />
        <KpiCard label="Revenu estimé" value={`${Math.round(stats.revenue).toLocaleString('fr-FR')} €`} icon="💶" color="pink" sub={`Moy. ${stats.avgTicketPrice} € / billet`} />
      </div>

      {/* Row 2: Donut + Bar Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 12 }}>
        {/* Donut Tier */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Répartition par tier</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <MiniDonut segments={tierSegments} size={110} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {tierSegments.map(seg => (
                <div key={seg.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--plugin-text-secondary)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, display: 'inline-block' }} />
                    {seg.label}
                  </span>
                  <span style={{ fontWeight: 700, color: seg.color }}>{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Ventes & validations par jour</div>
          <MiniBarChart data={stats.timelineByDay} />
        </div>
      </div>

      {/* Row 3: Top Sections + Check-in Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Top Sections */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Top sections</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topSections.length === 0 ? (
              <div style={{ color: 'var(--plugin-text-tertiary)', fontSize: 12, textAlign: 'center', padding: 16 }}>Aucune donnée</div>
            ) : topSections.map(([section, data]) => {
              const fillPct = stats.total > 0 ? Math.round((data.count / stats.total) * 100) : 0;
              const usedPct = data.count > 0 ? Math.round((data.used / data.count) * 100) : 0;
              return (
                <div key={section}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--plugin-text)' }}>{section}</span>
                    <span style={{ color: 'var(--plugin-text-tertiary)' }}>{data.count} billets · {usedPct}% entrés</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--plugin-bg-deep)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${fillPct}%`, background: 'var(--plugin-primary)', borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Check-in Feed */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={sectionTitle}>Activité check-in live</div>
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              background: 'var(--plugin-primary-soft)',
              color: 'var(--plugin-primary)',
              borderRadius: 10,
              fontWeight: 700,
            }}>{activity.length} récents</span>
          </div>
          <CheckInFeed items={activity} />
        </div>
      </div>

      {/* By Gate */}
      {Object.keys(stats.byGate).length > 0 && (
        <div style={cardStyle}>
          <div style={sectionTitle}>Répartition par entrée</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(stats.byGate).map(([gate, count]) => (
              <div key={gate} style={{
                padding: '8px 16px',
                background: 'var(--plugin-bg-deep)',
                border: '1px solid var(--plugin-border)',
                borderRadius: 8,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--plugin-primary)', fontFamily: 'var(--plugin-font-display)' }}>{count}</div>
                <div style={{ fontSize: 10, color: 'var(--plugin-text-tertiary)' }}>Entrée {gate}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TicketAnalyticsDashboard;
