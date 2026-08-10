# Runbook de Recuperação de Dados — Supabase / Método Ori

**Status:** DRAFT — RECOVERY-4 DOC-1 (pós-validação empírica C3)

Este é um documento operacional. Antes de usar, ler integralmente esta
seção de abertura:

- cobre **backup lógico PostgreSQL/Supabase** (roles/schema/data);
- **não equivale** a backup dos bytes/arquivos do Supabase Storage —
  ver seção 16;
- restore real em **produção** exige o Hard Gate da seção 15 — nunca é
  automático;
- este documento **não contém nenhum secret** (password, connection
  string completa, JWT, service_role, API key, access token, passphrase
  GPG). Placeholders usados: `<PROJECT_REF>`, `<DB_HOST>`,
  `<DB_USER>`, `<BACKUP_TIMESTAMP>`, `<ISOLATED_TARGET>`.

Este documento é baseado em duas bases de evidência distintas, citadas
sempre com sua origem explícita — nunca fundidas em uma alegação
única:

- **RECOVERY-1** (07/08/2026): execução real contra um projeto
  Supabase de teste com **cópia de dados de produção**, validando
  paridade quantitativa real (seção 22);
- **RECOVERY-4 / fase C3** (10/08/2026): bateria de testes empíricos
  contra **dois projetos Supabase de laboratório, descartáveis e sem
  nenhum vínculo com produção** (`SOURCE`/`TARGET` conceituais),
  validando a sintaxe exata de cada comando do pipeline
  dump→cripto→checksum→restore→paridade, incluindo uma fixture
  **sintética** não vazia (seção 24).

Onde a sintaxe exata de um comando permanece sem validação, este
documento marca explicitamente:

> **VALIDAR EM C3 — COMANDO EXATO**

em vez de inventar sintaxe plausível. A lista atualizada (a maior
parte já resolvida pela fase C3) está consolidada na seção 23; a
matriz de validação empírica está na seção 24.

**Nenhum destes testes envolveu o projeto Supabase de produção do
Método Ori.** A validação de que o mecanismo funciona em laboratório
não substitui o Hard Gate da seção 15 nem autoriza restore automático
de produção.

---

## Índice

1. [Escopo](#1-escopo)
2. [Regra de ouro](#2-regra-de-ouro)
3. [Modos operacionais A/B/C](#3-modos-operacionais-abc)
4. [Quando gerar backup](#4-quando-gerar-backup)
5. [Pré-requisitos e acessos](#5-pré-requisitos-e-acessos)
6. [Estrutura dos artefatos](#6-estrutura-dos-artefatos)
7. [MODO A — Backup preventivo](#7-modo-a--backup-preventivo)
8. [Criptografia](#8-criptografia)
9. [Checksum](#9-checksum)
10. [Cópia off-site e roundtrip](#10-cópia-off-site-e-roundtrip)
11. [MODO B — Restore isolado](#11-modo-b--restore-isolado)
12. [Papéis reservados / roles.restore.sql](#12-papéis-reservados--rolesrestoresql)
13. [Validação de schema e paridade](#13-validação-de-schema-e-paridade)
14. [MODO C — Incidente real](#14-modo-c--incidente-real)
15. [Hard Gate de restore em produção](#15-hard-gate-de-restore-em-produção)
16. [Storage — fronteira de cobertura](#16-storage--fronteira-de-cobertura)
17. [Cleanup](#17-cleanup)
18. [Evidência operacional](#18-evidência-operacional)
19. [PASS / FAIL / ABORT](#19-pass--fail--abort)
20. [Política proposta de backup/retenção](#20-política-proposta-de-backupretenção)
21. [Limitações e dívidas conhecidas](#21-limitações-e-dívidas-conhecidas)
22. [Evidência histórica RECOVERY-1](#22-evidência-histórica-recovery-1)
23. [Pontos pendentes — VALIDAR EM C3](#23-pontos-pendentes--validar-em-c3)
24. [Validação empírica RECOVERY-4](#24-validação-empírica-recovery-4)
25. [Armadilhas encontradas no laboratório](#25-armadilhas-encontradas-no-laboratório)

---

## 1. Escopo

Cobre:

- backup lógico do banco Postgres/Supabase de produção do Método Ori
  (roles, schema, dados);
- proteção do backup (criptografia, checksum, cópia off-site);
- teste de restore em ambiente isolado e descartável;
- critérios de decisão para um eventual restore real em produção;
- registro de evidência operacional de cada execução.

Não cobre:

- backup/restore dos bytes/arquivos do Supabase Storage (gap
  registrado na seção 16, não implementado nesta fase);
- criação/gestão de infraestrutura nova;
- migrations de schema no Git (dívida separada, seção 21);
- procedimento passo-a-passo de overwrite destrutivo de produção —
  restore real em produção é sempre decisão coordenada, nunca um
  script autônomo (seção 15).

---

## 2. Regra de ouro

> **NUNCA restaurar sobre produção por reflexo.**
>
> Se houver suspeita de perda/corrupção de dados:
>
> 1. preservar evidência do incidente;
> 2. identificar a origem/causa do incidente;
> 3. preservar o estado atual, se isso for tecnicamente seguro;
> 4. identificar o backup candidato para eventual restore;
> 5. validar o checksum desse backup;
> 6. testar o candidato em ambiente isolado, quando possível;
> 7. comparar o resultado isolado com o estado esperado;
> 8. obter decisão humana coordenada antes de qualquer ação em
>    produção;
> 9. **somente então** considerar uma ação real em produção.
>
> **Se o SOURCE ou o TARGET de qualquer operação não estiver
> identificado de forma inequívoca:**
>
> ```
> ABORTAR
> → ESCALAR
> ```

---

## 3. Modos operacionais A/B/C

| Modo | Nome | Ambiente | Observação |
|---|---|---|---|
| **A** | Backup preventivo | Produção (somente leitura/dump) | Não altera produção. |
| **B** | Restore isolado / teste | Projeto/DB isolado e descartável | **Pode mutar o destino isolado** — essa mutação é esperada e segura, desde que o destino nunca seja produção. |
| **C** | Incidente real com possível restore de produção | Avaliação + isolado primeiro | **Nunca executa restore de produção automaticamente** — sempre termina em decisão humana coordenada (seção 15). |

---

## 4. Quando gerar backup

Ver política proposta completa na seção 20. Resumo:

- backup periódico (cadência proposta: semanal);
- antes de mudança crítica de schema/RLS;
- antes de migration potencialmente destrutiva;
- antes de operação manual relevante sobre dados de produção.

---

## 5. Pré-requisitos e acessos

- Acesso de leitura/dump ao projeto Supabase de produção via
  credencial obtida no **gerenciador oficial da equipe**.
- Supabase CLI instalada. Versões observadas:
  - `2.110.0` — usada na execução histórica do RECOVERY-1 (seção 22);
  - `2.113.0` — **VALIDADO EMPIRICAMENTE** na bateria de testes de
    laboratório do RECOVERY-4/C3 (seção 24), incluindo auditoria do
    código-fonte público da própria CLI (release `v2.113.0`).
  - reconfirmar a versão atual antes de cada execução real — não
    presumir que uma versão futura mantém o mesmo comportamento sem
    checar o changelog.
- **Modelo de credenciais da CLI — VALIDADO EMPIRICAMENTE (C3):**
  - `supabase db dump --linked` (usado por este runbook, ver seção 7)
    **não exige a Database Password do operador**: a CLI obtém uma
    credencial temporária de leitura via Management API
    (`POST /v1/projects/{ref}/cli/login-role`), usando **apenas** um
    Personal Access Token (PAT) de laboratório;
  - o PAT deve ser fornecido **somente** via variável de ambiente
    `SUPABASE_ACCESS_TOKEN` **com escopo de processo** (prefixado na
    própria invocação do comando, nunca `export` global) — nunca via
    `supabase login` (que persiste o token em disco/keyring do
    sistema);
  - `supabase db dump --db-url` é um caminho **diferente**, que
    **não** consulta `--password`/`SUPABASE_DB_PASSWORD` — não usar
    essa flag esperando que ela leia a senha automaticamente;
  - `--dry-run` **não é seguro de usar com uma senha real**: se um
    valor de senha não-vazio estiver presente no ambiente, `--dry-run`
    imprime o script expandido (incluindo a senha) em texto plano no
    terminal. Evitar `--dry-run` sempre que uma senha real puder estar
    envolvida.
- Acesso ao destino de cópia off-site aprovado pela equipe (ver
  seção 10).
- Para MODO B: permissão para criar/derrubar um projeto ou banco
  isolado e descartável.
- Para MODO C / restore de produção: acessos conforme a matriz de
  responsabilidades e escalonamento do runbook principal
  (`docs/RUNBOOK-RECOVERY-OPERACIONAL.md`, seção 19).

**Nenhuma credencial real é armazenada neste documento** — ver a
subseção "Modelo de credenciais" abaixo.

### Modelo de credenciais

- toda credencial vem do **gerenciador oficial da equipe** — nunca
  deste documento;
- password **nunca** entra em argumento de linha de comando (CLI);
- password **nunca** fica gravada em shell history;
- password **nunca** fica em arquivo `.env` temporário;
- password **nunca** fica em nenhum arquivo Markdown, incluindo este;
- password **nunca** aparece em relatório, log ou chat;
- toda execução real futura deve obter a credencial via **prompt
  invisível/interativo** (ex. leitura sem eco de tela) no momento do
  uso, nunca hardcoded ou pré-preenchida;
- a implementação exata do mecanismo seguro de entrada de credenciais
  será validada em C3 nos pontos pertinentes da seção 23 (dump,
  criptografia e restore podem envolver credenciais, e cada um deve
  ser validado no seu próprio ponto).

Nenhum comando de entrada de credencial é registrado aqui enquanto não
estiver validado.

**Se qualquer secret for exposto durante uma execução:**

```
ABORTAR a operação em curso
→ tratar o secret como comprometido
→ encaminhar para rotação/revogação apropriada ao tipo de credencial
→ somente retomar a operação após o tratamento
```

O valor comprometido **nunca** deve ser registrado na evidência
operacional (seção 18) — apenas o fato de que houve exposição.

---

## 6. Estrutura dos artefatos

```
backup/
  roles.sql
  schema.sql
  data.sql
  <BASELINE_MANIFEST>

encrypted/
  metodo-ori-supabase-<BACKUP_TIMESTAMP>.tar.gpg
  metodo-ori-supabase-<BACKUP_TIMESTAMP>.tar.gpg.sha256
```

`<BASELINE_MANIFEST>` é o manifesto de baseline da execução (seção 13)
— seu formato exato (JSON/CSV/Markdown/outro) **ainda não está
definido**, ver seção 23, item 5. O nome do arquivo é um marcador
conceitual, não um nome de arquivo definitivo.

O timestamp `20260807-201224` citado na evidência histórica (seção 22)
é um valor **histórico de uma execução específica**, não um padrão a
ser reutilizado — cada execução real gera o seu próprio
`<BACKUP_TIMESTAMP>`.

**Ciclo esperado:**

```
gerar dumps (roles.sql, schema.sql, data.sql)
→ capturar manifesto de baseline (<BASELINE_MANIFEST>, seção 13)
→ verificar que o manifesto está associado ao mesmo <BACKUP_TIMESTAMP>
  dos dumps desta execução
→ empacotar dumps + manifesto juntos
→ criptografar o pacote completo (seção 8)
→ gerar checksum do pacote completo (seção 9)
→ validar pacote
→ enviar off-site (seção 10)
→ validar roundtrip
→ checksum novamente
→ remover plaintext temporário com segurança (seção 17)
```

**O manifesto de baseline fica protegido pelo mesmo checksum e pela
mesma criptografia do pacote** — não é um artefato separado, solto ou
gerenciado à parte dos dumps.

---

## 7. MODO A — Backup preventivo

Sem incidente em curso. Executado por rotina ou antes de mudança
crítica (seção 4).

Componentes comprovados pela evidência do RECOVERY-1:

- **Ferramenta:** Supabase CLI.
- **Conexão:** Supavisor Session Pooler, porta 5432.
- **Artefatos gerados:** `roles.sql`, `schema.sql`, `data.sql`.

**Sintaxe exata dos comandos de dump — VALIDADO EMPIRICAMENTE (C3,
Supabase CLI `2.113.0`, projeto de laboratório descartável):**

```
SUPABASE_ACCESS_TOKEN="<PAT_ESCOPO_PROCESSO>" \
  supabase db dump --linked --role-only --file roles.sql

SUPABASE_ACCESS_TOKEN="<PAT_ESCOPO_PROCESSO>" \
  supabase db dump --linked --file schema.sql

SUPABASE_ACCESS_TOKEN="<PAT_ESCOPO_PROCESSO>" \
  supabase db dump --linked --data-only --file data.sql
```

Confirmado empiricamente (laboratório, `roles_dump_exit=0`,
`schema_dump_exit=0`, `data_dump_exit=0`):

- **nenhuma Database Password é solicitada nem fornecida** — o
  mecanismo `--linked` é passwordless (ver seção 5);
- o PAT é usado somente com escopo de processo (variável de ambiente
  prefixada na própria invocação), nunca `export` global, nunca
  `supabase login`;
- `schema.sql` exclui os schemas internos gerenciados (`auth`,
  `storage`, etc.) do DDL — mas `data.sql` **não** exclui esses
  schemas por padrão (`--schema '*'`), ou seja, dados de `auth`/
  `storage` podem estar presentes no dump de dados mesmo sem a
  respectiva definição de schema em `schema.sql`;
- `roles.sql` gerado por `pg_dumpall --roles-only` já comenta
  automaticamente `CREATE ROLE`/`ALTER ROLE` para um conjunto de
  papéis reservados conhecidos, mas **não** cobre toda gramática SQL
  possível de incompatibilidade (ver seção 12, exemplo real
  `GRANT SET ON PARAMETER`).

**Não validado nesta fase:** comportamento equivalente contra o
projeto de **produção** real do Método Ori — a validação acima é de
laboratório (seção 24). Reconfirmar o comando antes do primeiro uso em
produção.

Ao final da geração dos três artefatos, capturar o manifesto de
baseline da execução (`<BASELINE_MANIFEST>`, seção 13) antes de
empacotar — o manifesto integra o mesmo pacote protegido pela
criptografia e pelo checksum (seção 6). Só então seguir para
criptografia (seção 8).

---

## 8. Criptografia

- Empacotamento seguido de **criptografia simétrica GPG/AES-256**.
- **Passphrase exclusiva**, armazenada separadamente no gerenciador
  oficial de senhas da equipe — nunca no mesmo local do pacote.
- A passphrase **nunca** deve ser passada de um jeito que fique
  gravada em shell history, log ou neste documento.

**Sintaxe exata do comando GPG — VALIDADO EMPIRICAMENTE (C3, GnuPG
`2.4.4`, roundtrip local com payload sintético, sem qualquer secret
real):**

```
printf '%s\n' "$PASSPHRASE" | gpg \
  --homedir "<GNUPG_HOME_ISOLADO>" \
  --no-options \
  --batch \
  --yes \
  --pinentry-mode loopback \
  --passphrase-fd 0 \
  --no-symkey-cache \
  --cipher-algo AES256 \
  --s2k-digest-algo SHA256 \
  --s2k-mode 3 \
  --symmetric \
  --output pacote.tar.gpg \
  pacote.tar
```

Descriptografia (mesmo homedir, mesma passphrase via `--passphrase-fd
0`):

```
printf '%s\n' "$PASSPHRASE" | gpg \
  --homedir "<GNUPG_HOME_ISOLADO>" \
  --no-options \
  --batch \
  --yes \
  --pinentry-mode loopback \
  --passphrase-fd 0 \
  --no-symkey-cache \
  --decrypt \
  --output pacote-restaurado.tar \
  pacote.tar.gpg
```

Confirmado empiricamente (`encrypt_exit=0`, `decrypt_exit=0`,
roundtrip SHA-256 e byte-a-byte idênticos):

- `--cipher-algo AES256` deve ser explícito — o GnuPG por padrão pode
  negociar AES-128 se não for forçado;
- a passphrase **nunca** entra em argv, `.env` ou arquivo — chega ao
  processo GPG somente via `--passphrase-fd 0` (pipe protegido, não
  shell history);
- usar um `--homedir` isolado e descartável (nunca o `~/.gnupg`
  operacional do usuário) para qualquer teste ou execução dedicada a
  este procedimento;
- `gpg --list-packets` pode ser usado como inspeção diagnóstica
  adicional do pacote cifrado, mas **o formato de saída não é estável
  entre versões do GnuPG** — nunca tornar o resultado do procedimento
  dependente de parsing textual de `--list-packets` (ver seção 25).

**Não validado nesta fase:** a passphrase real de produção nunca foi
usada em nenhum teste — nem em laboratório, nem em qualquer execução
registrada neste documento.

**Classificação da execução de validação (RECOVERY-4/C3):**
`C3-GPG=PASS_FINAL_CRYPTO_VALIDATION`.

---

## 9. Checksum

- Algoritmo: **SHA-256**.
- Gerado **antes** do upload/off-site.
- Revalidado **após** o download/roundtrip do destino off-site.

```
arquivo criptografado
→ checksum local (SHA-256)
→ envio off-site
→ download/roundtrip
→ checksum novamente (SHA-256)
→ comparação
```

**Se os hashes divergirem em qualquer ponto:**

```
FAIL
BACKUP NÃO CONFIÁVEL
→ NÃO usar este pacote para restore
```

**Formato do manifesto — VALIDADO EMPIRICAMENTE (C3):** usar sempre o
formato GNU padrão, verificável com `sha256sum -c`:

```
<HASH_SHA256><dois espaços><caminho ou nome do arquivo>
```

Um manifesto com os campos **invertidos** (`<arquivo><dois
espaços><hash>`) já causou abortagem segura em laboratório
(`sem linhas de checksum bem formatadas`) — o comportamento correto
nesse caso é abortar antes de qualquer restore, não seguir adiante
(ver seção 25). Preferir caminho absoluto no manifesto quando o
arquivo de manifesto puder ser lido de um diretório de trabalho
diferente do diretório dos dumps.

---

## 10. Cópia off-site e roundtrip

- O RECOVERY-1 validou uma cópia off-site com roundtrip íntegro
  (download de volta com SHA-256 idêntico ao original) — ver
  evidência histórica na seção 22.
- Este documento **não trata o destino off-site como uma dependência
  arquitetural fixa**: o requisito é um **destino off-site aprovado
  pela equipe**, com capacidade de round-trip verificável (enviar,
  baixar, comparar checksum).
- O mecanismo historicamente validado (Google Drive) é citado apenas
  como referência de que o fluxo funciona na prática — não como
  exigência obrigatória de provider.

---

## 11. MODO B — Restore isolado

Sempre em projeto/DB **isolado e descartável**, nunca em produção.
Este modo **pode mutar o destino isolado** — essa mutação é esperada
e segura, desde que o TARGET nunca seja produção (confirmar conforme
passo 2 abaixo).

**ANTES**

1. criar/selecionar um projeto ou banco isolado (`<ISOLATED_TARGET>`);
2. confirmar explicitamente que `<ISOLATED_TARGET>` **não é**
   produção;
3. registrar SOURCE (backup usado) e TARGET (`<ISOLATED_TARGET>`) na
   evidência (seção 18);
4. confirmar região/compatibilidade relevante em relação à produção
   (historicamente: mesma região, `us-east-1`);
5. validar o checksum do backup antes de usá-lo (seção 9) — se
   inválido, ABORT imediato;
6. obter as credenciais de `<ISOLATED_TARGET>` pelo gerenciador
   oficial (nunca hardcoded).

**AÇÃO**

7. **primeira tentativa de cada execução: sempre restaurar
   `roles.sql` ORIGINAL** — nunca reutilizar automaticamente um
   `roles.restore.sql` de uma execução histórica ou anterior.
   - **se essa tentativa falhar por causa relacionada a roles**:
     ABORTAR aquela tentativa e seguir integralmente o gate da
     seção 12 (reproduzir e compreender a incompatibilidade,
     confirmar que não é corrupção/erro do backup, obter
     autorização específica para aquela execução) — **somente
     então** criar um `roles.restore.sql` novo e autorizado, e
     realizar uma nova tentativa controlada usando esse derivado;
8. restaurar `schema.sql`;
9. restaurar `data.sql`;
10. usar transação com parada em erro quando tecnicamente aplicável
    (historicamente validado: `--single-transaction`,
    `ON_ERROR_STOP=1`, via `psql`).

**Sintaxe exata completa do comando `psql`/CLI de restore — VALIDADO
EMPIRICAMENTE (C3, cliente `postgres:17.6`/`psql 17.6` via Docker,
contra projeto Supabase de laboratório descartável, `TARGET !=
SOURCE`, `TARGET != produção`):**

```
docker run --rm -it \
  -v "<SOURCE_DUMPS_DIR>:/work:ro" \
  -w /work \
  postgres:17.6 \
  psql \
    "host=<TARGET_POOLER_HOST> port=5432 dbname=postgres user=postgres.<TARGET_PROJECT_REF> sslmode=require" \
    -X \
    -W \
    -v ON_ERROR_STOP=1 \
    -1 \
    -f roles.sql \
    -f schema.sql \
    -f data.sql
```

Confirmado empiricamente:

- `-1` (equivalente a `--single-transaction`) com múltiplos `-f`
  encapsula **todos** os arquivos numa única transação `BEGIN`/
  `COMMIT` — uma falha em qualquer ponto reverte tudo;
- `-v ON_ERROR_STOP=1` interrompe a transação no primeiro erro; exit
  code `3` observado no laboratório para "script error com
  `ON_ERROR_STOP`", distinto de exit `1` (erro fatal do `psql`) e
  exit `2` (conexão perdida em modo não-interativo);
- a Database Password do `TARGET` é digitada **somente** de forma
  interativa via `psql -W` (nunca `PGPASSWORD`, `.pgpass`, `.env` ou
  argumento de linha de comando);
- montar o diretório de dumps como **somente leitura** (`:ro`) dentro
  do container — o dump nunca deve ser gravável durante o restore;
- **ordem obrigatória**: `roles.sql` (ou `roles.restore.sql`, ver
  seção 12) → `schema.sql` → `data.sql`;
- para qualquer valor escalar lido do `TARGET` antes/depois do restore
  (contagens, fingerprints), **não** capturar a saída de
  `docker run --rm -it ... psql -W ...` via `$(...)`/crase — isso
  quebra a alocação de TTY necessária para o prompt de senha (ver
  armadilha na seção 25). Usar `psql -o <arquivo>` e ler o resultado
  do arquivo depois, no host.

**Não validado nesta fase:** execução real do comando acima contra o
projeto de produção do Método Ori.

**DEPOIS**

11. validar o resultado da execução (exit code);
12. validar o schema restaurado (seção 13);
13. validar contagens (seção 13);
14. validar `auth.users` / `auth.identities` (seção 13);
15. executar smoke de banco (consultas de leitura simples nas tabelas
    críticas);
16. registrar PASS/FAIL (seção 19) na evidência (seção 18);
17. **somente depois** de evidência e paridade registradas, executar
    cleanup (seção 17).

---

## 12. Papéis reservados / roles.restore.sql

Aprendizado real, registrado como fato específico do RECOVERY-1 — não
como regra universal:

- na 1ª tentativa de restore, `psql` falhou na instrução
  `ALTER ROLE "supabase_admin"`, por ser um papel reservado da
  plataforma gerenciada, não modificável pelo usuário hospedado;
- a transação abortou corretamente (`--single-transaction`) e a
  validação pós-falha confirmou que nenhuma alteração parcial ficou
  no ambiente isolado;
- o `roles.sql` **oficial permaneceu intocado** — nenhuma edição foi
  feita no backup original;
- foi criado um **derivado explícito**, `roles.restore.sql`, omitindo
  **somente** a instrução incompatível identificada;
- a 2ª tentativa, usando o derivado, teve sucesso (exit 0).

**Procedimento para futuras execuções — não permite omissão
arbitrária:**

1. **primeiro reproduzir e identificar exatamente** a falha/
   incompatibilidade encontrada durante o restore — nunca presumir a
   causa;
2. **confirmar que é incompatibilidade do destino gerenciado** (ex.
   papel reservado da plataforma) **e não corrupção ou erro do
   próprio backup** — se houver qualquer dúvida sobre a origem do
   problema, tratar como diferença inesperada (ver passo 6);
3. o `roles.sql` **original permanece sempre intocado** — nenhuma
   edição no backup em nenhuma circunstância;
4. **somente** criar `roles.restore.sql` quando a alteração estiver
   **explicitamente compreendida e autorizada para aquela execução
   específica** — nunca como reação automática a qualquer instrução
   que falhe;
5. registrar a diferença exata omitida e a justificativa completa
   (o quê, por quê, com base em qual evidência da falha);
6. comparar o derivado com o original — a única diferença aceitável é
   exatamente a omissão explicitamente autorizada e registrada no
   passo 5;
7. se aparecer **qualquer diferença além da explicitamente
   autorizada**:

```
ABORTAR
→ ESCALAR
```

8. se a incompatibilidade encontrada for **nova, ambígua, ou não
   totalmente compreendida** — **não omitir automaticamente**:

```
NÃO CRIAR roles.restore.sql
ABORTAR
→ ESCALAR
```

O caso histórico `ALTER ROLE "supabase_admin"` (RECOVERY-1) permanece
registrado como **evidência histórica de um incidente específico** —
**não é autorização automática** para omitir a mesma instrução (ou
qualquer outra) em execuções futuras. Cada execução deve reproduzir e
autorizar a omissão de forma independente, seguindo os passos acima.

**Segundo caso real, validado empiricamente em laboratório
(RECOVERY-4/C3):**

- primeira tentativa de restore, com `roles.sql` original, falhou com
  `psql:roles.sql:13: ERROR: permission denied for parameter
  log_min_messages`;
- a instrução causadora **não é** `ALTER ROLE` — é
  `GRANT SET ON PARAMETER "log_min_messages" TO
  "supabase_realtime_admin";`, uma gramática distinta (privilégio de
  parâmetro, recurso do PostgreSQL 15+), que a filtragem automática de
  papéis reservados da CLI **não** intercepta;
- análise estática confirmou: ocorrência única no arquivo, sem
  relação com password/LOGIN/membership/ownership/RLS/dados —
  concede apenas o privilégio de `SET log_min_messages` a um papel
  interno gerenciado pela própria Supabase;
- rollback transacional confirmado (`public`/`auth.users`/fingerprint
  de papéis idênticos antes e depois da falha; dumps originais
  imutáveis pelo SHA-256);
- derivado `roles.restore.sql` criado a partir do original, omitindo
  **exatamente** essa única instrução (remoção por igualdade de linha
  completa, não por substring/regex ampla — abortar se o número de
  remoções for diferente de 1);
- diff auditado programaticamente: 0 adições, 0 outras remoções,
  restante do arquivo byte-a-byte idêntico;
- segunda tentativa, com o derivado, `roles.restore.sql` → `schema.sql`
  → `data.sql`, teve sucesso (`restore_exit=0`).

**Estes dois casos (`ALTER ROLE "supabase_admin"` e
`GRANT SET ON PARAMETER "log_min_messages"`) são exemplos reais
documentados — nenhum dos dois é uma regra universal de que "essa
instrução sempre deve ser removida".** Cada execução futura deve
reproduzir e compreender sua própria falha, seguindo os passos 1–8
acima, mesmo que a instrução encontrada seja textualmente idêntica a
um caso já documentado aqui.

---

## 13. Validação de schema e paridade

**Baseline:** sempre o **backup/source da execução atual** — nunca um
número histórico congelado como "esperado".

**Como esse baseline é preservado:** durante o MODO A, junto à geração
do backup (seção 7), registrar um **manifesto de baseline** da
execução, contendo no mínimo:

- timestamp;
- lista de tabelas relevantes;
- row counts por tabela relevante;
- `auth.users`;
- `auth.identities`;
- identificação do backup/timestamp (`<BACKUP_TIMESTAMP>`)
  correspondente.

O manifesto **não contém secrets**. Ele é empacotado **junto com os
dumps** (seção 6, `<BASELINE_MANIFEST>`) e protegido pelo mesmo
checksum e pela mesma criptografia do pacote daquela execução — não é
mantido separado nem gerenciado à parte. A associação inequívoca ao
`<BACKUP_TIMESTAMP>` da execução é garantida por estarem dentro do
mesmo pacote.

No MODO B, a comparação é sempre: **TARGET restaurado vs. manifesto do
SOURCE correspondente ao backup usado** — nunca contra números
históricos congelados de outra execução.

**A) Paridade quantitativa — comparada diretamente contra o
manifesto** (itens que o manifesto de baseline efetivamente contém,
ver acima):

- inventário/lista de tabelas relevante;
- row counts por tabela relevante;
- `auth.users`;
- `auth.identities`.

**B) Validações complementares — não são baseline armazenado no
manifesto** (executadas na própria validação, não comparadas contra
um valor previamente registrado no manifesto, enquanto esse escopo
não for ampliado/validado):

- schema/tabelas/colunas/constraints críticas (existência e
  estrutura básica);
- dados-chave/fluxos críticos dos produtos P1;
- smoke de banco (consultas de leitura simples nas tabelas críticas
  — ver seção 11, passo 15).

Os números da execução histórica do RECOVERY-1 (seção 22) servem
apenas como **referência de evidência histórica** — não são o
baseline de nenhuma execução futura.

**Mecanismo de captura e comparação — VALIDADO EMPIRICAMENTE (C3,
metodologia genérica; conjunto de tabelas/queries de produção real
ainda pendente, ver observação abaixo):**

- cada valor escalar (contagem, `min`/`max`, fingerprint) é obtido via
  `docker run --rm -it ... psql -W ... -o "<arquivo>" -c "<SQL>"` —
  **nunca** via `$(docker run --rm -it ...)` (quebra o TTY da senha,
  ver seção 25) — e depois lido do arquivo de evidência no host;
- fingerprint de conteúdo validado com
  `md5(string_agg(<colunas concatenadas>, E'\n' ORDER BY <chave>))`
  sobre a tabela relevante — captura alteração em qualquer linha/
  coluna sem expor os dados individuais;
- o manifesto de baseline é um arquivo texto simples
  (`chave=valor`, uma linha por métrica, sem secrets), comparável
  byte-a-byte entre SOURCE (antes/depois da janela de dump) e entre
  SOURCE e TARGET (após o restore) via `diff`;
- confirmado empiricamente para uma fixture sintética de laboratório
  (`public.c3_recovery_fixture`, 3 linhas, com `IDENTITY`,
  `PRIMARY KEY`, `UNIQUE`, `CHECK`): baseline do TARGET pós-restore
  idêntico byte-a-byte ao baseline do SOURCE (`fixture_table=1`,
  `row_count=3`, `min_id=1`, `max_id=3`, fingerprint idêntico,
  `identity_signal=1`, `primary_key_count=1`, `unique_count=1`,
  `check_count=1`).

**Observação importante — o que isso comprova e o que não comprova:**
o laboratório validou que **o mecanismo de captura/comparação
funciona corretamente** para uma tabela de aplicação com dados não
vazios. **Não comprova**, por si só, o conjunto exato de
tabelas/queries que deverão compor o manifesto de baseline de
produção — isso continua sendo um item específico a definir (ver
seção 23, item 5) com as tabelas reais do Método Ori (`clientes`,
`payment_orders`, `auth.users`, etc., conforme seção 22).

> **VALIDAR EM C3 — pendente:** lista final de tabelas/queries do
> manifesto de baseline de **produção** (o mecanismo já está
> validado; o conteúdo específico de produção ainda não).

---

## 14. MODO C — Incidente real

Nenhum passo deste modo executa restore de produção automaticamente.

1. classificar o incidente (usar a classificação do runbook
   principal, seções 5/6, quando aplicável);
2. preservar evidência do estado atual;
3. se tecnicamente seguro, gerar um backup lógico do estado atual de
   produção antes de qualquer outra ação;
4. identificar o backup candidato para eventual restore;
5. validar o checksum do candidato (seção 9);
6. avaliar o que aconteceu em produção **depois** do ponto coberto
   por esse backup;
7. identificar quais dados seriam perdidos se esse backup fosse
   restaurado (diferença entre o ponto do backup e o estado atual);
8. restaurar/testar o candidato em ambiente isolado quando possível
   (MODO B);
9. comparar o resultado isolado com o estado esperado;
10. acionar os responsáveis conforme a matriz de escalonamento do
    runbook principal (seção 19);
11. decisão coordenada — somente a partir daqui um restore real de
    produção pode ser considerado, sujeito ao Hard Gate (seção 15).

---

## 15. Hard Gate de restore em produção

**Caminho padrão deste runbook** (fluxo autônomo, o único que este
documento realmente habilita):

```
NUNCA RESTAURAR PRODUÇÃO AUTOMATICAMENTE.

Antes de qualquer restore real em produção, TODOS obrigatórios:

- incidente confirmado;
- backup-alvo identificado;
- checksum válido;
- teste isolado PASS;
- impacto avaliado;
- compatibilidade da aplicação avaliada;
- dados que seriam perdidos após o ponto do backup identificados;
- responsável técnico acionado;
- administrador Supabase acionado;
- janela/impacto comunicados à equipe;
- plano de rollback da própria recuperação definido.

Se qualquer condição essencial faltar (incluindo teste isolado sem
PASS):

ABORTAR RESTORE DE PRODUÇÃO
→ ESCALAR
```

**Se o teste isolado não puder ser realizado:**

- registrar explicitamente o motivo pelo qual não foi possível;
- **o caminho padrão deste runbook é**: `ABORTAR RESTORE DE PRODUÇÃO
  → ESCALAR` — a ausência de teste isolado **nunca** equivale a PASS,
  e **o operador sozinho nunca pode liberar o restore** nessa
  condição;
- uma eventual decisão extraordinária de prosseguir mesmo sem teste
  isolado só pode ocorrer por **revisão coordenada e documentada dos
  responsáveis autorizados** (fora do fluxo autônomo deste runbook) —
  este documento **não** descreve nem habilita esse caminho
  extraordinário como procedimento executável.

**Importante:** esta versão do documento não descreve um
passo-a-passo destrutivo de overwrite de produção. Restore real em
produção permanece, propositalmente, uma decisão coordenada e não um
procedimento autônomo executável por um único operador.

---

## 16. Storage — fronteira de cobertura

- O RECOVERY-1 validou o backup/restore lógico do **banco Postgres**
  (roles, schema, dados), com paridade confirmada.
- **Não existe evidência de backup dos bytes/arquivos** armazenados no
  Supabase Storage — os três artefatos validados (`roles.sql`,
  `schema.sql`, `data.sql`) são exclusivamente um dump lógico de
  banco.
- **Restore lógico de Postgres não deve ser apresentado como restore
  dos arquivos/binários do Storage** — são mecanismos distintos.
- Eventuais **metadados** sobre objetos de Storage podem residir em
  tabelas Postgres. A cobertura/paridade específica desses metadados
  **não foi auditada explicitamente no RECOVERY-1** — não afirmar que
  estão cobertos, nem afirmar que não estão. Não confundir metadados
  (que podem estar dentro do dump lógico) com os **bytes reais dos
  objetos** (que definitivamente não têm cobertura validada).
- Essa lacuna **não invalida** o procedimento de backup/restore
  Postgres descrito neste documento.

**Classificação atual: P2** (ver seção 21). Reavaliar prioridade caso
o Storage passe a conter artefatos críticos sem cópia alternativa.

Backup de Storage está **fora do escopo desta versão** do documento.

---

## 17. Cleanup

Guardrails obrigatórios:

- **remover o plaintext temporário somente depois de TODOS os passos
  abaixo concluídos, nesta ordem**: dumps concluídos → manifesto de
  baseline capturado → pacote (dumps + manifesto) criado →
  criptografia concluída → checksum local com PASS → cópia off-site
  concluída → download/roundtrip concluído → checksum pós-roundtrip
  com PASS;
- **se o roundtrip ainda não foi validado (checksum pós-roundtrip
  ainda não confirmado): NÃO remover o plaintext automaticamente** —
  a única cópia seria o plaintext local, e removê-lo antes da
  confirmação do roundtrip deixaria a execução sem nenhuma cópia
  confiavelmente validada;
- **nunca** remover a única cópia válida de um backup;
- projeto/banco isolado (MODO B) só é removido **depois** de evidência
  e paridade registradas (seção 18);
- confirmar o caminho literal do que será removido antes de qualquer
  `rm`;
- **proibido** usar wildcard amplo em comandos de remoção;
- variável vazia combinada com `rm`/`rm -rf` é **STOP** — nunca
  executar;
- **produção nunca é alvo de cleanup** deste procedimento.

Este documento não define comandos de remoção genéricos prontos para
copiar/colar — cada execução real deve confirmar o caminho exato no
momento, manualmente.

---

## 18. Evidência operacional

Template reutilizável (Markdown simples), sem secrets:

```markdown
## Backup/Restore de dados — <data/hora>

- Timestamp:
- Motivo:
- Modo (A/B/C):
- Operador:
- SOURCE:
- TARGET de teste isolado (se aplicável):
- TARGET isolado != produção confirmado: SIM/NAO/N-A
- Restore de produção considerado: SIM/NAO
- Hard Gate seção 15 atendido: SIM/NAO/N-A
- Restore de produção autorizado: SIM/NAO/N-A
- Papel(is) que participaram da decisão (ver runbook principal, seção 19 — sem dados pessoais sensíveis):
- CLI/versão usada:
- Artefatos gerados:
- Manifesto de baseline incluído no pacote: SIM/NAO
- Identificador do manifesto:
- Tamanho do pacote:
- Checksum local (SHA-256):
- Destino off-site:
- Checksum pós-roundtrip (SHA-256):
- Restore iniciado em:
- Restore concluído em:
- Divergências encontradas:
- Validação de schema:
- Contagens (counts):
- auth.users:
- auth.identities:
- roles.restore.sql usado? Motivo (se sim):
- Cleanup realizado: SIM/NAO
- Resultado: PASS / FAIL / ABORT
- Escalonamento acionado: SIM/NAO + papel (ver runbook principal, seção 19)
- Follow-up necessário:
```

Nenhum campo deste template deve conter password, connection string
completa, JWT, service_role, API key, access token ou passphrase.

---

## 19. PASS / FAIL / ABORT

**PASS**
- artefato de backup válido;
- checksum válido em todas as etapas (local e pós-roundtrip);
- restore isolado concluído com sucesso, quando aplicável ao modo;
- paridade dentro do esperado (baseline da própria execução);
- evidência completa registrada (seção 18).

**FAIL**
- operação foi executada, mas o resultado é inválido;
- divergência inesperada encontrada (schema, roles ou dados);
- checksum divergente em qualquer ponto;
- restore falhou.
- **Escalar** — não repetir mecanicamente sem entender a causa.

**ABORT**
- SOURCE ou TARGET não identificados de forma inequívoca;
- o **TARGET de teste isolado** (MODO B) aponta ou pode apontar para
  produção — produção nunca é um TARGET de teste isolado válido;
- uma operação real sobre produção está sendo considerada **fora do
  Hard Gate da seção 15** (produção como TARGET de um restore real
  só pode ser considerada depois do Hard Gate cumprido e de decisão
  coordenada — isso não é, em si, uma condição de ABORT automático
  no MODO C, e sim a única forma válida de prosseguir);
- qualquer secret foi exposto durante a execução;
- backup considerado não confiável (checksum divergente);
- diferença inesperada entre `roles.sql` e `roles.restore.sql`;
- acesso insuficiente para a ação necessária;
- qualquer pré-condição essencial do Hard Gate (seção 15) ausente.

**Secret exposto — tratamento obrigatório (independente do restante do resultado):**

```
secret exposto
→ considerar a credencial comprometida
→ acionar rotação/revogação conforme o tipo de credencial
→ registrar na evidência (seção 18) somente que houve um incidente
  de credencial — nunca o valor exposto
```

---

## 20. Política proposta de backup/retenção

> **POLÍTICA PROPOSTA — AINDA NÃO AUTOMATIZADA.**
>
> Não existe hoje agendamento/job automático de backup. A execução
> registrada no RECOVERY-1 foi manual e pontual.

Proposta:

- backup periódico: **semanal**;
- backup adicional: **antes de mudança crítica de schema/RLS**;
- backup adicional: **antes de migration potencialmente destrutiva**;
- backup adicional: **antes de operação manual relevante em dados**;
- retenção proposta: **4–8 versões** criptografadas, mantidas off-site.

Esta seção descreve uma proposta a ser avaliada e formalizada em fase
futura (ver plano C1–C6 do B2.1) — não um mecanismo já em produção.

---

## 21. Limitações e dívidas conhecidas

**P1**
- **Migrations Git incompletas**: scripts versionados
  (`metodo-ori/supabase-*.sql`) não reconstroem sozinhos o schema
  completo do zero (ex. `CREATE TABLE public.clientes` existe em
  produção, confirmado durante o RECOVERY-1, mas não está
  refletida nos scripts versionados). Essa dívida **não invalida** o
  backup lógico validado, que continua sendo a fonte de recuperação
  funcional — a migration Git incompleta não deve ser apresentada
  como substituto do backup.
- **Política/cadência de backup ainda não automatizada** (seção 20).

**P2**
- **Bytes de Supabase Storage não cobertos/validados** (seção 16).
- **PITR não é utilizado no mecanismo atual**: no estado observado
  durante o RECOVERY-1 (07/08/2026), o projeto estava no plano Free e
  backups automáticos/PITR não faziam parte do mecanismo utilizado.
  O procedimento canônico deste documento não depende de PITR; a
  disponibilidade e a compatibilidade da Supabase CLI e dos recursos
  do plano devem ser **reconfirmadas** antes de cada execução real —
  não presumir o estado atual do plano com base na observação
  histórica do RECOVERY-1.

---

## 22. Evidência histórica RECOVERY-1

> Os valores abaixo são **evidência histórica de uma execução
> específica** (data operacional 07/08/2026, registrada em
> `docs/ROADMAP-PRODUCAO-METODO-ORI.md`, seção 28.3). **Não são
> baseline fixo** para execuções futuras (ver seção 13).

**CLI:** `2.110.0`

**Backup:** `roles.sql`, `schema.sql`, `data.sql`

**Criptografia:** GPG simétrico / AES-256, checksum SHA-256

**Restore:** projeto isolado `metodo-ori-recovery-test`, região
`us-east-1`; 1ª tentativa falhou em `ALTER ROLE "supabase_admin"`
(papel reservado); rollback transacional PASS; 2ª tentativa (com
`roles.restore.sql`) PASS.

**Paridade histórica (recovery-test vs. produção):**

| Tabela | Contagem |
|---|---|
| `auth.users` | 23 = 23 |
| `auth.identities` | 23 = 23 |
| `admin_cliente_eventos` | 8 = 8 |
| `clientes` | 23 = 23 |
| `oraculo_cartas_diarias` | 11 = 11 |
| `payment_orders` | 7 = 7 |
| `payment_products` | 3 = 3 |
| `payment_webhook_events` | 4 = 4 |
| `produto_1_feedbacks` | 8 = 8 |
| `produto_1_respostas` | 18 = 18 |
| `produto_2_dossies` | 2 = 2 |
| `produto_3_codigos_finais` | 1 = 1 |

Paridade global de contagens: PASS (histórico).

---

## 23. Pontos pendentes — VALIDAR EM C3

**Atualização pós-C3:** os pontos 1–4 abaixo foram **resolvidos
empiricamente** na bateria de testes de laboratório do RECOVERY-4/C3
(ver seção 24 para a matriz completa e as seções 7/8/9/11/12 para os
comandos validados incorporados ao corpo deste documento). O item 5
foi **parcialmente resolvido**: o mecanismo genérico está validado,
mas o conteúdo específico de produção ainda está pendente.

1. ~~Comando exato de dump via Supabase CLI~~ — **RESOLVIDO (seção
   7)**. Validado com Supabase CLI `2.113.0`, mecanismo `--linked`
   passwordless.
2. ~~Comando exato de empacotamento e criptografia GPG simétrica~~ —
   **RESOLVIDO (seção 8)**. Validado com GnuPG `2.4.4`, roundtrip
   local com payload 100% sintético.
3. ~~Comando exato de restore via `psql`~~ — **RESOLVIDO (seção
   11)**. Transação única (`-1` + `ON_ERROR_STOP=1` + múltiplos
   `-f`) confirmada empiricamente, incluindo rollback comprovado em
   duas falhas reais distintas (transação trivial e dumps reais) e o
   método de criação/auditoria do `roles.restore.sql` derivado
   (seção 12).
4. ~~Comando/método exato de checksum~~ — **RESOLVIDO (seção 9)**.
   `sha256sum`/`sha256sum -c` em formato GNU, incluindo a armadilha de
   formato de manifesto encontrada e corrigida em laboratório.
5. Método/query exato de baseline/paridade — **PARCIALMENTE
   RESOLVIDO**:
   - **RESOLVIDO**: mecanismo de captura de valores escalares via
     `psql -o` + leitura no host (nunca `$(...)` interativo), formato
     do manifesto (`chave=valor`), comparação byte-a-byte SOURCE
     pré/pós-dump e SOURCE vs. TARGET pós-restore — tudo validado com
     uma fixture sintética não vazia (seção 13, seção 24);
   - **PENDENTE**: a lista final de tabelas/queries que devem compor
     o manifesto de baseline de **produção** real do Método Ori
     (`clientes`, `payment_orders`, `auth.users`, etc. — ver os nomes
     de tabela já citados na evidência histórica da seção 22). O
     laboratório usou uma tabela sintética criada exclusivamente para
     o teste (`public.c3_recovery_fixture`), não as tabelas reais do
     produto.

O item 5 (conteúdo específico de produção) deve ser definido em uma
execução futura, sem inventar aqui a lista final.

---

## 24. Validação empírica RECOVERY-4

> Toda a validação desta seção foi executada contra **dois projetos
> Supabase de laboratório, descartáveis, sem nenhum vínculo com
> produção** (referidos aqui apenas como `SOURCE` e `TARGET`
> conceituais). Nenhum comando desta bateria foi executado contra o
> projeto de produção do Método Ori. Todas as execuções sensíveis
> (que envolveram qualquer credencial ou senha real de laboratório)
> foram feitas manualmente pelo operador em terminal físico — nunca
> por execução automática de agente de IA.

| # | Item validado | Resultado | Evidência-chave |
|---|---|---|---|
| 1 | Dump `--linked` (roles/schema/data), passwordless, PAT escopo-processo | PASS | `roles_dump_exit=0`, `schema_dump_exit=0`, `data_dump_exit=0` |
| 2 | Rollback transacional trivial (erro deliberado) | PASS | transação revertida integralmente, verificado independentemente |
| 3 | Rollback transacional com dumps reais (falha real de privilégio) | PASS | `restore_exit=3`, `permission denied for parameter log_min_messages`; `public`/`auth.users`/fingerprint de papéis idênticos antes/depois; dumps originais imutáveis (SHA-256) |
| 4 | Incompatibilidade real de `roles.sql` identificada e classificada | PASS (Classe A — incompatibilidade específica e compreendida do TARGET gerenciado) | `GRANT SET ON PARAMETER "log_min_messages" TO "supabase_realtime_admin"`, ocorrência única, risco semântico LOW |
| 5 | Derivado controlado `roles.restore.sql` | PASS | remoção de exatamente 1 instrução, diff auditado (0 adições, 0 outras remoções), hash independente do derivado |
| 6 | Restore não vazio (fixture sintética `public.c3_recovery_fixture`, 3 linhas, `IDENTITY`/`PK`/`UNIQUE`/`CHECK`) | PASS | `restore_exit=0`, tabela + 3 registros + IDs + fingerprint + identity + constraints restaurados |
| 7 | Paridade SOURCE → TARGET | PASS | baseline do TARGET pós-restore byte-a-byte idêntico ao baseline do SOURCE |
| 8 | Checksum SHA-256 (dumps originais e derivado) | PASS | `sha256sum -c` exit 0 em todas as revalidações, incluindo pós-tentativa |
| 9 | Criptografia GPG simétrica AES-256 (payload sintético local) | PASS (`C3-GPG=PASS_FINAL_CRYPTO_VALIDATION`) | `encrypt_exit=0`, `decrypt_exit=0`, roundtrip SHA-256 e byte-a-byte idênticos, sem persistência de passphrase em disco |

**Limites explícitos desta validação (não extrapolar):**

- **não** comprova recuperação integral de Auth além dos metadados
  capturados pelo dump lógico (seção 16 já cobre a fronteira geral de
  Storage; Auth tem a mesma cautela — ver também o Manual de
  Recovery);
- **não** comprova backup/restore dos bytes de Supabase Storage
  (fora de escopo, seção 16);
- **não** comprova snapshot atômico entre os três comandos de dump
  (`roles.sql`/`schema.sql`/`data.sql`) — são três invocações
  separadas da CLI. O laboratório validou apenas que o estado
  observado da fixture era idêntico antes e depois da janela de
  geração dos três dumps, o que **não é** o mesmo que uma garantia de
  atomicidade entre eles. Para dados críticos de produção sob escrita
  concorrente, avaliar explicitamente a necessidade de uma janela de
  quiescência ou de um modelo de consistência aceito antes do backup;
- **não** substitui o Hard Gate de produção (seção 15) — laboratório
  descartável não é produção, e sucesso em laboratório não é
  autorização para restore real.

---

## 25. Armadilhas encontradas no laboratório

Registradas para prevenir recorrência — cada uma inclui a causa e
como evitá-la, não apenas a descrição do erro.

**A) TTY quebrado por command substitution em `docker run -it`**
- Causa: capturar a saída de `docker run --rm -it ... psql -W ...`
  via `VAR="$(...)"` faz `docker -t` perder a alocação correta do
  pseudo-terminal (stdout deixa de ser um TTY real, pois está
  redirecionado para o pipe da substituição), e o prompt de senha do
  `psql` para de receber entrada corretamente — o processo trava.
- Prevenção: nunca capturar uma invocação interativa de `docker run
  -it`/`psql -W` via `$(...)`/crase. Usar `psql -o <arquivo>` e ler o
  valor do arquivo depois, no host, com a invocação `docker run`
  chamada normalmente (sem substituição de comando).

**B) `grep`/contagem de zero ocorrências sob `set -e`**
- Causa: `VAR=$(grep -c PADRAO arquivo)` — quando `PADRAO` tem zero
  ocorrências (um resultado válido e esperado), `grep` retorna exit
  1. Sob `set -e`, uma atribuição cujo comando de substituição falha
  aborta o script imediatamente, mesmo que "zero" seja a contagem
  correta.
- Prevenção: usar `awk` para contagem por igualdade de linha completa
  (`awk 'END{print count+0}'`, sempre exit 0 se o arquivo é legível),
  ou proteger explicitamente o `grep` dentro de um `if`.

**C) Comando "bare" seguido de captura separada de `$?` sob `set -e`**
- Causa: `comando_pode_falhar; VAR=$?` — se `comando_pode_falhar`
  falhar, o shell sob `set -e` aborta **antes** da segunda linha
  (`VAR=$?`) ser executada, mesmo quando o objetivo era só registrar
  o código de saída, não abortar.
- Prevenção: usar `comando_pode_falhar || VAR=$?` (protegido pelo
  `||`, que é um contexto isento de `errexit`) — nunca separar o
  comando da captura do seu próprio exit code em duas linhas.

**D) Manifesto SHA-256 com campos invertidos**
- Causa: um manifesto escrito como `<arquivo><dois espaços><hash>`
  (ordem trocada) não é reconhecido por `sha256sum -c`, que espera
  `<hash><dois espaços><arquivo>`.
- Prevenção: sempre gerar o manifesto com `sha256sum <arquivo> >
  manifesto` (nunca montar a linha manualmente na ordem errada) e
  verificar imediatamente com `sha256sum -c` antes de confiar nele.
  O comportamento correto ao encontrar um manifesto malformado é
  abortar antes de qualquer conexão — isso **não** significa que o
  arquivo de dados mudou, apenas que o manifesto está ilegível.

**E) SOURCE/TARGET confundidos pelo operador**
- Causa: em uma regeneração manual de dumps após reboot da máquina, o
  operador usou por engano o `PROJECT_REF` do TARGET onde deveria
  estar o `PROJECT_REF` do SOURCE, gerando um diretório de dumps
  inválido que não deveria ser reutilizado.
- Prevenção: todo runner de execução sensível deve incluir um gate
  humano **extra**, imediatamente antes da primeira conexão, exigindo
  que o operador confirme explicitamente (resposta `SIM`) que acabou
  de reconferir no Dashboard qual `PROJECT_REF`/pooler pertence a qual
  papel (SOURCE ou TARGET) — não confiar apenas na variável já
  digitada anteriormente na sessão.

**F) Perda de `/tmp` após reboot físico da máquina**
- Causa: um reboot do sistema operacional limpa `/tmp`, incluindo
  dumps, evidências e runners gerados em execuções anteriores —
  mesmo quando a validação conceitual daquela etapa já havia
  terminado com PASS.
- Prevenção: distinguir explicitamente **validação conceitual** (o
  mecanismo funciona, já comprovado) de **artefato local** (o arquivo
  específico gerado naquela execução). Após um reboot, regenerar
  apenas os artefatos locais perdidos — não reabrir/re-litigar
  validações conceituais já aprovadas. Runbooks operacionais reais
  (produção) devem preferir um diretório de trabalho fora de `/tmp`
  para qualquer evidência que precise sobreviver a um reboot.
