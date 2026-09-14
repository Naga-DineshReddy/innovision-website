import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import type { Event, EventCategory } from '../../types';
import * as eventService from '../../services/events';

const categoryOptions = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'competition', label: 'Competition' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'bootcamp', label: 'Bootcamp' },
  { value: 'tech-talk', label: 'Tech Talk' },
  { value: 'cultural', label: 'Cultural' },
];

const statusOptions = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
];

const defaultEvent: Partial<Event> = {
  name: '', shortDescription: '', description: '', date: '', time: '',
  venue: '', category: 'hackathon', bannerImage: '', rules: [],
  eligibility: '', maxTeamSize: 4, minTeamSize: 1,
  registrationDeadline: '', registrationEnabled: true, status: 'upcoming',
};

export default function ManageEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [rulesText, setRulesText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err) {
      toast.error('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const filtered = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingEvent({ ...defaultEvent });
    setRulesText('');
    setShowModal(true);
  };

  const openEdit = (event: Event) => {
    setEditingEvent({ ...event });
    setRulesText(event.rules.join('\n'));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingEvent?.name) return;
    setSaving(true);
    try {
      const eventData = {
        ...editingEvent,
        rules: rulesText.split('\n').filter(r => r.trim()),
      };

      if (editingEvent.id && events.find(e => e.id === editingEvent.id)) {
        await eventService.updateEvent(editingEvent.id, eventData);
        toast.success('Event updated');
      } else {
        await eventService.createEvent(eventData);
        toast.success('Event created');
      }
      setShowModal(false);
      setEditingEvent(null);
      await loadEvents();
    } catch (err) {
      toast.error('Failed to save event');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eventService.deleteEvent(id);
      toast.success('Event deleted');
      setDeleteConfirm(null);
      await loadEvents();
    } catch (err) {
      toast.error('Failed to delete event');
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)]">Manage Events</h1>
          <p className="text-sm text-[var(--text-secondary)]">{events.length} events total</p>
        </div>
        <Button onClick={openAdd} icon={<Plus className="w-4 h-4" />}>Add Event</Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search events..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--glass-border)]">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Event</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Registration</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(event => (
                  <tr key={event.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--bg-card)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={event.bannerImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{event.name}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">{event.venue}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge>{event.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={event.status === 'upcoming' ? 'success' : event.status === 'ongoing' ? 'warning' : 'default'}>
                        {event.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={event.registrationEnabled ? 'success' : 'error'}>
                        {event.registrationEnabled ? 'Open' : 'Closed'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(event)} className="p-2 rounded-lg hover:bg-primary/10 text-[var(--text-secondary)] hover:text-primary transition-colors" aria-label="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(event.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors" aria-label="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[var(--text-muted)]">No events found.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingEvent?.id ? 'Edit Event' : 'Add Event'} size="xl">
        {editingEvent && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Event Name" value={editingEvent.name || ''} onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })} placeholder="Event name" />
              <Select label="Category" value={editingEvent.category || 'hackathon'} onChange={e => setEditingEvent({ ...editingEvent, category: (e.target as HTMLSelectElement).value as EventCategory })} options={categoryOptions} />
              <Input label="Date" type="date" value={editingEvent.date || ''} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} />
              <Input label="Time" value={editingEvent.time || ''} onChange={e => setEditingEvent({ ...editingEvent, time: e.target.value })} placeholder="e.g., 09:00 AM - 05:00 PM" />
              <Input label="Venue" value={editingEvent.venue || ''} onChange={e => setEditingEvent({ ...editingEvent, venue: e.target.value })} placeholder="Event venue" />
              <Select label="Status" value={editingEvent.status || 'upcoming'} onChange={e => setEditingEvent({ ...editingEvent, status: (e.target as HTMLSelectElement).value as 'upcoming' | 'ongoing' | 'completed' })} options={statusOptions} />
              <Input label="Min Team Size" type="number" value={String(editingEvent.minTeamSize || 1)} onChange={e => setEditingEvent({ ...editingEvent, minTeamSize: Number(e.target.value) })} />
              <Input label="Max Team Size" type="number" value={String(editingEvent.maxTeamSize || 4)} onChange={e => setEditingEvent({ ...editingEvent, maxTeamSize: Number(e.target.value) })} />
              <Input label="Registration Deadline" type="date" value={editingEvent.registrationDeadline || ''} onChange={e => setEditingEvent({ ...editingEvent, registrationDeadline: e.target.value })} />
              <Input label="Banner Image URL" value={editingEvent.bannerImage || ''} onChange={e => setEditingEvent({ ...editingEvent, bannerImage: e.target.value })} placeholder="https://..." />
            </div>
            <Input label="Short Description" value={editingEvent.shortDescription || ''} onChange={e => setEditingEvent({ ...editingEvent, shortDescription: e.target.value })} placeholder="Brief event description" />
            <Textarea label="Full Description" value={editingEvent.description || ''} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })} placeholder="Detailed event description..." />
            <Input label="Eligibility" value={editingEvent.eligibility || ''} onChange={e => setEditingEvent({ ...editingEvent, eligibility: e.target.value })} placeholder="Who can participate?" />
            <Textarea label="Rules (one per line)" value={rulesText} onChange={e => setRulesText(e.target.value)} placeholder="Enter each rule on a new line" />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="regEnabled" checked={editingEvent.registrationEnabled ?? true} onChange={e => setEditingEvent({ ...editingEvent, registrationEnabled: e.target.checked })} className="w-4 h-4 rounded" />
              <label htmlFor="regEnabled" className="text-sm text-[var(--text-secondary)]">Registration Enabled</label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)} fullWidth>Cancel</Button>
              <Button onClick={handleSave} fullWidth disabled={saving}>
                {saving ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span> : 'Save Event'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Event" size="sm">
        <p className="text-[var(--text-secondary)] mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)} fullWidth>Cancel</Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} fullWidth>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
