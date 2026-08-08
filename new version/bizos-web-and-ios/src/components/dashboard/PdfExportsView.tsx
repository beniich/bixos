import React, { useState } from 'react';
import { FileSpreadsheet, Download, FileText, CheckCircle2 } from 'lucide-react';

interface PdfExportsViewProps {
  isDarkMode: boolean;
}

export const PdfExportsView: React.FC<PdfExportsViewProps> = ({ isDarkMode }) => {
  const [reportType, setReportType] = useState('WORK_ORDERS');

  const cardBg = isDarkMode
    ? 'glass-card-purple text-slate-100 border-white/10 shadow-lg'
    : 'bg-white text-slate-900 border-slate-200/80 shadow-sm';

  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black uppercase text-orange-500">EXPORTS PDF & RAPPORTS EXÉCUTIFS (JSPDF)</h2>
          <p className={`text-xs ${subText}`}>Génération instantanée de documents officiels de maintenance, audit et baux</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${cardBg} p-6 rounded-2xl border space-y-4`}>
          <h3 className="text-xs font-black uppercase text-orange-500">TYPE DE RAPPORT</h3>
          <div className="space-y-2 text-xs font-bold">
            {[
              { id: 'WORK_ORDERS', label: 'Rapport Ordres de Travail (GMAO)' },
              { id: 'MAINTENANCE_LOG', label: 'Journal de Maintenance Préventive' },
              { id: 'ASSET_VALUATION', label: 'Inventaire et Amortissement Actifs' },
              { id: 'ENERGY_AUDIT', label: 'Bilan Énergétique & Carbon CO2' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setReportType(r.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  reportType === r.id ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-black/20 border-slate-500/20 text-slate-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert(`Génération du PDF [${reportType}] terminée. Téléchargement démarré.`)}
            className="w-full py-3 rounded-xl btn-gradient-orange text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>GÉNÉRER & TÉLÉCHARGER PDF</span>
          </button>
        </div>

        <div className={`md:col-span-2 ${cardBg} p-6 rounded-2xl border space-y-4`}>
          <h3 className="text-xs font-black uppercase text-orange-500">APERÇU DU DOCUMENT PDF</h3>
          <div className="h-72 bg-black/30 rounded-xl border border-white/10 p-6 font-mono text-xs text-slate-300 space-y-3 overflow-y-auto">
            <div className="text-center font-bold text-orange-400 text-sm border-b border-slate-500/30 pb-2">
              *** REZIDET CAFM FACILITY MANAGEMENT REPORT ***
            </div>
            <div>ORGANISATION: APEX REAL ESTATE PARIS</div>
            <div>DATE GÉNÉRATION: {new Date().toISOString().split('T')[0]}</div>
            <div>DOCUMENT TYPE: {reportType}</div>
            <div className="pt-4 border-t border-slate-500/30 text-[11px] text-slate-400 space-y-1">
              <p>- Total éléments compilés: 48 capteurs, 20 actifs, 10 ordres de travail.</p>
              <p>- Conformité réglementaire: Certifiée ISO 50001 & HQE Bâtiment.</p>
              <p>- Signature numérique RSA-4096 valide.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
