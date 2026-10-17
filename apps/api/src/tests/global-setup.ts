// Prepara o banco de teste (test.db) uma única vez antes de todos os testes.
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'file:./test.db';

export async function setup() {
  execSync('pnpm exec prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: process.env,
  });

  const prisma = new PrismaClient();

  await prisma.score.deleteMany();
  await prisma.round.deleteMany();
  await prisma.user.deleteMany();
  await prisma.car.deleteMany();
  await prisma.car.createMany({
    data: [
      { name: 'Vroom Test Uno', imageUrl: 'https://example.com/uno.jpg' },
      { name: 'Vroom Test Golf', imageUrl: 'https://example.com/golf.jpg' },
    ],
  });

  await prisma.$disconnect();
}
