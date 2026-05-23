-- Mapa Vivo ORI
-- Rode este SQL no Supabase SQL Editor.
-- Objetivo:
-- 1. criar campos diretos para dados vivos da jornada;
-- 2. preencher esses campos a partir do perfil_onboarding já salvo;
-- 3. manter Produto 1, Produto 2 e Produto 3 lendo a mesma fonte estável.

alter table public.clientes
  add column if not exists principal_dor text,
  add column if not exists objetivo_principal text,
  add column if not exists momento_atual text;

update public.clientes
set
  principal_dor = coalesce(
    nullif(principal_dor, ''),
    nullif(perfil_onboarding ->> 'mainPainCustom', ''),
    nullif(perfil_onboarding ->> 'mainPain', '')
  ),
  objetivo_principal = coalesce(
    nullif(objetivo_principal, ''),
    nullif(perfil_onboarding ->> 'mainDesire', '')
  ),
  momento_atual = coalesce(
    nullif(momento_atual, ''),
    nullif(perfil_onboarding ->> 'journeyStage', '')
  )
where perfil_onboarding is not null;
