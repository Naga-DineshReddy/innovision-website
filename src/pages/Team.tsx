import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TeamCard from '../components/TeamCard';
import SectionHeading from '../components/ui/SectionHeading';
import Skeleton from '../components/ui/Skeleton';
import type { TeamMember, TeamCategory } from '../types';
import * as teamService from '../services/team';

const teamCategories: TeamCategory[] = [
  'Faculty', 'President', 'Technical Team', 'Secretariat', 'Media Team', 'Treasurer',
];

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<TeamCategory | 'All'>('All');

  useEffect(() => {
    async function load() {
      try {
        const data = await teamService.getActiveTeamMembers();
        setTeamMembers(data);
      } catch (err) {
        console.error('Failed to load team:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredMembers = activeCategory === 'All'
    ? teamMembers
    : teamMembers.filter(m => m.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="hero-py relative overflow-hidden grid-pattern">
        <div className="absolute bottom-0 left-0 w-96 md:w-[500px] h-96 md:h-[500px] bg-secondary/10 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <p className="text-primary font-semibold text-xs sm:text-sm tracking-wider uppercase mb-3 sm:mb-4">
              Our Team
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[var(--text-primary)] mb-5 sm:mb-6 tracking-tight">
              Meet the <span className="gradient-text">Innovators</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              The passionate leaders, faculty mentors, and technologists driving the InnoVision community forward.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-4 sticky top-16 md:top-20 z-30 bg-[var(--bg-primary)]/85 backdrop-blur-xl border-y border-[var(--glass-border)] shadow-sm">
        <div className="section-container">
          <div className="flex gap-2 overflow-x-auto py-1 -mx-2 px-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                activeCategory === 'All'
                  ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent'
              }`}
            >
              All Members
            </button>
            {teamCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat
                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="section-py">
        <div className="section-container">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 items-stretch">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : activeCategory === 'All' ? (
            teamCategories.map(category => {
              const categoryMembers = teamMembers.filter(m => m.category === category);
              if (categoryMembers.length === 0) return null;
              return (
                <div key={category} className="mb-12 sm:mb-16 last:mb-0">
                  <SectionHeading title={category} />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 items-stretch">
                    {categoryMembers.map((member, i) => (
                      <TeamCard key={member.id} member={member} index={i} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 items-stretch">
              {filteredMembers.map((member, i) => (
                <TeamCard key={member.id} member={member} index={i} />
              ))}
            </div>
          )}

          {!loading && teamMembers.length === 0 && (
            <div className="glass-card text-center py-16 px-6 max-w-lg mx-auto">
              <p className="text-[var(--text-primary)] font-heading font-semibold text-lg mb-2">No team members listed</p>
              <p className="text-[var(--text-secondary)] text-sm">
                Team member details will be updated shortly.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
