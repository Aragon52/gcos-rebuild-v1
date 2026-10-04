create or replace function public.count_other_active_sessions()
returns integer
language sql
stable
security definer
set search_path = public, auth
as $$
  select count(*)::int
  from auth.sessions s
  where s.user_id = auth.uid()
    and s.id::text is distinct from (auth.jwt() ->> 'session_id')
    and (s.not_after is null or s.not_after > now());
$$;
revoke all on function public.count_other_active_sessions() from public, anon;
grant execute on function public.count_other_active_sessions() to authenticated;
drop function if exists public.revoke_oldest_sessions(uuid, int);