export interface User {
  id: string;
  email: string;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string | null;
  created_at: string;
}

export interface ModelOption {
  key: 'gpt' | 'claude' | 'gemini' | 'deepseek';
  label: string;
  model: string;
  badge: string;
  color: string;
}

export const MODELS: ModelOption[] = [
  {
    key: 'gpt',
    label: 'GPT-4o mini',
    model: 'openai/gpt-4o-mini',
    badge: 'GPT',
    color: '#10a37f',
  },
  {
    key: 'claude',
    label: 'Claude 3.5 Sonnet',
    model: 'anthropic/claude-3.5-sonnet',
    badge: 'CL',
    color: '#d97757',
  },
  {
    key: 'gemini',
    label: 'Gemini 2.0 Flash',
    model: 'google/gemini-2.0-flash-001',
    badge: 'GM',
    color: '#4285f4',
  },
  {
    key: 'deepseek',
    label: 'DeepSeek V3',
    model: 'deepseek/deepseek-chat',
    badge: 'DS',
    color: '#4d6bfe',
  },
];

export function getModelOption(model: string | null | undefined): ModelOption {
  return (
    MODELS.find((m) => m.model === model) ??
    MODELS[0]
  );
}
