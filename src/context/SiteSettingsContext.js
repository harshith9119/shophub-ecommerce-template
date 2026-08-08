import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSiteSettings } from '../lib/db';
import { DEFAULT_SETTINGS } from '../lib/defaultSettings';

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const data = await getSiteSettings();
    setSettings(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh, setSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
};
