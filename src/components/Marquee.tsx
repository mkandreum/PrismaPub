import { motion } from "motion/react";

export default function Marquee({ text, reverse = false }: { text: string; reverse?: boolean }) {
  return (
    <div className="border-y-2 border-prisma-purple/30 bg-gradient-to-r from-prisma-deep via-prisma-purple to-prisma-deep text-white overflow-hidden py-4 flex whitespace-nowrap relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
      <motion.div
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
        className="text-3xl md:text-5xl uppercase tracking-widest flex font-display"
      >
        <span className="drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">{text.repeat(12)}</span>
      </motion.div>
    </div>
  );
}
