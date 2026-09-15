import { useState, useEffect } from 'react';
import { getSiteSettings, onSettingsChange, type SiteSettings } from '../services/siteSettings';

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(getSiteSettings);

  useEffect(() => {
    setSettings(getSiteSettings());
    const unsubscribe = onSettingsChange((newSettings) => {
      setSettings(newSettings);
    });
    return unsubscribe;
  }, []);

  return settings;
}
