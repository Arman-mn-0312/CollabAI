create or replace function public.send_direct_message(
  p_conversation_id uuid,
  p_sender_id uuid,
  p_content text
)
returns setof public.direct_messages
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.direct_conversation_participants
    where conversation_id = p_conversation_id and user_id = p_sender_id
  ) then
    raise exception using errcode = '42501', message = 'You are not a participant in this conversation';
  end if;

  return query
  insert into public.direct_messages (conversation_id, sender_id, content)
  values (p_conversation_id, p_sender_id, p_content)
  returning id, conversation_id, sender_id, content, created_at, updated_at;
end;
$$;

revoke all on function public.send_direct_message(uuid, uuid, text) from public;
grant execute on function public.send_direct_message(uuid, uuid, text) to service_role;
