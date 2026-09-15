import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, ClipboardList, Image, MessageSquare, Megaphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import Skeleton from '../../components/ui/Skeleton';
import type { AdminStats, Event, Registration } from '../../types';
import * as adminService from '../../services/admin';
import * as eventService from '../../services/events';
import * as registrationService from '../../services/registrations';

export default function Dashboard() {
  const { adminProfile } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, events, regs] = await Promise.all([
          adminService.getDashboardStats(),
          eventService.getEvents({ status: 'upcoming' }),
          registrationService.getRegistrations(),
        ]);
        setStats(s);
        setUpcomingEvents(events.slice(0, 5));
        setRecentRegistrations(regs.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = stats ? [
    { icon: Calendar, label: 'Total Events', value: stats.totalEvents, color: 'from-cyan-500 to-blue-600' },
    { icon: ClipboardList, label: 'Registrations', value: stats.totalRegistrations, color: 'from-violet-500 to-purple-600' },
    { icon: Image, label: 'Gallery Photos', value: stats.totalGalleryPhotos, color: 'from-pink-500 to-rose-600' },
    { icon: Users, label: 'Team Members', value: stats.totalTeamMembers, color: 'from-emerald-500 to-green-600' },
    { icon: Megaphone, label: 'Active Banners', value: stats.activeBanners, color: 'from-amber-500 to-orange-600' },
    { icon: MessageSquare, label: 'Upcoming Events', value: stats.upcomingEvents, color: 'from-sky-500 to-indigo-600' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Welcome back{adminProfile ? `, ${adminProfile.fullName}` : ''} 👋
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">{stat.label}</p>
              <p className="text-3xl font-bold font-heading text-[var(--text-primary)]">
                <AnimatedCounter end={stat.value} />
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-4">Upcoming Events</h2>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-card)] transition-colors">
                  {event.bannerImage?.trim() ? (
                    <img
                      src={event.bannerImage.trim()}
                      alt={event.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                      <Calendar className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{event.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 shrink-0">
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No upcoming events.</p>
          )}
        </div>

        {/* Recent Registrations */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-4">Recent Registrations</h2>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : recentRegistrations.length > 0 ? (
            <div className="space-y-3">
              {recentRegistrations.map(reg => (
                <div key={reg.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-card)] transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{reg.teamName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{reg.eventName}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                    reg.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                    reg.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {reg.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No registrations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
