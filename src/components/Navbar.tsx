import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

interface NavbarProps {
  onLoginClick: () => void;
  onLogoClick: () => void;
  settings: Record<string, string>;
}

function PrideFlag() {
  return (
    <div className="h-6 w-8 sm:h-8 sm:w-10 flex flex-col rounded-sm overflow-hidden flex-shrink-0">
      <div className="h-1/6 w-full bg-[#E40303]" />
      <div className="h-1/6 w-full bg-[#FF8C00]" />
      <div className="h-1/6 w-full bg-[#FFED00]" />
      <div className="h-1/6 w-full bg-[#008026]" />
      <div className="h-1/6 w-full bg-[#24408E]" />
      <div className="h-1/6 w-full bg-[#732982]" />
    </div>
  );
}

export default function Navbar({ onLoginClick, onLogoClick, settings }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const logoUrl = settings.logo_url;
  const siteName = settings.site_name || 'PRISMA';

  return (
    <>
      {/* Navigation - Floating Pill (BOTTOM) */}
      <nav className={`fixed bottom-4 left-1/2 -translate-x-1/2 w-fit max-w-[98vw] z-50 border-2 rounded-full backdrop-blur-md flex justify-between items-center px-3 py-1 md:px-8 md:py-3 shadow-[0_0_40px_rgba(139,92,246,0.2)] gap-2 sm:gap-6 md:gap-10 whitespace-nowrap overflow-hidden transition-all duration-300 ${scrolled ? 'border-prisma-purple/40 bg-prisma-dark/95' : 'border-white/10 bg-prisma-dark/60'}`}>
        <button
          onClick={() => scrollTo('events')}
          className="text-sm sm:text-xl md:text-2xl uppercase hover:text-prisma-accent transition-all font-display tracking-widest shrink text-white"
        >
          Events
        </button>
        <button
          onClick={() => scrollTo('gallery')}
          className="text-sm sm:text-xl md:text-2xl uppercase hover:text-prisma-accent transition-all font-display tracking-widest shrink text-white"
        >
          Gallery
        </button>

        <button
          onClick={onLogoClick}
          className="mx-1 md:mx-4 select-none flex items-center justify-center flex-shrink-0 min-w-fit"
        >
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-8 sm:h-10 md:h-12 w-auto object-contain" />
          ) : (
            <span className="font-display text-2xl sm:text-4xl md:text-5xl text-white tracking-wider flex items-center gap-2">
              {siteName.replace(' PUB', '')}
              <PrideFlag />
            </span>
          )}
        </button>

        <button
          onClick={() => scrollTo('contact')}
          className="text-sm sm:text-xl md:text-2xl uppercase hover:text-prisma-accent transition-all font-display tracking-widest shrink text-white hidden sm:block"
        >
          Contact
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
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
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.6 }}
            className="fixed inset-0 bg-prisma-dark z-40 flex flex-col items-center justify-center"
          >
            {/* Ambient glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-prisma-purple/15 rounded-full blur-[180px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-prisma-accent/10 rounded-full blur-[150px]" />
            {/* Logo at top of menu */}
            <div className="mb-10">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-16 md:h-20 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-display text-4xl md:text-5xl text-white tracking-wider">{siteName.replace(' PUB', '')}</span>
                  <PrideFlag />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6 text-center">
              <button onClick={() => { setIsOpen(false); onLogoClick(); }} className="font-display text-5xl md:text-7xl text-white hover:text-prisma-accent transition-colors uppercase">
                Home
              </button>
              <button onClick={() => scrollTo('events')} className="font-display text-5xl md:text-7xl text-white hover:text-prisma-accent transition-colors uppercase">
                Events
              </button>
              <button onClick={() => scrollTo('gallery')} className="font-display text-5xl md:text-7xl text-white hover:text-prisma-accent transition-colors uppercase">
                Gallery
              </button>
              <button onClick={() => scrollTo('contact')} className="font-display text-5xl md:text-7xl text-white hover:text-prisma-accent transition-colors uppercase">
                Contact
              </button>

              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={() => { setIsOpen(false); onLoginClick(); }}
                  className="flex items-center gap-3 mx-auto text-gray-400 hover:text-prisma-accent transition-colors group"
                >
                  <Lock size={18} className="group-hover:scale-110 transition-transform" />
                  <span className="font-display text-xl uppercase tracking-widest">Admin Login</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
