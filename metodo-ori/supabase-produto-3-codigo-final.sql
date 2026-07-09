-- Persistencia do Produto 3 / Codigo Final.
-- Rode este SQL no Supabase SQL Editor antes de habilitar a coleta do Produto 3.
-- O Produto 3 permanece protegido por liberacao individual da cliente.

alter table public.clientes
add column if not exists produto_3_liberado boolean not null default false;

create table if not exists public.produto_3_codigos_finais (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  status text not null default 'aguardando_inventario',
  insumos jsonb not null default '{}'::jsonb,
  analise_preliminar jsonb not null default '{}'::jsonb,
  diagnosticos jsonb not null default '{}'::jsonb,
  capsula jsonb not null default '{}'::jsonb,
  ia_rascunho jsonb not null default '{}'::jsonb,
  ia_versao text,
  ia_gerado_em timestamptz,
  ia_revisado_em timestamptz,
  enviado_em timestamptz,
  publicado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint produto_3_codigos_finais_status_check
    check (status in ('aguardando_inventario', 'em_analise', 'publicado'))
);

create unique index if not exists produto_3_codigos_finais_cliente_unique
  on public.produto_3_codigos_finais (cliente_id);

create index if not exists produto_3_codigos_finais_cliente_status_idx
  on public.produto_3_codigos_finais (cliente_id, status);

alter table public.produto_3_codigos_finais enable row level security;
alter table public.produto_3_codigos_finais force row level security;

create or replace function public.set_produto_3_codigos_finais_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_produto_3_codigos_finais_updated_at on public.produto_3_codigos_finais;
create trigger set_produto_3_codigos_finais_updated_at
before update on public.produto_3_codigos_finais
for each row
execute function public.set_produto_3_codigos_finais_updated_at();

create or replace function public.prevent_produto_3_client_publication()
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
      raise exception 'Clientes nao podem publicar o Produto 3.';
    end if;

    if new.diagnosticos <> '{}'::jsonb then
      raise exception 'Clientes nao podem definir diagnosticos do Produto 3.';
    end if;

    if new.capsula <> '{}'::jsonb then
      raise exception 'Clientes nao podem definir a capsula publicada.';
    end if;

    if new.ia_rascunho <> '{}'::jsonb
      or new.ia_versao is not null
      or new.ia_gerado_em is not null
      or new.ia_revisado_em is not null then
      raise exception 'Clientes nao podem definir rascunho tecnico do Produto 3.';
    end if;

    if new.publicado_em is not null then
      raise exception 'Clientes nao podem definir data de publicacao.';
    end if;

    return new;
  end if;

  if old.cliente_id is distinct from new.cliente_id then
    raise exception 'Clientes nao podem alterar o vinculo do Codigo Final.';
  end if;

  if old.status = 'publicado' then
    raise exception 'Codigo Final publicado nao pode ser alterado pela cliente.';
  end if;

  if new.status = 'publicado' then
    raise exception 'Clientes nao podem publicar o Produto 3.';
  end if;

  if old.diagnosticos is distinct from new.diagnosticos then
    raise exception 'Clientes nao podem alterar diagnosticos do Produto 3.';
  end if;

  if old.capsula is distinct from new.capsula then
    raise exception 'Clientes nao podem alterar a capsula publicada.';
  end if;

  if old.ia_rascunho is distinct from new.ia_rascunho
    or old.ia_versao is distinct from new.ia_versao
    or old.ia_gerado_em is distinct from new.ia_gerado_em
    or old.ia_revisado_em is distinct from new.ia_revisado_em then
    raise exception 'Clientes nao podem alterar rascunho tecnico do Produto 3.';
  end if;

  if old.publicado_em is distinct from new.publicado_em then
    raise exception 'Clientes nao podem alterar data de publicacao.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_produto_3_client_publication on public.produto_3_codigos_finais;
create trigger prevent_produto_3_client_publication
before insert or update on public.produto_3_codigos_finais
for each row
execute function public.prevent_produto_3_client_publication();

revoke all on table public.produto_3_codigos_finais from anon;
grant select, insert, update, delete on table public.produto_3_codigos_finais to authenticated;

drop policy if exists "produto_3_codigos_finais_select_own_or_admin" on public.produto_3_codigos_finais;
create policy "produto_3_codigos_finais_select_own_or_admin"
on public.produto_3_codigos_finais
for select
to authenticated
using (
  exists (
    select 1
    from public.clientes c
    where c.id = produto_3_codigos_finais.cliente_id
      and (
        c.user_id = auth.uid()
        or public.current_user_is_ori_admin()
      )
  )
);

drop policy if exists "produto_3_codigos_finais_insert_own_or_admin" on public.produto_3_codigos_finais;
create policy "produto_3_codigos_finais_insert_own_or_admin"
on public.produto_3_codigos_finais
for insert
to authenticated
with check (
  exists (
    select 1
    from public.clientes c
    where c.id = produto_3_codigos_finais.cliente_id
      and (
        (c.user_id = auth.uid() and c.produto_3_liberado is true)
        or public.current_user_is_ori_admin()
      )
  )
);

drop policy if exists "produto_3_codigos_finais_update_own_or_admin" on public.produto_3_codigos_finais;
create policy "produto_3_codigos_finais_update_own_or_admin"
on public.produto_3_codigos_finais
for update
to authenticated
using (
  exists (
    select 1
    from public.clientes c
    where c.id = produto_3_codigos_finais.cliente_id
      and (
        (c.user_id = auth.uid() and c.produto_3_liberado is true)
        or public.current_user_is_ori_admin()
      )
  )
)
with check (
  exists (
    select 1
    from public.clientes c
    where c.id = produto_3_codigos_finais.cliente_id
      and (
        (c.user_id = auth.uid() and c.produto_3_liberado is true)
        or public.current_user_is_ori_admin()
      )
  )
);

drop policy if exists "produto_3_codigos_finais_delete_admin_only" on public.produto_3_codigos_finais;
create policy "produto_3_codigos_finais_delete_admin_only"
on public.produto_3_codigos_finais
for delete
to authenticated
using (public.current_user_is_ori_admin());

