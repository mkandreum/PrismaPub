import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { Ticket, X, Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { useToast } from "./Toast";

interface EventData {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  price: number;
  image: string;
}

export default function EventsSection() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [buying, setBuying] = useState(false);
  const [purchasedQR, setPurchasedQR] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setBuying(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          user_name: customerName,
          user_email: customerEmail
        })
      });
      const data = await res.json();
      if (data.qr_code) {
        setPurchasedQR(data.qr_code);
        showToast("Ticket purchased! Check your QR code.", "success");
      } else {
        showToast(data.error || "Error purchasing ticket", "error");
      }
    } catch {
      showToast("Error processing ticket", "error");
    } finally {
      setBuying(false);
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setCustomerName("");
    setCustomerEmail("");
    setPurchasedQR(null);
  };

  return (
    <section id="events" className="py-24 px-4 md:px-8 bg-prisma-dark text-white relative overflow-hidden">
      {/* Animated background accents */}
      <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-0 w-96 h-96 bg-prisma-accent/8 rounded-full blur-[160px] -z-1" />
      <motion.div animate={{ x: [0, -30, 0], y: [0, 20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 left-0 w-96 h-96 bg-prisma-purple/15 rounded-full blur-[160px] -z-1" />
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-prisma-deep/5 rounded-full blur-[200px] -z-1" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-6xl md:text-[10vw] leading-none uppercase tracking-tighter text-white mb-4">
            Upcoming <span className="text-prisma-accent">Events</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto font-medium">
            Don't miss out on the best nights. Get your tickets now.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-prisma-accent" />
          </div>
        ) : (
          <div className="grid gap-6">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-prisma-purple/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] transition-all duration-500 group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Event image */}
                  <div className="md:w-64 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
                    <img
                      src={event.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-prisma-dark/80 hidden md:block" />
                  </div>

                  {/* Event details */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                      <h3 className="font-display text-3xl md:text-4xl uppercase tracking-tight text-white group-hover:text-prisma-accent transition-colors mb-3">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-gray-300 text-sm font-medium mb-3">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} className="text-prisma-accent" />
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock size={16} className="text-prisma-accent" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin size={16} className="text-prisma-accent" />
                          Prisma Pub
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
                      <div className="text-3xl font-display text-prisma-accent">
                        {event.price.toFixed(2)}€
                      </div>
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="w-full md:w-auto bg-prisma-purple text-white px-8 py-3 rounded-full font-semibold uppercase tracking-wider text-sm hover:bg-white hover:text-prisma-dark transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
                      >
                        <Ticket size={18} />
                        Get Tickets
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {events.length === 0 && !isLoading && (
              <div className="text-center py-20 border border-white/10 rounded-2xl">
                <p className="text-2xl uppercase font-display text-gray-500">No upcoming events</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ticket Purchase Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-prisma-dark border-2 border-prisma-purple/30 rounded-3xl p-6 md:p-10 max-w-lg w-full max-h-[90vh] overflow-y-auto relative z-[151] shadow-[0_0_80px_rgba(139,92,246,0.25)]"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>

              {!purchasedQR ? (
                <>
                  <h2 className="font-display text-4xl uppercase text-white mb-2">Get Tickets</h2>
                  <p className="text-gray-400 font-medium mb-8 uppercase tracking-wider text-sm">
                    {selectedEvent.title} • {new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.time}
                  </p>

                  <form onSubmit={handlePurchase} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                      <input
                        required
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full border-b-2 border-white/20 py-3 px-4 bg-white/5 focus:bg-white/10 focus:border-prisma-accent outline-none transition-colors rounded-t-xl text-white placeholder-gray-500"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Email</label>
                      <input
                        required
                        type="email"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        className="w-full border-b-2 border-white/20 py-3 px-4 bg-white/5 focus:bg-white/10 focus:border-prisma-accent outline-none transition-colors rounded-t-xl text-white placeholder-gray-500"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center text-xl font-display uppercase">
                        <span className="text-gray-300">Total</span>
                        <span className="text-prisma-accent text-2xl">{selectedEvent.price.toFixed(2)}€</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={buying}
                      className="w-full bg-prisma-purple text-white py-4 rounded-full font-display text-xl uppercase tracking-wider hover:bg-white hover:text-prisma-dark transition-colors disabled:opacity-50 shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                    >
                      {buying ? 'Processing...' : 'Complete Purchase'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="font-display text-3xl uppercase text-white mb-4">Ticket Confirmed!</h2>
                  <p className="text-gray-300 mb-6">Your ticket for <strong>{selectedEvent.title}</strong> is ready.</p>
                  <a
                    href={`/ticket/${purchasedQR}`}
                    className="inline-block bg-prisma-accent text-white px-8 py-3 rounded-full font-semibold uppercase tracking-wider text-sm hover:bg-white hover:text-prisma-dark transition-all"
                  >
                    View Your Ticket & QR Code
                  </a>
                  <button
                    onClick={closeModal}
                    className="block mx-auto mt-4 text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
