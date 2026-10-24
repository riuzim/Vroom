import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Car,
  Eye,
  Ghost,
  Lightbulb,
  Play,
  Sparkles,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { themeOfDay } from '@vroom/shared';
import AdSlot from '@/components/AdSlot.jsx';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DitherCar from '@/components/DitherCar.jsx';
import { cn } from '@/lib/utils';

export default function Home() {
  const { t, i18n } = useTranslation();

  usePageMeta({
    title: t('home.metaTitle'),
    description: t('home.metaDescription'),
  });

  // Tema da Série do dia — mesma fórmula determinística do servidor.
  const today = new Date().toISOString().slice(0, 10);
  const todayTheme = themeOfDay(today);

  const modes = [
    {
      mode: 'classic',
      icon: Car,
      title: t('home.modes.classic.title'),
      description: t('home.modes.classic.description'),
      cta: t('home.modes.classic.cta'),
    },
    {
      mode: 'hard',
      icon: Zap,
      title: t('home.modes.hard.title'),
      description: t('home.modes.hard.description'),
      badge: t('home.modes.hard.badge'),
      cta: t('home.modes.hard.cta'),
    },
    {
      mode: 'daily',
      icon: CalendarDays,
      title: t('home.modes.daily.title'),
      description: t('home.modes.daily.description'),
      cta: t('home.modes.daily.cta'),
    },
    {
      mode: 'silhouette',
      icon: Ghost,
      title: t('home.modes.silhouette.title'),
      description: t('home.modes.silhouette.description'),
      cta: t('home.modes.silhouette.cta'),
    },
    {
      mode: 'themed',
      icon: Sparkles,
      title: t('home.modes.themed.title'),
      description: t('home.modes.themed.description'),
      badge: t(`themes.${todayTheme}`),
      cta: t('home.modes.themed.cta'),
    },
  ];

  const steps = [
    { icon: Eye, ...t('home.steps.look', { returnObjects: true }) },
    { icon: Lightbulb, ...t('home.steps.hints', { returnObjects: true }) },
    { icon: Timer, ...t('home.steps.attempts', { returnObjects: true }) },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-5xl font-semibold uppercase tracking-[0.18em] text-bone sm:text-6xl">
          Vroom
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-bone/60 sm:text-lg">
          {t('home.tagline')}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/game/classic">
              <Play className="size-5" />
              {t('home.playNow')}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/leaderboard">
              <Trophy className="size-5" />
              {t('nav.leaderboard')}
            </Link>
          </Button>
        </div>
        <DitherCar className="mx-auto mt-12 w-full max-w-lg text-bone" />
        <div
          aria-hidden="true"
          className="halftone mx-auto mt-5 h-14 w-full max-w-lg rounded-md opacity-60"
        />
      </section>

      <AdSlot className="mx-auto mt-14 max-w-3xl" slot="home-hero" minHeight={280} />

      <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map(({ icon: Icon, ...mode }) => (
          <Card key={mode.mode}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'rounded-md border border-bone/15 p-2.5',
                    mode.mode === 'hard' ? 'bg-bone text-ink' : 'bg-raised text-flame',
                  )}
                >
                  <Icon className="size-6" />
                </div>
                {mode.badge && <Badge variant="secondary">{mode.badge}</Badge>}
                {mode.mode === 'daily' && (
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-bone/60">
                    {new Date()
                      .toLocaleDateString(i18n.resolvedLanguage, { day: '2-digit', month: 'short' })
                      .replace('.', '')}
                  </span>
                )}
              </div>
              <CardTitle className="mt-4 text-lg">{mode.title}</CardTitle>
              <CardDescription>{mode.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to={`/game/${mode.mode}`}>{mode.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {steps.map(({ icon: Icon, ...step }, index) => (
          <div
            key={step.title}
            className="rounded-md border border-bone/10 bg-panel p-5 text-sm text-bone/55"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold leading-none text-flame">
                0{index + 1}
              </span>
              <Icon className="size-5 shrink-0 text-flame" />
              <p className="font-display font-semibold uppercase tracking-wide text-bone">
                {step.title}
              </p>
            </div>
            <p className="mt-2">{step.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
