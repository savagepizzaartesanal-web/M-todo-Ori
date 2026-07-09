-- Padroniza valores legados de public.clientes.status_jornada.
-- Execute uma vez depois do deploy que passa a gravar a nova nomenclatura.

update public.clientes
set status_jornada = case status_jornada
  when 'Produto 1' then 'Código das Deusas liberado'
  when 'Perfil criado' then 'Perfil ORI criado'
  when 'Produto 1 concluído' then 'Código das Deusas concluído'
  when 'Produto 2 liberado' then 'Dossiê ORI liberado'
  when 'Dossiê enviado' then 'Dossiê ORI publicado'
  when 'Produto 3 liberado' then 'Código Final liberado'
  when 'Finalizado' then 'Jornada finalizada'
  else status_jornada
end
where status_jornada in (
  'Produto 1',
  'Perfil criado',
  'Produto 1 concluído',
  'Produto 2 liberado',
  'Dossiê enviado',
  'Produto 3 liberado',
  'Finalizado'
);
