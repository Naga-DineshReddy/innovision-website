import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useState, useRef } from 'react';

export default function VideoSection() {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <section className="section-py relative border-t border-[var(--glass-border)] overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="section-container flex flex-col items-center justify-center text-center w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 w-full max-w-3xl mx-auto flex flex-col items-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading gradient-text mb-3 sm:mb-4 tracking-tight text-center">
            Experience InnoVision
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed text-center">
            Watch our highlight reel and discover what makes InnoVision the most exciting tech community on campus.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full max-w-4xl mx-auto flex justify-center"
        >
          <div className="relative rounded-3xl overflow-hidden glass-card p-2 sm:p-3.5 w-full shadow-2xl border border-[var(--glass-border)]">
            <div className="rounded-2xl overflow-hidden relative w-full bg-black/95 aspect-video flex items-center justify-center shadow-inner">
              {/* Ambient blurred backdrop */}
              <img
                src="/videos/innovision-promo-thumb.png"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none select-none"
              />

              <video
                ref={videoRef}
                poster="/videos/innovision-promo-thumb.png?v=2"
                controls={playing}
                playsInline
                preload="metadata"
                className="relative z-10 w-full h-full object-contain rounded-xl"
                onEnded={() => setPlaying(false)}
              >
                <source src="/videos/innovision-promo.mp4?v=2" type="video/mp4" />
                Your browser does not support HTML5 video playback.
              </video>

              {!playing && (
                <div 
                  onClick={handlePlay}
                  className="absolute inset-0 z-20 cursor-pointer group flex items-center justify-center overflow-hidden rounded-2xl"
                >
                  <img
                    src="/videos/innovision-promo-thumb.png?v=2"
                    alt="Video thumbnail"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20 group-hover:from-black/60 group-hover:via-black/20 transition-colors" />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay();
                    }}
                    className="relative z-10 w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-primary via-cyan-500 to-secondary backdrop-blur-md border border-cyan-300/60 shadow-[0_0_35px_rgba(0,212,255,0.6)] flex items-center justify-center group-hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/40"
                    aria-label="Play video"
                  >
                    <Play className="w-8 h-8 sm:w-9 sm:h-9 text-white ml-1 group-hover:scale-110 transition-transform fill-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
