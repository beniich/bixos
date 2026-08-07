import React, { useState, useRef } from 'react';
import { 
  Smartphone, Wifi, WifiOff, QrCode, Wrench, CheckCircle2, 
  MapPin, Clock, Camera, PenTool, AlertTriangle, ShieldCheck, Trash2
} from 'lucide-react';
import { useFieldTechStore, WorkOrder } from '../../services/fieldTechStore';

export const FieldTechMobileView: React.FC = () => {
  const { workOrders, updateWorkOrder, addWorkOrder } = useFieldTechStore();

  const [isOnline, setIsOnline] = useState(true);
  const [offlineSyncQueue, setOfflineSyncQueue] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);
  const [scannedEquipment, setScannedEquipment] = useState<string | null>(null);

  // Active modal order for completion
  const [activeOrder, setActiveOrder] = useState<WorkOrder | null>(null);
  const [partsUsed, setPartsUsed] = useState('SKF Bearing 6204-2RSH');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [signatureSigned, setSignatureSigned] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>(undefined);

  // Canvas ref for signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  const toggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const handleScanQr = () => {
    setShowQrModal(true);
    setTimeout(() => {
      setScannedEquipment('Equipment ELEV-01 (Drive Inverter Schneider Altivar 630)');
    }, 1500);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    setSignatureSigned(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    if (canvasRef.current) {
      setSignatureUrl(canvasRef.current.toDataURL());
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureSigned(false);
    setSignatureUrl(undefined);
  };

  const handleCloseOrder = (orderId: string) => {
    updateWorkOrder(orderId, {
      status: 'Closed',
      partsUsed,
      photoUrl,
      signatureUrl,
      closedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });

    if (!isOnline) {
      setOfflineSyncQueue((q) => q + 1);
    }
    setActiveOrder(null);
  };

  return (
    <div className="space-y-6 text-white animate-fade-in">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#140826]/90 border border-[#d946ef]/30 shadow-[0_0_30px_rgba(217,70,239,0.15)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#f472b6] mb-1">
            <Smartphone className="w-4 h-4" />
            <span>FIELDTECH MOBILE & PWA OFFLINE-FIRST ENGINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Field Tech Workspace & Offline Mode</h2>
          <p className="text-xs text-slate-300">Manage Work Orders (WO), scan equipment QR codes, and close with digital signature.</p>
        </div>

        {/* Offline Toggle Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleOnline}
            className={`px-3.5 py-2 rounded-full text-xs font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              isOnline 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isOnline ? 'Network Connected' : 'Offline Mode Active (IndexedDB)'}</span>
          </button>

          {offlineSyncQueue > 0 && (
            <span className="px-3 py-1 rounded-full bg-[#d946ef]/20 border border-[#d946ef]/40 text-[#f472b6] text-xs font-mono animate-pulse">
              {offlineSyncQueue} WOs pending sync
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Bar: Scan QR Code */}
      <div className="p-4 rounded-2xl bg-[#130826] border border-[#d946ef]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#d946ef]/20 text-[#f472b6]">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">NFC & QR Code Equipment Scanner</h3>
            <p className="text-xs text-slate-400">Instantly identify a component on site to open its technical file.</p>
          </div>
        </div>

        <button
          onClick={handleScanQr}
          className="w-full sm:w-auto px-6 py-2.5 rounded-full bizos-cta-pink text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-transform hover:scale-105"
        >
          <QrCode className="w-4 h-4" />
          <span>Launch Camera Scanner</span>
        </button>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Assigned Work Orders (WO) ({workOrders.length})</h3>
          <span className="text-xs text-slate-400">SLA Priority Order</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workOrders.map((order) => (
            <div 
              key={order.id}
              className={`p-5 rounded-2xl bg-[#130826] border transition-all space-y-4 flex flex-col justify-between ${
                order.status === 'Closed' || order.status === 'Clôturé' 
                  ? 'border-white/10 opacity-75' 
                  : 'border-[#d946ef]/40 hover:border-[#f472b6] shadow-[0_0_15px_rgba(217,70,239,0.1)]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#f472b6] bg-[#d946ef]/20 px-2.5 py-0.5 rounded-full">
                    {order.id}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    order.status === 'Closed' || order.status === 'Clôturé'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : order.status === 'In Progress' || order.status === 'En cours'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}>
                    {order.status === 'Clôturé' ? 'Closed' : order.status === 'À faire' ? 'To Do' : order.status === 'En cours' ? 'In Progress' : order.status}
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm leading-snug">{order.title}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#f472b6]" />
                  <span>{order.location}</span>
                </p>
                <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                  {order.description}
                </p>

                {order.signatureUrl && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                      ✓ Signed by client
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{order.dueDate}</span>
                </span>

                {order.status !== 'Closed' && order.status !== 'Clôturé' && (
                  <button
                    onClick={() => {
                      setActiveOrder(order);
                      setPhotoUrl(undefined);
                      setSignatureSigned(false);
                      setSignatureUrl(undefined);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#d946ef]/30 hover:bg-[#d946ef]/50 text-white font-semibold text-xs border border-[#f472b6] cursor-pointer transition-colors"
                  >
                    Process WO
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#130826] border border-[#d946ef]/50 p-6 shadow-2xl space-y-6 text-center">
            <h3 className="text-lg font-bold text-white">QR Code Camera Scanner</h3>
            
            {/* Viewfinder simulation */}
            <div className="relative w-48 h-48 mx-auto rounded-2xl bg-black border-2 border-dashed border-[#f472b6] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-x-0 h-0.5 bg-[#f472b6] animate-pulse shadow-[0_0_15px_rgba(244,114,182,1)]" style={{ top: '50%' }} />
              <QrCode className="w-16 h-16 text-slate-600 animate-pulse" />
            </div>

            {scannedEquipment ? (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold animate-fade-in">
                {scannedEquipment}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Point the camera at the equipment NFC / QR tag...</p>
            )}

            <button
              onClick={() => { setShowQrModal(false); setScannedEquipment(null); }}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
            >
              Close Scanner
            </button>
          </div>
        </div>
      )}

      {/* Work Order Closure Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-[#130826] border border-[#d946ef]/50 p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#f472b6]" />
                <h3 className="text-base font-bold text-white">Work Order Closure - {activeOrder.id}</h3>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="text-slate-400 hover:text-white cursor-pointer text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Spare Parts Consumed:</label>
                <input
                  type="text"
                  value={partsUsed}
                  onChange={(e) => setPartsUsed(e.target.value)}
                  className="w-full bg-[#1e0f38] border border-white/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#f472b6]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Visual Proof (Component Photo):</label>
                {photoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#d946ef]/40 max-h-40">
                    <img src={photoUrl} alt="Intervention photo" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotoUrl(undefined)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500 text-white text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full py-3 rounded-xl bg-white/5 border border-dashed border-white/30 hover:border-[#f472b6] text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <Camera className="w-4 h-4 text-[#f472b6]" />
                    <span>Add photo from camera</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Client / Site Manager Signature:</label>
                  {signatureSigned && (
                    <button onClick={clearSignature} className="text-[10px] text-rose-400 hover:underline">
                      Clear
                    </button>
                  )}
                </div>

                <div className="relative rounded-2xl bg-white/5 border border-white/20 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={100}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-24 cursor-crosshair touch-none bg-black/30"
                  />
                  {!signatureSigned && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-500 text-xs italic">
                      Draw signature here using finger or mouse...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCloseOrder(activeOrder.id)}
              className="w-full py-3.5 rounded-xl bizos-cta-pink text-white font-bold text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Validate & Close Work Order</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
