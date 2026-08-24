-- Produto 1 anonymous structured micro-survey.
-- Apply manually after review. Do not grant direct public/anon table writes.

create table if not exists public.produto_1_micro_surveys (
  id uuid primary key default gen_random_uuid(),
  recognition text not null,
  clarity_loss_location text not null,
  needed_help text not null,
  expectation_fit text not null,
  created_at timestamptz not null default now(),

  constraint produto_1_micro_surveys_recognition_check
    check (recognition in ('muito', 'em_parte', 'pouco')),
  constraint produto_1_micro_surveys_clarity_loss_location_check
    check (
      clarity_loss_location in (
        'reconhecimento',
        'essencia_base_interna',
        'dinamica',
        'vida_real',
        'imagem_na_pratica',
        'sintese_final',
        'relatorio_pdf',
        'antes_da_leitura',
        'transicao_dossie_ori',
        'nao_sei'
      )
    ),
  constraint produto_1_micro_surveys_needed_help_check
    check (
      needed_help in (
        'exemplo_concreto',
        'proximo_passo_simples',
        'menos_linguagem_simbolica',
        'mais_ligacao_com_minhas_respostas',
        'explicacao_melhor_gratuita_completa',
        'outro'
      )
    ),
  constraint produto_1_micro_surveys_expectation_fit_check
    check (
      expectation_fit in (
        'sim',
        'em_parte',
        'nao',
        'nao_sabia_o_que_esperar'
      )
    )
);

alter table public.produto_1_micro_surveys enable row level security;
alter table public.produto_1_micro_surveys force row level security;

revoke all on public.produto_1_micro_surveys from anon;
revoke all on public.produto_1_micro_surveys from authenticated;

-- No anon/authenticated INSERT policy is created intentionally.
-- The backend inserts server-side with the Supabase service role key.
