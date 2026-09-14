import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import GalleryGrid from '../components/GalleryGrid';
import Skeleton from '../components/ui/Skeleton';
import type { Gallery } from '../types';
import * as galleryService from '../services/gallery';

export default function GalleryView() {
  const { eventId } = useParams<{ eventId: string }>();
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!eventId) return;
      try {
        const data = await galleryService.getGalleryById(eventId);
        setGallery(data);
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  if (loading) {
    return (
      <div className="section-container py-24">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-heading text-[var(--text-primary)] mb-4">Gallery Not Found</h2>
          <p className="text-[var(--text-secondary)] mb-6">The gallery you're looking for doesn't exist.</p>
          <Link to="/gallery" className="text-primary hover:underline">← Back to Gallery</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="hero-py relative overflow-hidden grid-pattern">
        <div className="section-container relative z-10">
          <Link to="/gallery" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-primary text-sm mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Gallery
          </Link>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-[var(--text-primary)] mb-4 tracking-tight">
              {gallery.eventName}
            </h1>
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-4 text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{new Date(gallery.eventDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
              <span className="text-[var(--text-muted)]">•</span>
              <span>{gallery.images.length} photos</span>
            </div>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">{gallery.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-py border-t border-[var(--glass-border)]">
        <div className="section-container">
          <GalleryGrid images={gallery.images} />
        </div>
      </section>
    </>
  );
}
