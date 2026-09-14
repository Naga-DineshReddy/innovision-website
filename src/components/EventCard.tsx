import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import type { Event } from '../types';
import Badge from './ui/Badge';

interface EventCardProps {
  event: Event;
  index: number;
}

const categoryColors: Record<string, string> = {
  hackathon: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  workshop: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  competition: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  seminar: 'bg-green-500/20 text-green-400 border-green-500/30',
  bootcamp: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'tech-talk': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  cultural: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export default function EventCard({ event, index }: EventCardProps) {
  const statusColors: Record<Event['status'], string> = {
    upcoming: 'bg-green-500/20 text-green-400',
    ongoing: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-gray-500/20 text-gray-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="h-full"
    >
      <Link to={`/events/${event.id}`} className="flex flex-col h-full glass-card overflow-hidden group">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden shrink-0 bg-[var(--bg-secondary)]">
          <img
            src={event.bannerImage}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-3.5 right-3.5">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${statusColors[event.status]}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>

          {/* Category */}
          <div className="absolute bottom-3.5 left-3.5">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${categoryColors[event.category] || ''}`}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1).replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-[var(--text-primary)] group-hover:text-primary transition-colors line-clamp-1 mb-2">
              {event.name}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 min-h-[2.5rem] mb-4">
              {event.shortDescription}
            </p>

            <div className="space-y-2 text-xs sm:text-sm text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>
                  {event.date && !isNaN(new Date(event.date).getTime())
                    ? new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' })
                    : event.date}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary shrink-0" />
                <span>Team size: {event.minTeamSize === event.maxTeamSize ? event.minTeamSize : `${event.minTeamSize}–${event.maxTeamSize}`}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--glass-border)] flex items-center justify-between gap-2">
            {event.registrationEnabled ? (
              <Badge variant="success">Open</Badge>
            ) : (
              <Badge variant="default">Closed</Badge>
            )}
            <span className="text-primary text-xs sm:text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
