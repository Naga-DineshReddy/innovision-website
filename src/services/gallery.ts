import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Gallery, GalleryImage } from '../types';
import { mockGalleries } from '../data/mockData';

// --------------- Helpers ---------------

function mapGalleryRow(row: Record<string, unknown>, images: GalleryImage[] = []): Gallery {
  return {
    id: row.id as string,
    eventId: row.event_id as string | null,
    title: row.title as string,
    description: row.description as string,
    coverImageUrl: row.cover_image_url as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    imageCount: (row.gallery_images as unknown[])?.length ?? images.length,

    // Compat aliases
    eventName: row.title as string,
    eventDate: row.created_at as string,
    coverImage: row.cover_image_url as string,
    images,
  };
}

function mapImageRow(row: Record<string, unknown>): GalleryImage {
  return {
    id: row.id as string,
    galleryId: row.gallery_id as string,
    imageUrl: row.image_url as string,
    caption: row.caption as string,
    displayOrder: row.display_order as number,
    createdAt: row.created_at as string,

    // Compat alias
    url: row.image_url as string,
  };
}

// --------------- Public API ---------------

export async function getGalleries(): Promise<Gallery[]> {
  if (!isSupabaseConfigured) {
    return mockGalleries;
  }

  try {
    const { data, error } = await supabase
      .from('galleries')
      .select('*, gallery_images(id)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase getGalleries failed, using mock data:', error.message);
      return mockGalleries;
    }
    return (data ?? []).map(row => mapGalleryRow(row as Record<string, unknown>));
  } catch (err) {
    console.warn('getGalleries network error, using mock data:', err);
    return mockGalleries;
  }
}

export async function getGalleryById(id: string): Promise<Gallery | null> {
  if (!isSupabaseConfigured) {
    return mockGalleries.find(g => g.id === id || g.eventId === id) ?? mockGalleries[0] ?? null;
  }

  try {
    const { data, error } = await supabase
      .from('galleries')
      .select('*, gallery_images(*)')
      .eq('id', id)
      .single();

    if (error) {
      return mockGalleries.find(g => g.id === id || g.eventId === id) ?? null;
    }

    const images = ((data as Record<string, unknown[]>).gallery_images ?? []).map(
      img => mapImageRow(img as Record<string, unknown>)
    );

    return mapGalleryRow(data as Record<string, unknown>, images);
  } catch {
    return mockGalleries.find(g => g.id === id || g.eventId === id) ?? null;
  }
}

export async function getGalleryByEventId(eventId: string): Promise<Gallery | null> {
  const { data, error } = await supabase
    .from('galleries')
    .select('*, gallery_images(*)')
    .eq('event_id', eventId)
    .single();

  if (error) return null;

  const images = ((data as Record<string, unknown[]>).gallery_images ?? []).map(
    img => mapImageRow(img as Record<string, unknown>)
  );

  return mapGalleryRow(data as Record<string, unknown>, images);
}

export async function createGallery(galleryData: {
  title: string;
  eventId?: string;
  description?: string;
  coverImageUrl?: string;
}): Promise<Gallery> {
  const { data, error } = await supabase
    .from('galleries')
    .insert({
      title: galleryData.title,
      event_id: galleryData.eventId || null,
      description: galleryData.description ?? '',
      cover_image_url: galleryData.coverImageUrl ?? '',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapGalleryRow(data as Record<string, unknown>);
}

export async function deleteGallery(id: string): Promise<void> {
  const { error } = await supabase.from('galleries').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addGalleryImage(
  galleryId: string,
  imageUrl: string,
  caption?: string
): Promise<GalleryImage> {
  const { data, error } = await supabase
    .from('gallery_images')
    .insert({
      gallery_id: galleryId,
      image_url: imageUrl,
      caption: caption ?? '',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapImageRow(data as Record<string, unknown>);
}

export async function removeGalleryImage(id: string): Promise<void> {
  const { error } = await supabase.from('gallery_images').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateImageCaption(id: string, caption: string): Promise<void> {
  const { error } = await supabase
    .from('gallery_images')
    .update({ caption })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
