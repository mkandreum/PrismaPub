import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { ArrowRight, Instagram, Sparkles } from "lucide-react";
import React, { useEffect, useState, useRef, useMemo } from "react";

export default function Hero() {
  const [settings, setSettings] = useState<any>({});
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(setSettings)
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  const phrase = settings.hero_phrase || "La experiencia LGBT+ definitiva";
  const subtitle = settings.hero_subtitle || "Música • Baile • Libertad";
  const siteName = settings.site_name || "PRISMA PUB";
  const imageUrl = settings.hero_image_url;
  const showPhotos = settings.show_hero_photos !== "0";
  const particles = useMemo(
    () => Array.from({ length: 16 }).map(() => ({
      x: `${5 + Math.random() * 90}%`,
      delay: `${Math.random() * 12}s`,
      duration: `${10 + Math.random() * 14}s`,
    })),
    [],
  );

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center overflow-hidden px-4">
      {/* Animated gradient bg */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[#050510]" />
        <motion.div className="glow-orb left-[-10%] top-[-5%] h-[500px] w-[500px] bg-[#3a1a7a]/40 blur-[120px]" animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="glow-orb right-[-10%] top-[10%] h-[600px] w-[600px] bg-[#4c0577]/35 blur-[130px]" animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="glow-orb bottom-[-10%] left-[20%] h-[450px] w-[450px] bg-[#1e0b4a]/50 blur-[100px]" animate={{ x: [0, 30, 0], y: [0, 20, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="particle"
            style={{ '--x': particle.x, '--delay': particle.delay, '--duration': particle.duration } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── PRISM AT THE VERY TOP ── */}
      {!imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-x-0 top-0 z-0 flex flex-col items-center justify-start pt-16 md:pt-20 pointer-events-none overflow-hidden h-full"
        >
          <div className="relative w-full max-w-[600px] h-[600px] flex items-center justify-center">
            {/* Rainbow Beams - originating from top point */}
            <div className="absolute top-[16.5%] left-1/2 -translate-x-1/2 w-full h-[120vh] z-10">
              {[
                { color: '#FF0000', angle: -24 },
                { color: '#FF7F00', angle: -16 },
                { color: '#FFFF00', angle: -8 },
                { color: '#00FF00', angle: 0 },
                { color: '#0080FF', angle: 8 },
                { color: '#4B0082', angle: 16 },
                { color: '#9400D3', angle: 24 },
              ].map((beam, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 0.92, height: '100%' }}
                  transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                  className="absolute top-0 left-1/2 origin-top"
                  style={{
                    transform: `translateX(-50%) rotate(${beam.angle}deg)`,
                    width: '12px',
                    background: `linear-gradient(to bottom, ${beam.color} 0%, ${beam.color}AA 25%, ${beam.color}66 50%, transparent 95%)`,
                    boxShadow: `0 0 35px ${beam.color}88`,
                    filter: 'blur(0.5px)',
                  }}
                >
                  <div 
                    className="w-[3px] h-full mx-auto bg-white/50 blur-[1px]"
                    style={{ animation: `pulse-beam 3s infinite alternate ${i * 0.2}s` }}
                  />
                </motion.div>
              ))}
            </div>

            {/* The Star at the Apex - Perfectly centered with beams */}
            <div className="absolute top-[16%] left-1/2 -translate-x-1/2 z-40">
              <div className="relative">
                <div className="absolute inset-0 bg-white blur-2xl opacity-90 scale-[2] animate-pulse" />
                <div className="relative w-3 h-3 bg-white rounded-full shadow-[0_0_25px_#fff,0_0_50px_#fff]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-[2px] bg-white blur-[1.5px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-[2px] bg-white blur-[1.5px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-[1.5px] bg-white rotate-45" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-[1.5px] bg-white -rotate-45" />
              </div>
            </div>

            {/* The Prism Outline (SVG) - Positioned so apex is at top-[16%] */}
            <svg viewBox="0 0 300 300" className="w-[85vw] h-[85vw] max-w-[450px] max-h-[450px] drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] z-30">
              <defs>
                <linearGradient id="prism-stroke-enhanced" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                  <stop offset="50%" stopColor="rgba(168,85,247,0.8)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.9)" />
                </linearGradient>
              </defs>
              <path
                d="M150 48 L270 260 L30 260 Z"
                fill="rgba(168,85,247,0.08)"
                stroke="url(#prism-stroke-enhanced)"
                strokeWidth="2.5"
                className="animate-pulse"
                style={{ animationDuration: '3s' }}
              />
              <line x1="150" y1="48" x2="150" y2="260" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <line x1="30" y1="260" x2="150" y2="190" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="270" y1="260" x2="150" y2="190" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            </svg>
          </div>
        </motion.div>
      )}

      <motion.div style={{ y: parallaxY, opacity: parallaxOpacity }} className={`max-w-7xl w-full relative z-10 will-change-transform ${imageUrl ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16' : 'flex flex-col items-center text-center pt-32 md:pt-40 pb-16'}`}>
        {/* Text Content */}
        <div className={`flex flex-col items-center ${imageUrl ? 'lg:items-start text-center lg:text-left order-1' : 'text-center'}`}>
          {/* Small badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-prisma-purple/20 border border-prisma-purple/30 text-prisma-purple px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold mb-6"
          >
            <Sparkles size={14} />
            Espacio seguro
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", duration: 1 }}
            className="max-w-[760px]"
          >
            <h1 className="headline-glow text-6xl md:text-8xl xl:text-[8.8rem] font-display uppercase text-white mb-6 tracking-[-0.08em]">
              {phrase.split(' ').map((word: string, i: number) => (
                <motion.span
                  key={i}
                  initial={{ y: 60, opacity: 0, rotateX: 90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring", damping: 12 }}
                  className="inline-block mr-3 last:mr-0 hover:text-white transition-colors duration-300"
                  style={{ textShadow: '0 0 70px rgba(110,92,255,0.24)' }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-sm md:text-base text-white/72 font-semibold uppercase tracking-[0.28em] mb-10"
          >
            {subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, type: "spring" }}
            className="flex flex-row flex-wrap justify-center gap-3 sm:gap-4 w-full sm:w-auto"
          >
            <motion.a
              href="#events"
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(139,92,246,0.5)" }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center justify-center gap-2 sm:gap-3 bg-prisma-purple text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold uppercase tracking-widest text-xs sm:text-sm transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.3)] relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                Comprar entradas
                <ArrowRight className="group-hover:translate-x-2 transition-transform" size={20} />
              </span>
              <motion.div className="absolute inset-0 bg-gradient-to-r from-prisma-deep to-prisma-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.a>

            <motion.a
              href="#gallery"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center justify-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-sm border border-prisma-purple/30 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold uppercase tracking-widest text-xs sm:text-sm hover:bg-prisma-purple/20 hover:border-prisma-purple/60 transition-all duration-300"
            >
              Ver galería
            </motion.a>

            {settings.instagram_url && (
              <motion.a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 border border-prisma-purple/30 text-white px-5 py-3 sm:px-6 sm:py-4 rounded-full hover:bg-prisma-purple hover:border-prisma-purple transition-all duration-300"
              >
                <Instagram size={20} />
              </motion.a>
            )}
          </motion.div>
        </div>

        {/* Hero Visual — only when hero image is configured */}
        {imageUrl && (
          <div className="relative order-2 flex justify-center items-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotate: 8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.25, duration: 1.5, delay: 0.3 }}
              className="relative z-10 w-full max-w-[480px] aspect-[4/5]"
            >
              {/* Purple glow behind */}
              <div className="absolute -inset-4 bg-prisma-purple/20 rounded-[2rem] blur-2xl -z-[1]" />
              <div className="absolute inset-0 bg-gradient-to-br from-prisma-purple/30 to-prisma-accent/20 rounded-3xl translate-x-4 translate-y-4 -z-[1]" />
              <img src={imageUrl} alt={siteName} className="w-full h-full object-cover rounded-3xl border-2 border-prisma-purple/40 shadow-2xl shadow-prisma-purple/20" />
              
              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-prisma-purple text-white px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg shadow-prisma-purple/30 border border-white/20"
              >
                Espacio seguro ✨
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-white text-prisma-dark px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg rotate-3"
              >
                ¡Únete! 🏳️‍🌈
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* Photos below prism — controlled by admin setting, no X buttons */}
        {!imageUrl && showPhotos && (
          <div className="w-full max-w-[600px] mt-8">
            <div className="relative w-full h-[40vh] md:h-[45vh]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: -5 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute left-0 top-0 w-2/3 h-full z-10"
              >
                <img
                  src="https://images.unsplash.com/photo-1545128485-c400e7702796?q=80&w=2070&auto=format&fit=crop"
                  alt="Party"
                  className="w-full h-full object-cover rounded-2xl shadow-2xl shadow-prisma-purple/20 border-2 border-prisma-purple/20 grayscale hover:grayscale-0 transition-all duration-500"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 5 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute right-0 top-10 w-1/2 h-full z-20"
              >
                <img
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop"
                  alt="Club"
                  className="w-full h-full object-cover rounded-2xl shadow-2xl shadow-prisma-purple/30 border-2 border-prisma-purple/30"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-prisma-purple text-white w-28 h-28 rounded-full flex items-center justify-center z-30 shadow-xl shadow-prisma-purple/40 border-2 border-white/20 pulse-ring"
              >
                <span className="font-display text-2xl rotate-[-12deg]">VEN</span>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-medium">Desliza</span>
          <div className="w-5 h-8 rounded-full border-2 border-prisma-purple/40 flex items-start justify-center p-1">
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 bg-prisma-purple rounded-full" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
