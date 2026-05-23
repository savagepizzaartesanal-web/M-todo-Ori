-- Segurança de acesso por cliente no ORI.
-- Rode este SQL no Supabase SQL Editor.
-- Objetivo:
-- 1. cada cliente lê e atualiza apenas a própria linha em public.clientes;
-- 2. admins conseguem ler/alterar todos os clientes;
-- 3. clientes comuns não conseguem se tornar admin nem liberar produtos por conta própria.
-- 4. leads antigos sem user_id podem ser vinculados ao Auth quando o e-mail for o mesmo.

alter table public.clientes
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create unique index if not exists clientes_user_id_unique
  on public.clientes (user_id)
  where user_id is not null;

alter table public.clientes enable row level security;

create or replace function public.current_user_is_ori_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clientes
    where user_id = auth.uid()
      and admin is true
  );
$$;

drop policy if exists "clientes_select_own_or_admin" on public.clientes;
create policy "clientes_select_own_or_admin"
on public.clientes
for select
to authenticated
using (
  user_id = auth.uid()
  or (
    user_id is null
    and lower(email) = lower(auth.jwt() ->> 'email')
  )
  or public.current_user_is_ori_admin()
);

drop policy if exists "clientes_insert_own" on public.clientes;
create policy "clientes_insert_own"
on public.clientes
for insert
to authenticated
with check (
  user_id = auth.uid()
  and coalesce(admin, false) is false
);

drop policy if exists "clientes_update_own_or_admin" on public.clientes;
create policy "clientes_update_own_or_admin"
on public.clientes
for update
to authenticated
using (
  user_id = auth.uid()
  or (
    user_id is null
    and lower(email) = lower(auth.jwt() ->> 'email')
  )
  or public.current_user_is_ori_admin()
)
with check (
  user_id = auth.uid()
  or public.current_user_is_ori_admin()
);

drop policy if exists "clientes_delete_admin_only" on public.clientes;
create policy "clientes_delete_admin_only"
on public.clientes
for delete
to authenticated
using (public.current_user_is_ori_admin());

create or replace function public.prevent_cliente_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_is_ori_admin() then
    return new;
  end if;

  if old.user_id is distinct from new.user_id
    and not (
      old.user_id is null
      and new.user_id = auth.uid()
      and lower(old.email) = lower(auth.jwt() ->> 'email')
    )
  then
    raise exception 'Clientes não podem alterar user_id.';
  end if;

  if old.admin is distinct from new.admin then
    raise exception 'Clientes não podem alterar permissão admin.';
  end if;

  if old.produto_2_liberado is distinct from new.produto_2_liberado then
    raise exception 'Clientes não podem liberar o Produto 2.';
  end if;

  if old.produto_3_liberado is distinct from new.produto_3_liberado then
    raise exception 'Clientes não podem liberar o Produto 3.';
  end if;

  if old.observacoes_admin is distinct from new.observacoes_admin then
    raise exception 'Clientes não podem alterar observações administrativas.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_cliente_privilege_escalation on public.clientes;
create trigger prevent_cliente_privilege_escalation
before update on public.clientes
for each row
execute function public.prevent_cliente_privilege_escalation();
