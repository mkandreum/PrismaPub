import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Navigation - Floating Pill */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-fit max-w-[98vw] z-50 border-2 border-white/20 rounded-full bg-prisma-dark/80 backdrop-blur-md flex justify-between items-center px-3 py-1 md:px-8 md:py-3 shadow-2xl gap-2 sm:gap-6 md:gap-10 whitespace-nowrap overflow-hidden">
        <Link to="/events" className="text-sm sm:text-xl md:text-2xl uppercase hover:text-prisma-accent transition-all font-display tracking-widest shrink text-white">Events</Link>
        <Link to="/gallery" className="text-sm sm:text-xl md:text-2xl uppercase hover:text-prisma-accent transition-all font-display tracking-widest shrink text-white">Gallery</Link>

        <Link
          to="/"
          className="mx-1 md:mx-4 select-none flex items-center justify-center flex-shrink-0 min-w-fit"
        >
          <span className="font-display text-2xl sm:text-4xl md:text-5xl text-white tracking-wider flex items-center gap-2">
            PRIMA
            <div className="h-6 w-8 sm:h-8 sm:w-10 flex flex-col">
              <div className="h-1/6 w-full bg-[#E40303]"></div>
              <div className="h-1/6 w-full bg-[#FF8C00]"></div>
              <div className="h-1/6 w-full bg-[#FFED00]"></div>
              <div className="h-1/6 w-full bg-[#008026]"></div>
              <div className="h-1/6 w-full bg-[#24408E]"></div>
              <div className="h-1/6 w-full bg-[#732982]"></div>
            </div>
          </span>
        </Link>

        <Link to="/admin" className="text-sm sm:text-xl md:text-2xl uppercase hover:text-prisma-accent transition-all font-display tracking-widest shrink text-white">Admin</Link>

        <button
          onClick={handleMenuClick}
          className="relative w-8 h-5 sm:w-10 sm:h-6 z-50 flex-shrink-0 cursor-pointer"
          aria-label="Menu"
        >
          <motion.span
            animate={isOpen ? { rotate: 45, top: "50%", y: "-50%" } : { rotate: 0, top: "0%", y: "0%" }}
            className="absolute left-0 w-full h-[3px] md:h-[4px] bg-white block origin-center transition-all"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, top: "50%", y: "-50%" } : { rotate: 0, top: "100%", y: "-100%" }}
            className="absolute left-0 w-full h-[3px] md:h-[4px] bg-white block origin-center transition-all"
          />
        </button>
      </nav>

      {/* Fullscreen Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.6 }}
            className="fixed inset-0 bg-prisma-dark z-40 flex flex-col items-center justify-center pt-20"
          >
            <div className="flex flex-col gap-8 text-center">
              <Link to="/" onClick={() => setIsOpen(false)} className="font-display text-5xl md:text-7xl text-white hover:text-prisma-accent transition-colors uppercase">Home</Link>
              <Link to="/events" onClick={() => setIsOpen(false)} className="font-display text-5xl md:text-7xl text-white hover:text-prisma-accent transition-colors uppercase">Events</Link>
              <Link to="/gallery" onClick={() => setIsOpen(false)} className="font-display text-5xl md:text-7xl text-white hover:text-prisma-accent transition-colors uppercase">Gallery</Link>
              <Link to="/admin" onClick={() => setIsOpen(false)} className="font-display text-5xl md:text-7xl text-white hover:text-prisma-accent transition-colors uppercase">Admin</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
