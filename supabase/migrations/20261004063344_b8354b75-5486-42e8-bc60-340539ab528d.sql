create or replace function public.is_owner(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where id = _user_id and role = 'owner');
$$;

create or replace function public.list_admin_sessions()
returns table (session_id uuid, user_id uuid, email text, role text, ip text, user_agent text,
  created_at timestamptz, last_active_at timestamptz, is_current boolean)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_owner(auth.uid()) then raise exception 'forbidden'; end if;
  return query
  select s.id, s.user_id, u.email::text,
    coalesce(pu.role, case when sa.id is not null then 'admin' when ss.id is not null then 'staff' end)::text,
    host(s.ip)::text, s.user_agent::text, s.created_at,
    coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at),
    (s.id::text = (auth.jwt() ->> 'session_id'))
  from auth.sessions s
  join auth.users u on u.id = s.user_id
  left join public.users pu on pu.id = s.user_id
  left join public.sla_admins sa on sa.id = s.user_id
  left join public.sla_staff ss on ss.id = s.user_id
  where (pu.role in ('owner','admin','staff') or sa.id is not null or ss.id is not null)
    and (s.not_after is null or s.not_after > now())
  order by 8 desc;
end; $$;

create or replace function public.list_admin_login_history(_limit int default 200)
returns table (id uuid, user_id uuid, email text, role text, action text, ip text, created_at timestamptz)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_owner(auth.uid()) then raise exception 'forbidden'; end if;
  return query
  select a.id, u.id, u.email::text,
    coalesce(pu.role, case when sa.id is not null then 'admin' when ss.id is not null then 'staff' end)::text,
    (a.payload ->> 'action')::text, a.ip_address::text, a.created_at
  from auth.audit_log_entries a
  join auth.users u on u.id::text = (a.payload ->> 'actor_id')
  left join public.users pu on pu.id = u.id
  left join public.sla_admins sa on sa.id = u.id
  left join public.sla_staff ss on ss.id = u.id
  where (a.payload ->> 'action') in ('login','logout','user_signedup','token_revoked','user_recovery_requested','user_updated_password')
    and (pu.role in ('owner','admin','staff') or sa.id is not null or ss.id is not null)
  order by a.created_at desc
  limit least(greatest(_limit, 1), 1000);
end; $$;

create or replace function public.revoke_admin_session(_session_id uuid)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_owner(auth.uid()) then raise exception 'forbidden'; end if;
  delete from auth.sessions where id = _session_id;
end; $$;

revoke all on function public.is_owner(uuid) from public, anon;
revoke all on function public.list_admin_sessions() from public, anon;
revoke all on function public.list_admin_login_history(int) from public, anon;
revoke all on function public.revoke_admin_session(uuid) from public, anon;
grant execute on function public.is_owner(uuid) to authenticated;
grant execute on function public.list_admin_sessions() to authenticated;
grant execute on function public.list_admin_login_history(int) to authenticated;
grant execute on function public.revoke_admin_session(uuid) to authenticated;