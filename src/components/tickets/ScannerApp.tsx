import React, { useEffect, useState } from 'react';
import { verifyTicketData } from '../../services/qrCodeService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, Scan, History, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ScanResult {
  ticketId: string;
  eventId: string;
  userId: string;
  timestamp: number;
  status: 'VALID' | 'INVALID' | 'ALREADY_SCANNED' | 'ERROR';
  message?: string;
}

export const ScannerApp: React.FC = () => {
  const { user, logout } = useAuth();
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerStarted, setScannerStarted] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      // Configuration pour Html5QrcodeScanner
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(onScanSuccess, onScanFailure);
      setScannerStarted(true);
    }

    return () => {
      if (scanner && scannerStarted) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isScanning]);

  const onScanSuccess = async (decodedText: string) => {
    // Prevent multiple rapid scans
    if (lastScan && Date.now() - lastScan.timestamp < 3000) return;

    try {
      // Le QR Code contient le payload JSON signé
      const payload = JSON.parse(decodedText);
      
      // 1. Vérification cryptographique locale
      const isValid = await verifyTicketData(payload);
      
      if (!isValid) {
        handleResult({
          ticketId: payload.ticketId || 'Inconnu',
          eventId: payload.eventId || 'Inconnu',
          userId: payload.userId || 'Inconnu',
          timestamp: Date.now(),
          status: 'INVALID',
          message: 'Signature cryptographique invalide (Billet falsifié)'
        });
        return;
      }

      // 2. TODO: Appel au backend (Firestore/Functions) pour vérifier si déjà scanné
      // const backendResult = await validateTicketStatus(payload.ticketId, payload.eventId);
      
      // Simulation pour l'exemple
      const isAlreadyScanned = Math.random() > 0.8; // 20% chance pour la démo
      
      if (isAlreadyScanned) {
        handleResult({
          ...payload,
          timestamp: Date.now(),
          status: 'ALREADY_SCANNED',
          message: 'Billet déjà scanné à 19:42'
        });
      } else {
        handleResult({
          ...payload,
          timestamp: Date.now(),
          status: 'VALID',
          message: 'Accès autorisé'
        });
      }

    } catch (err) {
      handleResult({
        ticketId: 'Erreur Lecture',
        eventId: '',
        userId: '',
        timestamp: Date.now(),
        status: 'ERROR',
        message: 'Format du QR code non reconnu'
      });
    }
  };

  const onScanFailure = (error: any) => {
    // Ignorer les erreurs de scan continues (pas de QR trouvé dans la frame)
  };

  const handleResult = (result: ScanResult) => {
    setLastScan(result);
    setScanHistory(prev => [result, ...prev].slice(0, 50)); // Keep last 50
  };

  return (
    <div className="min-h-screen bg-[#0e0618] text-white">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scan className="text-fuchsia-400" />
          <h1 className="font-bold">EcoAsset Scanner</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:inline">
            Agent: {user?.displayName || user?.email || 'Scanner 01'}
          </span>
          <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <LogOut size={20} className="text-gray-400" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* Scanner View */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10 p-2 bg-black/40">
          {!isScanning ? (
            <div className="aspect-square flex flex-col items-center justify-center p-6 text-center">
              <Scan size={64} className="text-fuchsia-500/50 mb-4" />
              <h2 className="text-xl font-bold mb-2">Prêt à scanner</h2>
              <p className="text-gray-400 text-sm mb-6">
                Assurez-vous que l'objectif est propre et qu'il y a suffisamment de lumière.
              </p>
              <button 
                onClick={() => setIsScanning(true)}
                className="bizos-cta-pink w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Scan size={20} />
                Lancer la Caméra
              </button>
            </div>
          ) : (
            <div className="relative">
              <div id="reader" className="w-full rounded-xl overflow-hidden bg-black"></div>
              <button 
                onClick={() => setIsScanning(false)}
                className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white p-2 rounded-full border border-white/20 hover:bg-black/80 z-50"
              >
                Fermer
              </button>
            </div>
          )}
        </div>

        {/* Last Scan Result */}
        {lastScan && (
          <div className={`p-4 rounded-xl border ${
            lastScan.status === 'VALID' ? 'bg-green-500/10 border-green-500/30' : 
            lastScan.status === 'ALREADY_SCANNED' ? 'bg-amber-500/10 border-amber-500/30' : 
            'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-start gap-3">
              {lastScan.status === 'VALID' ? (
                <CheckCircle className="text-green-500 shrink-0" size={24} />
              ) : lastScan.status === 'ALREADY_SCANNED' ? (
                <History className="text-amber-500 shrink-0" size={24} />
              ) : (
                <XCircle className="text-red-500 shrink-0" size={24} />
              )}
              
              <div>
                <h3 className={`font-bold text-lg leading-none mb-1 ${
                  lastScan.status === 'VALID' ? 'text-green-400' : 
                  lastScan.status === 'ALREADY_SCANNED' ? 'text-amber-400' : 
                  'text-red-400'
                }`}>
                  {lastScan.status === 'VALID' ? 'Billet Valide' : 
                   lastScan.status === 'ALREADY_SCANNED' ? 'Déjà Scanné' : 
                   'Billet Invalide'}
                </h3>
                <p className="text-sm text-gray-300">{lastScan.message}</p>
                <div className="mt-2 text-xs text-gray-500 font-mono">
                  ID: {lastScan.ticketId}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Quick View */}
        <div className="glass-card rounded-xl border border-white/10 p-4">
          <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
            <History size={16} /> Historique récent
          </h3>
          {scanHistory.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Aucun scan récent</p>
          ) : (
            <div className="space-y-2">
              {scanHistory.slice(0, 5).map((scan, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 text-sm">
                  <span className="font-mono text-gray-400">{scan.ticketId.substring(0, 8)}...</span>
                  <span className={`font-medium ${
                    scan.status === 'VALID' ? 'text-green-400' : 
                    scan.status === 'ALREADY_SCANNED' ? 'text-amber-400' : 
                    'text-red-400'
                  }`}>
                    {scan.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
