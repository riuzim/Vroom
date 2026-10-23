import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import AdSlot from './AdSlot';
import { setConsent } from '@/lib/consent';

const CLIENT = 'ca-pub-1234567890123456';

afterEach(() => {
  cleanup();
  // Reseta o consentimento entre testes (decisão reaberta, tudo negado).
  setConsent({ advertising: false, analytics: false, decided: false });
  localStorage.clear();
  delete import.meta.env.VITE_ADSENSE_CLIENT;
});

describe('AdSlot (gate: config + consentimento de publicidade)', () => {
  it('não renderiza nada sem VITE_ADSENSE_CLIENT (dev/GitHub Pages atual)', () => {
    setConsent({ advertising: true, analytics: true });
    const { container } = render(<AdSlot slot="home-hero" />);
    expect(container.firstElementChild).toBeNull();
  });

  it('não renderiza sem consentimento de publicidade (LGPD opt-in)', () => {
    import.meta.env.VITE_ADSENSE_CLIENT = CLIENT;
    const { container } = render(<AdSlot slot="home-hero" />);
    expect(container.firstElementChild).toBeNull();
  });

  it('não renderiza se o usuário rejeitou cookies de publicidade', () => {
    import.meta.env.VITE_ADSENSE_CLIENT = CLIENT;
    setConsent({ advertising: false, analytics: false });
    const { container } = render(<AdSlot slot="home-hero" />);
    expect(container.firstElementChild).toBeNull();
  });

  it('renderiza slot rotulado quando configurado E consentido', () => {
    import.meta.env.VITE_ADSENSE_CLIENT = CLIENT;
    setConsent({ advertising: true, analytics: true });
    const { getByRole } = render(<AdSlot slot="home-hero" minHeight={280} />);

    const aside = getByRole('complementary', { name: 'Publicidade' });
    const ins = aside.querySelector('ins.adsbygoogle');
    expect(ins).not.toBeNull();
    expect(ins.getAttribute('data-ad-client')).toBe(CLIENT);
    expect(ins.getAttribute('data-ad-slot')).toBe('home-hero');
    // Reserva de altura anti-CLS (o wrapper define minHeight).
    expect(aside.querySelector('[style*="min-height"]')).not.toBeNull();
  });
});
