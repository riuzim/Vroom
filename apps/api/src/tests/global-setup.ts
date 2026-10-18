// Prepara o banco de teste (test.db) uma única vez antes de todos os testes.
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'file:./test.db';

export async function setup() {
  // --force-reset: derruba e recria o test.db — o banco de teste é descartável
  // e o schema novo tem colunas obrigatórias sem default.
  execSync('pnpm exec prisma db push --skip-generate --force-reset', {
    stdio: 'inherit',
    env: process.env,
  });

  const prisma = new PrismaClient();

  // PNG de 1×1 px — os bytes reais não importam para as regras do jogo,
  // mas o endpoint /api/cars/:id/image precisa de BLOB válido no teste.
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
