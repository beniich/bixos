import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface QrScannerModalProps {
  onScan: (scannedResult: string) => void;
  onClose: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [detectedText, setDetectedText] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    async function startCamera() {
      if (!videoRef.current) return;
      try {
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (!isMounted) return;
            if (result) {
              const text = result.getText();
              setDetectedText(text);
              setIsScanning(false);
              onScan(text);
            }
          }
        );
      } catch (cameraErr: any) {
        if (isMounted) {
          console.warn('Camera access error:', cameraErr);
          setError(cameraErr?.message || 'Accès à la caméra non autorisé ou caméra absente.');
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (readerRef.current) {
        // Stop scanning
        try {
          (readerRef.current as any).stopStreams?.();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [onScan]);

  const handleSimulateScan = () => {
    const mockEquipment = 'ELEV-01 (Drive Inverter Schneider Altivar 630 - Étage 5 Moteur)';
    setDetectedText(mockEquipment);
    setIsScanning(false);
    onScan(mockEquipment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#130826] border border-[#d946ef]/40 p-6 space-y-4 shadow-[0_0_50px_rgba(217,70,239,0.25)] text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#d946ef]/20 text-[#f472b6]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Scanner QR Code Équipement</h3>
              <p className="text-xs text-slate-400">Pointez la caméra vers le tag asset ou QR code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Camera Container */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />

          {/* Scanner Overlay Box */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-[#f472b6] rounded-2xl relative shadow-[0_0_20px_rgba(244,114,182,0.5)]">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#f472b6] -mt-1 -ml-1" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#f472b6] -mt-1 -mr-1" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#f472b6] -mb-1 -ml-1" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#f472b6] -mb-1 -mr-1" />
              
              {isScanning && (
                <div className="w-full h-0.5 bg-[#f472b6] shadow-[0_0_10px_#f472b6] animate-pulse my-24" />
              )}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="absolute inset-x-3 bottom-3 p-3 rounded-xl bg-rose-900/90 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Detected Tag Badge */}
          {detectedText && (
            <div className="absolute inset-x-3 bottom-3 p-3 rounded-xl bg-emerald-900/90 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate font-mono">Détecté: {detectedText}</span>
            </div>
          )}
        </div>

        {/* Action Controls & Simulation Option */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleSimulateScan}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#f472b6]" />
            <span>Simuler Scan Tag Asset ELEV-01</span>
          </button>

          <p className="text-[10px] text-center text-slate-500">
            Scanner QR compatible ISO/IEC 18004 & Barcode 128
          </p>
        </div>

      </div>
    </div>
  );
};
