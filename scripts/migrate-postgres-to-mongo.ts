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
