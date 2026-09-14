import { supabase } from '../lib/supabase';

const BUCKETS = ['event-banners', 'gallery-images', 'team-images', 'association-assets'] as const;
export type StorageBucket = (typeof BUCKETS)[number];

/**
 * Upload a file to Supabase Storage and return its public URL.
 */
export async function uploadImage(
  bucket: StorageBucket,
  file: File,
  path?: string
): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const fileName = path || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  return getPublicUrl(bucket, fileName);
}

/**
 * Delete an image from Supabase Storage.
 */
export async function deleteImage(bucket: StorageBucket, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

/**
 * Get the public URL for a file in Supabase Storage.
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Extract the storage path from a full public URL so it can be deleted.
 */
export function extractPathFromUrl(url: string, bucket: StorageBucket): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
