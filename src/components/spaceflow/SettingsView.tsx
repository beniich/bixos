import React, { useState } from 'react';
import { PageId } from '../../types';
import { 
  Bell, Shield, Lock, Sparkles, RefreshCw, LogOut, CheckCircle2, 
  ChevronRight, Smartphone, AlertTriangle, Moon, Sun, Check, ArrowLeft, X
} from 'lucide-react';

interface SettingsViewProps {
  onNavigate?: (page: PageId) => void;
  isDarkMode?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [bioAuth, setBioAuth] = useState(true);
  const [autoLockTime, setAutoLockTime] = useState('15min');
  const [dataEncryption, setDataEncryption] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [themeMode, setThemeMode] = useState<'cyber' | 'dark' | 'neon'>('cyber');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleManualSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
      showToast('Databases fully synced.');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }, 1500);
  };

  const handleLogout = () => {
    showToast('Logout initiated...');
    setTimeout(() => {
      if (onNavigate) onNavigate('dashboard');
    }, 1000);
  };

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 font-sans text-white animate-fade-in flex flex-col justify-center items-center">
      
      {/* Background Neon Halo matching screenshot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d946ef]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container matching screenshot */}
      <div className="relative z-10 w-full max-w-xl mx-auto text-center space-y-8">
        
        {/* Header Title matching screenshot: "BizOS Mobile Settings" */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight">
            BizOS <span className="bizos-title-pink font-light text-[#f472b6] drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]">Mobile</span> Settings
          </h1>
          <p className="text-sm text-[#cbd5e1] font-light max-w-md mx-auto leading-relaxed">
            BizOS Mobile App for Unified Enterprise Management.
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

          {/* Security */}
          <button
            onClick={() => setActiveModal('security')}
            className="w-full py-3.5 px-6 rounded-full bizos-pill-btn text-sm text-[#e2e8f0] font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Security</span>
          </button>

          {/* Privacy */}
          <button
            onClick={() => setActiveModal('confidentiality')}
            className="w-full py-3.5 px-6 rounded-full bizos-pill-btn text-sm text-[#e2e8f0] font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Privacy</span>
          </button>

          {/* Appearance */}
          <button
            onClick={() => setActiveModal('appearance')}
            className="w-full py-3.5 px-6 rounded-full bizos-pill-btn text-sm text-[#e2e8f0] font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Appearance</span>
          </button>

          {/* Synchronization */}
          <button
            onClick={() => setActiveModal('sync')}
            className="w-full py-3.5 px-6 rounded-full bizos-pill-btn text-sm text-[#e2e8f0] font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Synchronization</span>
            {syncStatus === 'syncing' && <RefreshCw className="w-3.5 h-3.5 text-[#f472b6] animate-spin" />}
          </button>

          {/* Logout (Red glowing button at bottom as screenshot) */}
          <button
            onClick={() => setActiveModal('logout')}
            className="w-full py-3.5 px-6 rounded-full bizos-pill-danger text-sm text-[#fb7185] font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Log Out</span>
          </button>

        </div>

      </div>

      {/* Interactive Modal for Settings Tabs */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#130826] border border-[#d946ef]/40 p-6 shadow-[0_0_40px_rgba(217,70,239,0.3)] space-y-6">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
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
                    <h3 className="text-lg font-semibold text-white">Push & Alert Preferences</h3>
                    <p className="text-xs text-slate-400">Configure critical alerts for mobile</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-medium text-white">Push Notifications</div>
                      <div className="text-[10px] text-slate-400">Real-time alerts for work orders</div>
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
                      <div className="font-medium text-white">Email Digest</div>
                      <div className="text-[10px] text-slate-400">Daily summary of ESG reports</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#d946ef] cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveModal(null);
                    showToast('Notification settings saved.');
                  }}
                  className="w-full py-3 rounded-xl bizos-cta-pink text-white font-semibold text-xs shadow-lg cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            )}

            {/* Security Panel */}
            {activeModal === 'security' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#d946ef]/20 text-[#f472b6]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Biometrics & Access</h3>
                    <p className="text-xs text-slate-400">FaceID & TouchID protection</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-medium text-white">Biometric Auth</div>
                      <div className="text-[10px] text-slate-400">Require FaceID / Fingerprint on launch</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={bioAuth}
                      onChange={(e) => setBioAuth(e.target.checked)}
                      className="w-4 h-4 accent-[#d946ef] cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="font-medium text-white mb-1">Auto-Lock Delay</div>
                    <select
                      value={autoLockTime}
                      onChange={(e) => setAutoLockTime(e.target.value)}
                      className="w-full bg-[#1e0f38] text-white p-2 rounded-xl border border-white/20 text-xs focus:outline-none"
                    >
                      <option value="5min">5 minutes</option>
                      <option value="15min">15 minutes (Recommended)</option>
                      <option value="1h">1 hour</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveModal(null);
                    showToast('Security settings updated.');
                  }}
                  className="w-full py-3 rounded-xl bizos-cta-pink text-white font-semibold text-xs shadow-lg cursor-pointer"
                >
                  Confirm Security
                </button>
              </div>
            )}

            {/* Privacy Panel */}
            {activeModal === 'confidentiality' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#d946ef]/20 text-[#f472b6]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Privacy & Data</h3>
                    <p className="text-xs text-slate-400">Sovereign AES-256 encryption keys</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div>
                      <div className="font-medium text-white">End-to-End Encryption</div>
                      <div className="text-[10px] text-slate-400">Encryption keys hosted on dedicated server</div>
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
                      <div className="font-medium text-white">Anonymous Telemetry Sharing</div>
                      <div className="text-[10px] text-slate-400">Continuous AI model improvements</div>
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
                    showToast('Privacy settings applied.');
                  }}
                  className="w-full py-3 rounded-xl bizos-cta-pink text-white font-semibold text-xs shadow-lg cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            )}

            {/* Appearance Panel */}
            {activeModal === 'appearance' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#d946ef]/20 text-[#f472b6]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Theme & UI</h3>
                    <p className="text-xs text-slate-400">BizOS Cyber Violet customization</p>
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
                    <div className="text-[9px] opacity-75">Neon Glow</div>
                  </button>
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      themeMode === 'dark' ? 'border-[#f472b6] bg-[#d946ef]/20 text-white' : 'border-white/10 bg-white/5 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Deep Black</div>
                    <div className="text-[9px] opacity-75">Pure Dark</div>
                  </button>
                  <button
                    onClick={() => setThemeMode('neon')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      themeMode === 'neon' ? 'border-[#f472b6] bg-[#d946ef]/20 text-white' : 'border-white/10 bg-white/5 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold mb-1">Ultra Magenta</div>
                    <div className="text-[9px] opacity-75">High Contrast</div>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setActiveModal(null);
                    showToast('Visual theme re-applied.');
                  }}
                  className="w-full py-3 rounded-xl bizos-cta-pink text-white font-semibold text-xs shadow-lg cursor-pointer"
                >
                  Apply Theme
                </button>
              </div>
            )}

            {/* Synchronization Panel */}
            {activeModal === 'sync' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[#d946ef]/20 text-[#f472b6]">
                    <RefreshCw className={`w-5 h-5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Cloud & Cache Sync</h3>
                    <p className="text-xs text-slate-400">PostgreSQL Mirror / Local Cache status</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Last Sync:</span>
                    <span className="text-white font-mono">Today, 10:53</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Database:</span>
                    <span className="text-emerald-400 font-medium">Connected (Cloud SQL)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Offline Mode:</span>
                    <span className="text-[#f472b6]">Operational (IndexedDB)</span>
                  </div>
                </div>

                <button
                  onClick={handleManualSync}
                  className="w-full py-3 rounded-xl bizos-cta-pink text-white font-semibold text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  <span>Launch manual sync</span>
                </button>
              </div>
            )}

            {/* Logout Confirmation */}
            {activeModal === 'logout' && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/40">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Confirm Logout?</h3>
                  <p className="text-xs text-slate-400 mt-1">You will need to re-authenticate to access BizOS Mobile services.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                  >
                    Log Out
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
