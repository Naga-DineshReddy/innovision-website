import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import ImageUpload from '../../components/ui/ImageUpload';
import type { Banner } from '../../types';
import * as bannerService from '../../services/banners';

export default function ManageBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadBanners = async () => {
    try {
      const data = await bannerService.getAllBanners();
      setBanners(data);
    } catch (err) {
      toast.error('Failed to load banners');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const sorted = [...banners].sort((a, b) => a.order - b.order);

  const openAdd = () => {
    setEditingBanner({ title: '', subtitle: '', image: '', buttonText: '', buttonLink: '', active: true, order: banners.length + 1 });
    setShowModal(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner({ ...banner });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingBanner?.title) return;
    setSaving(true);
    try {
      if (editingBanner.id && banners.find(b => b.id === editingBanner.id)) {
        await bannerService.updateBanner(editingBanner.id, editingBanner);
        toast.success('Banner updated');
      } else {
        await bannerService.createBanner(editingBanner);
        toast.success('Banner created');
      }
      setShowModal(false);
      await loadBanners();
    } catch (err) {
      toast.error('Failed to save banner');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await bannerService.toggleBannerActive(banner.id, banner.active);
      toast.success(banner.active ? 'Banner deactivated' : 'Banner activated');
      await loadBanners();
    } catch (err) {
      toast.error('Failed to toggle banner');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await bannerService.deleteBanner(id);
      toast.success('Banner deleted');
      setDeleteConfirm(null);
      await loadBanners();
    } catch (err) {
      toast.error('Failed to delete banner');
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)]">Manage Banners</h1>
          <p className="text-sm text-[var(--text-secondary)]">{banners.length} banners total</p>
        </div>
        <Button onClick={openAdd} icon={<Plus className="w-4 h-4" />}>Add Banner</Button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-4">
          {sorted.map(banner => (
            <div key={banner.id} className="glass-card p-4">
              <div className="flex items-center gap-4">
                {banner.image?.trim() ? (
                  <img
                    src={banner.image.trim()}
                    alt={banner.title}
                    className="w-32 h-20 rounded-xl object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-32 h-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                    <Megaphone className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{banner.title}</h3>
                    <Badge variant={banner.active ? 'success' : 'default'} size="sm">
                      {banner.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{banner.subtitle}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Button: "{banner.buttonText}" → {banner.buttonLink} | Order: {banner.order}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(banner)} className="p-2 rounded-lg hover:bg-primary/10 text-[var(--text-secondary)] hover:text-primary transition-colors" aria-label={banner.active ? 'Deactivate' : 'Activate'}>
                    {banner.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(banner)} className="p-2 rounded-lg hover:bg-primary/10 text-[var(--text-secondary)] hover:text-primary transition-colors" aria-label="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(banner.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors" aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBanner?.id ? 'Edit Banner' : 'Add Banner'} size="lg">
        {editingBanner && (
          <div className="space-y-5">
            <Input label="Title" value={editingBanner.title || ''} onChange={e => setEditingBanner({ ...editingBanner, title: e.target.value })} placeholder="Banner title" />
            <Input label="Subtitle" value={editingBanner.subtitle || ''} onChange={e => setEditingBanner({ ...editingBanner, subtitle: e.target.value })} placeholder="Banner subtitle" />
            <ImageUpload
              label="Banner Image"
              value={editingBanner.image || ''}
              onChange={url => setEditingBanner({ ...editingBanner, image: url })}
              bucket="association-assets"
            />
            <div className="grid grid-cols-2 gap-5">
              <Input label="Button Text" value={editingBanner.buttonText || ''} onChange={e => setEditingBanner({ ...editingBanner, buttonText: e.target.value })} placeholder="Learn More" />
              <Input label="Button Link" value={editingBanner.buttonLink || ''} onChange={e => setEditingBanner({ ...editingBanner, buttonLink: e.target.value })} placeholder="/events" />
            </div>
            <Input label="Order" type="number" value={String(editingBanner.order || 1)} onChange={e => setEditingBanner({ ...editingBanner, order: Number(e.target.value) })} />
            <div className="flex items-center gap-3">
              <input type="checkbox" id="bannerActive" checked={editingBanner.active ?? true} onChange={e => setEditingBanner({ ...editingBanner, active: e.target.checked })} className="w-4 h-4 rounded" />
              <label htmlFor="bannerActive" className="text-sm text-[var(--text-secondary)]">Active</label>
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

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Banner" size="sm">
        <p className="text-[var(--text-secondary)] mb-6">Are you sure?</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)} fullWidth>Cancel</Button>
          <Button variant="danger" onClick={() => { if (deleteConfirm) handleDelete(deleteConfirm); }} fullWidth>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
