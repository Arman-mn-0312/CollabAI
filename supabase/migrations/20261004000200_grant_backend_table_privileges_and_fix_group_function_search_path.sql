alter function public.create_group_with_owner(text, text, uuid)
set search_path = public, extensions;

grant select on table
  public.profiles,
  public.groups,
  public.group_members,
  public.group_join_requests,
  public.direct_conversation_participants,
  public.direct_conversations,
  public.direct_messages
to service_role;

grant update on table
  public.groups,
  public.direct_conversations
to service_role;

grant delete on table
  public.groups,
  public.group_members
to service_role;

grant insert on table public.direct_messages to service_role;
