import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  price: number;
  image: string;
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuying(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: id, user_name: name, user_email: email }),
      });
      const data = await res.json();
      if (data.qr_code) {
        navigate(`/ticket/${data.qr_code}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to buy ticket');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-prisma-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-prisma-accent"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-prisma-dark text-white text-2xl font-display">
        Event not found
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-prisma-dark text-white px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-prisma-accent transition-colors mb-8 font-semibold uppercase tracking-widest text-sm"
        >
          <ArrowLeft size={20} /> Back to Events
        </button>

        <div className="bg-black/40 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10">
          <div className="md:w-1/2 relative">
            <img
              src={event.image || 'https://picsum.photos/seed/party/800/600'}
              alt={event.title}
              className="w-full h-full object-cover min-h-[400px] opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
              <h1 className="font-display text-5xl md:text-6xl text-white uppercase leading-none drop-shadow-lg">
                {event.title}
              </h1>
            </div>
          </div>

          <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300 font-medium">
                  <Calendar size={24} className="text-prisma-accent" />
                  <span className="text-lg">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 font-medium">
                  <Clock size={24} className="text-prisma-accent" />
                  <span className="text-lg">{event.time}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 font-medium">
                  <MapPin size={24} className="text-prisma-accent" />
                  <span className="text-lg">Prima Pub, Kyiv</span>
                </div>
              </div>
              <div className="bg-prisma-accent/20 border border-prisma-accent text-prisma-accent px-6 py-3 rounded-2xl font-display text-3xl">
                ${event.price.toFixed(2)}
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed mb-12 text-lg">
              {event.description}
            </p>

            <form onSubmit={handleBuy} className="mt-auto space-y-6">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-b-2 border-white/20 py-3 px-4 bg-white/5 focus:bg-white/10 focus:border-prisma-accent outline-none transition-colors rounded-t-xl text-lg font-medium text-white placeholder-gray-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b-2 border-white/20 py-3 px-4 bg-white/5 focus:bg-white/10 focus:border-prisma-accent outline-none transition-colors rounded-t-xl text-lg font-medium text-white placeholder-gray-500"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                disabled={buying}
                className="w-full bg-prisma-accent text-white py-5 rounded-full font-display text-2xl uppercase tracking-wider hover:bg-white hover:text-prisma-dark transition-colors disabled:opacity-50 mt-8 shadow-lg shadow-prisma-accent/30"
              >
                {buying ? 'Processing...' : 'Complete Purchase'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
