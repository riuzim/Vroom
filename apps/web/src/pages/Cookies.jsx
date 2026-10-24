import { useTranslation } from 'react-i18next';
import { usePageMeta } from '@/hooks/usePageMeta';
import { setConsent, useConsent } from '@/lib/consent';

export const COOKIES_UPDATED_AT = '2026-10-18';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const focusClasses = 'text-flame underline-offset-4 hover:underline';

export default function Cookies() {
  const { t, i18n } = useTranslation();

  usePageMeta({
    title: t('legal.cookiesPage.metaTitle'),
    description: t('legal.cookiesPage.metaDescription'),
  });
  const consent = useConsent();

  const reopenBanner = () => setConsent({ decided: false });

  const updatedAt = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${COOKIES_UPDATED_AT}T12:00:00Z`));

  const consentStatus = (enabled) =>
    consent.decided
      ? enabled
        ? t('legal.cookiesPage.statusEnabled')
        : t('legal.cookiesPage.statusDisabled')
      : t('legal.cookiesPage.statusPending');

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.18em]">
        {t('legal.cookiesPage.title')}
      </h1>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-bone/50">
        {t('legal.updatedAt', { date: updatedAt })}
      </p>

      <p className="mt-6 text-sm leading-relaxed text-bone/80">{t('legal.cookiesPage.p1')}</p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.cookiesPage.categoriesTitle')}
      </h2>
      <div className="mt-2 overflow-hidden rounded-md border border-bone/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-bone/10 bg-raised font-mono text-xs uppercase tracking-wide text-bone/60">
              <th className="p-3">{t('legal.cookiesPage.thCategory')}</th>
              <th className="p-3">{t('legal.cookiesPage.thPurpose')}</th>
              <th className="p-3">{t('legal.cookiesPage.thConsent')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bone/10 text-bone/80">
            <tr>
              <td className="p-3 font-bold">{t('legal.cookiesPage.essential')}</td>
              <td className="p-3">
                <code className="font-mono text-xs">vroom_token</code>
                {t('legal.cookiesPage.essentialDescA')}
                <code className="font-mono text-xs">vroom:scores</code>
                {t('legal.cookiesPage.essentialDescB')}
                <code className="font-mono text-xs">vroom:consent</code>
                {t('legal.cookiesPage.essentialDescC')}
              </td>
              <td className="p-3">{t('legal.cookiesPage.essentialConsent')}</td>
            </tr>
            <tr>
              <td className="p-3 font-bold">{t('cookieBanner.advertising')}</td>
              <td className="p-3">
                {t('legal.cookiesPage.advertisingDesc1')}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noreferrer"
                  className={focusClasses}
                >
                  {t('legal.cookiesPage.googlePage')}
                </a>
                {t('legal.cookiesPage.advertisingDesc2')}
              </td>
              <td className="p-3">
                {t('legal.cookiesPage.optIn')}
                <strong>{consentStatus(consent.advertising)}</strong>
              </td>
            </tr>
            <tr>
              <td className="p-3 font-bold">{t('cookieBanner.analytics')}</td>
              <td className="p-3">{t('legal.cookiesPage.analyticsDesc')}</td>
              <td className="p-3">
                {t('legal.cookiesPage.optIn')}
                <strong>{consentStatus(consent.analytics)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.cookiesPage.manageTitle')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        {t('legal.cookiesPage.manageP1a')}
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noreferrer"
          className={focusClasses}
        >
          {t('legal.privacy.googleAdsSettings')}
        </a>
        {t('legal.cookiesPage.manageP1b')}
        <a
          href="https://www.aboutads.info/choices"
          target="_blank"
          rel="noreferrer"
          className={focusClasses}
        >
          aboutads.info
        </a>{' '}
        {t('legal.cookiesPage.manageP1c')}
        <a
          href="https://www.youronlinechoices.eu"
          target="_blank"
          rel="noreferrer"
          className={focusClasses}
        >
          youronlinechoices.eu
        </a>
        {t('legal.cookiesPage.manageP1d')}
      </p>
      <button
        type="button"
        onClick={reopenBanner}
        className={`mt-4 rounded-md bg-flame px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wide text-ink transition hover:shadow-hard-sm active:translate-y-[2px] active:shadow-none motion-reduce:transition-none ${focusRing}`}
      >
        {t('legal.cookiesPage.reviewButton')}
      </button>
    </main>
  );
}
