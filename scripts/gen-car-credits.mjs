#!/usr/bin/env node
/**
 * gen-car-credits.mjs — gera apps/web/src/data/car-credits.json (dados de
 * atribuição da página /creditos) a partir do registro consolidado
 * levantamento/catalogo-vroom.json.
 *
 * Mantém APENAS campos de atribuição (nome, autor, licença, link da fonte) —
 * sem URLs de imagem — para não expor no bundle do cliente a associação
 * nome ↔ imagem (anti-cheat do catálogo; ver scripts/build-catalog.mjs).
 *
 * Rode standalone (`node scripts/gen-car-credits.mjs`) ou via pipeline:
 * scripts/build-catalog.mjs importa as funções exportadas daqui e emite o
 * mesmo arquivo quando o catálogo é regenerado.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(root, 'levantamento', 'catalogo-vroom.json');
const creditsOut = path.join(root, 'apps', 'web', 'src', 'data', 'car-credits.json');

const LICENSE_DEEDS = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0',
  'Public domain': 'https://commons.wikimedia.org/wiki/Help:Public_domain',
};

function licenseDeedUrl(license) {
  if (LICENSE_DEEDS[license]) return LICENSE_DEEDS[license];
  const match = /^CC (BY-SA|BY) ([0-9.]+)$/.exec(license);
  if (match) {
    return `https://creativecommons.org/licenses/${match[1].toLowerCase()}/${match[2]}`;
  }
  return '';
}

/**
 * Valida e projeta entradas (batch completo do levantamento) no formato de
 * créditos. Aborta se qualquer campo de atribuição estiver faltando.
 */
export function carCreditsFromEntries(entries) {
  const errors = [];
  const credits = entries
    .map((entry) => {
      const where = entry.slug ?? entry.name ?? '(sem slug)';
      for (const field of ['name', 'author', 'license', 'filePageUrl']) {
        if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
          errors.push(`${where}: campo de atribuição "${field}" ausente/vazio.`);
        }
      }
      const licenseUrl = licenseDeedUrl(entry.license);
      if (!licenseUrl) {
        errors.push(`${where}: licença desconhecida "${entry.license}".`);
      }
      return {
        name: entry.name,
        author: entry.author,
        license: entry.license,
        licenseUrl,
        filePageUrl: entry.filePageUrl,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

  if (errors.length > 0) {
    throw new Error(`Créditos inválidos (${errors.length} problema(s)):\n  - ${errors.join('\n  - ')}`);
  }
  return credits;
}

export function formatCreditsJson(credits) {
  return `${JSON.stringify(credits, null, 2)}\n`;
}

// ---------------------------------------------------------------------------
// CLI — só roda quando executado diretamente (não quando importado).
// ---------------------------------------------------------------------------
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
  const credits = carCreditsFromEntries(catalog.cars);
  await mkdir(path.dirname(creditsOut), { recursive: true });
  await writeFile(creditsOut, formatCreditsJson(credits), 'utf8');
  console.log(`✓ Créditos gerados: ${credits.length} carros.`);
  console.log(`  • ${path.relative(root, creditsOut)}`);
  const licenses = [...new Set(credits.map((credit) => credit.license))].sort();
  console.log(`  • Licenças presentes: ${licenses.join(', ')}`);
}
