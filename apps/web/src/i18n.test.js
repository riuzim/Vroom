import { describe, expect, it } from 'vitest';
import en from './i18n/locales/en.json';
import es from './i18n/locales/es.json';
import ptBR from './i18n/locales/pt-BR.json';

/**
 * Integridade do i18n: en e es precisam cobrir EXATAMENTE as mesmas chaves
 * do pt-BR (fallbackLng) e nenhum valor pode ser vazio — assim nenhuma tela
 * fica parcialmente traduzida ou com texto faltando.
 */

function flattenKeys(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') return flattenKeys(value, path);
    return [path];
  });
}

function flatEntries(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') return flatEntries(value, path);
    return [[path, value]];
  });
}

const locales = { 'pt-BR': ptBR, en, es };
const expectedKeys = new Set(flattenKeys(ptBR).sort());

describe('i18n locales', () => {
  it.each(Object.keys(locales))('%s cobre todas as chaves do pt-BR', (code) => {
    const keys = flattenKeys(locales[code]).sort();
    expect(new Set(keys)).toEqual(expectedKeys);
  });

  it.each(Object.keys(locales))('%s não tem valor vazio', (code) => {
    for (const [path, value] of flatEntries(locales[code])) {
      expect(String(value).trim(), `chave vazia: ${path}`).not.toBe('');
    }
  });

  it('plurais do i18next existem nas três línguas', () => {
    for (const code of Object.keys(locales)) {
      expect(locales[code].game.messages.wrong_one).toBeTruthy();
      expect(locales[code].game.messages.wrong_other).toBeTruthy();
      expect(locales[code].leaderboard.rounds_one).toBeTruthy();
      expect(locales[code].leaderboard.rounds_other).toBeTruthy();
    }
  });

  it('pt-BR mantém strings críticas usadas pelos testes de UI', () => {
    expect(ptBR.game.guessLabel).toBe('Seu chute');
    expect(ptBR.cookieBanner.acceptAll).toBe('Aceitar tudo');
    expect(ptBR.cookieBanner.rejectAll).toBe('Recusar tudo');
    expect(ptBR.cookieBanner.customize).toBe('Personalizar');
    expect(ptBR.cookieBanner.saveChoices).toBe('Salvar escolhas');
    expect(ptBR.legal.cookiesPage.reviewButton).toBe('Revisar preferências de cookies');
    expect(ptBR.legal.creditsPage.viewOnCommons).toBe('Ver no Commons');
    expect(ptBR.ads.label).toBe('Publicidade');
    expect(ptBR.legal.privacy.s4p1).toContain('Terceiros, incluindo o Google, usam cookies');
  });
});
