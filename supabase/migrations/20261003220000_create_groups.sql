create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 1000),
  invite_code text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id),
  constraint group_members_profile_fk
    foreign key (user_id) references public.profiles(id) on delete cascade
);

create index if not exists groups_owner_id_idx on public.groups(owner_id);
create index if not exists group_members_user_id_idx on public.group_members(user_id);

create table if not exists public.group_join_requests (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  constraint group_join_requests_profile_fk
    foreign key (user_id) references public.profiles(id) on delete cascade,
  constraint group_join_requests_review_fields check (
    (status = 'pending' and reviewed_at is null and reviewed_by is null)
    or (status in ('accepted', 'rejected') and reviewed_at is not null and reviewed_by is not null)
  )
);

create unique index if not exists group_join_requests_pending_unique
  on public.group_join_requests(group_id, user_id)
  where status = 'pending';
create index if not exists group_join_requests_group_status_idx
  on public.group_join_requests(group_id, status, requested_at desc);
create index if not exists group_join_requests_user_idx
  on public.group_join_requests(user_id, requested_at desc);

create or replace function public.create_group_join_request(
  p_group_id uuid,
  p_user_id uuid,
  p_invite_code text
)
returns public.group_join_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  new_request public.group_join_requests;
begin
  if not exists (
    select 1 from public.groups
    where id = p_group_id and invite_code = upper(btrim(p_invite_code))
  ) then
    raise exception using errcode = '22023', message = 'Invalid invite code';
  end if;
  if exists (select 1 from public.groups where id = p_group_id and owner_id = p_user_id) then
    raise exception using errcode = '22023', message = 'The group owner cannot request to join';
  end if;
  if exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = p_user_id
  ) then
    raise exception using errcode = '23505', message = 'Already a group member';
  end if;

  insert into public.group_join_requests (group_id, user_id)
  values (p_group_id, p_user_id)
  returning * into new_request;
  return new_request;
end;
$$;

create or replace function public.review_group_join_request(
  p_request_id uuid,
  p_owner_id uuid,
  p_decision text
)
returns public.group_join_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.group_join_requests;
begin
  select r.* into request_row
  from public.group_join_requests r
  join public.groups g on g.id = r.group_id
  where r.id = p_request_id and g.owner_id = p_owner_id
  for update of r;

  if not found then
    raise exception using errcode = '42501', message = 'Join request not found or unauthorized';
  end if;
  if p_decision not in ('accepted', 'rejected') then
    raise exception using errcode = '22023', message = 'Invalid join request decision';
  end if;
  if request_row.status <> 'pending' then
    raise exception using errcode = '55000', message = 'Join request has already been reviewed';
  end if;

  if p_decision = 'accepted' then
    insert into public.group_members (group_id, user_id, role)
    values (request_row.group_id, request_row.user_id, 'member')
    on conflict (group_id, user_id) do nothing;
  end if;

  update public.group_join_requests
  set status = p_decision, reviewed_at = now(), reviewed_by = p_owner_id
  where id = request_row.id
  returning * into request_row;
  return request_row;
end;
$$;

revoke all on function public.create_group_join_request(uuid, uuid, text) from public;
revoke all on function public.review_group_join_request(uuid, uuid, text) from public;
grant execute on function public.create_group_join_request(uuid, uuid, text) to service_role;
grant execute on function public.review_group_join_request(uuid, uuid, text) to service_role;

create or replace function public.create_group_with_owner(
  p_name text,
  p_description text,
  p_owner_id uuid
)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  new_group public.groups;
  generated_code text;
begin
  loop
    generated_code := 'COLLAB-' || upper(encode(gen_random_bytes(6), 'hex'));
    exit when not exists (select 1 from public.groups where invite_code = generated_code);
  end loop;

  insert into public.groups (name, description, invite_code, owner_id)
  values (btrim(p_name), coalesce(btrim(p_description), ''), generated_code, p_owner_id)
  returning * into new_group;

  insert into public.group_members (group_id, user_id, role)
  values (new_group.id, p_owner_id, 'owner');

  return new_group;
end;
$$;

revoke all on function public.create_group_with_owner(text, text, uuid) from public;
grant execute on function public.create_group_with_owner(text, text, uuid) to service_role;

create or replace function public.touch_group_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists groups_touch_updated_at on public.groups;
create trigger groups_touch_updated_at
before update on public.groups
for each row execute function public.touch_group_updated_at();

create or replace function public.is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = p_user_id
  );
$$;

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_join_requests enable row level security;

drop policy if exists groups_select_member on public.groups;
create policy groups_select_member on public.groups
for select using (public.is_group_member(id, (select auth.uid())));

drop policy if exists groups_insert_owner on public.groups;
create policy groups_insert_owner on public.groups
for insert with check (owner_id = (select auth.uid()));

drop policy if exists groups_update_owner on public.groups;
create policy groups_update_owner on public.groups
for update using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists groups_delete_owner on public.groups;
create policy groups_delete_owner on public.groups
for delete using (owner_id = (select auth.uid()));

drop policy if exists group_members_select_member on public.group_members;
create policy group_members_select_member on public.group_members
for select using (public.is_group_member(group_id, (select auth.uid())));

drop policy if exists group_members_insert_self on public.group_members;

drop policy if exists group_members_delete_self_or_owner on public.group_members;
create policy group_members_delete_self_or_owner on public.group_members
for delete using (
  (
    user_id = (select auth.uid())
    and not exists (
      select 1 from public.groups g
      where g.id = group_members.group_id and g.owner_id = (select auth.uid())
    )
  )
  or (
    user_id <> (select auth.uid())
    and exists (
    select 1 from public.groups g
    where g.id = group_members.group_id and g.owner_id = (select auth.uid())
    )
  )
);

drop policy if exists group_join_requests_select_owner on public.group_join_requests;
create policy group_join_requests_select_owner on public.group_join_requests
for select using (exists (
  select 1 from public.groups g
  where g.id = group_join_requests.group_id and g.owner_id = (select auth.uid())
));
