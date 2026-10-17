import { PrismaClient } from '@prisma/client';
import { cars } from '@vroom/shared';

const prisma = new PrismaClient();

async function main() {
  console.log(`Semeando ${cars.length} carros...`);

  for (const car of cars) {
    await prisma.car.upsert({
      where: { name: car.name },
      update: { imageUrl: car.imageUrl },
      create: { name: car.name, imageUrl: car.imageUrl },
    });
  }

  const total = await prisma.car.count();
  console.log(`Catálogo pronto: ${total} carros.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
