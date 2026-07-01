-- Persistência da leitura editorial gerada por IA para o Código das Deusas.
-- Rode este SQL uma vez no Supabase SQL Editor.

alter table public.produto_1_respostas
  add column if not exists ai_report jsonb,
  add column if not exists ai_report_key text,
  add column if not exists ai_report_generated_at timestamptz;

comment on column public.produto_1_respostas.ai_report is
  'Versão editorial completa da leitura arquetípica gerada pela IA.';

comment on column public.produto_1_respostas.ai_report_key is
  'Hash das respostas, perfil, textos-base e versão editorial usados na geração.';

comment on column public.produto_1_respostas.ai_report_generated_at is
  'Data da última geração editorial persistida.';
