import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GalleryImage } from '../types';
import Lightbox from './Lightbox';

interface GalleryGridProps {
  images: GalleryImage[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {images.map((image, i) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className="break-inside-avoid cursor-pointer group"
            onClick={() => setLightboxIndex(i)}
          >
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={image.url}
                alt={image.caption || 'Gallery image'}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                {image.caption && (
                  <p className="text-white text-sm p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    {image.caption}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(prev => prev !== null ? (prev - 1 + images.length) % images.length : 0)}
          onNext={() => setLightboxIndex(prev => prev !== null ? (prev + 1) % images.length : 0)}
        />
      )}
    </>
  );
}
