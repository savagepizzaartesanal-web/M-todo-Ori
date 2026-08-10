# ROADMAP DE PRODUÇÃO — MÉTODO ORI
## Versão 2.2 — P1 em produção comercial + Onda 0 + MASTER-005 + Reconciliação pós-smoke

**Data de recalibração:** 07/08/2026
**Status:** documento mestre operacional  
**Substitui como fonte de verdade operacional:** versões anteriores do roadmap e guias históricos quando houver divergência temporal.

---

# 0. PRINCÍPIOS DE USO DO ROADMAP

Este roadmap separa explicitamente:

1. release gate
2. bugs confirmados
3. UX
4. acessibilidade
5. comercial
6. polish
7. dívida técnica
8. refatoração
9. documentação
10. IA
11. infraestrutura
12. conteúdo
13. produto

Não misturar dívida técnica futura com bloqueadores de lançamento.

## Status

- `[x]` concluído e validado
- `[~]` em andamento / parcialmente validado
- `[ ]` não iniciado
- `[!]` release gate / bloqueador
- `[?]` hipótese ou risco ainda não reproduzido
- `[→]` depende de etapa anterior

## Regra de conclusão

Código existente não equivale a entrega concluída.

Para marcar algo como concluído, exigir, quando aplicável:

```text
implementação
↓
teste
↓
validação
↓
aprovação
↓
produção / smoke test
```

---

# 1. VISÃO DO PRODUTO

O Método Ori é um **sistema de integração identitária** que traduz essência, corpo, cor, cabelo, rotina e presença em uma linguagem visual coerente, funcional e aplicável à vida real.

Resultado central:

> Não é apenas “encontrar um estilo”. É construir coerência entre identidade interna e presença externa.

A jornada segue a lógica:

```text
RECONHECER
Produto 1
↓
INTEGRAR
Produto 2
↓
APLICAR
Produto 3
```

O produto deve reduzir fragmentação, excesso de informação e decisões por imitação, insegurança ou tentativa e erro.

---

# 2. DECISÕES VIGENTES DE PRODUTO

## 2.1 Produto 1 — Código das Deusas

**Único produto comercial ativo na RC1.**

Preço atual:

**R$ 47,00**

Estrutura freemium oficial pós-RC1:

```text
Camada gratuita 1
↓
Camada gratuita 2
↓
Camada gratuita 3
↓
SÍNTESE / FECHAMENTO DA LEITURA INICIAL
↓
convite de aprofundamento
↓
Paywall R$47
↓
vidaReal + demais camadas premium
↓
relatório/PDF incluídos na mesma liberação
```

### Decisão de produto

A estratégia anterior do briefing que previa bloquear o P1 logo após o arquétipo dominante foi **substituída**.

A fonte de verdade atual é:

- as três primeiras camadas são gratuitas;
- o conteúdo premium começa em `vidaReal`;
- o pagamento libera `produto_1_completo`.

Entitlement esperado:

`clientes.produto_1_completo_liberado = true`

O frontend também adota política **fail-closed** para premium:

- `produto_1_completo_liberado === true` é a única confirmação positiva que libera conteúdo premium;
- sem essa confirmação, somente `reconhecimento`, `essencia` e `dinamica` ficam acessíveis;
- qualquer outra camada permanece bloqueada.

## 2.2 Produto 2 — Dossiê ORI

Na RC1:

- não deve possuir checkout;
- não deve ser vendido;
- não deve parecer comercialmente disponível;
- pode existir apenas como próxima etapa narrativa.

### Atenção mitigada

O risco de o Produto 2 parecer comercialmente ativo na RC1 foi mitigado pelo MASTER-002.

Estado vigente:

- Produto 2 permanece visível como próxima etapa narrativa;
- estado público em produção: `Em preparação`;
- sem preço;
- sem checkout;
- sem CTA comercial ativo;
- rotas diretas protegidas por estado de preparação.

## 2.3 Produto 3 — Código Final

Na RC1:

- sem checkout;
- sem venda;
- pode aparecer como etapa futura/selada.

O estado selado atual foi considerado coerente e deve ser preservado.

## 2.4 Bundle — Jornada Completa

Ainda não implementado.

Até P1, P2 e P3 estarem comercialmente estáveis:

- não anunciar como compra ativa;
- não criar checkout;
- não criar entitlement composto.

---

# 3. INFRAESTRUTURA OFICIAL

```text
Usuária
   ↓
Cloudflare
https://metodoori.teluricabeleza.com
   ↓
Render Starter
https://metodo-ori-api-3o22.onrender.com
   ↓
Supabase
Banco + Auth + Storage
   ↓
Mercado Pago Checkout Pro
   ↓
Gemini
IA atual
```

## Stack

- React
- Vite
- React Router
- Supabase
- Render
- Cloudflare
- Mercado Pago Checkout Pro
- Gemini

## Decisões de infraestrutura

- Vercel não faz mais parte da infraestrutura oficial.
- Projeto Vercel legado desconectado do repositório GitHub em 06/08/2026; não participa mais dos deploys automáticos oficiais.
- Mercado Pago está ativo em PRODUÇÃO para o Produto 1 após E2E comercial real validado em 06/08/2026.
- OpenAI não faz parte da arquitetura ativa atual.

---

# 4. ESTADO ATUAL DA IA

## Provedor ativo

Gemini.

## Modelo em produção

`gemini-3.1-flash-lite`

O modelo anterior `gemini-2.5-flash-lite` apresentou indisponibilidade para novos usuários.

Após atualização do ambiente:

- `/health` validado;
- geração com IA em produção testada;
- funcionamento confirmado.

Ainda existem referências antigas no repositório.

### Decisão

Não realizar reestruturação Gemini/OpenAI antes da revisão com especialista de IA, salvo necessidade operacional crítica.

---

# 5. MAPA MESTRE ATUAL

```text
                              MÉTODO ORI
                                  │
      ┌───────────────────────────┼────────────────────────────┐
      │                           │                            │
      ▼                           ▼                            ▼
FRENTE 0                    FRENTE 1                     FRENTE 3
P1 COMERCIAL ATIVO          UX/UI + COPY                 PRODUÇÃO
RC1 EM OPERAÇÃO             PÓS-AUDITORIA                PÓS-ENTREGA
      │                           │                            │
      └───────────────────────────┼────────────────────────────┘
                                  │
                           P1 CONSOLIDADO
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
            VALIDAÇÃO DE PRODUTO        ESTRATÉGIA DE IA
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                             RC2 — P2
                                  │
                                  ▼
                             RC3 — P3
                                  │
                                  ▼
                     CAMADA DE CONTINUIDADE
                                  │
                                  ▼
                          BUNDLE / JORNADA
                                  │
                                  ▼
                           ESCALA COMERCIAL
                                  │
                                  ▼
                         ASSISTENTE ORI
```

---

# 6. FRENTE 0 — PRODUTO 1 EM PRODUÇÃO COMERCIAL

**Status:** ✅ EM PRODUÇÃO  
**Natureza:** operação comercial ativa do Produto 1  
**Marco:** E2E comercial real validado em produção em 06/08/2026

## 6.1 Git / Deploy

- [x] branch de pagamentos criada
- [x] testes locais
- [x] PR criada
- [x] PR #1 mergeada na `main`
- [x] RC1 publicada pelo Render a partir da `main`
- [x] `/health` validado em produção
- [x] frontend Cloudflare → backend Render
- [x] `main` local sincronizada com `origin/main`
- [x] branch `feat/pagamentos-mercado-pago` preservada durante a validação
- [x] branch temporária de diagnóstico de webhook excluída sem alteração funcional necessária

## 6.2 Validações técnicas prévias

- [x] `npm run lint`
- [x] `npm run build`
- [x] 58 testes de pagamentos
- [x] 13 testes de freemium do Produto 1
- [x] `git diff --check`

## 6.3 Pagamentos — sandbox validado

- [x] catálogo P1
- [x] preço R$47
- [x] paywall
- [x] POST `/api/payments/checkout`
- [x] preferência Mercado Pago
- [x] Checkout Pro
- [x] descrição correta do produto
- [x] pagamento sandbox aprovado
- [x] webhook sandbox processado
- [x] `payment_orders.status = approved`
- [x] entitlement concedido
- [x] `produto_1_completo_liberado = true`
- [x] retorno reconhecido
- [x] paywall removido
- [x] `vidaReal` e premium acessíveis
- [x] fluxo validado com duas clientes distintas

## 6.4 GATE-001 — MERCADO PAGO E2E

**Status:** ✅ CONCLUÍDO / VERDE

Fluxo comprovado:

```text
pagamento approved
↓
webhook recebido
↓
payment_orders.status = approved
↓
entitlement concedido
↓
produto_1_completo_liberado = true
↓
/pagamento/retorno confirma
↓
vidaReal
↓
paywall desaparece
↓
premium acessível
↓
relatório/PDF liberados
↓
nova cobrança não é solicitada para cliente já liberada
```

O GATE-001 deixa de ser bloqueador e passa a ser **marco técnico concluído da RC1**.

## 6.5 Produção real — validada

- [x] credencial Mercado Pago de produção ativada
- [x] deploy Render após migração
- [x] `/health` OK
- [x] preferência de produção criada
- [x] `init_point` de produção utilizado
- [x] checkout real exibindo Código das Deusas — R$47
- [x] Pix/cartão reais disponíveis
- [x] pagamento REAL de R$47 realizado
- [x] webhook moderno real recebido pelo Render
- [x] webhook real HTTP 200
- [x] `payment_order` real passou de `pending` para `approved`
- [x] `provider_payment_id` registrado
- [x] `approved_at` preenchido
- [x] entitlement real concedido
- [x] frontend exibiu “Pagamento confirmado”
- [x] CTA “Continuar minha leitura”
- [x] leitura premium aberta
- [x] paywall removido
- [x] nenhuma nova cobrança solicitada

### Marco oficial

> **E2E comercial real do Produto 1 validado em produção em 06/08/2026.**

O Produto 1 está **habilitado para vendas reais**.

## 6.6 Webhook — segurança e idempotência

- [x] validação por assinatura HMAC SHA-256
- [x] `x-signature`
- [x] `x-request-id`
- [x] `data.id`
- [x] simulador oficial retornando HTTP 200
- [x] endpoint real do Render processando evento assinado
- [x] deduplicação por provider + provider_event_id confirmada
- [x] evento duplicado não reprocessa o pagamento
- [x] secret de webhook rotacionada após exposição acidental em screenshot
- [x] nova secret configurada e validada após deploy

**Nunca registrar valores de secrets, tokens ou chaves nos documentos.**

## 6.7 Pendências de pagamento PÓS-RC1

Esses itens **não bloqueiam vendas atuais do P1**.

### PAYMENT-TECH-001 — Expiração de `payment_orders`

O backend pode reutilizar order `created/pending` com `checkout_url` sem TTL temporal.

- [ ] avaliar `expires_at`
- [ ] avaliar TTL
- [ ] avaliar cancelamento automático
- [ ] definir quando criar nova preferência

O legado problemático encontrado durante os testes foi saneado manualmente.

### PAYMENT-TECH-002 — Notificações legacy Mercado Pago

Eventos modernos `?data.id=...&type=payment` estão validados e seguros.

Notificações legacy como `?id=...&topic=payment` ou `merchant_order` podem retornar 401.

- [ ] avaliar separadamente
- [ ] não enfraquecer a validação do webhook moderno para aceitá-las

---

# 7. ONDA 0 — RELEASE SAFETY MÍNIMO

O GATE-001 e os itens mínimos de safety da RC1 foram concluídos e validados em produção.

## MASTER-002 — P2 parece ativo

**Severidade:** P1
**Status:** ✅ CONCLUÍDO / VERDE EM PRODUÇÃO

- [x] transformar P2 em futuro narrativo / indisponível na RC1
- [x] reduzir peso visual equivalente ao P1
- [x] remover percepção de CTA comercial ativo
- [x] validar portal desktop/mobile

Evidência de conclusão:

- feature flag do P2 convertida para opt-in explícito: `VITE_ENABLE_PRODUTO_2 === "true"`;
- Cloudflare Production sem `VITE_ENABLE_PRODUTO_2` definida, resultando em `FEATURES.produto2 = false`;
- P2 em produção aparece como `Em preparação`, preservado como próxima etapa narrativa;
- CTA “Acessar Dossiê” removido no estado RC1, sem preço, checkout, ação comercial ou foco via Tab;
- rotas `/produto-2` e `/produto-2/leitura` protegidas por `Produto2EmPreparacao`;
- P1 e P3 preservados;
- desktop produção PASS e mobile produção ~400 px PASS;
- PR #2 mergeada; implementação `af51d369429dd42c4aa973569f8aa0755868a067`; merge commit `7e3599b`;
- Cloudflare Production deploy após PR #2: PASS;
- Vercel legado desconectado do GitHub antes do merge.

## MASTER-003 — Focus trap do paywall

**Severidade:** P1
**Status:** ✅ CONCLUÍDO / VERDE EM PRODUÇÃO

Hoje:

- foco entra no diálogo;
- Escape funciona;
- fechamento devolve foco ao gatilho;
- Tab/Shift+Tab conseguem escapar para o conteúdo atrás.

Correção:

- [x] conter foco dentro do modal
- [x] preservar Escape
- [x] preservar retorno ao gatilho
- [x] testar teclado real

Evidência de conclusão:

- implementação local em `Produto1Paywall.jsx`, sem dependência externa;
- Tab e Shift+Tab contidos no modal;
- foco inicial no dialog preservado;
- Escape preservado;
- retorno do foco ao gatilho preservado;
- CTA principal e checkout preservados;
- PR #3;
- implementação `b3f52f0d116a1c7784acac4feb5b3f21597c1876`;
- merge commit `6c2883f`;
- Cloudflare Production deploy após PR #3: PASS;
- validação real desktop: PASS;
- validação real mobile: PASS.

## P0-GATING-001 — Premium exposto na primeira entrada pós-quiz

**Severidade:** P0
**Status:** ✅ CONCLUÍDO / VERDE EM PRODUÇÃO

Problema:

- após uma cliente nova concluir o quiz, a primeira entrada automática em `/produto-1/leitura` podia exibir conteúdo premium temporariamente;
- a cliente não havia pago;
- `clientes.produto_1_completo_liberado = false`;
- após sair e voltar, o paywall aparecia corretamente.

Causa:

- o frontend fazia fail-open antes do entitlement carregar;
- `activeBackendReading` ainda estava `null`;
- `locked_layer_ids` era tratado como lista vazia;
- ausência de informação podia virar ausência de bloqueio;
- conteúdo premium enriquecido localmente podia chegar ao DOM antes da reconciliação.

Correção:

- política frontend deny-by-default;
- `produto_1_completo_liberado === true` libera premium;
- qualquer outro estado libera somente `reconhecimento`, `essencia` e `dinamica`;
- qualquer outra layer fica locked sem entitlement positivo;
- core locking derivado das próprias layers;
- core desconhecido fica locked;
- `ReadingLayerPanel` retorna antes de renderizar `layer.content` quando `layer.locked=true`.

Evidência de conclusão:

- PR #4;
- commit `765e5c6`;
- merge commit `e1bb758`;
- Cloudflare Production deploy após PR #4: PASS;
- primeira entrada pós-quiz free: PASS;
- reentrada free: PASS;
- cliente full: PASS;
- premium textual sem entitlement: NÃO.

## MASTER-001 — Fechamento gratuito / transição premium

**Severidade:** P1
**Status:** ✅ CONCLUÍDO / VERDE EM PRODUÇÃO

Problema resolvido:

```text
Reconhecimento
↓
Essência
↓
Dinâmica
↓
Concluir minha primeira leitura
↓
fechamento explícito da experiência gratuita
↓
aprofundamento opcional
```

O fluxo deixou de comunicar:

> “Comecei uma leitura e agora preciso pagar para terminar.”

E passou a comunicar:

> “Concluí minha primeira leitura. Agora posso aprofundar.”

Comportamento final:

```text
FREE

Reconhecimento → 1/3
↓
Essência → 2/3
↓
Dinâmica → 3/3 / 100%
↓
“Concluir minha primeira leitura”
↓
estado explícito de conclusão
↓
“Aprofundar minha leitura” → paywall

ou

“Revisitar minha leitura”
```

- [x] criar fechamento perceptível após a 3ª camada
- [x] entregar síntese da experiência gratuita
- [x] mudar percepção de “interrupção” para “conclusão + aprofundamento”
- [x] revisar progresso apresentado
- [x] conectar o paywall como convite
- [x] preservar conteúdo atual das três camadas

Garantias preservadas:

- paywall não abre automaticamente;
- as três entregas gratuitas aparecem como concluídas;
- premium permanece locked sem entitlement;
- cliente full preserva fluxo Dinâmica → Vida real;
- progresso full continua referente à leitura completa.

Evidência de conclusão:

- implementação `2b2815a`;
- PR #6;
- merge commit `06e2012`;
- Cloudflare Production: PASS;
- validação controlada free 1/3, 2/3, 3/3: PASS;
- conclusão explícita: PASS;
- único CTA premium: PASS;
- foco na região de conclusão: PASS;
- teclado: PASS;
- focus trap: PASS;
- Escape: PASS;
- retorno de foco: PASS;
- Revisitar: PASS;
- P0 gating: PASS;
- desktop: PASS;
- mobile: PASS;
- reduced motion: PASS;
- cliente full: PASS;
- smoke produção FREE: PASS;
- smoke produção FULL: PASS.

---

# 8. ONDA 1 — JORNADA COMERCIAL

## MASTER-001 completo

- [ ] refinamento final do fechamento gratuito
- [ ] clareza gratuito → completo
- [ ] microcopy
- [ ] progresso
- [ ] continuidade narrativa

## MASTER-004 — Leitura / relatório / PDF

**Severidade:** P2

- [ ] comunicar uma única liberação de R$47
- [ ] explicar que leitura completa + relatório + PDF fazem parte da mesma compra
- [ ] revisar CTAs e estados bloqueados

## MASTER-005 — Botão Voltar

**Severidade:** P1
**Status:** ✅ CONCLUÍDO / VERDE EM PRODUÇÃO

Problema resolvido:

- o botão Voltar apagava imediatamente a resposta de destino e respostas posteriores;
- isso prejudicava revisão, controle e retomada do questionário;
- a persistência podia ficar inconsistente se a poda local não chegasse ao backend.

Contrato final:

```text
Voltar
↓
apenas revisa
↓
preserva resposta de destino
↓
preserva respostas posteriores
```

```text
Mesma resposta
↓
sem confirmação
↓
preserva posteriores
```

```text
Mudança real com posteriores
↓
confirmação acessível
↓
Cancelar/Escape = nada muda
↓
Confirmar = snapshot podado persistido
↓
posteriores removidas
↓
continuação consistente
```

- [x] avisar antes da ação que voltar pode alterar/remover respostas posteriores
- [x] não assumir automaticamente que preservar respostas é correto
- [x] respeitar a lógica adaptativa do questionário

Nota de precisão:

- na RC1, o questionário atual é linear, sem perguntas condicionais ou ramificação;
- a implementação respeita a ordem real de `questions` e não depende de IDs numéricos;
- o critério fica válido para a implementação atual;
- se lógica adaptativa/ramificada for introduzida futuramente, a regra de poda deve ser revalidada e pode precisar mudar de “todas as perguntas posteriores” para “somente o caminho/subárvore invalidado”.

Garantias implementadas:

- Voltar apenas navega;
- resposta de destino preservada;
- respostas posteriores preservadas ao apenas voltar;
- confirmação aparece somente em mudança real com respostas posteriores;
- diálogo com `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`;
- foco inicial em Cancelar;
- Tab/Shift+Tab contidos;
- Escape cancela antes do save;
- Cancelar devolve foco ao gatilho;
- confirmação aguarda save PASS antes de aplicar poda;
- falha de save não consolida poda local nem avança;
- retry permanece possível;
- fila local serializa saves de `handleAnswer`;
- fila sobrevive a falha anterior;
- `completeProduto1` aguarda a fila antes de concluir;
- ordem real de `questions` define respostas posteriores, sem depender de IDs sequenciais.

Evidência de conclusão:

- implementação `19da1a1`;
- PR #8;
- merge commit `ab0598404cdb9fc02f7068e65c4a1c306c7bf7d0`;
- Cloudflare Production: PASS;
- smoke produção: PASS;
- Voltar preserva resposta: PASS;
- Voltar preserva posteriores: PASS;
- mesma resposta não abre confirmação: PASS;
- mudança real abre confirmação: PASS;
- Cancelar: PASS;
- Escape: PASS;
- confirmar remove posteriores: PASS;
- reload não ressuscita respostas: PASS;
- retomada: PASS;
- teclado/foco: PASS;
- mobile: PASS;
- conclusão do quiz: PASS;
- MASTER-001 preservado: PASS;
- P0-GATING-001 preservado: PASS;
- MASTER-003 preservado: PASS.

## MASTER-010 — Retomada da camada exata

**Severidade:** P2  
**Status:** inferido / requer teste

- [ ] reproduzir
- [ ] documentar
- [ ] corrigir somente se confirmado

---

# 9. ONDA 2 — ACESSIBILIDADE E ROBUSTEZ

## MASTER-006 — Semântica do onboarding

**Status:** ✅ CONCLUÍDO / VERDE EM PRODUÇÃO

- [x] revisar controles customizados
- [x] aplicar semântica adequada a seleção única/múltipla
- [x] validar teclado/leitor de tela

Evidência de conclusão:

- seleção única migrada para `radio` nativo;
- `fieldset`/`legend`;
- labels/IDs associados;
- `checked` controlado via React;
- teclado nativo preservado;
- associação semântica pergunta ↔ opções;
- leitor de tela real (Orca) validado;
- caminho de seleção múltipla (`field.type === "checkbox"`) permanece dormente e não foi alterado nesta frente; revalidar sua semântica caso seja ativado futuramente;
- PR #11;
- merge commit `962dddde38360b2c21952e9210bca362fcf59966`.

## MASTER-007 — Escala 1–5

**Status:** ✅ CONCLUÍDO / VERDE EM PRODUÇÃO

- [x] avaliar `radiogroup/radio`
- [x] preservar comportamento atual
- [x] validar leitor de tela

Decisão: manter `button` + `aria-pressed` (sem migrar para `radiogroup/radio`); a lacuna real era a ausência de associação programática entre a pergunta e a escala, não o papel semântico dos botões.

Evidência de conclusão:

- heading da pergunta recebe `id` estável;
- container da escala recebe `role="group"` com `aria-labelledby` apontando para esse `id`;
- os cinco `button`/`aria-pressed`/`aria-label` preservados sem alteração;
- Tab, Shift+Tab, Enter e Space preservados (comportamento nativo do `button`);
- ausência de navegação por setas mantida como coerente com o padrão `button` + `aria-pressed` (não é `radiogroup`);
- árvore de acessibilidade validada via Chrome/CDP antes e depois da mudança;
- leitor de tela real (Orca) validado em produção;
- PR #13;
- merge commit `6ab430489a8707dbb82b24fd9809c1f9207cede2`.

## MASTER-008 — Obrigatoriedade sem feedback

**Status:** ✅ CONCLUÍDO / VERDE EM PRODUÇÃO

- [x] informar o que falta para avançar
- [x] evitar apenas desabilitar CTA silenciosamente
- [x] considerar deficiência cognitiva e baixa visão

Duas frentes concluídas:

**1. Onboarding**

- primeiro campo obrigatório incompleto identificado e comunicado;
- `showWhen` respeitado;
- CTA continua `disabled` nativamente enquanto incompleto;
- feedback inline explícito;
- `aria-describedby`;
- sem `aria-live` desnecessário;
- leitor de tela real validado;
- PR #11;
- merge commit `962dddde38360b2c21952e9210bca362fcf59966`.

**2. Pós-leitura**

- CTA permanece focável mesmo quando falta seleção;
- sem `disabled` HTML nativo nesse estado;
- estado exposto por `aria-disabled`;
- mensagem dinâmica: "Escolha uma opção para enviar e continuar.";
- região `aria-live="polite"`;
- `aria-describedby` associando o CTA à mensagem;
- Enter, Space e clique via comportamento nativo do `button`;
- sem mudança automática de foco;
- submissão duplicada durante `saving` protegida;
- leitor de tela real (Orca) validado;
- smoke real em produção: PASS;
- PR #12;
- merge commit `b7180086af1be3286aa2741cc2d9282cbb192e6f`.

## MASTER-009 — Idioma global

**Status:** ✅ CONCLUÍDO / VERDE EM PRODUÇÃO

- [x] alterar `lang="en"` para `pt-BR`
- [x] smoke test

Evidência de conclusão:

- `html lang` corrigido para `pt-BR`;
- produção validada;
- PR #10;
- merge commit `8730ad5a3bd034a27410e89625fc4192c2e2052f`.

## MASTER-011 — localStorage

- [ ] mapear writes críticos
- [ ] proteger exceções
- [ ] considerar quota cheia / storage bloqueado / modo privado

## MASTER-012 — Waterfalls

- [ ] medir Produto 1
- [ ] medir Portal
- [ ] paralelizar somente quando seguro
- [ ] comparar latência antes/depois

---

# 10. ONDA 3 — CLAREZA / COPY / UI

## MASTER-013 — Timer / expectativa de geração

**Status:** provisório

- [ ] reproduzir comportamento
- [ ] verificar cleanup/in-flight
- [ ] revisar expectativa verbal do loading
- [ ] corrigir somente se confirmado

## MASTER-014 — Possível race no salvamento

**Status:** hipótese técnica

- [ ] reproduzir
- [ ] instrumentar
- [ ] corrigir se comprovado

## MASTER-015 — Densidade mobile

**Severidade:** P2

A aplicação é funcional em 768, 390, 375 e 320 px, sem overflow horizontal global.

Refinar apenas:

- [ ] leitura
- [ ] relatório
- [ ] paywall

## MASTER-016 — Reduced motion no login

- [ ] revisar vídeo/animações
- [ ] aproximar comportamento do padrão já bom da leitura

## MASTER-017 — Fonte do preço

- [ ] documentar claramente fonte de verdade do R$47
- [ ] evitar duplicação futura

---

# 11. ONDA 4 — PÓS-RC1 / ARQUITETURA

Não misturar com lançamento.

## MASTER-018 — Skill `metodo-ori-copy`

- [ ] criar após aprovação da arquitetura verbal

## MASTER-019 — Design System formal

- [ ] tokens
- [ ] radii
- [ ] sombras/glows
- [ ] cards
- [ ] navegação
- [ ] iconografia
- [ ] estados
- [ ] responsividade

## MASTER-020 — Refatoração `QuizProduto1.jsx`

Hotspot atual: aproximadamente 4.500 linhas.

Regra:

- [ ] NÃO refatorar antes da estabilização da RC1
- [ ] criar plano separado
- [ ] manter testes de regressão

## MASTER-021 — Cache de catálogo

- [ ] medir necessidade
- [ ] definir invalidação
- [ ] implementar somente com justificativa

## MASTER-022 — Sessão/jornada compartilhada

- [ ] avaliar arquitetura
- [ ] não migrar sem benefício comprovado

## MASTER-023 — Performance via Profiler

- [ ] medir antes de memoizar
- [ ] otimizar somente hotspots reais

## MASTER-024 — Request possivelmente desnecessária no relatório

- [ ] confirmar
- [ ] remover somente se segura

---

# 12. FRENTE 1 — UX/UI E COPY: ESTADO REAL

## Auditorias concluídas

- [x] A — Jornada e Arquitetura da Informação
- [x] B — UX e Interação
- [x] C — UX Writing / Microcopy
- [x] D — UI e Direção Visual
- [x] E — Acessibilidade / Web Guidelines
- [x] F — React / Qualidade Técnica
- [x] G — Validação real em navegador
- [x] H — Experiência comercial gratuito → premium

A fase atual **não é mais “fazer auditoria”**.

Agora:

```text
backlog aprovado
↓
GATE-001 ✅ concluído
↓
Onda 0 ✅ concluída
↓
MASTER-005 ✅ concluído
↓
acessibilidade essencial
↓
recovery operacional
↓
observabilidade mínima
↓
demais ondas
```

Neste fluxo:

- acessibilidade essencial bloqueia a próxima frente agora;
- recovery operacional não bloqueia iniciar acessibilidade, mas é etapa obrigatória sequencial antes de fechar Marco C;
- observabilidade mínima não bloqueia iniciar acessibilidade, mas é etapa obrigatória sequencial antes de fechar Marco C.

---

# 13. STACK DE SKILLS — STATUS

## Instaladas

- [x] Anthropic `frontend-design`
- [x] `ui-ux-pro-max`
- [x] `web-design-guidelines`
- [x] `ux-writing`
- [x] `vercel-react-best-practices`

## Futuras

- [ ] `metodo-ori-copy`

## Playwright

- [x] laboratório temporário de auditoria real
- [x] auditoria visual autenticada
- [ ] suíte permanente de regressão/E2E no projeto

---

# 14. IDENTIDADE VISUAL — DECISÕES PRESERVADAS

Preservar:

- identidade cosmoancestral
- noite/vinho
- dourado/cobre
- pergaminho
- textura editorial
- geometrias/constelações
- Inter neste momento
- CTA “Continuar minha leitura”
- CTA “Continuar na parte gratuita”
- preço R$47 destacado
- reduced motion da leitura
- Produto 3 selado

Não autorizar redesign amplo sem nova evidência.

---

# 15. ARQUITETURA VERBAL

O problema atual não é falta de voz, e sim consistência funcional.

Termos a consolidar:

- leitura
- leitura inicial
- leitura completa
- resultado
- relatório digital
- PDF
- Produto
- Núcleo
- Camada
- Sinal
- premium
- desbloqueio

Hierarquia candidata:

```text
Produto
↓
Núcleo
↓
Camada
↓
Sinal
```

---

# 16. FRENTE TRANSVERSAL — VALIDAÇÃO DE PRODUTO

Sinais atuais do briefing:

- 16 leituras P1 concluídas em 19 cadastros;
- 84% de conclusão;
- 57% “me senti vista”;
- 43% “ficou abstrato”;
- 0% “não me reconheci”.

Amostra pequena, portanto usar como sinal, não como verdade estatística.

## Hipótese central

O principal problema pode estar na passagem:

```text
RECONHECIMENTO
↓
COMPREENSÃO
↓
APLICAÇÃO
```

## Objetivo pós-RC1

Reduzir a percepção de abstração.

Investigar:

- [ ] em qual camada aparece “abstrato”
- [ ] falta de exemplos concretos
- [ ] falta de síntese
- [ ] falta de “o que faço com isso?”
- [ ] carga cognitiva do simbolismo
- [ ] clareza gratuito vs premium
- [ ] aplicabilidade percebida do premium

## Instrumentação e aprendizagem

Funil:

```text
cadastro
↓
onboarding
↓
início P1
↓
3 camadas
↓
síntese gratuita
↓
paywall
↓
checkout
↓
approved
↓
premium
↓
relatório/PDF
↓
retorno
```

Medir:

- [ ] conclusão
- [ ] abandono
- [ ] tempo
- [ ] paywall view
- [ ] checkout start
- [ ] approved
- [ ] entitlement
- [ ] premium access
- [ ] retorno
- [ ] clareza
- [ ] aplicabilidade
- [ ] abstração

---

# 17. FRENTE 3 — PRODUÇÃO PÓS-ENTREGA

## Operação

- [ ] procedimento “pagou e não liberou”
- [ ] recuperação manual
- [ ] reprocessamento
- [ ] histórico
- [ ] suporte
- [ ] incidentes
- [ ] SLA interno

## Observabilidade

- [ ] frontend
- [ ] backend
- [ ] webhook
- [ ] checkout
- [ ] entitlement
- [ ] latência
- [ ] IA
- [ ] custo IA
- [ ] retries/fallback
- [ ] alertas

## Segurança / LGPD

- [ ] RLS
- [ ] autenticação
- [ ] storage
- [ ] uploads
- [ ] logs
- [ ] retenção de fotos
- [ ] retenção de respostas
- [ ] consentimento
- [ ] exportação/exclusão
- [ ] privilégio mínimo
- [ ] incident response

## Jurídico de assets

- [ ] inventariar referências visuais
- [ ] classificar origem/licença
- [ ] remover uso comercial sem autorização
- [ ] criar biblioteca própria/licenciada
- [ ] registrar procedência

## Resiliência

- [ ] checklist pós-deploy
- [ ] smoke tests
- [ ] rollback
- [x] backup — RECOVERY-1 concluído, ver seção 28.3
- [x] restore — RECOVERY-1 concluído, ver seção 28.3
- [ ] migrations
- [ ] test/prod
- [ ] dependências externas

---

# 18. FRENTE TRANSVERSAL — ESTRATÉGIA DE IA

## Arquitetura preferencial

```text
CAMADA 1
Determinístico
↓
calcula / classifica / valida regras

CAMADA 2
IA estruturada
↓
interpreta / integra / explica / redige

CAMADA 3
Revisão humana
↓
casos de risco, baixa confiança ou publicação
```

A IA não deve inventar livremente a identidade da cliente.

## Inventário de IA

- [ ] feature
- [ ] produto
- [ ] objetivo
- [ ] provedor
- [ ] modelo
- [ ] prompt
- [ ] entrada
- [ ] dados pessoais
- [ ] grounding
- [ ] schema
- [ ] saída
- [ ] persistência
- [ ] revisão humana
- [ ] risco
- [ ] fallback
- [ ] retry
- [ ] custo
- [ ] latência
- [ ] avaliação
- [ ] logs

## Confiança

Não usar score arbitrário do próprio LLM como única evidência.

Construir confiança a partir de:

```text
qualidade da entrada
+
completude
+
consistência entre respostas
+
proximidade entre classificações
+
concordância regra ↔ imagem
+
concordância entre fontes
```

- [ ] critérios por diagnóstico
- [ ] thresholds
- [ ] revisão humana
- [ ] motivo da baixa confiança
- [ ] impedir conclusão definitiva com dados insuficientes

## Evals

- [ ] dataset
- [ ] rubricas
- [ ] aderência metodológica
- [ ] consistência
- [ ] alucinação
- [ ] contradição
- [ ] regressão de prompt
- [ ] revisão humana
- [ ] custo/qualidade
- [ ] modelo por tarefa

---

# 19. RC2 — PRODUTO 2 / DOSSIÊ ORI

O P2 é prioridade estratégica pós-consolidação do P1 porque sua automação reduz trabalho manual e aumenta capacidade operacional.

## Checkpoint

- [ ] formulário
- [ ] upload
- [ ] ancestralidade
- [ ] regras condicionais
- [ ] motor determinístico
- [ ] testes
- [ ] IA
- [ ] revisão admin
- [ ] publicação
- [ ] UX
- [ ] assets
- [ ] permissões

## Pipeline de qualidade de imagem

```text
upload
↓
resolução
↓
luz
↓
enquadramento
↓
cor
↓
quantidade mínima
↓
qualidade suficiente?
   ├── NÃO → pedir nova foto
   └── SIM → análise
```

- [ ] critérios objetivos
- [ ] validação automática
- [ ] feedback de captura
- [ ] encaminhamento humano
- [ ] impedir inferência insegura

## Comercialização

Somente depois de P2 funcional:

- [ ] entitlement
- [ ] pré-requisito P1
- [ ] catálogo
- [ ] preço
- [ ] paywall
- [ ] checkout
- [ ] webhook
- [ ] E2E
- [ ] produção

---

# 20. RC3 — PRODUTO 3 / CÓDIGO FINAL

P3 aplica P1 + P2 ao guarda-roupa real e não deve recalcular diagnósticos anteriores.

- [ ] backend
- [ ] schema/RLS
- [ ] services
- [ ] rotas
- [ ] frontend
- [ ] integração P1+P2
- [ ] inventário
- [ ] cápsula
- [ ] fórmulas de looks
- [ ] lacunas
- [ ] compras
- [ ] admin
- [ ] IA
- [ ] entitlement
- [ ] pagamento
- [ ] E2E

---

# 21. CAMADA DE CONTINUIDADE ORI

Não é prioridade RC1.

Tese:

> retenção deve nascer da manutenção da coerência, não da criação de insatisfação permanente.

Hipóteses a validar:

- [ ] painel pessoal
- [ ] progresso
- [ ] consulta antes da compra
- [ ] atualização de cabelo/corpo
- [ ] inventário de novas peças
- [ ] combinações
- [ ] revisão sazonal
- [ ] ritual mensal
- [ ] histórico
- [ ] compras evitadas
- [ ] Assistente ORI

Não transformar essas hipóteses automaticamente em backlog de feature.

---

# 22. BUNDLE / JORNADA COMPLETA

Somente após P1 + P2 + P3 estáveis.

- [ ] produto Bundle
- [ ] grants
- [ ] pricing
- [ ] upgrades
- [ ] pré-requisitos
- [ ] entitlement composto
- [ ] checkout
- [ ] webhook
- [ ] UX
- [ ] E2E

---

# 23. ASSISTENTE ORI

Horizonte posterior.

## Regra máxima

> interpreta o que já foi calculado e publicado; nunca recalcula a cliente.

Antes de implementar:

- [ ] provedor/modelo
- [ ] grounding
- [ ] memória
- [ ] histórico
- [ ] retenção
- [ ] limite
- [ ] custo
- [ ] guardrails
- [ ] evals
- [ ] observabilidade
- [ ] fallback
- [ ] voz/STT/TTS
- [ ] painel de revisão
- [ ] política para conteúdo psicológico sensível

---

# 24. DÍVIDA TÉCNICA NÃO BLOQUEANTE

- [ ] componentização `QuizProduto1.jsx`
- [ ] contexto compartilhado
- [ ] cache de catálogo
- [ ] design system
- [ ] skill `metodo-ori-copy`
- [ ] vídeo/login
- [ ] memoizações após Profiler
- [ ] requests do relatório
- [ ] waterfalls finas
- [ ] referências antigas Gemini
- [ ] alinhar `GEMINI_MODEL` entre Render, código, `render.yaml`, `.env.example`, fallback e documentação
- [ ] PAYMENT-TECH-001 — TTL/expiração de `payment_orders`
- [ ] PAYMENT-TECH-002 — notificações legacy Mercado Pago
- [ ] setTimeout de avanço automático (360ms) em `QuizProduto1.jsx` sem cancelamento explícito — risco de timer concorrente/obsoleto em interações rápidas; identificado durante a auditoria do MASTER-007; não é defeito de acessibilidade e não bloqueou o MASTER-007
- [ ] `CREATE TABLE public.clientes` ausente dos scripts versionados (`metodo-ori/supabase-*.sql`) — a tabela existe de fato em produção (confirmado durante o RECOVERY-1) e por isso não bloqueia backup/restore, mas os scripts sozinhos não reconstroem o schema do zero; identificado durante a auditoria de recovery operacional, não corrigido no Git
- [ ] resposta 2xx do Mercado Pago com corpo não-JSON não é tratada estruturalmente em `MercadoPagoClient.get_payment_for_reconciliation` — hoje resultaria em erro não controlado; identificado durante o RECOVERY-2, não corrigido, endpoint segue exclusivamente admin-only
- [ ] `PaymentReconcileResponse.result` tipado como `str` livre, não `Literal` dos valores possíveis (`reconciled`, `already_entitled`, `rejected`, `inconsistency_requires_manual_review`, `technical_error`) — identificado durante o RECOVERY-2 (fase B1.2), não corrigido para não expandir escopo da correção
- [ ] aviso de manutenção do GitHub Actions sobre depreciação futura de actions em Node.js 20 em favor de Node.js 24 no workflow `.github/workflows/deploy-metodo-ori.yml` — identificado durante o RECOVERY-3, não corrigido, não bloqueia deploys atuais
- [ ] documentação histórica

---

# 25. SEGURANÇA DOS ARQUIVOS TEMPORÁRIOS

Laboratório:

`/tmp/metodo-ori-browser-audit`

O `auth-state.json` é sensível.

- [ ] apagar quando não houver mais necessidade
- [ ] nunca copiar para o repositório
- [ ] nunca expor
- [ ] nunca commitar

---

# 26. CRITÉRIOS DE PRONTO

## Código
- lint
- build
- testes
- diff check

## Funcional
- happy path
- erros
- persistência
- refresh
- sessão

## UX
- desktop
- mobile
- teclado
- feedback
- loading
- erro

## Produção
- deploy
- smoke
- logs
- rollback
- monitoramento

## Comercial
- checkout
- approved
- entitlement
- recovery
- suporte
- métricas

## IA
- schema
- grounding
- avaliação
- fallback
- logs seguros
- custo
- revisão humana quando necessária

---

# 27. MARCOS

## Marco A — Pagamentos P1 / GATE-001
- [x] GATE-001 verde
- [x] sandbox E2E
- [x] produção E2E
- [x] pagamento real R$47
- [x] webhook
- [x] entitlement
- [x] premium

## Marco B — Produto 1 comercial ativo
- [x] Mercado Pago produção
- [x] checkout real
- [x] pagamento real
- [x] entitlement real
- [x] leitura premium liberada
- [x] P1 habilitado para vendas

## Marco C — Consolidação UX/robustez da RC1
- [x] MASTER-002
- [x] MASTER-003
- [x] MASTER-001 mínimo
- [x] MASTER-005 recomendado
- [x] acessibilidade essencial (MASTER-006, MASTER-007, MASTER-008, MASTER-009)
- [x] recovery operacional (RECOVERY-1 ✅, RECOVERY-2 ✅, RECOVERY-3 ✅, RECOVERY-4 ✅ concluído — runbooks técnicos + manual operacional integrados via PR #20 — ver seção 28.6)
- [ ] observabilidade mínima

## Marco D — P1 consolidado
- [ ] jornada comercial
- [ ] acessibilidade
- [ ] robustez
- [ ] métricas
- [ ] redução de abstração
- [ ] E2E automatizado

## Marco E — RC2 P2
- [ ] P2 funcional
- [ ] IA auditada
- [ ] imagens seguras
- [ ] revisão humana
- [ ] comercial

## Marco F — RC3 P3
- [ ] P3 completo

## Marco G — Jornada completa
- [ ] Bundle

## Marco H — Continuidade / escala
- [ ] mecanismos validados

## Marco I — Assistente ORI
- [ ] arquitetura conversacional segura

---

# 28. ORDEM OBRIGATÓRIA IMEDIATA

O P1 já está vendendo. GATE-001, MASTER-002, MASTER-003, MASTER-001, P0-GATING-001, MASTER-005, MASTER-006, MASTER-007, MASTER-008 e MASTER-009 foram concluídos e validados em produção.

```text
acessibilidade essencial
↓
recovery operacional
↓
observabilidade mínima
↓
demais ondas
```

Marco C permanece aberto até concluir a sequência:

1. acessibilidade essencial; ✅ concluída — ver seção 28.2
2. recovery operacional; RECOVERY-1 (backup/restore) ✅ concluído, RECOVERY-2 (reconciliação pagamento → entitlement) ✅ concluído, RECOVERY-3 (rollback Cloudflare/Render) ✅ concluído, RECOVERY-4 (runbook consolidado de recuperação) ✅ concluído — ver seção 28.6
3. observabilidade mínima ← PRÓXIMA FRENTE OBRIGATÓRIA.

Mudanças pequenas, uma por vez.

Histórico recente concluído:

- MASTER-002 ✅
- MASTER-003 ✅
- MASTER-001 ✅
- P0-GATING-001 ✅
- MASTER-005 ✅
- MASTER-006 ✅
- MASTER-007 ✅
- MASTER-008 ✅
- MASTER-009 ✅
- RECOVERY-1 ✅ (backup + restore Supabase — ver seção 28.3)
- RECOVERY-2 ✅ (reconciliação segura de pagamento → entitlement — ver seção 28.4)
- RECOVERY-3 ✅ (rollback Cloudflare + Render, primitivas nativas confirmadas e fallback Git validado — ver seção 28.5)
- RECOVERY-4 ✅ (runbook consolidado de recuperação — ver seção 28.6)

---

# 28.1 GATE ROADMAP — RECONCILIAÇÃO PÓS MASTER-005

**Data operacional:** 07/08/2026
**Objetivo:** reconciliar roadmap × Git/PRs × código após smoke real do MASTER-005.

## Confirmados concluídos

- GATE-001 — Mercado Pago E2E;
- MASTER-002 — Produto 2 como etapa futura / sem venda RC1;
- MASTER-003 — focus trap do paywall;
- P0-GATING-001 — premium fail-closed pós-quiz;
- MASTER-001 mínimo — fechamento gratuito antes do premium;
- MASTER-005 — Voltar preserva revisão e só poda respostas após mudança real confirmada.

## Bloqueantes agora

1. **Acessibilidade essencial**

Não considerar concluída apenas porque MASTER-003, MASTER-001 e MASTER-005 entregaram melhorias pontuais de foco/teclado.

Critérios ainda pendentes:

- MASTER-006 — semântica do onboarding;
- MASTER-007 — semântica da escala 1–5;
- MASTER-008 — obrigatoriedade com feedback inline;
- MASTER-009 — `lang="en"` global ainda aparece em `metodo-ori/index.html` e precisa virar `pt-BR` com smoke test.

## Pendências obrigatórias sequenciais do Marco C

1. acessibilidade essencial;
2. recovery operacional;
3. observabilidade mínima.

HÁ ETAPA INDEVIDAMENTE PULADA ATÉ MASTER-005?

**Não.** GATE-001, Onda 0, MASTER-002, MASTER-003, P0-GATING-001, MASTER-001 mínimo e MASTER-005 foram concluídos/validados antes de avançar.

HÁ PENDÊNCIAS OBRIGATÓRIAS ANTES DE FECHAR MARCO C?

**Sim.** Acessibilidade essencial vem agora; recovery operacional e observabilidade mínima vêm depois, nessa ordem. Não iniciar recovery antes da acessibilidade essencial, nem nova frente de produto antes de resolver ou reclassificar explicitamente essa sequência.

## Onda 1 — tarefas abertas reconciliadas

- MASTER-001 completo: não executado; não foi pulado indevidamente; volta à fila na consolidação posterior da jornada comercial.
- MASTER-004 — Leitura / relatório / PDF: não executado; não foi pulado indevidamente; volta à fila na consolidação posterior de oferta, leitura, relatório e PDF.
- MASTER-010 — Retomada da camada exata: inferido / requer teste; não foi pulado indevidamente; volta à fila quando houver reprodução/validação funcional.

Onda 1 permanece aberta.

## Dívidas não bloqueantes agora

- TTL/expiração de `payment_orders`;
- notificações legacy Mercado Pago;
- alinhamento de `GEMINI_MODEL` entre documentação/configuração/código;
- suíte permanente E2E no projeto;
- design system, skill Ori Copy e refatorações.

## Futuras / corretamente adiadas

- RC2 Produto 2;
- RC3 Produto 3;
- Bundle;
- Assistente ORI;
- continuidade/escala;
- arquitetura de IA completa com revisão especializada.

## Inconsistências corrigidas neste gate

- MASTER-005 estava pendente no roadmap, mas já está concluído/validado em produção;
- ordem imediata ainda citava MASTER-005 como pendência ativa;
- Top prioridades ainda listava MASTER-005 como P1 crítico;
- risco de perda de progresso no Voltar ainda não estava marcado como mitigado.
- recovery operacional e observabilidade mínima estavam listadas como dívidas não bloqueantes sem a ressalva de que continuam obrigatórias para fechar Marco C;
- Onda 1 precisava explicitar que MASTER-001 completo, MASTER-004 e MASTER-010 continuam abertos e corretamente adiados.

## Próxima ação permitida

**Acessibilidade essencial.**

Não iniciar nova frente de produto, IA, infraestrutura ou redesign antes de resolver ou reclassificar explicitamente os critérios essenciais de acessibilidade acima.

---

# 28.2 GATE ROADMAP — RECONCILIAÇÃO PÓS ACESSIBILIDADE ESSENCIAL

**Data operacional:** 07/08/2026
**Objetivo:** reconciliar roadmap × Git/PRs × código após a conclusão da acessibilidade essencial (MASTER-006, MASTER-007, MASTER-008, MASTER-009).

## Confirmados concluídos

- MASTER-006 — semântica do onboarding; seleção única em `radio` nativo, `fieldset`/`legend`, leitor de tela real validado; PR #11; merge commit `962dddde38360b2c21952e9210bca362fcf59966`;
- MASTER-007 — associação acessível da escala 1–5; `button` + `aria-pressed` preservado, `role="group"`/`aria-labelledby` adicionados; leitor de tela real validado; PR #13; merge commit `6ab430489a8707dbb82b24fd9809c1f9207cede2`;
- MASTER-008 (onboarding) — obrigatoriedade com feedback inline; PR #11; merge commit `962dddde38360b2c21952e9210bca362fcf59966`;
- MASTER-008 (pós-leitura) — CTA focável com `aria-disabled`, mensagem dinâmica, `aria-live="polite"`; leitor de tela real validado; smoke real em produção PASS; PR #12; merge commit `b7180086af1be3286aa2741cc2d9282cbb192e6f`;
- MASTER-009 — `lang="pt-BR"` global; PR #10; merge commit `8730ad5a3bd034a27410e89625fc4192c2e2052f`.

## Estado da frente

**Acessibilidade essencial: CONCLUÍDA.**

Isso não encerra o Marco C. A sequência obrigatória definida no gate anterior (seção 28.1) permanece:

1. acessibilidade essencial — ✅ concluída;
2. recovery operacional — pendente;
3. observabilidade mínima — pendente.

## Bloqueantes agora

**Recovery operacional** passa a ser a próxima frente obrigatória sequencial para o fechamento do Marco C. Não iniciar observabilidade mínima nem nova frente de produto, IA, infraestrutura ou redesign antes de resolver ou reclassificar explicitamente recovery operacional.

## Dívida técnica identificada durante a auditoria

Durante a auditoria do MASTER-007 foi identificado, em `QuizProduto1.jsx`, um `setTimeout(..., 360)` de avanço automático sem cancelamento explícito, com risco teórico de timer concorrente/obsoleto em interações rápidas (ex.: navegação manual dentro da janela de 360ms).

- não é defeito de acessibilidade;
- não bloqueou o MASTER-007;
- não foi alterado nas PRs de acessibilidade (#11, #12, #13);
- registrada como dívida técnica não bloqueante na seção 24.

## Próxima ação permitida

**Recovery operacional.**

---

# 28.3 GATE ROADMAP — RECOVERY-1 CONCLUÍDO (BACKUP + RESTORE SUPABASE)

**Data operacional:** 07/08/2026
**Objetivo:** registrar a conclusão validada operacionalmente do RECOVERY-1 — backup lógico e teste real de restore do Supabase (plano Free) — primeira etapa da sequência de recovery operacional aberta na seção 28.2.

## Status

**RECOVERY-1 — Backup + restore Supabase: ✅ CONCLUÍDO / PASS (validado operacionalmente).**

Isso **não** encerra o bloco de recovery operacional como um todo — RECOVERY-2, RECOVERY-3 e RECOVERY-4 continuam pendentes (ver "Próxima ação" abaixo).

## Evidência de conclusão

**Backup:**
- projeto Supabase de produção está no plano Free (sem backup gerenciado nativo);
- backup lógico real executado via Supabase CLI `2.110.0`;
- conexão usada: Supavisor Session Pooler, porta 5432;
- artefatos gerados: `roles.sql`, `schema.sql`, `data.sql`;
- o schema real confirmou a existência de `CREATE TABLE public.clientes` — isso fecha, **apenas para fins de backup/restore**, o gap identificado anteriormente; a dívida de versionamento/migrations dessa tabela no Git **continua em aberto e não foi corrigida** (ver seção 24).

**Proteção do backup:**
- pacote empacotado e criptografado simetricamente com GPG/AES-256;
- passphrase exclusiva, armazenada separadamente em gerenciador de senhas;
- checksum SHA-256 gerado e validado;
- plaintext temporário removido após validação;
- backup criptografado preservado localmente: `metodo-ori-supabase-20260807-201224.tar.gpg` + `.sha256`;
- cópia off-site enviada ao Google Drive, baixada novamente e com SHA-256 idêntico ao original — integridade off-site: PASS.

**Teste real de restore (ambiente isolado, produção não tocada):**
- projeto Supabase temporário e isolado `metodo-ori-recovery-test`, região equivalente à produção (us-east-1 / North Virginia);
- 1ª tentativa (`--single-transaction`, `ON_ERROR_STOP=1`) falhou em `ALTER ROLE "supabase_admin"` (role reservada da plataforma, não pode ser modificada pelo usuário hospedado); transação abortada; validação pós-falha confirmou `public_tables=0` e `auth_users=0` — rollback transacional: PASS, nenhuma alteração parcial ficou no laboratório;
- tratamento do role reservado: `roles.sql` oficial preservado intocado; auditoria mostrou só os roles de plataforma (`anon`, `authenticated`, `authenticator`, `supabase_admin`), nenhum role customizado do Método Ori; `schema.sql` com 0 ocorrências de `OWNER TO "supabase_admin"`; foi criada, somente para o restore, uma cópia derivada `roles.restore.sql` ignorando exatamente a operação `ALTER ROLE "supabase_admin"` — tratado como **instrução operacional de restore**, sem alterar o backup oficial;
- 2ª tentativa (`roles.restore.sql` + `schema.sql` + `data.sql`): PASS, `psql` exit 0.

**Paridade de dados (recovery-test vs. produção, contagens idênticas):**
- `auth.users`: 23 = 23; `auth.identities`: 23 = 23;
- `admin_cliente_eventos`: 8 = 8; `clientes`: 23 = 23; `oraculo_cartas_diarias`: 11 = 11; `payment_orders`: 7 = 7; `payment_products`: 3 = 3; `payment_webhook_events`: 4 = 4; `produto_1_feedbacks`: 8 = 8; `produto_1_respostas`: 18 = 18; `produto_2_dossies`: 2 = 2; `produto_3_codigos_finais`: 1 = 1;
- paridade global de contagens: PASS.

**Preflight/extensões:** `pgcrypto`, `pg_stat_statements`, `supabase_vault`, `uuid-ossp` instaladas no projeto de recovery. Em produção: nenhum indício de Database Webhooks, 0 Vault secrets, nenhum indício de column encryption.

**Limpeza pós-validação:** diretório plaintext de teste removido; pacote criptografado oficial preservado; checksum preservado; projeto `metodo-ori-recovery-test` excluído.

## Bloqueantes agora

RECOVERY-1 deixa de bloquear a sequência. **RECOVERY-2 — Reconciliação segura de pagamento → entitlement** passa a ser a próxima frente obrigatória: resolver de forma segura o cenário em que o Mercado Pago confirma pagamento válido, mas `produto_1_completo_liberado`/entitlement não fica consistente. Depois, na mesma sequência: RECOVERY-3 (validação/documentação de rollback Cloudflare + Render) e RECOVERY-4 (runbook consolidado de recuperação). Só depois desses três, observabilidade mínima, e só então o Marco C pode ser reavaliado para fechamento.

## Próxima ação permitida

**RECOVERY-2 — Reconciliação segura de pagamento → entitlement.**

---

# 28.4 GATE ROADMAP — RECOVERY-2 CONCLUÍDO (RECONCILIAÇÃO PAGAMENTO → ENTITLEMENT)

**Data operacional:** 08/08/2026
**Objetivo:** registrar a conclusão validada e implantada em produção do RECOVERY-2 — reconciliação administrativa segura de pagamento aprovado no Mercado Pago sem entitlement consistente (`produto_1_completo_liberado`) — segunda etapa da sequência de recovery operacional aberta na seção 28.3.

## Status

**RECOVERY-2 — Reconciliação pagamento → entitlement: ✅ CONCLUÍDO / PASS (implementado, revisado, mergeado e validado em produção).**

Isso **não** encerra o bloco de recovery operacional como um todo — RECOVERY-3 e RECOVERY-4 continuam pendentes (ver "Próxima ação" abaixo).

## Implementação

Endpoint administrativo novo, sensível e restrito a admin: `POST /api/admin/payments/reconcile`, protegido por autenticação (`get_current_user`) e checagem de admin (`ensure_admin`, na camada de serviço), herdando automaticamente o tier de rate limit "sensível" já aplicado a todo `/api/admin/*` (nenhuma alteração no middleware). Request restrito a `payment_id` (schema com `extra="forbid"`) — nenhum outro campo é aceito ou necessário.

Novo método `MercadoPagoClient.get_payment_for_reconciliation`, aditivo, sem alterar o `get_payment` já usado pelo fluxo de webhook: distingue explicitamente pagamento inexistente (404 real) de indisponibilidade/erro técnico do provider (5xx, timeout, erro de rede → sempre 502), nunca confundindo os dois casos.

## Máquina de estados

Reconciliação totalmente aditiva ao fluxo existente de validação (reaproveita `validate_provider_payment`/`validate_product_for_checkout`, sem duplicar nem enfraquecer regras). Sequência: busca do pagamento no Mercado Pago → resolução do pedido por `external_reference` → validação completa (produto, valor, moeda, conta recebedora, status) → sincronização **incondicional** de `payment_orders` (status + `provider_payment_id` + `approved_at`, preservando `approved` já existente) sempre antes de checar entitlement, garantindo convergência mesmo após falha parcial anterior → concessão do entitlement somente se ainda não concedido. Resultados possíveis: `reconciled`, `already_entitled`, `rejected` (com motivo específico), `inconsistency_requires_manual_review`, `technical_error` (nunca mascarado como 200 — erros de sincronização de pedido ou de concessão de entitlement são auditados e propagados como 502).

Escopo minimamente restrito a `produto_1_completo` nesta primeira versão — qualquer outro `product_code` é rejeitado (`product_not_supported`).

## Auditoria

Dupla trilha de auditoria, sem migração de schema: quando o pedido/cliente é resolvido, registro completo em `admin_cliente_eventos` (evento "tentativa" gravado **antes** de qualquer mutação, sempre atualizado ao final com o resultado real e com `order_status_before`/`order_status_after` preservados); quando o pedido não pode ser resolvido (payment_id inexistente, `external_reference` ausente, pedido não encontrado), registro em `payment_webhook_events` com `provider="internal_reconciliation"`, reaproveitando colunas já existentes.

## Testes

Suíte de testes local: 79 pré-existentes → 108 no total (+29 novos), cobrindo os 26 cenários especificados (autenticação, autorização, validação de payload, todos os ramos da máquina de estados, falhas parciais simuladas em cada mutação, testes diretos de `get_payment_for_reconciliation`). Execução completa da suíte confirmada com sucesso (`OK`) em múltiplos pontos do processo, incluindo revalidação no commit congelado do PR antes do merge.

## Versionamento e produção

Implementado, revisado (diff humano completo + revisão direta de código crítico + correções de duas falhas encontradas em revisão antes do merge) e versionado via PR #16 (`feat: adiciona reconciliação segura de pagamentos`), auditado no estado congelado antes de autorizar o merge, e mergeado via merge commit real (dois pais) em `origin/main`. Deploy validado em produção via evidência pública e não-mutante: `/health` OK, `/openapi.json` confirmando a existência da rota e do schema de request restrito a `payment_id`, e uma única chamada não autenticada ao endpoint confirmando a barreira de autenticação (401).

## Ressalva de evidência

A validação de produção não teve acesso direto ao painel/API/logs do Render (sem credenciais disponíveis, nenhuma solicitada) — a confirmação de que o commit correto foi implantado se apoiou em evidência pública indireta (comportamento observável do endpoint e do schema exposto), não em confirmação direta da plataforma de deploy. Isso é uma limitação residual, não bloqueante, e já estava documentada como tal na fase B4.

## Bloqueantes agora

RECOVERY-2 deixa de bloquear a sequência. **RECOVERY-3 — validação/documentação de rollback Cloudflare + Render** passa a ser a próxima frente obrigatória. Depois: RECOVERY-4 (runbook consolidado de recuperação). Só depois desses dois, observabilidade mínima, e só então o Marco C pode ser reavaliado para fechamento.

## Próxima ação permitida

**RECOVERY-3 — validação/documentação de rollback Cloudflare + Render.**

---

# 28.5 GATE ROADMAP — RECOVERY-3 CONCLUÍDO (ROLLBACK CLOUDFLARE + RENDER)

**Data operacional:** 08/08/2026
**Objetivo:** registrar a conclusão validada do RECOVERY-3 — auditoria e validação read-only do procedimento de rollback operacional para frontend (Cloudflare) e backend (Render), incluindo teste isolado do fallback Git — terceira etapa da sequência de recovery operacional aberta na seção 28.4.

## Status

**RECOVERY-3 — Rollback Cloudflare + Render: ✅ CONCLUÍDO / PASS (primitivas nativas comprovadas nos projetos reais, fallback Git validado em ambiente isolado, nenhum rollback real de produção executado).**

Isso **não** encerra o bloco de recovery operacional como um todo — RECOVERY-4 continua pendente (ver "Próxima ação" abaixo).

## Arquitetura de deploy confirmada

Frontend em Cloudflare Pages e backend em Render, com pipelines de deploy independentes, separados por `paths`/`buildFilter`: frontend via GitHub Actions (`.github/workflows/deploy-metodo-ori.yml`, disparado por push em `main` tocando `metodo-ori/**`); backend via Render Auto-Deploy On Commit (`render.yaml`, `buildFilter.paths: backend/**`).

## Cloudflare (frontend)

Projeto `metodo-ori-telurica`; produção a partir de `main`; domínio oficial `metodoori.teluricabeleza.com`. Deployment observado durante a validação: ID `ba0284d4-36ec-4ddb-bf08-87757896b2ea`, status `success`, vinculado ao commit curto `6ab43048` via GitHub Actions. Histórico de deployments de Produção disponível no projeto; opção nativa **"Rollback to this deployment"** confirmada visualmente em um deployment de Produção anterior. Nenhum rollback real foi executado.

## Render (backend)

Serviço `metodo-ori-api` (repositório `telurica-digital/M-todo-Ori`, branch `main`), gerenciado via Blueprint, runtime Docker (`backend/Dockerfile`, contexto `backend`), health check `/health`. Deployment observado do merge do RECOVERY-2 (`11683845ea62a2f21743118f4bfa292a97d0c3e4`): commit curto `1168384`, evento "New commit via Auto-Deploy", iniciado 08/08/2026 09:48, live 09:50. Histórico de deploys disponível; botão **Rollback** confirmado; Manual Deploy oferece "Deploy latest commit", "Deploy a specific commit", "Clear build cache & deploy" e "Restart service" — classificados como: Rollback = primitiva real de recuperação; Deploy a specific commit = fallback operacional (cria novo deploy, desabilita Auto-Deploy); os demais são ferramentas operacionais gerais, não rollback. Auto-Deploy On Commit confirmado visualmente no dashboard. Nenhuma dessas ações foi executada.

## Fallback Git validado

`git revert -m 1 <merge_commit>` testado tecnicamente em clone local descartável (`/tmp`, nunca no repositório de trabalho nem em produção), usando o merge real do RECOVERY-2 (`11683845ea62a2f21743118f4bfa292a97d0c3e4`, parent 1 `6030ecf340279f6d577da00306acb93203464e0a`, parent 2 `f8e971e1bcfd6c786e80b46b53e045113c461934`): `exit 0`, zero conflitos, exatamente 8 arquivos afetados, resultado byte-a-byte equivalente ao parent 1, nenhum commit/push/deploy criado, produção intacta durante todo o teste.

## Decisão sobre rollback real

Rollback real de produção **não** foi executado, por decisão deliberada: as primitivas nativas foram comprovadas visualmente nos projetos reais (Cloudflare e Render), o histórico de deployments está disponível em ambas as plataformas, deployments ativos foram identificados com evidência concreta, o fallback Git foi exercitado isoladamente com sucesso, e acionar um rollback real apenas para fins de teste introduziria risco operacional sem ganho proporcional de evidência.

## Documentação

Evidências técnicas consolidadas em `docs/infraestrutura-producao.md`, via PR #18 (commit documental `4839bcaeeac8a2b49a85132b5da99d9521ffe99e`, merge commit `7643cf71a563b89d6abfda493a7c0e0498ad1e3b`, `mergedAt` 2026-08-08T14:54:52Z). Drift documental de CORS (origem Vercel legada que não constava mais em `render.yaml`) corrigido no mesmo PR. Nenhum código ou infraestrutura foi alterado.

## Gaps / dívidas remanescentes (não bloqueantes ao fechamento do RECOVERY-3)

- Runbook operacional completo de rollback ainda não existe — pertence ao RECOVERY-4.
- Rollback nativo (Cloudflare/Render) é contenção rápida, não remove o commit problemático de `main` — remediação permanente exige revert/fix + PR + merge controlado + novo deploy + smoke.
- Estado do Auto-Deploy no Render precisa fazer parte do futuro runbook: rollback via dashboard desabilita Auto-Deploy automaticamente, rollback via API não desabilita — um push subsequente pode reintroduzir a versão problemática se o Git não tiver sido corrigido antes.
- Preview deployments do frontend não estão implementados no pipeline atual (workflow fixo em `--branch=main`).
- Testes automatizados de contrato entre frontend e backend ainda não existem.
- Aviso de manutenção observado no GitHub Actions sobre depreciação futura de actions em Node.js 20 em favor de Node.js 24 — registrado como dívida de pipeline (P2), não bloqueia o RECOVERY-3 (ver seção 24).

## Bloqueantes agora

RECOVERY-3 deixa de bloquear a sequência. RECOVERY-4 (runbook consolidado de recuperação) foi concluído em seguida — ver seção 28.6. **Observabilidade mínima** permanece pendente antes do fechamento do Marco C.

## Próxima ação permitida

**Observabilidade mínima.**

---

# 28.6 GATE ROADMAP — RECOVERY-4 CONCLUÍDO (RUNBOOK CONSOLIDADO DE RECUPERAÇÃO)

**Data operacional:** 10/08/2026
**Objetivo:** registrar a conclusão validada do RECOVERY-4 — consolidação e validação do procedimento operacional de recuperação do Método Ori — quarta e última etapa da sequência de recovery operacional aberta na seção 28.5.

## Status

**RECOVERY-4 — Runbook consolidado de recuperação: ✅ CONCLUÍDO / PASS (documentação técnica e humana criada, validada empiricamente em laboratório isolado e integrada à `main`).**

Isso encerra o bloco de recovery operacional como um todo (RECOVERY-1, RECOVERY-2, RECOVERY-3 e RECOVERY-4 concluídos). Isso **não** encerra o Marco C — observabilidade mínima continua pendente (ver "Bloqueantes agora" abaixo).

## Resultado

- runbook operacional global criado (`docs/RUNBOOK-RECOVERY-OPERACIONAL.md`);
- runbook de recovery lógico Supabase criado (`docs/RUNBOOK-RECOVERY-DADOS-SUPABASE.md`);
- manual humano de recovery em Markdown criado (`docs/MANUAL-RECOVERY-METODO-ORI.md`);
- manual visual offline single-file criado (`docs/manual-recovery-metodo-ori.html`);
- documentação integrada à `main` via PR #20;
- merge commit: `9db98a61f5bfbcee1970e252c878154ca8ca58b5`.

## Validação empírica resumida

Executada exclusivamente contra projetos Supabase de laboratório, descartáveis, sem nenhum vínculo com produção:

- dump lógico (`roles`/`schema`/`data`) com Supabase CLI `2.113.0`, mecanismo `--linked` passwordless;
- rollback transacional comprovado (falha trivial e falha real de privilégio);
- restore com dumps reais contra TARGET isolado;
- incompatibilidade real de `roles.sql` (`GRANT SET ON PARAMETER "log_min_messages"`) reproduzida e analisada;
- derivado controlado (`roles.restore.sql`) criado apenas após compreensão e autorização, com diff auditado;
- restore não vazio SOURCE → TARGET com paridade de fixture validada;
- checksum SHA-256 (formato GNU) verificado em todas as etapas;
- GnuPG `2.4.4`, criptografia simétrica AES-256, roundtrip validado.

Detalhes completos, comandos exatos e evidência integral: ver os runbooks técnicos listados acima — não repetidos aqui.

## Limitações conhecidas / fronteiras

- Auth integral não validado por este procedimento;
- Storage bytes permanecem fora do escopo do backup lógico PostgreSQL;
- os três dumps são comandos separados e não constituem snapshot atômico comprovado entre si.

Essas são fronteiras documentadas do procedimento atual e **não invalidam** o fechamento do RECOVERY-4.

## Produção

Nenhum restore de produção foi executado durante o RECOVERY-4.

## Hard Gate

Restore de produção continua dependendo de decisão humana coordenada e dos gates definidos nos runbooks (`docs/RUNBOOK-RECOVERY-DADOS-SUPABASE.md`, seção 15) — nada neste gate autoriza restore automático.

## Bloqueantes agora

RECOVERY-4 deixa de bloquear a sequência. **Observabilidade mínima** passa a ser a próxima frente obrigatória. Só depois dela o Marco C pode ser reavaliado para fechamento.

## Próxima ação permitida

**Observabilidade mínima.**

---

# 29. TOP PRIORIDADES

## P0
**Nenhum release gate de pagamento pendente. O P1 está em produção comercial ativa.**

## P1 RC1 crítico
1. acessibilidade essencial ✅ concluída (MASTER-006, MASTER-007, MASTER-008, MASTER-009 — ver seção 28.2)

## Obrigatórias sequenciais para fechar Marco C
2. recovery operacional — RECOVERY-1 ✅ concluído (ver seção 28.3); RECOVERY-2 ✅ concluído (ver seção 28.4); RECOVERY-3 ✅ concluído (ver seção 28.5); RECOVERY-4 ✅ concluído (ver seção 28.6)
3. observabilidade mínima ← próxima frente obrigatória

## P1 operação / pós-RC1
4. segurança/LGPD
5. validação de produto / abstração
6. revisão de arquitetura de IA
7. alinhamento da configuração Gemini

## P2
8. jornada comercial completa
9. robustez React
10. instrumentação
11. pipeline imagem P2
12. jurídico de assets
13. RC2
14. TTL de orders / legacy notifications

## P3
15. design system
16. skill Ori Copy
17. refatorações
18. RC3
19. continuidade
20. Bundle
21. Assistente ORI

---

# 30. RISCOS PRINCIPAIS

| Risco | Nível | Tratamento |
|---|---|---|
| falha futura de entitlement em venda real | operacional | observabilidade + recovery; E2E atual validado |
| P2 parecer comprável na RC1 | mitigado | MASTER-002 concluído / risco mitigado em produção em 06/08/2026 |
| modal permitir foco atrás | mitigado | MASTER-003 concluído / validado em produção |
| premium aparecer antes da confirmação do entitlement | mitigado | P0-GATING-001 concluído / deny-by-default / validado em produção |
| gratuito parecer leitura interrompida | mitigado | MASTER-001 concluído / fechamento gratuito explícito / progresso free 100% em Dinâmica / aprofundamento premium por escolha / smoke produção FREE e FULL: PASS |
| Voltar apagar progresso do questionário | mitigado | MASTER-005 concluído / Voltar preserva respostas / mudança real exige confirmação / snapshot podado persistido / smoke produção: PASS |
| P1 continuar abstrato | alto de produto | pesquisa + UX/copy |
| IA substituir cálculo determinístico | alto | arquitetura IA |
| baixa confiança baseada só no LLM | alto | score composto observável |
| foto ruim gerar diagnóstico | alto | pipeline de qualidade |
| logs exporem dados | alto | auditoria |
| assets sem licença | alto | jurídico |
| dívida técnica virar “urgência” | médio | classificação |
| custos IA sem observabilidade | médio | métricas/caps |

---

# 31. FONTES DE VERDADE

Ordem de prevalência temporal:

1. este roadmap
2. handoffs técnicos consolidados mais recentes
3. código + migrations + configuração ativa
4. briefing da idealizadora para visão e estratégia
5. documentos especializados atuais
6. guia de construção histórico
7. documentos antigos como memória histórica

Quando visão e implementação divergirem:

- registrar a divergência;
- identificar decisão posterior;
- não corrigir silenciosamente;
- formalizar qual versão vale.

Divergência já resolvida:

**P1 freemium = três camadas gratuitas + premium em `vidaReal`.**

---

# 32. SÍNTESE EXECUTIVA

O Método Ori já possui:

- identidade visual forte;
- Produto 1 funcional;
- freemium implementado;
- backend protegendo conteúdo premium;
- catálogo server-side;
- paywall;
- checkout Mercado Pago de produção;
- webhook moderno validado;
- idempotência/deduplicação validada;
- entitlement automático validado;
- pagamento REAL de R$47 concluído;
- retorno de pagamento validado;
- leitura premium liberada em produção;
- Produto 1 habilitado para vendas reais;
- focus trap do paywall validado em desktop/mobile;
- MASTER-001 verde em produção;
- experiência gratuita termina explicitamente após 3 layers;
- progresso free chega a 100% em Dinâmica;
- paywall acionado apenas por convite de aprofundamento;
- cliente full preservado no fluxo completo;
- gating frontend do P1 fail-closed;
- conteúdo premium não renderizado sem entitlement positivo;
- P0 e MASTER-003 sem regressão após MASTER-001;
- fluxo pós-quiz free validado em produção;
- MASTER-005 verde em produção;
- Voltar do questionário preserva resposta de destino;
- Voltar preserva respostas posteriores;
- mudança real em resposta anterior com posteriores exige confirmação acessível;
- snapshot podado é persistido antes de remover posteriores;
- saves do questionário foram serializados para evitar sobrescrita por requisição antiga;
- `completeProduto1` aguarda a fila de saves;
- MASTER-001, P0-GATING-001 e MASTER-003 preservados após MASTER-005;
- acessibilidade essencial concluída (MASTER-006, MASTER-007, MASTER-008, MASTER-009) — onboarding com `radio` nativo, escala 1–5 associada à pergunta via `role="group"`/`aria-labelledby`, feedback de obrigatoriedade acessível no onboarding e no pós-leitura, idioma `pt-BR` global;
- RECOVERY-1 concluído — backup lógico real do Supabase (roles/schema/data), criptografado e com cópia off-site íntegra, com teste real de restore em projeto isolado validando paridade total de dados com a produção (ver seção 28.3);
- RECOVERY-2 concluído — reconciliação administrativa segura de pagamento aprovado no Mercado Pago sem entitlement consistente, implementada, revisada, mergeada e validada em produção (ver seção 28.4);
- RECOVERY-3 concluído — rollback operacional de frontend (Cloudflare Pages) e backend (Render) auditado, primitivas nativas comprovadas nos projetos reais e fallback `git revert -m 1` validado em clone isolado, sem executar rollback real de produção (ver seção 28.5);
- RECOVERY-4 concluído — runbook operacional, runbook de recovery de dados e manual operacional (Markdown + HTML offline) integrados à main via PR #20; validação controlada em laboratório, com limitações explicitamente documentadas (Auth integral, Storage bytes e ausência de snapshot atômico entre os dumps separados) (ver seção 28.6);
- auditoria UX/UI completa;
- backlog priorizado;
- infraestrutura Cloudflare + Render + Supabase em produção;
- Gemini funcionando em produção.

## Estado comercial atual

> **Produto 1 — Código das Deusas está em produção comercial ativa e aceitando pagamentos reais.**

P2, P3 e Bundle continuam fora do checkout nesta release.

## Próxima frente imediata

O release gate de pagamentos, o focus trap do paywall, o fechamento gratuito, o P0 de gating pós-quiz e o MASTER-005 foram encerrados. O trabalho crítico agora é cirúrgico:

1. acessibilidade essencial — ✅ concluída (MASTER-006, MASTER-007, MASTER-008, MASTER-009);
2. recovery operacional — ✅ concluído: RECOVERY-1 (backup/restore Supabase), RECOVERY-2 (reconciliação pagamento → entitlement), RECOVERY-3 (rollback Cloudflare/Render) e RECOVERY-4 (runbook consolidado) todos concluídos (ver seções 28.3–28.6);
3. fortalecer observabilidade mínima ← próxima frente obrigatória;
4. consolidar o P1 com clientes;
5. revisar a arquitetura de IA com a especialista;
6. avançar para RC2 / Produto 2.

Observabilidade mínima não bloqueia iniciar acessibilidade (já concluída), mas segue como pendência obrigatória sequencial para fechar Marco C.

## Pendências pós-RC1 que não bloqueiam vendas nem o início da acessibilidade

- TTL/expiração de `payment_orders`;
- avaliação de notificações legacy do Mercado Pago;
- alinhamento da configuração Gemini entre ambiente e repositório;
- demais dívidas técnicas classificadas neste roadmap.

A expansão futura continua:

```text
P1 em operação comercial
↓
P1 consolidado
↓
P2 automatizado e confiável
↓
P3 completo
↓
jornada integrada / Bundle
↓
continuidade
↓
Assistente ORI
↓
voz
↓
escala
```
