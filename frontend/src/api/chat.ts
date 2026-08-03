import { getToken } from './client';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

interface StreamCallbacks {
  onDelta: (delta: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

interface StreamFrame {
  event?: 'message' | 'done' | 'error';
  delta?: string;
  error?: string;
}

export async function streamChatMessage(
  chatId: string,
  content: string,
  model: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken() ?? ''}`,
    },
    body: JSON.stringify({ content, model }),
    signal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed (${response.status})`);
  }

  if (!response.body) {
    throw new Error('Streaming not supported by this browser');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith('data:')) continue;

      const payload = line.slice('data:'.length).trim();
      if (!payload) continue;

      try {
        const frame = JSON.parse(payload) as StreamFrame;
        if (frame.event === 'message' && frame.delta) {
          callbacks.onDelta(frame.delta);
        } else if (frame.event === 'done') {
          callbacks.onDone();
        } else if (frame.event === 'error' && frame.error) {
          callbacks.onError(frame.error);
        }
      } catch {
        // Ignore malformed frames
      }
    }
  }
}
