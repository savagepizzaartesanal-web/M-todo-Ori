# 2. Jornada da cliente ponta a ponta

## 1. Cadastro e acesso

- Onde acontece: `/entrar`, `Login.jsx`.
- Obrigatório: nome, e-mail e senha no cadastro; e-mail e senha no login.
- Opcional: recuperação de senha.
- Regra que desbloqueia próxima etapa:
  - Supabase Auth cria ou valida a sessão.
  - No cadastro, o frontend faz upsert em `public.clientes` com `user_id`, `nome`, `email`, `admin=false`, `produto_1_liberado=true`, `produto_2_liberado=false`, `produto_3_liberado=false`, `status_jornada="Entrada ORI em andamento"`.
  - `ProtectedRoute` permite entrada se houver sessão; se onboarding não estiver concluído, redireciona para `/entrada-ori`.
- Dados reaproveitados:
  - `user_metadata.nome`, `auth.user.email` e linha `clientes` alimentam onboarding e portal.

## 2. Onboarding / Entrada ORI

- Onde acontece: `/entrada-ori`, `OnboardingOri.jsx` + `onboardingOriSteps.js`.
- Obrigatório:
  - Passo `profile`: nome completo, nome preferido, data de nascimento, cidade/estado, WhatsApp.
  - Passo `startingPoint`: momento atual e dor principal.
  - Passo `direction`: desejo principal e autodeclaração racial.
- Opcional:
  - `mainPainCustom`, visível somente quando `mainPain === "Quero escrever com minhas palavras"`.
- Regra que desbloqueia próxima etapa:
  - `canProceed` exige todos os campos required visíveis preenchidos.
  - No passo `done`, o upsert em `clientes` salva `perfil_onboarding`, `perfil_onboarding_concluido=true`, `perfil_onboarding_concluido_em`, `principal_dor`, `objetivo_principal`, `momento_atual`, `status_jornada="Entrada ORI concluída"` e `produto_1_liberado=true`.
  - Depois disso navega para `/portal`.
- Dados reaproveitados:
  - Identidade do Auth e `clientes.nome/email`.
  - O perfil salvo alimenta Produto 2 (`dados_base`, `jornada`) e Mapa Vivo/Espelho.

## 3. Portal / Átrio

- Onde acontece: `/portal`, `PortalCliente.jsx`.
- Obrigatório: sessão autenticada.
- Opcional: consultar oráculo e feedback do Produto 1 se já houver resultado.
- Regra que desbloqueia próxima etapa:
  - Produto 1: liberado se `jornadaApi.produto_1_liberado ?? cliente.produto_1_liberado ?? true`; por padrão é disponível.
  - Produto 2: só aparece liberado se `FEATURES.produto2 === true` e `produto_2_liberado === true`.
  - Produto 3: botão liberado se `produto_3_liberado === true`, mas a rota `/produto-3` em si não bloqueia conteúdo por essa flag.
  - Espelho/Oráculo: considerados ativos quando há `resultadoFinal`.
- Dados reaproveitados:
  - `/api/jornada/me` traz nome, resultado e flags.
  - Supabase `clientes` serve fallback.
  - localStorage do quiz serve fallback para respostas e resultado.
  - Feedback e carta diária evitam pedir ações repetidas.

## 4. Quiz / Código das Deusas

- Onde acontece: `/produto-1`, `/produto-1/leitura`, `/quiz-produto-1`, `QuizProduto1.jsx`.
- Obrigatório:
  - Responder todas as perguntas do Produto 1 antes de revelar resultado.
  - A regra de backend exige que o número de respostas corresponda ao total de perguntas e que cada pergunta seja válida.
- Opcional:
  - Feedback pós-leitura.
  - Reset/refazer leitura.
- Regra que desbloqueia próxima etapa:
  - `completeProduto1(answers)` chama `/api/produto-1/concluir`.
  - Backend salva `produto_1_respostas` com `is_complete=true`, `result`, contagem e total.
  - Backend atualiza `clientes` com `resultado`, `arquetipo_principal`, `arquetipo_secundario`, `status_jornada="Código das Deusas concluído"`, `produto_1_liberado=true`.
  - Se a API falha, o frontend calcula localmente e tenta salvar direto no Supabase; isso mantém a experiência, mas cria duplicação de regra.
- Dados reaproveitados:
  - Respostas do quiz entram em `produto_1_respostas.answers`.
  - Resultado alimenta portal, relatório, espelho, oráculo, Produto 2 e admin.
  - Perfil de onboarding entra na geração personalizada de leitura.

## 5. Resultado e relatório Produto 1

- Onde acontece:
  - Resultado/leitura em `QuizProduto1.jsx`.
  - Relatório em `/produto-1/relatorio`, `Produto1Relatorio.jsx`.
- Obrigatório:
  - Ter Produto 1 completo para relatório. Backend retorna 409 se "A leitura do Produto 1 ainda não está pronta para relatório."
- Opcional:
  - Baixar PDF.
  - Dar feedback.
- Regra que desbloqueia próxima etapa:
  - Resultado existente (`clientes.resultado` ou `produto_1_respostas.result`) ativa Espelho e Oráculo.
  - Produto 2 não é liberado automaticamente pelo resultado; no backend da jornada ele fica `proximo` quando há resultado, mas só vira `disponivel` quando `clientes.produto_2_liberado=true`.
- Dados reaproveitados:
  - `reports` local e `backend/app/data/reports.json` fornecem textos base.
  - IA pode persistir `ai_report` em `produto_1_respostas`; se ausente/falhar, usa fallback determinístico.

## 6. Espelho ORI

- Onde acontece: `/espelho-ori`, `EspelhoOri.jsx`, `/api/mapa-vivo/me`.
- Obrigatório:
  - Sessão autenticada.
  - Para experiência ativa, precisa de resultado do Produto 1.
- Opcional:
  - Antes do resultado, a tela mostra fallback/reflexo em formação.
- Regra que desbloqueia próxima etapa:
  - `jornada_service` marca `espelhoOri="ativo"` somente se `clientes.resultado` existe.
  - `mapa_vivo_service` retorna `status="ativo"` com resultado; sem resultado retorna `status="em_formacao"`.
- Dados reaproveitados:
  - Resultado, arquétipos, onboarding, Produto 2/3 liberados e textos de reports.

## 7. Produto 2 / Dossiê ORI / upload de fotos

- Onde acontece: `/produto-2`, `Produto2.jsx`.
- Obrigatório:
  - Feature flag `VITE_ENABLE_PRODUTO_2=true`.
  - `clientes.produto_2_liberado=true`.
  - Para salvar/enviar: backend chama `ensure_produto2_released`.
  - Para envio final: formulário pode ser enviado com os insumos atuais; o backend gera `analise_preliminar` e status `em_analise`.
- Opcional:
  - Upload de imagens em Supabase Storage, campo `uploads.fotos_validacao`.
  - Salvar rascunho antes de enviar.
- Regra que desbloqueia próxima etapa:
  - Cliente só pode inserir/atualizar linha em `produto_2_dossies` se sua linha `clientes.produto_2_liberado` estiver true.
  - Ao enviar, backend grava `status="em_analise"` e `clientes.status_jornada="Dossiê ORI em análise"`.
  - Cliente não publica; admin publica via `/api/admin/produto-2/{cliente_id}/publicar`, grava `status="publicado"`, `diagnosticos`, `dossie`, `publicado_em`, e status da jornada "Dossiê ORI publicado".
- Dados reaproveitados:
  - Dados base do onboarding: nome, idade calculada, cidade, WhatsApp, e-mail, autodeclaração racial.
  - Resultado Produto 1: deusa principal, auxiliar, arquétipo mesclado.
  - Jornada: momento, dor, objetivo, onboarding concluído.
  - Esses campos são protegidos no merge do backend e sobrescrevem valores enviados pela cliente.

## 8. Oráculo

- Onde acontece: `/oraculo`, `OraculoOri.jsx`, `/api/oraculo/carta-dia`.
- Obrigatório:
  - Sessão autenticada.
  - Para carta plenamente personalizada, resultado do Produto 1.
- Opcional:
  - Sem resultado, as cartas existem em modo selado e orientam a fazer a primeira leitura.
- Regra que desbloqueia próxima etapa:
  - Uma carta por usuário/dia é persistida por `user_id + date_key`.
  - `jornada_service` marca `oraculo="ativo"` se há resultado.
- Dados reaproveitados:
  - Resultado composto, arquétipos principal/secundário e localStorage/API da carta diária.

## 9. Código Final

- Onde acontece: `/produto-3`, `Produto3.jsx`.
- Obrigatório:
  - No portal, botão de acesso só fica habilitado se `produto_3_liberado=true`.
- Opcional:
  - A rota direta ainda não valida a flag; renderiza conteúdo estático de "Código Final ainda não liberado".
- Regra que desbloqueia próxima etapa:
  - Admin alterna `clientes.produto_3_liberado`.
  - `jornada_service` marca `produto3="disponivel"` quando `produto_3_liberado=true`; caso Produto 2 esteja liberado e Produto 3 não, marca `produto3="proximo"`.
- Dados reaproveitados:
  - Hoje a tela não consome dados reais; a intenção de negócio é usar o Dossiê/resultado para aplicação no guarda-roupa, mas isso ainda não está implementado como contrato técnico.
