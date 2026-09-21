import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import ImageUpload from '../../components/ui/ImageUpload';
import type { TeamMember, TeamCategory } from '../../types';
import * as teamService from '../../services/team';

const teamCategories: TeamCategory[] = [
  'Faculty', 'President', 'Technical Team', 'Secretariat', 'Media Team', 'Treasurer',
];

const categoryOptions = teamCategories.map(c => ({ value: c, label: c }));
const yearOptions = [
  { value: '', label: 'N/A' },
  { value: '1st Year', label: '1st Year' },
  { value: '2nd Year', label: '2nd Year' },
  { value: '3rd Year', label: '3rd Year' },
  { value: '4th Year', label: '4th Year' },
];

export default function ManageTeam() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<TeamMember> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadTeam = async () => {
    try {
      const data = await teamService.getAllTeamMembers();
      setTeamMembers(data);
    } catch (err) {
      toast.error('Failed to load team');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTeam(); }, []);

  const openAdd = () => {
    setEditing({
      name: '',
      role: '',
      category: 'Technical Team',
      department: '',
      year: '',
      image: '',
      profileImageUrl: '',
      email: '',
      phone: '',
      linkedin: '',
      linkedinUrl: '',
      instagram: '',
      instagramUrl: '',
    });
    setShowModal(true);
  };

  const openEdit = (member: TeamMember) => {
    const photo = member.image || member.profileImageUrl || '';
    const linkedin = member.linkedin || member.linkedinUrl || '';
    const instagram = member.instagram || member.instagramUrl || '';
    setEditing({
      ...member,
      image: photo,
      profileImageUrl: photo,
      linkedin,
      linkedinUrl: linkedin,
      instagram,
      instagramUrl: instagram,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editing?.name || !editing?.role) return;
    setSaving(true);
    try {
      const payload: Partial<TeamMember> = {
        ...editing,
        profileImageUrl: editing.image || editing.profileImageUrl || '',
        image: editing.image || editing.profileImageUrl || '',
        linkedinUrl: editing.linkedin || editing.linkedinUrl || '',
        linkedin: editing.linkedin || editing.linkedinUrl || '',
        instagramUrl: editing.instagram || editing.instagramUrl || '',
        instagram: editing.instagram || editing.instagramUrl || '',
      };

      if (editing.id && teamMembers.find(t => t.id === editing.id)) {
        await teamService.updateTeamMember(editing.id, payload);
        toast.success('Member updated');
      } else {
        await teamService.createTeamMember(payload);
        toast.success('Member added');
      }
      setShowModal(false);
      await loadTeam();
    } catch (err) {
      toast.error('Failed to save member');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await teamService.deleteTeamMember(id);
      toast.success('Member removed');
      setDeleteConfirm(null);
      await loadTeam();
    } catch (err) {
      toast.error('Failed to delete member');
      console.error(err);
    }
  };

  const grouped = teamCategories.map(cat => ({
    category: cat,
    members: teamMembers.filter(m => m.category === cat),
  })).filter(g => g.members.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)]">Manage Team</h1>
          <p className="text-sm text-[var(--text-secondary)]">{teamMembers.length} members total</p>
        </div>
        <Button onClick={openAdd} icon={<Plus className="w-4 h-4" />}>Add Member</Button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ category, members }) => (
            <div key={category}>
              <h2 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-4">{category}</h2>
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--glass-border)]">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Member</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Role</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Department</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(m => (
                        <tr key={m.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--bg-card)] transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              {m.image?.trim() || m.profileImageUrl?.trim() ? (
                                <img
                                  src={(m.image?.trim() || m.profileImageUrl?.trim())!}
                                  alt={m.name}
                                  className="w-9 h-9 rounded-full object-cover shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                                  <User className="w-4 h-4" />
                                </div>
                              )}
                              <span className="text-sm font-medium text-[var(--text-primary)]">{m.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm text-[var(--text-secondary)]">{m.role}</td>
                          <td className="px-6 py-3 text-sm text-[var(--text-secondary)]">{m.department || '—'}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEdit(m)} className="p-2 rounded-lg hover:bg-primary/10 text-[var(--text-secondary)] hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => setDeleteConfirm(m.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing?.id ? 'Edit Member' : 'Add Member'} size="lg">
        {editing && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Name" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Full name" />
              <Input label="Role" value={editing.role || ''} onChange={e => setEditing({ ...editing, role: e.target.value })} placeholder="e.g., Technical Lead" />
              <Select label="Category" value={editing.category || 'Technical Team'} onChange={e => setEditing({ ...editing, category: (e.target as HTMLSelectElement).value as TeamCategory })} options={categoryOptions} />
              <Input label="Department" value={editing.department || ''} onChange={e => setEditing({ ...editing, department: e.target.value })} placeholder="e.g., AI & Data Science" />
              <Select label="Year" value={editing.year || ''} onChange={e => setEditing({ ...editing, year: (e.target as HTMLSelectElement).value })} options={yearOptions} />
              <div className="col-span-1 md:col-span-2">
                <ImageUpload
                  label="Profile Photo"
                  value={editing.image || editing.profileImageUrl || ''}
                  onChange={url => setEditing({ ...editing, image: url, profileImageUrl: url })}
                  bucket="team-images"
                />
              </div>
              <Input label="Email" value={editing.email || ''} onChange={e => setEditing({ ...editing, email: e.target.value })} placeholder="email@college.edu" />
              <Input label="LinkedIn" value={editing.linkedin || editing.linkedinUrl || ''} onChange={e => setEditing({ ...editing, linkedin: e.target.value, linkedinUrl: e.target.value })} placeholder="https://linkedin.com/in/..." />
              <Input label="Instagram" value={editing.instagram || editing.instagramUrl || ''} onChange={e => setEditing({ ...editing, instagram: e.target.value, instagramUrl: e.target.value })} placeholder="https://instagram.com/..." />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)} fullWidth>Cancel</Button>
              <Button onClick={handleSave} fullWidth disabled={saving}>
                {saving ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span> : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Member" size="sm">
        <p className="text-[var(--text-secondary)] mb-6">Are you sure you want to remove this team member?</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)} fullWidth>Cancel</Button>
          <Button variant="danger" onClick={() => { if (deleteConfirm) handleDelete(deleteConfirm); }} fullWidth>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
