import { Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

function cleanName(value: unknown): string {
  if (typeof value !== 'string') return 'Untitled app';
  const chars = Array.from(value.trim());
  return chars.slice(0, 80).join('') || 'Untitled app';
}

function cleanHtml(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (value.length > 1500000) return null;
  const cleaned = value.trim();
  if (cleaned.length === 0) return null;
  if (!cleaned.toLowerCase().includes('<html') && !cleaned.toLowerCase().includes('<body')) {
    return null;
  }
  return cleaned;
}

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const body = req.body ?? {};
    const html = cleanHtml(body.html);
    if (html === null) {
      return res.status(400).json({ error: 'A valid HTML document is required' });
    }
    const name = cleanName(body.name);
    const isPublic = body.isPublic !== false;

    const { data, error } = await supabase
      .from('mini_apps')
      .insert({ user_id: req.user!.id, name, html, is_public: isPublic })
      .select('id, name, is_public, created_at')
      .single();

    if (error) throw error;

    return res.status(201).json({ app: data });
  } catch (error) {
    console.error('Mini-app create error:', error);
    return res.status(500).json({ error: 'Failed to save mini-app' });
  }
});

router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const body = req.body ?? {};

    const { data: existing, error: fetchError } = await supabase
      .from('mini_apps')
      .select('id, user_id')
      .eq('id', id)
      .maybeSingle();
    if (fetchError) throw fetchError;
    if (!existing || existing.user_id !== req.user!.id) {
      return res.status(404).json({ error: 'Mini-app not found' });
    }

    const updates: { name?: string; html?: string; is_public?: boolean } = {};
    if (body.name !== undefined) updates.name = cleanName(body.name);
    if (body.html !== undefined) {
      const html = cleanHtml(body.html);
      if (html === null) {
        return res.status(400).json({ error: 'A valid HTML document is required' });
      }
      updates.html = html;
    }
    if (body.isPublic !== undefined) updates.is_public = body.isPublic !== false;

    const { data, error } = await supabase
      .from('mini_apps')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, name, is_public, updated_at')
      .single();

    if (error) throw error;
    return res.json({ app: data });
  } catch (error) {
    console.error('Mini-app update error:', error);
    return res.status(500).json({ error: 'Failed to update mini-app' });
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('mini_apps')
      .select('id, name, is_public, created_at, updated_at')
      .eq('user_id', req.user!.id)
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return res.json({ apps: data ?? [] });
  } catch (error) {
    console.error('Mini-app list error:', error);
    return res.status(500).json({ error: 'Failed to load mini-apps' });
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('mini_apps').delete().eq('id', id).eq('user_id', req.user!.id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (error) {
    console.error('Mini-app delete error:', error);
    return res.status(500).json({ error: 'Failed to delete mini-app' });
  }
});

export const publicRouter = Router();

publicRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('mini_apps')
      .select('id, name, html, is_public, created_at')
      .eq('id', id)
      .eq('is_public', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Mini-app not found or not public' });
    }

    return res.json({ app: data });
  } catch (error) {
    console.error('Public mini-app error:', error);
    return res.status(500).json({ error: 'Failed to load mini-app' });
  }
});

export default router;
