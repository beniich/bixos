import React, { useMemo } from 'react';
import { computeFinanceStats } from '../../services/analyticsService';
import type { TicketData } from '../../types/ticket';

// ============================================
// PROPS
// ============================================

interface Props {
  eventId: string;
  eventTitle?: string;
  ticketsFallback: TicketData[];
}

// ============================================
// KPI CARD
// ============================================

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color: 'cyan' | 'green' | 'amber' | 'pink' | 'purple';
  icon: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, color, icon }) => {
  const colors = {
    cyan:   { border: 'var(--plugin-primary)', bg: 'var(--plugin-primary-soft)', text: 'var(--plugin-primary)' },
    green:  { border: 'var(--plugin-success)',  bg: 'rgba(0,255,149,0.1)',       text: 'var(--plugin-success)' },
    amber:  { border: 'var(--plugin-amber)',    bg: 'rgba(255,184,0,0.1)',       text: 'var(--plugin-amber)' },
    pink:   { border: 'var(--plugin-accent)',   bg: 'rgba(255,0,170,0.1)',       text: 'var(--plugin-accent)' },
    purple: { border: '#a855f7',                bg: 'rgba(168,85,247,0.1)',      text: '#c084fc' },
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
    </div>
  );
};

// ============================================
// TRANSACTIONS FEED
// ============================================

const TransactionsFeed: React.FC<{ items: any[] }> = ({ items }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
    {items.length === 0 ? (
      <div style={{ color: 'var(--plugin-text-tertiary)', fontSize: 12, padding: 24, textAlign: 'center' }}>
        Aucune transaction pour le moment
      </div>
    ) : (
      items.map((t, i) => (
        <div key={t.bookingId} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          background: 'var(--plugin-bg-deep)',
          borderRadius: 8,
          border: '1px solid var(--plugin-border)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: t.status === 'COMPLETED' ? 'rgba(0,255,149,0.1)' : 'rgba(255,184,0,0.1)',
            color: t.status === 'COMPLETED' ? 'var(--plugin-success)' : 'var(--plugin-amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
          }}>
            {t.status === 'COMPLETED' ? '💳' : '↩️'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--plugin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.customerName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--plugin-text-tertiary)' }}>
              {t.itemsCount} billet{t.itemsCount > 1 ? 's' : ''} · Ref: {t.bookingId.substring(0, 8)}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 14, color: t.status === 'COMPLETED' ? 'var(--plugin-text)' : 'var(--plugin-text-tertiary)', fontWeight: 700 }}>
              {t.status === 'COMPLETED' ? '+' : '-'}{t.amount.toLocaleString('fr-FR')} €
            </div>
            <div style={{ fontSize: 10, color: 'var(--plugin-text-tertiary)' }}>
              {new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
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

export const TicketFinanceDashboard: React.FC<Props> = ({ eventTitle = 'Événement', ticketsFallback = [] }) => {
  const stats = useMemo(() => computeFinanceStats(ticketsFallback), [ticketsFallback]);

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

  const formatEuro = (n: number) => Math.round(n).toLocaleString('fr-FR') + ' €';

  const tierColors: Record<string, string> = { VIP: '#ffb800', PREMIUM: '#ff00aa', STANDARD: '#00e5ff', UNKNOWN: '#666' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 4 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'var(--plugin-font-display)', fontSize: 18, margin: 0, color: 'var(--plugin-text)' }}>
          💰 Finances — {eventTitle}
        </h2>
        <p style={{ fontSize: 11, color: 'var(--plugin-text-tertiary)', margin: '4px 0 0' }}>
          Basé sur {ticketsFallback.length} billets générés.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KpiCard label="Revenu Brut" value={formatEuro(stats.revenueTotal)} icon="💶" color="pink" sub={`${stats.transactionsCount} transactions`} />
        <KpiCard label="Revenu Net (Est.)" value={formatEuro(stats.netRevenue)} icon="💎" color="cyan" sub={`Frais déduits: ${formatEuro(stats.feesTotal)}`} />
        <KpiCard label="Panier Moyen" value={formatEuro(stats.avgCart)} icon="🛒" color="purple" sub="Par transaction" />
        <KpiCard label="Remboursements" value={formatEuro(stats.refundsTotal)} icon="↩️" color="amber" sub="Billets annulés" />
      </div>

      {/* Row 2: Repartition CA + Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12 }}>
        
        {/* CA par Tier */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Revenus par Tier</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(stats.revenueByTier).sort((a,b) => b[1] - a[1]).map(([tier, amount]) => {
              const pct = stats.revenueTotal > 0 ? Math.round((amount / stats.revenueTotal) * 100) : 0;
              const color = tierColors[tier] || '#00e5ff';
              return (
                <div key={tier}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--plugin-text)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                      {tier}
                    </span>
                    <span style={{ color: color, fontWeight: 700 }}>{formatEuro(amount)} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--plugin-bg-deep)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.revenueByTier).length === 0 && (
              <div style={{ color: 'var(--plugin-text-tertiary)', fontSize: 12, textAlign: 'center', padding: 16 }}>Aucune donnée</div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={sectionTitle}>Transactions Récentes</div>
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              background: 'var(--plugin-primary-soft)',
              color: 'var(--plugin-primary)',
              borderRadius: 10,
              fontWeight: 700,
            }}>{stats.recentTransactions.length} affichées</span>
          </div>
          <TransactionsFeed items={stats.recentTransactions} />
        </div>
      </div>
    </div>
  );
};

export default TicketFinanceDashboard;
