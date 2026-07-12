# Produto 3 - Codigo Final

Desenho inicial de dados, fluxo e backend para o Produto 3 do Metodo ORI, incorporando a planilha `CONSTRUCAO DA CAPSULA TELURICA` e o dossie `Produto 3 - O Codigo Final - Capsula de Inverno Maudi`.

Este documento ainda nao implementa nada. Ele serve como base de validacao antes de criar SQL, backend e frontend.

## 1. Leitura Da Metodologia Real

O Produto 3 nao e apenas um formulario de inventario. Ele tem duas camadas bem diferentes:

1. A cliente entrega o guarda-roupa real, rotina, fotos e preferencias.
2. O ORI/admin faz a curadoria tecnica e transforma isso em uma capsula publicada.

A planilha mostra sete blocos metodologicos:

- Guia para montagem
- Passo a passo
- Perfil da cliente
- Inventario de pecas
- Capsula final
- Looks
- Lacunas e compras

O PDF mostra que a entrega final e editorial e aplicada, com estes blocos:

- Da essencia ao guarda-roupa real
- Formula da imagem
- O que sustenta x o que gera ruido
- Capsula sazonal principal
- Subcapsulas por ocasiao, viagem ou contexto
- Como usar a capsula no dia a dia
- Lacunas reais
- Codigo final / sintese

## 2. Tabela Supabase Proposta

Tabela principal: `public.produto_3_codigos_finais`

Segue o padrao de `produto_2_dossies`: uma linha por cliente, insumos em JSONB, diagnostico tecnico em JSONB e entrega publicada em JSONB.

```sql
create table if not exists public.produto_3_codigos_finais (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,

  status text not null default 'aguardando_inventario',

  insumos jsonb not null default '{}'::jsonb,
  analise_preliminar jsonb not null default '{}'::jsonb,
  diagnosticos jsonb not null default '{}'::jsonb,
  capsula jsonb not null default '{}'::jsonb,

  ia_rascunho jsonb not null default '{}'::jsonb,
  ia_versao text,
  ia_gerado_em timestamptz,
  ia_revisado_em timestamptz,

  enviado_em timestamptz,
  publicado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint produto_3_codigos_finais_status_check
    check (status in ('aguardando_inventario', 'em_analise', 'publicado'))
);

create unique index if not exists produto_3_codigos_finais_cliente_unique
  on public.produto_3_codigos_finais (cliente_id);

create index if not exists produto_3_codigos_finais_cliente_status_idx
  on public.produto_3_codigos_finais (cliente_id, status);
```

Coluna complementar em `clientes`:

```sql
alter table public.clientes
add column if not exists produto_3_liberado boolean not null default false;
```

Status de jornada sugeridos:

- `Código Final liberado`
- `Código Final em análise`
- `Código Final publicado`

## 3. RLS E Protecao

Mesmo modelo do Produto 2.

Cliente autenticada pode:

- Ver a propria linha quando `clientes.user_id = auth.uid()`.
- Inserir/atualizar `insumos` se `clientes.produto_3_liberado is true`.
- Enviar para analise enquanto ainda nao publicado.

Cliente nao pode:

- Alterar `diagnosticos`.
- Alterar `capsula`.
- Alterar `ia_rascunho`.
- Definir `status = 'publicado'`.
- Alterar `publicado_em`.
- Alterar qualquer coisa depois de publicado.

Admin pode:

- Ver, editar, publicar, despublicar e apagar.
- Alterar diagnosticos, capsula e rascunho de IA.

## 4. Storage Privado

Bucket sugerido: `produto-3-inventario`

Paths:

```txt
produto-3/{cliente_id}/visao-geral/{filename}
produto-3/{cliente_id}/roupas/{item_id}/{filename}
produto-3/{cliente_id}/calcados/{item_id}/{filename}
produto-3/{cliente_id}/acessorios/{item_id}/{filename}
produto-3/{cliente_id}/looks-referencia/{filename}
```

O frontend salva apenas `path`, nunca URL publica.

RLS do storage:

- Cliente pode subir/ler/remover objetos sob `produto-3/{cliente_id}/...` quando esse `cliente_id` pertence ao `auth.uid()`.
- Admin tem acesso total via `current_user_is_ori_admin()`.

## 5. Estrutura De `insumos`

`insumos` guarda o material bruto enviado pela cliente e o contexto herdado dos produtos anteriores.

```js
{
  contexto_jornada: {
    resultado_produto_1: "",
    arquetipo_principal: "",
    arquetipo_secundario: "",
    nome_arquetipico: "",
    formula_produto_1: "",

    produto_2_publicado: false,
    kibbe: "",
    influencia_corporal: "",
    cartela_sazonal: "",
    cartela_patton: "",
    metal: "",
    resumo_corpo: {},
    resumo_cor: {},
    resumo_cabelo: {}
  },

  perfil_capsula: {
    estacao_ou_recorte: "",
    tamanho_desejado: "",
    neutra_1: "",
    neutra_2: "",
    destaque_1: "",
    destaque_2: "",
    destaque_3: "",
    peca_base_da_capsula: "",
    formula_de_imagem: ""
  },

  rotina_real: {
    trabalho: { frequencia: "", observacoes: "" },
    casa: { frequencia: "", observacoes: "" },
    eventos: { frequencia: "", observacoes: "" },
    deslocamento: { frequencia: "", observacoes: "" },
    viagem: { frequencia: "", observacoes: "" },
    exercicio: { frequencia: "", observacoes: "" },
    espiritualidade: { frequencia: "", observacoes: "" },
    lazer: { frequencia: "", observacoes: "" },
    outros: ""
  },

  preferencias: {
    prioridades: [],
    nao_abre_mao: [],
    evita: [],
    dificuldade_principal: "",
    desejo_de_imagem: "",
    nivel_manutencao: "",
    compra_por_impulso: "",
    pecas_que_ama_mas_nao_usa: "",
    pecas_que_usa_mas_nao_representam: ""
  },

  inventario: {
    roupas: [],
    calcados: [],
    bolsas: [],
    acessorios: []
  },

  uploads: {
    fotos_visao_geral: [],
    fotos_por_categoria: {},
    looks_referencia: []
  }
}
```

## 6. Item De Inventario

A planilha mostra que cada peca precisa carregar informacao objetiva e tambem campos que depois serao avaliados pelo admin.

Item-base:

```js
{
  id: "uuid-local-ou-server",
  tipo: "roupa | calcado | bolsa | acessorio",
  categoria: "TOP",
  peca: "Camiseta justa tank top",
  cor: "Preto",
  tecido_material: "Helanca",
  modelagem: "Justa",
  estacao: ["Todas estacoes"],
  ocasiao: ["Casual"],
  estado: "Regular",
  uso_declarado: "uso_muito",
  contextos_uso: ["casa", "trabalho"],
  combina_com_quantas_pecas: null,
  foto_paths: [],
  observacao_cliente: ""
}
```

Campos preenchidos ou revisados pelo admin em `diagnosticos.matriz_pecas`:

```js
{
  item_id: "",
  cor_esta_na_capsula: "sim | parcial | nao",
  respeita_corpo_kibbe: "sim | parcial | nao",
  respeita_arquetipo: "sim | parcial | nao",
  vive_na_rotina: "sim | parcial | nao",
  combina_com_3_ou_mais: "sim | parcial | nao",
  pontuacao: 0,
  status_curadoria: "entra_na_capsula | entra_com_styling | ajustavel | ruido",
  funcao_na_capsula: "base_identitaria | identidade | conexao | hero_piece | ajustavel",
  decisao: "manter | ajustar | usar_com_styling | doar_vender | substituir | comprar_base",
  observacoes_admin: ""
}
```

## 7. Regra De Pontuacao

Baseada na planilha.

Critérios:

- Cor na capsula: ate 2 pontos
- Corpo/Kibbe coerente: ate 2 pontos
- Arquetipo coerente: ate 2 pontos
- Combina com 3+ pecas: ate 2 pontos
- Estado, conforto e rotina: ate 2 pontos

Interpretação:

- `9-10`: entra na capsula
- `7-8`: entra com styling
- `5-6`: ajustavel
- `0-4`: ruido / fora da capsula

Esses pesos podem ficar configurados em código ou em JSON de metodologia no backend depois.

## 8. Estrutura De `diagnosticos`

`diagnosticos` e a camada tecnica/admin. A cliente nao edita.

```js
{
  perfil_tecnico: {
    arquétipo: "",
    kibbe: "",
    influencia_corporal: "",
    cartela_sazonal: "",
    cartela_patton: "",
    metal: "",
    formula_de_imagem: "",
    peca_base_da_capsula: ""
  },

  matriz_pecas: [],

  resumo_quantitativo: {
    total_itens_analisados: 0,
    total_capsula: 0,
    por_categoria: {
      tops: { atual: 0, ideal_min: 10, ideal_max: 14, status: "" },
      partes_de_baixo: { atual: 0, ideal_min: 6, ideal_max: 8, status: "" },
      vestidos_macacoes: { atual: 0, ideal_min: 4, ideal_max: 6, status: "" },
      terceiras_pecas: { atual: 0, ideal_min: 4, ideal_max: 6, status: "" },
      calcados: { atual: 0, ideal_min: 5, ideal_max: 7, status: "" },
      bolsas: { atual: 0, ideal_min: 2, ideal_max: 4, status: "" },
      acessorios: { atual: 0, ideal_min: 8, ideal_max: 12, status: "" }
    }
  },

  sustenta: [],
  gera_ruido: [],
  lacunas: [],
  excessos: [],
  oportunidades: []
}
```

## 9. Estrutura De `capsula`

`capsula` e a entrega final publicada para a cliente.

```js
{
  titulo: "O Codigo Final",
  subtitulo: "Capsula de Inverno",
  cliente_nome: "",
  frase_sintese: "",

  capa: {
    imagem_principal_path: "",
    arquetipo: "",
    nome_arquetipico: "",
    tipo_corporal: "",
    cartela: "",
    chamada: ""
  },

  narrativa: {
    da_essencia_ao_guarda_roupa: "",
    essencia: "",
    corpo_sensorial: "",
    capsula_real: ""
  },

  formula_imagem: {
    titulo: "",
    componentes: [
      {
        nome: "Base macia",
        descricao: "",
        icone: "",
        imagem_referencia_path: ""
      }
    ],
    resultado: "",
    frase: ""
  },

  sustenta_gera_ruido: {
    sustenta: [],
    gera_ruido: [],
    frase_final: ""
  },

  capsula_principal: {
    nome: "Capsula de Inverno",
    composicao_final: {
      vestidos_macacoes: 0,
      blusas: 0,
      partes_de_baixo: 0,
      terceiras_pecas: 0,
      calcados: 0,
      bolsas: 0,
      acessorios: 0,
      total: 0
    },
    criterios_curadoria: [],
    paleta_ideal: [],
    uso_da_capsula: [],
    categorias: [
      {
        nome: "Vestidos / Macacoes",
        item_ids: [],
        observacao: ""
      }
    ]
  },

  subcapsulas: [
    {
      nome: "Capsula da viagem",
      contexto: "Montanha",
      descricao: "",
      selecao: {
        looks_completos: 0,
        blusas: 0,
        partes_de_baixo: 0,
        terceiras_pecas: 0,
        calcados: 0,
        total_itens: 0
      },
      looks: []
    }
  ],

  looks: [
    {
      id: "look-1",
      titulo: "",
      ocasiao: "Casual",
      tipo_de_look: "Base | Completo com terceira peca | Vestido/Macacao",
      item_ids: {
        top: "",
        parte_de_baixo: "",
        vestido_macacao: "",
        terceira_peca: "",
        calcado: "",
        bolsa: "",
        acessorio: ""
      },
      cores_do_look: [],
      coerencia_de_cor: "coerente | parcial | ruido",
      status: "aprovado | parcial | revisar",
      nota: ""
    }
  ],

  guia_de_uso: [
    {
      ordem: 1,
      titulo: "Escolha a base",
      descricao: ""
    }
  ],

  lacunas_reais: [
    {
      prioridade: "alta | media | baixa",
      categoria: "",
      sugestao_de_peca: "",
      funcao: "",
      cores_ideais: [],
      por_que_importa: "",
      quantidade: 1,
      imagem_referencia_path: ""
    }
  ],

  sintese_final: {
    texto: "",
    pilares: [],
    formula_final: [],
    frase_final: ""
  }
}
```

## 10. Formulario Multi-Step Da Cliente

Arquivo futuro: `src/data/produto3Form.js`

O formulario nao precisa capturar a curadoria tecnica. Ele deve capturar o guarda-roupa real com clareza suficiente para o admin construir a capsula.

### Passo 1 - Abertura E Contexto

Campos herdados, em modo somente leitura quando existirem:

- Codigo das Deusas
- Arquétipo principal/secundario
- Resultado do Produto 2
- Tipo corporal
- Cartela
- Cabelo/corpo/cor

Campos editaveis:

- Estacao/recorte da capsula: inverno, verao, viagem, trabalho, ano todo.
- Objetivo principal da capsula.

### Passo 2 - Rotina Real

Coleta contextos:

- Trabalho
- Casa
- Eventos
- Deslocamento
- Viagem
- Lazer
- Espiritualidade
- Exercício

Campos por contexto:

- Frequência
- Nivel de exigencia visual
- Nivel de conforto necessario
- Observacoes

### Passo 3 - Fotos Gerais

Upload multiplo:

- Armario aberto
- Gavetas
- Sapatos
- Bolsas
- Acessorios
- Looks que costuma repetir

### Passo 4 - Inventario De Roupas

Cadastro repetivel por peca ou por categoria.

Categorias:

- Tops
- Partes de baixo
- Vestidos / macacoes
- Terceiras pecas

Campos por peca:

- Foto
- Categoria
- Nome/descricao
- Cor
- Tecido/material
- Modelagem
- Estacao
- Ocasião
- Estado
- Uso declarado: `uso muito`, `uso pouco`, `nunca uso`
- Observacao

### Passo 5 - Calcados, Bolsas E Acessorios

Campos similares:

- Foto
- Categoria
- Cor/material
- Conforto
- Ocasião
- Uso declarado
- Observacao

### Passo 6 - Pecas Afetivas E Ruídos

Perguntas abertas:

- Quais pecas voce ama, mas quase nao usa?
- Quais pecas voce usa muito, mas sente que nao te representam?
- Quais pecas foram compradas por impulso?
- Quais pecas voce quer manter por memoria, afeto ou simbolo?
- O que voce mais repete sem pensar?

### Passo 7 - Revisao E Envio

Resumo:

- Total de roupas
- Total de calcados
- Total de bolsas/acessorios
- Fotos pendentes
- Categorias vazias

Ações:

- Salvar rascunho
- Enviar para análise

## 11. Endpoints Cliente

Criar `backend/app/routes/produto3.py`

```txt
GET /api/produto-3/me
```

Retorna a linha do Produto 3, contexto herdado e capsula apenas se publicada.

```txt
POST /api/produto-3/insumos
```

Salva rascunho.

Regras:

- Requer autenticação.
- Requer `produto_3_liberado`.
- Nao aceita alteracao se status for `publicado`.
- Faz merge com contexto do Produto 1 e Produto 2.

```txt
POST /api/produto-3/enviar
```

Envia para analise.

Regras:

- Define `status = 'em_analise'`.
- Define `enviado_em`.
- Gera `analise_preliminar`.
- Atualiza `clientes.status_jornada = 'Código Final em análise'`.

## 12. Endpoints Admin

Adicionar em `backend/app/routes/admin.py`.

```txt
GET /api/admin/produto-3/{cliente_id}
```

Retorna cliente, insumos, analise preliminar, diagnosticos, capsula e rascunho IA.

```txt
PUT /api/admin/produto-3/{cliente_id}
```

Atualiza campos de revisão:

- `status`
- `insumos`
- `analise_preliminar`
- `diagnosticos`
- `capsula`
- `ia_rascunho`

```txt
POST /api/admin/produto-3/{cliente_id}/rascunho-ia
```

Opcional. Gera uma primeira leitura de curadoria a partir de:

- Produto 1
- Produto 2 publicado
- Inventario real
- Rotina real

```txt
POST /api/admin/produto-3/{cliente_id}/publicar
```

Payload:

```js
{
  diagnosticos: {},
  capsula: {}
}
```

Efeitos:

- Define `status = 'publicado'`.
- Define `publicado_em`.
- Define `ia_revisado_em`.
- Atualiza `clientes.status_jornada = 'Código Final publicado'`.

```txt
POST /api/admin/produto-3/{cliente_id}/despublicar
```

Efeitos:

- Volta `status = 'em_analise'`.
- Limpa `publicado_em`.
- Mantem diagnosticos/capsula para revisão.
- Atualiza `clientes.status_jornada = 'Código Final em análise'`.

## 13. Serviço Backend

Criar `backend/app/services/produto3_service.py`.

Funções principais:

```py
get_produto3_me()
save_produto3_insumos()
submit_produto3_insumos()
get_admin_produto3()
update_admin_produto3()
publish_admin_produto3()
unpublish_admin_produto3()
```

Helpers:

```py
ensure_produto3_released(cliente)
fetch_produto3_row_by_cliente_id()
upsert_produto3_row()
patch_produto3_row()
merge_produto3_insumos_with_context()
build_produto3_analise_preliminar()
row_to_response()
row_to_admin_response()
update_cliente_status_jornada()
```

`build_produto3_analise_preliminar()` pode começar simples:

- Conta peças por categoria.
- Conta uso declarado.
- Identifica categorias ausentes.
- Identifica excesso por categoria.
- Lista peças sem foto.
- Lista peças sem ocasião.
- Lista peças sem uso declarado.
- Calcula total potencial da capsula.

## 14. Schemas Pydantic

Criar `backend/app/schemas/produto3.py`.

```py
Produto3Status = Literal[
    "aguardando_inventario",
    "em_analise",
    "publicado",
]

class Produto3InsumosRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    insumos: dict[str, Any] = Field(default_factory=dict)

class Produto3AdminUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: Produto3Status | None = None
    insumos: dict[str, Any] | None = None
    analise_preliminar: dict[str, Any] | None = None
    diagnosticos: dict[str, Any] | None = None
    capsula: dict[str, Any] | None = None
    ia_rascunho: dict[str, Any] | None = None

class Produto3CodigoFinalResponse(BaseModel):
    id: str | None = None
    cliente_id: str | None = None
    status: Produto3Status
    produto_3_liberado: bool = False
    insumos: dict[str, Any] = Field(default_factory=dict)
    analise_preliminar: dict[str, Any] = Field(default_factory=dict)
    diagnosticos: dict[str, Any] = Field(default_factory=dict)
    capsula: dict[str, Any] = Field(default_factory=dict)
    enviado_em: datetime | None = None
    publicado_em: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

class Produto3AdminResponse(Produto3CodigoFinalResponse):
    cliente: dict[str, Any] | None = None
    ia_rascunho: dict[str, Any] = Field(default_factory=dict)
    ia_versao: str | None = None
    ia_gerado_em: datetime | None = None
    ia_revisado_em: datetime | None = None

class Produto3PublishRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    diagnosticos: dict[str, Any] = Field(default_factory=dict)
    capsula: dict[str, Any] = Field(default_factory=dict)
```

## 15. Ordem Recomendada De Implementacao

1. Criar SQL `supabase-produto-3-codigo-final.sql`.
2. Criar schemas Pydantic.
3. Criar service `produto3_service.py`.
4. Criar route cliente `produto3.py`.
5. Adicionar endpoints admin.
6. Adicionar funções frontend em `api.js`.
7. Criar `produto3Form.js`.
8. Transformar `Produto3.jsx` de tela estática em formulário real.
9. Criar painel admin `Produto3ReviewPanel`.
10. Só depois pensar em IA/rascunho automático.

## 16. Decisão De Arquitetura

Recomendação: manter uma tabela única com JSONB no primeiro ciclo.

Motivo:

- O método ainda pode evoluir.
- A entrega mistura inventário, avaliação, editorial e looks.
- Produto 2 já usa esse padrão.
- O admin precisa de flexibilidade para revisar manualmente.

Possível evolução futura:

- Normalizar itens em `produto_3_itens`.
- Normalizar looks em `produto_3_looks`.
- Normalizar lacunas em `produto_3_lacunas`.

Mas isso só vale quando o produto estiver estável e houver necessidade real de filtros, métricas ou relatórios avançados.
