import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, ArrowLeft, CheckCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import RegistrationForm from '../components/RegistrationForm';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import type { Event } from '../types';
import * as eventService from '../services/events';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await eventService.getEventById(id);
        setEvent(data);
      } catch (err) {
        console.error('Failed to load event:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="section-container py-24">
        <Skeleton className="h-[50vh] rounded-2xl mb-8" />
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-4 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-heading text-[var(--text-primary)] mb-4">Event Not Found</h2>
          <p className="text-[var(--text-secondary)] mb-6">The event you're looking for doesn't exist.</p>
          <Link to="/events" className="text-primary hover:underline">← Back to Events</Link>
        </div>
      </div>
    );
  }

  const isPastDeadline = event.registrationDeadline
    ? new Date(event.registrationDeadline) < new Date()
    : false;
  const canRegister = event.registrationEnabled && !isPastDeadline;

  return (
    <>
      {/* Banner */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img src={event.bannerImage} alt={event.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="section-container">
            <Link to="/events" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant={event.status === 'upcoming' ? 'success' : event.status === 'ongoing' ? 'warning' : 'default'} size="md">
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </Badge>
                  <Badge variant="purple" size="md">
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1).replace('-', ' ')}
                  </Badge>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold font-heading text-[var(--text-primary)] mb-6">
                  {event.name}
                </h1>

                <div className="prose prose-invert max-w-none">
                  {event.description.split('\\n\\n').map((para, i) => (
                    <p key={i} className="text-[var(--text-secondary)] leading-relaxed mb-4">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Rules */}
                {event.rules.length > 0 && (
                  <div className="mt-10">
                    <h2 className="text-xl font-bold font-heading text-[var(--text-primary)] mb-4">Rules & Guidelines</h2>
                    <div className="glass-card p-6 space-y-3">
                      {event.rules.map((rule, i) => (
                        <div key={i} className="flex gap-3">
                          <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <p className="text-sm text-[var(--text-secondary)]">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="sticky top-24 space-y-6"
              >
                {/* Details Card */}
                <div className="glass-card p-6 space-y-4">
                  <h3 className="font-bold font-heading text-[var(--text-primary)]">Event Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="text-[var(--text-primary)]">
                          {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-5 h-5 text-primary shrink-0" />
                      <p className="text-[var(--text-primary)]">{event.time}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-5 h-5 text-primary shrink-0" />
                      <p className="text-[var(--text-primary)]">{event.venue}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-5 h-5 text-primary shrink-0" />
                      <p className="text-[var(--text-primary)]">
                        Team Size: {event.minTeamSize === event.maxTeamSize ? event.minTeamSize : `${event.minTeamSize}–${event.maxTeamSize}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Eligibility Card */}
                <div className="glass-card p-6">
                  <h3 className="font-bold font-heading text-[var(--text-primary)] mb-2">Eligibility</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{event.eligibility}</p>
                </div>

                {/* Registration Deadline */}
                {event.registrationDeadline && (
                  <div className="glass-card p-6">
                    <h3 className="font-bold font-heading text-[var(--text-primary)] mb-2">Registration Deadline</h3>
                    <p className={`text-sm ${isPastDeadline ? 'text-red-400' : 'text-[var(--text-secondary)]'}`}>
                      {new Date(event.registrationDeadline).toLocaleDateString('en-US', { dateStyle: 'long' })}
                      {isPastDeadline && ' (Deadline passed)'}
                    </p>
                  </div>
                )}

                {/* Register Button */}
                {canRegister ? (
                  <Button onClick={() => setShowRegModal(true)} fullWidth size="lg">
                    Register Now
                  </Button>
                ) : (
                  <div className="glass-card p-4 text-center">
                    <p className="text-sm text-[var(--text-muted)]">
                      {isPastDeadline ? 'Registration deadline has passed.' : 'Registration is closed for this event.'}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      <Modal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        title={`Register — ${event.name}`}
        size="lg"
      >
        <RegistrationForm
          event={event}
          onCancel={() => setShowRegModal(false)}
        />
      </Modal>
    </>
  );
}
