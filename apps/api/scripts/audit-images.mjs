import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const total = await prisma.car.count();

const semImagem = await prisma.$queryRaw`
  SELECT id, name FROM "Car" WHERE "imageData" IS NULL ORDER BY id ASC
`;

const bytesZero = await prisma.$queryRaw`
  SELECT id, name FROM "Car" WHERE "imageData" IS NOT NULL AND LENGTH("imageData") = 0
`;

const pequenas = await prisma.$queryRaw`
  SELECT id, name, LENGTH("imageData") AS bytes FROM "Car"
  WHERE "imageData" IS NOT NULL AND LENGTH("imageData") < 5000
  ORDER BY id ASC
`;

const totalBytes = await prisma.$queryRaw`
  SELECT COALESCE(SUM(LENGTH("imageData")), 0) AS total FROM "Car"
`;

console.log(
  JSON.stringify({
    total,
    semImagem: semImagem.map((c) => `${c.id}:${c.name}`),
    bytesZero: bytesZero.map((c) => `${c.id}:${c.name}`),
    imagensSuspeitasMenoresQue5KB: pequenas.map((c) => `${c.id}:${c.name} (${c.bytes}B)`),
    somaBytesCatalogo: Number(totalBytes[0].total),
  }),
);

await prisma.$disconnect();
