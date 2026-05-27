-- Persistência real da carta diária do Oráculo.
-- Rode este SQL no Supabase SQL Editor.
-- Objetivo:
-- 1. guardar uma carta por cliente por dia;
-- 2. permitir que cada cliente leia apenas as próprias cartas;
-- 3. permitir que admins ORI consultem todos os registros;
-- 4. manter o Oráculo consistente entre dispositivos.

create table if not exists public.oraculo_cartas_diarias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  date_key date not null,
  card_id text not null,
  card_title text not null,
  reveal_label text not null,
  code text not null,
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists oraculo_cartas_diarias_user_date_unique
  on public.oraculo_cartas_diarias (user_id, date_key);

alter table public.oraculo_cartas_diarias enable row level security;

create or replace function public.set_oraculo_cartas_diarias_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_oraculo_cartas_diarias_updated_at on public.oraculo_cartas_diarias;
create trigger set_oraculo_cartas_diarias_updated_at
before update on public.oraculo_cartas_diarias
for each row
execute function public.set_oraculo_cartas_diarias_updated_at();

drop policy if exists "oraculo_cartas_select_own_or_admin" on public.oraculo_cartas_diarias;
create policy "oraculo_cartas_select_own_or_admin"
on public.oraculo_cartas_diarias
for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_user_is_ori_admin()
);

drop policy if exists "oraculo_cartas_insert_own" on public.oraculo_cartas_diarias;
create policy "oraculo_cartas_insert_own"
on public.oraculo_cartas_diarias
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "oraculo_cartas_update_own_or_admin" on public.oraculo_cartas_diarias;
create policy "oraculo_cartas_update_own_or_admin"
on public.oraculo_cartas_diarias
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

drop policy if exists "oraculo_cartas_delete_admin_only" on public.oraculo_cartas_diarias;
create policy "oraculo_cartas_delete_admin_only"
on public.oraculo_cartas_diarias
for delete
to authenticated
using (public.current_user_is_ori_admin());
