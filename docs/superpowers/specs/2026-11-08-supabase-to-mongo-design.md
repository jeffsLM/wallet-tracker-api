# Migração Supabase (PostgreSQL) → MongoDB Atlas

**Data:** 2026-11-08
**Status:** Aprovado (aguardando revisão da spec)

## Objetivo

Trocar o banco da aplicação de PostgreSQL (Supabase) para MongoDB Atlas, alterando o mínimo possível do código, e copiar **todos** os dados existentes mantendo IDs e relações.

## Decisões

| Tema | Decisão |
|------|---------|
| ORM | Manter Prisma 5, trocando o provider para `mongodb` |
| Hospedagem | MongoDB Atlas (replica set nativo, exigido pelo Prisma) |
| IDs | Manter os UUIDs atuais como `_id` string (`@id @default(uuid()) @map("_id")`) — sem `ObjectId`, sem remapeamento |
| Valores monetários | `Decimal` → `Float` |
| Variáveis de ambiente | `MONGO_DATABASE` = conexão Atlas (app). `DATABASE_URL` = Supabase, usado **apenas** pelo script de migração |
| Schema no banco | `prisma db push` (Mongo não usa `prisma migrate`) |

Alternativas descartadas: Prisma com `ObjectId` (exige remapear IDs e quebra IDs guardados externamente) e Mongoose (reescrita de todos os repositórios sem ganho).

## 1. Schema (`prisma/schema.prisma`)

- `datasource db { provider = "mongodb"  url = env("MONGO_DATABASE") }`.
- Todo `id String @id @default(uuid())` → `id String @id @default(uuid()) @map("_id")`.
- Campos `Decimal` → `Float`:
  - `GroupBalance.amount`
  - `Transaction.amount`
  - `MonthlyClosure.totalIncome`, `MonthlyClosure.totalExpenses` (mantém `@default(0)`)
  - `BalanceCheckpoint.threshold`
  - `CheckpointNotification.totalAmount`
- Mantidos: relações, `@@unique([checkpointId, competence])`, `@@index`, `@default(now())`, `@updatedAt`.
- Remover `prisma/migrations/` (histórico Postgres, não aplicável ao Mongo).

## 2. Código da aplicação

- `TransactionRepository`: trocar `new Prisma.Decimal(data.amount)` por `data.amount` (create e update).
- Remover `.toNumber()` em `AccountService`, `ReportService`, `MonthlyClosureProcessorService` (os campos passam a ser `number`).
- Chamadas `Number(...)` existentes (`CheckpointService`, `TransactionController`) continuam válidas, sem alteração obrigatória.
- `include`, `mode: 'insensitive'`, `createMany`, `upsert`, `Prisma.validator`/`GetPayload` são suportados no Mongo — sem mudança.
- `package.json`: substituir `prisma:migrate` por `prisma:push` (`prisma db push`); adicionar `migrate:mongo` para o script de dados.
- `readme.md`: atualizar badges/variáveis de ambiente (`MONGO_DATABASE`).

## 3. Script de migração de dados

**Client legado:** copiar o schema Postgres atual para `prisma/legacy/schema.prisma`, com `url = env("DATABASE_URL")` e `output` em `node_modules/.prisma/legacy-client` (client separado do principal). Gerado via `prisma generate --schema prisma/legacy/schema.prisma`.

**Script:** `scripts/migrate-postgres-to-mongo.ts` (executado com `tsx`).

1. **Pré-checagem:** se qualquer coleção de destino tiver documentos, aborta com mensagem (evita duplicação). Não há modo de sobrescrita.
2. **Cópia em ordem de dependência:**
   Family → User → Payer → Group → Account → GroupBalance → Transaction → MonthlyClosure → BalanceCheckpoint → CheckpointNotification.
3. Para cada tabela: `findMany` paginado (lotes de 1000, ordenado por `id`), converte `Decimal` → `number` (`.toNumber()`, preservando `null`), grava com `createMany` preservando `id`, `createdAt`, `updatedAt` e demais campos exatamente como estão.
4. **Relatório final:** contagem Postgres vs. Mongo por tabela; termina com código de saída ≠ 0 se alguma divergir.
5. Somente leitura no Supabase — nada é apagado ou alterado lá.

Observação: `@updatedAt` só é preenchido automaticamente em `update`; em `createMany` o valor original é gravado como enviado.

## 4. Rollout

1. Parar a API e os consumidores de fila (QStash/WhatsApp) para congelar escritas no Supabase até o passo de troca.
2. Criar cluster/database no Atlas; definir `MONGO_DATABASE` no `.env` (placeholder: `mongodb+srv://<user>:<password>@<cluster>/<db>`). A URL precisa incluir o nome do database e `MONGO_DATABASE` também deve ser configurada no ambiente de produção.
3. `yarn prisma:push` → cria coleções e índices.
4. `yarn migrate:mongo` → copia os dados e confere contagens.
5. Subir a aplicação apontando para `MONGO_DATABASE` e validar.
6. Supabase permanece como backup até decisão de desligar; `DATABASE_URL` pode então ser removido.

## 5. Verificação

- `yarn build` (`tsc`) sem erros.
- Relatório do script com todas as contagens iguais.
- Subir a API contra o Atlas e conferir endpoints principais (contas com saldo, transações por período, relatório mensal, fechamento mensal) comparando com os valores obtidos com Supabase.

## Riscos

- **Float vs Decimal:** valor armazenado deixa de ser decimal exato. Os cálculos atuais já são feitos em `number`, então o comportamento das somas não muda. Alternativa (centavos em `Int`) descartada por exigir mais mudanças.
- **Unicidade de checkpoint:** o `@@unique` vira índice único no Mongo via `db push`; precisa rodar `prisma:push` **antes** do script.
- **Sem transações de banco no fluxo atual** (`$transaction` não é usado), então não há dependência extra de sessão/replica set além da exigida pelo Prisma.
- **Falha no meio da migração:** destino fica parcial; resetar com `npx prisma db push --force-reset` (apenas no banco Mongo novo) e rodar `prisma:push` + `migrate:mongo` de novo.
