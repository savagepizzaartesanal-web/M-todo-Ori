alter table public.clientes
  add column if not exists perfil_onboarding jsonb,
  add column if not exists perfil_onboarding_concluido boolean not null default false,
  add column if not exists perfil_onboarding_concluido_em timestamptz;
