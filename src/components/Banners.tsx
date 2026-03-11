import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface Banner {
  id: number;
  text: string;
  active: number;
}

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBanners(data.filter(b => b.active === 1));
      })
      .catch(err => console.error("Error fetching banners:", err));
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full z-[100] flex flex-col">
      <AnimatePresence>
        {banners.map((banner) => (
          <motion.div
            key={banner.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full relative overflow-hidden group border-b border-white/10 bg-prisma-purple/88 text-white"
          >
            <div className="flex items-center py-2 px-4 min-h-[36px] relative overflow-hidden">
              <div className="banner-ticker-track pr-12">
                {[0, 1].map((groupIndex) => (
                  <div key={groupIndex} className="banner-ticker-group">
                    {[...Array(8)].map((_, i) => (
                      <span key={`${groupIndex}-${i}`} className="text-sm md:text-base uppercase font-semibold tracking-widest mr-6 shrink-0">
                        {banner.text} •
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center bg-gradient-to-l from-prisma-purple via-prisma-purple/80 to-transparent z-20">
                <button
                  onClick={() => setBanners(prev => prev.filter(b => b.id !== banner.id))}
                  className="w-6 h-6 border border-white/30 rounded-full flex items-center justify-center hover:bg-white hover:text-prisma-dark transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
