import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  price: number;
  image: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-prisma-dark text-white px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tighter text-white mb-4 drop-shadow-lg">
            Upcoming <span className="text-prisma-accent">Events</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Get your tickets now. Don't miss out on the best nights at Prima Pub.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-prisma-accent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-prisma-accent/20 transition-all duration-300 group border border-white/10 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={event.image || 'https://picsum.photos/seed/party/800/600'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-prisma-accent border border-white/10">
                    ${event.price.toFixed(2)}
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-grow">
                  <h2 className="font-display text-3xl uppercase tracking-tight mb-4 text-white group-hover:text-prisma-accent transition-colors">
                    {event.title}
                  </h2>
                  
                  <div className="space-y-3 mb-6 text-gray-300 font-medium">
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-prisma-accent" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-prisma-accent" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-prisma-accent" />
                      <span>Prima Pub, Kyiv</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 mb-8 line-clamp-3 text-sm leading-relaxed">
                    {event.description}
                  </p>
                  
                  <div className="mt-auto">
                    <Link
                      to={`/events/${event.id}`}
                      className="block w-full text-center bg-white text-prisma-dark py-4 rounded-full font-semibold uppercase tracking-widest hover:bg-prisma-accent hover:text-white transition-colors"
                    >
                      Buy Ticket
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
