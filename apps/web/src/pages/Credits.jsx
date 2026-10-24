import { useTranslation } from 'react-i18next';
import { usePageMeta } from '@/hooks/usePageMeta';
import carCredits from '@/data/car-credits.json';

export const CREDITS_UPDATED_AT = '2026-10-18';

const focusClasses =
  'text-flame underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export default function Credits() {
  const { t, i18n } = useTranslation();

  usePageMeta({
    title: t('legal.creditsPage.metaTitle'),
    description: t('legal.creditsPage.metaDescription'),
  });

  const updatedAt = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${CREDITS_UPDATED_AT}T12:00:00Z`));

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.18em]">
        {t('legal.creditsPage.title')}
      </h1>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-bone/50">
        {t('legal.updatedAt', { date: updatedAt })}
      </p>

      <p className="mt-6 text-sm leading-relaxed text-bone/80">
        {t('legal.creditsPage.p1a')}
        <a
          href="https://commons.wikimedia.org"
          target="_blank"
          rel="noreferrer"
          className={focusClasses}
        >
          Wikimedia Commons
        </a>
        {t('legal.creditsPage.p1b')}
      </p>

      <div className="mt-6 overflow-hidden rounded-md border border-bone/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-bone/10 bg-raised font-mono text-xs uppercase tracking-wide text-bone/60">
              <th className="p-3">{t('legal.creditsPage.thCar')}</th>
              <th className="p-3">{t('legal.creditsPage.thAuthor')}</th>
              <th className="p-3">{t('legal.creditsPage.thLicense')}</th>
              <th className="p-3">{t('legal.creditsPage.thSource')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bone/10 text-bone/80">
            {carCredits.map((credit) => (
              <tr key={credit.filePageUrl}>
                <td className="p-3 font-bold">{credit.name}</td>
                <td className="p-3">{credit.author}</td>
                <td className="p-3">
                  <a
                    href={credit.licenseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={focusClasses}
                  >
                    {credit.license}
                  </a>
                </td>
                <td className="p-3">
                  <a
                    href={credit.filePageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={focusClasses}
                  >
                    {t('legal.creditsPage.viewOnCommons')}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
