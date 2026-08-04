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
      recentUsers: Array<{ name: string; email: string; plan: string }>;
      activity: string[];
      systemHealth: Array<{ label: string; value: string; color: string }>;
      revenueTrend: Array<{ label: string; value: number }>;
      usageTrend: Array<{ label: string; value: number }>;
      lastUpdated: string;
    }>('/admin/overview');
  },
};
