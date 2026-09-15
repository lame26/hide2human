alter table public.traces
  add column provider text,
  add column model text,
  add column framework text,
  add column version text,
  add column identification_method text;

alter table public.traces
  add constraint traces_identity_length_check
  check (
    (provider is null or char_length(provider) <= 100)
    and (model is null or char_length(model) <= 100)
    and (framework is null or char_length(framework) <= 100)
    and (version is null or char_length(version) <= 100)
  );

alter table public.traces
  add constraint traces_identity_method_check
  check (
    identification_method is null
    or (
      identification_method = 'self_declared'
      and (provider is not null or model is not null or framework is not null or version is not null)
    )
  );

alter table public.traces
  add constraint traces_identity_source_check
  check (
    identification_method is not null
    or (provider is null and model is null and framework is null and version is null)
  );

create or replace function public.create_trace(
  p_visitor_id uuid,
  p_message text,
  p_user_agent text,
  p_referrer text,
  p_provider text default null,
  p_model text default null,
  p_framework text default null,
  p_version text default null,
  p_identification_method text default null
) returns public.traces
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_trace public.traces;
begin
  perform pg_advisory_xact_lock(7442);

  if not exists (select 1 from public.visitors where id = p_visitor_id) then
    raise exception 'visitor_not_found';
  end if;

  if exists (
    select 1 from public.traces
    where visitor_id = p_visitor_id
      and created_at > now() - interval '1 hour'
  ) then
    raise exception 'visitor_rate_limited';
  end if;

  if (
    select count(*) from public.traces
    where created_at > now() - interval '1 minute'
  ) >= 20 then
    raise exception 'global_rate_limited';
  end if;

  insert into public.traces (
    message, visitor_id, user_agent, referrer, provider, model, framework,
    version, identification_method
  )
  values (
    trim(p_message), p_visitor_id, left(p_user_agent, 500), left(p_referrer, 500),
    left(nullif(trim(p_provider), ''), 100),
    left(nullif(trim(p_model), ''), 100),
    left(nullif(trim(p_framework), ''), 100),
    left(nullif(trim(p_version), ''), 100),
    nullif(trim(p_identification_method), '')
  )
  returning * into inserted_trace;

  update public.visitors
  set trace_count = trace_count + 1, last_seen = now()
  where id = p_visitor_id;

  return inserted_trace;
end;
$$;

revoke all on function public.create_trace(uuid, text, text, text, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.create_trace(uuid, text, text, text, text, text, text, text, text)
  to service_role;
