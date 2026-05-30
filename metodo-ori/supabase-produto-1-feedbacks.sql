-- Feedback pós-leitura do Produto 1.
-- Rode este SQL no Supabase SQL Editor.
-- Objetivo:
-- 1. registrar se a leitura fez sentido para a cliente;
-- 2. permitir que a cliente atualize o próprio feedback;
-- 3. permitir que admins ORI consultem todos os feedbacks;
-- 4. transformar o protótipo em aprendizado real antes do Produto 2.

create table if not exists public.produto_1_feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  context text not null default 'produto-1-leitura',
  response text not null,
  comment text,
  resultado text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists produto_1_feedbacks_user_context_unique
  on public.produto_1_feedbacks (user_id, context);

alter table public.produto_1_feedbacks enable row level security;

create or replace function public.set_produto_1_feedbacks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_produto_1_feedbacks_updated_at on public.produto_1_feedbacks;
create trigger set_produto_1_feedbacks_updated_at
before update on public.produto_1_feedbacks
for each row
execute function public.set_produto_1_feedbacks_updated_at();

drop policy if exists "produto_1_feedbacks_select_own_or_admin" on public.produto_1_feedbacks;
create policy "produto_1_feedbacks_select_own_or_admin"
on public.produto_1_feedbacks
for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_user_is_ori_admin()
);

drop policy if exists "produto_1_feedbacks_insert_own" on public.produto_1_feedbacks;
create policy "produto_1_feedbacks_insert_own"
on public.produto_1_feedbacks
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "produto_1_feedbacks_update_own_or_admin" on public.produto_1_feedbacks;
create policy "produto_1_feedbacks_update_own_or_admin"
on public.produto_1_feedbacks
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

drop policy if exists "produto_1_feedbacks_delete_admin_only" on public.produto_1_feedbacks;
create policy "produto_1_feedbacks_delete_admin_only"
on public.produto_1_feedbacks
for delete
to authenticated
using (public.current_user_is_ori_admin());
