# 1. Mapa de rotas e páginas

Fonte principal: `metodo-ori/src/App.jsx`. Quase todas as rotas são protegidas por `ProtectedRoute`; admin também passa por `AdminRoute`. O fallback global de lazy loading mostra "Abrindo sua jornada...".

## Rotas públicas

### `/entrar`

- Arquivo: `src/pages/Login.jsx`.
- Público: cliente e admin antes de autenticar.
- Jornada: primeiro acesso, cadastro, login e recuperação de senha.
- Estados:
  - Login: `modo === "login"`, exige e-mail válido e senha não vazia.
  - Cadastro: `modo === "cadastro"`, exige nome, e-mail válido e senha com 6+ caracteres.
  - Recuperação: `recoveryEmail` preenchido abre confirmação de envio.
  - Carregando: `loading` nos submits; `resetLoading` no envio do link.
  - Erro visível: `erro`, sempre convertido em mensagens humanas para login/cadastro/reset.
  - Sucesso visível: `mensagem`, usada em cadastro sem sessão e recuperação de senha.

### `/redefinir-senha`

- Arquivo: `src/pages/RedefinirSenha.jsx`.
- Público: cliente/admin com sessão de recovery do Supabase.
- Jornada: depois do link de redefinição de senha.
- Estados:
  - Formulário: senha e confirmação.
  - Bloqueio de validação local: senha menor que 6 caracteres ou confirmação diferente.
  - Carregando: `loading`, botão mostra "Salvando...".
  - Erro visível: mensagem humana genérica se `supabase.auth.updateUser` falhar.
  - Sucesso: mensagem de senha salva e navegação para `/portal`.

## Rotas cliente protegidas

### `/entrada-ori`

- Arquivos: `src/pages/OnboardingOri.jsx`, `src/data/onboardingOriSteps.js`, componentes em `src/components/onboarding/*`.
- Público: cliente autenticada que ainda não concluiu onboarding; admin é redirecionado ao portal/admin conforme `ProtectedRoute`.
- Jornada: logo após cadastro/login quando `clientes.perfil_onboarding_concluido` não é verdadeiro e não há marcador local de onboarding concluído.
- Estados:
  - Formulário em passos: `stepIndex` percorre `profile`, `startingPoint`, `direction`, `done`.
  - Bloqueado para avançar: `canProceed === false` quando campos required visíveis estão vazios.
  - Sucesso: `step.type === "success"` salva `perfil_onboarding`, `perfil_onboarding_concluido`, dor, objetivo, momento e `produto_1_liberado`.
  - Erro visível: `alert("Não consegui salvar seu perfil agora...")` se o upsert em `clientes` falha.
  - Persistência temporária: localStorage por usuário (`ori_onboarding_data:{id/email}`).

### `/portal`

- Arquivos: `src/pages/PortalCliente.jsx`, `src/layouts/DashboardLayout.jsx`, `src/components/Sidebar.jsx`.
- Público: cliente autenticada; admin também pode ver, mas `ProtectedRoute` redireciona admin que tenta onboarding para `/portal`.
- Jornada: hub principal após onboarding.
- Estados:
  - Carregando: `loadingCliente`, mostra "Carregando Átrio" e "Preparando seu Átrio ORI...".
  - Sem sessão: zera cliente, quiz, jornada, feedback e oráculo.
  - Sem linha em `clientes`: tenta criar perfil mínimo via Supabase.
  - Sync parcial: se `/api/jornada/me` falha, mostra `SyncNotice` e usa Supabase/localStorage.
  - Produto 1 disponível/em andamento/concluído: calculado por `resultadoFinal`, respostas locais e `produto_1_liberado`.
  - Produto 2 liberado/bloqueado: `FEATURES.produto2 && produto_2_liberado`.
  - Produto 3 liberado/bloqueado: `produto_3_liberado`.
  - Próximo movimento: onboarding pendente, iniciar/continuar Produto 1, pedir retorno da leitura ou tirar carta diária.

### `/`

- Arquivo: `src/pages/Dashboard.jsx`.
- Público: cliente autenticada.
- Jornada: rota legada/atrio anterior, baseada somente em localStorage `ori_produto_1_quiz`.
- Estados:
  - Produto 1 disponível: sem respostas e sem resultado.
  - Em andamento: respostas locais existem, sem resultado.
  - Pronto: resultado local existe.
  - Observação: não usa `/api/jornada/me`; pode divergir do portal novo.

### `/produto-1`

- Arquivo: `src/pages/QuizProduto1.jsx`.
- Público: cliente autenticada dentro de `DashboardLayout`.
- Jornada: Código das Deusas, primeira leitura.
- Estados:
  - Carregamento inicial: busca sessão, respostas API, cliente Supabase, feedback salvo e storage.
  - Quiz inicial: `showQuiz && !result`, respostas em andamento.
  - Bloqueio de conclusão: `alert("Responda todos os sinais...")` se respostas incompletas.
  - Processamento/revelação: `isLoadingResult`, componente `LoadingDossie`, mensagens rotativas.
  - Resultado/leitura: `result` definido.
  - Leitura profunda: `isDeepReadingOpen`.
  - Feedback: `resultReadingCompleted`, `feedbackSubmitted`, `feedbackSaving`, `feedbackMessage`.
  - Sync parcial: `syncNotice` quando API falha e fluxo cai para Supabase/localStorage.
  - Reset: `isResettingQuiz`; pode usar API e fallback Supabase direto.

### `/produto-1/leitura`

- Arquivo: `src/pages/QuizProduto1.jsx`.
- Público: cliente autenticada.
- Jornada: alias direto para leitura/resultado do Produto 1, sem `DashboardLayout`.
- Estados: mesmos de `/produto-1`; `isReadingStandalone` muda navegação/apresentação.

### `/quiz-produto-1`

- Arquivo: `src/pages/QuizProduto1.jsx`.
- Público: cliente autenticada.
- Jornada: alias legado.
- Estados: mesmos de `/produto-1`; `isLegacyQuizRoute` é verdadeiro.

### `/produto-1/relatorio`

- Arquivo: `src/pages/Produto1Relatorio.jsx`; componentes em `src/components/report/*`.
- Público: cliente autenticada.
- Jornada: relatório consolidado do Código das Deusas depois do Produto 1 pronto.
- Estados:
  - Carregando: `loading`, mostra "Preparando sua leitura...".
  - Completo: `report` vindo de `/api/produto-1/relatorio/me`.
  - Indisponível: se API retorna erro, `SyncNotice` humano e link para `/produto-1/leitura`.
  - Download PDF: `downloadingPdf`, botão "Preparando PDF..." e aviso de preparação.

### `/metodo-ori`

- Arquivo: `src/pages/MetodoOri.jsx`.
- Público: cliente autenticada.
- Jornada: página explicativa do método, acessível antes ou depois das leituras.
- Estados: essencialmente estático; não depende de API ou regra de liberação.

### `/espelho-ori`

- Arquivo: `src/pages/EspelhoOri.jsx`; componentes em `src/components/espelho/*`.
- Público: cliente autenticada.
- Jornada: espelho vivo depois do Produto 1; antes do resultado mostra fallback selado/em formação.
- Estados:
  - Carregando: `loading`, mostra "Preparando seu reflexo...".
  - Sync parcial: se `/api/jornada/me` ou `/api/mapa-vivo/me` falha, `SyncNotice` e fallback Supabase/localStorage.
  - Selado/em formação: sem `resultadoFinal`; usa `fallbackReflection`.
  - Ativo: com resultado, lê `reports` local e/ou `mapaVivo`.
  - Produto 2/3 influenciam camadas de imagem/guarda-roupa via flags de liberação.

### `/oraculo`

- Arquivo: `src/pages/OraculoOri.jsx`.
- Público: cliente autenticada.
- Jornada: carta diária depois do Produto 1; antes disso há textos de bloqueio/convite à primeira leitura.
- Estados:
  - Carregando: `loading`.
  - Sem resultado: cartas têm mensagens seladas e CTA para Produto 1.
  - Com resultado: monta deck com arquétipos e sorteia carta.
  - Carta do dia já existente: carrega de API/localStorage.
  - Salvamento API indisponível: `SyncNotice` informa que a carta ficou salva no navegador.
  - Erro de jornada/oráculo: `SyncNotice`, fallback local.

### `/produto-2`

- Arquivo: `src/pages/Produto2.jsx`, `src/data/produto2Form.js`, `src/components/Produto2ReviewPanel.jsx` apenas no admin.
- Público: cliente autenticada, mas só renderiza se `FEATURES.produto2` for verdadeiro; caso contrário redireciona para `/portal`.
- Jornada: Dossiê ORI, liberado manualmente por admin após Produto 1.
- Estados:
  - Feature flag desligada: `<Navigate to="/portal" replace />`.
  - Carregando: `loading`, estado "Carregando Dossiê ORI...".
  - Bloqueado: `!produtoLiberado`, mensagem "Esta etapa abre quando sua próxima leitura estiver disponível...".
  - Rascunho/preenchimento: `produtoLiberado && !isSubmitted`, formulário multi-step.
  - Upload: `uploading`, botão "Enviando imagens...".
  - Salvo: `notice = "Rascunho do Dossiê salvo."`.
  - Enviado: status `em_analise`, mensagem de etapa concluída/análise.
  - Publicado: status `publicado`, mostra `dossie` e `diagnosticos` liberados pelo admin.
  - Erro visível: `notice`; normalmente `error.userMessage`, mas upload de fotos pode exibir erro bruto do Supabase.

### `/produto-3`

- Arquivo: `src/pages/Produto3.jsx`.
- Público: cliente autenticada.
- Jornada: Código Final, etapa final.
- Estados:
  - Atualmente não consulta `produto_3_liberado`; renderiza conteúdo "ainda não liberado" sempre.
  - CTA volta para `/produto-1`.
  - Sem loading/erro.

## Rotas admin protegidas

### `/admin`

- Arquivos: `src/pages/AdminDashboard.jsx`, `src/components/AdminRoute.jsx`, `src/layouts/DashboardLayout.jsx`.
- Público: admin autenticado (`clientes.admin === true`).
- Jornada admin: visão operacional/validação.
- Estados:
  - AdminRoute carregando: "Verificando seu acesso administrativo...".
  - Carregando dados: cards mostram `...`.
  - Sem clientes: "Nenhuma cliente registrada ainda."
  - Completo: KPIs, clientes de atenção, feedbacks.
  - Erros: falhas de API são logadas, sem mensagem visível dedicada.

### `/admin/clientes`

- Arquivo: `src/pages/AdminClientes.jsx`.
- Público: admin.
- Jornada admin: lista e triagem de clientes.
- Estados:
  - Carregando: "Carregando clientes...".
  - Lista vazia/filtro sem resultado: "Nenhum cliente encontrado com esse filtro."
  - Atualizando liberação: `updatingId` desabilita/mostra estado em botões.
  - Filtros: leads, andamento, Produto 1, Produto 2, Produto 3, oráculo, atenção, admins.
  - Erros: logados, sem mensagem visível global.

### `/admin/clientes/:id`

- Arquivos: `src/pages/AdminClienteDetalhe.jsx`, `src/components/Produto2ReviewPanel.jsx`.
- Público: admin.
- Jornada admin: ficha completa, liberação, observações, IA de abordagem, revisão Produto 2.
- Estados:
  - Carregando: "Carregando cliente...".
  - Não encontrada: tela com voltar para clientes.
  - Completa: perfil, Produto 1, feedback, oráculo, Produto 2, histórico.
  - Salvando observações/liberações: `saving`.
  - IA mensagem admin: `generatingAi`, `aiNotice`.
  - Produto 2 review: loading, erro, diagnóstico, gerar IA, salvar revisão, publicar/despublicar.
  - Erros visíveis: IA admin usa `aiNotice`; Produto 2 review usa `error`/`notice`.
