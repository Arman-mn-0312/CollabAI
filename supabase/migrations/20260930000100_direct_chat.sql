create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.direct_conversations (
  id uuid primary key default gen_random_uuid(),
  user_one_id uuid not null references auth.users(id) on delete cascade,
  user_two_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint direct_conversations_distinct_users check (user_one_id <> user_two_id),
  constraint direct_conversations_canonical_users check (user_one_id < user_two_id),
  constraint direct_conversations_unique_pair unique (user_one_id, user_two_id)
);

create table public.direct_conversation_participants (
  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id),
  constraint direct_conversation_participants_limit check (user_id is not null),
  constraint direct_conversation_participants_profile_fk
    foreign key (user_id) references public.profiles(id) on delete cascade
);

create table public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.direct_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index direct_conversation_participants_user_id_idx on public.direct_conversation_participants(user_id);
create index direct_messages_conversation_created_idx on public.direct_messages(conversation_id, created_at desc);

create or replace function public.touch_direct_conversation()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  update public.direct_conversations
  set updated_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger direct_messages_touch_conversation
after insert on public.direct_messages
for each row execute function public.touch_direct_conversation();

create or replace function public.create_direct_conversation(p_current_user_id uuid, p_target_user_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  first_user uuid := least(p_current_user_id, p_target_user_id);
  second_user uuid := greatest(p_current_user_id, p_target_user_id);
  conversation_id uuid;
begin
  if p_current_user_id = p_target_user_id then
    raise exception using errcode = '22023', message = 'A direct conversation requires two different users';
  end if;

  insert into public.direct_conversations (user_one_id, user_two_id)
  values (first_user, second_user)
  on conflict (user_one_id, user_two_id) do update set updated_at = public.direct_conversations.updated_at
  returning id into conversation_id;

  insert into public.direct_conversation_participants (conversation_id, user_id)
  values (conversation_id, first_user), (conversation_id, second_user)
  on conflict do nothing;

  return conversation_id;
end;
$$;

revoke all on function public.create_direct_conversation(uuid, uuid) from public;
grant execute on function public.create_direct_conversation(uuid, uuid) to service_role;

alter table public.direct_conversations enable row level security;
alter table public.direct_conversation_participants enable row level security;
alter table public.direct_messages enable row level security;

create policy direct_conversations_select_participant on public.direct_conversations
for select using (exists (
  select 1 from public.direct_conversation_participants p
  where p.conversation_id = id and p.user_id = (select auth.uid())
));

create policy direct_conversation_participants_select_self on public.direct_conversation_participants
for select using (user_id = (select auth.uid()));

create policy direct_messages_select_participant on public.direct_messages
for select using (exists (
  select 1 from public.direct_conversation_participants p
  where p.conversation_id = direct_messages.conversation_id and p.user_id = (select auth.uid())
));

create policy direct_messages_insert_self on public.direct_messages
for insert with check (
  sender_id = (select auth.uid()) and exists (
    select 1 from public.direct_conversation_participants p
    where p.conversation_id = direct_messages.conversation_id and p.user_id = (select auth.uid())
  )
);

alter publication supabase_realtime add table public.direct_messages;
