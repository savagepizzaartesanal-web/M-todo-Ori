-- Diagnóstico do Mapa Vivo ORI
-- Troque o e-mail abaixo pelo e-mail da cliente logada que está vendo o Espelho.

select
  id,
  email,
  user_id,
  perfil_onboarding_concluido,
  principal_dor,
  objetivo_principal,
  momento_atual,
  perfil_onboarding ->> 'mainPain' as onboarding_main_pain,
  perfil_onboarding ->> 'mainPainCustom' as onboarding_main_pain_custom,
  perfil_onboarding ->> 'mainDesire' as onboarding_main_desire,
  perfil_onboarding ->> 'journeyStage' as onboarding_journey_stage,
  perfil_onboarding
from public.clientes
where lower(email) = lower('COLOQUE_O_EMAIL_DA_CLIENTE_AQUI');
