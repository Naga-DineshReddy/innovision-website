import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import EventCard from '../components/EventCard';
import Skeleton from '../components/ui/Skeleton';
import type { Event, EventCategory } from '../types';
import * as eventService from '../services/events';

const categories: { value: EventCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Events' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'competition', label: 'Competition' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'bootcamp', label: 'Bootcamp' },
  { value: 'tech-talk', label: 'Tech Talk' },
];

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<EventCategory | 'all'>('all');
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    async function load() {
      try {
        const data = await eventService.getEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.shortDescription.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || e.category === category;
      const matchesTab = tab === 'upcoming'
        ? (e.status === 'upcoming' || e.status === 'ongoing')
        : e.status === 'completed';
      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [events, search, category, tab]);

  return (
    <>
      {/* Hero */}
      <section className="hero-py relative overflow-hidden grid-pattern">
        <div className="absolute top-0 left-0 w-96 md:w-[500px] h-96 md:h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <p className="text-primary font-semibold text-xs sm:text-sm tracking-wider uppercase mb-3 sm:mb-4">
              Events
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[var(--text-primary)] mb-5 sm:mb-6 tracking-tight">
              Discover <span className="gradient-text">Events</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              Explore our hackathons, workshops, competitions, and seminars. Challenge your boundaries and elevate your skills.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky Filters & Search */}
      <section className="py-4 sticky top-16 md:top-20 z-30 bg-[var(--bg-primary)]/85 backdrop-blur-xl border-y border-[var(--glass-border)] shadow-sm">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] shrink-0 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search events by title or keyword..."
                className="w-full pl-10 pr-4 h-11 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex bg-[var(--bg-card)] rounded-xl p-1.5 border border-[var(--glass-border)] shrink-0 self-start sm:self-auto gap-1">
              <button
                onClick={() => setTab('upcoming')}
                className={`px-5 h-10 sm:h-11 rounded-lg text-sm font-semibold transition-all inline-flex items-center justify-center whitespace-nowrap ${
                  tab === 'upcoming'
                    ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Upcoming & Ongoing
              </button>
              <button
                onClick={() => setTab('past')}
                className={`px-5 h-10 sm:h-11 rounded-lg text-sm font-semibold transition-all inline-flex items-center justify-center whitespace-nowrap ${
                  tab === 'past'
                    ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Past Events
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2.5 overflow-x-auto pt-3 pb-1 -mx-2 px-2 scrollbar-none">
            {categories.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-4.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  category === c.value
                    ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="section-py">
        <div className="section-container">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-96 rounded-2xl w-full" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {filtered.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          ) : (
            <div className="glass-card text-center py-16 px-6 max-w-lg mx-auto">
              <p className="text-[var(--text-primary)] font-heading font-semibold text-lg mb-2">No events found</p>
              <p className="text-[var(--text-secondary)] text-sm mb-4">
                No events match your current search and filter selections.
              </p>
              <button
                onClick={() => { setSearch(''); setCategory('all'); }}
                className="text-primary text-sm font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

