import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { X, Maximize2 } from "lucide-react";

export default function Gallery() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setPhotos(data.map((p: any) => p.url));
        }
      })
      .catch(err => console.error("Error fetching gallery:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (photos.length === 0 && !isLoading) return null;

  return (
    <section id="gallery" className="relative py-24 px-4 md:px-8 bg-prisma-dark overflow-hidden">
      {/* Section heading */}
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-6xl md:text-[10vw] leading-none uppercase tracking-tighter text-white mb-4 drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]">
            <span className="text-prisma-accent">Foto</span> Galería
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto font-medium uppercase tracking-widest">
            Momentos inolvidables de nuestras noches
          </p>
        </motion.div>

        {/* Masonry Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {photos.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              whileHover={{ scale: 1.03, zIndex: 20, transition: { duration: 0.3 } }}
              className="relative group break-inside-avoid cursor-pointer"
              onClick={() => setSelectedImage(src)}
            >
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl group-hover:shadow-prisma-purple/30 group-hover:border-prisma-purple/30 transition-all duration-500">
                <div className="relative overflow-hidden">
                  <img
                    src={src}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-prisma-purple/0 group-hover:bg-prisma-purple/25 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-prisma-dark p-3 rounded-full shadow-lg">
                      <Maximize2 size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white hover:text-prisma-accent transition-colors z-[210] bg-white/10 p-2 border border-white/20 rounded-full backdrop-blur-sm"
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} strokeWidth={2.5} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.8, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 2 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-full max-h-full rounded-2xl overflow-hidden border-2 border-prisma-purple/40 shadow-[0_0_80px_rgba(139,92,246,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Selected"
                className="max-w-[95vw] max-h-[85vh] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
