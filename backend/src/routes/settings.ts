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
    const [features, maintenance] = await Promise.all([
      getFeatureSettings(),
      getMaintenanceSettings(),
    ]);
    return res.json({ ...features, maintenance });
  } catch {
    return res.json({
      voiceEnabled: true,
      maintenance: { enabled: false, message: '' },
    });
  }
});

export default router;
