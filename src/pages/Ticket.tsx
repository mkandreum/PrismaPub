import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft } from 'lucide-react';
import { OVERLAY_TRANSITION, SURFACE_ENTER_TRANSITION } from '../motion';

interface TicketData {
  id: number;
  qr_code: string;
  user_name: string;
  user_email: string;
  event_title: string;
  event_date: string;
  event_time: string;
  event_image: string;
}

export default function Ticket() {
  const { qr_code } = useParams();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tickets/${qr_code}`)
      .then((res) => res.json())
      .then((data) => {
        setTicket(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [qr_code]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-prisma-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-prisma-accent"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-prisma-dark text-white text-2xl font-display">
        Ticket not found
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-prisma-dark text-white px-4 sm:px-6 lg:px-8 pb-20 flex flex-col items-center">
      <div className="w-full max-w-md mb-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-prisma-accent transition-colors font-semibold uppercase tracking-widest text-sm"
        >
          <ArrowLeft size={20} /> Back to Home
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 22 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ ...SURFACE_ENTER_TRANSITION, opacity: OVERLAY_TRANSITION }}
        className="w-full max-w-md bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 relative"
      >
        {/* Top Image Section */}
        <div className="relative h-64 bg-prisma-purple">
          <img
            src={ticket.event_image || 'https://picsum.photos/seed/party/800/600'}
            alt={ticket.event_title}
            className="w-full h-full object-cover opacity-80 mix-blend-overlay"
          />
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-white">
            <span className="font-display text-2xl tracking-wider">PRISMA</span>
            <div className="w-8 h-6 flex flex-col">
              <div className="h-1/6 w-full bg-[#E40303]"></div>
              <div className="h-1/6 w-full bg-[#FF8C00]"></div>
              <div className="h-1/6 w-full bg-[#FFED00]"></div>
              <div className="h-1/6 w-full bg-[#008026]"></div>
              <div className="h-1/6 w-full bg-[#24408E]"></div>
              <div className="h-1/6 w-full bg-[#732982]"></div>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="p-8 pb-12 relative bg-white">
          {/* Decorative curve/line */}
          <div className="absolute top-0 left-0 w-full h-32 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 400 100" className="absolute w-full h-full text-prisma-accent/20" preserveAspectRatio="none">
              <path d="M0,50 C150,100 250,0 400,50" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          <h1 className="font-display text-4xl uppercase leading-none mb-8 text-prisma-dark relative z-10">
            {ticket.event_title}
          </h1>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10 relative z-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Date</p>
              <p className="font-mono text-sm font-medium text-black">{new Date(ticket.event_date).toLocaleDateString('en-GB')}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Time</p>
              <p className="font-mono text-sm font-medium text-black">{ticket.event_time}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Name</p>
              <p className="font-mono text-sm font-medium truncate text-black">{ticket.user_name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Reference</p>
              <p className="font-mono text-sm font-medium truncate text-black">{ticket.qr_code.split('-')[1]}</p>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-200 pt-8 flex flex-col items-center relative z-10">
            <div className="bg-white p-4 rounded-2xl shadow-lg mb-4">
              <QRCodeSVG value={ticket.qr_code} size={150} level="H" />
            </div>
            <p className="font-mono text-xs text-gray-400 tracking-widest">{ticket.qr_code}</p>
          </div>
        </div>

        {/* Cutouts */}
        <div className="absolute top-64 -left-4 w-8 h-8 bg-prisma-dark rounded-full shadow-inner"></div>
        <div className="absolute top-64 -right-4 w-8 h-8 bg-prisma-dark rounded-full shadow-inner"></div>
      </motion.div>
    </div>
  );
}
