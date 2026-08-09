/**
 * Utilitaire d'export de rapports multi-formats (PDF, Excel, CSV)
 * Pilier 3 — BizOS GMAO
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface ReportRow {
  [key: string]: string | number | boolean | null;
}

export interface ReportConfig {
  title: string;
  subtitle?: string;
  organizationName?: string;
  columns: { header: string; key: string; width?: number }[];
  rows: ReportRow[];
  generatedBy?: string;
}

const BRAND_COLOR: [number, number, number] = [139, 92, 246]; // violet-500

// ──────────────────────────────────────────────────────────
// PDF
// ──────────────────────────────────────────────────────────
export function exportToPDF(config: ReportConfig): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const today = format(new Date(), 'dd MMMM yyyy', { locale: fr });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header stripe
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(config.title, 15, 12);

  // Subtitle / Org
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(config.organizationName ?? '', 15, 20);
  doc.text(`Généré le ${today}${config.generatedBy ? ` par ${config.generatedBy}` : ''}`, 15, 26);

  if (config.subtitle) {
    doc.setTextColor(220, 220, 220);
    doc.text(config.subtitle, pageWidth - 15, 26, { align: 'right' });
  }

  // Table
  const tableColumns = config.columns.map(col => ({
    header: col.header,
    dataKey: col.key,
  }));

  const tableRows = config.rows.map(row =>
    config.columns.reduce((acc, col) => {
      const val = row[col.key];
      acc[col.key] = val === null || val === undefined ? '—' : String(val);
      return acc;
    }, {} as Record<string, string>)
  );

  autoTable(doc, {
    startY: 38,
    columns: tableColumns,
    body: tableRows,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 246, 255],
    },
    margin: { left: 15, right: 15 },
    didDrawPage: (data: any) => {
      // Page footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setTextColor(150);
      doc.setFontSize(7);
      doc.text(
        `BizOS GMAO — ${config.title} — Page ${data.pageNumber} / ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      );
    },
  });

  // Save
  const filename = `${sanitizeFilename(config.title)}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(filename);
}

// ──────────────────────────────────────────────────────────
// Excel (XLSX)
// ──────────────────────────────────────────────────────────
export function exportToExcel(config: ReportConfig): void {
  const wb = XLSX.utils.book_new();
  const today = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr });

  // Build worksheet data
  const headers = config.columns.map(c => c.header);
  const rows = config.rows.map(row =>
    config.columns.map(col => {
      const val = row[col.key];
      return val === null || val === undefined ? '' : val;
    })
  );

  const wsData = [
    [`${config.title} — ${config.organizationName ?? ''}`, '', '', ''],
    [`Généré le ${today}`, '', '', ''],
    [],
    headers,
    ...rows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = config.columns.map(col => ({ wch: col.width ?? 20 }));

  // Style header row (index 3, 0-based)
  const headerRange = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  const headerRowIdx = 3;
  for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIdx, c });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '8B5CF6' } },
      };
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Rapport');

  // Metadata sheet
  const metaWs = XLSX.utils.aoa_to_sheet([
    ['Rapport', config.title],
    ['Organisation', config.organizationName ?? ''],
    ['Généré le', today],
    ['Généré par', config.generatedBy ?? ''],
    ['Lignes', config.rows.length],
  ]);
  XLSX.utils.book_append_sheet(wb, metaWs, 'Métadonnées');

  const filename = `${sanitizeFilename(config.title)}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ──────────────────────────────────────────────────────────
// CSV
// ──────────────────────────────────────────────────────────
export function exportToCSV(config: ReportConfig): void {
  const sep = ';'; // Semi-colon for French Excel locale
  const escape = (v: any): string => {
    const s = v === null || v === undefined ? '' : String(v);
    if (s.includes(sep) || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines: string[] = [];
  lines.push(config.columns.map(c => escape(c.header)).join(sep));
  config.rows.forEach(row => {
    lines.push(config.columns.map(c => escape(row[c.key] ?? '')).join(sep));
  });

  const csvContent = '\uFEFF' + lines.join('\r\n'); // BOM for Excel UTF-8
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(config.title)}_${format(new Date(), 'yyyyMMdd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────
function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9_-]/gi, '_')
    .toLowerCase()
    .slice(0, 60);
}

// ──────────────────────────────────────────────────────────
// Configs pré-définies pour BizOS
// ──────────────────────────────────────────────────────────
export const REPORT_COLUMNS = {
  claims: [
    { header: 'ID',           key: 'id',           width: 14 },
    { header: 'Titre',        key: 'title',         width: 30 },
    { header: 'Statut',       key: 'status',        width: 16 },
    { header: 'Priorité',     key: 'priority',      width: 12 },
    { header: 'Site',         key: 'siteName',      width: 20 },
    { header: 'Technicien',   key: 'techName',      width: 22 },
    { header: 'Créé le',      key: 'createdAtStr',  width: 18 },
    { header: 'Résolu le',    key: 'resolvedAtStr', width: 18 },
  ],
  assets: [
    { header: 'ID',           key: 'id',            width: 14 },
    { header: 'Nom',          key: 'name',          width: 30 },
    { header: 'Type',         key: 'type',          width: 18 },
    { header: 'Site',         key: 'siteName',      width: 20 },
    { header: 'Santé %',      key: 'healthScore',   width: 10 },
    { header: 'Statut',       key: 'status',        width: 16 },
    { header: 'Proch. maint.', key: 'nextMaintStr', width: 18 },
  ],
};
