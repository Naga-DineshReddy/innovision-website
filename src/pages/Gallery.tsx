import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Image as ImageIcon, ArrowRight } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import type { Gallery } from '../types';
import * as galleryService from '../services/gallery';

export default function GalleryPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await galleryService.getGalleries();
        setGalleries(data);
      } catch (err) {
        console.error('Failed to load galleries:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero-py relative overflow-hidden grid-pattern">
        <div className="absolute top-0 right-0 w-96 md:w-[500px] h-96 md:h-[500px] bg-secondary/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <p className="text-primary font-semibold text-xs sm:text-sm tracking-wider uppercase mb-3 sm:mb-4">Gallery</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[var(--text-primary)] mb-5 sm:mb-6 tracking-tight">
              Our <span className="gradient-text">Moments</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              Relive the best moments, milestones, and memories from our department hackathons, workshops, and celebrations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-py border-t border-[var(--glass-border)]">
        <div className="section-container">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          ) : galleries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {galleries.map((gallery, i) => (
                <motion.div
                  key={gallery.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="h-full"
                >
                  <Link to={`/gallery/${gallery.id}`} className="block glass-card overflow-hidden group">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={gallery.coverImage}
                        alt={gallery.eventName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 right-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-medium">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {gallery.imageCount ?? gallery.images.length} photos
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold font-heading text-[var(--text-primary)] group-hover:text-primary transition-colors mb-1">
                        {gallery.eventName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-3">
                        <Calendar className="w-4 h-4" />
                        {gallery.eventDate && !isNaN(new Date(gallery.eventDate).getTime())
                          ? new Date(gallery.eventDate).toLocaleDateString('en-US', { dateStyle: 'long' })
                          : 'Recent Event'}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">{gallery.description}</p>
                      <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Gallery <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[var(--text-muted)] text-lg">No galleries available yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
