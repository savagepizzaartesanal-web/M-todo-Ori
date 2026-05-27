-- Persistência real das respostas do Produto 1 / Código das Deusas.
-- Rode este SQL no Supabase SQL Editor.
-- Objetivo:
-- 1. salvar as respostas do quiz por cliente;
-- 2. permitir que cada cliente leia e atualize apenas as próprias respostas;
-- 3. permitir que admins ORI consultem todos os registros;
-- 4. preparar a troca do armazenamento local do backend por Supabase/PostgreSQL.

create table if not exists public.produto_1_respostas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  answers jsonb not null default '{}'::jsonb,
  answered_count integer not null default 0,
  total_questions integer not null default 36,
  is_complete boolean not null default false,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists produto_1_respostas_user_id_unique
  on public.produto_1_respostas (user_id);

alter table public.produto_1_respostas enable row level security;

create or replace function public.set_produto_1_respostas_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_produto_1_respostas_updated_at on public.produto_1_respostas;
create trigger set_produto_1_respostas_updated_at
before update on public.produto_1_respostas
for each row
execute function public.set_produto_1_respostas_updated_at();

drop policy if exists "produto_1_respostas_select_own_or_admin" on public.produto_1_respostas;
create policy "produto_1_respostas_select_own_or_admin"
on public.produto_1_respostas
for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_user_is_ori_admin()
);

drop policy if exists "produto_1_respostas_insert_own" on public.produto_1_respostas;
create policy "produto_1_respostas_insert_own"
on public.produto_1_respostas
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "produto_1_respostas_update_own_or_admin" on public.produto_1_respostas;
create policy "produto_1_respostas_update_own_or_admin"
on public.produto_1_respostas
for update
to authenticated
using (
  user_id = auth.uid()
  or public.current_user_is_ori_admin()
)
with check (
  user_id = auth.uid()
  or public.current_user_is_ori_admin()
);

drop policy if exists "produto_1_respostas_delete_admin_only" on public.produto_1_respostas;
create policy "produto_1_respostas_delete_admin_only"
on public.produto_1_respostas
for delete
to authenticated
using (public.current_user_is_ori_admin());
