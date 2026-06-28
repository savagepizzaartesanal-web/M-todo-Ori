-- Persistencia do Produto 2 / Dossie ORI.
-- Rode este SQL no Supabase SQL Editor antes de habilitar a coleta do Produto 2.
-- O Produto 2 continua protegido pela feature flag do frontend enquanto estiver em construcao.

create table if not exists public.produto_2_dossies (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  status text not null default 'aguardando_insumos',
  insumos jsonb not null default '{}'::jsonb,
  analise_preliminar jsonb not null default '{}'::jsonb,
  diagnosticos jsonb not null default '{}'::jsonb,
  dossie jsonb not null default '{}'::jsonb,
  enviado_em timestamptz,
  publicado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint produto_2_dossies_status_check
    check (status in ('aguardando_insumos', 'em_analise', 'publicado'))
);

create unique index if not exists produto_2_dossies_cliente_unique
  on public.produto_2_dossies (cliente_id);

create index if not exists produto_2_dossies_cliente_status_idx
  on public.produto_2_dossies (cliente_id, status);

alter table public.produto_2_dossies enable row level security;
alter table public.produto_2_dossies force row level security;

create or replace function public.set_produto_2_dossies_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_produto_2_dossies_updated_at on public.produto_2_dossies;
create trigger set_produto_2_dossies_updated_at
before update on public.produto_2_dossies
for each row
execute function public.set_produto_2_dossies_updated_at();

-- Clientes comuns podem preencher/enviar insumos, mas nao podem publicar
-- nem alterar a entrega final. Admins seguem livres via current_user_is_ori_admin().
create or replace function public.prevent_produto_2_client_publication()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_is_ori_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.status = 'publicado' then
      raise exception 'Clientes nao podem publicar o Produto 2.';
    end if;

    if new.diagnosticos <> '{}'::jsonb then
      raise exception 'Clientes nao podem definir diagnosticos do Produto 2.';
    end if;

    if new.dossie <> '{}'::jsonb then
      raise exception 'Clientes nao podem definir o Dossie publicado.';
    end if;

    if new.publicado_em is not null then
      raise exception 'Clientes nao podem definir data de publicacao.';
    end if;

    return new;
  end if;

  if old.cliente_id is distinct from new.cliente_id then
    raise exception 'Clientes nao podem alterar o vinculo do Dossie.';
  end if;

  if old.status = 'publicado' then
    raise exception 'Dossie publicado nao pode ser alterado pela cliente.';
  end if;

  if new.status = 'publicado' then
    raise exception 'Clientes nao podem publicar o Produto 2.';
  end if;

  if old.diagnosticos is distinct from new.diagnosticos then
    raise exception 'Clientes nao podem alterar diagnosticos do Produto 2.';
  end if;

  if old.dossie is distinct from new.dossie then
    raise exception 'Clientes nao podem alterar o Dossie publicado.';
  end if;

  if old.publicado_em is distinct from new.publicado_em then
    raise exception 'Clientes nao podem alterar data de publicacao.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_produto_2_client_publication on public.produto_2_dossies;
create trigger prevent_produto_2_client_publication
before insert or update on public.produto_2_dossies
for each row
execute function public.prevent_produto_2_client_publication();

revoke all on table public.produto_2_dossies from anon;
grant select, insert, update, delete on table public.produto_2_dossies to authenticated;

drop policy if exists "produto_2_dossies_select_own_or_admin" on public.produto_2_dossies;
create policy "produto_2_dossies_select_own_or_admin"
on public.produto_2_dossies
for select
to authenticated
using (
  exists (
    select 1
    from public.clientes c
    where c.id = produto_2_dossies.cliente_id
      and (
        c.user_id = auth.uid()
        or public.current_user_is_ori_admin()
      )
  )
);

drop policy if exists "produto_2_dossies_insert_own_or_admin" on public.produto_2_dossies;
create policy "produto_2_dossies_insert_own_or_admin"
on public.produto_2_dossies
for insert
to authenticated
with check (
  exists (
    select 1
    from public.clientes c
    where c.id = produto_2_dossies.cliente_id
      and (
        (c.user_id = auth.uid() and c.produto_2_liberado is true)
        or public.current_user_is_ori_admin()
      )
  )
);

drop policy if exists "produto_2_dossies_update_own_or_admin" on public.produto_2_dossies;
create policy "produto_2_dossies_update_own_or_admin"
on public.produto_2_dossies
for update
to authenticated
using (
  exists (
    select 1
    from public.clientes c
    where c.id = produto_2_dossies.cliente_id
      and (
        (c.user_id = auth.uid() and c.produto_2_liberado is true)
        or public.current_user_is_ori_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.clientes c
    where c.id = produto_2_dossies.cliente_id
      and (
        (c.user_id = auth.uid() and c.produto_2_liberado is true)
        or public.current_user_is_ori_admin()
      )
  )
);

drop policy if exists "produto_2_dossies_delete_admin_only" on public.produto_2_dossies;
create policy "produto_2_dossies_delete_admin_only"
on public.produto_2_dossies
for delete
to authenticated
using (public.current_user_is_ori_admin());
