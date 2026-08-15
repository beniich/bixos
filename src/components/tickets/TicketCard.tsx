import React from 'react';
import { QRCodeDisplay } from './QRCodeDisplay';
import { Calendar, MapPin, User, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TicketData {
  id: string;
  eventId: string;
  userId: string;
  eventTitle: string;
  date: number | string;
  venueName: string;
  seatInfo: {
    row: string;
    number: string;
    categoryName: string;
  };
  attendeeName: string;
}

interface TicketCardProps {
  ticket: TicketData;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const formattedDate = format(new Date(ticket.date), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });

  return (
    <div className="relative max-w-sm w-full mx-auto overflow-hidden rounded-2xl glass-card-purple border border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)] transition-transform hover:scale-[1.02] duration-300">
      {/* Decorative Circles for Ticket Cutouts */}
      <div className="absolute top-[60%] -left-4 w-8 h-8 rounded-full bg-[#0e0618] border-r border-fuchsia-500/30 z-10"></div>
      <div className="absolute top-[60%] -right-4 w-8 h-8 rounded-full bg-[#0e0618] border-l border-fuchsia-500/30 z-10"></div>
      
      {/* Dotted Line */}
      <div className="absolute top-[60%] left-4 right-4 h-px border-b-2 border-dashed border-white/20 z-0"></div>

      {/* Ticket Header (Event Info) */}
      <div className="p-6 pb-8 bg-gradient-to-br from-fuchsia-900/40 to-transparent">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
            <Ticket className="text-fuchsia-400" size={24} />
          </div>
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
            {ticket.id.split('-')[0] || ticket.id.substring(0, 8)}
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{ticket.eventTitle}</h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="text-fuchsia-400 shrink-0 mt-0.5" size={18} />
            <span className="text-gray-200 text-sm capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="text-fuchsia-400 shrink-0 mt-0.5" size={18} />
            <span className="text-gray-200 text-sm">{ticket.venueName}</span>
          </div>
          <div className="flex items-start gap-3">
            <User className="text-fuchsia-400 shrink-0 mt-0.5" size={18} />
            <span className="text-gray-200 text-sm">{ticket.attendeeName}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-end bg-white/5 rounded-xl p-4 border border-white/10">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Catégorie</p>
            <p className="text-white font-semibold">{ticket.seatInfo.categoryName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Place</p>
            <p className="text-white font-bold text-xl leading-none">
              {ticket.seatInfo.row}{ticket.seatInfo.number}
            </p>
          </div>
        </div>
      </div>

      {/* Ticket Footer (QR Code) */}
      <div className="p-6 pt-10 flex flex-col items-center bg-black/20">
        <QRCodeDisplay 
          ticketId={ticket.id}
          eventId={ticket.eventId}
          userId={ticket.userId}
          size={160}
        />
        <p className="mt-4 text-xs text-gray-500 text-center">
          Ce QR code est unique et personnel.<br/>
          Ne le partagez pas sur les réseaux sociaux.
        </p>
      </div>
    </div>
  );
};
