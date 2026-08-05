import { NextFunction, Response } from 'express';
import { supabase } from '../db/supabase';
import { AuthRequest } from './auth';
import { getMaintenanceSettings } from '../routes/settings';

const CACHE_TTL_MS = 10 * 1000;

let cachedAt = 0;
let cachedEnabled = false;
let cachedMessage = '';

async function readMaintenance() {
  const now = Date.now();
  if (now - cachedAt < CACHE_TTL_MS) {
    return { enabled: cachedEnabled, message: cachedMessage };
  }
  const settings = await getMaintenanceSettings();
  cachedAt = now;
  cachedEnabled = settings.enabled;
  cachedMessage = settings.message;
  return settings;
}

export function invalidateMaintenanceCache(): void {
  cachedAt = 0;
}

export async function maintenanceGuard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const maintenance = await readMaintenance();
    if (!maintenance.enabled) {
      return next();
    }

    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.slice('Bearer '.length).trim();
      const { data } = await supabase.auth.getUser(token);
      if (data.user) {
        const { data: roleData } = await supabase
          .from('roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();
        if (roleData?.role === 'admin') {
          return next();
        }
      }
    }

    return res.status(503).json({
      error: maintenance.message,
      maintenance: true,
    });
  } catch {
    return next();
  }
}
