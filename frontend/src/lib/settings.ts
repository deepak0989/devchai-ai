import { useEffect, useReducer } from 'react';
import { api } from '../api/client';

export interface Branding {
  appName: string;
  logo: string;
  tagline: string;
  logoUrl: string;
  accent: string;
}

export interface AppSettings {
  voiceEnabled: boolean;
  branding: Branding;
  loaded: boolean;
}

export const DEFAULT_BRANDING: Branding = {
  appName: 'MyDevAI',
  logo: 'M',
  tagline: 'AI for developers',
  logoUrl: '',
  accent: '#10a37f',
};

const DEFAULT_SETTINGS: AppSettings = {
  voiceEnabled: true,
  branding: DEFAULT_BRANDING,
  loaded: false,
};

let cachedSettings: AppSettings = DEFAULT_SETTINGS;
let settingsPromise: Promise<AppSettings> | null = null;

export function getAppSettings(): AppSettings {
  return cachedSettings;
}

export async function loadAppSettings(): Promise<AppSettings> {
  if (settingsPromise) return settingsPromise;

  settingsPromise = api
    .getPublicSettings()
    .then((settings) => {
      cachedSettings = {
        voiceEnabled: settings.voiceEnabled,
        branding: {
          appName: settings.branding?.appName || DEFAULT_BRANDING.appName,
          logo: settings.branding?.logo || DEFAULT_BRANDING.logo,
          tagline: settings.branding?.tagline || DEFAULT_BRANDING.tagline,
          logoUrl: settings.branding?.logoUrl || '',
          accent: settings.branding?.accent || DEFAULT_BRANDING.accent,
        },
        loaded: true,
      };
      return cachedSettings;
    })
    .catch(() => {
      cachedSettings = { ...DEFAULT_SETTINGS, loaded: true };
      return cachedSettings;
    });

  return settingsPromise;
}

export function updateLocalSettings(settings: AppSettings): void {
  cachedSettings = settings;
}

export function useAppSettings(): AppSettings {
  const [, force] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    let cancelled = false;
    loadAppSettings()
      .then(() => {
        if (!cancelled) force();
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return getAppSettings();
}
