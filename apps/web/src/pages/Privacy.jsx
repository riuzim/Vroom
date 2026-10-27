import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageMeta } from '@/hooks/usePageMeta';

export const PRIVACY_UPDATED_AT = '2026-10-26';

const focusClasses = 'text-flame underline-offset-4 hover:underline';

export default function Privacy() {
  const { t, i18n } = useTranslation();

  usePageMeta({
    title: t('legal.privacy.metaTitle'),
    description: t('legal.privacy.metaDescription'),
  });

  const updatedAt = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${PRIVACY_UPDATED_AT}T12:00:00Z`));

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.18em]">
        {t('legal.privacy.title')}
      </h1>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-bone/50">
        {t('legal.updatedAt', { date: updatedAt })}
      </p>

      <section className="mt-6 space-y-3 text-sm leading-relaxed text-bone/80">
        <p>{t('legal.privacy.intro')}</p>
      </section>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.privacy.s1title')}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-bone/80">
        <li>
          <strong>{t('legal.privacy.s1li1a')}</strong> {t('legal.privacy.s1li1b')}
        </li>
        <li>
          <strong>{t('legal.privacy.s1li2a')}</strong> {t('legal.privacy.s1li2b')}
        </li>
        <li>
          <strong>{t('legal.privacy.s1li3a')}</strong> {t('legal.privacy.s1li3b')}
        </li>
        <li>
          <strong>{t('legal.privacy.s1li4a')}</strong> {t('legal.privacy.s1li4b')}
          <Link to="/cookies" className={focusClasses}>
            {t('legal.cookiesPolicyLink')}
          </Link>
          {t('legal.privacy.s1li4c')}
        </li>
        <li>
          <strong>{t('legal.privacy.s1li5a')}</strong> {t('legal.privacy.s1li5b')}
        </li>
      </ul>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.privacy.s2title')}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-bone/80">
        <li>
          <strong>{t('legal.privacy.s2li1a')}</strong> {t('legal.privacy.s2li1b')}
        </li>
        <li>
          <strong>{t('legal.privacy.s2li2a')}</strong> {t('legal.privacy.s2li2b')}
        </li>
        <li>
          <strong>{t('legal.privacy.s2li3a')}</strong> {t('legal.privacy.s2li3b')}
        </li>
      </ul>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.privacy.s3title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">{t('legal.privacy.s3p1')}</p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.privacy.s4title')}
      </h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-bone/80">
        <p>{t('legal.privacy.s4p1')}</p>
        <p>
          {t('legal.privacy.s4p2a')}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noreferrer"
            className={focusClasses}
          >
            {t('legal.privacy.googleAdsSettings')}
          </a>
          {t('legal.privacy.s4p2b')}
          <a
            href="https://www.aboutads.info/choices"
            target="_blank"
            rel="noreferrer"
            className={focusClasses}
          >
            aboutads.info
          </a>{' '}
          {t('legal.privacy.s4p2c')}
          <a
            href="https://www.youronlinechoices.eu"
            target="_blank"
            rel="noreferrer"
            className={focusClasses}
          >
            youronlinechoices.eu
          </a>
          {t('legal.privacy.s4p2d')}
        </p>
      </div>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.privacy.s5title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">{t('legal.privacy.s5p1')}</p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.privacy.s6title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        {t('legal.privacy.s6p1a')}
        <a href="mailto:vroomfeedback@gmail.com" className={focusClasses}>
          vroomfeedback@gmail.com
        </a>
        {t('legal.privacy.s6p1b')}
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.privacy.s7title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">{t('legal.privacy.s7p1')}</p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.privacy.s8title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">{t('legal.privacy.s8p1')}</p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.privacy.s9title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">{t('legal.privacy.s9p1')}</p>
    </main>
  );
}
