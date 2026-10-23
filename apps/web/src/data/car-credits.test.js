import { describe, expect, it } from 'vitest';
import credits from './car-credits.json';

/**
 * car-credits.json é GERADO por scripts/gen-car-credits.mjs (chamado pelo
 * `pnpm catalog`). Este teste garante que o arquivo é seguro para o bundle:
 * completo, licenças válidas e SEM URLs de imagem (anti-cheat do catálogo).
 */

const KNOWN_LICENSES = [
  'CC BY 2.0',
  'CC BY 4.0',
  'CC BY-SA 2.0',
  'CC BY-SA 3.0',
  'CC BY-SA 4.0',
  'CC0',
  'Public domain',
];

describe('car-credits.json (atribuição CC das fotos)', () => {
  it('tem todos os campos obrigatórios em todos os registros', () => {
    expect(credits.length).toBeGreaterThanOrEqual(100);
    for (const item of credits) {
      const label = JSON.stringify(item);
      expect(item.name, label).toBeTruthy();
      expect(item.author, label).toBeTruthy();
      expect(KNOWN_LICENSES, label).toContain(item.license);
      expect(item.licenseUrl, label).toMatch(/^https:\/\//);
      expect(item.filePageUrl, label).toMatch(
        /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/,
      );
    }
  });

  it('não vaza URLs de imagem no bundle do cliente (anti-cheat)', () => {
    for (const item of credits) {
      expect(JSON.stringify(item)).not.toMatch(/upload\.wikimedia\.org/);
    }
  });

  it('está em ordem alfabética (pt-BR) por nome de carro', () => {
    const names = credits.map((item) => item.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    expect(names).toEqual(sorted);
  });

  it('licença e deed casam (CC BY-SA→by-sa, CC BY→by, CC0→zero)', () => {
    for (const item of credits) {
      if (item.license === 'CC0') {
        expect(item.licenseUrl).toContain('publicdomain/zero/1.0');
      } else if (item.license.startsWith('CC BY-SA')) {
        expect(item.licenseUrl).toMatch(/creativecommons\.org\/licenses\/by-sa\/[0-9.]+\/?$/);
        expect(item.licenseUrl).toContain(item.license.replace(/^CC BY-SA /, ''));
      } else if (item.license.startsWith('CC BY ')) {
        expect(item.licenseUrl).toMatch(/creativecommons\.org\/licenses\/by\/[0-9.]+\/?$/);
        expect(item.licenseUrl).toContain(item.license.replace(/^CC BY /, ''));
      }
    }
  });
});
