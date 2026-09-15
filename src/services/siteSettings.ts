/**
 * Site configuration service for Homepage Video & Contact information.
 * Persists to LocalStorage and dispatches events for reactive updates across the app.
 */

export interface SiteSettings {
  // Contact Information
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;

  // Homepage Video Settings
  videoEnabled: boolean;
  videoTitle: string;
  videoSubtitle: string;
  videoSourceType: 'default' | 'uploaded' | 'url';
  videoUrl: string; // custom web URL or fallback path
  videoPoster: string; // poster image URL or data URL
  hasCustomUploadedVideo: boolean;
  uploadedVideoName?: string;
  uploadedVideoSize?: number;
  updatedAt?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  contactEmail: 'innovision@college.edu',
  contactPhone: '+91 98765 43210',
  contactAddress: 'Department of AI & Data Science,\nMain Campus, Block A, College of Engineering',

  videoEnabled: true,
  videoTitle: 'Experience InnoVision',
  videoSubtitle: 'Watch our highlight reel and discover what makes InnoVision the most exciting tech community on campus.',
  videoSourceType: 'default',
  videoUrl: '/videos/innovision-promo.mp4?v=2',
  videoPoster: '/videos/innovision-promo-thumb.png?v=2',
  hasCustomUploadedVideo: false,
};

const STORAGE_KEY = 'innovision_site_settings';
const SETTINGS_CHANGE_EVENT = 'innovision_settings_changed';

/**
 * Get current site settings (merged with defaults)
 */
export function getSiteSettings(): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SITE_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...parsed,
      videoPoster: parsed.videoPoster?.trim() || DEFAULT_SITE_SETTINGS.videoPoster,
      videoUrl: parsed.videoUrl?.trim() || DEFAULT_SITE_SETTINGS.videoUrl,
      contactEmail: parsed.contactEmail?.trim() || DEFAULT_SITE_SETTINGS.contactEmail,
      contactPhone: parsed.contactPhone?.trim() || DEFAULT_SITE_SETTINGS.contactPhone,
      contactAddress: parsed.contactAddress?.trim() || DEFAULT_SITE_SETTINGS.contactAddress,
    };
  } catch (err) {
    console.warn('Failed to parse site settings from localStorage:', err);
    return DEFAULT_SITE_SETTINGS;
  }
}

/**
 * Save site settings and notify listeners
 */
export function updateSiteSettings(partial: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event for same-tab reactive update
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: updated }));
  } catch (err) {
    console.error('Failed to save site settings to localStorage:', err);
  }

  return updated;
}

/**
 * Reset site settings back to default
 */
export function resetSiteSettings(): SiteSettings {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: DEFAULT_SITE_SETTINGS }));
  } catch (err) {
    console.error('Failed to reset site settings:', err);
  }
  return DEFAULT_SITE_SETTINGS;
}

/**
 * Subscribe to site settings changes
 */
export function onSettingsChange(callback: (settings: SiteSettings) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<SiteSettings>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getSiteSettings());
    }
  };

  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getSiteSettings());
    }
  };

  window.addEventListener(SETTINGS_CHANGE_EVENT, handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(SETTINGS_CHANGE_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
}
