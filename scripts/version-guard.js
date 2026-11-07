#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const versionPath = 'packages/shared/src/version.ts';
const content = readFileSync(versionPath, 'utf8');
const versionMatch = content.match(/export const GAME_VERSION = '([^']+)'/);
if (!versionMatch) {
  console.error('GAME_VERSION não encontrada');
  process.exit(1);
}
const version = versionMatch[1];
console.log(`GAME_VERSION = ${version}`);

const logMatch = content.match(/export const VERSION_LOG[\s\S]+?\] = \[/);
if (!logMatch) {
  console.error('VERSION_LOG não encontrada');
  process.exit(1);
}

// Verifica se o último log corresponde à versão
if (!content.includes(`version: '${version}'`)) {
  console.error('VERSION_LOG não contém entrada para versão atual');
  process.exit(1);
}

console.log('Version guard OK');
