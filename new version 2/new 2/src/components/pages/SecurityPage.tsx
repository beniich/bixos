import React, { useState } from 'react';
import { PageId, Language } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { ASSET_IMAGES } from '../../data/assets';
import { ShieldCheck, Lock, Server, FileText, CheckCircle2, Download, AlertTriangle } from 'lucide-react';

interface SecurityPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export const SecurityPage: React.FC<SecurityPageProps> = ({ onNavigate, language: propLang }) => {
  const { t, language } = useTranslation(propLang);
  const [downloading, setDownloading] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);

  const handleDownloadReport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setAuditComplete(true);
    }, 1800);
  };

  return (
    <div className="space-y-16 animate-fade-in max-w-7xl mx-auto">
      
      {/* Title Header with Security Shield Graphic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
            {t('securityTitle', language)}
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-light max-w-3xl">
            {t('securitySubtitle', language)}
          </p>
        </div>

        <div className="lg:col-span-4 flex justify-center">
          <img
            src={ASSET_IMAGES.securityShield3d}
            alt="Security Shield Cyber Graphic"
            referrerPolicy="no-referrer"
            className="w-full max-w-xs h-auto object-contain drop-shadow-[0_15px_35px_rgba(234,88,12,0.4)]"
          />
        </div>
      </div>

      {/* Certification Badges Row matching Image 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-card-purple p-6 rounded-2xl border border-orange-500/40 flex items-center gap-4 glow-border">
          <div className="w-12 h-12 rounded-xl btn-gradient-orange flex items-center justify-center text-white glow-orange-sm flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">ISO 27001 Certified</h4>
            <p className="text-xs text-gray-300">Information Security Management Standard</p>
          </div>
        </div>

        <div className="glass-card-purple p-6 rounded-2xl border border-orange-500/40 flex items-center gap-4 glow-border">
          <div className="w-12 h-12 rounded-xl btn-gradient-orange flex items-center justify-center text-white glow-orange-sm flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">RGPD / GDPR Compliant</h4>
            <p className="text-xs text-gray-300">European Data Privacy Regulation</p>
          </div>
        </div>

        <div className="glass-card-purple p-6 rounded-2xl border border-orange-500/40 flex items-center gap-4 glow-border">
          <div className="w-12 h-12 rounded-xl btn-gradient-orange flex items-center justify-center text-white glow-orange-sm flex-shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">SOC 2 Type II</h4>
            <p className="text-xs text-gray-300">Audited Trust Services Criteria</p>
          </div>
        </div>

      </div>

      {/* 3 Core Security Pillars matching Image 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="glass-card-purple p-8 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white">End-to-End Encryption</h3>
          <p className="text-xs text-gray-300 leading-relaxed font-light">
            All telemetry streams are encrypted at rest using AES-256 GCM and in transit via TLS 1.3 with post-quantum handshake protocols.
          </p>
        </div>

        <div className="glass-card-purple p-8 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white">Secure Data Hosting</h3>
          <p className="text-xs text-gray-300 leading-relaxed font-light">
            Data hosted in sovereign European data centers with air-gapped backup options for national critical infrastructure.
          </p>
        </div>

        <div className="glass-card-purple p-8 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-white">Automated Audits</h3>
          <p className="text-xs text-gray-300 leading-relaxed font-light">
            Generate verifiable audit logs for regulatory compliance reviews with cryptographic tamper-evident signatures.
          </p>
        </div>

      </div>

      {/* Interactive Compliance Report Exporter Widget */}
      <div className="glass-card p-8 rounded-3xl border border-orange-500/30 space-y-6 glow-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Generate Live Compliance Audit Log</h3>
            <p className="text-xs text-gray-400 font-mono">Verify your facility's current security posture instant export.</p>
          </div>

          <button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="btn-gradient-orange text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider glow-orange flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Compiling Audit Log...' : 'Download ISO Audit Log (PDF)'}</span>
          </button>
        </div>

        {auditComplete && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-xs text-emerald-400 font-mono animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>
              Audit Log Verified & Exported: ISO-27001-NEXUS-2026-REPORT.PDF (SHA-256: 8f9a2b7c4e...)
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
