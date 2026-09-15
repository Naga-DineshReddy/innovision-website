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

/**
 * Compress an image file to a lightweight, high-quality Data URL (Base64).
 * Handles resizing to max dimension while preserving aspect ratio.
 */
export async function compressImageToDataUrl(
  file: File,
  maxDimension = 1400,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Preserve SVG and animated GIFs as-is
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image from local files.
 * Tries Supabase Storage first; if the bucket is not created or fails,
 * automatically falls back to an optimized Data URL.
 */
export async function uploadImageWithFallback(
  bucket: StorageBucket,
  file: File,
  path?: string
): Promise<string> {
  try {
    const publicUrl = await uploadImage(bucket, file, path);
    return publicUrl;
  } catch (err) {
    console.warn(`Supabase storage bucket '${bucket}' unavailable, using optimized Data URL fallback:`, err);
    return await compressImageToDataUrl(file);
  }
}

