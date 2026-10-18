#!/usr/bin/env node
/**
 * fetch-images.mjs — baixa as 100 imagens do catálogo para o cache local
 * (apps/api/prisma/car-images/), que é commitado no repositório. Assim a
 * seed funciona 100% offline e o jogo não depende de imgur/Wikimedia em
 * runtime — a internet só é necessária AQUI, uma vez.
 *
 * Rode depois de `pnpm catalog` (lê levantamento/catalogo-vroom.json).
 * Arquivos já em cache (com assinatura binária válida) são pulados.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(root, 'levantamento', 'catalogo-vroom.json');
const imageDir = path.join(root, 'apps', 'api', 'prisma', 'car-images');

const USER_AGENT = 'Vroom-catalog-fetch/1.0 (jogo de adivinhar carros; repositório Vroom)';
const MAX_ATTEMPTS = 5;
/** Educado com os limites do Commons — serial com espaçamento generoso. */
const DELAY_MS = 3000;

if (!existsSync(catalogPath)) {
  console.error('✗ levantamento/catalogo-vroom.json não existe — rode `pnpm catalog` antes.');
  process.exit(1);
}

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));

function detectMime(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png';
  }
  return null;
}

function cachedFile(car) {
  for (const ext of ['jpg', 'png']) {
    const file = path.join(imageDir, `${car.slug}.${ext}`);
    if (existsSync(file)) {
      return file;
    }
  }
  return null;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const failures = [];
let downloaded = 0;
let reused = 0;
let rateLimitHits = 0;

await mkdir(imageDir, { recursive: true });

for (const [index, car] of catalog.cars.entries()) {
  const label = `${String(index + 1).padStart(3)}/${catalog.cars.length} ${car.name}`;

  const existing = cachedFile(car);
  if (existing) {
    const bytes = await readFile(existing);
    if (detectMime(bytes)) {
      reused += 1;
      continue;
    }
    console.warn(`⚠ ${label}: cache ${existing} corrompido — baixando de novo.`);
  }

  let done = false;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS && !done; attempt += 1) {
    try {
      const response = await fetch(car.downloadUrl, { headers: { 'User-Agent': USER_AGENT } });
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('retry-after')) || 45;
        const waitMs = Math.max(retryAfter * 1000, 30_000);
        throw Object.assign(new Error(`HTTP 429 — esperando ${Math.round(waitMs / 1000)}s`), {
          rateLimited: true,
          waitMs,
        });
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      const mime = detectMime(bytes);
      if (!mime) {
        throw new Error('bytes não são JPEG/PNG');
      }
      if (bytes.byteLength < 10_000) {
        throw new Error(`imagem suspeita (${bytes.byteLength} bytes)`);
      }
      const file = path.join(imageDir, `${car.slug}.${mime === 'image/png' ? 'png' : 'jpg'}`);
      await writeFile(file, bytes);
      downloaded += 1;
      console.log(`↓ ${label}: ${(bytes.byteLength / 1024).toFixed(0)} KB (${mime})`);
      done = true;
    } catch (cause) {
      if (cause.rateLimited) {
        rateLimitHits += 1;
        if (rateLimitHits > 40) {
          failures.push(`${car.name}: HTTP 429 persistente`);
          console.error(`✗ ${label}: 429 persistente — verifique o rate limit do Commons.`);
          break;
        }
        console.warn(`… ${label}: ${cause.message}`);
        await sleep(cause.waitMs);
        attempt -= 1; // 429 não consome tentativa — só o cooldown
      } else if (attempt === MAX_ATTEMPTS) {
        failures.push(`${car.name}: ${cause.message}`);
        console.error(`✗ ${label}: ${cause.message}`);
      } else {
        await sleep(2000 * attempt);
      }
    }
  }
  await sleep(DELAY_MS);
}

console.log('');
console.log(`Resumo: ${reused} em cache, ${downloaded} baixadas, ${failures.length} falha(s).`);

if (failures.length > 0) {
  process.exit(1);
}
