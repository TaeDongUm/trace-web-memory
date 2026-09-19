begin;
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  url text not null check (length(url) between 1 and 2048 and url ~ '^https://'),
  title text not null check (length(btrim(title)) between 1 and 500),
  summary text check (length(summary) <= 4000),
  content text check (length(content) <= 12000),
  image_url text check (length(image_url) <= 2048 and image_url ~ '^https://'),
  source text check (length(source) <= 255),
  category text check (length(category) <= 50),
  tags text[] not null default '{}' check (cardinality(tags) <= 30 and octet_length(tags::text) <= 4000),
  visited_at timestamptz,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}' check (jsonb_typeof(metadata) = 'object' and octet_length(metadata::text) <= 8000)
);
create index memories_owner_created on public.memories(user_id, created_at desc);
alter table public.memories enable row level security;
alter table public.memories force row level security;
revoke all on public.memories from public, anon, authenticated;
grant select, insert, update, delete on public.memories to authenticated;
create policy memories_read on public.memories for select to authenticated using ((select auth.uid()) = user_id);
create policy memories_insert on public.memories for insert to authenticated with check ((select auth.uid()) = user_id);
create policy memories_update on public.memories for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy memories_delete on public.memories for delete to authenticated using ((select auth.uid()) = user_id);
commit;
