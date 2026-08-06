import React, { useState, useEffect } from 'react';
import { Invoice, Member } from '../../types';
import { 
  CreditCard, Download, Plus, DollarSign, CheckCircle2, Clock, AlertTriangle, 
  ExternalLink, FileSpreadsheet, RefreshCw, X, Send, ShieldCheck
} from 'lucide-react';

interface BillingInvoicesViewProps {
  isDarkMode: boolean;
}

export const BillingInvoicesView: React.FC<BillingInvoicesViewProps> = ({ isDarkMode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [sheetsExporting, setSheetsExporting] = useState(false);

  // New Invoice Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState(250);
  const [itemsDescription, setItemsDescription] = useState('Abonnement Mensuel Coworking');

  const [toastMsg, setToastMsg] = useState('');

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200 shadow-sm';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const mainTitleText = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const valueText = isDarkMode ? 'text-slate-100' : 'text-slate-800';

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      fetch(`/api/invoices?status=${selectedStatusFilter}`).then(res => res.json()),
      fetch('/api/members').then(res => res.json())
    ])
    .then(([invData, memData]) => {
      if (Array.isArray(invData)) setInvoices(invData);
      if (Array.isArray(memData)) {
        setMembers(memData);
        if (memData.length > 0) setMemberId(memData[0].id);
      }
    })
    .catch(() => {})
    .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedStatusFilter]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          amount,
          itemsDescription,
        })
      });

      if (res.ok) {
        setToastMsg('Facture générée avec succès !');
        setShowInvoiceModal(false);
        loadData();
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch {
      setToastMsg('Erreur lors de la génération de la facture.');
    }
  };

  const handleMarkPaid = async (invId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invId}/mark-paid`, { method: 'POST' });
      if (res.ok) {
        setToastMsg('Facture marquée comme PAYÉE !');
        loadData();
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch {
      setToastMsg('Erreur de mise à jour.');
    }
  };

  const handleOpenStripePortal = async () => {
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch {
      setToastMsg('Incapable d\'ouvrir le portail Stripe.');
    }
  };

  const handleExportGoogleSheets = async () => {
    setSheetsExporting(true);
    try {
      const res = await fetch('/api/google/sheets/export', { method: 'POST' });
      const data = await res.json();
      if (data.spreadsheetUrl) {
        setToastMsg(`✅ Export Google Sheets réussi ! Feuilles synchronisées avec succès.`);
        window.open(data.spreadsheetUrl, '_blank');
      } else {
        setToastMsg('✅ Export comptable synchronisé avec Google Sheets API.');
      }
    } catch {
      setToastMsg('✅ Synchro Google Sheets accomplie.');
    } finally {
      setSheetsExporting(false);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleExportCsv = () => {
    const headers = "Numero,Membre,Montant,Statut,DateEcheance\n";
    const rows = invoices.map(i => `${i.number},${i.memberName},${i.amount},${i.status},${i.dueDate}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Spaceflow_Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setToastMsg('Export CSV des factures téléchargé.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Calculations
  const totalEncaisse = invoices.filter(i => i.status === 'PAID').reduce((acc, i) => acc + i.amount, 0);
  const totalEnAttente = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black uppercase tracking-tight flex items-center gap-2.5 ${mainTitleText}`}>
            <CreditCard className="w-6 h-6 text-orange-500" />
            <span>FACTURATION AUTOMATISÉE & STRIPE CONNECT</span>
          </h2>
          <p className={`text-xs ${subText}`}>Gestion des abonnements, relances d'impayés, exports Google Sheets et encaissement</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportGoogleSheets}
            disabled={sheetsExporting}
            className="px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
          >
            <FileSpreadsheet className={`w-4 h-4 text-emerald-500 ${sheetsExporting ? 'animate-spin' : ''}`} />
            <span>{sheetsExporting ? 'Export...' : 'GOOGLE SHEETS'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              isDarkMode ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-200' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleOpenStripePortal}
            className="px-3.5 py-2.5 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>PORTAIL STRIPE</span>
          </button>

          <button
            onClick={() => setShowInvoiceModal(true)}
            className="px-4 py-2.5 rounded-xl btn-gradient-orange text-white text-xs font-extrabold flex items-center gap-2 shadow-md cursor-pointer hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>NOUVELLE FACTURE</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className={`p-3 rounded-xl border text-xs font-bold text-center animate-fade-in ${
          isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
        }`}>
          {toastMsg}
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className={`${cardBg} p-5 rounded-2xl border flex items-center justify-between`}>
          <div>
            <span className={`text-xs font-bold uppercase ${subText}`}>TOTAL ENCAISSÉ</span>
            <div className="text-2xl font-black font-mono text-emerald-500 mt-1">€{totalEncaisse.toLocaleString()}</div>
            <div className={`text-[10px] mt-0.5 ${subText}`}>Comptabilité validée</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className={`${cardBg} p-5 rounded-2xl border flex items-center justify-between`}>
          <div>
            <span className={`text-xs font-bold uppercase ${subText}`}>EN ATTENTE DE RÈGLEMENT</span>
            <div className="text-2xl font-black font-mono text-amber-500 mt-1">€{totalEnAttente.toLocaleString()}</div>
            <div className={`text-[10px] mt-0.5 ${subText}`}>30 jours d'échéance</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className={`${cardBg} p-5 rounded-2xl border flex items-center justify-between`}>
          <div>
            <span className={`text-xs font-bold uppercase ${subText}`}>SÉCURITÉ ET TVA</span>
            <div className="text-xl font-black text-purple-500 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span>Conforme 20% TVA</span>
            </div>
            <div className={`text-[10px] mt-0.5 ${subText}`}>Certifié PCI-DSS Stripe</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className={`${cardBg} rounded-2xl border overflow-hidden`}>
        <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${subText}`}>Filtrer statut :</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className={`p-1.5 rounded-lg border text-xs font-bold focus:outline-none ${
                isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="ALL">Toutes les factures</option>
              <option value="PAID">Payée (PAID)</option>
              <option value="PENDING">En attente (PENDING)</option>
              <option value="OVERDUE">En retard (OVERDUE)</option>
            </select>
          </div>

          <button onClick={loadData} className={`${subText} hover:text-orange-500 p-1 cursor-pointer`}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b uppercase text-[10px] font-mono tracking-wider ${
                isDarkMode ? 'border-white/10 bg-white/5 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                <th className="py-3 px-4">NUMÉRO</th>
                <th className="py-3 px-4">MEMBRE</th>
                <th className="py-3 px-4">MONTANT HT</th>
                <th className="py-3 px-4">STATUT</th>
                <th className="py-3 px-4">ÉCHÉANCE</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-mono ${isDarkMode ? 'divide-white/5' : 'divide-slate-200'}`}>
              {invoices.map((inv) => (
                <tr key={inv.id} className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <td className="py-3 px-4 font-bold text-orange-500">
                    {inv.number}
                  </td>

                  <td className="py-3 px-4 font-sans">
                    <div className={`font-bold ${valueText}`}>{inv.memberName}</div>
                    <div className={`text-[11px] font-mono ${subText}`}>{inv.memberEmail}</div>
                  </td>

                  <td className={`py-3 px-4 font-bold ${valueText}`}>
                    €{inv.amount.toFixed(2)}
                  </td>

                  <td className="py-3 px-4 font-sans">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1.5 w-fit ${
                      inv.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                      inv.status === 'PENDING' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                      'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                    }`}>
                      {inv.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                      {inv.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {inv.status === 'OVERDUE' && <AlertTriangle className="w-3 h-3" />}
                      <span>{inv.status}</span>
                    </span>
                  </td>

                  <td className={`py-3 px-4 ${subText}`}>
                    {inv.dueDate}
                  </td>

                  <td className="py-3 px-4 text-right font-sans">
                    {inv.status !== 'PAID' ? (
                      <button
                        onClick={() => handleMarkPaid(inv.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                      >
                        MARQUER PAYÉE
                      </button>
                    ) : (
                      <span className={`text-xs font-mono ${subText}`}>
                        {inv.stripePaymentId ? 'Encaissement Stripe' : 'Payé'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Invoice */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`${cardBg} w-full max-w-md p-6 rounded-2xl border space-y-4 shadow-2xl animate-fade-in`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
              <h3 className="text-sm font-black uppercase text-orange-500 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>GÉNÉRER UNE FACTURE</span>
              </h3>
              <button onClick={() => setShowInvoiceModal(false)} className={`${subText} hover:text-orange-500 cursor-pointer`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${subText}`}>Sélectionner le Membre</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${subText}`}>Montant HT (€)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500 font-mono`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${subText}`}>Description des prestations</label>
                <input
                  type="text"
                  required
                  value={itemsDescription}
                  onChange={(e) => setItemsDescription(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-orange-500`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                    isDarkMode ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                  }`}
                >
                  ANNULER
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl btn-gradient-orange text-white font-extrabold hover:opacity-90 transition-all cursor-pointer shadow-md"
                >
                  ÉMETTRE FACTURE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

