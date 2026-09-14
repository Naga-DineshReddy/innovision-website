import { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Trash2, Mail, MailOpen, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import type { ContactMessage } from '../../types';
import * as contactService from '../../services/contact';

export default function ManageMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingMsg, setViewingMsg] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadMessages = async () => {
    try {
      const data = await contactService.getContactMessages();
      setMessages(data);
    } catch (err) {
      toast.error('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, []);

  const filtered = useMemo(() => {
    return messages.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [messages, search, statusFilter]);

  const viewMsg = messages.find(m => m.id === viewingMsg);

  const handleMarkRead = async (id: string) => {
    try {
      await contactService.updateMessageStatus(id, 'read');
      toast.success('Marked as read');
      await loadMessages();
    } catch (err) {
      toast.error('Failed to update message');
      console.error(err);
    }
  };

  const handleMarkResolved = async (id: string) => {
    try {
      await contactService.updateMessageStatus(id, 'resolved');
      toast.success('Marked as resolved');
      setViewingMsg(null);
      await loadMessages();
    } catch (err) {
      toast.error('Failed to update message');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contactService.deleteMessage(id);
      toast.success('Message deleted');
      setDeleteConfirm(null);
      await loadMessages();
    } catch (err) {
      toast.error('Failed to delete message');
      console.error(err);
    }
  };

  const handleView = async (msg: ContactMessage) => {
    setViewingMsg(msg.id);
    if (msg.status === 'new') {
      await contactService.updateMessageStatus(msg.id, 'read');
      await loadMessages();
    }
  };

  const newCount = messages.filter(m => m.status === 'new').length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)]">Contact Messages</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {messages.length} messages{newCount > 0 ? ` • ${newCount} new` : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
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
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">From</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Subject</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(msg => (
                  <tr key={msg.id} className={`border-b border-[var(--glass-border)] hover:bg-[var(--bg-card)] transition-colors ${msg.status === 'new' ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`text-sm ${msg.status === 'new' ? 'font-bold text-[var(--text-primary)]' : 'font-medium text-[var(--text-primary)]'}`}>{msg.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{msg.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)] max-w-[200px] truncate">{msg.subject}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      {new Date(msg.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={msg.status === 'new' ? 'warning' : msg.status === 'read' ? 'default' : 'success'}>
                        {msg.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleView(msg)} className="p-2 rounded-lg hover:bg-primary/10 text-[var(--text-secondary)] hover:text-primary transition-colors" aria-label="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        {msg.status === 'new' && (
                          <button onClick={() => handleMarkRead(msg.id)} className="p-2 rounded-lg hover:bg-primary/10 text-[var(--text-secondary)] hover:text-primary transition-colors" aria-label="Mark read">
                            <MailOpen className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setDeleteConfirm(msg.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors" aria-label="Delete">
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
              <Mail className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-[var(--text-muted)]">No messages found.</p>
            </div>
          )}
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewingMsg} onClose={() => setViewingMsg(null)} title="Message Details" size="lg">
        {viewMsg && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-[var(--text-muted)]">From</p><p className="text-sm font-medium text-[var(--text-primary)]">{viewMsg.name}</p></div>
              <div><p className="text-xs text-[var(--text-muted)]">Email</p><p className="text-sm text-primary">{viewMsg.email}</p></div>
              <div><p className="text-xs text-[var(--text-muted)]">Subject</p><p className="text-sm text-[var(--text-primary)]">{viewMsg.subject}</p></div>
              <div><p className="text-xs text-[var(--text-muted)]">Date</p><p className="text-sm text-[var(--text-secondary)]">{new Date(viewMsg.createdAt).toLocaleString()}</p></div>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2">Message</p>
              <div className="glass-card p-4">
                <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{viewMsg.message}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setViewingMsg(null)} fullWidth>Close</Button>
              {viewMsg.status !== 'resolved' && (
                <Button onClick={() => handleMarkResolved(viewMsg.id)} fullWidth icon={<CheckCircle className="w-4 h-4" />}>
                  Mark as Resolved
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Message" size="sm">
        <p className="text-[var(--text-secondary)] mb-6">Are you sure you want to delete this message?</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)} fullWidth>Cancel</Button>
          <Button variant="danger" onClick={() => { if (deleteConfirm) handleDelete(deleteConfirm); }} fullWidth>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
