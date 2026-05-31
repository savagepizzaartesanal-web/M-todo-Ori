-- Histórico operacional da ficha administrativa.
-- Rode este SQL no Supabase SQL Editor.
-- Registra ações feitas pelo admin sem expor esse histórico para clientes.

create table if not exists public.admin_cliente_eventos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  label text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_cliente_eventos_cliente_created_idx
  on public.admin_cliente_eventos (cliente_id, created_at desc);

alter table public.admin_cliente_eventos enable row level security;

drop policy if exists "admin_cliente_eventos_select_admin_only" on public.admin_cliente_eventos;
create policy "admin_cliente_eventos_select_admin_only"
on public.admin_cliente_eventos
for select
to authenticated
using (public.current_user_is_ori_admin());

drop policy if exists "admin_cliente_eventos_insert_admin_only" on public.admin_cliente_eventos;
create policy "admin_cliente_eventos_insert_admin_only"
on public.admin_cliente_eventos
for insert
to authenticated
with check (
  public.current_user_is_ori_admin()
  and admin_user_id = auth.uid()
);

drop policy if exists "admin_cliente_eventos_delete_admin_only" on public.admin_cliente_eventos;
create policy "admin_cliente_eventos_delete_admin_only"
on public.admin_cliente_eventos
for delete
to authenticated
using (public.current_user_is_ori_admin());
