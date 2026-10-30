#!/usr/bin/env node
/**
 * build-catalog.mjs — consolida o levantamento (levantamento/batches/batch-N/*.json)
 * nos artefatos de código do jogo:
 *
 *   1. packages/shared/src/cars.ts   → catálogo completo (anti-cheat: subpath dedicado)
 *   2. packages/shared/src/names.ts  → espelho literal de nomes para o bundle do cliente
 *   3. levantamento/catalogo-vroom.json → registro completo com evidências (proveniência)
 *   4. apps/web/src/data/car-credits.json → atribuição da página /creditos (sem URLs de imagem)
 *
 * Valida cada registro antes de gerar (status, URLs do Commons, licença/autor,
 * mime, unicidade). Qualquer problema aborta com mensagem — nada de catálogo
 * pela metade.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { carCreditsFromEntries, formatCreditsJson } from './gen-car-credits.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const batchesDir = path.join(root, 'levantamento', 'batches');
const carsOut = path.join(root, 'packages', 'shared', 'src', 'cars.ts');
const namesOut = path.join(root, 'packages', 'shared', 'src', 'names.ts');
const catalogOut = path.join(root, 'levantamento', 'catalogo-vroom.json');
const creditsOut = path.join(root, 'apps', 'web', 'src', 'data', 'car-credits.json');

/** Contagem esperada por batch — fecha em 200 no total. */
const EXPECTED = { 1: 20, 2: 21, 3: 22, 4: 19, 5: 18, 6: 20, 7: 20, 8: 20, 9: 20, 10: 20 };
const args = process.argv.slice(2);
const partial = args.includes('--partial');
const CATEGORIES = new Set([
  'supercar',
  'sport',
  'muscle',
  'classic',
  'sedan',
  'hatch',
  'suv',
  'pickup',
  'jdm',
  'ev',
  'bra',
  'lux',
  'test',
]);

const errors = [];
const fail = (message) => errors.push(message);

function validate(entry, batch, file) {
  const where = `batch-${batch}/${file}`;
  const str = (field) => typeof entry[field] === 'string' && entry[field].trim().length > 0;

  if (entry.status !== 'ok') {
    fail(`${where}: status "${entry.status}" — troque por um reserva antes de gerar.`);
  }
  for (const field of [
    'name',
    'brand',
    'model',
    'category',
    'years',
    'downloadUrl',
    'originalUrl',
    'filePageUrl',
    'license',
    'author',
    'mime',
    'dimensions',
    'matchEvidence',
  ]) {
    if (!str(field)) {
      fail(`${where}: campo "${field}" ausente/vazio.`);
    }
  }
  if (typeof entry.existing !== 'boolean') {
    fail(`${where}: "existing" deve ser boolean.`);
  }
  if (entry.category && !CATEGORIES.has(entry.category)) {
    fail(`${where}: categoria desconhecida "${entry.category}".`);
  }
  if (
    entry.downloadUrl &&
    !/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[^?]+$/.test(entry.downloadUrl)
  ) {
    fail(`${where}: downloadUrl deve ser https://upload.wikimedia.org/... sem query (${entry.downloadUrl}).`);
  }
  if (entry.filePageUrl && !entry.filePageUrl.startsWith('https://commons.wikimedia.org/wiki/File:')) {
    fail(`${where}: filePageUrl deve apontar para a página File: do Commons.`);
  }
  if (entry.mime && !['image/jpeg', 'image/png'].includes(entry.mime)) {
    fail(`${where}: mime "${entry.mime}" não suportado (jpeg/png).`);
  }
  if (file && !/^[a-z0-9-]+\.json$/.test(file)) {
    fail(`${where}: nome de arquivo deve ser kebab-case.json.`);
  }
}

async function readBatch(number) {
  const dir = path.join(batchesDir, `batch-${number}`);
  let files;
  try {
    files = (await readdir(dir)).filter((file) => file.endsWith('.json')).sort();
  } catch (cause) {
    if (partial) {
      console.warn(`⚠ batch-${number}: diretório ausente ou ilegível — ${cause.message} (modo --partial).`);
      return [];
    }
    fail(`batch-${number}: diretório ilegível — ${cause.message}`);
    return [];
  }

  const expected = EXPECTED[number];
  if (!partial && files.length !== expected) {
    fail(`batch-${number}: ${files.length} arquivos, esperados ${expected}.`);
  } else if (partial && files.length !== expected) {
    console.warn(`⚠ batch-${number}: ${files.length} arquivos, esperados ${expected} (modo --partial).`);
  }

  const entries = [];
  for (const file of files) {
    let entry;
    try {
      entry = JSON.parse(await readFile(path.join(dir, file), 'utf8'));
    } catch (cause) {
      fail(`batch-${number}/${file}: JSON inválido — ${cause.message}`);
      continue;
    }
    validate(entry, number, file);
    entry.slug = file.replace(/\.json$/, '');
    entries.push(entry);
  }
  return entries;
}

const batches = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => readBatch(number)));
const entries = batches.flat();

const seen = new Map();
for (const entry of entries) {
  if (seen.has(entry.name)) {
    fail(`nome duplicado: "${entry.name}" (batch-${seen.get(entry.name)} e de novo).`);
  }
  seen.set(entry.name, entry.slug);
}

if (!partial && entries.length !== 200) {
  fail(`total ${entries.length} carros — o catálogo fecha em exatamente 200.`);
} else if (partial && entries.length < 100) {
  fail(`modo --partial exige pelo menos 100 carros; encontrado ${entries.length}.`);
} else if (partial && entries.length !== 200) {
  console.warn(`⚠ modo --partial: total ${entries.length} carros (esperado 200).`);
}

if (errors.length > 0) {
  console.error(`✗ Catálogo inválido (${errors.length} problema(s)):\n`);
  for (const message of errors) {
    console.error(`  - ${message}`);
  }
  process.exit(1);
}

const q = JSON.stringify;

// --- packages/shared/src/cars.ts -------------------------------------------
const carsTs = `// GERADO por scripts/build-catalog.mjs a partir de levantamento/batches/ —
// NÃO editar à mão. Para atualizar, edite os arquivos do levantamento e rode
// \`pnpm catalog\`.
//
// Catálogo completo (nome ↔ imagem + proveniência/atribuição). Este módulo
// fica FORA do barrel de propósito: o bundle do navegador só pode enxergar
// \`carNames\` (names.ts). Caso contrário quem abrir o bundle cruza a imagem
// da rodada com o nome do carro e quebra o jogo.
//
// \`downloadUrl\` é usado apenas pela seed como fallback offline — o runtime
// serve os bytes pela rodada (/api/rounds/:id/image, com posse).

export interface CatalogCar {
  /** Nome oficial do jogo (resposta válida do chute). */
  name: string;
  /** Identificador do arquivo de imagem no cache da seed (kebab-case). */
  slug: string;
  brand: string;
  /** Designação precisa do modelo/geração (ex.: "Skyline GT-R (R34)"). */
  model: string;
  category: string;
  /** Anos de produção da geração retratada. */
  years: string;
  /** Imagem (thumb ≤1280px) no Wikimedia Commons — só para a seed. */
  downloadUrl: string;
  /** Página File: do Commons — atribuição de licença. */
  filePageUrl: string;
  author: string;
  license: string;
  mime: string;
}

export const cars: CatalogCar[] = [
${entries
  .map(
    (entry) =>
      `  { name: ${q(entry.name)}, slug: ${q(entry.slug)}, brand: ${q(entry.brand)}, model: ${q(entry.model)}, category: ${q(entry.category)}, years: ${q(entry.years)}, downloadUrl: ${q(entry.downloadUrl)}, filePageUrl: ${q(entry.filePageUrl)}, author: ${q(entry.author)}, license: ${q(entry.license)}, mime: ${q(entry.mime)} },`,
  )
  .join('\n')}
];
`;

// --- packages/shared/src/names.ts -------------------------------------------
const namesTs = `/**
 * Lista LITERAL de nomes — sem imagens e sem importar \`cars.ts\`.
 *
 * Este módulo é o único catálogo que chega ao bundle do navegador
 * (via barrel index). A associação nome ↔ imagem NUNCA deve ser
 * importada por código que roda no cliente, senão o anti-cheat
 * quebra: quem abrir o bundle casa a imagem da rodada com o nome do
 * carro e acerta de primeira.
 *
 * GERADO por scripts/build-catalog.mjs. \`src/cars.test.ts\` garante
 * que esta lista acompanhe \`cars.ts\` (mesma ordem, sem duplicados).
 */
export const carNames: readonly string[] = [
${entries.map((entry) => `  ${q(entry.name)},`).join('\n')}
];
`;

// --- levantamento/catalogo-vroom.json ----------------------------------------
const catalog = {
  generatedAt: new Date().toISOString(),
  total: entries.length,
  source: 'Wikimedia Commons (verificação documental via API — ver RELATORIO.md)',
  batches: { 1: 'existentes 1-20', 2: 'existentes 21-41', 3: 'supercarros+americanos', 4: 'JDM+brasileiros', 5: 'europeus', 6: 'supercarros/luxo 2', 7: 'JDM 2', 8: 'europeus 2', 9: 'americanos 2', 10: 'brasileiros+variados' },
  cars: entries,
};

await writeFile(carsOut, carsTs, 'utf8');
await writeFile(namesOut, namesTs, 'utf8');
await writeFile(catalogOut, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
await writeFile(creditsOut, formatCreditsJson(carCreditsFromEntries(entries)), 'utf8');

console.log(`✓ Catálogo gerado: ${entries.length} carros.`);
console.log(`  • ${path.relative(root, carsOut)}`);
console.log(`  • ${path.relative(root, namesOut)}`);
console.log(`  • ${path.relative(root, catalogOut)}`);
console.log(`  • ${path.relative(root, creditsOut)}`);
const licenses = [...new Set(entries.map((entry) => entry.license))].sort();
console.log(`  • Licenças presentes: ${licenses.join(', ')}`);
