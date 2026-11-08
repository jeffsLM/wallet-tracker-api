# Migração Supabase → MongoDB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar o banco da aplicação de PostgreSQL (Supabase) para MongoDB Atlas via Prisma e copiar todos os dados existentes preservando IDs.

**Architecture:** O schema Prisma principal passa a usar `provider = "mongodb"` com `url = env("MONGO_DATABASE")`, mantendo os UUIDs como `_id`. Uma cópia do schema Postgres atual vira um client legado separado (`DATABASE_URL`), usado só por um script `tsx` que copia tabela por tabela para o Mongo e confere contagens.

**Tech Stack:** Node 20, TypeScript 5, Prisma 5 (`@prisma/client`), tsx, yarn 1.

**Spec:** `docs/superpowers/specs/2026-11-08-supabase-to-mongo-design.md`

## Global Constraints

- App usa `MONGO_DATABASE`; `DATABASE_URL` (Supabase) é usado **apenas** pelo client legado/script de migração.
- IDs: `id String @id @default(uuid()) @map("_id")` — nunca `@db.ObjectId`.
- Campos monetários `Decimal` → `Float`.
- Supabase é somente leitura no script — nenhum `delete`/`update`/`create` no client legado.
- Nunca commitar `.env` nem colar credenciais reais; usar placeholders (`mongodb+srv://<user>:<password>@<cluster>/<db>`).
- Comandos `node`/`yarn` rodam no **PowerShell** (Node 20). O Git Bash deste ambiente tem Node 10 e não serve.
- O projeto não tem framework de testes; verificação = `prisma validate`, `yarn build` (`tsc`) e execução real do script/API.

---

### Task 0: Branch de trabalho

- [ ] **Step 1: Criar branch**

```bash
git checkout -b feat/migrate-to-mongo
```

---

### Task 1: Client legado (Postgres) para o script

Precisa ser feito **antes** de alterar o schema principal, pois é uma cópia dele.

**Files:**
- Create: `prisma/legacy/schema.prisma`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: client gerado em `node_modules/.prisma/legacy-client`, importável como `import { PrismaClient as LegacyPrismaClient } from '../node_modules/.prisma/legacy-client'` (a partir de `scripts/`). Models e tipos idênticos ao schema Postgres atual (`Decimal` continua `Prisma.Decimal`).

- [ ] **Step 1: Copiar o schema atual**

```powershell
New-Item -ItemType Directory -Force prisma/legacy
Copy-Item prisma/schema.prisma prisma/legacy/schema.prisma
```

- [ ] **Step 2: Ajustar o generator do schema legado**

Em `prisma/legacy/schema.prisma`, trocar o bloco `generator client` por:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/.prisma/legacy-client"
}
```

O `datasource db` permanece `provider = "postgresql"` / `url = env("DATABASE_URL")`. Nada mais muda nesse arquivo.

- [ ] **Step 3: Adicionar scripts ao `package.json`**

```json
"prisma:legacy:generate": "prisma generate --schema prisma/legacy/schema.prisma",
"postinstall": "prisma generate && prisma generate --schema prisma/legacy/schema.prisma"
```

(substitui o `postinstall` atual)

- [ ] **Step 4: Gerar e validar**

Run: `yarn prisma:legacy:generate`
Expected: `Generated Prisma Client ... to .\node_modules\.prisma\legacy-client`

- [ ] **Step 5: Commit**

```bash
git add prisma/legacy/schema.prisma package.json
git commit -m "chore: add legacy postgres prisma client for data migration"
```

---

### Task 2: Schema principal em MongoDB + ajustes de código

**Files:**
- Modify: `prisma/schema.prisma`
- Delete: `prisma/migrations/` (pasta inteira)
- Modify: `src/repositories/implementations/TransactionRepository.ts:20,242-244`
- Modify: `src/services/implementations/AccountService.ts:71-72,78,99-100,106`
- Modify: `src/services/implementations/MonthlyClosureProcessorService.ts:32-33,40,47`
- Modify: `src/services/implementations/ReportService.ts:24-27,52,61,81`
- Modify: `package.json`, `readme.md`

**Interfaces:**
- Produces: models do `@prisma/client` com campos monetários `number` (`Transaction.amount`, `GroupBalance.amount`, `MonthlyClosure.totalIncome/totalExpenses: number | null`, `BalanceCheckpoint.threshold`, `CheckpointNotification.totalAmount`). Nomes de models/campos inalterados.

- [ ] **Step 1: Reescrever `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("MONGO_DATABASE")
}

model Family {
  id                String              @id @default(uuid()) @map("_id")
  name              String
  createAt          DateTime
  users             User[]
  accounts          Account[]
  MonthlyClosure    MonthlyClosure[]
  BalanceCheckpoint BalanceCheckpoint[]
}

model User {
  id           String        @id @default(uuid()) @map("_id")
  family       Family        @relation(fields: [familyId], references: [id])
  familyId     String
  name         String
  phone        String?
  createAt     DateTime
  transactions Transaction[]
}

model Group {
  id       String         @id @default(uuid()) @map("_id")
  name     String
  accounts Account[]
  balances GroupBalance[]

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  BalanceCheckpoint BalanceCheckpoint[]
}

model Account {
  id       String  @id @default(uuid()) @map("_id")
  family   Family  @relation(fields: [familyId], references: [id])
  familyId String
  group    Group?  @relation(fields: [groupId], references: [id])
  groupId  String?

  name        String
  type        String // cartão, cc, poupança, digital
  last4Digits String? // apenas para cartão
  active      Boolean @default(true)

  createAt DateTime
  updateAt DateTime?

  transactions      Transaction[]
  BalanceCheckpoint BalanceCheckpoint[]
}

model GroupBalance {
  id      String @id @default(uuid()) @map("_id")
  group   Group  @relation(fields: [groupId], references: [id])
  groupId String

  competence  DateTime
  amount      Float
  description String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Payer {
  id           String        @id @default(uuid()) @map("_id")
  name         String
  default      Boolean       @default(false)
  createAt     DateTime
  transactions Transaction[]
}

model Transaction {
  id               String   @id @default(uuid()) @map("_id")
  account          Account  @relation(fields: [accountId], references: [id])
  accountId        String
  payer            Payer?   @relation(fields: [payerId], references: [id])
  payerId          String?
  user             User?    @relation(fields: [userId], references: [id])
  userId           String?
  accountingPeriod DateTime
  operationType    String
  amount           Float
  installment      Int?
  finalInstallment Int?
  ocr              String?
  description      String?
  status           String?
  createAt         DateTime
}

model MonthlyClosure {
  id String @id @default(uuid()) @map("_id")

  // Referência da família, pois o fechamento é por família
  family   Family @relation(fields: [familyId], references: [id])
  familyId String

  // Competência: mês/ano que esse fechamento representa
  competence DateTime

  // Valores processados
  totalIncome   Float? @default(0.0) // receitas do mês
  totalExpenses Float? @default(0.0) // gastos do mês

  status String @default("open") // open, closed, processing

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model BalanceCheckpoint {
  id String @id @default(uuid()) @map("_id")

  familyId String? // Agora opcional
  family   Family? @relation(fields: [familyId], references: [id])

  accountId String? // Opcional
  account   Account? @relation(fields: [accountId], references: [id])

  groupId String? // Opcional
  group   Group?  @relation(fields: [groupId], references: [id])

  threshold Float // Valor do checkpoint (ex: 2000, 3000, 4000)
  type      String // "account", "group" ou "family"
  active    Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  notifications CheckpointNotification[]

  @@index([familyId])
  @@index([accountId])
  @@index([groupId])
}

model CheckpointNotification {
  id           String            @id @default(uuid()) @map("_id")
  checkpoint   BalanceCheckpoint @relation(fields: [checkpointId], references: [id])
  checkpointId String

  competence  DateTime // mês/ano (primeiro dia do mês)
  sentAt      DateTime
  totalAmount Float // total acumulado no momento do envio

  messageId String? // ID da mensagem no RabbitMQ
  status    String  @default("sent") // sent, failed

  @@unique([checkpointId, competence]) // ⚠️ IMPORTANTE: Previne duplicatas
  @@index([competence])
  @@index([sentAt])
}
```

- [ ] **Step 2: Remover migrations Postgres e regenerar**

```powershell
Remove-Item -Recurse -Force prisma/migrations
$env:MONGO_DATABASE = 'mongodb+srv://user:pass@placeholder.mongodb.net/wallet'; npx prisma validate; npx prisma generate
```

Expected: `The schema at prisma\schema.prisma is valid` e client gerado. (A URL é placeholder só para o `validate`.)

- [ ] **Step 3: Rodar o build para listar os erros de tipo**

Run: `yarn build`
Expected: FAIL — erros `Property 'toNumber' does not exist on type 'number'` nos services e `Prisma.Decimal` no repositório.

- [ ] **Step 4: `TransactionRepository.ts`**

Linha 20:
```ts
        amount: data.amount,
```
Linhas 242-244:
```ts
    if (data.amount) {
      updateData.amount = data.amount;
    }
```
Se `Prisma` deixar de ser usado no import da linha 3, mantê-lo — ele ainda é usado em `Prisma.TransactionWhereInput` (linha 169).

- [ ] **Step 5: Remover `.toNumber()` nos services**

Em `AccountService.ts`, `MonthlyClosureProcessorService.ts` e `ReportService.ts`, substituir cada `X.amount.toNumber()` por `X.amount`. Exemplos exatos:

```ts
// AccountService.ts:71-72 (e 99-100)
const totalUsed = accountTransactions.reduce((total, transaction) => total + transaction.amount, 0);
const totalUsedGroup = groupTransaction.reduce((total, transaction) => total + transaction.amount, 0);
// AccountService.ts:78 (e 106)
balance: balance?.amount || 0,

// MonthlyClosureProcessorService.ts:32-33,40,47
const totalExpenses = transactions.reduce((acc, curr) => acc + curr.amount, 0);
const totalIncome = groupBalances.reduce((acc, curr) => acc + curr.amount, 0);
amount: account.transactions.reduce((acc, curr) => acc + curr.amount, 0)
amountIncome: groupBalance.amount,

// ReportService.ts:24-27,52,61,81
const totalExpenses = transactions.reduce((acc, curr) => acc + curr.amount, 0);
const totalCredit = transactions.filter(t => t.account.type === 'CREDITO' && !t.account.groupId).reduce((acc, curr) => acc + curr.amount, 0);
const totalVoucher = groupVoucher.reduce((acc, curr) => acc + curr.amount, 0);
const totalVoucherUsed = transactions.filter(t => t.account.groupId).reduce((acc, curr) => acc + curr.amount, 0);
transAcc + transaction.amount, 0
totalIncome: groupBalance.amount
const amount = transaction.amount;
```

Verificação rápida: `Grep` por `toNumber|Prisma.Decimal` em `src/` deve retornar zero resultados.

- [ ] **Step 6: Build verde**

Run: `yarn build`
Expected: sem erros. Se algum erro remanescente for de tipo `Decimal`/`number`, corrigir no mesmo padrão (usar o `number` direto).

- [ ] **Step 7: `package.json` scripts**

Substituir `"prisma:migrate": "prisma migrate dev"` por:
```json
"prisma:push": "prisma db push",
```

- [ ] **Step 8: `readme.md`**

Trocar o badge `PostgreSQL` por:
```markdown
![Badge](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
```
E o bloco de env em "Environment Configuration" por:
```env
# Database Configuration (MongoDB Atlas)
MONGO_DATABASE=mongodb+srv://<user>:<password>@<cluster>/<database>

# Legacy Supabase/PostgreSQL (used only by `yarn migrate:mongo`)
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>

# QStash Configuration
QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key
```
Substituir menções a `prisma:migrate`/`prisma migrate` no readme por `yarn prisma:push`.

- [ ] **Step 9: Commit**

```bash
git add -A prisma/schema.prisma prisma/migrations src package.json readme.md
git commit -m "feat: switch prisma datasource to mongodb"
```

---

### Task 3: Script de migração de dados

**Files:**
- Create: `scripts/migrate-postgres-to-mongo.ts`
- Modify: `package.json` (script `migrate:mongo`)

**Interfaces:**
- Consumes: `LegacyPrismaClient` (Task 1, `node_modules/.prisma/legacy-client`) e `PrismaClient` de `@prisma/client` (Task 2, Mongo).
- Produces: comando `yarn migrate:mongo`; exit code 0 se todas as contagens baterem, 1 caso contrário ou se o destino não estiver vazio.

- [ ] **Step 1: Criar `scripts/migrate-postgres-to-mongo.ts`**

```ts
import { PrismaClient } from '@prisma/client';
import { PrismaClient as LegacyPrismaClient, Prisma as LegacyPrisma } from '../node_modules/.prisma/legacy-client';

const BATCH_SIZE = 1000;

const source = new LegacyPrismaClient();
const target = new PrismaClient();

// Ordem respeita as dependências entre models
const MODELS = [
  'family',
  'user',
  'payer',
  'group',
  'account',
  'groupBalance',
  'transaction',
  'monthlyClosure',
  'balanceCheckpoint',
  'checkpointNotification',
] as const;

type ModelName = (typeof MODELS)[number];

// Converte Decimal -> number, preservando null e demais valores
function toPlain(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[key] = value instanceof LegacyPrisma.Decimal ? value.toNumber() : value;
  }
  return result;
}

async function ensureTargetIsEmpty() {
  for (const model of MODELS) {
    const count = await (target as any)[model].count();
    if (count > 0) {
      throw new Error(`Coleção "${model}" no Mongo já possui ${count} documentos. Abortando para evitar duplicação.`);
    }
  }
}

async function copyModel(model: ModelName): Promise<number> {
  let copied = 0;
  let cursor: string | undefined;

  while (true) {
    const rows: Record<string, unknown>[] = await (source as any)[model].findMany({
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
    });

    if (rows.length === 0) break;

    await (target as any)[model].createMany({ data: rows.map(toPlain) });

    copied += rows.length;
    cursor = rows[rows.length - 1].id as string;
    console.log(`  ${model}: ${copied}`);
  }

  return copied;
}

async function main() {
  await ensureTargetIsEmpty();

  for (const model of MODELS) {
    console.log(`Copiando ${model}...`);
    await copyModel(model);
  }

  console.log('\nRelatório (postgres -> mongo):');
  let hasMismatch = false;
  for (const model of MODELS) {
    const sourceCount = await (source as any)[model].count();
    const targetCount = await (target as any)[model].count();
    const ok = sourceCount === targetCount;
    if (!ok) hasMismatch = true;
    console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${model}: ${sourceCount} -> ${targetCount}`);
  }

  if (hasMismatch) {
    throw new Error('Contagens divergentes entre Postgres e Mongo.');
  }

  console.log('\nMigração concluída com sucesso.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await source.$disconnect();
    await target.$disconnect();
  });
```

- [ ] **Step 2: Script no `package.json`**

```json
"migrate:mongo": "tsx --env-file=.env scripts/migrate-postgres-to-mongo.ts"
```

- [ ] **Step 3: Checagem de tipos do script**

Run: `npx tsc --noEmit --esModuleInterop --skipLibCheck --target ESNext --module CommonJS --moduleResolution node scripts/migrate-postgres-to-mongo.ts`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-postgres-to-mongo.ts package.json
git commit -m "feat: add postgres to mongo data migration script"
```

---

### Task 4: Execução e verificação (com o usuário)

Requer credenciais reais no `.env` local — **o usuário preenche**; o agente nunca lê nem imprime o `.env`.

- [ ] **Step 1:** Usuário adiciona `MONGO_DATABASE` ao `.env` (mantendo `DATABASE_URL` do Supabase).
- [ ] **Step 2:** `yarn prisma:push` — Expected: `Your database indexes are now in sync with your Prisma schema.`
- [ ] **Step 3:** `yarn migrate:mongo` — Expected: todas as linhas `OK` e `Migração concluída com sucesso.`
- [ ] **Step 4:** `yarn dev` e validar endpoints principais (contas com saldo, transações por período, relatório, fechamento mensal) comparando valores com os obtidos antes da migração.
- [ ] **Step 5:** Se tudo ok, abrir PR da branch `feat/migrate-to-mongo` (somente se o usuário pedir).
