// Prepara o banco de teste: um Postgres EMBUTIDO (binários do zonky via
// embedded-postgres) que nasce e morre com a suíte — sem Docker, sem
// Supabase, zero risco de apagar dados reais com o --force-reset.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import EmbeddedPostgres from 'embedded-postgres';
import { TEST_DATABASE_URL, TEST_DB_NAME, TEST_PG_PASSWORD, TEST_PG_PORT } from './test-db.js';

let pg: EmbeddedPostgres | undefined;
let dataDir: string | undefined;

export async function setup() {
  // Data dir DENTRO do repositório (apps/api/.pg-test-data, gitignored) — não
  // usamos os.tmpdir(): no Windows o initdb precisa reescrever as ACLs da pasta
  // e em alguns Temp (ACL restritiva herdada) isso falha com "Permission denied".
  dataDir = path.resolve(import.meta.dirname, '..', '..', '.pg-test-data');

  // Sobra de um run que morreu sem teardown? Limpa antes do initdb.
  if (existsSync(dataDir)) {
    await rm(dataDir, { recursive: true, force: true });
  }
  await mkdir(dataDir, { recursive: true });

  pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: TEST_PG_PASSWORD,
    port: TEST_PG_PORT,
    // stop() remove o cluster inteiro — o banco de teste é descartável.
    persistent: false,
    // initdb UTF8 + locale C (mesma razão do src/local-db.ts: sem isso o
    // locale do Windows cria um cluster WIN1252 que rejeita não-Latin1).
    initdbFlags: ['-E', 'UTF8', '--locale=C'],
    onLog: () => {},
    onError: (message) => console.error(`[pg-test] ${message}`),
  });

  await pg.initialise();
  await pg.start();
  await pg.createDatabase(TEST_DB_NAME);

  process.env.DATABASE_URL = TEST_DATABASE_URL;

  // --force-reset: derruba e recria as tabelas — seguro porque é o Postgres
  // embutido desta suíte, nunca o banco de produção.
  execSync('pnpm exec prisma db push --skip-generate --force-reset', {
    stdio: 'inherit',
    env: process.env,
  });

  const prisma = new PrismaClient();

  // PNG de 1×1 px — os bytes reais não importam para as regras do jogo,
  // mas o endpoint de imagem da rodada precisa de BYTEA válido no teste.
  const TEST_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );

  const testCar = (name: string, model: string) => ({
    name,
    brand: 'Vroom',
    model,
    category: 'test',
    years: '2000-2001',
    imageData: TEST_PNG,
    imageMime: 'image/png',
    sourceUrl: 'https://example.com/original.png',
    filePageUrl: 'https://example.com/file',
    author: 'Vroom QA',
    license: 'CC0',
  });

  await prisma.score.deleteMany();
  await prisma.round.deleteMany();
  await prisma.user.deleteMany();
  await prisma.car.deleteMany();
  await prisma.car.createMany({
    data: [testCar('Vroom Test Uno', 'Uno (test)'), testCar('Vroom Test Golf', 'Golf (test)')],
  });

  await prisma.$disconnect();
}

export async function teardown() {
  try {
    await pg?.stop();
  } catch (error) {
    console.error('[pg-test] falha ao encerrar o Postgres:', error);
  }
  // Cinto e suspensório: persistent:false já deveria ter limpado.
  if (dataDir) {
    await rm(dataDir, { recursive: true, force: true });
  }
}
