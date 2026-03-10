import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Ticket as TicketIcon, Calendar as CalendarIcon } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  price: number;
  image: string;
}

interface Ticket {
  id: number;
  qr_code: string;
  user_name: string;
  user_email: string;
  event_title: string;
  created_at: string;
}

export default function Admin() {
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'tickets'>('events');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, ticketsRes] = await Promise.all([
        fetch('/api/admin/events'),
        fetch('/api/admin/tickets'),
      ]);
      const eventsData = await eventsRes.json();
      const ticketsData = await ticketsRes.json();
      setEvents(eventsData);
      setTickets(ticketsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          date,
          time,
          description,
          price: parseFloat(price),
          image,
        }),
      });
      setShowForm(false);
      setTitle('');
      setDate('');
      setTime('');
      setDescription('');
      setPrice('');
      setImage('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to add event');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-prisma-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-prisma-accent"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-prisma-dark text-white px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl uppercase tracking-tighter text-white mb-6 md:mb-0 drop-shadow-lg">
            Admin <span className="text-prisma-accent">Panel</span>
          </h1>
          
          <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 shadow-md border border-white/10">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold uppercase tracking-widest text-sm transition-colors ${
                activeTab === 'events' ? 'bg-prisma-accent text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarIcon size={18} /> Events
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold uppercase tracking-widest text-sm transition-colors ${
                activeTab === 'tickets' ? 'bg-prisma-accent text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <TicketIcon size={18} /> Tickets
            </button>
          </div>
        </div>

        {activeTab === 'events' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-3xl uppercase tracking-tight text-white">Manage Events</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-white text-prisma-dark px-6 py-3 rounded-full font-semibold uppercase tracking-widest text-sm hover:bg-prisma-accent hover:text-white transition-colors"
              >
                {showForm ? 'Cancel' : <><Plus size={18} /> Add Event</>}
              </button>
            </div>

            {showForm && (
              <div className="bg-black/40 backdrop-blur-md p-8 rounded-3xl shadow-xl mb-12 border border-white/10">
                <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Title</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border-b-2 border-white/20 py-3 px-4 bg-white/5 focus:bg-white/10 focus:border-prisma-accent outline-none transition-colors rounded-t-xl text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Date</label>
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full border-b-2 border-white/20 py-3 px-4 bg-white/5 focus:bg-white/10 focus:border-prisma-accent outline-none transition-colors rounded-t-xl text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Time</label>
                    <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full border-b-2 border-white/20 py-3 px-4 bg-white/5 focus:bg-white/10 focus:border-prisma-accent outline-none transition-colors rounded-t-xl text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Price ($)</label>
                    <input type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border-b-2 border-white/20 py-3 px-4 bg-white/5 focus:bg-white/10 focus:border-prisma-accent outline-none transition-colors rounded-t-xl text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Image URL</label>
                    <input type="url" value={image} onChange={(e) => setImage(e.target.value)} className="w-full border-b-2 border-white/20 py-3 px-4 bg-white/5 focus:bg-white/10 focus:border-prisma-accent outline-none transition-colors rounded-t-xl text-white" placeholder="https://..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Description</label>
                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border-b-2 border-white/20 py-3 px-4 bg-white/5 focus:bg-white/10 focus:border-prisma-accent outline-none transition-colors rounded-t-xl resize-none text-white"></textarea>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" className="bg-prisma-accent text-white px-8 py-4 rounded-full font-semibold uppercase tracking-widest hover:bg-white hover:text-prisma-dark transition-colors">
                      Save Event
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="py-4 px-6 font-semibold uppercase tracking-widest text-xs text-gray-400">Event</th>
                      <th className="py-4 px-6 font-semibold uppercase tracking-widest text-xs text-gray-400">Date & Time</th>
                      <th className="py-4 px-6 font-semibold uppercase tracking-widest text-xs text-gray-400">Price</th>
                      <th className="py-4 px-6 font-semibold uppercase tracking-widest text-xs text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-display text-xl uppercase text-white">{event.title}</div>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-300">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-300">
                          ${event.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button onClick={() => handleDeleteEvent(event.id)} className="text-prisma-accent hover:text-white transition-colors p-2">
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500 font-medium">No events found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'tickets' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-display text-3xl uppercase tracking-tight text-white mb-8">Sold Tickets</h2>
            <div className="bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="py-4 px-6 font-semibold uppercase tracking-widest text-xs text-gray-400">QR Code</th>
                      <th className="py-4 px-6 font-semibold uppercase tracking-widest text-xs text-gray-400">Event</th>
                      <th className="py-4 px-6 font-semibold uppercase tracking-widest text-xs text-gray-400">User</th>
                      <th className="py-4 px-6 font-semibold uppercase tracking-widest text-xs text-gray-400">Purchased</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs text-gray-500">{ticket.qr_code}</td>
                        <td className="py-4 px-6 font-display text-lg uppercase text-white">{ticket.event_title}</td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-300">{ticket.user_name}</div>
                          <div className="text-sm text-gray-500">{ticket.user_email}</div>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-400">
                          {new Date(ticket.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {tickets.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500 font-medium">No tickets sold yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
