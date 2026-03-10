import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3, CalendarDays, Ticket, Image, Megaphone, Activity,
  Settings, LogOut, Plus, Trash2, Edit3, ToggleLeft, ToggleRight,
  Upload, X, Save, Eye, EyeOff, ArrowLeft, GripVertical, Search
} from "lucide-react";
import { useToast } from "./Toast";

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = "stats" | "events" | "tickets" | "gallery" | "banners" | "activity" | "settings";

const TABS: { key: Tab; icon: React.ReactNode; label: string }[] = [
  { key: "stats", icon: <BarChart3 size={20} />, label: "Dashboard" },
  { key: "events", icon: <CalendarDays size={20} />, label: "Events" },
  { key: "tickets", icon: <Ticket size={20} />, label: "Tickets" },
  { key: "gallery", icon: <Image size={20} />, label: "Gallery" },
  { key: "banners", icon: <Megaphone size={20} />, label: "Banners" },
  { key: "activity", icon: <Activity size={20} />, label: "Activity" },
  { key: "settings", icon: <Settings size={20} />, label: "Settings" },
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
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Admin Panel</p>
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
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
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
      <h2 className="font-display text-3xl uppercase mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active Events", value: stats.totalEvents, color: "bg-violet-500" },
          { label: "Tickets Sold", value: stats.totalTickets, color: "bg-prisma-accent" },
          { label: "Gallery Photos", value: stats.totalPhotos, color: "bg-blue-500" },
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
          <h3 className="font-display text-xl uppercase mb-4">Tickets per Event</h3>
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
      image: fd.get("image") as string,
      is_active: editing?.is_active ?? 1,
    };

    if (editing?.id) {
      await apiFetch(`/api/admin/events/${editing.id}`, { method: "PATCH", body: JSON.stringify(data) });
      showToast("Event updated", "success");
    } else {
      await apiFetch("/api/admin/events", { method: "POST", body: JSON.stringify(data) });
      showToast("Event created", "success");
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this event?")) return;
    await apiFetch(`/api/admin/events/${id}`, { method: "DELETE" });
    showToast("Event deleted", "success");
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-3xl uppercase">Events</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-prisma-accent text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-prisma-accent/90 transition-colors"
        >
          <Plus size={18} /> New Event
        </button>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-2xl uppercase">{editing?.id ? "Edit" : "New"} Event</h3>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-400 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={save} className="space-y-4">
                <FormInput name="title" label="Title" defaultValue={editing?.title} required />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput name="date" label="Date" type="date" defaultValue={editing?.date} required />
                  <FormInput name="time" label="Time" type="time" defaultValue={editing?.time} required />
                </div>
                <FormInput name="price" label="Price (€)" type="number" step="0.01" defaultValue={editing?.price} required />
                <FormInput name="image" label="Image URL" defaultValue={editing?.image} />
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editing?.description}
                    rows={3}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-prisma-accent outline-none transition-colors resize-none"
                  />
                </div>
                <button type="submit" className="w-full bg-prisma-accent text-white py-3 rounded-xl font-semibold uppercase tracking-wider hover:bg-prisma-accent/90 transition-colors flex items-center justify-center gap-2">
                  <Save size={18} /> {editing?.id ? "Update" : "Create"} Event
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
                {!ev.is_active && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
              </div>
              <p className="text-xs text-gray-400">{ev.date} • {ev.time} • {ev.price}€</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(ev); setShowForm(true); }}
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
        {events.length === 0 && <EmptyState text="No events yet" />}
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

  useEffect(() => {
    apiFetch("/api/admin/tickets").then(r => r.json()).then(setTickets);
  }, []);

  const filtered = tickets.filter(t =>
    t.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    t.event_title?.toLowerCase().includes(search.toLowerCase()) ||
    t.qr_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="font-display text-3xl uppercase mb-6">Tickets</h2>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, event or QR code..."
          className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-prisma-accent outline-none transition-colors"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">Name</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">Email</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">Event</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">QR Code</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium">{t.user_name}</td>
                  <td className="px-5 py-3 text-gray-500">{t.user_email}</td>
                  <td className="px-5 py-3">{t.event_title}</td>
                  <td className="px-5 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{t.qr_code}</code>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              {search ? "No tickets match search" : "No tickets sold yet"}
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
      showToast(`${e.target.files.length} photo(s) uploaded!`, "success");
      load();
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (id: number) => {
    await apiFetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    showToast("Photo deleted", "success");
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-3xl uppercase">Gallery</h2>
        <label
          className={`bg-prisma-accent text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer hover:bg-prisma-accent/90 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <Upload size={18} />
          {uploading ? "Uploading..." : "Upload Photos"}
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

      {images.length === 0 && !uploading && <EmptyState text="Gallery is empty. Upload some photos!" />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// BANNERS TAB
// ═══════════════════════════════════════════════════════
function BannersTab() {
  const [banners, setBanners] = useState<any[]>([]);
  const [newText, setNewText] = useState("");
  const { showToast } = useToast();

  const load = useCallback(() => {
    apiFetch("/api/admin/banners").then(r => r.json()).then(setBanners);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    await apiFetch("/api/admin/banners", { method: "POST", body: JSON.stringify({ text: newText }) });
    setNewText("");
    showToast("Banner added", "success");
    load();
  };

  const toggle = async (b: any) => {
    await apiFetch(`/api/admin/banners/${b.id}`, { method: "PUT", body: JSON.stringify({ active: b.active ? 0 : 1 }) });
    load();
  };

  const remove = async (id: number) => {
    await apiFetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    showToast("Banner deleted", "success");
    load();
  };

  return (
    <div>
      <h2 className="font-display text-3xl uppercase mb-6">Banners</h2>

      <form onSubmit={add} className="flex gap-3 mb-8">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Enter banner text..."
          className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-prisma-accent outline-none transition-colors"
        />
        <button type="submit" className="bg-prisma-accent text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-prisma-accent/90 transition-colors">
          <Plus size={18} /> Add
        </button>
      </form>

      <div className="space-y-3">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
            <button onClick={() => toggle(b)} className="flex-shrink-0">
              {b.active ? (
                <ToggleRight size={28} className="text-green-500" />
              ) : (
                <ToggleLeft size={28} className="text-gray-300" />
              )}
            </button>
            <p className={`flex-1 text-sm ${b.active ? "text-gray-800" : "text-gray-400 line-through"}`}>{b.text}</p>
            <button onClick={() => remove(b.id)} className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {banners.length === 0 && <EmptyState text="No banners. Add one above!" />}
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

  return (
    <div>
      <h2 className="font-display text-3xl uppercase mb-6">Activity Log</h2>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 shadow-sm">
            <span className={`text-xs font-bold uppercase px-2 py-1 rounded-lg flex-shrink-0 ${actionColor(log.action)}`}>
              {log.action}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700">{log.details}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(log.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {logs.length === 0 && <EmptyState text="No activity recorded yet" />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SETTINGS TAB
// ═══════════════════════════════════════════════════════
function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const heroRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(setSettings);
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body: Record<string, string> = { ...settings };
    if (newPassword.trim()) body.admin_password = newPassword;
    try {
      await apiFetch("/api/admin/settings", { method: "POST", body: JSON.stringify(body) });
      showToast("Settings saved", "success");
      setNewPassword("");
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const uploadHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append("image", e.target.files[0]);
    try {
      const res = await apiFetch("/api/admin/settings/hero-image", { method: "POST", body: fd });
      const data = await res.json();
      setSettings(s => ({ ...s, hero_image_url: data.url }));
      showToast("Hero image updated", "success");
    } catch {
      showToast("Upload failed", "error");
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
      showToast("Logo updated", "success");
    } catch {
      showToast("Upload failed", "error");
    }
  };

  const removeLogo = () => {
    setSettings(s => ({ ...s, logo_url: '' }));
  };

  const update = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }));

  return (
    <div>
      <h2 className="font-display text-3xl uppercase mb-6">Settings</h2>

      <form onSubmit={save} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h3 className="font-display text-lg uppercase text-gray-800 border-b border-gray-100 pb-3">General</h3>
          <FormInput label="Site Name" value={settings.site_name || ""} onChange={(v) => update("site_name", v)} />
          <FormInput label="Address" value={settings.address || ""} onChange={(v) => update("address", v)} />
          <FormInput label="Instagram URL" value={settings.instagram_url || ""} onChange={(v) => update("instagram_url", v)} />
          <FormInput label="Footer Text" value={settings.footer_text || ""} onChange={(v) => update("footer_text", v)} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h3 className="font-display text-lg uppercase text-gray-800 border-b border-gray-100 pb-3">Logo (Navbar & Footer)</h3>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Logo Image</label>
            <p className="text-xs text-gray-400 mb-3">If set, replaces the text logo in the navbar and footer. Leave empty to show text + pride flag.</p>
            {settings.logo_url && (
              <div className="flex items-center gap-4 mb-3">
                <img src={settings.logo_url} alt="Logo" className="h-14 w-auto object-contain bg-gray-900 rounded-xl p-2 border" />
                <button onClick={removeLogo} type="button" className="text-xs text-red-500 hover:text-red-700 underline">Remove logo</button>
              </div>
            )}
            <label className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors">
              <Upload size={16} /> {settings.logo_url ? 'Change Logo' : 'Upload Logo'}
              <input ref={logoRef} type="file" accept="image/*" onChange={uploadLogo} className="hidden" />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h3 className="font-display text-lg uppercase text-gray-800 border-b border-gray-100 pb-3">Marquee Texts</h3>
          <FormInput label="Marquee 1 (after Hero)" value={settings.marquee_1 || ""} onChange={(v) => update("marquee_1", v)} />
          <FormInput label="Marquee 2 (after Events)" value={settings.marquee_2 || ""} onChange={(v) => update("marquee_2", v)} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h3 className="font-display text-lg uppercase text-gray-800 border-b border-gray-100 pb-3">Hero Section</h3>
          <FormInput label="Hero Phrase" value={settings.hero_phrase || ""} onChange={(v) => update("hero_phrase", v)} />
          <FormInput label="Hero Subtitle" value={settings.hero_subtitle || ""} onChange={(v) => update("hero_subtitle", v)} />
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Hero Image</label>
            {settings.hero_image_url && (
              <img src={settings.hero_image_url} alt="Hero" className="w-full max-w-xs h-32 object-cover rounded-xl mb-3 border" />
            )}
            <label className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors">
              <Upload size={16} /> Change Image
              <input ref={heroRef} type="file" accept="image/*" onChange={uploadHero} className="hidden" />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h3 className="font-display text-lg uppercase text-gray-800 border-b border-gray-100 pb-3">Security</h3>
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">New Admin Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:border-prisma-accent outline-none transition-colors"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-prisma-accent text-white px-8 py-3 rounded-xl font-semibold uppercase tracking-wider hover:bg-prisma-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={18} /> {saving ? "Saving..." : "Save All Settings"}
        </button>
      </form>
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
