import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

function mapRowToSettings(row: Record<string, unknown>): SiteSettings {
  return {
    ...DEFAULT_SITE_SETTINGS,
    contactEmail: (typeof row.contact_email === 'string' && row.contact_email.trim()) ? row.contact_email.trim() : DEFAULT_SITE_SETTINGS.contactEmail,
    contactPhone: (typeof row.contact_phone === 'string' && row.contact_phone.trim()) ? row.contact_phone.trim() : DEFAULT_SITE_SETTINGS.contactPhone,
    contactAddress: (typeof row.contact_address === 'string' && row.contact_address.trim()) ? row.contact_address.trim() : DEFAULT_SITE_SETTINGS.contactAddress,
    videoEnabled: row.video_enabled !== undefined && row.video_enabled !== null ? Boolean(row.video_enabled) : DEFAULT_SITE_SETTINGS.videoEnabled,
    videoTitle: (typeof row.video_title === 'string' && row.video_title.trim()) ? row.video_title.trim() : DEFAULT_SITE_SETTINGS.videoTitle,
    videoSubtitle: (typeof row.video_subtitle === 'string' && row.video_subtitle.trim()) ? row.video_subtitle.trim() : DEFAULT_SITE_SETTINGS.videoSubtitle,
    videoSourceType: (row.video_source_type as SiteSettings['videoSourceType']) || DEFAULT_SITE_SETTINGS.videoSourceType,
    videoUrl: (typeof row.video_url === 'string' && row.video_url.trim()) ? row.video_url.trim() : DEFAULT_SITE_SETTINGS.videoUrl,
    videoPoster: (typeof row.video_poster === 'string' && row.video_poster.trim()) ? row.video_poster.trim() : DEFAULT_SITE_SETTINGS.videoPoster,
    hasCustomUploadedVideo: Boolean(row.has_custom_uploaded_video),
    uploadedVideoName: (row.uploaded_video_name as string) || undefined,
    uploadedVideoSize: row.uploaded_video_size ? Number(row.uploaded_video_size) : undefined,
    updatedAt: (row.updated_at as string) || undefined,
  };
}

function settingsToRow(settings: Partial<SiteSettings>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (settings.contactEmail !== undefined) row.contact_email = settings.contactEmail.trim();
  if (settings.contactPhone !== undefined) row.contact_phone = settings.contactPhone.trim();
  if (settings.contactAddress !== undefined) row.contact_address = settings.contactAddress.trim();
  if (settings.videoEnabled !== undefined) row.video_enabled = settings.videoEnabled;
  if (settings.videoTitle !== undefined) row.video_title = settings.videoTitle.trim();
  if (settings.videoSubtitle !== undefined) row.video_subtitle = settings.videoSubtitle.trim();
  if (settings.videoSourceType !== undefined) row.video_source_type = settings.videoSourceType;
  if (settings.videoUrl !== undefined) row.video_url = settings.videoUrl.trim();
  if (settings.videoPoster !== undefined) row.video_poster = settings.videoPoster.trim();
  if (settings.hasCustomUploadedVideo !== undefined) row.has_custom_uploaded_video = settings.hasCustomUploadedVideo;
  if (settings.uploadedVideoName !== undefined) row.uploaded_video_name = settings.uploadedVideoName;
  if (settings.uploadedVideoSize !== undefined) row.uploaded_video_size = settings.uploadedVideoSize;
  return row;
}

function saveToLocalStorage(settings: SiteSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: settings }));
  } catch (err) {
    console.error('Failed to save site settings to localStorage:', err);
  }
}

let realtimeInitialized = false;

/**
 * Setup realtime subscription to listen for site_settings updates from any client
 */
export function initRealtimeSubscription(): void {
  if (realtimeInitialized || !isSupabaseConfigured || typeof window === 'undefined') return;
  realtimeInitialized = true;

  try {
    supabase
      .channel('public:site_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const updated = mapRowToSettings(payload.new as Record<string, unknown>);
            saveToLocalStorage(updated);
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('Failed to subscribe to site_settings realtime channel:', err);
  }
}

/**
 * Get current site settings (synchronously from localStorage cache or defaults)
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
 * Fetch latest site settings from Supabase and cache in localStorage.
 * Automatically initializes realtime listener.
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  initRealtimeSubscription();

  if (!isSupabaseConfigured) {
    return getSiteSettings();
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      console.warn('Could not fetch site_settings from Supabase (falling back to cache):', error.message);
      return getSiteSettings();
    }

    if (data) {
      const merged = mapRowToSettings(data);
      saveToLocalStorage(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Network error fetching site settings from Supabase:', err);
  }

  return getSiteSettings();
}

/**
 * Save site settings to LocalStorage and persist to Supabase site_settings table.
 */
export async function updateSiteSettings(partial: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately update locally for instant UI responsiveness
  saveToLocalStorage(updated);

  // 2. Persist to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const rowData = {
        id: 'default',
        ...settingsToRow(updated),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('site_settings')
        .upsert(rowData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Failed to sync site settings to Supabase:', error);
        throw new Error(error.message || 'Database update failed');
      }

      if (data) {
        const synced = mapRowToSettings(data);
        saveToLocalStorage(synced);
        return synced;
      }
    } catch (err) {
      console.error('Error saving site settings to Supabase:', err);
      throw err;
    }
  }

  return updated;
}

/**
 * Reset site settings back to default
 */
export async function resetSiteSettings(): Promise<SiteSettings> {
  saveToLocalStorage(DEFAULT_SITE_SETTINGS);

  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('site_settings')
        .upsert({
          id: 'default',
          ...settingsToRow(DEFAULT_SITE_SETTINGS),
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to reset Supabase site settings:', err);
    }
  }

  return DEFAULT_SITE_SETTINGS;
}

/**
 * Subscribe to site settings changes (from localStorage, custom events, or realtime)
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
