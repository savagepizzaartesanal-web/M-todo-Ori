# 6. Duplicações e inconsistências técnicas

## Conteúdo duplicado

### Perguntas do Produto 1

- Frontend: `src/data/questions.js`.
- Backend: `backend/app/data/quiz.py`.
- Uso:
  - Frontend renderiza quiz e calcula/faz fallback.
  - Backend valida respostas e calcula resultado.
- Risco: qualquer alteração em pergunta, bloco, id ou score precisa ser replicada manualmente. Se divergir, cliente vê uma pergunta enquanto backend calcula outra.

### Arquétipos

- Frontend:
  - `src/data/archetypes.js`.
  - `src/data/combinations.js` também exporta `archetypes`.
  - `src/data/reports.js` contém nomes e combinações em cada report.
- Backend:
  - `backend/app/data/quiz.py`.
  - `backend/app/data/reports.json`.
- Risco: títulos aparecem no frontend (`A Magnética`, `A Sensível`) mas backend não guarda os títulos no mesmo formato em `ARCHETYPES`. Há risco de nomenclatura visual divergir da lógica.

### Combinações arquetípicas

- Frontend: `src/data/combinations.js`.
- Backend: `backend/app/data/quiz.py`.
- Reports:
  - `src/data/reports.js`.
  - `backend/app/data/reports.json`.
- Risco: uma combinação pode existir no cálculo e não existir no texto, ou existir com nome diferente.

### Textos completos de report

- Frontend: `src/data/reports.js`.
- Backend: `backend/app/data/reports.json`.
- Uso:
  - Frontend usa em Produto 1, Espelho e fallbacks.
  - Backend usa para leitura, relatório e PDF.
- Risco: duas versões editoriais do mesmo conteúdo. O backend pode gerar relatório/PDF diferente da tela cliente.

### Próximo passo padrão do Dossiê

- Frontend: `proximoPassoPadrao` em `src/data/reports.js`.
- Backend: aparece embutido em `backend/app/data/reports.json`.
- Uso: fechamento do Produto 1 e convite para Produto 2.
- Risco: copy de transição para Dossiê pode divergir.

### Onboarding e Produto 2 dados base

- Onboarding: `src/data/onboardingOriSteps.js`.
- Produto 2 prefill/backend: `produto2_service.py` mapeia `fullName`, `preferredName`, `birthDate`, `residenceLocation`, `whatsapp`, `racialIdentity`, `journeyStage`, `mainPain`, `mainDesire`.
- Produto 2 formulário: `src/data/produto2Form.js` também tem `dados_base` e `jornada`.
- Risco: nomes de campos mudam no onboarding e quebram prefill do Produto 2 sem contrato central.

### Textos do Oráculo

- Frontend: `OraculoOri.jsx` contém o deck, mensagens e orientações práticas.
- Backend: só persiste carta; não define conteúdo.
- Risco: o conteúdo do Oráculo vive na tela. Mudanças não passam pelo backend e dependem do bundle do frontend.

### Nomes das etapas

- "Código das Deusas", "Produto 1", "Primeira leitura", "Leitura arquetípica" aparecem como nomes do mesmo domínio.
- "Dossiê ORI", "Produto 2", "próxima leitura", "leitura visual" aparecem para a segunda etapa.
- "Código Final", "Produto 3", "Aplicação final" aparecem para a terceira etapa.
- "Átrio ORI", "Portal", "Espaço de Jornada" aparecem para o hub.

## Lógica de negócio duplicada

### Cálculo do Produto 1

- Frontend: `src/services/calculateResult.js` e partes de `QuizProduto1.jsx`.
- Backend: `backend/app/services/quiz_service.py`.
- Risco: fallback local pode produzir resultado diferente se backend mudar primeiro.

### Salvamento/conclusão do Produto 1

- Backend: `completeProduto1` via `/api/produto-1/concluir`.
- Frontend fallback: `QuizProduto1.jsx` salva direto em `clientes` e `produto_1_respostas` pelo Supabase SDK.
- Risco: regras como `status_jornada`, `produto_1_liberado`, limpeza de feedback e estrutura do `result` podem divergir.

### Reset do Produto 1

- Backend: `/api/produto-1/reset` limpa respostas, resultado e feedback.
- Frontend fallback: faz updates/deletes direto em Supabase.
- Risco: reset parcial se uma das operações falhar.

### Jornada/status

- Backend: `jornada_service.build_jornada_status`.
- Frontend portal: calcula status visual com `resultadoFinal`, `hasAnswers`, `produto_1_liberado`, `produto_2_liberado`, `produto_3_liberado`.
- Admin: `AdminClientes.jsx` e `AdminClienteDetalhe.jsx` calculam status/produto atual de forma própria.
- Risco: cliente/admin podem ver rótulos diferentes para a mesma situação.

### Liberação Produto 2

- Backend: `ensure_produto2_released` e RLS.
- Frontend: portal e rota `/produto-2` verificam feature flag e `produto_2_liberado`.
- Admin: toggles atualizam `produto_2_liberado` e `status_jornada`.
- Risco: feature flag, backend e admin são três camadas separadas. Bom para proteção, mas pode gerar UX inconsistente.

### Produto 2 prefill

- Backend: `build_produto2_prefill_insumos` e `merge_produto2_insumos_with_context`.
- Frontend: `cloneInsumos` e `produto2EmptyInsumos` definem forma inicial.
- Risco: novos campos do formulário podem não ser preservados/mesclados corretamente se backend não conhecer estrutura.

### Oráculo diário

- Frontend: sorteia carta, salva local, chama API.
- Backend: apenas persiste e recupera.
- Risco: se o algoritmo de sorteio mudar, cartas antigas continuam no banco, mas a regra de formação do deck não fica auditável no backend.

## Inconsistências de nomenclatura

- `produto_1_liberado` existe mas Produto 1 é tratado como disponível por padrão quando a flag é `null` ou ausente.
- `status_jornada` usa textos variados:
  - "Produto 1"
  - "Cadastro recebido"
  - "Perfil criado"
  - "Código das Deusas concluído"
  - "Código das Deusas reiniciado"
  - "Produto 1 concluído"
  - "Dossiê ORI em análise"
  - "Dossiê ORI publicado"
  - "Dossiê enviado"
  - "Finalizado"
- Admin usa "Código das Deusas concluído" em um arquivo e "Produto 1 concluído" em outro.
- `entradaOri` no schema de jornada usa camelCase em Python/Pydantic, enquanto banco usa `perfil_onboarding_concluido`.
- Produto 2 usa `dossie`, `diagnosticos`, `analise_preliminar`, `ia_rascunho`; para comunicação externa, todos parecem "Dossiê ORI", mas são fases internas diferentes.

## Inconsistências de acesso/estado

- `/produto-3` não consulta backend para saber se está liberado; o bloqueio real aparece no portal, não na rota.
- `/` (`Dashboard.jsx`) é uma versão legada do portal que usa localStorage global.
- `/produto-1`, `/produto-1/leitura` e `/quiz-produto-1` apontam para o mesmo componente, com variações internas; isso é aceitável para compatibilidade, mas aumenta estados condicionais.
- `Produto1.jsx` existe, mas não é usado em `App.jsx`; parece resquício de protótipo.

## Duplicações de dados de cliente

- Nome/e-mail existem em Auth metadata, `clientes`, localStorage onboarding e `produto_1_respostas.email`.
- Dados de onboarding são salvos em `clientes.perfil_onboarding` e também desnormalizados em `principal_dor`, `objetivo_principal`, `momento_atual`.
- Produto 2 copia dados base e jornada para `produto_2_dossies.insumos`, mas o backend força os valores derivados do cadastro/Produto 1 a cada merge.

## Pontos positivos de centralização existentes

- Backend centraliza contratos em schemas Pydantic.
- `src/services/api.js` centraliza chamadas HTTP e mensagens humanas de erro.
- `produto2_service.py` centraliza a proteção de Produto 2 e impede cliente de publicar.
- RLS/trigger no Supabase reforçam regras críticas independente do frontend.
