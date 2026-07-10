# Inventario de identidade visual implementada

Data da varredura: 2026-07-09  
Escopo: `src/**/*.{js,jsx,css}`, `public/**/*.{png,jpg,svg,mp4}` e assets em `src/assets`.  
Observacao: este inventario apenas lista e sinaliza o que existe. Nada foi corrigido.

## 1. Paleta de cores

### Tokens e variaveis definidas

Arquivo principal: `src/index.css`.

| Grupo | Tokens | Origem |
| --- | --- | --- |
| Fundo | `--bg-primary: #050202`, `--bg-secondary: #0b0506`, `--bg-card: rgba(18, 9, 10, 0.72)` | `src/index.css:4` |
| Vinho | `--wine-dark: #210606`, `--wine-deep: #210606`, `--wine-muted: #4a1a1a` | `src/index.css:8` |
| Cobre | `--copper-primary: #d28746`, `--copper-soft: rgba(210, 135, 70, 0.3)` | `src/index.css:12` |
| Ouro | `--gold-primary: #f2b968`, `--gold-soft: #b8874f`, `--gold-muted: #7c5a35` | `src/index.css:15` |
| Lavanda / roxo | `--lavender-shadow: #8c6f91`, `--lavender-muted: #6b5a6e`, `--purple-deep: #2a182c` | `src/index.css:19` |
| Texto | `--text-primary: #f7ead8`, `--text-soft: #d7c2aa`, `--text-muted: #9f8467` | `src/index.css:23` |
| Bordas | `--border-primary: rgba(242, 185, 104, 0.16)`, `--border-soft: rgba(242, 185, 104, 0.08)` | `src/index.css:27` |
| Brilhos | `--glow-gold`, `--glow-purple` | `src/index.css:30` |
| Semantica ORI | `--ori-institutional`, `--ori-hero`, `--ori-revelation`, `--ori-system`, `--ori-reading`, `--ori-reading-soft` | `src/index.css:33` |
| Estados | `--ori-state-active`, `--ori-state-revealed`, `--ori-state-done`, `--ori-state-next`, `--ori-state-translating`, `--ori-state-sealed`, `--ori-state-soon` | `src/index.css:40` |
| Estado dinamico | `--ori-state-color` via classes/data-state | `src/index.css:592` |
| Atmosferas | `--ori-atmosphere-accent`, `--ori-atmosphere-soft` por contexto (`portal`, `method`, `reading`, `mirror`, `dossie`, `final`) | `src/index.css:820` |

### Cores soltas fora dos tokens

Ha muito uso de cores hard-coded em JSX e em CSS global, principalmente para gradientes, bordas e estados. Principais arquivos por volume encontrado:

| Arquivo | Volume aproximado | Exemplos / sinalizacao |
| --- | ---: | --- |
| `src/pages/EspelhoOri.jsx` | 395 cores/gradientes | Maior concentracao. Usa repetidamente `rgba(242,185,104,...)`, `rgba(255,245,235,...)`, `#090506`, gradientes e objetos `colors` locais. |
| `src/pages/QuizProduto1.jsx` | 329 | Muitos overlays, cards, estados de quiz e backgrounds com `fundo-oraculo-premium.png`. |
| `src/pages/AdminClienteDetalhe.jsx` | 169 | Cards administrativos, secoes de dados, status e acoes com variantes ouro, lavanda, verde e vermelho. |
| `src/pages/MetodoOri.jsx` | 130 | Variantes de cards/tabs/CTAs e gradientes inline. |
| `src/pages/PortalCliente.jsx` | 111 | Cards de produtos, estados de jornada, badges e backgrounds. |
| `src/pages/AdminClientes.jsx` | 83 | Cards de cliente, filtros, badges e acoes admin com verde/lavanda hard-coded. |
| `src/pages/Login.jsx` | 83 | Estilos locais em `<style>`, inputs, mensagens, toggles e CTA. |
| `src/pages/Produto2.jsx` | 78 | Formularios, upload, botoes, badges e cards do Dossie. |
| `src/components/Sidebar.jsx` | 80 | Navegacao, dialog mobile, status de sessao e logout. |
| `src/components/ReportAccordion.jsx` | 79 | Variacoes visuais de acordeao/relatorio. |
| `src/data/archetypeThemes.js` | 60 | Paletas por arquetipo; parecem dados visuais, mas nao passam pelo sistema de tokens. |
| `src/data/reportVisualGuides.js` | 58 | Paletas e texturas de guia visual; tambem fora dos tokens globais. |

Exemplos recorrentes fora do sistema:

- `#090506` como texto escuro de CTA: `src/components/PrimaryButton.jsx:9`, `src/components/StatusCard.jsx:146`, `src/pages/Produto2.jsx:947`, `src/pages/Produto2.jsx:1123`.
- Verdes de sucesso: `#9BE7AE`, `rgba(120,255,160,...)` em `src/pages/AdminClientes.jsx:640`, `src/components/Sidebar.jsx:538`, `src/pages/Login.jsx:945`.
- Lavanda administrativa/oracular: `#d9bdff`, `rgba(183,140,255,...)` em `src/pages/Produto2.jsx:468`, `src/pages/AdminClientes.jsx:573`, `src/pages/AdminClientes.jsx:717`.
- Vermelhos/alertas sem token: `#f1b5bf`, `#ffb0b0`, `rgba(199,106,122,...)` em `src/pages/Login.jsx:927`, `src/components/Produto2ReviewPanel.jsx:246`.
- Fundos de input soltos: `#1b1213` em `src/components/FormInput.jsx:27` e `src/components/FormTextarea.jsx:44`; `#160d0d` em `src/components/Produto2ReviewPanel.jsx:293`.
- O proprio `src/index.css` contem hard-coded alem dos tokens, por exemplo `background-color: #050303` no `body` em `src/index.css:60` e varios `rgba(...)` em foco, cards e atmosfera.

Sinalizacao: a identidade base e bem clara (preto/vinho + ouro/cobre + texto creme), mas a implementacao mistura tokens, valores hard-coded equivalentes e paletas locais por pagina. Isso dificulta troca global de tema e cria pequenas diferencas de brilho/borda para componentes visualmente iguais.

## 2. Tipografia

### Familias usadas

Nao foi encontrada definicao explicita de familia tipografica:

- Sem `@font-face`.
- Sem import de Google Fonts.
- Sem `font-family` em `src/index.css`, `src/App.css`, JSX ou `index.html`.
- Sem `fontFamily` no JS.

Na pratica, a aplicacao usa a fonte sans-serif default do browser/Tailwind. Como o projeto usa Tailwind CSS 4 via `@import "tailwindcss"` em `src/index.css:1`, classes como `font-medium`, `font-semibold`, `text-*` usam a familia sans padrao do Tailwind/browser.

### Escala/estilos tipograficos implementados

| Classe / padrao | Onde se aplica | Origem |
| --- | --- | --- |
| `.ori-type-hero` | Titulos principais, herois, portal/metodo/admin | `src/index.css:329`, usado em `src/pages/PortalCliente.jsx`, `src/pages/MetodoOri.jsx`, `src/pages/AdminClientes.jsx`, `src/pages/Produto1.jsx` |
| `.ori-type-institutional` | Variante institucional; definida junto de hero | `src/index.css:329` |
| `.ori-type-revelation` | Titulos de secao e destaques | `src/index.css:346`, usado em quase todas as paginas |
| `.ori-type-system` | Eyebrows, labels, navegacao, microcopy uppercase | `src/index.css:354` |
| `.ori-type-reading` | Texto editorial | `src/index.css:420` |
| `.ori-type-reading-soft` | Texto de apoio / descricao | `src/index.css:426` |
| `.ori-label-lg/md/sm` | Labels uppercase com tamanhos pequenos | `src/index.css:363` |
| `.editorial-text::first-letter` | Capitulacao de primeira letra | `src/index.css:317` |

### Inconsistencias tipograficas

- A identidade nao fixa uma familia de marca; depende do default do ambiente.
- Ha muito ajuste direto de peso e tracking fora das classes: `fontWeight: 620`, `600`, `650`, `700` em varias paginas (`src/pages/Produto2.jsx:574`, `src/pages/AdminDashboard.jsx:312`, `src/pages/MetodoOri.jsx:634`).
- Ha letter-spacing negativo forte nas classes globais: `.ori-type-hero` usa `letter-spacing: -0.074em` em `src/index.css:341`; `.ori-type-institutional` usa `-0.055em` em `src/index.css:333`. Isso e repetido inline em `src/components/NextStepCard.jsx:470`.
- O sistema usa muitos tamanhos arbitrarios (`text-[9px]`, `text-[10px]`, `text-[34px]`, `xl:text-[56px]`), especialmente em `EspelhoOri`, `QuizProduto1`, `MetodoOri` e admin.
- `src/App.css` parece resquicio do template Vite e referencia variaveis nao definidas (`--accent`, `--accent-bg`, `--border`, `--text-h`, `--social-bg`, `--shadow`) em `src/App.css:5`, `src/App.css:75`, `src/App.css:119`.

## 3. Componentes repetidos

### Botoes

| Variacao encontrada | Caracteristicas | Origem / exemplos |
| --- | --- | --- |
| `PrimaryButton` | Componente proprio; `px-5 py-3`, `rounded-full`, hover scale, `background: var(--gold-primary)`, `color: #090506`. | `src/components/PrimaryButton.jsx:1` |
| CTA primario via `.ori-journey-action` | Classe global controla hover/motion, mas cor/background quase sempre vem inline. | CSS em `src/index.css:709`; usos em `src/components/StatusCard.jsx:141`, `src/components/QuizHero.jsx:227`, `src/pages/MetodoOri.jsx:979`, `src/pages/PortalCliente.jsx:895`, `src/pages/QuizProduto1.jsx:1090` |
| CTA primario sem componente | `rounded-full` + ouro/cobre inline, sem `PrimaryButton`. | `src/pages/Produto2.jsx:1116`, `src/pages/Produto2EmPreparacao.jsx:103`, `src/pages/PortalCliente.jsx:297`, `src/pages/Produto1.jsx:171` |
| CTA primario com gradiente cobre/ouro | Gradiente local, usado em login/onboarding/Espelho. | `src/pages/Login.jsx:890`, `src/components/onboarding/OnboardingNavigation.jsx:32`, `src/pages/EspelhoOri.jsx:3855` |
| Secundario global `.ori-button-secondary` | Classe base com borda ouro translucida e fundo branco translucido. | Definido em `src/index.css:696`; usado em `src/components/Sidebar.jsx:176`, `src/pages/AdminClientes.jsx:376`, `src/pages/AdminClienteDetalhe.jsx:1420` |
| Secundario sobrescrito por contexto | Mesma classe, mas cores lavanda/verde/ouro/neutro inline. | Admin lavanda `src/pages/AdminClientes.jsx:715`; verde sucesso `src/pages/AdminClientes.jsx:725`; logout verde/neutro `src/components/Sidebar.jsx:303`, `src/components/Sidebar.jsx:545` |
| Tabs / segmented controls | `.ori-tab` e `.ori-step`, com `data-state`, mas quase sempre com style inline. | CSS `src/index.css:564`; filtros admin `src/pages/AdminClientes.jsx:456`; metodo `src/pages/MetodoOri.jsx:156`; onboarding `src/components/onboarding/OnboardingQuestionStep.jsx:140` |
| Icon/dot buttons | Botoes circulares de navegacao/progresso sem componente comum. | Dots do Produto 2 `src/pages/Produto2.jsx:1000`; setas do review `src/components/Produto2ReviewPanel.jsx:299`; controles do Produto 1 `src/pages/Produto1.jsx:303` |
| Text button | Botao textual sem superficie. | "Esqueci minha senha" em `src/pages/Login.jsx:847` |
| Disabled/locked button | `cursor-not-allowed`, opacidade, cinza/translucido, repetido inline. | `src/pages/EspelhoOri.jsx:3868`, `src/pages/PortalCliente.jsx:313`, `src/pages/Produto2.jsx:1072` |

Sinalizacao: existem pelo menos tres formas de "botao primario": `PrimaryButton`, `.ori-journey-action` com inline style, e botoes/links raw com `rounded-full` + `var(--gold-primary)`. O secundario tambem se divide entre classe global e varias sobrescritas contextuais.

### Cards e paineis

| Variacao encontrada | Caracteristicas | Origem / exemplos |
| --- | --- | --- |
| `.ori-hero-panel` | Painel hero com gradiente radial/linear, borda ouro e blur. | CSS `src/index.css:445`; usado em `src/components/QuizHero.jsx:7`, `src/pages/Produto2.jsx:845`, `src/pages/PortalCliente.jsx:554`, `src/pages/MetodoOri.jsx:1056` |
| `.ori-card-protagonist` | Card de destaque, fundo vinho/preto + brilho ouro. | CSS `src/index.css:471`; usado em `src/components/StatusCard.jsx:55`, `src/pages/PortalCliente.jsx:240`, `src/pages/AdminClienteDetalhe.jsx:160` |
| `.ori-card-secondary` | Card padrao translúcido. | CSS `src/index.css:481`; usado amplamente: `src/pages/AdminClienteDetalhe.jsx:517`, `src/pages/Produto2.jsx:972`, `src/pages/MetodoOri.jsx:272` |
| `.ori-card-teaser` / `.ori-card-sealed` | Card bloqueado/teaser com opacidade menor. | CSS `src/index.css:487`; usado em `src/components/LockedProductCard.jsx:274`, `src/pages/Produto3.jsx:163`, `src/pages/PortalCliente.jsx:808` |
| `cinematic-card` | Efeito hover/motion aplicado por cima dos cards. | CSS `src/index.css:265`; usado em herois/cards admin/portal |
| Cards custom de admin | `ori-card-secondary`, mas com gradiente `linear-gradient(180deg, rgba(18,9,10,0.72), rgba(7,3,4,0.88))` repetido. | `src/pages/AdminClientes.jsx:397`, `src/pages/AdminClientes.jsx:515`, `src/pages/AdminClienteDetalhe.jsx:549` |
| Cards custom de Espelho | Muitas secoes `relative overflow-hidden rounded-[...]` sem classe card global, com objetos `colors` locais. | `src/pages/EspelhoOri.jsx:1431`, `src/pages/EspelhoOri.jsx:2624`, `src/pages/EspelhoOri.jsx:3900` |
| Cards de formulario Produto 2 | Cards internos e upload com fundo/borda inline. | `src/pages/Produto2.jsx:183`, `src/pages/Produto2.jsx:264`, `src/pages/Produto2.jsx:478` |
| Cards onboarding | Shell visual proprio com borda, aneis, video e superficies locais. | `src/components/onboarding/OnboardingShell.jsx:106`, `src/components/onboarding/OnboardingLeftPanel.jsx:141` |

Sinalizacao: ha um sistema global de cards, mas varias paginas replicam fundos, bordas e raios em vez de consumir somente as classes globais.

### Inputs, textareas e selects

| Variacao encontrada | Caracteristicas | Origem / exemplos |
| --- | --- | --- |
| `FormInput` | `p-4 rounded-2xl`, fundo `#1b1213`, borda token. | `src/components/FormInput.jsx:1` |
| `FormTextarea` | Mesmo visual do input, `min-h-35`. | `src/components/FormTextarea.jsx:1` |
| `.ori-input` login/redefinir | Classe usada, mas estilo vem de `getInputStyle`; placeholder em `<style>` local. | Placeholder `src/pages/Login.jsx:326`; inputs `src/pages/Login.jsx:782`, `src/pages/RedefinirSenha.jsx:145` |
| Produto 2 `sharedClass` | `rounded-[16px] border px-4 py-3`, estilo compartilhado local. | `src/pages/Produto2.jsx:326`, textarea/input `src/pages/Produto2.jsx:437`, `src/pages/Produto2.jsx:445` |
| Onboarding fields | `rounded-[15px]`, foco via classes arbitrarias com rgba hard-coded. | `src/components/onboarding/OnboardingQuestionStep.jsx:91`, `src/components/onboarding/OnboardingQuestionStep.jsx:111` |
| Busca admin | Input `rounded-full`, fundo translúcido, sem classe global de campo. | `src/pages/AdminClientes.jsx:439` |
| Review admin Produto 2 | Textareas/select com estilos inline, select `#160d0d`. | `src/components/Produto2ReviewPanel.jsx:264`, `src/components/Produto2ReviewPanel.jsx:293`, `src/components/Produto2ReviewPanel.jsx:309` |
| Observacoes internas | Textarea admin com `rounded-[26px] p-6`. | `src/pages/AdminClienteDetalhe.jsx:1611` |

Sinalizacao: nao existe um unico componente de formulario usado pelo app. Ha pelo menos seis padroes visuais de campo.

### Modais / dialogs

| Variacao encontrada | Caracteristicas | Origem |
| --- | --- | --- |
| Menu mobile como dialog | `role="dialog"`, `aria-modal="true"`, overlay `bg-black/62`, sheet inferior com `rounded-t-[28px]`, blur e borda ouro. | `src/components/Sidebar.jsx:212` |

Sinalizacao: a varredura encontrou apenas um dialog semantico real. Outros paineis expansivos/accordions existem, mas nao usam `role="dialog"` ou `aria-modal`.

### Badges, chips e status

| Variacao encontrada | Caracteristicas | Origem / exemplos |
| --- | --- | --- |
| `.ori-chip` | Pill pequena, base global; `data-state` troca cor por `--ori-state-color`. | CSS `src/index.css:523`; usados em `src/pages/AdminClientes.jsx:624`, `src/components/NextStepCard.jsx:503`, `src/pages/Produto1.jsx:158` |
| `.ori-badge` | Variante uppercase menor. | CSS `src/index.css:543`; usado em `src/pages/PortalCliente.jsx:787`, `src/pages/EspelhoOri.jsx:3663` |
| `.ori-pill` | Pill mais generica. | CSS `src/index.css:551`; usado em `src/pages/AdminClientes.jsx:557`, `src/pages/AdminClientes.jsx:570` |
| Produto 2 `StatusBadge` | Badge roxa fixa para `aguardando_insumos`, `em_analise`, `publicado`; nao muda cor por status. | `src/pages/Produto2.jsx:457` |
| Admin status chips | Chips com ouro, verde, lavanda e cinza definidos inline. | `src/pages/AdminClientes.jsx:622`, `src/pages/AdminClientes.jsx:635`, `src/pages/AdminClientes.jsx:665` |
| Sidebar status | Card/badge de sessao verde fora dos tokens de estado. | `src/components/Sidebar.jsx:497` |
| Login alerts | Mensagens de erro/sucesso com vermelho/verde inline. | `src/pages/Login.jsx:919`, `src/pages/Login.jsx:936` |

Sinalizacao: existe base global para chip/badge/pill, mas o app frequentemente sobrescreve cor, borda e fundo localmente. Status de sucesso/erro/lavanda nao estao normalizados em tokens globais.

## 4. Espacamento

### Padrao predominante

O projeto usa Tailwind utility-first de forma ampla: `p-*`, `px-*`, `py-*`, `gap-*`, `mb-*`, `rounded-*`, `max-w-*`, `min-h-*`. Isso cria consistencia parcial, especialmente em combinacoes recorrentes:

- `rounded-full`: 232 ocorrencias aproximadas.
- `p-4`: 92 ocorrencias.
- `gap-3`: 108 ocorrencias.
- `mb-4`: 117 ocorrencias.
- `rounded-[18px]`: 51 ocorrencias.
- `rounded-[24px]`: 42 ocorrencias.
- `rounded-[22px]`: 38 ocorrencias.

### Valores soltos / magicos

Ha muitos valores arbitrarios de Tailwind e inline:

- Raios: `rounded-[14px]`, `[15px]`, `[16px]`, `[17px]`, `[18px]`, `[20px]`, `[22px]`, `[24px]`, `[26px]`, `[28px]`, `[30px]`, `[32px]`, `[34px]`, `[36px]`, `[38px]`, `[40px]`, `[42px]`, `[44px]`.
- Alturas/larguras: `min-h-[330px]`, `min-h-[390px]`, `md:min-h-[clamp(...)]`, `w-[118px]`, `w-[122px]`, `max-w-[540px]`, `max-w-[590px]`.
- Background sizes: `72px 72px`, `42px 42px`, `96px 96px`, `58px 58px`.
- Posicionamentos de hero/imagem: `object-[76%_center]`, `object-[82%_center]`, `right-[58px]`, `top-[46px]`.

Arquivos com maior densidade de valores magicos:

- `src/pages/EspelhoOri.jsx`
- `src/pages/QuizProduto1.jsx`
- `src/pages/MetodoOri.jsx`
- `src/pages/AdminClienteDetalhe.jsx`
- `src/components/onboarding/OnboardingShell.jsx`
- `src/components/Sidebar.jsx`

Sinalizacao: ha uso consistente de Tailwind, mas nao ha uma escala restrita de espacamento/raio. A identidade visual depende de muitos ajustes locais, especialmente nos paineis mais elaborados.

## 5. Assets visuais

### Assets principais e uso

| Grupo | Assets | Uso encontrado |
| --- | --- | --- |
| Background global | `public/images/backgrounds/master-bg.png` | Body global `src/index.css:64`, Redefinir senha `src/pages/RedefinirSenha.jsx:75`, Espelho `src/pages/EspelhoOri.jsx:1313` |
| Logo | `public/images/logo/logo-ori.png` | Sidebar, Login, Quiz, Redefinir: `src/components/Sidebar.jsx:242`, `src/pages/Login.jsx:487`, `src/pages/QuizProduto1.jsx:870` |
| Videos de fundo | `public/videos/login/login-bg.mp4`, `public/videos/quizz/quizz-bg.mp4` | Login `src/pages/Login.jsx:383`; Quiz/onboarding `src/pages/QuizProduto1.jsx:582`, `src/components/onboarding/OnboardingShell.jsx:55` |
| Heroes | `atrio-ori.png`, `codigo-final.png`, `diagnostico-arquetipico.png`, `dossie-ori.png`, `dossie-ori-cta.png`, `hero-espelho-ori.png`, `hero-oraculo-ori-v2.png`, `loading-ori.png` | Portal, Produto 2/3, QuizHero, NextStepCard, Espelho, Oraculo |
| Metodo ORI | `public/images/metodo-ori/hero-metodo-ori.png` | `src/pages/MetodoOri.jsx:1066` |
| Arquetipos | 15 imagens em `public/images/archetypes/*.png` | Mapeadas em `src/data/archetypeImages.js` |
| Capas mobile de relatorio | 15 imagens em `public/images/report-covers/*.png` | Mapeadas em `src/pages/Produto1Relatorio.jsx:14` |
| Painéis editoriais | 16 imagens em `public/images/panels/*.png` | Quiz/Espelho, ex. `src/pages/QuizProduto1.jsx:3155`, `src/pages/EspelhoOri.jsx:722` |
| Oraculo | Cartas, verso e fundos em `public/images/espelho-ori/oraculo/*.png` | `src/pages/OraculoOri.jsx:13`, `src/pages/OraculoOri.jsx:173`, `src/pages/EspelhoOri.jsx:20` |
| Produto 2 referencias | JPGs em `public/images/produto-2/importacao` e `opcoes-referencias` | `src/data/produto2Form.js:94`, `src/pages/Produto2.jsx:420` |
| Guias de relatorio | `public/images/report-guides/selvagem-intuitiva/*.png` | Referenciados por dados/relatorio visual |
| Assets PDF duplicados | `backend/app/static/pdf-assets/images/...` | Uso backend/PDF, espelha parte de `public/images` |

### Assets fora do padrao visual

| Asset | Sinalizacao |
| --- | --- |
| `src/assets/react.svg` | Asset do scaffold React/Vite, azul brilhante, nao corresponde a identidade ORI. Nao apareceu referenciado no app atual. |
| `src/assets/vite.svg` | Asset do scaffold Vite, roxo/azul, nao corresponde a identidade ORI. Nao apareceu referenciado no app atual. |
| `src/assets/hero.png` | Asset em `src/assets` sem referencia encontrada na varredura. Precisa validar se e legado. |
| `public/favicon.svg` | Favicon do Vite, roxo/azul, fora da paleta ORI. |
| `public/icons.svg` | Simbolos sociais/documentacao/GitHub/Discord do scaffold; nao correspondem diretamente ao sistema ORI. |
| `src/App.css` | CSS de scaffold com classes `.hero`, `.framework`, `.vite`, `.counter`; parece sobrar do template. |

### Observacoes sobre padrao visual dos assets

- O nucleo visual ORI e consistente nos assets principais: fundos escuros, ouro/cobre, vinho/preto, atmosfera editorial/mistica.
- Os assets de Produto 2 sao referenciais/fotograficos e podem destoar por natureza funcional, mas estao isolados em formulario de dossie.
- Ha duplicacao de familias de imagem entre frontend `public/images` e backend `backend/app/static/pdf-assets/images`; isso pode gerar divergencia futura se uma versao for atualizada e a outra nao.
- Alguns nomes de arquivos usam acentos (`musa-enigmática-mobile.png`, `selvagem-magnética-mobile.png`) e ha um possivel typo em `sobera-indomavel-mobile.png`; isso nao e problema visual por si so, mas aumenta risco operacional.

## Resumo de riscos visuais

- Identidade cromatica forte, mas tokens nao sao a fonte unica da verdade.
- Componentes base existem, porem as paginas grandes criam muitas variacoes locais.
- Tipografia nao tem familia de marca definida; o estilo depende de peso, tracking e escala.
- Espacamento usa Tailwind, mas com muitos valores arbitrarios que tornam o sistema dificil de padronizar.
- Ha assets legados do scaffold Vite/React ainda presentes e claramente fora do padrao ORI.
