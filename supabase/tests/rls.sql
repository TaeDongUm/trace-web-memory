-- Run in a development Supabase SQL Editor after the migration. All fixtures roll back.
begin;
insert into auth.users (id) values ('00000000-0000-4000-8000-000000000001'), ('00000000-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
insert into public.memories (id, url, title) values ('10000000-0000-4000-8000-000000000001', 'https://example.com/a', 'A');
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
insert into public.memories (id, url, title) values ('10000000-0000-4000-8000-000000000002', 'https://example.com/b', 'B');
do $$
declare affected integer;
begin
  if exists(select 1 from public.memories where id = '10000000-0000-4000-8000-000000000001') then raise exception 'FAIL: cross-user read'; end if;
  update public.memories set title = 'stolen' where id = '10000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'FAIL: cross-user update'; end if;
  delete from public.memories where id = '10000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'FAIL: cross-user delete'; end if;
  begin
    insert into public.memories (user_id, url, title) values ('00000000-0000-4000-8000-000000000001', 'https://example.com/spoof', 'spoof');
    raise exception 'FAIL: spoofed insert';
  exception when insufficient_privilege then null; end;
  begin
    update public.memories set user_id = '00000000-0000-4000-8000-000000000001' where id = '10000000-0000-4000-8000-000000000002';
    raise exception 'FAIL: ownership transfer';
  exception when insufficient_privilege then null; end;
  update public.memories set title = 'B updated' where id = '10000000-0000-4000-8000-000000000002';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'FAIL: own update'; end if;
  delete from public.memories where id = '10000000-0000-4000-8000-000000000002';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'FAIL: own delete'; end if;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
do $$ begin
  if not exists(select 1 from public.memories where id = '10000000-0000-4000-8000-000000000001' and title = 'A') then raise exception 'FAIL: A record changed'; end if;
end $$;
set local role anon;
do $$ begin
  begin
    perform 1 from public.memories;
    raise exception 'FAIL: anonymous read';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
