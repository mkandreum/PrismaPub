import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="pt-20 min-h-screen bg-prisma-dark text-white">
      {/* Hero Section - Brutalist/Editorial Style */}
      <section className="relative w-full overflow-hidden flex flex-col items-center justify-center py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-prisma-purple/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-prisma-accent/20 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <p className="text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-prisma-accent mb-6">
              Welcome to the best LGBT+ nights
            </p>
            
            <h1 className="font-display text-[15vw] md:text-[10vw] leading-[0.85] tracking-tight uppercase text-white mb-8 relative z-20 drop-shadow-2xl">
              PRIMA<br />
              <span className="text-prisma-purple" style={{ WebkitTextStroke: '2px white' }}>PUB</span>
            </h1>

            {/* Overlapping Images - Editorial Style */}
            <div className="relative w-full max-w-4xl h-[40vh] md:h-[50vh] mt-10 mb-16">
              <motion.img
                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: -5 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                src="https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=2070&auto=format&fit=crop"
                alt="Party"
                className="absolute left-0 top-0 w-2/3 h-full object-cover rounded-2xl shadow-2xl z-10 grayscale hover:grayscale-0 transition-all duration-500 border-2 border-white/10"
              />
              <motion.img
                initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 5 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop"
                alt="Club"
                className="absolute right-0 top-10 w-1/2 h-full object-cover rounded-2xl shadow-2xl z-20 border-4 border-prisma-dark"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-prisma-accent text-white w-32 h-32 rounded-full flex items-center justify-center z-30 shadow-xl border-4 border-prisma-dark"
              >
                <span className="font-display text-3xl rotate-[-15deg]">JOIN US</span>
              </motion.div>
            </div>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-10 font-medium leading-relaxed">
              Experience the ultimate nightlife destination. 
              We celebrate diversity, music, and unforgettable moments. 
              Are you ready to unlock your full potential on the dance floor?
            </p>

            <Link
              to="/events"
              className="group inline-flex items-center gap-4 bg-white text-prisma-dark px-8 py-4 rounded-full font-semibold uppercase tracking-widest hover:bg-prisma-accent hover:text-white transition-all duration-300"
            >
              View Upcoming Events
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="w-full bg-prisma-accent text-white py-4 overflow-hidden border-y-2 border-white/20">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="font-display text-4xl mx-8 uppercase tracking-wider">
              PRIMA PUB • SAFE SPACE • GOOD VIBES • 
            </span>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-black/50 text-white py-12 px-4 sm:px-6 lg:px-8 text-center border-t border-white/10">
        <h2 className="font-display text-4xl mb-6">PRIMA PUB</h2>
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-8">
          Kyiv, 14/3a Hetmana Str.
        </p>
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-prisma-accent transition-colors">Instagram</a>
          <a href="#" className="hover:text-prisma-accent transition-colors">Facebook</a>
          <a href="#" className="hover:text-prisma-accent transition-colors">TikTok</a>
        </div>
      </footer>
    </div>
  );
}
