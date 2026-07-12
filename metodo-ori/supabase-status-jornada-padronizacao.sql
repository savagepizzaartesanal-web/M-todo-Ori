-- Padroniza valores legados de public.clientes.status_jornada
-- e fecha a lista oficial aceita pelo banco.
-- Execute depois do deploy que passa a gravar os status via constantes.

update public.clientes
set status_jornada = case status_jornada
  when 'Produto 1' then 'Código das Deusas liberado'
  when 'Perfil criado' then 'Entrada ORI concluída'
  when 'Perfil ORI criado' then 'Entrada ORI concluída'
  when 'Produto 1 concluído' then 'Código das Deusas concluído'
  when 'Código das Deusas reiniciado' then 'Código das Deusas em andamento'
  when 'Produto 2 liberado' then 'Dossiê ORI liberado'
  when 'Dossiê enviado' then 'Dossiê ORI em análise'
  when 'Produto 3 liberado' then 'Código Final liberado'
  when 'Codigo Final liberado' then 'Código Final liberado'
  when 'Codigo Final em analise' then 'Código Final em análise'
  when 'Codigo Final publicado' then 'Código Final publicado'
  when 'Finalizado' then 'Jornada finalizada'
  else status_jornada
end
where status_jornada in (
  'Produto 1',
  'Perfil criado',
  'Perfil ORI criado',
  'Produto 1 concluído',
  'Código das Deusas reiniciado',
  'Produto 2 liberado',
  'Dossiê enviado',
  'Produto 3 liberado',
  'Codigo Final liberado',
  'Codigo Final em analise',
  'Codigo Final publicado',
  'Finalizado'
);

alter table public.clientes
drop constraint if exists clientes_status_jornada_check;

alter table public.clientes
add constraint clientes_status_jornada_check
check (
  status_jornada is null
  or status_jornada in (
    'Cadastro recebido',
    'Entrada ORI em andamento',
    'Entrada ORI concluída',
    'Código das Deusas liberado',
    'Código das Deusas em andamento',
    'Código das Deusas concluído',
    'Dossiê ORI liberado',
    'Dossiê ORI em preenchimento',
    'Dossiê ORI em análise',
    'Dossiê ORI publicado',
    'Código Final liberado',
    'Código Final em preenchimento',
    'Código Final em análise',
    'Código Final publicado',
    'Jornada finalizada'
  )
);
