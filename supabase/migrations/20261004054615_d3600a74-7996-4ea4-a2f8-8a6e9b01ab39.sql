create or replace function public.revoke_oldest_sessions(_user_id uuid, _keep integer default 2)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  revoked integer;
begin
  -- callers may only trim their own sessions
  if auth.uid() is distinct from _user_id then
    raise exception 'forbidden';
  end if;

  with ranked as (
    select s.id,
           row_number() over (order by s.created_at desc nulls last) as rn
    from auth.sessions s
    where s.user_id = _user_id
      and (s.not_after is null or s.not_after > now())
  ),
  doomed as (
    select id from ranked where rn > _keep
  )
  delete from auth.refresh_tokens rt
  using doomed d
  where rt.session_id = d.id;

  get diagnostics revoked = row_count;
  return revoked;
end;
$$;

revoke all on function public.revoke_oldest_sessions(uuid, integer) from public, anon;
grant execute on function public.revoke_oldest_sessions(uuid, integer) to authenticated;