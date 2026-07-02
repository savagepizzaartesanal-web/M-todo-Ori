-- Fundação de IA revisável do Produto 2 / Dossiê ORI.
-- Rode este SQL no Supabase antes de usar a geração de rascunho no admin.

alter table public.produto_2_dossies
  add column if not exists ia_rascunho jsonb not null default '{}'::jsonb,
  add column if not exists ia_versao text,
  add column if not exists ia_gerado_em timestamptz,
  add column if not exists ia_revisado_em timestamptz;

comment on column public.produto_2_dossies.ia_rascunho is
  'Rascunho interno gerado por IA; nunca é exposto à cliente antes da publicação.';

comment on column public.produto_2_dossies.ia_versao is
  'Versão das regras editoriais usadas para gerar o rascunho.';

comment on column public.produto_2_dossies.ia_gerado_em is
  'Data da geração mais recente do rascunho interno.';

comment on column public.produto_2_dossies.ia_revisado_em is
  'Data em que o conteúdo foi revisado no fluxo administrativo.';

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
    if new.diagnosticos <> '{}'::jsonb or new.dossie <> '{}'::jsonb then
      raise exception 'Clientes nao podem definir a entrega do Produto 2.';
    end if;
    if new.ia_rascunho <> '{}'::jsonb or new.ia_versao is not null
       or new.ia_gerado_em is not null or new.ia_revisado_em is not null then
      raise exception 'Clientes nao podem definir o rascunho interno do Produto 2.';
    end if;
    if new.publicado_em is not null then
      raise exception 'Clientes nao podem definir data de publicacao.';
    end if;
    return new;
  end if;

  if old.cliente_id is distinct from new.cliente_id then
    raise exception 'Clientes nao podem alterar o vinculo do Dossie.';
  end if;
  if old.status = 'publicado' or new.status = 'publicado' then
    raise exception 'Clientes nao podem alterar ou publicar um Dossie publicado.';
  end if;
  if old.diagnosticos is distinct from new.diagnosticos
     or old.dossie is distinct from new.dossie
     or old.publicado_em is distinct from new.publicado_em then
    raise exception 'Clientes nao podem alterar a entrega do Produto 2.';
  end if;
  if old.ia_rascunho is distinct from new.ia_rascunho
     or old.ia_versao is distinct from new.ia_versao
     or old.ia_gerado_em is distinct from new.ia_gerado_em
     or old.ia_revisado_em is distinct from new.ia_revisado_em then
    raise exception 'Clientes nao podem alterar o rascunho interno do Produto 2.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_produto_2_client_publication
  on public.produto_2_dossies;
create trigger prevent_produto_2_client_publication
before insert or update on public.produto_2_dossies
for each row
execute function public.prevent_produto_2_client_publication();
