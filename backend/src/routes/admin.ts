import { NextFunction, Response, Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { config } from '../config';
import {
  getFeatureSettings,
  saveFeatureSettings,
  getMaintenanceSettings,
  saveMaintenanceSettings,
} from './settings';
import { invalidateMaintenanceCache } from '../middleware/maintenance';
import { UserLimits } from '../services/limits';

const router = Router();

const DAY_MS = 24 * 60 * 60 * 1000;

const MODEL_LABELS: Record<string, string> = {
  'openai/gpt-4o-mini': 'GPT-4o mini',
  'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
  'google/gemini-2.0-flash-001': 'Gemini 2.0 Flash',
  'deepseek/deepseek-chat': 'DeepSeek V3',
};

const MODEL_COLORS = ['#10a37f', '#d97757', '#4285f4', '#8b5cf6'];

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
}

function modelLabel(model: string | null): string {
  return MODEL_LABELS[model ?? ''] ?? model ?? 'Unknown';
}

function formatCompactNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function pctChange(current: number, previous: number): string {
  if (previous <= 0) return current > 0 ? '+100%' : '0%';
  const rounded = Math.round(((current - previous) / previous) * 1000) / 10;
  return `${rounded >= 0 ? '+' : ''}${rounded}%`;
}

function isoDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dayLabel(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00Z`).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
  });
}

function monthLabel(monthKey: string): string {
  return new Date(`${monthKey}-01T00:00:00Z`).toLocaleDateString('en', {
    month: 'short',
  });
}

function lastDays(count: number): string[] {
  const keys: string[] = [];
  const now = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    keys.push(isoDayKey(new Date(now - i * DAY_MS)));
  }
  return keys;
}

function lastMonths(count: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

async function listAuthUsers() {
  const { data } = await (supabase.auth as any).admin.listUsers({ page: 1, perPage: 1000 });
  return data?.users ?? [];
}

async function checkService(
  name: string,
  check: () => Promise<boolean>
): Promise<{ label: string; status: 'ok' | 'error'; detail: string; color: string }> {
  const start = Date.now();
  try {
    const ok = await check();
    const latency = Date.now() - start;
    if (!ok) {
      return { label: name, status: 'error', detail: 'Unreachable', color: '#ef4444' };
    }
    return { label: name, status: 'ok', detail: `${latency}ms`, color: '#10a37f' };
  } catch {
    return { label: name, status: 'error', detail: 'Unreachable', color: '#ef4444' };
  }
}

async function fetchOpenRouterCredits() {
  try {
    const res = await fetch(`${config.openRouterBaseUrl}/credits`, {
      headers: {
        Authorization: `Bearer ${config.openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { total_credits?: number; total_usage?: number; limit_remaining?: number } };
    return json.data ?? null;
  } catch {
    return null;
  }
}

router.get('/overview', requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const now = Date.now();
    const since7 = new Date(now - 7 * DAY_MS).toISOString();
    const since14 = new Date(now - 14 * DAY_MS).toISOString();

    const [authUsers, chatsResult, messagesResult] = await Promise.all([
      listAuthUsers(),
      supabase.from('chats').select('id, user_id, model, created_at'),
      supabase.from('messages').select('id, chat_id, role, model, created_at'),
    ]);

    const users = authUsers;
    const chats = chatsResult.data ?? [];
    const messages = messagesResult.data ?? [];

    const users7 = users.filter((u: any) => (u.created_at ?? '') >= since7).length;
    const users14 = users.filter((u: any) => (u.created_at ?? '') >= since14).length;

    const chats7 = chats.filter((c: any) => c.created_at >= since7);
    const chatsPrev7 = chats.filter(
      (c: any) => c.created_at >= since14 && c.created_at < since7
    );

    const messages7 = messages.filter((m: any) => m.created_at >= since7);
    const messagesPrev7 = messages.filter(
      (m: any) => m.created_at >= since14 && m.created_at < since7
    );

    const todayKey = isoDayKey(new Date(now));
    const messagesToday = messages.filter((m: any) =>
      (m.created_at as string).startsWith(todayKey)
    ).length;

    const activeUsers7 = new Set(chats7.map((c: any) => c.user_id)).size;
    const activeUsersPrev7 = new Set(
      chatsPrev7.map((c: any) => c.user_id)
    ).size;

    const modelCounts: Record<string, number> = {};
    for (const m of messages7) {
      const key = modelLabel(m.model);
      modelCounts[key] = (modelCounts[key] ?? 0) + 1;
    }
    const modelTotal = Math.max(
      1,
      Object.values(modelCounts).reduce((a, b) => a + b, 0)
    );
    const modelBreakdown = Object.entries(modelCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count], index) => ({
        name,
        count,
        value: Math.max(4, Math.round((count / modelTotal) * 100)),
        color: MODEL_COLORS[index % MODEL_COLORS.length],
      }));

    const recentUsers = users
      .slice()
      .sort((a: any, b: any) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
      .slice(0, 4)
      .map((user: any) => ({
        name: user.email?.split('@')[0] ?? 'New User',
        email: user.email ?? 'unknown@mydevai.app',
        joined: user.created_at ?? null,
      }));

    const topModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    const dayKeys = lastDays(14);
    const messagesByDay: Record<string, number> = {};
    for (const m of messages) {
      const key = (m.created_at as string).slice(0, 10);
      messagesByDay[key] = (messagesByDay[key] ?? 0) + 1;
    }
    const chatsByDay: Record<string, number> = {};
    for (const c of chats) {
      const key = (c.created_at as string).slice(0, 10);
      chatsByDay[key] = (chatsByDay[key] ?? 0) + 1;
    }
    const usageTrend = dayKeys.map((key) => ({ label: dayLabel(key), value: messagesByDay[key] ?? 0 }));
    const chatsTrend = dayKeys.map((key) => ({ label: dayLabel(key), value: chatsByDay[key] ?? 0 }));

    const [supabaseHealth, openrouterHealth, credits] = await Promise.all([
      checkService('Supabase API', async () => {
        const { error } = await supabase.from('chats').select('id').limit(1);
        return !error;
      }),
      checkService('OpenRouter API', async () => {
        const res = await fetch(`${config.openRouterBaseUrl}/models`, {
          headers: { Authorization: `Bearer ${config.openRouterApiKey}` },
          signal: AbortSignal.timeout(8000),
        });
        return res.ok;
      }),
      fetchOpenRouterCredits(),
    ]);

    const creditsLeft = credits
      ? Math.max(0, (credits.total_credits ?? 0) - (credits.total_usage ?? 0))
      : null;

    const systemHealth = [
      supabaseHealth,
      openrouterHealth,
      {
        label: 'Credits remaining',
        status: creditsLeft !== null && creditsLeft > 0 ? ('ok' as const) : ('error' as const),
        detail: creditsLeft !== null ? `$${creditsLeft.toFixed(2)}` : 'Unknown',
        color: creditsLeft !== null && creditsLeft > 0 ? '#10a37f' : '#f59e0b',
      },
    ];

    const summary = [
      {
        label: 'Total Users',
        value: formatCompactNumber(users.length),
        change: pctChange(users7, Math.max(0, users14 - users7)),
        color: '#10a37f',
      },
      {
        label: 'Active This Week',
        value: formatCompactNumber(activeUsers7),
        change: pctChange(activeUsers7, activeUsersPrev7),
        color: '#3b82f6',
      },
      {
        label: 'Messages This Week',
        value: formatCompactNumber(messages7.length),
        change: pctChange(messages7.length, messagesPrev7.length),
        color: '#8b5cf6',
      },
      {
        label: 'Chats This Week',
        value: formatCompactNumber(chats7.length),
        change: pctChange(chats7.length, chatsPrev7.length),
        color: '#f59e0b',
      },
    ];

    const activity = [
      `${users7} new user${users7 === 1 ? '' : 's'} joined this week`,
      `${messagesToday} message${messagesToday === 1 ? '' : 's'} sent today`,
      `${chats7.length} conversation${chats7.length === 1 ? '' : 's'} started in the last 7 days`,
      topModel
        ? `Most active model this week: ${topModel}`
        : 'No model usage yet this week',
    ];

    return res.json({
      summary,
      modelBreakdown,
      recentUsers,
      activity,
      systemHealth,
      usageTrend,
      chatsTrend,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({ error: 'Failed to load admin dashboard data' });
  }
});

router.get('/users', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const roleFilter = typeof req.query.role === 'string' ? req.query.role : 'all';
    const statusFilter = typeof req.query.status === 'string' ? req.query.status : 'all';

    const [authUsers, rolesResult, chatsResult, limitsResult] = await Promise.all([
      listAuthUsers(),
      supabase.from('roles').select('user_id, role'),
      supabase.from('chats').select('user_id'),
      supabase.from('user_limits').select('user_id, max_chats, max_messages, note'),
    ]);

    const roleMap = new Map(
      (rolesResult.data ?? []).map((row: { user_id: string; role: string }) => [
        row.user_id,
        row.role,
      ])
    );
    const chatCounts = new Map<string, number>();
    for (const chat of chatsResult.data ?? []) {
      const userId = (chat as { user_id: string }).user_id;
      chatCounts.set(userId, (chatCounts.get(userId) ?? 0) + 1);
    }
    const limitsMap = new Map(
      (limitsResult.data ?? []).map((row: { user_id: string; max_chats: number | null; max_messages: number | null; note: string | null }) => [
        row.user_id,
        { maxChats: row.max_chats ?? null, maxMessages: row.max_messages ?? null, note: row.note ?? null },
      ])
    );

    let users = authUsers.map((user: any) => ({
      id: user.id,
      name: user.email?.split('@')[0] ?? 'User',
      email: user.email ?? 'unknown@mydevai.app',
      role: roleMap.get(user.id) ?? 'user',
      status: user.banned_until ? 'disabled' : 'active',
      chat_count: chatCounts.get(user.id) ?? 0,
      limits: limitsMap.get(user.id) ?? { maxChats: null, maxMessages: null, note: null },
      created_at: user.created_at,
      last_seen: user.last_sign_in_at ?? user.created_at,
    }));

    const counts = {
      all: users.length,
      admin: users.filter((u: any) => u.role === 'admin').length,
      active: users.filter((u: any) => u.status === 'active').length,
      disabled: users.filter((u: any) => u.status === 'disabled').length,
    };

    if (search) {
      users = users.filter(
        (u: any) =>
          u.email.toLowerCase().includes(search) || u.name.toLowerCase().includes(search)
      );
    }
    if (roleFilter === 'admin' || roleFilter === 'user') {
      users = users.filter((u: any) => u.role === roleFilter);
    }
    if (statusFilter === 'active' || statusFilter === 'disabled') {
      users = users.filter((u: any) => u.status === statusFilter);
    }

    return res.json({ users, total: users.length, counts });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ error: 'Failed to load users' });
  }
});

function csvEscape(value: unknown): string {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

router.get('/users/export', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const roleFilter = typeof req.query.role === 'string' ? req.query.role : 'all';
    const statusFilter = typeof req.query.status === 'string' ? req.query.status : 'all';

    const [authUsers, rolesResult, chatsResult, limitsResult] = await Promise.all([
      listAuthUsers(),
      supabase.from('roles').select('user_id, role'),
      supabase.from('chats').select('user_id'),
      supabase.from('user_limits').select('user_id, max_chats, max_messages, note'),
    ]);

    const roleMap = new Map(
      (rolesResult.data ?? []).map((row: { user_id: string; role: string }) => [
        row.user_id,
        row.role,
      ])
    );
    const chatCounts = new Map<string, number>();
    for (const chat of chatsResult.data ?? []) {
      const userId = (chat as { user_id: string }).user_id;
      chatCounts.set(userId, (chatCounts.get(userId) ?? 0) + 1);
    }
    const limitsMap = new Map(
      (limitsResult.data ?? []).map(
        (row: { user_id: string; max_chats: number | null; max_messages: number | null; note: string | null }) => [
          row.user_id,
          row as { max_chats: number | null; max_messages: number | null; note: string | null },
        ]
      )
    );

    let users = authUsers;
    if (search) {
      users = users.filter(
        (u: any) =>
          (u.email ?? '').toLowerCase().includes(search) ||
          (u.email?.split('@')[0] ?? '').toLowerCase().includes(search)
      );
    }
    if (roleFilter === 'admin' || roleFilter === 'user') {
      users = users.filter((u: any) => (roleMap.get(u.id) ?? 'user') === roleFilter);
    }
    if (statusFilter === 'active' || statusFilter === 'disabled') {
      users = users.filter((u: any) =>
        statusFilter === 'active' ? !u.banned_until : Boolean(u.banned_until)
      );
    }

    const header = [
      'id',
      'name',
      'email',
      'role',
      'status',
      'chat_count',
      'max_chats',
      'max_messages',
      'limit_note',
      'created_at',
      'last_seen',
    ];
    const rows = users.map((user: any) => {
      const limits = limitsMap.get(user.id) ?? null;
      return [
        user.id,
        user.email?.split('@')[0] ?? 'User',
        user.email ?? '',
        roleMap.get(user.id) ?? 'user',
        user.banned_until ? 'disabled' : 'active',
        chatCounts.get(user.id) ?? 0,
        limits?.max_chats ?? '',
        limits?.max_messages ?? '',
        limits?.note ?? '',
        user.created_at ?? '',
        user.last_sign_in_at ?? user.created_at ?? '',
      ];
    });

    const csv = [header, ...rows]
      .map((row) => row.map(csvEscape).join(','))
      .join('\n');

    const dateKey = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="devchat-users-${dateKey}.csv"`
    );
    return res.send(`\uFEFF${csv}`);
  } catch (error) {
    console.error('Admin users export error:', error);
    return res.status(500).json({ error: 'Failed to export users' });
  }
});

router.get('/users/:id/chats', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;

    const [authUsers, chatsResult, messagesResult] = await Promise.all([
      listAuthUsers(),
      supabase
        .from('chats')
        .select('id, title, model, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(100),
      supabase
        .from('messages')
        .select('id, chat_id, role, content, model, created_at')
        .order('created_at', { ascending: true }),
    ]);

    const user = authUsers.find((u: any) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const chats = chatsResult.data ?? [];
    const chatIds = chats.map((c: { id: string }) => c.id);
    const messagesByChat = new Map<string, Array<Record<string, unknown>>>();
    for (const message of messagesResult.data ?? []) {
      const m = message as { chat_id: string };
      if (!chatIds.includes(m.chat_id)) continue;
      const list = messagesByChat.get(m.chat_id) ?? [];
      list.push(message);
      messagesByChat.set(m.chat_id, list);
    }

    const chatsWithMessages = chats.map((chat: any) => ({
      ...chat,
      messages: (messagesByChat.get(chat.id) ?? []).slice(-100),
    }));

    return res.json({
      user: { id: user.id, email: user.email ?? null },
      chats: chatsWithMessages,
    });
  } catch (error) {
    console.error('Admin user chats error:', error);
    return res.status(500).json({ error: 'Failed to load user chats' });
  }
});

router.patch('/users/:id/role', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;
    const role = req.body?.role;
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ error: 'Role must be "admin" or "user"' });
    }

    if (userId === req.user!.id && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot remove your own admin role' });
    }

    const { data: existing } = await supabase
      .from('roles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('roles').update({ role }).eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('roles').insert({ user_id: userId, role });
      if (error) throw error;
    }

    return res.json({ ok: true, role });
  } catch (error) {
    console.error('Admin role update error:', error);
    return res.status(500).json({ error: 'Failed to update role' });
  }
});

router.post('/users/:id/status', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;
    const banned = req.body?.banned === true;

    if (userId === req.user!.id && banned) {
      return res.status(400).json({ error: 'You cannot disable your own account' });
    }

    const attributes = banned
      ? { banned_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() }
      : { banned_until: null };

    const { error } = await (supabase.auth as any).admin.updateUserById(userId, attributes);
    if (error) throw error;

    return res.json({ ok: true, banned });
  } catch (error) {
    console.error('Admin status update error:', error);
    return res.status(500).json({ error: 'Failed to update user status' });
  }
});

router.put('/users/:id/limits', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;
    const body = req.body ?? {};

    const rawChats = body.maxChats;
    const rawMessages = body.maxMessages;
    const rawNote = body.note;

    if (
      rawChats !== null &&
      rawChats !== undefined &&
      (typeof rawChats !== 'number' || !Number.isInteger(rawChats) || rawChats < 1)
    ) {
      return res.status(400).json({ error: 'maxChats must be a positive integer or null' });
    }
    if (
      rawMessages !== null &&
      rawMessages !== undefined &&
      (typeof rawMessages !== 'number' || !Number.isInteger(rawMessages) || rawMessages < 1)
    ) {
      return res.status(400).json({ error: 'maxMessages must be a positive integer or null' });
    }

    const maxChats = rawChats ?? null;
    const maxMessages = rawMessages ?? null;
    const note =
      typeof rawNote === 'string' && rawNote.trim().length > 0
        ? rawNote.trim().slice(0, 300)
        : null;

    const { data: existing } = await supabase
      .from('user_limits')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existing) {
      if (maxChats === null && maxMessages === null) {
        return res.json({
          ok: true,
          limits: { maxChats: null, maxMessages: null, note: null },
        });
      }
      const { error } = await supabase.from('user_limits').insert({
        user_id: userId,
        max_chats: maxChats,
        max_messages: maxMessages,
        note,
      });
      if (error) throw error;
    } else if (maxChats === null && maxMessages === null && note === null) {
      const { error } = await supabase.from('user_limits').delete().eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_limits')
        .update({ max_chats: maxChats, max_messages: maxMessages, note, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (error) throw error;
    }

    const limits: UserLimits = { maxChats, maxMessages, note };
    return res.json({ ok: true, limits });
  } catch (error) {
    console.error('Admin limits update error:', error);
    return res.status(500).json({ error: 'Failed to update user limits' });
  }
});

router.get('/billing', requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const [authUsers, messagesResult, credits] = await Promise.all([
      listAuthUsers(),
      supabase.from('messages').select('model, created_at'),
      fetchOpenRouterCredits(),
    ]);

    const messages = messagesResult.data ?? [];
    const totalCredits = credits?.total_credits ?? null;
    const totalSpend = credits?.total_usage ?? null;
    const remaining =
      totalCredits !== null && totalSpend !== null
        ? Math.max(0, totalCredits - totalSpend)
        : null;

    const monthKeys = lastMonths(6);
    const messagesByMonth: Record<string, number> = {};
    for (const m of messages) {
      const key = (m.created_at as string).slice(0, 7);
      messagesByMonth[key] = (messagesByMonth[key] ?? 0) + 1;
    }
    const monthlyActivity = monthKeys.map((key) => ({
      month: monthLabel(key),
      messages: messagesByMonth[key] ?? 0,
    }));

    const modelCounts: Record<string, number> = {};
    for (const m of messages) {
      const key = modelLabel(m.model);
      modelCounts[key] = (modelCounts[key] ?? 0) + 1;
    }
    const modelTotal = Math.max(1, Object.values(modelCounts).reduce((a, b) => a + b, 0));
    const modelBreakdown = Object.entries(modelCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => ({
        name,
        count,
        value: Math.max(4, Math.round((count / modelTotal) * 100)),
        color: MODEL_COLORS[index % MODEL_COLORS.length],
      }));

    return res.json({
      totalCredits,
      totalSpend,
      remaining,
      totalUsers: authUsers.length,
      totalMessages: messages.length,
      monthlyActivity,
      modelBreakdown,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin billing error:', error);
    return res.status(500).json({ error: 'Failed to load usage data' });
  }
});

router.get('/settings', requireAuth, requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const [features, maintenance] = await Promise.all([
      getFeatureSettings(),
      getMaintenanceSettings(),
    ]);
    return res.json({ ...features, maintenance });
  } catch (error) {
    console.error('Admin settings error:', error);
    return res.status(500).json({ error: 'Failed to load settings' });
  }
});

router.put('/settings', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const body = req.body ?? {};

    if (typeof body.voiceEnabled === 'boolean') {
      await saveFeatureSettings(body.voiceEnabled);
    }

    if (body.maintenance !== undefined) {
      const enabled = body.maintenance?.enabled === true;
      const message =
        typeof body.maintenance?.message === 'string' ? body.maintenance.message : '';
      await saveMaintenanceSettings(enabled, message);
      invalidateMaintenanceCache();
    }

    const [features, maintenance] = await Promise.all([
      getFeatureSettings(),
      getMaintenanceSettings(),
    ]);
    return res.json({ ...features, maintenance });
  } catch (error) {
    console.error('Admin settings update error:', error);
    return res.status(500).json({ error: 'Failed to save settings' });
  }
});

export default router;