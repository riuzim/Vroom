import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hasExternalCmp, setConsent, useConsent } from '@/lib/consent';

/**
 * Banner de consentimento LGPD (opt-in). Categorias não essenciais só são
 * habilitadas por escolha explícita; nada é pré-marcado. Se uma CMP externa
 * certificada (Google CMP, TCF) estiver ativa na região, este banner se
 * omite para não duplicar o fluxo.
 */

// Dá tempo da CMP do Google (se ativa) injetar window.__tcfapi__ antes de
// decidirmos se mostramos o nosso banner.
const CMP_PROBE_DELAY_MS = 400;

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export default function CookieBanner() {
  const consent = useConsent();
  const [show, setShow] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [choices, setChoices] = useState({ advertising: false, analytics: false });

  useEffect(() => {
    if (consent.decided) {
      setShow(false);
      return;
    }
    const timer = setTimeout(() => {
      if (!hasExternalCmp()) setShow(true);
    }, CMP_PROBE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [consent]);

  if (!show) return null;

  const acceptAll = () => setConsent({ advertising: true, analytics: true });
  const rejectAll = () => setConsent({ advertising: false, analytics: false });
  const saveChoices = () => setConsent({ ...choices });

  const toggleChoice = (category) =>
    setChoices((current) => ({ ...current, [category]: !current[category] }));

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-flame bg-ink text-bone shadow-[0_-8px_24px_rgba(0,0,0,0.5)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-sm leading-relaxed text-bone/80">
          Usamos cookies essenciais para o site funcionar (sessão de login). Cookies
          de publicidade e análise só são usados com o seu consentimento.{' '}
          <Link
            to="/cookies"
            className="font-bold text-flame underline-offset-4 hover:underline motion-reduce:transition-none"
          >
            Política de cookies
          </Link>
        </p>

        {customizing ? (
          <div className="mt-3 border-2 border-line bg-raised p-3">
            <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={choices.advertising}
                onChange={() => toggleChoice('advertising')}
                className="size-4 accent-flame"
              />
              <span>
                <strong className="font-black uppercase tracking-wide">Publicidade</strong>
                <span className="block text-xs text-bone/55">
                  Cookies do Google AdSense para veicular e medir anúncios.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={choices.analytics}
                onChange={() => toggleChoice('analytics')}
                className="size-4 accent-flame"
              />
              <span>
                <strong className="font-black uppercase tracking-wide">Análise</strong>
                <span className="block text-xs text-bone/55">
                  Estatísticas anônimas de uso para melhorar o jogo (nenhuma hoje).
                </span>
              </span>
            </label>
            <button
              type="button"
              onClick={saveChoices}
              className={`mt-3 rounded-none border-2 border-flame bg-flame px-4 py-1.5 text-xs font-black uppercase tracking-wide text-ink transition hover:brightness-110 motion-reduce:transition-none ${focusRing}`}
            >
              Salvar escolhas
            </button>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={acceptAll}
              className={`rounded-none border-2 border-flame bg-flame px-4 py-1.5 text-xs font-black uppercase tracking-wide text-ink transition hover:brightness-110 motion-reduce:transition-none ${focusRing}`}
            >
              Aceitar tudo
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className={`rounded-none border-2 border-bone px-4 py-1.5 text-xs font-black uppercase tracking-wide text-bone transition hover:border-flame hover:text-flame motion-reduce:transition-none ${focusRing}`}
            >
              Recusar tudo
            </button>
            <button
              type="button"
              onClick={() => setCustomizing(true)}
              className={`rounded-none border-2 border-bone px-4 py-1.5 text-xs font-black uppercase tracking-wide text-bone transition hover:border-flame hover:text-flame motion-reduce:transition-none ${focusRing}`}
            >
              Personalizar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
