import { Router } from 'express';
import { supabase } from '../db/supabase';

const router = Router();

export interface FeatureSettings {
  voiceEnabled: boolean;
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

router.get('/', async (_req, res) => {
  try {
    const settings = await getFeatureSettings();
    return res.json(settings);
  } catch {
    return res.json({ voiceEnabled: true });
  }
});

export default router;
