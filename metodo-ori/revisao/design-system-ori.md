# Design system ORI - contrato visual minimo

Data: 2026-07-09  
Status: contrato inicial para orientar padronizacao tecnica.  
Base: `revisao/inventario-identidade-visual-implementada.md` e `revisao/plano-padronizacao-identidade-visual.md`.

## Objetivo

Definir a fonte de verdade visual para a UI do Metodo ORI, preservando a atmosfera atual e separando o que e sistema reutilizavel do que e composicao editorial especifica.

## Personalidade visual

- Base escura, profunda e ritualistica.
- Ouro/cobre como luz, revelacao e acao.
- Creme como leitura e presenca humana.
- Vinho/preto como profundidade.
- Lavanda/roxo como camada simbolica, admin ou oracular.
- Verde apenas para sucesso/concluido/conectado.
- Vermelho/rosa apenas para erro, alerta e acoes destrutivas.

## Paleta oficial de UI

### Base

| Papel | Token atual | Valor |
| --- | --- | --- |
| Fundo principal | `--bg-primary` | `#050202` |
| Fundo secundario | `--bg-secondary` | `#0b0506` |
| Fundo de card | `--bg-card` | `rgba(18, 9, 10, 0.72)` |
| Vinho profundo | `--wine-dark` / `--wine-deep` | `#210606` |
| Vinho suave | `--wine-muted` | `#4a1a1a` |

### Acao e revelacao

| Papel | Token atual | Valor |
| --- | --- | --- |
| Ouro principal | `--gold-primary` | `#f2b968` |
| Ouro suave | `--gold-soft` | `#b8874f` |
| Ouro apagado | `--gold-muted` | `#7c5a35` |
| Cobre principal | `--copper-primary` | `#d28746` |
| Cobre translucido | `--copper-soft` | `rgba(210, 135, 70, 0.3)` |

### Texto

| Papel | Token atual | Valor |
| --- | --- | --- |
| Texto principal | `--text-primary` | `#f7ead8` |
| Texto suave | `--text-soft` | `#d7c2aa` |
| Texto discreto | `--text-muted` | `#9f8467` |
| Texto de leitura | `--ori-reading` | `rgba(247, 234, 216, 0.66)` |
| Texto de leitura suave | `--ori-reading-soft` | `rgba(247, 234, 216, 0.52)` |

### Estados

| Estado | Uso | Valor atual recomendado |
| --- | --- | --- |
| `active` | Etapa atual, acao primaria, item ativo | `#f2b968` |
| `revealed` | Revelado, disponivel, destaque simbolico | `#d28746` |
| `done` / `success` | Concluido, liberado, conectado, publicado | `#9be7ae` |
| `next` | Proximo passo, em caminho | `#d9a45f` |
| `translating` | Processando, em analise, em transformacao | `#d7c2aa` |
| `sealed` / `muted` | Bloqueado, ausente, nao iniciado | `rgba(247, 234, 216, 0.42)` |
| `soon` | Em breve, nao liberado | `rgba(247, 234, 216, 0.34)` |
| `danger` | Erro, alerta, acao destrutiva | `#ffb0b0` ou equivalente tokenizado |
| `lavender` / `info` | Admin, oraculo, camada simbolica secundaria | `#d9bdff` ou equivalente tokenizado |

## Paletas editoriais separadas

Estas paletas podem continuar fora dos tokens globais, desde que fiquem nomeadas como dados editoriais e nao sejam usadas como UI comum:

- `src/data/archetypeThemes.js`
- `src/data/reportVisualGuides.js`
- Overlays narrativos de `QuizProduto1`, `EspelhoOri`, `OraculoOri` e `MetodoOri`
- Cores de imagens, cartas, arquetipos, capas e guias visuais

Regra: cor editorial pode ser local quando representa narrativa, arquetipo, carta, capa ou imagem. Cor de botao, input, card comum, badge/status, alerta e foco deve vir do sistema.

## Tipografia

### Estado atual

Nao ha familia de marca definida. A UI usa a sans-serif padrao do ambiente/Tailwind.

### Classes oficiais existentes

| Classe | Uso |
| --- | --- |
| `.ori-type-hero` | Titulos principais e herois |
| `.ori-type-institutional` | Titulo institucional |
| `.ori-type-revelation` | Titulo de secao, revelacao e destaque |
| `.ori-type-system` | Eyebrows, labels, navegacao, microcopy |
| `.ori-type-reading` | Texto editorial principal |
| `.ori-type-reading-soft` | Texto de apoio |
| `.ori-label-lg`, `.ori-label-md`, `.ori-label-sm` | Labels uppercase |

### Diretriz

- Manter as classes atuais como contrato inicial.
- Evitar novos `fontWeight` inline quando uma classe atender.
- Evitar novos `letterSpacing` inline, exceto em composicoes editoriais.
- Antes de escolher uma fonte de marca, nao introduzir familias diferentes por tela.

## Raios e espacamentos

### Escala recomendada de raio

| Nome | Valor | Uso |
| --- | --- | --- |
| `sm` | `14px` | Chips, tabs pequenas, controles compactos |
| `md` | `18px` | Cards internos e campos compactos |
| `lg` | `24px` | Cards padrao e secoes pequenas |
| `xl` | `30px` | Paineis maiores |
| `hero` | `42px` | Hero panels e cards protagonistas desktop |
| `pill` | `999px` | Botoes, badges, pills |

### Escala recomendada de padding

| Nome | Mobile | Desktop | Uso |
| --- | --- | --- | --- |
| `compact` | `p-3` / `p-3.5` | `p-4` | Chips, cards pequenos |
| `card` | `p-4` | `p-5` / `p-6` | Cards comuns |
| `panel` | `p-5` / `p-6` | `p-7` / `p-8` | Paineis e formularios |
| `hero` | `p-4 pt-7` | `p-8` / `p-10` | Hero panels |

Diretriz: novos valores arbitrarios de raio ou padding precisam justificar composicao editorial ou restricao responsiva especifica.

## Componentes oficiais

### Button

Componente alvo: `OriButton`.

| Variant | Uso | Visual esperado |
| --- | --- | --- |
| `primary` | CTA principal, concluir, iniciar, continuar | Ouro/cobre, texto escuro `#090506`, `rounded-full` |
| `secondary` | Acao secundaria, voltar, abrir ficha neutra | Fundo translucido, borda ouro suave, texto creme/ouro |
| `ghost` | Acao textual/discreta | Sem superficie forte, cor ouro ou texto suave |
| `danger` | Despublicar, remover, erro irreversivel | Vermelho/rosa sem competir com CTA principal |
| `success` | Estado/acao positiva contextual | Verde suave, uso restrito |
| `lavender` | Admin/oraculo/info secundaria | Lavanda/roxo suave |
| `disabled` | Bloqueado/indisponivel | Opacidade reduzida, cursor bloqueado, contraste legivel |

Tamanhos: `sm`, `md`, `lg`.

Regra: novos botoes primarios nao devem ser criados como `button` raw com `background: var(--gold-primary)`.

### Card

Componente alvo: `OriCard`.

| Variant | Uso |
| --- | --- |
| `secondary` | Card padrao translucido |
| `protagonist` | Card principal de uma tela ou secao |
| `hero` | Hero panel |
| `teaser` | Produto/etapa bloqueada ou preview |
| `sealed` | Conteudo indisponivel |
| `admin` | Card admin com suporte a tons info/success/danger |

Regra: cards podem receber imagens/overlays editoriais, mas superficie comum deve usar variantes.

### Field

Componente alvo: `OriField`.

Tipos: `input`, `textarea`, `select`, `file`.

Estados: `default`, `focus`, `error`, `success`, `disabled`.

Regra: novos inputs e textareas devem usar o mesmo fundo, borda, foco e placeholder. Campos editoriais podem ter layout proprio, mas nao cores soltas para estado comum.

### Badge

Componente alvo: `OriBadge`.

| Tone | Uso |
| --- | --- |
| `gold` | Resultado, revelacao, destaque |
| `success` | Liberado, concluido, publicado, conectado |
| `lavender` | Admin, oraculo, info simbolica |
| `muted` | Ausente, bloqueado, nao iniciado |
| `danger` | Erro, alerta |
| `next` | Proximo passo |

Tamanhos: `xs`, `sm`, `md`.

Regra: status de jornada, produto e admin devem usar `OriBadge` ou classes globais equivalentes.

### Sheet / Modal

Componente alvo: `OriSheet`.

Uso inicial: menu mobile da Sidebar.

Contrato:

- `role="dialog"`
- `aria-modal="true"`
- Overlay escuro.
- Painel com fundo `rgba(5,2,2,0.94)` ou token equivalente.
- Borda ouro suave.
- Fechar por botao e overlay.

## Regras para codigo novo

- Nao criar novo botao primario raw.
- Nao criar novo input/textarea raw com estilo proprio para UI comum.
- Nao adicionar novas cores hard-coded para estados de UI.
- Nao criar novo badge/status sem usar `OriBadge` ou tokens de estado.
- Nao adicionar novo raio arbitrario quando a escala existente resolver.
- Cores locais sao permitidas apenas para narrativa visual/editorial, imagens, arquetipos, cartas e overlays especificos.

## Prioridade de migracao

1. Login e Redefinir senha: inputs, CTA, feedback.
2. Sidebar: sheet mobile, status conectado, logout.
3. Portal: cards de produto, CTAs, badges.
4. Admin: status e acoes.
5. Produto 2: campos, upload, status.
6. Quiz/Espelho/Oraculo: controles comuns, preservando composicao editorial.

## Definicao de pronto

Uma tela e considerada padronizada quando:

- CTAs usam `OriButton` ou classe oficial equivalente.
- Inputs usam `OriField` ou classe oficial equivalente.
- Status usam `OriBadge` ou tokens de estado.
- Cards comuns usam `OriCard` ou variantes globais.
- Nao ha novas cores hard-coded para UI comum.
- O visual final continua reconhecivelmente ORI.
