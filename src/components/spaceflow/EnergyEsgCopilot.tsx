import React, { useState } from 'react';
import { 
  Zap, Award, TrendingDown, FileText, Calculator, Download, CheckCircle2, ShieldCheck, AlertCircle, ArrowUpRight, Leaf, Sparkles, RefreshCw
} from 'lucide-react';
import { useFieldTechStore } from '../../services/fieldTechStore';

export const EnergyEsgCopilot: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'compliance'>('overview');
  
  const { energySettings, updateEnergySettings } = useFieldTechStore();

  const [surfaceArea, setSurfaceArea] = useState<number>(energySettings.surfaceArea);
  const [currentEnergyBill, setCurrentEnergyBill] = useState<number>(energySettings.currentBill);
  const [hvacRetrofit, setHvacRetrofit] = useState<boolean>(energySettings.hvacRetrofit);
  const [solarPanels, setSolarPanels] = useState<boolean>(energySettings.solarPanels);
  const [smartBacsBms, setSmartBacsBms] = useState<boolean>(energySettings.smartBacsBms);
  
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const handleUpdateSetting = (key: string, val: any) => {
    if (key === 'surfaceArea') setSurfaceArea(val);
    if (key === 'currentEnergyBill') setCurrentEnergyBill(val);
    if (key === 'hvacRetrofit') setHvacRetrofit(val);
    if (key === 'solarPanels') setSolarPanels(val);
    if (key === 'smartBacsBms') setSmartBacsBms(val);

    updateEnergySettings({
      surfaceArea,
      currentBill: currentEnergyBill,
      hvacRetrofit,
      solarPanels,
      smartBacsBms,
      [key]: val,
    });
  };

  // Calculate estimated ROI & Energy Savings
  const calculateSavings = () => {
    let savingsPercent = 0;
    let capexEstimated = 0;

    if (hvacRetrofit) {
      savingsPercent += 22;
      capexEstimated += 45000;
    }
    if (solarPanels) {
      savingsPercent += 18;
      capexEstimated += 62000;
    }
    if (smartBacsBms) {
      savingsPercent += 15;
      capexEstimated += 28000;
    }

    const annualEurosSaved = Math.round((currentEnergyBill * savingsPercent) / 100);
    const co2TonsReduced = Math.round((surfaceArea * savingsPercent * 0.08) / 10);
    const paybackYears = annualEurosSaved > 0 ? (capexEstimated / annualEurosSaved).toFixed(1) : '0';

    return { savingsPercent, annualEurosSaved, co2TonsReduced, capexEstimated, paybackYears };
  };

  const roiResult = calculateSavings();

  const handleExportPdf = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Rapport ESG & Audit OPERAT - FieldTech OS</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
              .header { border-bottom: 3px solid #d946ef; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
              .title { font-size: 26px; font-weight: bold; color: #831843; }
              .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
              .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
              .kpi-card { background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 12px; padding: 16px; }
              .kpi-title { font-size: 12px; color: #9d174d; text-transform: uppercase; font-weight: bold; }
              .kpi-val { font-size: 24px; font-weight: bold; color: #be185d; margin-top: 6px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 13px; }
              th { background: #f8fafc; font-weight: 600; color: #334155; }
              .badge { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
              .footer { margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="title">Rapport d'Audit ESG & Bilan OPERAT 2026</div>
                <div class="subtitle">Immeuble : Tour BizOS • Surface Utile : ${surfaceArea} m²</div>
              </div>
              <div>
                <span class="badge">ISO 50001 VERIFIED</span>
              </div>
            </div>

            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="kpi-title">Facture Énergétique Annuelle</div>
                <div class="kpi-val">${currentEnergyBill.toLocaleString('fr-FR')} €</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-title">Économies Ciblées</div>
                <div class="kpi-val">-${roiResult.savingsPercent}%</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-title">Gains Financiers / An</div>
                <div class="kpi-val">+${roiResult.annualEurosSaved.toLocaleString('fr-FR')} €</div>
              </div>
            </div>

            <h3 style="font-size: 16px; color: #1e293b; margin-top: 20px;">Registre de Conformité Réglementaire</h3>
            <table>
              <thead>
                <tr>
                  <th>Réglementation</th>
                  <th>Exigence Légale</th>
                  <th>Statut Bâtiment FieldTech</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Décret Tertiaire (OPERAT)</strong></td>
                  <td>-40% d'énergie finale d'ici 2030</td>
                  <td><span class="badge">Conforme (-42.5%)</span></td>
                </tr>
                <tr>
                  <td><strong>Décret BACS</strong></td>
                  <td>GTB de classe B ou A obligatoire pour CVC &gt; 70kW</td>
                  <td><span class="badge">GTB Class A Active</span></td>
                </tr>
                <tr>
                  <td><strong>Norme ISO 50001</strong></td>
                  <td>Audit continu de performance énergétique</td>
                  <td><span class="badge">Certifié 2026</span></td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 30px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px;">
              <h4 style="margin: 0 0 8px 0; color: #0f172a;">Synthèse de l'Inférence CO2</h4>
              <p style="margin: 0; font-size: 13px; color: #475569;">
                L'implémentation combinée des leviers permet d'éviter <strong>${roiResult.co2TonsReduced} tonnes d'équivalent CO2 par an</strong>. Amortissement du plan d'investissement estimé à <strong>${roiResult.paybackYears} ans</strong>.
              </p>
            </div>

            <div class="footer">
              <span>FieldTech OS • Moteur ESG & Energy Copilot</span>
              <span>Date d'émission : ${new Date().toLocaleDateString('fr-FR')}</span>
            </div>

            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }

      setIsExporting(false);
      setExportMessage("Rapport ESG généré ! La fenêtre d'impression/téléchargement s'est ouverte.");
      setTimeout(() => setExportMessage(null), 4000);
    }, 800);
  };

  const handleExportCeeFile = () => {
    const ceeCsv = `Code_Operation,Intitule_Travaux,Surface_m2,Economie_kWh_ans,Gain_Euros_an,Subvention_CEE_Estimee_Euros
CEE-BAT-TH-116,Pompe a Chaleur & CVC Haute Efficacite,${surfaceArea},${Math.round(surfaceArea * 22)},${Math.round(currentEnergyBill * 0.22)},${Math.round(roiResult.capexEstimated * 0.35)}
CEE-BAT-EQ-127,Regulation GTB BACS Classe A,${surfaceArea},${Math.round(surfaceArea * 15)},${Math.round(currentEnergyBill * 0.15)},${Math.round(roiResult.capexEstimated * 0.25)}
CEE-BAT-EN-101,Ombrieres Photovoltaiques Toiture,${surfaceArea},${Math.round(surfaceArea * 18)},${Math.round(currentEnergyBill * 0.18)},${Math.round(roiResult.capexEstimated * 0.30)}
`;

    const blob = new Blob([ceeCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CEE_Dossier_Subvention_${surfaceArea}m2.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportMessage("Dossier de Subvention CEE téléchargé au format CSV !");
    setTimeout(() => setExportMessage(null), 4000);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#140826]/90 border border-[#d946ef]/30 shadow-[0_0_30px_rgba(217,70,239,0.15)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f472b6] mb-1">
            <Leaf className="w-4 h-4" />
            <span>ENERGY & ESG COPILOT • CONFORMITÉ DÉCRET BACS & OPERAT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Analyse Énergétique & Bilan ESG</h2>
          <p className="text-xs text-slate-300">Suivi temps réel de la consommation kWh, reporting carbone et simulateur d'efficacité ROI.</p>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportPdf}
          disabled={isExporting}
          className="px-4 py-2.5 rounded-full bizos-cta-pink text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all hover:scale-105"
        >
          {isExporting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>Générer Rapport ESG OPERAT</span>
        </button>
      </div>

      {/* Export Toast Notification */}
      {exportMessage && (
        <div className="p-3.5 rounded-2xl bg-[#d946ef]/20 border border-[#d946ef]/50 text-white text-xs font-medium animate-fade-in flex items-center justify-between shadow-[0_0_20px_rgba(217,70,239,0.3)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#f472b6]" />
            <span>{exportMessage}</span>
          </div>
          <span className="text-[10px] font-mono bg-[#d946ef]/40 px-2 py-0.5 rounded text-white">ISO 50001 Verified</span>
        </div>
      )}

      {/* Module Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview' 
              ? 'bg-[#d946ef]/30 text-white border border-[#f472b6] font-semibold shadow-[0_0_12px_rgba(217,70,239,0.3)]' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Consommations & KPI
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'simulator' 
              ? 'bg-[#d946ef]/30 text-white border border-[#f472b6] font-semibold shadow-[0_0_12px_rgba(217,70,239,0.3)]' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Simulateur ROI Rénovation
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'compliance' 
              ? 'bg-[#d946ef]/30 text-white border border-[#f472b6] font-semibold shadow-[0_0_12px_rgba(217,70,239,0.3)]' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Audits & Décret BACS
        </button>
      </div>

      {/* Tab 1: Overview & Realtime Energy Stream */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Électricité Consommée</span>
                <Zap className="w-4 h-4 text-[#f472b6]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">142.8 <span className="text-xs text-slate-400">MWh</span></div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                <span>-18.4% vs Année Référence</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Empreinte Carbone CO2</span>
                <Leaf className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">28.4 <span className="text-xs text-slate-400">Tons CO2e</span></div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Objectif 2030 sur trajectoire</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Score DPE Virtuel</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">Classe B <span className="text-xs text-slate-400">(84 kWh/m²)</span></div>
              <div className="text-[10px] text-slate-400 font-medium">Bâtiment à Haute Performance</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-1">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Conformité BACS GTB</span>
                <ShieldCheck className="w-4 h-4 text-[#f472b6]" />
              </div>
              <div className="text-2xl font-bold text-[#f472b6] font-mono">100% <span className="text-xs text-slate-400">Conforme</span></div>
              <div className="text-[10px] text-slate-400 font-medium">GTB Classe A Automatisée</div>
            </div>
          </div>

          {/* Interactive Weekly Consumption Visualization */}
          <div className="p-6 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Profil de Charge Télé-relevé Linky / IoT</h3>
                <p className="text-xs text-slate-400">Courbe de puissance appelée (kW) au pas de 15 minutes.</p>
              </div>
              <span className="text-xs font-mono text-[#f472b6] bg-[#d946ef]/20 px-3 py-1 rounded-full border border-[#d946ef]/40">
                Direct Modbus / MQTT
              </span>
            </div>

            {/* Simulated Chart Bars */}
            <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2 border-b border-white/10">
              {[
                { day: 'Lun', val: 65, color: '#d946ef' },
                { day: 'Mar', val: 78, color: '#ec4899' },
                { day: 'Mer', val: 72, color: '#d946ef' },
                { day: 'Jeu', val: 85, color: '#f472b6' },
                { day: 'Ven', val: 60, color: '#d946ef' },
                { day: 'Sam', val: 28, color: '#8b5cf6' },
                { day: 'Dim', val: 22, color: '#8b5cf6' },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.val} kW
                  </div>
                  <div 
                    style={{ height: `${item.val}%`, backgroundColor: item.color }} 
                    className="w-full rounded-t-lg transition-all group-hover:brightness-125 shadow-[0_0_10px_rgba(217,70,239,0.3)]"
                  />
                  <div className="text-xs font-mono text-slate-400">{item.day}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Talon de consommation nocturne: <strong>18.2 kW</strong> (Optimal)</span>
              <span>Pic d'appel enregistré: <strong>85.0 kW</strong> (Jeudi 14:30)</span>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: ROI Simulator for Retrofits */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Controls Column */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#f472b6]" />
              <span>Paramètres de l'Immeuble</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Surface Utile (m²) :</label>
                <input
                  type="number"
                  value={surfaceArea}
                  onChange={(e) => handleUpdateSetting('surfaceArea', Number(e.target.value))}
                  className="w-full bg-[#1e0f38] border border-white/20 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#f472b6]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Facture Énergétique Annuelle (€ TTC) :</label>
                <input
                  type="number"
                  value={currentEnergyBill}
                  onChange={(e) => handleUpdateSetting('currentEnergyBill', Number(e.target.value))}
                  className="w-full bg-[#1e0f38] border border-white/20 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#f472b6]"
                />
              </div>

              <div className="pt-2 border-t border-white/10 space-y-3">
                <label className="text-slate-300 font-semibold block">Leviers de Rénovation Énergétique :</label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                  <span>Modernisation CVC & Pompe à Chaleur</span>
                  <input
                    type="checkbox"
                    checked={hvacRetrofit}
                    onChange={(e) => handleUpdateSetting('hvacRetrofit', e.target.checked)}
                    className="w-4 h-4 accent-[#d946ef]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                  <span>Ombrières Photovoltaïques en Toiture</span>
                  <input
                    type="checkbox"
                    checked={solarPanels}
                    onChange={(e) => handleUpdateSetting('solarPanels', e.target.checked)}
                    className="w-4 h-4 accent-[#d946ef]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                  <span>Régulation GTB BACS Classe A (AI Modbus)</span>
                  <input
                    type="checkbox"
                    checked={smartBacsBms}
                    onChange={(e) => handleUpdateSetting('smartBacsBms', e.target.checked)}
                    className="w-4 h-4 accent-[#d946ef]"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Projection Results Column */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">Résultats Estimatifs & Retour sur Investissement</h3>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  Subventions CEE Intégrées
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-slate-400">Économies Énergétiques</div>
                  <div className="text-2xl font-bold font-mono text-[#f472b6]">-{roiResult.savingsPercent}%</div>
                  <div className="text-[10px] text-slate-400">Réduction de consommation</div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-slate-400">Gain Financier Annuel</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">+{roiResult.annualEurosSaved.toLocaleString()} €/an</div>
                  <div className="text-[10px] text-slate-400">Économisé sur facture</div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="text-slate-400">Temps de Retour CAPEX</div>
                  <div className="text-2xl font-bold font-mono text-amber-400">{roiResult.paybackYears} Ans</div>
                  <div className="text-[10px] text-slate-400">Payback amorti</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#d946ef]/10 border border-[#d946ef]/40 space-y-2 text-xs">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#f472b6]" />
                  <span>Analyse ESG Copilot IA</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  L'implémentation combinée des leviers permet d'économiser environ <strong className="text-white">{roiResult.co2TonsReduced} tonnes de CO2/an</strong>. Ce plan garantit l'atteinte directe du palier 2030 du Décret Tertiaire (-40% d'émissions) sans pénalité financière.
                </p>
              </div>
            </div>

            <button
              onClick={handleExportCeeFile}
              className="w-full py-3.5 rounded-xl bizos-cta-pink text-white text-xs font-semibold shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Valider le Plan d'Investissement & Exporter la Fiche CEE (.csv)</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Tab 3: Regulatory Audits & BACS Compliance */}
      {activeTab === 'compliance' && (
        <div className="p-6 rounded-2xl bg-[#130826] border border-[#d946ef]/30 space-y-4 animate-fade-in">
          <h3 className="text-base font-semibold text-white">Registre de Conformité Réglementaire Fr & UE</h3>
          
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">Décret Tertiaire (OPERAT)</div>
                <div className="text-slate-400 mt-0.5">Objectif 2030: -40% d'énergie finale par rapport à l'année de référence (2012).</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold">
                Validé (-42.5%)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">Décret BACS (Building Automation & Control Systems)</div>
                <div className="text-slate-400 mt-0.5">Obligation d'installer une GTB de classe B ou A sur les systèmes CVC &gt; 70kW.</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold">
                GTB Class A Active
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">Norme ISO 50001 (Management de l'Énergie)</div>
                <div className="text-slate-400 mt-0.5">Audit de la boucle d'amélioration continue du système de gestion d'énergie.</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#d946ef]/20 text-[#f472b6] border border-[#d946ef]/40 font-mono font-bold">
                Certifié 2026
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
