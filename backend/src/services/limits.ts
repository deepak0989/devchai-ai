import { supabase } from '../db/supabase';

export interface UserLimits {
  maxChats: number | null;
  maxMessages: number | null;
  note: string | null;
}

export async function getUserLimits(userId: string): Promise<UserLimits> {
  const { data } = await supabase
    .from('user_limits')
    .select('max_chats, max_messages, note')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) {
    return { maxChats: null, maxMessages: null, note: null };
  }

  return {
    maxChats: data.max_chats ?? null,
    maxMessages: data.max_messages ?? null,
    note: data.note ?? null,
  };
}

export async function countUserChats(userId: string): Promise<number> {
  const { count } = await supabase
    .from('chats')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count ?? 0;
}

export async function countUserMessages(userId: string): Promise<number> {
  const { data: chats } = await supabase
    .from('chats')
    .select('id')
    .eq('user_id', userId);
  const chatIds = (chats ?? []).map((chat: { id: string }) => chat.id);

  if (chatIds.length === 0) {
    return 0;
  }

  const { count } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('chat_id', chatIds);
  return count ?? 0;
}

export async function enforceChatLimit(
  userId: string
): Promise<{ blocked: boolean; message?: string }> {
  const limits = await getUserLimits(userId);
  if (limits.maxChats === null || limits.maxChats === undefined) {
    return { blocked: false };
  }

  const current = await countUserChats(userId);
  if (current >= limits.maxChats) {
    return {
      blocked: true,
      message: limits.note
        ? limits.note
        : `You have reached your chat limit (${limits.maxChats} chats). Contact support to raise it.`,
    };
  }

  return { blocked: false };
}

export async function enforceMessageLimit(
  userId: string
): Promise<{ blocked: boolean; message?: string }> {
  const limits = await getUserLimits(userId);
  if (limits.maxMessages === null || limits.maxMessages === undefined) {
    return { blocked: false };
  }

  const current = await countUserMessages(userId);
  if (current >= limits.maxMessages) {
    return {
      blocked: true,
      message: limits.note
        ? limits.note
        : `You have reached your message limit (${limits.maxMessages} messages). Contact support to raise it.`,
    };
  }

  return { blocked: false };
}
