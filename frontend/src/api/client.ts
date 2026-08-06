import { Chat, Message, User } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

const TOKEN_KEY = 'devchat_access_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (body as { error?: string }).error ?? `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return body as T;
}

export interface BrandingSettings {
  appName: string;
  logo: string;
  tagline: string;
  logoUrl: string;
  accent: string;
}

export interface PublicSettings {
  voiceEnabled: boolean;
  maintenance: { enabled: boolean; message: string };
  branding: BrandingSettings;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  chat_count: number;
  limits: { maxChats: number | null; maxMessages: number | null; note: string | null };
  created_at: string;
  last_seen: string;
}

async function requestBlob(
  path: string,
  options: RequestInit = {}
): Promise<Blob> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      (body as { error?: string }).error ?? `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return response.blob();
}

export const api = {
  register(email: string, password: string) {
    return request<{ user: User; session: { access_token: string } | null; message?: string }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
  },

  login(email: string, password: string) {
    return request<{ user: User; session: { access_token: string } | null }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
  },

  me() {
    return request<{ user: User }>('/auth/me');
  },

  listChats() {
    return request<{ chats: Chat[] }>('/chats');
  },

  createChat(payload: { title?: string; model?: string }) {
    return request<{ chat: Chat }>('/chats', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteChat(chatId: string) {
    return request<void>(`/chats/${chatId}`, { method: 'DELETE' });
  },

  getMessages(chatId: string) {
    return request<{ messages: Message[] }>(`/chats/${chatId}/messages`);
  },

  adminOverview() {
    return request<{
      summary: Array<{ label: string; value: string; change: string; color: string }>;
      modelBreakdown: Array<{ name: string; count: number; value: number; color: string }>;
      recentUsers: Array<{ name: string; email: string; joined: string | null }>;
      activity: string[];
      systemHealth: Array<{ label: string; status: 'ok' | 'error'; detail: string; color: string }>;
      usageTrend: Array<{ label: string; value: number }>;
      chatsTrend: Array<{ label: string; value: number }>;
      lastUpdated: string;
    }>('/admin/overview');
  },

  adminUsers(params?: { search?: string; role?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role && params.role !== 'all') query.set('role', params.role);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    const qs = query.toString();

    return request<{
      users: AdminUserRow[];
      total: number;
      counts: { all: number; admin: number; active: number; disabled: number };
    }>(`/admin/users${qs ? `?${qs}` : ''}`);
  },

  adminExportUsers(params?: { search?: string; role?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role && params.role !== 'all') query.set('role', params.role);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    const qs = query.toString();
    return requestBlob(`/admin/users/export${qs ? `?${qs}` : ''}`);
  },

  adminSetLimits(
    userId: string,
    payload: { maxChats: number | null; maxMessages: number | null; note: string | null }
  ) {
    return request<{
      ok: boolean;
      limits: { maxChats: number | null; maxMessages: number | null; note: string | null };
    }>(`/admin/users/${userId}/limits`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  adminUserChats(userId: string) {
    return request<{
      user: { id: string; email: string | null };
      chats: Array<{
        id: string;
        title: string;
        model: string;
        created_at: string;
        updated_at: string;
        messages: Message[];
      }>;
    }>(`/admin/users/${userId}/chats`);
  },

  adminSetRole(userId: string, role: 'admin' | 'user') {
    return request<{ ok: boolean; role: string }>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  adminSetStatus(userId: string, banned: boolean) {
    return request<{ ok: boolean; banned: boolean }>(`/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ banned }),
    });
  },

  getPublicSettings() {
    return request<PublicSettings>('/settings');
  },

  adminGetSettings() {
    return request<PublicSettings>('/admin/settings');
  },

  adminUpdateSettings(payload: {
    voiceEnabled?: boolean;
    maintenance?: { enabled: boolean; message: string };
    branding?: { appName?: string; logo?: string; tagline?: string; logoUrl?: string; accent?: string };
  }) {
    return request<PublicSettings>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  adminBilling() {
    return request<{
      totalCredits: number | null;
      totalSpend: number | null;
      remaining: number | null;
      totalUsers: number;
      totalMessages: number;
      monthlyActivity: Array<{ month: string; messages: number }>;
      modelBreakdown: Array<{ name: string; count: number; value: number; color: string }>;
      lastUpdated: string;
    }>('/admin/billing');
  },
};
