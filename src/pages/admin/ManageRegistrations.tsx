import { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import type { Registration, Event } from '../../types';
import * as registrationService from '../../services/registrations';
import * as eventService from '../../services/events';

export default function ManageRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingReg, setViewingReg] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [regs, evts] = await Promise.all([
        registrationService.getRegistrations(),
        eventService.getEvents(),
      ]);
      setRegistrations(regs);
      setEvents(evts);
    } catch (err) {
      toast.error('Failed to load registrations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    return registrations.filter(r => {
      const matchSearch = r.teamName.toLowerCase().includes(search.toLowerCase()) ||
        r.registrationId.toLowerCase().includes(search.toLowerCase());
      const matchEvent = eventFilter === 'all' || r.eventId === eventFilter;
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchEvent && matchStatus;
    });
  }, [registrations, search, eventFilter, statusFilter]);

  const viewReg = registrations.find(r => r.id === viewingReg);

  const handleDelete = async (id: string) => {
    try {
      await registrationService.deleteRegistration(id);
      toast.success('Registration deleted');
      setDeleteConfirm(null);
      await loadData();
    } catch (err) {
      toast.error('Failed to delete registration');
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const csv = registrationService.exportRegistrationsCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)]">Manage Registrations</h1>
          <p className="text-sm text-[var(--text-secondary)]">{registrations.length} registrations total</p>
        </div>
        {registrations.length > 0 && (
          <Button variant="secondary" onClick={handleExportCSV} icon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by team or registration ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <select value={eventFilter} onChange={e => setEventFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">All Events</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--glass-border)]">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Reg ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Team</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Event</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Members</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(reg => (
                  <tr key={reg.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--bg-card)] transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-primary">{reg.registrationId}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-primary)]">{reg.teamName}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{reg.eventName}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{reg.teamSize}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {new Date(reg.registrationDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={reg.status === 'confirmed' ? 'success' : reg.status === 'pending' ? 'warning' : 'error'}>
                        {reg.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewingReg(reg.id)} className="p-2 rounded-lg hover:bg-primary/10 text-[var(--text-secondary)] hover:text-primary transition-colors" aria-label="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(reg.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors" aria-label="Delete">
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
              <p className="text-[var(--text-muted)]">No registrations found.</p>
            </div>
          )}
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewingReg} onClose={() => setViewingReg(null)} title="Registration Details" size="lg">
        {viewReg && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-[var(--text-muted)]">Registration ID</p><p className="text-sm font-mono text-primary">{viewReg.registrationId}</p></div>
              <div><p className="text-xs text-[var(--text-muted)]">Event</p><p className="text-sm text-[var(--text-primary)]">{viewReg.eventName}</p></div>
              <div><p className="text-xs text-[var(--text-muted)]">Team Name</p><p className="text-sm text-[var(--text-primary)]">{viewReg.teamName}</p></div>
              <div><p className="text-xs text-[var(--text-muted)]">Status</p><Badge variant={viewReg.status === 'confirmed' ? 'success' : 'warning'}>{viewReg.status}</Badge></div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Team Members ({viewReg.teamSize})</h3>
              <div className="space-y-3">
                {viewReg.members.map((m, i) => (
                  <div key={i} className="glass-card p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div><span className="text-[var(--text-muted)]">Name:</span> <span className="text-[var(--text-primary)]">{m.fullName}</span></div>
                      <div><span className="text-[var(--text-muted)]">Roll:</span> <span className="text-[var(--text-primary)]">{m.rollNumber}</span></div>
                      <div><span className="text-[var(--text-muted)]">Email:</span> <span className="text-[var(--text-primary)]">{m.email}</span></div>
                      <div><span className="text-[var(--text-muted)]">Phone:</span> <span className="text-[var(--text-primary)]">{m.phone}</span></div>
                      <div><span className="text-[var(--text-muted)]">Dept:</span> <span className="text-[var(--text-primary)]">{m.department}</span></div>
                      <div><span className="text-[var(--text-muted)]">Year:</span> <span className="text-[var(--text-primary)]">{m.year}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Registration" size="sm">
        <p className="text-[var(--text-secondary)] mb-6">Are you sure you want to delete this registration?</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)} fullWidth>Cancel</Button>
          <Button variant="danger" onClick={() => { if (deleteConfirm) handleDelete(deleteConfirm); }} fullWidth>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
