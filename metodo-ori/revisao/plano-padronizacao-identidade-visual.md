# Plano de padronizacao da identidade visual ORI

Data: 2026-07-09  
Base: `revisao/inventario-identidade-visual-implementada.md`  
Objetivo: transformar a identidade visual ja existente em um sistema tecnico consistente, reduzindo cores soltas, variacoes duplicadas e assets legados sem descaracterizar a experiencia atual.

## Principios de execucao

- Preservar a estetica atual: preto/vinho, ouro/cobre, texto creme, atmosfera editorial/mistica.
- Migrar por superficie, nao por substituicao massiva.
- Primeiro criar bases reutilizaveis; depois substituir usos repetidos.
- Evitar mexer em paginas muito complexas antes de estabilizar componentes menores.
- Validar visualmente as telas principais apos cada fase.

## Ordem recomendada

1. Contrato visual minimo: tokens oficiais e convencoes.
2. Componentes base: botao, card, campo, badge/status e sheet/modal.
3. Migracao de baixo risco: Login, Redefinir senha, Sidebar e Portal.
4. Migracao administrativa: AdminDashboard, AdminClientes, AdminClienteDetalhe e Produto2ReviewPanel.
5. Migracao de produtos: Produto 1, Produto 2, Produto 3 e relatorio.
6. Migracao editorial complexa: MetodoOri, QuizProduto1, EspelhoOri e OraculoOri.
7. Limpeza de assets e CSS legado.

## Fase 0 - Preparacao e guarda-corpo

Status: recomendado como primeiro commit antes de refatorar.

### Entregas

- Criar um arquivo de referencia de design system em `revisao/design-system-ori.md`.
- Registrar tokens oficiais, aliases permitidos, estados e componentes alvo.
- Definir regra de migracao: novos componentes aceitam variantes, paginas nao devem criar novas cores inline para UI comum.

### Arquivos envolvidos

- `revisao/design-system-ori.md`
- `revisao/inventario-identidade-visual-implementada.md`
- `src/index.css`

### Risco

Baixo. Documental e preparatorio.

### Criterio de conclusao

- Documento aprovado contendo cores oficiais, estados, escala de raio/espacamento e nomes de variantes.

## Fase 1 - Tokens oficiais e aliases sem mudar visual

Status: concluida no primeiro nivel. Tokens semanticos foram adicionados em `src/index.css` sem troca de usos existentes.

### Objetivo

Consolidar a fonte da verdade sem refatorar telas ainda. A ideia e adicionar tokens que cubram os hard-coded recorrentes, mantendo os valores visuais atuais.

### Entregas

- Expandir `:root` em `src/index.css` com tokens semanticos para:
  - Superficies: `--ori-surface-*`
  - Texto: `--ori-text-*`
  - Estados: `--ori-success-*`, `--ori-warning-*`, `--ori-danger-*`, `--ori-info-*`, `--ori-lavender-*`
  - Acoes: `--ori-action-primary-bg`, `--ori-action-primary-text`, `--ori-action-secondary-*`
  - Inputs: `--ori-input-bg`, `--ori-input-border`, `--ori-input-focus-*`
  - Raios: `--ori-radius-sm`, `--ori-radius-md`, `--ori-radius-lg`, `--ori-radius-xl`, `--ori-radius-pill`
  - Sombras: `--ori-shadow-card`, `--ori-shadow-action`, `--ori-shadow-focus`
- Manter tokens existentes por compatibilidade.
- Criar comentarios curtos no CSS separando "tokens base", "tokens semanticos" e "classes utilitarias ORI".

### Arquivos envolvidos

- `src/index.css`

### Risco

Baixo se os tokens forem apenas adicionados, sem alterar classes existentes.

### Criterio de conclusao

- App compila.
- Nenhuma tela muda visualmente de forma perceptivel.
- Novos tokens cobrem as cores hard-coded mais recorrentes listadas no inventario.

## Fase 2 - Componentes base de UI

Status: concluida no primeiro nivel. Componentes base criados e wrappers legados conectados.

### Objetivo

Criar componentes pequenos, previsiveis e reutilizaveis para reduzir duplicacao futura.

### Componentes propostos

| Componente | Props principais | Substitui / organiza |
| --- | --- | --- |
| `OriButton` | `variant`, `size`, `state`, `as`, `disabled`, `className` | `PrimaryButton`, `.ori-journey-action`, `.ori-button-secondary`, botoes raw com `rounded-full` |
| `OriCard` | `variant`, `padding`, `interactive`, `className` | `.ori-card-secondary`, `.ori-card-protagonist`, `.ori-card-teaser`, cards custom repetidos |
| `OriField` | `as`, `label`, `error`, `hint`, `variant` | `FormInput`, `FormTextarea`, `.ori-input`, campos Produto 2/onboarding/admin |
| `OriBadge` | `variant`, `tone`, `state`, `size` | `.ori-chip`, `.ori-badge`, `.ori-pill`, `StatusBadge` local |
| `OriSheet` | `open`, `onClose`, `title`, `children` | Dialog mobile da Sidebar e futuros modais |

### Arquivos envolvidos

- `src/components/ui/OriButton.jsx`
- `src/components/ui/OriCard.jsx`
- `src/components/ui/OriField.jsx`
- `src/components/ui/OriBadge.jsx`
- `src/components/ui/OriSheet.jsx`
- `src/components/PrimaryButton.jsx`
- `src/components/FormInput.jsx`
- `src/components/FormTextarea.jsx`

### Risco

Medio-baixo. Criar componentes e migrar poucos usos primeiro.

### Criterio de conclusao

- Componentes criados.
- `PrimaryButton`, `FormInput` e `FormTextarea` passam a usar os componentes novos ou ficam marcados como wrappers temporarios.
- Nenhuma pagina grande precisa ser refatorada nesta fase.

## Fase 3 - Migracao de baixo risco

Status: concluida no primeiro nivel para as superficies alvo.

Progresso: Login e Redefinir senha migrados parcialmente para `OriField`, `OriButton` e `OriCard`; Sidebar migrada para `OriSheet`, `OriButton`, `OriBadge` e `OriCard`; PortalCliente migrado na camada de CTAs, chips/badges e cards de produto. Ainda restam estilos autorais inline nessas telas, preservados por nao terem equivalencia direta segura nos componentes base.

### Superficies

1. `src/pages/Login.jsx`
2. `src/pages/RedefinirSenha.jsx`
3. `src/components/Sidebar.jsx`
4. `src/pages/PortalCliente.jsx`

### Por que comecar aqui

- Sao telas centrais e muito visiveis.
- Contem inputs, botoes, alertas, badges e sheet mobile.
- Têm bastante duplicacao, mas menor complexidade visual que `EspelhoOri` e `QuizProduto1`.

### Entregas

- Migrar CTAs para `OriButton`.
- Migrar mensagens de erro/sucesso para `OriBadge` ou `OriCard` com tone semantico.
- Migrar inputs de login/redefinicao para `OriField`.
- Migrar sheet mobile da Sidebar para `OriSheet` se o componente ja estiver estavel.
- Remover apenas estilos inline que tenham equivalencia direta nos tokens/componentes.

### Risco

Medio. Login e Sidebar afetam acesso/navegacao; testar fluxo manualmente.

### Validacao minima

- Login: cadastro, login, erro, recuperacao de senha.
- Redefinir senha: campos e estados de feedback.
- Sidebar: desktop, mobile, abrir/fechar menu, logout.
- Portal: cards de produtos liberados/bloqueados e CTAs.

## Fase 4 - Admin e status

Status: concluida no primeiro nivel.

Progresso: `AdminDashboard`, `AdminClientes`, `AdminClienteDetalhe` e `Produto2ReviewPanel` receberam a camada comum de `OriButton`, `OriBadge`, `OriCard` e `OriField` nos pontos repetidos de UI: filtros, busca, CTAs, chips/status, cards de metrica, painel de review e observacoes internas. Permanecem alguns `button` crus em `AdminClienteDetalhe` apenas como cabecalhos expansivos de secoes, preservados por terem comportamento/layout proprio.

### Superficies

1. `src/pages/AdminDashboard.jsx`
2. `src/pages/AdminClientes.jsx`
3. `src/pages/AdminClienteDetalhe.jsx`
4. `src/components/Produto2ReviewPanel.jsx`

### Entregas

- Unificar tons de status:
  - `success`: liberado, publicado, concluido, conectado.
  - `warning` ou `active`: em andamento, em analise.
  - `info`/`lavender`: admin, oraculo, revisao editorial.
  - `danger`: erro, despublicar, alerta.
  - `muted`: bloqueado, ausente, nao iniciado.
- Trocar chips/status inline por `OriBadge`.
- Trocar botoes admin por `OriButton`.
- Padronizar cards administrativos com `OriCard`.

### Risco

Medio. A UI admin tem muitas acoes que alteram dados; validar visual e comportamento.

### Validacao minima

- Lista de clientes com filtros.
- Abrir ficha de cliente.
- Liberar/revogar Produto 2 e Produto 3.
- Publicar/despublicar Dossie no painel de review.

## Fase 5 - Produtos e formularios

Status: concluida no primeiro nivel para as paginas principais de produto.

Progresso: `Produto1`, `Produto1Relatorio`, `Produto2`, `Produto2EmPreparacao` e `Produto3` receberam a camada comum de `OriButton`, `OriBadge`, `OriCard` e `OriField` nos pontos repetidos de UI. Em `Produto2`, controles customizados de radio, progresso e upload foram preservados quando carregam comportamento proprio ou layout visual especifico.

### Superficies

1. `src/pages/Produto1.jsx`
2. `src/pages/Produto1Relatorio.jsx`
3. `src/pages/Produto2.jsx`
4. `src/pages/Produto2EmPreparacao.jsx`
5. `src/pages/Produto3.jsx`
6. `src/components/QuizHero.jsx`
7. `src/components/NextStepCard.jsx`
8. `src/components/LockedProductCard.jsx`
9. `src/components/StatusCard.jsx`

### Entregas

- Unificar CTAs de entrada/continuidade.
- Padronizar cards de produto liberado/bloqueado.
- Migrar `StatusBadge` local de Produto 2 para `OriBadge`.
- Migrar campos do formulario Produto 2 para `OriField`.
- Consolidar componentes antigos como wrappers ou remover se nao usados.

### Risco

Medio-alto. Produto 2 tem upload, formulario longo e estados salvos.

### Validacao minima

- Produto 1: entrada, quiz, resultado.
- Produto 2: upload, campos radio/texto, salvar, enviar.
- Produto 3: estados liberado/bloqueado.
- Relatorio: hero, secoes, CTAs.

## Fase 6 - Paginas editoriais complexas

Status: concluida no primeiro nivel.

Progresso: `MetodoOri` recebeu `OriCard`, `OriBadge` e `OriButton` em cards/chips/CTAs repetidos; `OraculoOri` recebeu `OriButton` e `OriCard` em CTAs e cards de leitura; `QuizProduto1` recebeu `OriButton`/`OriBadge` em CTAs e chips simples; `EspelhoOri` recebeu `OriButton` nos CTAs principais e de proxima etapa; `ReportAccordion` e `EspelhoInteractions` receberam `OriBadge`/`OriCard` em elementos informativos simples. Tabs, controles de escala, carta do oraculo, navegacao lateral e botoes expansivos permanecem preservados por serem interacoes autorais.

### Superficies

1. `src/pages/MetodoOri.jsx`
2. `src/pages/QuizProduto1.jsx`
3. `src/pages/EspelhoOri.jsx`
4. `src/pages/OraculoOri.jsx`
5. `src/components/ReportAccordion.jsx`
6. `src/components/espelho/EspelhoInteractions.jsx`

### Por que por ultimo

- Sao as paginas com maior densidade visual e mais valores arbitrarios.
- Muitas cores ali sao editoriais, nao necessariamente UI comum.
- Refatorar cedo demais pode achatar a personalidade visual dessas telas.

### Entregas

- Separar o que e UI comum do que e paleta editorial.
- Migrar apenas controles comuns: botoes, tabs, badges, cards simples.
- Manter backgrounds, overlays e composicoes especificas quando forem parte da narrativa visual.
- Criar constantes locais nomeadas quando a cor for editorial e nao token global.

### Risco

Alto. Validacao visual indispensavel.

### Validacao minima

- Screenshots desktop/mobile.
- Fluxo completo do quiz.
- Espelho ORI com secoes abertas/fechadas.
- Oraculo com carta bloqueada/sorteada.

## Fase 7 - Limpeza de legado visual

Status: concluida no primeiro nivel.

Progresso: assets de scaffold sem referencias foram removidos (`src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png` e `public/icons.svg`) e `public/favicon.svg` foi substituido por um favicon ORI simples, alinhado a paleta escura/dourada. As classes legadas `.ori-*` foram preservadas como camada de compatibilidade, pois ainda existem usos ativos em componentes antigos e telas autorais; a remocao delas deve acontecer apenas depois de migrar esses pontos remanescentes.

### Itens candidatos

| Item | Acao recomendada | Condicao |
| --- | --- | --- |
| `src/App.css` | Remover import/arquivo ou arquivar conteudo util | Confirmar que nao e usado por nenhuma tela real |
| `src/assets/react.svg` | Remover | Confirmar sem referencias |
| `src/assets/vite.svg` | Remover | Confirmar sem referencias |
| `src/assets/hero.png` | Remover ou mover para `public/images` se for reaproveitado | Confirmar sem referencias |
| `public/icons.svg` | Remover se for scaffold | Confirmar sem referencias |
| `public/favicon.svg` | Substituir por favicon ORI | Criar/ter asset ORI aprovado |
| `.ori-button-secondary`, `.ori-journey-action`, `.ori-chip`, `.ori-badge`, `.ori-pill` | Manter temporariamente | Ainda ha referencias ativas em componentes e telas; remover so apos migracao dedicada |

### Risco

Baixo-medio. `public/favicon.svg` e usado por `index.html:5`, entao precisa substituicao, nao simples remocao.

### Validacao minima

- Build sem erro.
- Favicon correto no navegador.
- Nenhuma referencia quebrada em assets.

## Checklist de acompanhamento

- [x] Fase 0: contrato visual documentado.
- [x] Fase 1: tokens semanticos adicionados sem mudanca visual.
- [x] Fase 2: componentes base criados.
- [x] Fase 3: Login, Redefinir, Sidebar e Portal migrados no primeiro nivel.
- [x] Fase 4: Admin e status migrados no primeiro nivel.
- [x] Fase 5: Produtos e formularios migrados no primeiro nivel.
- [x] Fase 6: Paginas editoriais complexas revisadas no primeiro nivel.
- [x] Fase 7: legado visual limpo no primeiro nivel.
- [x] Build final executado.
- [ ] Screenshots desktop/mobile das telas principais atualizados.

## Primeira tarefa concreta

Criar `revisao/design-system-ori.md` com:

- Paleta oficial de UI.
- Paletas editoriais separadas.
- Estados semanticos.
- Escala de raios e espacamentos.
- Variantes de `Button`, `Card`, `Field`, `Badge` e `Sheet`.
- Lista do que fica proibido em novos codigos: novas cores hard-coded para UI comum, novos botoes primarios raw, novos inputs sem componente.

Depois disso, iniciar a Fase 1 em `src/index.css` adicionando tokens semanticos sem trocar usos existentes.
