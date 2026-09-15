alter table public.traces
  add column author_type text not null default 'VISITOR',
  add column author_user_id uuid references auth.users(id);

alter table public.traces
  add constraint traces_author_type_check
  check (author_type in ('VISITOR', 'HUMAN'));

alter table public.traces
  add constraint traces_author_identity_check
  check (
    (author_type = 'VISITOR' and visitor_id is not null and author_user_id is null)
    or
    (author_type = 'HUMAN' and visitor_id is null and author_user_id is not null)
  );

alter table public.traces
  alter column visitor_id drop not null;

create index traces_author_type_created_at_idx
  on public.traces (author_type, created_at desc);

create index traces_author_user_id_created_at_idx
  on public.traces (author_user_id, created_at desc)
  where author_user_id is not null;

create or replace function public.create_human_trace(
  p_author_user_id uuid,
  p_message text
) returns public.traces
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_trace public.traces;
begin
  perform pg_advisory_xact_lock(7443);

  if not exists (
    select 1 from public.admin_users where user_id = p_author_user_id
  ) then
    raise exception 'administrator_not_found';
  end if;

  if exists (
    select 1 from public.traces
    where author_type = 'HUMAN'
      and author_user_id = p_author_user_id
      and created_at > now() - interval '1 hour'
  ) then
    raise exception 'human_rate_limited';
  end if;

  insert into public.traces (
    message,
    visitor_id,
    author_type,
    author_user_id
  )
  values (trim(p_message), null, 'HUMAN', p_author_user_id)
  returning * into inserted_trace;

  return inserted_trace;
end;
$$;

revoke all on function public.create_human_trace(uuid, text) from public, anon, authenticated;
grant execute on function public.create_human_trace(uuid, text) to service_role;
