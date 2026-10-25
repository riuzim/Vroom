import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
// Subpath dedicado: manter o catálogo completo (nome ↔ imagem) fora do
// barrel que o cliente consome — anti-cheat.
import { cars } from '@vroom/shared/cars';

const prisma = new PrismaClient();
const here = path.dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = path.join(here, 'car-images');

/** Etiqueta exigida pelo Wikimedia Commons para downloads automatizados. */
const USER_AGENT = 'Vroom-seed/1.0 (jogo de adivinhar carros; repositório Vroom)';

/**
 * Assinatura binária dos formatos aceitos. Garante que nunca gravamos no
 * banco um HTML de erro (ex.: redirect de imgur) como se fosse imagem.
 */
function detectMime(bytes: Buffer): 'image/jpeg' | 'image/png' | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'image/png';
  }
  return null;
}

/** Caminhos de cache possíveis (o formato real pode diferir do original). */
function cacheCandidates(slug: string): string[] {
  return [path.join(IMAGE_DIR, `${slug}.jpg`), path.join(IMAGE_DIR, `${slug}.png`)];
}

/**
 * Bytes da imagem: cache local primeiro (commited no repo → seed funciona
 * offline), fallback de download do Commons para quem clonou sem as
 * imagens. Devolve também o mime REAL dos bytes — é ele que vai pro banco.
 */
async function loadImage(car: (typeof cars)[number]): Promise<{ bytes: Buffer; mime: string }> {
  for (const file of cacheCandidates(car.slug)) {
    if (existsSync(file)) {
      const bytes = await readFile(file);
      const mime = detectMime(bytes);
      if (mime) {
        return { bytes, mime };
      }
      console.warn(`⚠ cache corrompido: ${file} — ignorando.`);
    }
  }

  const response = await fetch(car.downloadUrl, { headers: { 'User-Agent': USER_AGENT } });

  if (!response.ok) {
    throw new Error(`download HTTP ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const mime = detectMime(bytes);

  if (!mime) {
    throw new Error('bytes baixados não são JPEG/PNG (HTML de erro?)');
  }
  if (bytes.byteLength < 10_000) {
    throw new Error(`imagem suspeita: ${bytes.byteLength} bytes`);
  }

  await mkdir(IMAGE_DIR, { recursive: true });
  await writeFile(
    path.join(IMAGE_DIR, `${car.slug}.${mime === 'image/png' ? 'png' : 'jpg'}`),
    bytes,
  );
  return { bytes, mime };
}

async function main() {
  console.log(`Semeando ${cars.length} carros (cache local + fallback Wikimedia Commons)...`);

  let failures = 0;

  for (const car of cars) {
    try {
      const { bytes, mime } = await loadImage(car);

      const data = {
        brand: car.brand,
        model: car.model,
        category: car.category,
        years: car.years,
        imageData: bytes,
        imageMime: mime,
        sourceUrl: car.downloadUrl,
        filePageUrl: car.filePageUrl,
        author: car.author,
        license: car.license,
      };

      await prisma.car.upsert({
        where: { name: car.name },
        update: { ...data, active: true },
        create: { name: car.name, ...data },
      });
      process.stdout.write('.');
    } catch (error) {
      failures += 1;
      console.error(`\n✗ ${car.name}: ${(error as Error).message}`);
    }
  }

  // Carros que saíram do catálogo permanecem no banco (rounds antigos
  // dependem da FK), mas saem da rotação de novas rodadas.
  const names = cars.map((car) => car.name);
  await prisma.car.updateMany({
    where: { name: { notIn: names } },
    data: { active: false },
  });

  const total = await prisma.car.count();
  console.log(`\nCatálogo pronto: ${total} carros (${failures} falha(s)).`);

  if (failures > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
