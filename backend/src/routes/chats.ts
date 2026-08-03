import { Router } from 'express';
import { supabase } from '../db/supabase';
import { requireAuth, AuthRequest } from '../middleware/auth';
import {
  DEFAULT_MODEL,
  isSupportedModel,
  streamChatCompletion,
  ModelId,
} from '../services/openrouter';

interface ChatRow {
  id: string;
  user_id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  model: string | null;
  created_at: string;
}

const router = Router();

async function findChatForUser(userId: string, chatId: string): Promise<ChatRow | null> {
  const { data, error } = await supabase
    .from('chats')
    .select('id, user_id, title, model, created_at, updated_at')
    .eq('id', chatId)
    .single();

  if (error || !data || data.user_id !== userId) return null;
  return data as ChatRow;
}

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await supabase
    .from('chats')
    .select('id, title, model, created_at, updated_at')
    .eq('user_id', req.user!.id)
    .order('updated_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ chats: data ?? [] });
});

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const body = req.body ?? {};
  const model: ModelId = isSupportedModel(body.model) ? body.model : DEFAULT_MODEL;
  const title =
    typeof body.title === 'string' && body.title.trim().length > 0
      ? body.title.trim().slice(0, 80)
      : 'New Chat';

  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: req.user!.id, title, model })
    .select('id, title, model, created_at, updated_at')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ chat: data });
});

router.get('/:id/messages', requireAuth, async (req: AuthRequest, res) => {
  const chat = await findChatForUser(req.user!.id, req.params.id);
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  const { data, error } = await supabase
    .from('messages')
    .select('id, chat_id, role, content, model, created_at')
    .eq('chat_id', chat.id)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ messages: data ?? [] });
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const chat = await findChatForUser(req.user!.id, req.params.id);
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  const { error } = await supabase.from('chats').delete().eq('id', chat.id);
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(204).send();
});

router.post('/:id/messages', requireAuth, async (req: AuthRequest, res) => {
  const { content } = req.body ?? {};
  const requestedModel = req.body?.model;

  if (typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  const model: ModelId = isSupportedModel(requestedModel) ? requestedModel : DEFAULT_MODEL;

  const chat = await findChatForUser(req.user!.id, req.params.id);
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  if (chat.title === 'New Chat') {
    const title = content.trim().length > 60
      ? `${content.trim().slice(0, 60)}...`
      : content.trim();
    await supabase.from('chats').update({ title, model }).eq('id', chat.id);
  } else if (chat.model !== model) {
    await supabase.from('chats').update({ model }).eq('id', chat.id);
  }

  const { error: userMsgError } = await supabase
    .from('messages')
    .insert({ chat_id: chat.id, role: 'user', content: content.trim() });

  if (userMsgError) {
    return res.status(500).json({ error: userMsgError.message });
  }

  const { data: historyRows } = await supabase
    .from('messages')
    .select('role, content')
    .eq('chat_id', chat.id)
    .order('created_at', { ascending: true })
    .limit(40);

  const history = (historyRows ?? []).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const abortController = new AbortController();
  let clientGone = false;
  let finished = false;

  req.on('close', () => {
    if (!finished) {
      clientGone = true;
      abortController.abort();
    }
  });

  let assistantText = '';
  let streamFailed = false;
  let streamErrorMessage = '';

  try {
    try {
      for await (const delta of streamChatCompletion(history, model, abortController.signal)) {
        if (clientGone) break;
        assistantText += delta;
        res.write(`data: ${JSON.stringify({ event: 'message', delta })}\n\n`);
      }
    } catch (err) {
      const abortError = err instanceof Error && err.name === 'AbortError';
      if (!abortError && !clientGone) {
        streamFailed = true;
        streamErrorMessage =
          err instanceof Error && err.message
            ? err.message
            : 'Failed to reach the AI model.';
        console.error('OpenRouter stream error:', err);
      }
    }

    if (!clientGone) {
      finished = true;
      if (streamFailed) {
        res.write(
          `data: ${JSON.stringify({ event: 'error', error: streamErrorMessage })}\n\n`
        );
      }
      if (assistantText.trim().length > 0) {
        const { data: savedMessage } = await supabase
          .from('messages')
          .insert({
            chat_id: chat.id,
            role: 'assistant',
            content: assistantText,
            model,
          })
          .select('id, chat_id, role, content, model, created_at')
          .single();
        res.write(
          `data: ${JSON.stringify({
            event: 'done',
            message: savedMessage as MessageRow | null,
          })}\n\n`
        );
      }
      res.end();
    } else if (assistantText.trim().length > 0) {
      await supabase
        .from('messages')
        .insert({ chat_id: chat.id, role: 'assistant', content: assistantText, model });
    }
  } catch (err) {
    console.error('Error finalizing chat message:', err);
    if (!finished && !clientGone) {
      res.write(
        `data: ${JSON.stringify({ event: 'error', error: 'Failed to save the response.' })}\n\n`
      );
      res.end();
    }
  }
});

export default router;
