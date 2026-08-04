import { Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

async function ensureUserRole(userId: string, role: 'user' | 'admin' = 'user') {
  const { data: existingRole } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingRole) {
    await supabase.from('roles').insert({ user_id: userId, role });
  }
}

function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password: unknown): password is string {
  return typeof password === 'string' && password.length >= 6;
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  const user = data.user
    ? { id: data.user.id, email: data.user.email }
    : null;

  if (data.user?.id) {
    await ensureUserRole(data.user.id, 'user');
  }

  if (!data.session) {
    return res.status(201).json({
      user,
      session: null,
      message: 'Account created. Check your email to confirm your account.',
    });
  }

  return res.status(201).json({
    user,
    session: {
      access_token: data.session.access_token,
      expires_at: data.session.expires_at,
    },
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!isValidEmail(email) || !isValidPassword(password)) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  if (data.user?.id) {
    await ensureUserRole(data.user.id, 'user');
  }

  return res.json({
    user: { id: data.user.id, email: data.user.email },
    session: {
      access_token: data.session.access_token,
      expires_at: data.session.expires_at,
    },
  });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const { data: roleData } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', req.user!.id)
    .maybeSingle();

  return res.json({
    user: {
      id: req.user!.id,
      email: req.user!.email,
      role: (roleData?.role as 'admin' | 'user') ?? 'user',
    },
  });
});

export default router;
