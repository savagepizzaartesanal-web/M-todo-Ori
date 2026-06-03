-- Auditoria de seguranca ORI.
-- Rode no Supabase SQL Editor e confira os resultados antes de aplicar hardening.
-- Objetivo: encontrar tabelas sem RLS, policies abertas e grants para anon.

-- 1. Estado de RLS das tabelas publicas do ORI.
select
  n.nspname as schema,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
  and c.relname in (
    'clientes',
    'produto_1_respostas',
    'produto_1_feedbacks',
    'oraculo_cartas_diarias',
    'admin_cliente_eventos'
  )
order by c.relname;

-- 2. Policies ativas nessas tabelas.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'clientes',
    'produto_1_respostas',
    'produto_1_feedbacks',
    'oraculo_cartas_diarias',
    'admin_cliente_eventos'
  )
order by tablename, policyname;

-- 3. Policies potencialmente abertas demais.
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and (
    roles::text ilike '%anon%'
    or qual = 'true'
    or with_check = 'true'
    or coalesce(qual, '') ilike '%1 = 1%'
    or coalesce(with_check, '') ilike '%1 = 1%'
  )
order by tablename, policyname;

-- 4. Grants concedidos para anon/authenticated nas tabelas sensiveis.
select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'clientes',
    'produto_1_respostas',
    'produto_1_feedbacks',
    'oraculo_cartas_diarias',
    'admin_cliente_eventos'
  )
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- 5. Funcoes publicas ligadas a seguranca.
select
  n.nspname as schema,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'current_user_is_ori_admin',
    'prevent_cliente_privilege_escalation'
  )
order by p.proname;

-- 6. Admins atuais. Deve retornar apenas contas intencionalmente administrativas.
select
  id,
  user_id,
  email,
  nome,
  admin,
  created_at
from public.clientes
where admin is true
order by created_at desc;

