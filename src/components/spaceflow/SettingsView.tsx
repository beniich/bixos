import React, { useState } from 'react';
import { 
  Bell, Shield, Lock, Eye, RefreshCw, LogOut, Check, Smartphone, Zap, CheckCircle2, Moon, Sparkles, Key, AlertTriangle, X
} from 'lucide-react';

interface SettingsViewProps {
  isDarkMode?: boolean;
}

type SettingTab = 'notifications' | 'security' | 'confidentiality' | 'appearance' | 'sync' | 'logout';

export const SettingsView: React.FC<SettingsViewProps> = () => {
  const [activeModal, setActiveModal] = useState<SettingTab | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings state
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappSync, setWhatsappSync] = useState(false);

  const [biometrics, setBiometrics] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('15min');

  const [dataEncryption, setDataEncryption] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);

  const [themeMode, setThemeMode] = useState<'cyber' | 'dark' | 'neon'>('cyber');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleManualSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
      showToast('Synchronisation BizOS Cloud SQL terminée.');
    }, 1500);
  };

  return (
    <div className="relative min-h-[75vh] flex flex-col items-center justify-center px-4 py-8 font-sans text-white animate-fade-in bizos-bg bizos-honeycomb rounded-3xl border border-[#d946ef]/20 shadow-[0_0_50px_rgba(217,70,239,0.1)]">
      
      {/* Background Honeycomb Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-[#d946ef]/15 via-[#ec4899]/20 to-[#a855f7]/15 blur-3xl pointer-events-none rounded-full" />

      {/* Main Container matching screenshot */}
      <div className="relative z-10 w-full max-w-xl mx-auto text-center space-y-8">
        
        {/* Header Title matching screenshot: "Paramètres BizOS Mobile" */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight">
            Paramètres BizOS <span className="bizos-title-pink font-light text-[#f472b6] drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]">Mobile</span>
          </h1>
          <p className="text-sm text-[#cbd5e1] font-light max-w-md mx-auto leading-relaxed">
            Application mobile BizOS pour la gestion d'entreprise unifiée.
          </p>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-[#d946ef]/20 border border-[#d946ef]/50 text-white text-xs font-medium animate-fade-in flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.3)]">
            <CheckCircle2 className="w-4 h-4 text-[#f472b6]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Stacked Central Pill Buttons matching exact screenshot */}
        <div className="space-y-3.5 max-w-sm mx-auto">
          
          {/* Notifications */}
          <button
            onClick={() => setActiveModal('notifications')}
            className="w-full py-3.5 px-6 rounded-full bizos-pill-btn text-sm text-[#e2e8f0] font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Notifications</span>
          </button>

          {/* Sécurité */}
          <button
            onClick={() => setActiveModal('security')}
            className="w-full py-3.5 px-6 rounded-full bizos-pill-btn text-sm text-[#e2e8f0] font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sécurité</span>
          </button>

          {/* Confidentialité */}
          <button
            onClick={() => setActiveModal('confidentiality')}
            className="w-full py-3.5 px-6 rounded-full bizos-pill-btn text-sm text-[#e2e8f0] font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Confidentialité</span>
          </button>

          {/* Apparence */}
          <button
            onClick={() => setActiveModal('appearance')}
            className="w-full py-3.5 px-6 rounded-full bizos-pill-btn text-sm text-[#e2e8f0] font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Apparence</span>
          </button>

          {/* Synchronisation */}
          <button
            onClick={() => setActiveModal('sync')}
            className="w-full py-3.5 px-6 rounded-full bizos-pill-btn text-sm text-[#e2e8f0] font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Synchronisation</span>
            {syncStatus === 'syncing' && <RefreshCw className="w-3.5 h-3.5 text-[#f472b6] animate-spin" />}
          </button>

          {/* Déconnexion (Red glowing button at bottom as screenshot) */}
          <button
            onClick={() => setActiveModal('logout')}
            className="w-full py-3.5 px-6 rounded-full bizos-pill-danger text-sm text-[#fb7185] font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Déconnexion</span>
          </button>

        </div>

      </div>

      {/* Interactive Modal for Settings Tabs */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#130826] border border-[#d946ef]/40 p-6 shadow-[0_0_40px_rgba(217,70,239,0.3)] space-y-6">
            
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Notifications Panel */}
            {activeModal === 'notifications' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#d946ef]/20 text-[#f472b6]">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Notifications Push & Alerts</h3>
                    <p className="text-xs text-slate-400">Gérer les canaux d'avertissement BizOS Mobile</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-medium text-white">Alertes Push Mobile</div>
                      <div className="text-[10px] text-slate-400">Notifications instantanées sur écran verrouillé</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pushEnabled}
                      onChange={(e) => setPushEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[#d946ef] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-medium text-white">Rapports Email Hebdomadaires</div>
                      <div className="text-[10px] text-slate-400">Synthèse d'activité et kpis</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#d946ef] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-medium text-white">Canal WhatsApp Executive</div>
                      <div className="text-[10px] text-slate-400">Alertes haute priorité pour dirigeants</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={whatsappSync}
                      onChange={(e) => setWhatsappSync(e.target.checked)}
                      className="w-4 h-4 accent-[#d946ef] cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveModal(null);
                    showToast('Préférences de notifications enregistrées.');
                  }}
                  className="w-full py-3 rounded-xl bizos-cta-pink text-white font-semibold text-xs shadow-lg cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            )}

            {/* Sécurité Panel */}
            {activeModal === 'security' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#d946ef]/20 text-[#f472b6]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Sécurité & Zero-Trust</h3>
                    <p className="text-xs text-slate-400">Protection biométrique et authentification 2FA</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-medium text-white">Authentification FaceID / Empreinte</div>
                      <div className="text-[10px] text-slate-400">Requis à l'ouverture de l'application</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={biometrics}
                      onChange={(e) => setBiometrics(e.target.checked)}
                      className="w-4 h-4 accent-[#d946ef] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-medium text-white">Double Facteur (2FA / TOTP)</div>
                      <div className="text-[10px] text-slate-400">Valide via Google Authenticator</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={(e) => setTwoFactor(e.target.checked)}
                      className="w-4 h-4 accent-[#d946ef] cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="font-medium text-white mb-1">Délai d'inactivité avant verrouillage</div>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="w-full bg-[#1e0f38] text-white p-2 rounded-xl border border-white/20 text-xs focus:outline-none"
                    >
                      <option value="5min">5 minutes</option>
                      <option value="15min">15 minutes (Recommandé)</option>
                      <option value="1h">1 heure</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveModal(null);
                    showToast('Paramètres de sécurité mis à jour.');
                  }}
                  className="w-full py-3 rounded-xl bizos-cta-pink text-white font-semibold text-xs shadow-lg cursor-pointer"
                >
                  Valider la Sécurité
                </button>
              </div>
            )}

            {/* Confidentialité Panel */}
            {activeModal === 'confidentiality' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#d946ef]/20 text-[#f472b6]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Confidentialité & Données</h3>
                    <p className="text-xs text-slate-400">Souveraineté des clés de chiffrement AES-256</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-medium text-white">Chiffrement de bout en bout</div>
                      <div className="text-[10px] text-slate-400">Clefs de chiffrement résidant sur serveur dédié</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={dataEncryption}
                      onChange={(e) => setDataEncryption(e.target.checked)}
                      className="w-4 h-4 accent-[#d946ef] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-medium text-white">Partage d'analyse télémétrique anonyme</div>
                      <div className="text-[10px] text-slate-400">Amélioration continue des modèles IA</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={shareAnalytics}
                      onChange={(e) => setShareAnalytics(e.target.checked)}
                      className="w-4 h-4 accent-[#d946ef] cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveModal(null);
                    showToast('Charte de confidentialité appliquée.');
                  }}
                  className="w-full py-3 rounded-xl bizos-cta-pink text-white font-semibold text-xs shadow-lg cursor-pointer"
                >
                  Confirmer
                </button>
              </div>
            )}

            {/* Apparence Panel */}
            {activeModal === 'appearance' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#d946ef]/20 text-[#f472b6]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Thème & Interface</h3>
                    <p className="text-xs text-slate-400">Personnalisation visuelle BizOS Cyber Violet</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => setThemeMode('cyber')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      themeMode === 'cyber' ? 'border-[#f472b6] bg-[#d946ef]/20 text-white' : 'border-white/10 bg-white/5 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Cyber Violet</div>
                    <div className="text-[9px] opacity-75">Néon Néon</div>
                  </button>
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      themeMode === 'dark' ? 'border-[#f472b6] bg-[#d946ef]/20 text-white' : 'border-white/10 bg-white/5 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Noir Profond</div>
                    <div className="text-[9px] opacity-75">Sombre Pur</div>
                  </button>
                  <button
                    onClick={() => setThemeMode('neon')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      themeMode === 'neon' ? 'border-[#f472b6] bg-[#d946ef]/20 text-white' : 'border-white/10 bg-white/5 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Ultra Magenta</div>
                    <div className="text-[9px] opacity-75">Haute Visibilité</div>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setActiveModal(null);
                    showToast('Thème visuel réappliqué.');
                  }}
                  className="w-full py-3 rounded-xl bizos-cta-pink text-white font-semibold text-xs shadow-lg cursor-pointer"
                >
                  Appliquer le Thème
                </button>
              </div>
            )}

            {/* Synchronisation Panel */}
            {activeModal === 'sync' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#d946ef]/20 text-[#f472b6]">
                    <RefreshCw className={`w-5 h-5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Synchronisation Cloud & Cache</h3>
                    <p className="text-xs text-slate-400">Statut du miroir PostgreSQL / Cache Local</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Dernière synchro:</span>
                    <span className="text-white font-mono">Aujourd'hui, 10:53</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Base de données:</span>
                    <span className="text-emerald-400 font-medium">Connectée (Cloud SQL)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Mode Hors Ligne:</span>
                    <span className="text-[#f472b6]">Opérationnel (IndexedDB)</span>
                  </div>
                </div>

                <button
                  onClick={handleManualSync}
                  className="w-full py-3 rounded-xl bizos-cta-pink text-white font-semibold text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>Lancer une synchronisation manuelle</span>
                </button>
              </div>
            )}

            {/* Déconnexion Confirmation */}
            {activeModal === 'logout' && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/40">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Confirmer la déconnexion ?</h3>
                  <p className="text-xs text-slate-400 mt-1">Vous devrez vous ré-authentifier pour accéder aux services BizOS Mobile.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-medium cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      showToast('Vous avez été déconnecté avec succès.');
                    }}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs text-white font-bold cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
