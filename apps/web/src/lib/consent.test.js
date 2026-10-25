import { afterEach, describe, expect, it } from 'vitest';
import { consentFor, getConsent, setConsent } from './consent';

/** Reseta o estado do módulo para o próximo teste (tudo negado, sem decisão). */
function resetConsent() {
  setConsent({ advertising: false, analytics: false, decided: false });
}

const countUpdates = () =>
  window.dataLayer.filter((entry) => entry[0] === 'consent' && entry[1] === 'update').length;

afterEach(() => {
  resetConsent();
  localStorage.clear();
});

describe('consent store (LGPD: opt-in, desmarcado por padrão)', () => {
  it('inicia tudo negado e sem decisão registrada', () => {
    expect(getConsent()).toEqual({ advertising: false, analytics: false, decided: false });
    expect(consentFor('advertising')).toBe(false);
    expect(consentFor('analytics')).toBe(false);
    // Essenciais (sessão de login) não dependem de consentimento — nem sem decisão.
    expect(consentFor('essential')).toBe(true);
  });

  it('setConsent persiste o opt-in e marca a decisão', () => {
    setConsent({ advertising: true, analytics: false });
    expect(getConsent()).toEqual({ advertising: true, analytics: false, decided: true });
    expect(consentFor('advertising')).toBe(true);
    expect(consentFor('analytics')).toBe(false);
  });

  it('rejeição total também é uma decisão registrada', () => {
    setConsent({ advertising: false, analytics: false });
    expect(getConsent()).toEqual({ advertising: false, analytics: false, decided: true });
    expect(consentFor('advertising')).toBe(false);
  });

  it('revogação: {decided:false} explícito reabre o fluxo de consentimento', () => {
    setConsent({ advertising: true, analytics: true });
    setConsent({ decided: false });
    expect(getConsent().decided).toBe(false);
    // Sem decisão vigente, categoria volta a ser tratada como negada.
    expect(consentFor('advertising')).toBe(false);
  });

  it('sobrevive a localStorage corrompido', () => {
    localStorage.setItem('vroom:consent:v1', 'não é json{{{');
    // A leitura do storage acontece no carregamento do módulo; o que o
    // estado corrompido NÃO pode fazer é habilitar categoria nenhuma.
    setConsent({ decided: true });
    expect(consentFor('advertising')).toBe(false);
    expect(consentFor('analytics')).toBe(false);
  });
});

describe('Consent Mode v2 (dataLayer usado pelo AdSense)', () => {
  it('registra defaults NEGADOS quando o módulo carrega', () => {
    const defaults = window.dataLayer.filter(
      (entry) => entry[0] === 'consent' && entry[1] === 'default',
    );
    expect(defaults).toHaveLength(1);
    expect(defaults[0][2]).toEqual({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
  });

  it('publica update granted/denied conforme a escolha do usuário', () => {
    setConsent({ advertising: true, analytics: false });
    expect(window.dataLayer.filter(countFilter).at(-1)[2]).toMatchObject({
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'denied',
    });

    setConsent({ advertising: false, analytics: false });
    expect(window.dataLayer.filter(countFilter).at(-1)[2].ad_storage).toBe('denied');
  });

  it('indeciso/revogado publica denied — revogação tem efeito imediato', () => {
    const before = countUpdates();
    setConsent({ decided: false });
    expect(countUpdates()).toBe(before + 1);
    expect(window.dataLayer.filter(countFilter).at(-1)[2].ad_storage).toBe('denied');
  });
});

function countFilter(entry) {
  return entry[0] === 'consent' && entry[1] === 'update';
}
