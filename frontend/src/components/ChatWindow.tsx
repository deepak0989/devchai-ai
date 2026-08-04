import { useEffect, useRef, useState } from 'react';
import {
  Box,
  CircularProgress,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { streamChatMessage } from '../api/chat';
import { api } from '../api/client';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import ModelSelector from './ModelSelector';
import EmptyState from './EmptyState';

interface ChatWindowProps {
  chatId: string | null;
  model: string;
  onModelChange: (model: string) => void;
  onOpenDrawer: () => void;
  onChatsChanged: () => void;
  onNewChat: () => Promise<unknown>;
}

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

const SUGGESTIONS = [
  'Explain how React reconciliation works',
  'Write a debounce hook in TypeScript',
  'Debug: why is my SQL query slow?',
  'Design a REST API for a todo app',
];

export default function ChatWindow({
  chatId,
  model,
  onModelChange,
  onOpenDrawer,
  onChatsChanged,
  onNewChat,
}: ChatWindowProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [input, setInput] = useState('');

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const streamingRef = useRef(false);

  useEffect(() => {
    streamingRef.current = streaming;
  }, [streaming]);

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      if (!chatId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      if (!streamingRef.current) {
        setLoading(true);
        setMessages([]);
      }
      abortRef.current?.abort();
      abortRef.current = null;

      try {
        const { messages: history } = await api.getMessages(chatId);
        if (cancelled || streamingRef.current) return;
        setMessages(
          history.map((m) => ({ id: m.id, role: m.role, content: m.content }))
        );
      } catch {
        if (!cancelled && !streamingRef.current) {
          setMessages([
            {
              id: 'load-error',
              role: 'assistant',
              content: 'Failed to load this conversation. Please try again.',
              error: true,
            },
          ]);
        }
      } finally {
        if (!cancelled && !streamingRef.current) setLoading(false);
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading]);

  function stopStreaming() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || streaming) return;

    let targetChatId = chatId;
    if (!targetChatId) {
      const chat = await onNewChat();
      if (!chat) return;
      targetChatId = (chat as { id: string }).id;
    }

    const userMessage: LocalMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    const assistantId = crypto.randomUUID();
    const assistantMessage: LocalMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let accumulated = '';
    let failed = false;

    try {
      await streamChatMessage(
        targetChatId,
        content,
        model,
        {
          onDelta: (delta) => {
            accumulated += delta;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: accumulated } : m
              )
            );
          },
          onDone: () => {
            failed = false;
          },
          onError: (message) => {
            failed = true;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      content:
                        accumulated +
                        (accumulated ? '\n\n' : '') +
                        `Error: ${message}`,
                      error: true,
                    }
                  : m
              )
            );
          },
        },
        controller.signal
      );
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      if (!isAbort) {
        failed = true;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    accumulated +
                    (accumulated ? '\n\n' : '') +
                    `Error: ${err instanceof Error ? err.message : 'Request failed'}`,
                  error: true,
                }
              : m
          )
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      onChatsChanged();
      if (failed && !accumulated) {
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    }
  }

  const showEmptyState = !chatId && messages.length === 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(180deg, #f5f5f4 0%, #f8f8f7 100%)',
      }}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {isMobile && (
          <IconButton
            aria-label="Open menu"
            onClick={onOpenDrawer}
            sx={{ borderRadius: 2, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1 }}>
          {chatId ? 'DevChat AI' : 'Start a new conversation'}
        </Typography>
        <ModelSelector value={model} onChange={onModelChange} />
      </Box>

      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: { xs: 2, sm: 4, md: 6 },
          py: 2,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : showEmptyState ? (
          <EmptyState
            suggestions={SUGGESTIONS}
            onSuggestionClick={(suggestion) => sendMessage(suggestion)}
          />
        ) : (
          <Box sx={{ maxWidth: 860, mx: 'auto', py: 1 }}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </Box>
        )}
      </Box>

      <Box
        component="footer"
        sx={{ px: { xs: 2, sm: 4, md: 6 }, pb: 3, pt: 1 }}
      >
        <Box sx={{ maxWidth: 860, mx: 'auto' }}>
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={() => sendMessage(input)}
            onStop={stopStreaming}
            streaming={streaming}
            disabled={loading}
            placeholder="Message DevChat AI..."
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 1 }}
          >
            DevChat AI can make mistakes. Verify important information.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
