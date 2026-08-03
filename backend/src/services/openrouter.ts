import { config } from '../config';

export type ModelId =
  | 'openai/gpt-4o-mini'
  | 'anthropic/claude-3.5-sonnet'
  | 'google/gemini-2.0-flash-001'
  | 'deepseek/deepseek-chat';

export const DEFAULT_MODEL: ModelId = 'openai/gpt-4o-mini';

export const SUPPORTED_MODELS: ModelId[] = [
  'openai/gpt-4o-mini',
  'anthropic/claude-3.5-sonnet',
  'google/gemini-2.0-flash-001',
  'deepseek/deepseek-chat',
];

export function isSupportedModel(value: unknown): value is ModelId {
  return typeof value === 'string' && (SUPPORTED_MODELS as string[]).includes(value);
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function* streamChatCompletion(
  messages: OpenRouterMessage[],
  model: ModelId,
  signal: AbortSignal
): AsyncGenerator<string> {
  const response = await fetch(`${config.openRouterBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': config.clientUrl,
      'X-Title': 'DevChat AI',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 4096,
    }),
    signal,
  });

  if (!response.ok) {
    let detail = '';
    try {
      const json = (await response.json()) as { error?: { message?: string } };
      detail = json.error?.message ?? '';
    } catch {
      detail = '';
    }
    throw new Error(
      detail
        ? `OpenRouter request failed (${response.status}): ${detail}`
        : `OpenRouter request failed (${response.status})`
    );
  }

  if (!response.body) {
    throw new Error('OpenRouter returned an empty response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const payload = trimmed.slice('data:'.length).trim();
      if (payload === '[DONE]') return;

      try {
        const json = JSON.parse(payload);
        const delta: unknown = json?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length > 0) {
          yield delta;
        }
      } catch {
        // Skip malformed keep-alive / comment frames
      }
    }
  }
}