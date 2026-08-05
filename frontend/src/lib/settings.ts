import { api } from '../api/client';

export interface AppSettings {
  voiceEnabled: boolean;
  loaded: boolean;
}

const DEFAULT_SETTINGS: AppSettings = { voiceEnabled: true, loaded: false };

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
