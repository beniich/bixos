import React, { useEffect, useState } from 'react';
import { generateSecureTicketData } from '../../services/qrCodeService';
import { QRCodeSVG } from 'qrcode.react'; // Using standard qrcode lib usually available
import { Loader2, ShieldCheck, Ticket } from 'lucide-react';

interface QRCodeDisplayProps {
  ticketId: string;
  eventId: string;
  userId: string;
  className?: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  ticketId,
  eventId,
  userId,
  className = '',
  size = 200
}) => {
  const [qrData, setQrData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const generateQR = async () => {
      try {
        const payload = await generateSecureTicketData(ticketId, eventId, userId);
        if (mounted) {
          // We stringify the signed payload for the QR content
          setQrData(JSON.stringify(payload));
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Erreur génération QR');
        }
      }
    };

    generateQR();

    return () => {
      mounted = false;
    };
  }, [ticketId, eventId, userId]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg ${className}`}>
        <span className="text-red-400 text-sm text-center">{error}</span>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-white/5 rounded-lg ${className}`} style={{ width: size, height: size }}>
        <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className="bg-white p-3 rounded-xl shadow-lg relative group">
        <QRCodeSVG 
          value={qrData} 
          size={size}
          level="H" // High error correction
          includeMargin={false}
        />
        {/* Anti-screenshot overlay pattern (conceptual for CSS) */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIj48L3JlY3Q+Cjwvc3ZnPg==')] transition-opacity duration-300"></div>
      </div>
      
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-green-400 bg-green-900/30 px-3 py-1.5 rounded-full border border-green-500/30">
        <ShieldCheck size={14} />
        <span>Billet Sécurisé HMAC</span>
      </div>
    </div>
  );
};
