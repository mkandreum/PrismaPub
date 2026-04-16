import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3, CalendarDays, Ticket, Image, Megaphone, Activity,
  Settings, LogOut, Plus, Trash2, Edit3, ToggleLeft, ToggleRight,
  Upload, X, Save, Eye, EyeOff, ArrowLeft, GripVertical, Search
} from "lucide-react";
import { useToast } from "./Toast";
import { applySiteFont, DEFAULT_SITE_FONT, SITE_FONT_OPTIONS } from "../fonts";
import { OVERLAY_TRANSITION, PANEL_TRANSITION, SHEET_TRANSITION } from "../motion";

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = "stats" | "events" | "tickets" | "gallery" | "banners" | "activity" | "settings";

const TABS: { key: Tab; icon: React.ReactNode; label: string }[] = [
  { key: "stats", icon: <BarChart3 size={20} />, label: "Resumen" },
  { key: "events", icon: <CalendarDays size={20} />, label: "Eventos" },
  { key: "tickets", icon: <Ticket size={20} />, label: "Entradas" },
  { key: "gallery", icon: <Image size={20} />, label: "Galería" },
  { key: "banners", icon: <Megaphone size={20} />, label: "Banners" },
  { key: "activity", icon: <Activity size={20} />, label: "Actividad" },
  { key: "settings", icon: <Settings size={20} />, label: "Ajustes" },
];

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("prisma_token")}` };
}

async function apiFetch(url: string, opts: RequestInit = {}) {
  const headers: any = { ...authHeaders(), ...opts.headers };
  if (!(opts.body instanceof FormData)) headers["Content-Type"] = "application/json";
  const res = await fetch(url, { ...opts, headers });
  if (res.status === 401) {
    localStorage.removeItem("prisma_token");
    window.location.reload();
  }
  return res;
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("stats");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-prisma-dark z-50 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-white/10">
          <h1 className="font-display text-2xl text-white tracking-tight">PRISMA</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Panel de Administración</p>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-prisma-accent text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => { localStorage.removeItem("prisma_token"); onLogout(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-prisma-accent transition-colors text-sm font-medium rounded-lg hover:bg-white/5"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 text-gray-900">
        {/* Top mobile bar */}
        <header className="lg:hidden sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700">
            <div className="space-y-1.5">
              <div className="w-6 h-0.5 bg-current" />
              <div className="w-6 h-0.5 bg-current" />
              <div className="w-6 h-0.5 bg-current" />
            </div>
          </button>
          <span className="font-display text-lg uppercase">{TABS.find(t => t.key === tab)?.label}</span>
        </header>

        <main className="p-4 md:p-8 max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ ...PANEL_TRANSITION, opacity: OVERLAY_TRANSITION }}
            >
              {tab === "stats" && <StatsTab />}
              {tab === "events" && <EventsTab />}
              {tab === "tickets" && <TicketsTab />}
              {tab === "gallery" && <GalleryTab />}
              {tab === "banners" && <BannersTab />}
              {tab === "activity" && <ActivityTab />}
              {tab === "settings" && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STATS TAB
// ═══════════════════════════════════════════════════════
function StatsTab() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    apiFetch("/api/admin/stats").then(r => r.json()).then(setStats);
  }, []);

  if (!stats) return <Loading />;

  return (
    <div>
      <h2 className="font-display text-3xl uppercase mb-6 text-gray-900">Resumen</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Eventos activos", value: stats.totalEvents, color: "bg-violet-500" },
          { label: "Entradas vendidas", value: stats.totalTickets, color: "bg-prisma-accent" },
          { label: "Fotos en galería", value: stats.totalPhotos, color: "bg-blue-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">{s.label}</p>
            <p className="text-4xl font-display">{s.value}</p>
            <div className={`h-1 w-12 ${s.color} rounded-full mt-3`} />
          </div>
        ))}
      </div>

      {stats.ticketsPerEvent?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-display text-xl uppercase mb-4 text-gray-900">Entradas por evento</h3>
          <div className="space-y-3">
            {stats.ticketsPerEvent.map((e: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-48 truncate">{e.title}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-prisma-accent h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, (e.ticket_count / Math.max(1, stats.totalTickets)) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold w-10 text-right">{e.ticket_count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EVENTS TAB
// ═══════════════════════════════════════════════════════
function EventsTab() {
  const [events, setEvents] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [uploadingEventImage, setUploadingEventImage] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(() => {
    apiFetch("/api/admin/events").then(r => r.json()).then(setEvents);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const data = {
      title: fd.get("title") as string,
      date: fd.get("date") as string,
      time: fd.get("time") as string,
      description: fd.get("description") as string,
      price: parseFloat(fd.get("price") as string),
      capacity: parseInt((fd.get("capacity") as string) || "0", 10) || 0,
      general_price: parseFloat((fd.get("general_price") as string) || "0") || 0,
      early_price: parseFloat((fd.get("early_price") as string) || "0") || null,
      vip_price: parseFloat((fd.get("vip_price") as string) || "0") || null,
      image: eventImageUrl,
      is_active: editing?.is_active ?? 1,
    };

    if (editing?.id) {
      await apiFetch(`/api/admin/events/${editing.id}`, { method: "PATCH", body: JSON.stringify(data) });
      showToast("Evento actualizado", "success");
    } else {
      await apiFetch("/api/admin/events", { method: "POST", body: JSON.stringify(data) });
      showToast("Evento creado", "success");
    }
    setShowForm(false);
    setEditing(null);
    setEventImageUrl("");
    load();
  };

  const uploadEventImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingEventImage(true);
    const fd = new FormData();
    fd.append("image", e.target.files[0]);
    try {
      const res = await apiFetch("/api/admin/events/image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      setEventImageUrl(data.url || "");
      showToast("Imagen del evento subida", "success");
    } catch {
      showToast("Error al subir la imagen del evento", "error");
    } finally {
      setUploadingEventImage(false);
      e.target.value = "";
    }
  };

  const remove = async (id: number) => {
    if (!confirm("¿Eliminar este evento?")) return;
    await apiFetch(`/api/admin/events/${id}`, { method: "DELETE" });
    showToast("Evento eliminado", "success");
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-3xl uppercase text-gray-900">Eventos</h2>
        <button
          onClick={() => { setEditing(null); setEventImageUrl(""); setShowForm(true); }}
          className="bg-prisma-accent text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-prisma-accent/90 transition-colors"
        >
          <Plus size={18} /> Nuevo evento
        </button>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={OVERLAY_TRANSITION}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.99 }}
              transition={{ ...SHEET_TRANSITION, opacity: OVERLAY_TRANSITION }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-2xl uppercase text-gray-900">{editing?.id ? "Editar" : "Nuevo"} evento</h3>
                <button onClick={() => { setShowForm(false); setEditing(null); setEventImageUrl(""); }} className="text-gray-400 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={save} className="space-y-4">
                <FormInput name="title" label="Título" defaultValue={editing?.title} required />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput name="date" label="Fecha" type="date" defaultValue={editing?.date} required />
                  <FormInput name="time" label="Hora" type="time" defaultValue={editing?.time} required />
                </div>
                <FormInput name="price" label="Precio (€)" type="number" step="0.01" defaultValue={editing?.price} required />
                <FormInput name="capacity" label="Aforo total (0 = ilimitado)" type="number" defaultValue={editing?.capacity ?? 0} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput name="general_price" label="Precio General (€)" type="number" step="0.01" defaultValue={editing?.general_price ?? editing?.price} />
                  <FormInput name="early_price" label="Precio Early (€)" type="number" step="0.01" defaultValue={editing?.early_price} />
                  <FormInput name="vip_price" label="Precio VIP (€)" type="number" step="0.01" defaultValue={editing?.vip_price} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Imagen del evento</label>
                  {(eventImageUrl || editing?.image) && (
                    <img
                      src={eventImageUrl || editing?.image}
                      alt="Evento"
                      className="w-full max-w-xs h-32 object-cover rounded-xl mb-3 border border-gray-200"
                    />
                  )}
                  <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${uploadingEventImage ? 'bg-gray-100 text-gray-400 pointer-events-none' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                    <Upload size={16} /> {uploadingEventImage ? 'Subiendo imagen...' : 'Subir imagen'}
                    <input type="file" accept="image/*" onChange={uploadEventImage} className="hidden" />
                  </label>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Descripción</label>
                  <textarea
                    name="description"
                    defaultValue={editing?.description}
                    rows={3}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-prisma-accent outline-none transition-colors resize-none"
                  />
                </div>
                <button type="submit" className="w-full bg-prisma-accent text-white py-3 rounded-xl font-semibold uppercase tracking-wider hover:bg-prisma-accent/90 transition-colors flex items-center justify-center gap-2">
                  <Save size={18} /> {editing?.id ? "Actualizar" : "Crear"} evento
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col md:flex-row gap-4 items-start md:items-center shadow-sm">
            {ev.image && (
              <img src={ev.image} alt="" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-display text-lg uppercase truncate">{ev.title}</h4>
                {ev.is_expired ? <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Caducado</span> : null}
                {!ev.is_active && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Inactivo</span>}
              </div>
              <p className="text-xs text-gray-400">{ev.date} • {ev.time} • {ev.price}€</p>
              {Number(ev.capacity || 0) > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 uppercase tracking-wide">
                    <span>Aforo</span>
                    <span>{ev.sold_count || 0}/{ev.capacity} · Restantes {Math.max(0, Number(ev.remaining_count ?? (ev.capacity - (ev.sold_count || 0))))}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-prisma-accent"
                      style={{ width: `${Math.min(100, ((ev.sold_count || 0) / Math.max(1, Number(ev.capacity))) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(ev); setEventImageUrl(ev.image || ""); setShowForm(true); }}
                className="p-2 rounded-lg border border-gray-200 hover:border-prisma-accent hover:text-prisma-accent transition-colors"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => remove(ev.id)}
                className="p-2 rounded-lg border border-gray-200 hover:border-red-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && <EmptyState text="Aún no hay eventos" />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TICKETS TAB
// ═══════════════════════════════════════════════════════
function TicketsTab() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  const load = useCallback(() => {
    apiFetch("/api/admin/tickets").then(r => r.json()).then(setTickets);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (ticket: any) => {
    if (!confirm(`¿Eliminar la entrada ${ticket.qr_code}?`)) return;
    try {
      await apiFetch(`/api/admin/tickets/${ticket.id}`, { method: "DELETE" });
      showToast("Entrada eliminada", "success");
      load();
    } catch {
      showToast("No se pudo eliminar la entrada", "error");
    }
  };

  const resend = async (ticket: any) => {
    try {
      const res = await apiFetch(`/api/admin/tickets/${ticket.id}/resend`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      showToast("Entrada reenviada por email", "success");
    } catch (err: any) {
      showToast(err?.message || "No se pudo reenviar", "error");
    }
  };

  const filtered = tickets.filter(t =>
    t.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    t.event_title?.toLowerCase().includes(search.toLowerCase()) ||
    t.qr_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="font-display text-3xl uppercase mb-6 text-gray-900">Entradas</h2>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email, evento o código QR..."
          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-prisma-accent outline-none transition-colors"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">Nombre</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">Email</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">Evento</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">Tipo</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">Código QR</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">Fecha</th>
                <th className="text-right px-5 py-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium">{t.user_name}</td>
                  <td className="px-5 py-3 text-gray-500">{t.user_email}</td>
                  <td className="px-5 py-3">{t.event_title}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs uppercase font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">{t.ticket_type || "general"}</span>
                  </td>
                  <td className="px-5 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{t.qr_code}</code>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => resend(t)}
                      className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-400 hover:border-prisma-accent hover:text-prisma-accent transition-colors mr-2"
                      aria-label={`Reenviar entrada ${t.qr_code}`}
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={() => remove(t)}
                      className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-500 transition-colors"
                      aria-label={`Eliminar entrada ${t.qr_code}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              {search ? "No hay entradas que coincidan con la búsqueda" : "Aún no se han vendido entradas"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// GALLERY TAB
// ═══════════════════════════════════════════════════════
function GalleryTab() {
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const load = useCallback(() => {
    apiFetch("/api/gallery").then(r => r.json()).then(setImages);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(e.target.files).forEach((f: File) => fd.append("photos", f));
    try {
      await apiFetch("/api/admin/gallery", { method: "POST", body: fd });
      showToast(`${e.target.files.length} foto(s) subida(s)`, "success");
      load();
    } catch {
      showToast("Error al subir imágenes", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (id: number) => {
    await apiFetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    showToast("Foto eliminada", "success");
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-3xl uppercase text-gray-900">Galería</h2>
        <label
          className={`bg-prisma-accent text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer hover:bg-prisma-accent/90 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <Upload size={18} />
          {uploading ? "Subiendo..." : "Subir fotos"}
          <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((img) => (
          <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => remove(img.id)}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && !uploading && <EmptyState text="La galería está vacía. ¡Sube algunas fotos!" />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// BANNERS TAB
// ═══════════════════════════════════════════════════════
function BannersTab() {
  const [banners, setBanners] = useState<any[]>([]);
  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState("0");
  const [newStartAt, setNewStartAt] = useState("");
  const [newEndAt, setNewEndAt] = useState("");
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const { showToast } = useToast();

  const load = useCallback(() => {
    apiFetch("/api/admin/banners").then(r => r.json()).then(setBanners);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text) {
      showToast("Escribe un texto para el banner", "error");
      return;
    }
    try {
      await apiFetch("/api/admin/banners", {
        method: "POST",
        body: JSON.stringify({
          text,
          priority: parseInt(newPriority || "0", 10) || 0,
          start_at: newStartAt || null,
          end_at: newEndAt || null,
        })
      });
      setNewText("");
      setNewPriority("0");
      setNewStartAt("");
      setNewEndAt("");
      showToast("Banner añadido", "success");
      load();
    } catch {
      showToast("No se pudo añadir el banner", "error");
    }
  };

  const toggle = async (b: any) => {
    await apiFetch(`/api/admin/banners/${b.id}`, { method: "PUT", body: JSON.stringify({ active: b.active ? 0 : 1 }) });
    load();
  };

  const remove = async (id: number) => {
    await apiFetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    showToast("Banner eliminado", "success");
    load();
  };

  const updateBanner = async (banner: any, updates: any) => {
    await apiFetch(`/api/admin/banners/${banner.id}`, {
      method: "PUT",
      body: JSON.stringify({
        text: updates.text ?? banner.text,
        active: updates.active ?? banner.active,
        priority: updates.priority ?? banner.priority ?? 0,
        start_at: updates.start_at ?? banner.start_at ?? null,
        end_at: updates.end_at ?? banner.end_at ?? null,
      })
    });
    load();
  };

  const formatDatetimeForInput = (value?: string | null) => {
    if (!value) return '';
    return value.replace(' ', 'T').slice(0, 16);
  };

  const handleDrop = async (targetId: number) => {
    if (!draggingId || draggingId === targetId) return;
    const next = [...banners];
    const from = next.findIndex((b) => b.id === draggingId);
    const to = next.findIndex((b) => b.id === targetId);
    if (from === -1 || to === -1) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setBanners(next);
    try {
      await apiFetch('/api/admin/banners/reorder', {
        method: 'POST',
        body: JSON.stringify({ itemIds: next.map((b) => b.id) })
      });
    } catch {
      showToast('No se pudo reordenar', 'error');
      load();
    } finally {
      setDraggingId(null);
    }
  };

  return (
    <div>
      <h2 className="font-display text-3xl uppercase mb-6 text-gray-900">Banners</h2>

      <form onSubmit={add} className="flex gap-3 mb-8">
        <div className="flex-1 space-y-3">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Escribe el texto del banner..."
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-prisma-accent outline-none transition-colors"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="number"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              placeholder="Prioridad"
              className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-prisma-accent outline-none transition-colors"
            />
            <input
              type="datetime-local"
              value={newStartAt}
              onChange={(e) => setNewStartAt(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-prisma-accent outline-none transition-colors"
            />
            <input
              type="datetime-local"
              value={newEndAt}
              onChange={(e) => setNewEndAt(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-prisma-accent outline-none transition-colors"
            />
          </div>
        </div>
        <button type="submit" className="self-start bg-prisma-accent text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-prisma-accent/90 transition-colors">
          <Plus size={18} /> Añadir
        </button>
      </form>

      <div className="mb-8 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-display text-lg uppercase mb-4 text-gray-900">Previsualización en tiempo real</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Desktop</p>
            <div className="h-12 rounded-lg bg-prisma-purple/90 text-white flex items-center px-4 text-sm uppercase tracking-wider overflow-hidden">
              <span className="whitespace-nowrap">{newText || 'Tu banner aparecerá aquí'} • {newText || 'Tu banner aparecerá aquí'}</span>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Mobile</p>
            <div className="h-10 rounded-lg bg-prisma-purple/90 text-white flex items-center px-3 text-xs uppercase tracking-wider overflow-hidden">
              <span className="whitespace-nowrap">{newText || 'Banner móvil'} • {newText || 'Banner móvil'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {banners.map((b) => (
          <div
            key={b.id}
            draggable
            onDragStart={() => setDraggingId(b.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(b.id)}
            className={`bg-white rounded-2xl border p-5 flex flex-col md:flex-row md:items-center gap-4 shadow-sm ${draggingId === b.id ? 'border-prisma-accent' : 'border-gray-200'}`}
          >
            <div className="flex items-center gap-3">
              <GripVertical size={18} className="text-gray-300 cursor-grab" />
              <button onClick={() => toggle(b)} className="flex-shrink-0">
              {b.active ? (
                <ToggleRight size={28} className="text-green-500" />
              ) : (
                <ToggleLeft size={28} className="text-gray-300" />
              )}
              </button>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                value={b.text}
                onChange={(e) => setBanners((prev) => prev.map((x) => x.id === b.id ? { ...x, text: e.target.value } : x))}
                onBlur={(e) => updateBanner(b, { text: e.currentTarget.value })}
                className={`border-2 border-gray-200 rounded-xl px-3 py-2 text-sm md:col-span-2 ${b.active ? 'text-gray-800' : 'text-gray-400'}`}
              />
              <input
                type="number"
                value={b.priority ?? 0}
                onChange={(e) => setBanners((prev) => prev.map((x) => x.id === b.id ? { ...x, priority: e.target.value } : x))}
                onBlur={(e) => updateBanner(b, { priority: Number(e.currentTarget.value || 0) })}
                className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
              <div className="text-xs text-gray-500 flex items-center">Prioridad</div>
              <input
                type="datetime-local"
                value={formatDatetimeForInput(b.start_at)}
                onChange={(e) => setBanners((prev) => prev.map((x) => x.id === b.id ? { ...x, start_at: e.target.value } : x))}
                onBlur={(e) => updateBanner(b, { start_at: e.currentTarget.value || null })}
                className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
              <input
                type="datetime-local"
                value={formatDatetimeForInput(b.end_at)}
                onChange={(e) => setBanners((prev) => prev.map((x) => x.id === b.id ? { ...x, end_at: e.target.value } : x))}
                onBlur={(e) => updateBanner(b, { end_at: e.currentTarget.value || null })}
                className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <button onClick={() => remove(b.id)} className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400 self-end md:self-auto">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {banners.length === 0 && <EmptyState text="No hay banners. ¡Añade uno arriba!" />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ACTIVITY TAB
// ═══════════════════════════════════════════════════════
function ActivityTab() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    apiFetch("/api/admin/activity").then(r => r.json()).then(setLogs);
  }, []);

  const actionColor = (action: string) => {
    if (action.includes("CREATE") || action.includes("UPLOAD")) return "bg-green-100 text-green-700";
    if (action.includes("DELETE")) return "bg-red-100 text-red-700";
    if (action.includes("UPDATE") || action.includes("IMAGE")) return "bg-blue-100 text-blue-700";
    if (action.includes("LOGIN")) return "bg-violet-100 text-violet-700";
    if (action.includes("TICKET")) return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-700";
  };

  const actionLabel = (action: string) => {
    if (action.includes("CREATE")) return "CREADO";
    if (action.includes("UPLOAD")) return "SUBIDA";
    if (action.includes("DELETE")) return "ELIMINADO";
    if (action.includes("UPDATE")) return "ACTUALIZADO";
    if (action.includes("LOGIN")) return "ACCESO";
    if (action.includes("IMAGE")) return "IMAGEN";
    if (action.includes("TICKET")) return "ENTRADA";
    return action;
  };

  return (
    <div>
      <h2 className="font-display text-3xl uppercase mb-6 text-gray-900">Registro de actividad</h2>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 shadow-sm">
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-lg flex-shrink-0 ${actionColor(log.action)}`}>
              {actionLabel(log.action)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">{log.details}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(log.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {logs.length === 0 && <EmptyState text="Aún no hay actividad registrada" />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SETTINGS TAB
// ═══════════════════════════════════════════════════════
function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [initialSettings, setInitialSettings] = useState<Record<string, string>>({});
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const heroRef = useRef<HTMLInputElement>(null);
  const heroLeftRef = useRef<HTMLInputElement>(null);
  const heroRightRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch("/api/admin/settings").then(r => r.json()).then((data) => {
      setSettings(data);
      setInitialSettings(data);
      setDirtyKeys(new Set());
    });
  }, []);

  useEffect(() => {
    applySiteFont(settings.site_font || DEFAULT_SITE_FONT);
  }, [settings.site_font]);

  const hasUnsavedChanges = dirtyKeys.size > 0 || newPassword.trim().length > 0;

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  const saveSection = async (keys: string[], options?: { includePassword?: boolean }) => {
    setSaving(true);
    const body: Record<string, string> = {};
    keys.forEach((key) => {
      body[key] = settings[key] || "";
    });
    if (options?.includePassword && newPassword.trim()) body.admin_password = newPassword;
    try {
      await apiFetch("/api/admin/settings", { method: "POST", body: JSON.stringify(body) });
      setInitialSettings((prev) => {
        const next = { ...prev };
        keys.forEach((key) => {
          next[key] = settings[key] || "";
        });
        return next;
      });
      setDirtyKeys((prev) => {
        const next = new Set(prev);
        keys.forEach((key) => next.delete(key));
        return next;
      });
      if (options?.includePassword) setNewPassword("");
      showToast("Seccion guardada", "success");
    } catch {
      showToast("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveAll = async () => {
    const keys = Array.from(new Set([...Object.keys(settings), ...Array.from(dirtyKeys)]));
    await saveSection(keys, { includePassword: true });
  };

  const uploadHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append("image", e.target.files[0]);
    try {
      const res = await apiFetch("/api/admin/settings/hero-image", { method: "POST", body: fd });
      const data = await res.json();
      setSettings(s => ({ ...s, hero_image_url: data.url }));
      setInitialSettings(s => ({ ...s, hero_image_url: data.url }));
      showToast("Imagen principal actualizada", "success");
    } catch {
      showToast("Error al subir imagen", "error");
    }
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append("image", e.target.files[0]);
    try {
      const res = await apiFetch("/api/admin/settings/logo", { method: "POST", body: fd });
      const data = await res.json();
      setSettings(s => ({ ...s, logo_url: data.url }));
      setInitialSettings(s => ({ ...s, logo_url: data.url }));
      showToast("Logo actualizado", "success");
    } catch {
      showToast("Error al subir imagen", "error");
    }
  };

  const uploadHeroSidePhoto = async (side: "left" | "right", e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append("image", e.target.files[0]);
    try {
      const res = await apiFetch(`/api/admin/settings/hero-photo-${side}`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      const key = side === "left" ? "hero_photo_left_url" : "hero_photo_right_url";
      setSettings((s) => ({ ...s, [key]: data.url }));
      setInitialSettings((s) => ({ ...s, [key]: data.url }));
      showToast(`Foto ${side === "left" ? "izquierda" : "derecha"} actualizada`, "success");
    } catch {
      showToast("Error al subir foto del hero", "error");
    } finally {
      e.target.value = "";
    }
  };

  const markDirty = (key: string, value: string) => {
    const initialValue = initialSettings[key] || "";
    setDirtyKeys((prev) => {
      const next = new Set(prev);
      if (value === initialValue) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const removeLogo = () => {
    setSettings(s => ({ ...s, logo_url: '' }));
    markDirty('logo_url', '');
  };

  const removeHeroImage = () => {
    setSettings(s => ({ ...s, hero_image_url: '', use_hero_title_image: '0' }));
    markDirty('hero_image_url', '');
    markDirty('use_hero_title_image', '0');
  };

  const update = (key: string, value: string) => {
    setSettings(s => ({ ...s, [key]: value }));
    markDirty(key, value);
  };

  const GENERAL_KEYS = ["site_name", "site_font", "address", "instagram_url", "instagram_posts", "footer_text"];
  const LOGO_KEYS = ["logo_url"];
  const MARQUEE_KEYS = ["marquee_1", "marquee_2"];
  const SMTP_KEYS = ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from_name", "smtp_from_email", "smtp_enabled", "smtp_secure"];
  const HERO_KEYS = ["hero_phrase", "hero_subtitle", "show_hero_photos", "hero_image_url", "hero_photo_left_url", "hero_photo_right_url", "use_hero_title_image"];

  return (
    <div>
      <h2 className="font-display text-3xl uppercase mb-6 text-gray-900">Ajustes</h2>

      <div className="max-w-2xl space-y-6">
        {hasUnsavedChanges && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 text-sm flex items-center justify-between gap-4">
            <span>Tienes cambios sin guardar.</span>
            <button
              type="button"
              onClick={saveAll}
              disabled={saving}
              className="bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-amber-700 transition-colors disabled:opacity-60"
            >
              Guardar todo
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display text-lg uppercase text-gray-800">General</h3>
            <button type="button" onClick={() => saveSection(GENERAL_KEYS)} className="text-xs font-semibold uppercase tracking-wider text-prisma-accent hover:text-prisma-accent/80">Guardar seccion</button>
          </div>
          <FormInput label="Nombre del sitio" value={settings.site_name || ""} onChange={(v) => update("site_name", v)} />
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Tipografia global</label>
            {(() => {
              const selectedFont = SITE_FONT_OPTIONS.find((font) => font.key === (settings.site_font || DEFAULT_SITE_FONT)) || SITE_FONT_OPTIONS[0];
              return (
                <>
                  <select
                    value={settings.site_font || DEFAULT_SITE_FONT}
                    onChange={(e) => update("site_font", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-prisma-accent outline-none transition-colors bg-white"
                    style={{ fontFamily: selectedFont.stack }}
                  >
                    {SITE_FONT_OPTIONS.map((font) => (
                      <option key={font.key} value={font.key} style={{ fontFamily: font.stack }}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                  <p
                    className="text-sm text-gray-700 mt-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200"
                    style={{ fontFamily: selectedFont.stack }}
                  >
                    Preview: GRAN APERTURA - BINGO - DRAGS - FIESTA
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{selectedFont.description}</p>
                </>
              );
            })()}
          </div>
          <FormInput label="Dirección" value={settings.address || ""} onChange={(v) => update("address", v)} />
          <FormInput label="URL de Instagram" value={settings.instagram_url || ""} onChange={(v) => update("instagram_url", v)} />
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Publicaciones de Instagram (1 URL por linea)</label>
            <textarea
              value={settings.instagram_posts || ""}
              onChange={(e) => update("instagram_posts", e.target.value)}
              rows={5}
              placeholder={"https://www.instagram.com/p/XXXXXXXXX/\nhttps://www.instagram.com/reel/YYYYYYYYY/"}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-prisma-accent outline-none transition-colors resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">Acepta enlaces de tipo post, reel o tv. Se mostraran embebidos en la seccion Galeria.</p>
          </div>
          <FormInput label="Texto del pie de página" value={settings.footer_text || ""} onChange={(v) => update("footer_text", v)} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display text-lg uppercase text-gray-800">Logo (Navbar y pie de pagina)</h3>
            <button type="button" onClick={() => saveSection(LOGO_KEYS)} className="text-xs font-semibold uppercase tracking-wider text-prisma-accent hover:text-prisma-accent/80">Guardar seccion</button>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Imagen del logo</label>
            <p className="text-xs text-gray-400 mb-3">Si se configura, reemplaza el logo de texto en la barra y el pie de página. Déjalo vacío para mostrar texto + bandera pride.</p>
            {settings.logo_url && (
              <div className="flex items-center gap-4 mb-3">
                <img src={settings.logo_url} alt="Logo" className="h-14 w-auto object-contain bg-gray-900 rounded-xl p-2 border" />
                <button onClick={removeLogo} type="button" className="text-xs text-red-500 hover:text-red-700 underline">Quitar logo</button>
              </div>
            )}
            <label className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors">
              <Upload size={16} /> {settings.logo_url ? 'Cambiar logo' : 'Subir logo'}
              <input ref={logoRef} type="file" accept="image/*" onChange={uploadLogo} className="hidden" />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display text-lg uppercase text-gray-800">Textos desplazables</h3>
            <button type="button" onClick={() => saveSection(MARQUEE_KEYS)} className="text-xs font-semibold uppercase tracking-wider text-prisma-accent hover:text-prisma-accent/80">Guardar seccion</button>
          </div>
          <FormInput label="Texto 1 (después del hero)" value={settings.marquee_1 || ""} onChange={(v) => update("marquee_1", v)} />
          <FormInput label="Texto 2 (después de eventos)" value={settings.marquee_2 || ""} onChange={(v) => update("marquee_2", v)} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display text-lg uppercase text-gray-800">SMTP (envio automatico de entradas)</h3>
            <button type="button" onClick={() => saveSection(SMTP_KEYS)} className="text-xs font-semibold uppercase tracking-wider text-prisma-accent hover:text-prisma-accent/80">Guardar seccion</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Servidor SMTP" value={settings.smtp_host || ""} onChange={(v) => update("smtp_host", v)} />
            <FormInput label="Puerto SMTP" type="number" value={settings.smtp_port || "587"} onChange={(v) => update("smtp_port", v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Usuario SMTP" value={settings.smtp_user || ""} onChange={(v) => update("smtp_user", v)} />
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Contraseña SMTP</label>
              <div className="relative">
                <input
                  type={showSmtpPass ? "text" : "password"}
                  value={settings.smtp_pass || ""}
                  onChange={(e) => update("smtp_pass", e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:border-prisma-accent outline-none transition-colors"
                  placeholder="Contraseña de la cuenta SMTP"
                />
                <button type="button" onClick={() => setShowSmtpPass(!showSmtpPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showSmtpPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Nombre remitente" value={settings.smtp_from_name || "PRISMA PUB"} onChange={(v) => update("smtp_from_name", v)} />
            <FormInput label="Email remitente" type="email" value={settings.smtp_from_email || ""} onChange={(v) => update("smtp_from_email", v)} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={(settings.smtp_enabled || "0") === "1"}
                onChange={(e) => update("smtp_enabled", e.target.checked ? "1" : "0")}
                className="accent-prisma-accent"
              />
              Activar envío de entradas por email
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={(settings.smtp_secure || "0") === "1"}
                onChange={(e) => update("smtp_secure", e.target.checked ? "1" : "0")}
                className="accent-prisma-accent"
              />
              Usar conexión segura (SSL/TLS)
            </label>
          </div>
          <p className="text-xs text-gray-500">Ejemplo: puerto 587 sin SSL directo (STARTTLS) o 465 con SSL/TLS.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display text-lg uppercase text-gray-800">Seccion principal (Hero)</h3>
            <button type="button" onClick={() => saveSection(HERO_KEYS)} className="text-xs font-semibold uppercase tracking-wider text-prisma-accent hover:text-prisma-accent/80">Guardar seccion</button>
          </div>
          <FormInput label="Título principal (THE ULTIMATE...)" value={settings.hero_phrase || ""} onChange={(v) => update("hero_phrase", v)} />
          <FormInput label="Subtítulo principal" value={settings.hero_subtitle || ""} onChange={(v) => update("hero_subtitle", v)} />
          <div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={(settings.use_hero_title_image || "0") === "1"}
                onChange={(e) => update("use_hero_title_image", e.target.checked ? "1" : "0")}
                className="accent-prisma-accent"
                disabled={!settings.hero_image_url}
              />
              Usar imagen en lugar del título
            </label>
            <p className="text-xs text-gray-400 mt-1">Si se activa, se mostrará la imagen subida en lugar del texto del título principal. Sube una imagen primero para activar esta opción.</p>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Imagen del título</label>
            {settings.hero_image_url && (
              <div className="flex items-center gap-4 mb-3">
                <img src={settings.hero_image_url} alt="Hero" className="max-w-xs h-32 object-contain rounded-xl border bg-gray-900 p-2" />
                <button onClick={removeHeroImage} type="button" className="text-xs text-red-500 hover:text-red-700 underline">Quitar imagen</button>
              </div>
            )}
            <label className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors">
              <Upload size={16} /> {settings.hero_image_url ? 'Cambiar imagen' : 'Subir imagen'}
              <input ref={heroRef} type="file" accept="image/*" onChange={uploadHero} className="hidden" />
            </label>
          </div>
          <div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={(settings.show_hero_photos || "1") === "1"}
                onChange={(e) => update("show_hero_photos", e.target.checked ? "1" : "0")}
                className="accent-prisma-accent"
              />
              Mostrar fotos de inicio (fiesta y club)
            </label>
            <p className="text-xs text-gray-400 mt-1">Si se desactiva, solo se mostrará el prisma y el texto en la sección principal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Foto inclinada izquierda (inicio)</label>
              {settings.hero_photo_left_url && (
                <img src={settings.hero_photo_left_url} alt="Hero izquierda" className="w-full h-28 object-cover rounded-xl mb-3 border" />
              )}
              <label className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors">
                <Upload size={16} /> Subir foto izquierda
                <input ref={heroLeftRef} type="file" accept="image/*" onChange={(e) => uploadHeroSidePhoto("left", e)} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Foto inclinada derecha (inicio)</label>
              {settings.hero_photo_right_url && (
                <img src={settings.hero_photo_right_url} alt="Hero derecha" className="w-full h-28 object-cover rounded-xl mb-3 border" />
              )}
              <label className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors">
                <Upload size={16} /> Subir foto derecha
                <input ref={heroRightRef} type="file" accept="image/*" onChange={(e) => uploadHeroSidePhoto("right", e)} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-display text-lg uppercase text-gray-800">Seguridad</h3>
            <button type="button" onClick={() => saveSection([], { includePassword: true })} className="text-xs font-semibold uppercase tracking-wider text-prisma-accent hover:text-prisma-accent/80">Guardar seccion</button>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Nueva contraseña de admin</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Déjalo vacío para mantener la actual"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:border-prisma-accent outline-none transition-colors"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={saveAll}
          disabled={saving}
          className="bg-prisma-accent text-white px-8 py-3 rounded-xl font-semibold uppercase tracking-wider hover:bg-prisma-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={18} /> {saving ? "Guardando..." : "Guardar todos los ajustes"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════
function FormInput({ label, name, type = "text", defaultValue, required, value, onChange, step }: {
  label: string; name?: string; type?: string; defaultValue?: any; required?: boolean;
  value?: string; onChange?: (v: string) => void; step?: string;
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        required={required}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-prisma-accent outline-none transition-colors"
      />
    </div>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-prisma-accent" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <p className="text-gray-400 text-sm uppercase tracking-wider font-medium">{text}</p>
    </div>
  );
}
