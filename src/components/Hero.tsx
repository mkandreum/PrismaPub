import { motion, useScroll, useTransform } from "motion/react";
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
        <div className="glow-orb left-[-10%] top-[-5%] h-[500px] w-[500px] bg-[#3a1a7a]/40 blur-[120px] animate-[glow-drift-1_15s_ease-in-out_infinite]" />
        <div className="glow-orb right-[-10%] top-[10%] h-[600px] w-[600px] bg-[#4c0577]/35 blur-[130px] animate-[glow-drift-2_12s_ease-in-out_infinite]" />
        <div className="glow-orb bottom-[-10%] left-[20%] h-[450px] w-[450px] bg-[#1e0b4a]/50 blur-[100px] animate-[glow-drift-3_18s_ease-in-out_infinite]" />
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

      {/* ── PRISM AT THE VERY TOP (always visible) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-0 flex flex-col items-center justify-start pt-10 md:pt-14 pointer-events-none"
      >
        <div className="relative flex items-start justify-center overflow-visible">
          <svg viewBox="0 0 300 280" className="w-[65vw] max-w-[360px] h-auto overflow-visible drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" aria-hidden="true" style={{ filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.2))' }}>
            <defs>
              <linearGradient id="prism-stroke-enhanced" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                <stop offset="30%" stopColor="rgba(220,180,255,1)" />
                <stop offset="50%" stopColor="rgba(255,255,255,1)" />
                <stop offset="70%" stopColor="rgba(200,160,255,1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,1)" />
              </linearGradient>
              <linearGradient id="prism-edge-left" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                <stop offset="50%" stopColor="rgba(200,170,255,0.9)" />
                <stop offset="100%" stopColor="rgba(180,140,255,0.8)" />
              </linearGradient>
              <linearGradient id="prism-edge-right" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                <stop offset="50%" stopColor="rgba(220,190,255,0.9)" />
                <stop offset="100%" stopColor="rgba(190,150,255,0.8)" />
              </linearGradient>
              <linearGradient id="prism-edge-bottom" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(180,140,255,0.8)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="100%" stopColor="rgba(190,150,255,0.8)" />
              </linearGradient>
              <linearGradient id="entry-beam-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                <stop offset="20%" stopColor="rgba(255,255,255,0.7)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.95)" />
              </linearGradient>
              <radialGradient id="prism-body-glow" cx="50%" cy="55%" r="50%">
                <stop offset="0%" stopColor="rgba(220,190,255,0.22)" />
                <stop offset="40%" stopColor="rgba(180,140,255,0.12)" />
                <stop offset="100%" stopColor="rgba(140,100,255,0)" />
              </radialGradient>
              <radialGradient id="apex-flare" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                <stop offset="20%" stopColor="rgba(240,220,255,0.6)" />
                <stop offset="50%" stopColor="rgba(210,180,255,0.2)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <filter id="beam-glow" x="-50%" y="-10%" width="200%" height="140%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
              <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
              <filter id="flare-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
              <filter id="edge-radiance" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>

            {/* Entry beam — white light entering the prism from above */}
            <motion.line
              x1="150" y1="-60" x2="150" y2="48"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#soft-glow)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.line
              x1="150" y1="-60" x2="150" y2="48"
              stroke="white"
              strokeWidth="1.2"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Rainbow beams — extend beyond viewBox via overflow:visible */}
            {[
              { x2: 14, color: "#ff1737" },
              { x2: 52, color: "#ff7b00" },
              { x2: 92, color: "#fff200" },
              { x2: 130, color: "#48ff3a" },
              { x2: 170, color: "#33e6ff" },
              { x2: 212, color: "#3f69ff" },
              { x2: 286, color: "#ff2dff" },
            ].map((beam, i) => (
              <g key={beam.color}>
                <motion.line
                  x1="150"
                  y1="48"
                  x2={beam.x2}
                  y2="1100"
                  stroke={beam.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  filter="url(#beam-glow)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.55, 0.92, 0.65] }}
                  transition={{ duration: 2.8, delay: i * 0.08, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                />
                <motion.line
                  x1="150"
                  y1="48"
                  x2={beam.x2}
                  y2="1100"
                  stroke={beam.color}
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.72, 1, 0.8] }}
                  transition={{ duration: 2.1, delay: i * 0.08, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                />
              </g>
            ))}

            {/* Prism body glow */}
            <polygon
              points="150,48 270,260 30,260"
              fill="url(#prism-body-glow)"
              filter="url(#soft-glow)"
            />

            {/* Prism triangle - main shape */}
            <polygon
              points="150,48 270,260 30,260"
              fill="rgba(178,112,255,0.09)"
              stroke="url(#prism-stroke-enhanced)"
              strokeWidth="2.7"
              strokeLinejoin="round"
              className="prism-triangle-edge"
            />

            {/* Glowing edge overlays for radiant edges */}
            {/* Left edge glow */}
            <motion.line
              x1="150" y1="48" x2="30" y2="260"
              stroke="url(#prism-edge-left)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#edge-radiance)"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Right edge glow */}
            <motion.line
              x1="150" y1="48" x2="270" y2="260"
              stroke="url(#prism-edge-right)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#edge-radiance)"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3.5, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Bottom edge glow */}
            <motion.line
              x1="30" y1="260" x2="270" y2="260"
              stroke="url(#prism-edge-bottom)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#edge-radiance)"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, delay: 1, repeat: Infinity, ease: "easeInOut" }}
            />

            <line x1="150" y1="48" x2="150" y2="260" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1" />
            <line x1="30" y1="260" x2="150" y2="190" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
            <line x1="270" y1="260" x2="150" y2="190" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
            <line x1="72" y1="218" x2="228" y2="218" stroke="rgba(117,178,255,0.22)" strokeWidth="1" />

            {/* Realistic lens flare at apex */}
            <g>
              {/* Soft radial glow */}
              <circle cx="150" cy="48" r="18" fill="url(#apex-flare)" />
              {/* Bright core */}
              <motion.circle
                cx="150" cy="48" r="4"
                fill="white"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: [0.8, 1, 0.8], r: [4, 5, 4] as any }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Main cross — long vertical spike */}
              <motion.line
                x1="150" y1="20" x2="150" y2="76"
                stroke="white" strokeWidth="1"
                filter="url(#flare-glow)"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Main cross — long horizontal spike */}
              <motion.line
                x1="122" y1="48" x2="178" y2="48"
                stroke="white" strokeWidth="1"
                filter="url(#flare-glow)"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 3, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Shorter diagonal spikes */}
              <motion.line
                x1="136" y1="34" x2="164" y2="62"
                stroke="rgba(220,200,255,0.7)" strokeWidth="0.6"
                filter="url(#flare-glow)"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.4, delay: 0.1, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.line
                x1="164" y1="34" x2="136" y2="62"
                stroke="rgba(220,200,255,0.7)" strokeWidth="0.6"
                filter="url(#flare-glow)"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.4, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
              />
            </g>
          </svg>
        </div>
      </motion.div>

      <motion.div style={{ y: parallaxY, opacity: parallaxOpacity }} className="max-w-6xl w-full relative z-10 will-change-transform flex flex-col items-center text-center pt-4 md:pt-6 pb-12 md:pb-14">
        {/* Text Content */}
        <div className="flex flex-col items-center text-center">
          {/* Small badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-prisma-purple/20 border border-prisma-purple/30 text-white px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.18em] font-semibold mb-4"
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
            <h1 className="headline-glow text-6xl md:text-8xl xl:text-[8.4rem] font-display uppercase text-white mb-5 tracking-[-0.08em]">
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
            className="text-sm md:text-base text-white/72 font-semibold uppercase tracking-[0.2em] mb-8"
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

        {/* Photos below prism — controlled by admin setting */}
        {showPhotos && (
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
                  loading="lazy"
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
                  loading="lazy"
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
