# Manual de Recovery — Método Ori

**Guia operacional para incidentes, rollback e recuperação**

---

Este manual é o ponto de entrada humano para um incidente real. Ele
**não substitui** os documentos técnicos de referência — ele aponta
para eles, no momento certo:

- [`docs/RUNBOOK-RECOVERY-OPERACIONAL.md`](./RUNBOOK-RECOVERY-OPERACIONAL.md) — runbook técnico geral (frontend, backend, pagamento, DNS, código).
- [`docs/RUNBOOK-RECOVERY-DADOS-SUPABASE.md`](./RUNBOOK-RECOVERY-DADOS-SUPABASE.md) — runbook técnico de backup/restore de dados (Supabase).

Se você é a operadora/dona do Método Ori e está lendo isto durante um
incidente real: respire, leia a seção 1, e siga o fluxo. Você não
precisa lembrar nenhum comando técnico agora — este manual existe
exatamente para isso.

---

## Índice

1. [Emergência — comece aqui](#1-emergência--comece-aqui)
2. [Primeiros 5 minutos](#2-primeiros-5-minutos)
3. [O que aconteceu?](#3-o-que-aconteceu)
4. [Níveis de ação](#4-níveis-de-ação)
5. [Recovery de dados — resumo humano](#5-recovery-de-dados--resumo-humano)
6. [Checklist antes de qualquer restore](#6-checklist-antes-de-qualquer-restore)
7. [Checklist depois do restore](#7-checklist-depois-do-restore)
8. [roles.sql — em linguagem humana](#8-rolessql--em-linguagem-humana)
9. [Segredos](#9-segredos)
10. [Auth e Storage](#10-auth-e-storage)
11. [Quando tudo terminar](#11-quando-tudo-terminar)
12. [Escalonamento](#12-escalonamento)
13. [Glossário](#13-glossário)
14. [Folha rápida de emergência](#14-folha-rápida-de-emergência)

---

## 1. Emergência — comece aqui

> 🔴 **PARE**
>
> - **Não** execute restore em produção por impulso.
> - **Não** delete banco/projeto.
> - **Não** faça cleanup (não apague nada "para limpar depois").
> - **Não** altere o backup original.
> - **Não** cole senha/token em ChatGPT, Claude, issue ou qualquer documento.
> - **Preserve evidências** — prints, logs, horários. Você vai precisar deles depois, mesmo que pareçam óbvios agora.

Nada neste manual pede para você agir sozinha em produção. O objetivo
dos próximos passos é **entender o que aconteceu e conter o impacto**
— não corrigir tudo de uma vez.

---

## 2. Primeiros 5 minutos

Responda estas perguntas, na ordem, e anote as respostas (elas viram
evidência depois):

- O que quebrou, exatamente?
- Quando começou (hora aproximada)?
- Produção está acessível (o site abre, mesmo que com erro)?
- Houve alguma alteração recente (deploy, configuração, dado editado manualmente)?
- Os dados parecem corrompidos/errados, ou é só o site/API que não responde?
- Pagamentos ou acessos liberados (entitlement) estão divergentes?
- Existe um backup conhecido e recente?
- Qual foi a última ação feita antes do problema aparecer?

Você ainda **não precisa agir** — só reunir essas respostas já ajuda
a decidir o próximo passo na seção 3.

---

## 3. "O que aconteceu?"

Escolha o caminho que mais se parece com o que você está vendo.

**A. Site/frontend fora do ar** (a página não abre, ou abre em branco)
→ Runbook técnico: [`RUNBOOK-RECOVERY-OPERACIONAL.md`, seção 7 (Frontend/Cloudflare)](./RUNBOOK-RECOVERY-OPERACIONAL.md#7-frontend--cloudflare-pages).

**B. Backend/API fora do ar** (o site abre, mas login/compra/consulta falha)
→ Runbook técnico: [`RUNBOOK-RECOVERY-OPERACIONAL.md`, seção 8 (Backend/Render)](./RUNBOOK-RECOVERY-OPERACIONAL.md#8-backend--render).

**C. Dados errados, perdidos ou corrompidos** (algo que devia estar lá não está, ou está diferente do esperado)
→ **Pare antes de mexer em código.** Runbook técnico: [`RUNBOOK-RECOVERY-OPERACIONAL.md`, seção 10 (Banco/Supabase)](./RUNBOOK-RECOVERY-OPERACIONAL.md#10-banco--supabase) + [`RUNBOOK-RECOVERY-DADOS-SUPABASE.md`](./RUNBOOK-RECOVERY-DADOS-SUPABASE.md) completo.

**D. Pagamento aprovado, mas acesso liberado errado (ou ausente)**
→ Runbook técnico: [`RUNBOOK-RECOVERY-OPERACIONAL.md`, seção 11 (Pagamento e entitlement)](./RUNBOOK-RECOVERY-OPERACIONAL.md#11-pagamento-e-entitlement).

**E. Um deploy recente parece ter quebrado algo**
→ Runbook técnico: [`RUNBOOK-RECOVERY-OPERACIONAL.md`, seção 9 (Fallback Git) e seção 18 (Pós-incidente)](./RUNBOOK-RECOVERY-OPERACIONAL.md#9-fallback-git).

**F. Recovery completo / situação desconhecida** (não sei nem por onde começar)
→ Comece pela [árvore de decisão do runbook técnico, seção 6](./RUNBOOK-RECOVERY-OPERACIONAL.md#6-arvore-de-decisao) — ela cobre todos os casos acima em formato de fluxo.

Em qualquer um desses caminhos: se envolver dados/banco em algum
ponto, **pare e siga a seção 10 do runbook operacional antes de
qualquer rollback de código**.

---

## 4. Níveis de ação

Cada ação de recovery se encaixa em um destes três níveis. Nenhum
nível é uma autorização geral — cada ação específica precisa estar
descrita em algum dos runbooks técnicos para valer.

### 🟢 POSSO FAZER SOZINHA

Ações de **inspeção, diagnóstico, ou reversão já explicitamente
autorizada e segura** — por exemplo: olhar o dashboard do Cloudflare
ou Render, rodar um smoke de leitura (seção 15 do runbook
operacional), conferir se um checksum bate, ler evidência já
registrada.

### 🟡 PRECISA DE VALIDAÇÃO TÉCNICA

Mudança remota com impacto real: rollback de deployment,
criação de um `roles.restore.sql` derivado, restore em ambiente
isolado/laboratório, mudança de configuração/infraestrutura. Fazer
com acompanhamento técnico, seguindo o procedimento exato do runbook
correspondente — nunca "na intuição".

### 🔴 PARE / NÃO CONTINUE

- restore em **produção** sem o Hard Gate completo cumprido;
- apagar projeto, banco ou branch;
- alterar o backup original;
- ignorar um checksum que não bateu;
- expor qualquer segredo (senha, token, chave) em qualquer lugar.

Se você não tem certeza em qual nível uma ação se encaixa: trate como
🔴 e escale (seção 12).

---

## 5. Recovery de dados — resumo humano

O procedimento técnico completo está em
[`RUNBOOK-RECOVERY-DADOS-SUPABASE.md`](./RUNBOOK-RECOVERY-DADOS-SUPABASE.md).
Aqui vai só o conceito, para você entender o que está acontecendo
quando alguém técnico estiver executando:

```
BACKUP
  → gera uma cópia dos dados (papéis, estrutura, conteúdo)
→ HASH
  → gera uma "impressão digital" (checksum) do backup, pra provar
    depois que ele não foi alterado nem corrompido
→ CRIPTOGRAFIA
  → o backup é protegido com uma senha (passphrase) só dele
→ RESTORE ISOLADO
  → o backup é testado num lugar separado, descartável — nunca
    direto em produção
→ PARIDADE
  → compara o resultado do teste isolado com o que era esperado
→ DECISÃO HUMANA
  → uma pessoa (não um script sozinho) decide se é seguro seguir
→ PRODUÇÃO
  → só depois de tudo isso, e só em caso de necessidade real
    comprovada, um restore pode tocar produção — e mesmo assim,
    sempre com Hard Gate (seção 6) e nunca sozinho
```

Cada seta acima é reversível ou cancelável até a última — "PRODUÇÃO"
é a única etapa que exige decisão coordenada e critérios completos.

---

## 6. Checklist antes de qualquer restore

Este é o Hard Gate completo (`RUNBOOK-RECOVERY-DADOS-SUPABASE.md`,
seção 15). **Todos** os itens abaixo precisam estar marcados antes de
sequer considerar um restore em produção:

- [ ] incidente confirmado (não é suposição);
- [ ] backup-alvo identificado sem ambiguidade;
- [ ] checksum do backup válido;
- [ ] teste isolado (em ambiente descartável) com resultado PASS;
- [ ] impacto avaliado (o que muda, o que se perde);
- [ ] compatibilidade da aplicação com esse backup avaliada;
- [ ] dados que seriam perdidos após o ponto do backup, identificados;
- [ ] responsável técnico acionado;
- [ ] administrador Supabase acionado;
- [ ] janela/impacto comunicados à equipe;
- [ ] plano de rollback da própria recuperação definido.

Se **qualquer** item faltar: **não prossiga**. Isso não é burocracia —
é exatamente o que evita transformar um incidente em dois incidentes.

---

## 7. Checklist depois do restore

- [ ] o serviço responde normalmente?
- [ ] o schema (estrutura do banco) é o esperado?
- [ ] os dados restaurados são os esperados?
- [ ] autenticação (login) funciona, testada separadamente?
- [ ] entitlement (acesso liberado por compra) está correto?
- [ ] pagamentos continuam consistentes?
- [ ] os logs foram conferidos?
- [ ] nenhuma credencial ficou exposta em nenhum lugar?
- [ ] as evidências desta operação foram salvas?

---

## 8. roles.sql — em linguagem humana

Durante um restore, o primeiro arquivo aplicado é sempre o `roles.sql`
— ele descreve os "papéis" (usuários internos) do banco. Às vezes ele
contém uma instrução que o ambiente de destino não aceita, porque é
um ambiente gerenciado (não é um servidor totalmente seu).

A regra é sempre a mesma, em qualquer situação:

1. **sempre usar o `roles.sql` original primeiro** — nunca editar
   antes de tentar;
2. **se a tentativa falhar: PARE.** Não insista, não tente de novo
   automaticamente;
3. **confirme o rollback** — o procedimento técnico garante que uma
   falha não deixa nada pela metade, mas confirme mesmo assim;
4. **entenda exatamente qual linha causou o problema** antes de
   qualquer outra coisa;
5. **só depois disso**, com entendimento e autorização explícita para
   aquela execução específica, é possível criar uma versão derivada
   (`roles.restore.sql`) que omite **apenas** aquela linha;
6. **o arquivo original nunca é editado** — o derivado é sempre um
   arquivo novo, separado.

**Exemplo real já documentado** (não é regra universal — é um
exemplo de como o processo funciona): em um teste de laboratório, a
linha `GRANT SET ON PARAMETER "log_min_messages" TO
"supabase_realtime_admin"` causou uma falha porque o ambiente
gerenciado não permite essa concessão de privilégio ao usuário comum
de conexão. A equipe técnica reproduziu o erro, confirmou que não
envolvia senha, login, dados ou permissões de acesso, e só então
criou uma versão derivada omitindo exatamente essa linha. **Isso não
significa que toda vez que essa linha aparecer ela deve ser removida
automaticamente** — cada execução futura precisa passar pelos mesmos
passos 1–6 acima, mesmo que a linha pareça idêntica a essa.

Detalhes técnicos completos: `RUNBOOK-RECOVERY-DADOS-SUPABASE.md`,
seção 12.

---

## 9. Segredos

| Pergunta | Resposta |
|---|---|
| Pode aparecer em documento (Markdown, PDF, etc.)? | **NÃO** |
| Pode aparecer em chat (Slack, WhatsApp, e-mail)? | **NÃO** |
| Pode ficar em um arquivo `.env` do procedimento? | **NÃO** |
| Pode ser digitado diretamente num prompt seguro (ex. terminal pedindo senha)? | **SIM**, quando o procedimento explicitamente exigir isso |

Isso vale para todos os tipos de segredo envolvidos em recovery:

- **Senha do banco (DB password)**
- **Personal Access Token (PAT)** do Supabase
- **service_role key**
- **JWT** (token de autenticação)
- **Passphrase do GPG** (senha da criptografia do backup)

Se qualquer um desses valores aparecer em algum lugar que não deveria
(chat, documento, log, print compartilhado): trate como comprometido
imediatamente, avise quem for necessário para revogar/trocar, e
registre **apenas o fato de que houve exposição** na evidência —
nunca o valor em si.

---

## 10. Auth e Storage

> **Este recovery lógico PostgreSQL validado NÃO comprova recuperação
> integral de Auth ou dos bytes do Storage.**

O procedimento de backup/restore documentado cobre o banco de dados
(estrutura, papéis, conteúdo das tabelas). Ele:

- **não** foi validado como cobertura completa da autenticação além
  dos metadados que já vêm dentro do dump lógico;
- **não** cobre os arquivos/bytes reais armazenados no Supabase
  Storage — apenas eventuais metadados sobre eles que estejam em
  tabelas do banco.

Isso é uma fronteira de escopo **conhecida e documentada**, não um
esquecimento. Se um incidente envolver especificamente Auth ou
Storage de forma que o recovery padrão de banco não resolva, esse é
um caso que precisa de avaliação técnica separada — escale (seção
12).

---

## 11. Quando tudo terminar

1. valide o sistema como um todo (checklist da seção 7, mais os
   fluxos reais do produto);
2. preserve toda a evidência gerada durante o incidente;
3. registre o incidente formalmente (usar o template de evidência do
   runbook operacional, seção 17);
4. se algo novo foi aprendido durante o incidente, atualize o runbook
   técnico correspondente — não deixe o aprendizado só na memória de
   quem participou;
5. cleanup (remover ambientes de teste, arquivos temporários) **só
   depois** de uma decisão explícita de que não são mais necessários;
6. **nunca** apague evidência antes de uma revisão — mesmo que o
   incidente pareça resolvido.

---

## 12. Escalonamento

Quem acionar:

```
Responsável técnico de escalonamento:  Filipe de Oliveira
Função:                                 Responsável técnico vigente
                                         pelo desenvolvimento e
                                         infraestrutura do Método Ori
Canal:                                  WhatsApp
Contato direto:                         consultar cadastro interno
                                         de contatos do Método Ori
```

Este manual **não** guarda o número de telefone — por segurança, o
número real fica só no cadastro interno de contatos da equipe, nunca
em um documento versionado.

**Acione Filipe imediatamente se qualquer um destes casos ocorrer:**

- suspeita de perda ou corrupção de dados;
- restore em produção está sendo considerado;
- um rollback falhou;
- um checksum não bateu;
- a paridade (comparação entre origem e destino de um restore) falhou;
- não é possível identificar com certeza qual é o ambiente de origem/destino de uma operação;
- alguma credencial (senha, token, chave) pode ter sido exposta;
- é necessária uma alteração destrutiva no banco;
- há uma inconsistência financeira/de acesso liberado com impacto relevante;
- você chegou a um ponto marcado como 🟡 **PRECISA DE VALIDAÇÃO TÉCNICA** ou 🔴 **PARE / NÃO CONTINUE** (seção 4) e não tem certeza de como prosseguir.

**Ter um responsável definido não é permissão automática para
restaurar produção.** O Hard Gate (seção 6) continua obrigatório
mesmo com Filipe acionado — o papel dele é ajudar a coordenar a
decisão, não pular as etapas de segurança.

---

## 13. Glossário

- **SOURCE** — origem dos dados/backup usado numa operação (ex. o
  backup de onde os dados vêm).
- **TARGET** — destino de uma operação (ex. onde um restore de teste
  é aplicado). Nunca deve ser produção durante um teste isolado.
- **dump** — cópia lógica dos dados do banco, gerada em arquivos
  (`roles.sql`, `schema.sql`, `data.sql`).
- **restore** — processo de aplicar um dump de volta em um banco.
- **rollback** — desfazer uma mudança e voltar a um estado anterior
  conhecido (pode ser de deploy, ou de uma transação de banco que
  falhou).
- **baseline** — um "retrato" de referência dos dados, usado para
  comparar depois se um restore trouxe exatamente o que devia.
- **paridade** — quando o resultado de um restore bate exatamente com
  o baseline esperado.
- **checksum / SHA-256** — uma "impressão digital" de um arquivo, usada
  para provar que ele não foi alterado nem corrompido.
- **GPG** — ferramenta usada para criptografar (proteger com senha) o
  backup antes de guardá-lo.
- **roles.sql** — arquivo com a definição dos papéis/usuários internos
  do banco, aplicado primeiro em qualquer restore.
- **roles.restore.sql** — versão derivada do `roles.sql`, criada
  apenas quando necessário e autorizado, omitindo uma instrução
  específica incompatível com o ambiente de destino.
- **Hard Gate** — lista obrigatória de condições que **todas** precisam
  estar atendidas antes de um restore real em produção (seção 6).
- **entitlement** — o acesso que um cliente recebe depois de um
  pagamento aprovado (ex. liberar um produto digital).

---

## 14. Folha rápida de emergência

### "SE O MÉTODO ORI QUEBRAR AGORA"

1. **Pare.** Não execute nada por impulso.
2. Anote o que quebrou, quando começou, e o que mudou recentemente.
3. Confirme se envolve **dados/banco** — se sim, não mexa em código
   ainda.
4. Vá para a seção 3 deste manual e escolha o caminho correspondente.
5. Confirme em qual [nível de ação](#4-níveis-de-ação) (🟢🟡🔴) a
   situação se encaixa.
6. Se for 🟡 ou 🔴: acione Filipe de Oliveira (WhatsApp — seção 12) antes de agir.
7. Siga o runbook técnico indicado — não invente um atalho.
8. Depois da ação: rode o smoke/checklist de verificação (seção 7 ou
   seção 15 do runbook operacional).
9. Registre tudo (evidência) — mesmo que pareça resolvido.
10. Só depois de tudo validado: considere o incidente encerrado, e
    atualize os documentos se aprendeu algo novo.

**Nunca:** restaurar produção sozinha, apagar algo "para testar",
compartilhar senha/token em qualquer chat ou documento, pular o Hard
Gate porque "está com pressa".
