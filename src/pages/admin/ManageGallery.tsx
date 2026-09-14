import { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import type { Gallery } from '../../types';
import * as galleryService from '../../services/gallery';

export default function ManageGallery() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGallery, setShowAddGallery] = useState(false);
  const [showAddImage, setShowAddImage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newGallery, setNewGallery] = useState({ eventName: '', eventDate: '', coverImage: '', description: '' });
  const [newImage, setNewImage] = useState({ url: '', caption: '' });

  const loadGalleries = async () => {
    try {
      // Fetch galleries with their images
      const data = await galleryService.getGalleries();
      // For admin view, load full gallery details for each
      const fullGalleries = await Promise.all(
        data.map(g => galleryService.getGalleryById(g.id))
      );
      setGalleries(fullGalleries.filter((g): g is Gallery => g !== null));
    } catch (err) {
      toast.error('Failed to load galleries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadGalleries(); }, []);

  const handleAddGallery = async () => {
    if (!newGallery.eventName) return;
    try {
      await galleryService.createGallery({
        title: newGallery.eventName,
        description: newGallery.description,
        coverImageUrl: newGallery.coverImage,
      });
      toast.success('Gallery created');
      setNewGallery({ eventName: '', eventDate: '', coverImage: '', description: '' });
      setShowAddGallery(false);
      await loadGalleries();
    } catch (err) {
      toast.error('Failed to create gallery');
      console.error(err);
    }
  };

  const handleAddImage = async () => {
    if (!showAddImage || !newImage.url) return;
    try {
      await galleryService.addGalleryImage(showAddImage, newImage.url, newImage.caption);
      toast.success('Photo added');
      setNewImage({ url: '', caption: '' });
      setShowAddImage(null);
      await loadGalleries();
    } catch (err) {
      toast.error('Failed to add photo');
      console.error(err);
    }
  };

  const removeImage = async (imageId: string) => {
    try {
      await galleryService.removeGalleryImage(imageId);
      toast.success('Photo removed');
      await loadGalleries();
    } catch (err) {
      toast.error('Failed to remove photo');
      console.error(err);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    try {
      await galleryService.deleteGallery(id);
      toast.success('Gallery deleted');
      setDeleteConfirm(null);
      await loadGalleries();
    } catch (err) {
      toast.error('Failed to delete gallery');
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)]">Manage Gallery</h1>
          <p className="text-sm text-[var(--text-secondary)]">{galleries.length} galleries, {galleries.reduce((s, g) => s + g.images.length, 0)} photos</p>
        </div>
        <Button onClick={() => setShowAddGallery(true)} icon={<Plus className="w-4 h-4" />}>Add Gallery</Button>
      </div>

      {loading ? (
        <div className="space-y-6">{[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-6">
          {galleries.map(gallery => (
            <div key={gallery.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img src={gallery.coverImage} alt={gallery.eventName} className="w-20 h-14 rounded-xl object-cover shrink-0" />
                  <div>
                    <h3 className="font-bold font-heading text-[var(--text-primary)]">{gallery.eventName}</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {gallery.images.length} photos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setShowAddImage(gallery.id)} icon={<ImageIcon className="w-3 h-3" />}>Add Photo</Button>
                  <button onClick={() => setDeleteConfirm(gallery.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors" aria-label="Delete gallery">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {gallery.images.length > 0 && (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {gallery.images.map(img => (
                    <div key={img.id} className="relative group">
                      <img src={img.url} alt={img.caption || ''} className="w-full aspect-square rounded-lg object-cover" />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Gallery Modal */}
      <Modal isOpen={showAddGallery} onClose={() => setShowAddGallery(false)} title="Add Gallery" size="md">
        <div className="space-y-5">
          <Input label="Event Name" value={newGallery.eventName} onChange={e => setNewGallery({ ...newGallery, eventName: e.target.value })} placeholder="Event name" />
          <Input label="Event Date" type="date" value={newGallery.eventDate} onChange={e => setNewGallery({ ...newGallery, eventDate: e.target.value })} />
          <Input label="Cover Image URL" value={newGallery.coverImage} onChange={e => setNewGallery({ ...newGallery, coverImage: e.target.value })} placeholder="https://..." />
          <Textarea label="Description" value={newGallery.description} onChange={e => setNewGallery({ ...newGallery, description: e.target.value })} placeholder="Brief description" />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowAddGallery(false)} fullWidth>Cancel</Button>
            <Button onClick={handleAddGallery} fullWidth>Add Gallery</Button>
          </div>
        </div>
      </Modal>

      {/* Add Image Modal */}
      <Modal isOpen={!!showAddImage} onClose={() => setShowAddImage(null)} title="Add Photo" size="sm">
        <div className="space-y-5">
          <Input label="Image URL" value={newImage.url} onChange={e => setNewImage({ ...newImage, url: e.target.value })} placeholder="https://..." />
          <Input label="Caption (optional)" value={newImage.caption} onChange={e => setNewImage({ ...newImage, caption: e.target.value })} placeholder="Photo caption" />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowAddImage(null)} fullWidth>Cancel</Button>
            <Button onClick={handleAddImage} fullWidth>Add Photo</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Gallery" size="sm">
        <p className="text-[var(--text-secondary)] mb-6">This will delete the gallery and all its photos. Are you sure?</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)} fullWidth>Cancel</Button>
          <Button variant="danger" onClick={() => { if (deleteConfirm) handleDeleteGallery(deleteConfirm); }} fullWidth>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
