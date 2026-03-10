import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { ArrowRight, Instagram, Sparkles } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

export default function Hero() {
  const [settings, setSettings] = useState<any>({});
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const parallaxOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center overflow-hidden px-4">
      {/* Animated gradient bg */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,29,0.6),rgba(10,10,20,0.9))]" />
        <motion.div className="glow-orb left-[-8%] top-[-2%] h-[340px] w-[340px] bg-[#5d4dff]/75" animate={{ x: [0, 34, 0], y: [0, -24, 0], scale: [1, 1.08, 1] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="glow-orb right-[-10%] top-[5%] h-[360px] w-[360px] bg-[#ff4dc4]/80" animate={{ x: [0, -22, 0], y: [0, 20, 0], scale: [1, 1.12, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="glow-orb right-[10%] top-[18%] h-[420px] w-[420px] bg-[#5068ff]/65" animate={{ x: [0, 18, 0], y: [0, 36, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="glow-orb bottom-[-12%] left-[18%] h-[320px] w-[320px] bg-prisma-accent/40" animate={{ x: [0, -24, 0], y: [0, 12, 0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="particle" style={{ '--x': `${5 + Math.random() * 90}%`, '--delay': `${Math.random() * 12}s`, '--duration': `${8 + Math.random() * 15}s` } as React.CSSProperties} />
        ))}
      </div>

      {/* ── PRISM AT THE VERY TOP ── */}
      {!imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-20 pt-28 md:pt-36 flex flex-col items-center"
        >
          <div className="prism-visual">
            <div className="prism-star" />
            <div className="prism-entry-beam" />
            <svg viewBox="0 0 300 280" className="prism-svg w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
              <defs>
                <radialGradient id="prismFill" cx="50%" cy="35%" r="75%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="40%" stopColor="rgba(158,122,255,0.08)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="prismEdge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(215,189,255,0.75)" />
                  <stop offset="30%" stopColor="rgba(255,255,255,0.95)" />
                  <stop offset="70%" stopColor="rgba(195,157,255,0.9)" />
                  <stop offset="100%" stopColor="rgba(163,118,255,0.75)" />
                </linearGradient>
                <linearGradient id="innerEdge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                  <stop offset="100%" stopColor="rgba(201,173,255,0.3)" />
                </linearGradient>
                <filter id="prismGlow">
                  <feGaussianBlur stdDeviation="2.8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer bloom */}
              <polygon
                points="150,15 285,265 15,265"
                fill="none"
                stroke="rgba(186,143,255,0.22)"
                strokeWidth="12"
                strokeLinejoin="round"
                style={{ filter: 'blur(8px)' }}
              />

              {/* Main prism */}
              <polygon
                points="150,15 285,265 15,265"
                fill="url(#prismFill)"
                stroke="url(#prismEdge)"
                strokeWidth="2.2"
                strokeLinejoin="round"
                filter="url(#prismGlow)"
              />

              {/* Inner depth triangle */}
              <polygon
                points="150,58 247,231 53,231"
                fill="none"
                stroke="url(#innerEdge)"
                strokeWidth="1"
                strokeLinejoin="round"
              />

              <line x1="150" y1="15" x2="150" y2="58" stroke="rgba(255,255,255,0.18)" strokeWidth="0.9" />
              <line x1="15" y1="265" x2="53" y2="231" stroke="rgba(255,255,255,0.16)" strokeWidth="0.9" />
              <line x1="285" y1="265" x2="247" y2="231" stroke="rgba(255,255,255,0.16)" strokeWidth="0.9" />

              <line x1="90" y1="199" x2="210" y2="199" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
            </svg>

            {/* Rainbow beam starting at the top prism vertex */}
            <div className="prism-beams" />
          </div>
        </motion.div>
      )}

      <motion.div style={{ y: parallaxY, opacity: parallaxOpacity }} className={`max-w-7xl w-full relative z-10 ${imageUrl ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16' : 'flex flex-col items-center text-center pt-8 pb-16'}`}>
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
