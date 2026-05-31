-- Estabilização do piloto ORI.
-- Rode este SQL no Supabase SQL Editor uma única vez.
-- Permite limpar o feedback anterior quando a própria cliente refaz a leitura.

drop policy if exists "produto_1_feedbacks_delete_admin_only" on public.produto_1_feedbacks;
drop policy if exists "produto_1_feedbacks_delete_own_or_admin" on public.produto_1_feedbacks;
create policy "produto_1_feedbacks_delete_own_or_admin"
on public.produto_1_feedbacks
for delete
to authenticated
using (
  user_id = auth.uid()
  or public.current_user_is_ori_admin()
);
