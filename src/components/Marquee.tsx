import { motion } from "motion/react";

export default function Marquee({ text, reverse = false }: { text: string; reverse?: boolean }) {
  return (
    <div className="border-y border-prisma-purple/35 bg-gradient-to-r from-prisma-deep via-prisma-purple to-prisma-deep text-white overflow-hidden py-2.5 md:py-3 flex whitespace-nowrap relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
      <motion.div
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
        className="text-[1.45rem] md:text-4xl uppercase tracking-[0.18em] flex font-display"
      >
        <span>{text.repeat(6)}</span>
      </motion.div>
    </div>
  );
}
