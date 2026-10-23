import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CookieBanner from './CookieBanner';
import { getConsent, setConsent } from '@/lib/consent';

// Mesmo delay do probe da CMP no componente (CookieBanner.jsx).
const PROBE_MS = 400;

/** Reseta o estado do consentimento entre testes (tudo negado, sem decisão). */
function resetConsent() {
  setConsent({ advertising: false, analytics: false, decided: false });
}

function renderBanner() {
  return render(
    <MemoryRouter>
      <CookieBanner />
    </MemoryRouter>,
  );
}

/** Avança os timers falsos até o probe da CMP externa concluir. */
function advanceProbe() {
  act(() => {
    vi.advanceTimersByTime(PROBE_MS);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  resetConsent();
  localStorage.clear();
  delete window.__tcfapi__;
});

describe('CookieBanner', () => {
  it('aparece só depois do probe da CMP externa', () => {
    const { queryByRole } = renderBanner();
    expect(queryByRole('dialog')).toBeNull();
    advanceProbe();
    expect(queryByRole('dialog')).not.toBeNull();
  });

  it('fica oculto quando já existe decisão registrada', () => {
    setConsent({ advertising: false, analytics: false });
    const { queryByRole } = renderBanner();
    advanceProbe();
    expect(queryByRole('dialog')).toBeNull();
  });

  it('se omite quando uma CMP externa certificada (Google) está ativa', () => {
    window.__tcfapi__ = function tcfapiStub() {};
    const { queryByRole } = renderBanner();
    advanceProbe();
    expect(queryByRole('dialog')).toBeNull();
  });

  it('Aceitar tudo persiste opt-in e esconde o banner', () => {
    const { getByRole, queryByRole } = renderBanner();
    advanceProbe();
    fireEvent.click(getByRole('button', { name: 'Aceitar tudo' }));
    expect(getConsent()).toEqual({ advertising: true, analytics: true, decided: true });
    expect(queryByRole('dialog')).toBeNull();
  });

  it('Recusar tudo persiste a negação e esconde o banner', () => {
    const { getByRole, queryByRole } = renderBanner();
    advanceProbe();
    fireEvent.click(getByRole('button', { name: 'Recusar tudo' }));
    expect(getConsent()).toEqual({ advertising: false, analytics: false, decided: true });
    expect(queryByRole('dialog')).toBeNull();
  });

  it('Personalizar abre categorias DESMARCADAS e salva a escolha granular', () => {
    const { getByRole, queryByRole } = renderBanner();
    advanceProbe();

    fireEvent.click(getByRole('button', { name: 'Personalizar' }));
    const advertising = getByRole('checkbox', { name: /Publicidade/ });
    const analytics = getByRole('checkbox', { name: /Análise/ });
    expect(advertising.checked).toBe(false);
    expect(analytics.checked).toBe(false);

    fireEvent.click(advertising);
    fireEvent.click(getByRole('button', { name: 'Salvar escolhas' }));

    expect(getConsent()).toEqual({ advertising: true, analytics: false, decided: true });
    expect(queryByRole('dialog')).toBeNull();
  });

  it('link da política de cookies aponta para /cookies', () => {
    const { getByRole } = renderBanner();
    advanceProbe();
    const link = getByRole('link', { name: 'Política de cookies' });
    expect(link.getAttribute('href')).toBe('/cookies');
  });
});
