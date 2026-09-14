import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, Calendar, Trophy } from 'lucide-react';
import HeroBackground from '../components/HeroBackground';
import BannerCarousel from '../components/BannerCarousel';
import VideoSection from '../components/VideoSection';
import EventCard from '../components/EventCard';
import SectionHeading from '../components/ui/SectionHeading';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Skeleton from '../components/ui/Skeleton';
import { useTheme } from '../contexts/ThemeContext';
import innovisionDarkLogo from '../assets/innovision-hero-dark.png';
import innovisionLightLogo from '../assets/innovision-hero-light.png';
import type { Event, Banner } from '../types';
import * as eventService from '../services/events';
import * as bannerService from '../services/banners';

export default function Home() {
  const { isDark } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [evts, bnrs] = await Promise.all([
          eventService.getEvents(),
          bannerService.getActiveBanners(),
        ]);
        setEvents(evts);
        setBanners(bnrs);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const upcomingEvents = events.filter(e => e.status === 'upcoming').slice(0, 3);

  const stats = [
    { icon: Calendar, label: 'Events Hosted', value: 25 },
    { icon: Users, label: 'Active Members', value: 500 },
    { icon: Trophy, label: 'Hackathons Won', value: 12 },
    { icon: Zap, label: 'Projects Built', value: 80 },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[88vh] flex flex-col items-center justify-center overflow-hidden grid-pattern hero-py">
        <HeroBackground />

        {/* Decorative gradients */}
        <div className="absolute top-0 left-0 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-primary/10 rounded-full blur-[100px] sm:blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-secondary/10 rounded-full blur-[100px] sm:blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 section-container flex flex-col items-center justify-center text-center py-6 sm:py-8 md:py-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center w-full"
          >
            {/* Official InnoVision Emblem Logo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 20 }}
              className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto mb-4 sm:mb-6 flex justify-center items-center"
            >
              {/* Dynamic ambient backdrop flare for seamless canvas integration */}
              <div
                className={`absolute w-3/4 h-3/4 rounded-full blur-[60px] sm:blur-[80px] pointer-events-none -z-10 transition-colors duration-500 ${
                  isDark
                    ? 'bg-primary/25'
                    : 'bg-primary/15'
                }`}
              />

              <img
                key={isDark ? 'dark-logo' : 'light-logo'}
                src={isDark ? innovisionDarkLogo : innovisionLightLogo}
                alt="INNOVISION - Innovate • Build • Inspire"
                className={`w-full h-auto max-h-[380px] object-contain select-none transition-all duration-300 ${
                  isDark
                    ? 'drop-shadow-[0_0_35px_rgba(0,212,255,0.35)]'
                    : 'drop-shadow-[0_10px_30px_rgba(14,165,233,0.15)]'
                }`}
              />
            </motion.div>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--text-secondary)] font-normal max-w-2xl mx-auto mb-10 sm:mb-12 md:mb-14 leading-relaxed text-center">
              Department of <span className="text-[var(--text-primary)] font-semibold">Artificial Intelligence</span> & <span className="text-[var(--text-primary)] font-semibold">Data Science</span> Student Association — where intelligence meets innovation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 w-full max-w-lg sm:max-w-none mx-auto">
              <Link
                to="/events"
                className="w-full sm:w-auto min-w-[220px] h-14 inline-flex items-center justify-center gap-3.5 px-8 text-base sm:text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-secondary text-white border border-cyan-400/30 shadow-[0_0_25px_rgba(0,212,255,0.3)] hover:shadow-[0_0_35px_rgba(0,212,255,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 whitespace-nowrap group"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto min-w-[220px] h-14 inline-flex items-center justify-center gap-3.5 px-8 text-base sm:text-lg font-semibold rounded-2xl bg-primary/10 hover:bg-primary/20 text-[var(--text-primary)] border border-primary/40 hover:border-cyan-400/80 shadow-[var(--shadow-glow)] hover:shadow-[0_0_30px_rgba(0,212,255,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 backdrop-blur-xl whitespace-nowrap"
              >
                <span>Learn More</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1 opacity-70"
        >
          <div className="w-5 h-9 rounded-full border-2 border-[var(--text-muted)] flex justify-center pt-1.5">
            <div className="w-1 h-2.5 rounded-full bg-primary" />
          </div>
        </motion.div>
      </section>

      {/* Video Section */}
      <VideoSection />

      {/* Banner Carousel */}
      {(loading || banners.length > 0) && (
        <section className="section-py border-t border-[var(--glass-border)]">
          <div className="section-container">
            {loading ? (
              <Skeleton className="h-64 rounded-2xl" />
            ) : (
              <BannerCarousel banners={banners} />
            )}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="section-py relative border-t border-[var(--glass-border)]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 pointer-events-none" />
        <div className="section-container relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 items-stretch">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5 sm:p-6 text-center flex flex-col items-center justify-center h-full"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[var(--text-primary)] mb-1">
                  <AnimatedCounter end={stat.value} />+
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {loading ? (
        <section className="section-py border-t border-[var(--glass-border)]">
          <div className="section-container">
            <SectionHeading title="Upcoming Events" subtitle="Loading..." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
            </div>
          </div>
        </section>
      ) : upcomingEvents.length > 0 ? (
        <section className="section-py border-t border-[var(--glass-border)]">
          <div className="section-container">
            <SectionHeading
              title="Upcoming Events"
              subtitle="Don't miss out on our exciting upcoming events and opportunities."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {upcomingEvents.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
            <div className="text-center mt-10 sm:mt-12">
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-3 h-13 px-9 rounded-2xl bg-[var(--bg-card)] border border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 text-base font-semibold transition-all shadow-sm active:scale-[0.98] whitespace-nowrap"
              >
                View All Events <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA Section */}
      <section className="section-py relative overflow-hidden border-t border-[var(--glass-border)]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 animate-gradient pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="section-container relative text-center flex flex-col items-center justify-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-[var(--text-primary)] mb-4 sm:mb-6 tracking-tight text-center">
              Ready to <span className="gradient-text">Innovate</span>?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed mb-8 sm:mb-10 text-center max-w-xl mx-auto">
              Join InnoVision and be part of a community that builds the future. Collaborate, learn, and grow with like-minded innovators.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-md sm:max-w-none mx-auto">
              <Link
                to="/events"
                className="w-full sm:w-auto inline-flex items-center justify-center h-13 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-secondary text-white hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all duration-300 active:scale-[0.98] whitespace-nowrap"
              >
                Register for Events
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center h-13 sm:h-14 px-8 sm:px-10 text-base sm:text-lg font-semibold rounded-2xl bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-color-hover)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 backdrop-blur-xl active:scale-[0.98] whitespace-nowrap"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
