import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      aria-label={t('cookieBanner.ariaLabel')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-flame/60 bg-ink text-bone shadow-[0_-4px_0_0_rgba(0,0,0,0.45)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-sm leading-relaxed text-bone/80">
          {t('cookieBanner.body')}{' '}
          <Link
            to="/cookies"
            className="font-bold text-flame underline-offset-4 hover:underline motion-reduce:transition-none"
          >
            {t('cookieBanner.policyLink')}
          </Link>
        </p>

        {customizing ? (
          <div className="mt-3 rounded-md border border-bone/10 bg-raised p-3">
            <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={choices.advertising}
                onChange={() => toggleChoice('advertising')}
                className="size-4 accent-flame"
              />
              <span>
                <strong className="font-display font-semibold uppercase tracking-wide">
                  {t('cookieBanner.advertising')}
                </strong>
                <span className="block text-xs text-bone/55">
                  {t('cookieBanner.advertisingDesc')}
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
                <strong className="font-display font-semibold uppercase tracking-wide">
                  {t('cookieBanner.analytics')}
                </strong>
                <span className="block text-xs text-bone/55">
                  {t('cookieBanner.analyticsDesc')}
                </span>
              </span>
            </label>
            <button
              type="button"
              onClick={saveChoices}
              className={`mt-3 rounded-md bg-flame px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-ink transition hover:shadow-hard-sm active:translate-y-[2px] active:shadow-none motion-reduce:transition-none ${focusRing}`}
            >
              {t('cookieBanner.saveChoices')}
            </button>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={acceptAll}
              className={`rounded-md bg-flame px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-ink transition hover:shadow-hard-sm active:translate-y-[2px] active:shadow-none motion-reduce:transition-none ${focusRing}`}
            >
              {t('cookieBanner.acceptAll')}
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className={`rounded-md border border-bone/25 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-bone transition hover:border-flame hover:text-flame motion-reduce:transition-none ${focusRing}`}
            >
              {t('cookieBanner.rejectAll')}
            </button>
            <button
              type="button"
              onClick={() => setCustomizing(true)}
              className={`rounded-md border border-bone/25 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-bone transition hover:border-flame hover:text-flame motion-reduce:transition-none ${focusRing}`}
            >
              {t('cookieBanner.customize')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
