-- Production access model for scenes:
-- - owner projects (user_id = auth.uid())
-- - discover projects (is_public = true)
-- Run this in Supabase SQL Editor.

alter table public.scenes
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists is_public boolean not null default false;

-- Backfill visibility from existing JSON config if available.
update public.scenes
set is_public = coalesce((config->>'isPublic')::boolean, false)
where is_public is distinct from coalesce((config->>'isPublic')::boolean, false);

-- Optional backfill owner from old config.ownerId (if present and valid UUID).
update public.scenes
set user_id = nullif(config->>'ownerId', '')::uuid
where user_id is null
  and config ? 'ownerId'
  and (config->>'ownerId') ~* '^[0-9a-f-]{36}$';

create index if not exists scenes_user_id_idx on public.scenes(user_id);
create index if not exists scenes_is_public_idx on public.scenes(is_public);
create index if not exists scenes_updated_at_idx on public.scenes(updated_at desc);

alter table public.scenes enable row level security;

drop policy if exists scenes_select_public_or_owner on public.scenes;
create policy scenes_select_public_or_owner
on public.scenes
for select
to anon, authenticated
using (is_public = true or auth.uid() = user_id);

drop policy if exists scenes_insert_owner on public.scenes;
create policy scenes_insert_owner
on public.scenes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists scenes_update_owner on public.scenes;
create policy scenes_update_owner
on public.scenes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists scenes_delete_owner on public.scenes;
create policy scenes_delete_owner
on public.scenes
for delete
to authenticated
using (auth.uid() = user_id);

-- If you have legacy rows without owner, claim them manually once:
-- update public.scenes
-- set user_id = '<YOUR_AUTH_USER_ID>'
-- where user_id is null;

