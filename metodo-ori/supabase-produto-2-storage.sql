-- Storage do Produto 2 / fotos do Dossie ORI.
-- Rode no Supabase SQL Editor antes de testar o upload de fotos no sistema.
-- O bucket fica privado; clientes autenticadas acessam apenas arquivos que enviaram.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'produto-2-fotos',
  'produto-2-fotos',
  false,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "produto_2_fotos_select_own" on storage.objects;
create policy "produto_2_fotos_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'produto-2-fotos'
  and owner = auth.uid()
);

drop policy if exists "produto_2_fotos_insert_own" on storage.objects;
create policy "produto_2_fotos_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'produto-2-fotos'
  and owner = auth.uid()
);

drop policy if exists "produto_2_fotos_update_own" on storage.objects;
create policy "produto_2_fotos_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'produto-2-fotos'
  and owner = auth.uid()
)
with check (
  bucket_id = 'produto-2-fotos'
  and owner = auth.uid()
);

drop policy if exists "produto_2_fotos_delete_own" on storage.objects;
create policy "produto_2_fotos_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'produto-2-fotos'
  and owner = auth.uid()
);
