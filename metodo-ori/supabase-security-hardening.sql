-- Hardening conservador de seguranca ORI.
-- Rode somente depois de revisar `supabase-security-audit.sql`.
-- Mantem acesso autenticado e bloqueia acesso anonimo direto as tabelas sensiveis.

alter table public.clientes enable row level security;
alter table public.clientes force row level security;

alter table public.produto_1_respostas enable row level security;
alter table public.produto_1_respostas force row level security;

alter table public.produto_1_feedbacks enable row level security;
alter table public.produto_1_feedbacks force row level security;

alter table public.oraculo_cartas_diarias enable row level security;
alter table public.oraculo_cartas_diarias force row level security;

alter table public.admin_cliente_eventos enable row level security;
alter table public.admin_cliente_eventos force row level security;

revoke all on table public.clientes from anon;
revoke all on table public.produto_1_respostas from anon;
revoke all on table public.produto_1_feedbacks from anon;
revoke all on table public.oraculo_cartas_diarias from anon;
revoke all on table public.admin_cliente_eventos from anon;

grant select, insert, update, delete on table public.clientes to authenticated;
grant select, insert, update, delete on table public.produto_1_respostas to authenticated;
grant select, insert, update, delete on table public.produto_1_feedbacks to authenticated;
grant select, insert, update, delete on table public.oraculo_cartas_diarias to authenticated;
grant select, insert, delete on table public.admin_cliente_eventos to authenticated;

-- Nao permita que clientes comuns alterem privilegios, liberacoes pagas
-- ou observacoes internas. Admins seguem podendo alterar via RLS/admin.
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
    raise exception 'Clientes nao podem alterar user_id.';
  end if;

  if old.admin is distinct from new.admin then
    raise exception 'Clientes nao podem alterar permissao admin.';
  end if;

  if old.produto_2_liberado is distinct from new.produto_2_liberado then
    raise exception 'Clientes nao podem liberar o Produto 2.';
  end if;

  if old.produto_3_liberado is distinct from new.produto_3_liberado then
    raise exception 'Clientes nao podem liberar o Produto 3.';
  end if;

  if old.observacoes_admin is distinct from new.observacoes_admin then
    raise exception 'Clientes nao podem alterar observacoes administrativas.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_cliente_privilege_escalation on public.clientes;
create trigger prevent_cliente_privilege_escalation
before update on public.clientes
for each row
execute function public.prevent_cliente_privilege_escalation();

