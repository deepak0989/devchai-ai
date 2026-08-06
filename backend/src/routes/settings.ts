import { Router } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

export interface FeatureSettings {
  voiceEnabled: boolean;
}

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
}

export interface BrandingSettings {
  appName: string;
  logo: string;
  tagline: string;
}

export const DEFAULT_BRANDING: BrandingSettings = {
  appName: 'MyDevAI',
  logo: 'M',
  tagline: 'AI for developers',
};

function cleanString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  const chars = Array.from(value.trim());
  return chars.slice(0, maxLength).join('');
}

export async function getBrandingSettings(): Promise<BrandingSettings> {
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'branding')
    .maybeSingle();

  const value = (data?.value as
    | { appName?: string; logo?: string; tagline?: string }
    | undefined) ?? {};

  return {
    appName: cleanString(value.appName, 40) || DEFAULT_BRANDING.appName,
    logo: cleanString(value.logo, 4) || DEFAULT_BRANDING.logo,
    tagline: cleanString(value.tagline, 90) || DEFAULT_BRANDING.tagline,
  };
}

export async function saveBrandingSettings(input: {
  appName?: string;
  logo?: string;
  tagline?: string;
}): Promise<void> {
  const current = await getBrandingSettings();
  const appName = cleanString(input.appName ?? '', 40) || current.appName;
  const logo = cleanString(input.logo ?? '', 4) || current.logo;
  const tagline = cleanString(input.tagline ?? '', 90) || current.tagline;
  await supabase
    .from('app_settings')
    .upsert({ key: 'branding', value: { appName, logo, tagline } }, { onConflict: 'key' });
}

export async function getFeatureSettings(): Promise<FeatureSettings> {
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'features')
    .maybeSingle();

  const value = (data?.value as { voice?: boolean } | undefined) ?? {};
  return { voiceEnabled: value.voice !== false };
}

export async function saveFeatureSettings(voiceEnabled: boolean): Promise<void> {
  await supabase
    .from('app_settings')
    .upsert({ key: 'features', value: { voice: voiceEnabled } }, { onConflict: 'key' });
}

export async function getMaintenanceSettings(): Promise<MaintenanceSettings> {
  const { data } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'maintenance')
    .maybeSingle();

  const value = (data?.value as { enabled?: boolean; message?: string } | undefined) ?? {};
  return {
    enabled: value.enabled === true,
    message:
      typeof value.message === 'string' && value.message.trim().length > 0
        ? value.message.trim()
        : 'We are performing scheduled maintenance. Please check back shortly.',
  };
}

export async function saveMaintenanceSettings(
  enabled: boolean,
  message: string
): Promise<void> {
  const cleanMessage =
    typeof message === 'string' && message.trim().length > 0
      ? message.trim()
      : 'We are performing scheduled maintenance. Please check back shortly.';
  await supabase
    .from('app_settings')
    .upsert(
      { key: 'maintenance', value: { enabled, message: cleanMessage } },
      { onConflict: 'key' }
    );
}

router.get('/', async (_req, res) => {
  try {
    const [features, maintenance, branding] = await Promise.all([
      getFeatureSettings(),
      getMaintenanceSettings(),
      getBrandingSettings(),
    ]);
    return res.json({ ...features, maintenance, branding });
  } catch {
    return res.json({
      voiceEnabled: true,
      maintenance: { enabled: false, message: '' },
      branding: DEFAULT_BRANDING,
    });
  }
});

export default router;
