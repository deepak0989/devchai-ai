import { NextFunction, Request, Response } from 'express';
import { supabase } from '../db/supabase';

export interface AuthUser {
  id: string;
  email: string;
  role?: 'admin' | 'user';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = header.slice('Bearer '.length).trim();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { data: bannedRow } = await supabase
    .from('banned_users')
    .select('banned_until')
    .eq('user_id', data.user.id)
    .maybeSingle();

  const bannedUntil =
    (data.user.banned_until as string | null | undefined) ?? bannedRow?.banned_until ?? null;

  if (bannedUntil && new Date(bannedUntil).getTime() > Date.now()) {
    return res.status(403).json({ error: 'Account disabled. Contact support.' });
  }

  const { data: roleData } = await supabase
    .from('roles')
    .select('role')
    .eq('user_id', data.user.id)
    .maybeSingle();

  req.user = {
    id: data.user.id,
    email: data.user.email ?? '',
    role: (roleData?.role as 'admin' | 'user') ?? 'user',
  };

  next();
}
