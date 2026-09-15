/**
 * Browser IndexedDB video storage for handling local video files (MP4, WebM)
 * without localStorage 5MB quota limitations.
 */

const DB_NAME = 'innovision_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'videos';
const VIDEO_KEY = 'homepage_featured_video';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredVideoRecord {
  blob: Blob;
  name: string;
  size: number;
  type: string;
  updatedAt: number;
}

/**
 * Save a video file to IndexedDB.
 */
export async function saveVideoBlob(file: File | Blob, name: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record: StoredVideoRecord = {
      blob: file,
      name,
      size: file.size,
      type: file.type || 'video/mp4',
      updatedAt: Date.now(),
    };
    const req = store.put(record, VIDEO_KEY);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve the saved video file from IndexedDB.
 */
export async function getVideoBlob(): Promise<StoredVideoRecord | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(VIDEO_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to read video from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete the saved video file from IndexedDB.
 */
export async function deleteVideoBlob(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(VIDEO_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete video from IndexedDB:', err);
  }
}
