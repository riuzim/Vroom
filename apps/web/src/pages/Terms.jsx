import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageMeta } from '@/hooks/usePageMeta';

export const TERMS_UPDATED_AT = '2026-10-18';

const focusClasses = 'text-flame underline-offset-4 hover:underline';

export default function Terms() {
  const { t, i18n } = useTranslation();

  usePageMeta({
    title: t('legal.terms.metaTitle'),
    description: t('legal.terms.metaDescription'),
  });

  const updatedAt = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${TERMS_UPDATED_AT}T12:00:00Z`));

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.18em]">
        {t('legal.terms.title')}
      </h1>
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-bone/50">
        {t('legal.updatedAt', { date: updatedAt })}
      </p>

      <p className="mt-6 text-sm leading-relaxed text-bone/80">
        {t('legal.terms.p1a')}
        <Link to="/privacidade" className={focusClasses}>
          {t('legal.terms.privacyLink')}
        </Link>
        {t('legal.terms.p1b')}
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.terms.s1title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">{t('legal.terms.s1p1')}</p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.terms.s2title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">{t('legal.terms.s2p1')}</p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.terms.s3title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        {t('legal.terms.s3p1a')}
        <Link to="/creditos" className={focusClasses}>
          {t('legal.terms.creditsLink')}
        </Link>
        {t('legal.terms.s3p1b')}
      </p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.terms.s4title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">{t('legal.terms.s4p1')}</p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.terms.s5title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">{t('legal.terms.s5p1')}</p>

      <h2 className="mt-8 font-display text-xl uppercase tracking-wide">
        {t('legal.terms.s6title')}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-bone/80">
        {t('legal.terms.s6p1a')}
        <a href="mailto:vroomfeedback@gmail.com" className={focusClasses}>
          vroomfeedback@gmail.com
        </a>
        {t('legal.terms.s6p1b')}
      </p>
    </main>
  );
}
