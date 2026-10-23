import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Cookies from './Cookies';
import Credits from './Credits';
import Privacy from './Privacy';
import Terms from './Terms';
import { getConsent, setConsent } from '@/lib/consent';

/** Renderiza uma página legal na rota indicada (páginas usam <Link>). */
function renderRoute(path, page) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path} element={page} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  // Reseta o consentimento entre testes (a página /cookies altera o estado).
  setConsent({ advertising: false, analytics: false, decided: false });
  localStorage.clear();
});

const pages = [
  ['/privacidade', <Privacy />, 'Política de Privacidade'],
  ['/termos', <Terms />, 'Termos de Uso'],
  ['/cookies', <Cookies />, 'Política de Cookies'],
  ['/creditos', <Credits />, 'Créditos e Licenças'],
];

describe('páginas legais (rotas do rodapé)', () => {
  it.each(pages)('%s renderiza com o h1 correto', (path, page, h1) => {
    const { getByRole } = renderRoute(path, page);
    expect(getByRole('heading', { level: 1, name: h1 })).not.toBeNull();
  });

  it('Privacidade traz a divulgação obrigatória de cookies do AdSense', () => {
    const { getByText, container } = renderRoute('/privacidade', <Privacy />);
    expect(
      getByText(/Terceiros, incluindo o Google, usam cookies para veicular anúncios/i),
    ).not.toBeNull();

    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('https://adssettings.google.com');
    expect(hrefs).toContain('https://www.aboutads.info/choices');
  });

  it('Cookies permite reabrir o banner (revogação LGPD)', () => {
    setConsent({ advertising: true, analytics: true });
    const { getByRole } = renderRoute('/cookies', <Cookies />);
    fireEvent.click(getByRole('button', { name: 'Revisar preferências de cookies' }));
    expect(getConsent().decided).toBe(false);
  });

  it('Créditos lista todos os carros com autor, licença e fonte', () => {
    const { getAllByRole } = renderRoute('/creditos', <Credits />);
    expect(getAllByRole('link', { name: 'Ver no Commons' }).length).toBeGreaterThanOrEqual(100);
    // Licenças com deed clicável (CC BY/BY-SA/CC0/domínio público).
    expect(
      getAllByRole('link').some((link) =>
        (link.getAttribute('href') || '').includes('creativecommons.org'),
      ),
    ).toBe(true);
  });
});
