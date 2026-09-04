create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create table public.opengym_users (
  id text primary key,
  name text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  disabled boolean not null default false,
  admin boolean not null default false,
  session_version integer not null default 0,
  invited_by text,
  last_reminder date
);

create table public.opengym_credentials (
  id text primary key,
  user_id text not null references public.opengym_users(id) on delete cascade,
  public_key text not null,
  counter bigint not null default 0,
  transports jsonb not null default '[]'::jsonb
);

create table public.opengym_states (
  user_id text primary key references public.opengym_users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.opengym_push_subscriptions (
  endpoint text primary key,
  user_id text not null references public.opengym_users(id) on delete cascade,
  keys jsonb not null,
  created_at timestamptz not null default now()
);
create index opengym_push_subscriptions_user_id_idx on public.opengym_push_subscriptions(user_id);

create table public.opengym_invites (
  code text primary key,
  note text not null default '',
  created_by text references public.opengym_users(id) on delete set null,
  created_at timestamptz not null default now(),
  used_by text references public.opengym_users(id) on delete set null,
  used_at timestamptz,
  revoked boolean not null default false
);

create table public.opengym_challenges (
  id text primary key,
  payload jsonb not null,
  expires_at timestamptz not null
);
create index opengym_challenges_expires_at_idx on public.opengym_challenges(expires_at);

create table public.opengym_presence (
  user_id text primary key references public.opengym_users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.opengym_rest_timers (
  user_id text primary key references public.opengym_users(id) on delete cascade,
  due_at timestamptz not null
);
create index opengym_rest_timers_due_at_idx on public.opengym_rest_timers(due_at);

create table public.opengym_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.opengym_users enable row level security;
alter table public.opengym_credentials enable row level security;
alter table public.opengym_states enable row level security;
alter table public.opengym_push_subscriptions enable row level security;
alter table public.opengym_invites enable row level security;
alter table public.opengym_challenges enable row level security;
alter table public.opengym_presence enable row level security;
alter table public.opengym_rest_timers enable row level security;
alter table public.opengym_config enable row level security;

revoke all on public.opengym_users from anon, authenticated;
revoke all on public.opengym_credentials from anon, authenticated;
revoke all on public.opengym_states from anon, authenticated;
revoke all on public.opengym_push_subscriptions from anon, authenticated;
revoke all on public.opengym_invites from anon, authenticated;
revoke all on public.opengym_challenges from anon, authenticated;
revoke all on public.opengym_presence from anon, authenticated;
revoke all on public.opengym_rest_timers from anon, authenticated;
revoke all on public.opengym_config from anon, authenticated;

create or replace function public.opengym_take_challenge(p_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  delete from public.opengym_challenges
  where id = p_id and expires_at >= now()
  returning payload into result;
  return result;
end;
$$;

create or replace function public.opengym_register_user(
  p_user jsonb,
  p_credential jsonb,
  p_invite_code text,
  p_invite_only boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.opengym_invites%rowtype;
  user_row public.opengym_users%rowtype;
begin
  if exists (select 1 from public.opengym_credentials where id = p_credential->>'id') then
    return jsonb_build_object('error', 'credential_exists');
  end if;

  if p_invite_only then
    select * into invite_row
    from public.opengym_invites
    where code = p_invite_code and not revoked and used_by is null
    for update;
    if not found then return jsonb_build_object('error', 'invite_invalid'); end if;
  end if;

  insert into public.opengym_users (id, name, created_at, invited_by)
  values (
    p_user->>'id',
    p_user->>'name',
    coalesce((p_user->>'created')::timestamptz, now()),
    case when p_invite_only then p_invite_code else null end
  )
  returning * into user_row;

  insert into public.opengym_credentials (id, user_id, public_key, counter, transports)
  values (
    p_credential->>'id',
    p_credential->>'userId',
    p_credential->>'publicKey',
    coalesce((p_credential->>'counter')::bigint, 0),
    coalesce(p_credential->'transports', '[]'::jsonb)
  );

  if p_invite_only then
    update public.opengym_invites
    set used_by = user_row.id, used_at = user_row.created_at
    where code = p_invite_code;
  end if;

  return jsonb_build_object('user', to_jsonb(user_row));
exception
  when unique_violation then
    return jsonb_build_object('error', 'credential_exists');
end;
$$;

create or replace function public.opengym_bump_session_version(p_user_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  user_row public.opengym_users%rowtype;
begin
  update public.opengym_users
  set session_version = session_version + 1
  where id = p_user_id
  returning * into user_row;
  return case when user_row.id is null then null else to_jsonb(user_row) end;
end;
$$;

create or replace function public.opengym_claim_due_rest_timers(p_now timestamptz)
returns table(user_id text)
language sql
security definer
set search_path = public
as $$
  delete from public.opengym_rest_timers
  where due_at <= p_now
  returning opengym_rest_timers.user_id;
$$;

revoke all on function public.opengym_take_challenge(text) from public, anon, authenticated;
revoke all on function public.opengym_register_user(jsonb, jsonb, text, boolean) from public, anon, authenticated;
revoke all on function public.opengym_bump_session_version(text) from public, anon, authenticated;
revoke all on function public.opengym_claim_due_rest_timers(timestamptz) from public, anon, authenticated;
grant execute on function public.opengym_take_challenge(text) to service_role;
grant execute on function public.opengym_register_user(jsonb, jsonb, text, boolean) to service_role;
grant execute on function public.opengym_bump_session_version(text) to service_role;
grant execute on function public.opengym_claim_due_rest_timers(timestamptz) to service_role;
