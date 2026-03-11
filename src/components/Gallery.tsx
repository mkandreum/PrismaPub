import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { X, Maximize2 } from "lucide-react";
import { EASE_OUT_EXPO, OVERLAY_TRANSITION, PANEL_TRANSITION } from "../motion";

function toInstagramEmbedUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    if (!parsed.hostname.includes("instagram.com")) return null;
    const match = parsed.pathname.match(/\/(p|reel|tv)\/([^/?#]+)/i);
    if (!match) return null;
    const kind = match[1].toLowerCase();
    const code = match[2];
    return `https://www.instagram.com/${kind}/${code}/embed`;
  } catch {
    return null;
  }
}

export default function Gallery() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [instagramEmbeds, setInstagramEmbeds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/gallery').then(res => res.json()),
      fetch('/api/settings').then(res => res.json()),
    ])
      .then(([galleryData, settingsData]) => {
        if (galleryData && Array.isArray(galleryData)) {
          setPhotos(galleryData.map((p: any) => p.url));
        }

        const rawLinks = String(settingsData?.instagram_posts || "")
          .split(/\r?\n/)
          .map((line: string) => line.trim())
          .filter(Boolean);

        const embeds = rawLinks
          .map(toInstagramEmbedUrl)
          .filter((url): url is string => Boolean(url));

        setInstagramEmbeds(Array.from(new Set(embeds)));
      })
      .catch(err => console.error("Error fetching gallery:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="gallery" className="relative py-12 md:py-16 px-4 md:px-6 bg-prisma-dark overflow-hidden">
      {/* Section heading */}
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-12 text-center"
        >
          <h2 className="font-display text-5xl md:text-[8vw] leading-[0.9] uppercase tracking-tighter text-white mb-3 drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]">
            <span className="text-prisma-accent">Foto</span> Galería
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto font-medium uppercase tracking-[0.15em]">
            Momentos inolvidables de nuestras noches
          </p>
        </motion.div>

        {/* Instagram embeds */}
        {!isLoading && instagramEmbeds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-10">
            {instagramEmbeds.map((embedUrl, i) => (
              <motion.div
                key={embedUrl}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.58, delay: (i % 3) * 0.08, ease: EASE_OUT_EXPO }}
                className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-xl"
              >
                <iframe
                  src={`${embedUrl}?utm_source=ig_embed&utm_campaign=loading`}
                  title={`Instagram post ${i + 1}`}
                  className="w-full h-[620px] bg-black"
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Masonry Layout */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-400 uppercase tracking-wider text-sm">Cargando galería...</div>
        ) : photos.length === 0 && instagramEmbeds.length === 0 ? (
          <div className="text-center py-14 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-white/80 font-display text-2xl uppercase mb-2">Aún no hay contenido</p>
            <p className="text-gray-400 text-sm uppercase tracking-wider">Sube fotos o pega enlaces de Instagram desde el panel de administración</p>
          </div>
        ) : photos.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-5 space-y-4 md:space-y-5">
            {photos.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.62, delay: (i % 3) * 0.1, ease: EASE_OUT_EXPO }}
                whileHover={{ scale: 1.02, zIndex: 20, transition: { duration: 0.34, ease: EASE_OUT_EXPO } }}
                className="relative group break-inside-avoid cursor-pointer"
                onClick={() => setSelectedImage(src)}
              >
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-xl group-hover:shadow-prisma-purple/20 group-hover:border-prisma-purple/30 transition-all duration-500">
                  <div className="relative overflow-hidden">
                    <img
                      src={src}
                      alt={`Galería ${i + 1}`}
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
        ) : null}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={OVERLAY_TRANSITION}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-black/94"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white hover:text-prisma-accent transition-colors z-[210] bg-white/10 p-2 border border-white/20 rounded-full"
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} strokeWidth={2.5} />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985, y: 14 }}
              transition={{ ...PANEL_TRANSITION, opacity: OVERLAY_TRANSITION }}
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
