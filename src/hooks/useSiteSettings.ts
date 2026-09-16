import { useState, useEffect } from 'react';
import { getSiteSettings, fetchSiteSettings, onSettingsChange, type SiteSettings } from '../services/siteSettings';

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings);

  useEffect(() => {
    // 1. Refresh from local cache immediately
    setSettings(getSiteSettings());

    // 2. Fetch fresh data from Supabase backend asynchronously
    fetchSiteSettings().then((fresh) => {
      setSettings(fresh);
    });

    // 3. Subscribe to local, storage, and Supabase realtime updates
    const unsubscribe = onSettingsChange((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  return settings;
}

