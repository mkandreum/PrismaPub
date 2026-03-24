import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Ticket, X, Calendar, Clock, MapPin } from "lucide-react";
import { useToast } from "./Toast";
import { EASE_OUT_EXPO, OVERLAY_TRANSITION, PANEL_TRANSITION } from "../motion";

interface EventData {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  price: number;
  image: string;
  capacity?: number;
  sold_count?: number;
  remaining_count?: number | null;
  general_price?: number;
  early_price?: number | null;
  vip_price?: number | null;
}

export default function EventsSection() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedTicketType, setSelectedTicketType] = useState<"general" | "early" | "vip">("general");
  const [buying, setBuying] = useState(false);
  const [purchasedQR, setPurchasedQR] = useState<string | null>(null);
  const [autoRedirecting, setAutoRedirecting] = useState(false);
  const { showToast } = useToast();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

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
          user_email: customerEmail,
          ticket_type: selectedTicketType,
        })
      });
      const data = await res.json();
      if (data.qr_code) {
        setPurchasedQR(data.qr_code);
        if (data.email_sent) {
          showToast("¡Entrada enviada al correo indicado!", "success");
        } else if (data.email_skipped) {
          showToast("Entrada creada. El envío por email está desactivado en admin.", "error");
        } else if (data.email_error) {
          showToast(`Entrada creada, pero falló el email: ${data.email_error}`, "error");
        } else {
          showToast("¡Entrada comprada!", "success");
        }
        setAutoRedirecting(true);
        redirectTimerRef.current = setTimeout(() => {
          window.location.href = `/ticket/${data.qr_code}`;
        }, 1200);
      } else {
        showToast(data.error || "Error al comprar la entrada", "error");
      }
    } catch {
      showToast("Error al procesar la compra", "error");
    } finally {
      setBuying(false);
    }
  };

  const closeModal = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    setSelectedEvent(null);
    setCustomerName("");
    setCustomerEmail("");
    setSelectedTicketType("general");
    setPurchasedQR(null);
    setAutoRedirecting(false);
  };

  const getTicketOptions = (event: EventData) => {
    const baseGeneral = Number(event.general_price ?? event.price ?? 0);
    const baseEarly = Number(event.early_price ?? 0);
    const baseVip = Number(event.vip_price ?? 0);
    const options = [
      { key: "general" as const, label: "General", price: baseGeneral },
      { key: "early" as const, label: "Early", price: baseEarly },
      { key: "vip" as const, label: "VIP", price: baseVip },
    ].filter((opt) => opt.price > 0);
    return options.length ? options : [{ key: "general" as const, label: "General", price: Number(event.price ?? 0) }];
  };

  const selectedTicketPrice = selectedEvent
    ? (getTicketOptions(selectedEvent).find((opt) => opt.key === selectedTicketType)?.price ?? Number(selectedEvent.price ?? 0))
    : 0;

  return (
    <>
    <section id="events" className="py-12 md:py-16 px-4 md:px-6 bg-prisma-dark text-white relative overflow-hidden">
      {/* Animated background accents */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-prisma-accent/7 rounded-full blur-[80px] -z-1 animate-[glow-drift-1_16s_ease-in-out_infinite] transform-gpu" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-prisma-purple/12 rounded-full blur-[80px] -z-1 animate-[glow-drift-2_18s_ease-in-out_infinite] transform-gpu" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-prisma-deep/5 rounded-full blur-[110px] -z-1 animate-[glow-drift-3_20s_ease-in-out_infinite] transform-gpu" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-12 text-center"
        >
          <h2 className="font-display text-5xl md:text-[8vw] leading-[0.9] uppercase tracking-tighter text-white mb-3">
            Próximos <span className="text-prisma-accent">eventos</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto font-medium">
            No te pierdas las mejores noches. Compra tus entradas ahora.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-5 md:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.04] animate-pulse">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-72 h-52 bg-white/10" />
                  <div className="flex-1 p-6 md:p-8 space-y-4">
                    <div className="h-8 w-2/3 bg-white/12 rounded-lg" />
                    <div className="h-4 w-1/2 bg-white/10 rounded" />
                    <div className="h-4 w-5/6 bg-white/10 rounded" />
                    <div className="h-12 w-40 bg-prisma-purple/25 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:gap-6">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.08, duration: 0.72, ease: EASE_OUT_EXPO }}
                whileHover={{ y: -4, transition: { duration: 0.34, ease: EASE_OUT_EXPO } }}
                className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.12] rounded-3xl overflow-hidden hover:border-prisma-purple/50 hover:shadow-[0_0_32px_rgba(139,92,246,0.16),0_8px_24px_rgba(0,0,0,0.32)] transition-all duration-500 group"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-prisma-purple/0 via-prisma-purple/[0.04] to-prisma-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="flex flex-col md:flex-row relative">
                  {/* Event image */}
                  <div className="md:w-72 h-52 md:h-auto relative overflow-hidden flex-shrink-0">
                    <img
                      src={event.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-prisma-dark/90 via-prisma-dark/20 to-transparent md:bg-gradient-to-r md:from-transparent md:to-prisma-dark/90" />
                    {/* Price badge on image */}
                    <div className="absolute top-4 right-4 bg-prisma-dark/82 border border-prisma-accent/30 rounded-full px-4 py-1.5 md:hidden">
                      <span className="text-prisma-accent font-display text-lg">{event.price.toFixed(2)}€</span>
                    </div>
                  </div>

                  {/* Event details */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                    <div className="flex-1">
                      <h3 className="font-display text-3xl md:text-4xl uppercase tracking-tight text-white group-hover:text-prisma-accent transition-colors duration-300 mb-3">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-gray-300 text-sm font-medium mb-4">
                        <span className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1">
                          <Calendar size={14} className="text-prisma-accent" />
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1">
                          <Clock size={14} className="text-prisma-accent" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1">
                          <MapPin size={14} className="text-prisma-accent" />
                          PRISMA PUB
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{event.description}</p>

                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
                      <div className="hidden md:block text-3xl font-display text-prisma-accent">
                        {event.price.toFixed(2)}€
                      </div>
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setSelectedTicketType(getTicketOptions(event)[0].key);
                        }}
                        className="w-full md:w-auto bg-gradient-to-r from-prisma-purple to-prisma-accent text-white px-8 py-3.5 rounded-full font-semibold uppercase tracking-wider text-sm hover:shadow-[0_0_35px_rgba(139,92,246,0.5)] transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                      >
                        <Ticket size={18} className="group-hover/btn:rotate-12 transition-transform duration-300" />
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {events.length === 0 && !isLoading && (
              <div className="text-center py-20 border border-white/10 rounded-2xl">
                <p className="text-2xl uppercase font-display text-gray-500">No hay eventos próximos</p>
              </div>
            )}
          </div>
        )}
      </div>

    </section>

    {/* Ticket Purchase Modal – rendered via portal so iOS Safari's overflow:hidden on the
        section element does not break position:fixed behaviour. */}
    {createPortal(
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={OVERLAY_TRANSITION}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.975, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985, y: 18 }}
              transition={{ ...PANEL_TRANSITION, opacity: OVERLAY_TRANSITION }}
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
                  <h2 className="font-display text-4xl uppercase text-white mb-2">Comprar entradas</h2>
                  <p className="text-gray-400 font-medium mb-8 uppercase tracking-wider text-sm">
                    {selectedEvent.title} • {new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.time}
                  </p>

                  <form onSubmit={handlePurchase} className="space-y-6">
                    {buying && (
                      <div className="rounded-xl border border-prisma-purple/40 bg-prisma-purple/15 px-4 py-3 text-sm text-prisma-light uppercase tracking-wide">
                        Enviando entrada al mail indicado...
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Nombre completo</label>
                      <input
                        required
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full border-b-2 border-white/20 py-3 px-4 bg-white/5 focus:bg-white/10 focus:border-prisma-accent outline-none transition-colors rounded-t-xl text-white placeholder-gray-500"
                        placeholder="Escribe tu nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Correo electrónico</label>
                      <input
                        required
                        type="email"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        className="w-full border-b-2 border-white/20 py-3 px-4 bg-white/5 focus:bg-white/10 focus:border-prisma-accent outline-none transition-colors rounded-t-xl text-white placeholder-gray-500"
                        placeholder="Escribe tu correo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Tipo de entrada</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {getTicketOptions(selectedEvent).map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setSelectedTicketType(opt.key)}
                            className={`px-3 py-2 rounded-xl border text-sm uppercase tracking-wide transition-colors ${selectedTicketType === opt.key ? 'bg-prisma-accent/25 border-prisma-accent text-white' : 'bg-white/5 border-white/15 text-gray-300 hover:border-prisma-accent/50'}`}
                          >
                            {opt.label} · {opt.price.toFixed(2)}€
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center text-xl font-display uppercase">
                        <span className="text-gray-300">Total</span>
                        <span className="text-prisma-accent text-2xl">{selectedTicketPrice.toFixed(2)}€</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={buying}
                      className="w-full bg-prisma-purple text-white py-4 rounded-full font-display text-xl uppercase tracking-wider hover:bg-white hover:text-prisma-dark transition-colors disabled:opacity-50 shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                    >
                      {buying ? 'Enviando entrada...' : 'Completar compra'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="font-display text-3xl uppercase text-white mb-4">¡Entrada confirmada!</h2>
                  <p className="text-gray-300 mb-6">Tu entrada para <strong>{selectedEvent.title}</strong> está lista y se abrirá automáticamente.</p>
                  {autoRedirecting && (
                    <div className="flex items-center justify-center gap-3 text-prisma-accent">
                      <div className="w-5 h-5 border-2 border-prisma-accent/40 border-t-prisma-accent rounded-full animate-spin" />
                      <span className="text-sm uppercase tracking-wider">Abriendo entrada...</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
}
