# 5. Tratamento de erros e estados de espera

## Wrapper de API frontend

Arquivo: `src/services/api.js`.

- `OriApiError` concentra `message` técnico e `userMessage` humano.
- Timeout padrão: 12s.
- Leitura: 120s.
- Arquivo/PDF: 180s.
- Rascunho IA admin: 240s.
- Falha de rede/timeout:
  - Timeout: "O ORI está acordando a leitura. Aguarde alguns segundos e tente novamente."
  - Rede: "Não conseguimos sincronizar com o ORI agora. Você pode continuar; vamos manter o que já foi salvo."
- Resposta HTTP não OK:
  - 401: sessão precisa ser atualizada.
  - Outros: "Não conseguimos concluir a sincronização agora..."
- PDF:
  - Timeout: "O ORI ainda está preparando o arquivo..."
  - Falha: "Não conseguimos baixar o arquivo agora..."

## Mensagens visíveis por tela

### Login

- Arquivo: `Login.jsx`.
- Tratamentos:
  - Login inválido: "E-mail ou senha incorretos..."
  - E-mail não confirmado.
  - Cadastro com e-mail existente.
  - Erro de banco no cadastro.
  - Senha curta/e-mail inválido.
  - Recuperação de senha falhou.
- Amigabilidade: humana. Não exibe `error.message` bruto.
- Espera:
  - `loading`: botão "Enviando..." / submit.
  - `resetLoading`: "Enviando link...".

### Redefinir senha

- Arquivo: `RedefinirSenha.jsx`.
- Tratamentos:
  - Senha curta.
  - Confirmação divergente.
  - Falha Supabase updateUser com mensagem humana genérica.
- Amigabilidade: humana.
- Espera: `loading`, botão "Salvando...".

### ProtectedRoute / AdminRoute

- Arquivos: `ProtectedRoute.jsx`, `AdminRoute.jsx`.
- Tratamentos:
  - Erros de sessão/perfil/admin são logados no console.
  - Sem sessão redireciona para `/entrar`.
  - Sem onboarding redireciona para `/entrada-ori`.
  - Admin sem permissão redireciona para `/portal`.
- Amigabilidade: não há erro visível técnico.
- Espera:
  - "Preparando seu portal ORI..."
  - "Verificando seu acesso administrativo..."

### Onboarding

- Arquivo: `OnboardingOri.jsx`.
- Tratamentos:
  - Erros de leitura local/perfil são logados.
  - Falha ao salvar perfil exibe `alert("Não consegui salvar seu perfil agora...")`.
- Amigabilidade: humana.
- Espera: não há loading visual no submit final; apenas bloqueio por `canProceed`.

### Portal

- Arquivo: `PortalCliente.jsx`.
- Tratamentos:
  - Falha em `/api/jornada/me`: `SyncNotice` humano e fallback para Supabase/localStorage.
  - Falha feedback/oráculo: log no console, sem erro visível.
  - Falha ao criar perfil: log, tela fica sem cliente dependendo do estado.
- Amigabilidade: humana quando visível.
- Espera:
  - `loadingCliente`: "Carregando Átrio" e "Preparando seu Átrio ORI...".
  - Cards usam status "Disponível", "Em andamento", "Liberado", "Ainda não liberado".

### Produto 1 / Quiz

- Arquivo: `QuizProduto1.jsx`.
- Tratamentos visíveis:
  - Respostas incompletas: `alert("Responda todos os sinais antes de ver o seu Código ORI.")`.
  - Falha API de respostas/conclusão/leitura: `SyncNotice` com `apiError.userMessage`, fallback local/Supabase.
  - Falha reset: `alert("Não foi possível reiniciar a leitura agora...")`.
  - Falha feedback: `feedbackMessage` com `error.userMessage || "Não conseguimos salvar seu retorno agora."`.
- Amigabilidade: geralmente humana.
- Ponto de risco: fluxos de fallback têm muitos `console.log` com dados técnicos, mas não aparecem para cliente.
- Espera:
  - `isLoadingResult`: "Preparando sua revelação..." e mensagens rotativas.
  - `loadingStep`: alterna mensagens de processamento.
  - `isResettingQuiz`.
  - `feedbackSaving`: "Salvando...".

### Produto 1 Relatório

- Arquivo: `Produto1Relatorio.jsx`.
- Tratamentos:
  - Falha de relatório: `SyncNotice` com `error.userMessage || "Não conseguimos carregar seu relatório agora."`.
  - Falha PDF: `SyncNotice` com `error.userMessage || "Não conseguimos baixar o PDF agora."`.
- Amigabilidade: humana.
- Espera:
  - `loading`: "Preparando sua leitura...".
  - `downloadingPdf`: "Preparando PDF..." e aviso "Estamos preparando seu PDF..."

### Espelho ORI

- Arquivo: `EspelhoOri.jsx`.
- Tratamentos:
  - Falha jornada/mapa vivo: `SyncNotice` humano; fallback Supabase/localStorage/reports.
  - Falha Supabase cliente: log, fallback.
- Amigabilidade: humana quando visível.
- Espera:
  - `loading`: "Preparando seu reflexo...".

### Oráculo

- Arquivo: `OraculoOri.jsx`.
- Tratamentos:
  - Falha jornada/API: `SyncNotice`.
  - Falha ao salvar carta na API: salva localmente e avisa que ficou no navegador.
  - Falha localStorage: console apenas.
- Amigabilidade: humana quando visível.
- Espera:
  - `loading`.
  - Estados de carta: carta selada, carta revelada, carta já tirada.

### Produto 2

- Arquivo: `Produto2.jsx`.
- Tratamentos:
  - Falha ao carregar dossiê: `notice` com `error.userMessage || "Não conseguimos carregar o Dossiê agora."`.
  - Falha ao salvar: `notice` com `error.userMessage || "Não conseguimos salvar o rascunho agora."`.
  - Falha ao enviar: `notice` com `error.userMessage || "Não conseguimos enviar o Dossiê agora."`.
  - Upload de fotos: `notice` com `error.message || "Não conseguimos enviar as imagens agora."`.
- Amigabilidade:
  - API backend: humana por causa de `OriApiError.userMessage`.
  - Upload Storage: risco de texto técnico bruto.
- Espera:
  - `loading`: "Carregando Dossiê ORI...".
  - `saving`: "Salvando..." e "Enviando...".
  - `uploading`: "Enviando imagens...".
  - `status === "em_analise"`: etapa concluída/análise.
  - `status === "publicado"`: entrega publicada.

### Admin Dashboard / Clientes / Detalhe

- Arquivos: `AdminDashboard.jsx`, `AdminClientes.jsx`, `AdminClienteDetalhe.jsx`.
- Tratamentos:
  - Várias falhas são apenas `console.log`, sem toast/alerta global.
  - IA admin em detalhe usa `aiNotice` com fallback humano ou `error.userMessage`.
- Amigabilidade:
  - Não há vazamento para cliente.
  - Admin pode ver detalhes técnicos em avisos de IA vindos do backend.
- Espera:
  - "Carregando clientes..."
  - "Carregando cliente..."
  - KPIs com `...`.
  - `saving`: "Salvar observações"/salvando.
  - `generatingAi`: geração de abordagem.

### Produto2ReviewPanel admin

- Arquivo: `Produto2ReviewPanel.jsx`.
- Tratamentos:
  - `error` visível em card vermelho.
  - `notice` para sucesso.
  - Ações: salvar diagnóstico, gerar IA, salvar revisão, publicar/despublicar.
- Amigabilidade:
  - Admin-only; pode ser mais técnico.
- Espera:
  - "Carregando revisão do Dossiê ORI..."
  - "Salvando..."
  - "Preparando..."
  - "Gerar com IA".

## Erros backend que podem chegar como `detail`

O backend usa mensagens humanas em quase todos os `HTTPException.detail`. O frontend wrapper, porém, não mostra `detail` diretamente; troca por `userMessage`.

Mensagens humanas backend incluem:

- "Token de autenticação ausente."
- "Sessão inválida ou expirada."
- "Não foi possível consultar a jornada no Supabase."
- "Não foi possível consultar/salvar respostas do Produto 1."
- "Dossiê ORI ainda não liberado para esta cliente."
- "Dossiê ORI publicado não pode receber novos insumos."
- "Acesso administrativo necessário."

Pontos com potencial técnico:

- `quiz_service.py` levanta `ValueError("Pergunta inválida: {question_id}")`, retornado por rotas como `detail=str(exc)`.
- `produto1_service.save_produto1_ai_report` levanta `RuntimeError` interno com status e trecho de resposta Supabase, mas esse caminho é interno ao serviço de leitura.
- `admin_ai_service` inclui detalhe truncado de provider em warning admin.
- Produto 2 upload no frontend usa `error.message` do Supabase Storage.

## Estados de espera globais

- Lazy loading de páginas: `PageFallback` em `App.jsx`, "Abrindo sua jornada...".
- ProtectedRoute: "Preparando seu portal ORI...".
- AdminRoute: "Verificando seu acesso administrativo...".
- Portal: "Carregando Átrio".
- Produto 1: "Preparando sua revelação...".
- Relatório: "Preparando sua leitura..." e "Preparando PDF...".
- Espelho: "Preparando seu reflexo...".
- Produto 2: "Carregando Dossiê ORI...", "Enviando imagens...", "Salvando...", "Enviando...".
- Admin: "Carregando clientes...", "Carregando cliente...", "Carregando revisão do Dossiê ORI...".
