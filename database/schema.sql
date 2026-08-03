-- ============================================================
-- DevChat AI - Supabase (PostgreSQL) schema
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- Chats
-- ------------------------------------------------------------
create table if not exists public.chats (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null default 'New Chat',
  model      text not null default 'openai/gpt-4o-mini',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chats_user_id_idx
  on public.chats (user_id, updated_at desc);

-- ------------------------------------------------------------
-- Messages
-- ------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  chat_id    uuid not null references public.chats (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  model      text,
  created_at timestamptz not null default now()
);

create index if not exists messages_chat_id_idx
  on public.messages (chat_id, created_at);

-- ------------------------------------------------------------
-- Keep chats.updated_at fresh on every message insert
-- ------------------------------------------------------------
create or replace function public.touch_chat_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chats
     set updated_at = now()
   where id = new.chat_id;
  return new;
end;
$$;

drop trigger if exists messages_touch_chat on public.messages;
create trigger messages_touch_chat
  after insert on public.messages
  for each row execute function public.touch_chat_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.chats    enable row level security;
alter table public.messages enable row level security;

drop policy if exists "chats_select_own" on public.chats;
create policy "chats_select_own"
  on public.chats for select
  using (auth.uid() = user_id);

drop policy if exists "chats_insert_own" on public.chats;
create policy "chats_insert_own"
  on public.chats for insert
  with check (auth.uid() = user_id);

drop policy if exists "chats_update_own" on public.chats;
create policy "chats_update_own"
  on public.chats for update
  using (auth.uid() = user_id);

drop policy if exists "chats_delete_own" on public.chats;
create policy "chats_delete_own"
  on public.chats for delete
  using (auth.uid() = user_id);

drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own"
  on public.messages for select
  using (
    exists (
      select 1 from public.chats c
      where c.id = messages.chat_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chats c
      where c.id = messages.chat_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own"
  on public.messages for delete
  using (
    exists (
      select 1 from public.chats c
      where c.id = messages.chat_id and c.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- Grants (API access via service role / anon)
-- ------------------------------------------------------------
grant all on public.chats    to anon, authenticated, service_role;
grant all on public.messages to anon, authenticated, service_role;
