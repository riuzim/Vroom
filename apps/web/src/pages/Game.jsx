import { Link, useParams } from 'react-router-dom';
import { GAME_MODES, MAX_ATTEMPTS, buildShareText } from '@vroom/shared';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, CalendarX, LogIn, ServerCrash, SkipForward } from 'lucide-react';
import CarStage from '@/components/CarStage.jsx';
import GameInfo from '@/components/GameInfo.jsx';
import GuessInput from '@/components/GuessInput.jsx';
import ScorePanel from '@/components/ScorePanel.jsx';
import ShareButton from '@/components/ShareButton.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useVroomGame } from '@/hooks/useVroomGame.js';

// Nomes dos modos são marca própria do jogo — iguais em todos os idiomas.
const MODE_LABELS = {
  classic: 'Classic',
  hard: 'Hard',
  daily: 'Daily',
  silhouette: 'Silhouette',
  themed: 'Série',
};

export default function Game() {
  const { mode: rawMode } = useParams();
  const mode = GAME_MODES.includes(rawMode) ? rawMode : 'classic';
  const { t } = useTranslation();

  const game = useVroomGame(mode);

  // Share-grid sem spoiler. O streak é buscado fresco na hora do clique —
  // o cache de stats pode ainda não ter refetchado após o fim da rodada.
  const loadShareText = async () => {
    let streak;
    if (game.user) {
      try {
        const data = await api.get('/api/profile/stats');
        streak = data?.stats?.daily?.streak?.current;
      } catch {
        // Sem streak: a linha 🔥 simplesmente não entra no grid.
      }
    }
    const baseUrl = import.meta.env.BASE_URL ?? '/';
    const url = `${window.location.origin}${baseUrl}game/${mode}`;
    return buildShareText({
      mode,
      status: game.roundStatus,
      attemptsUsed: game.attemptsUsed,
      maxAttempts: MAX_ATTEMPTS,
      dailyNumber: game.dailyNum,
      streak,
      url,
    });
  };
  const canShare = game.isRoundOver && ['correct', 'failed', 'skipped'].includes(game.roundStatus);

  if (game.isError) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <ServerCrash className="size-12 text-flame" />
        <h1 className="font-display text-2xl uppercase tracking-[0.22em]">
          {t('game.serverDownTitle')}
        </h1>
        <p className="text-sm text-bone/60">{t('game.serverDownBody')}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t('game.reconnect')}
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[17rem,1fr,17rem] lg:px-8 lg:py-8">
      <div className="order-2 grid gap-6 lg:order-1 lg:content-center">
        <ScorePanel title={t('game.bestTitle')} scores={game.bestScores} variant="best" />
        {!game.user && (
          <Card className="border-flame">
            <CardContent className="gap-2 p-5 text-xs text-bone/60">
              <p className="font-bold text-bone/85">{t('game.guestTitle')}</p>
              <p className="mt-1">{t('game.guestBody')}</p>
              <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                <Link to="/login">
                  <LogIn className="size-4" />
                  {t('game.guestCta')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <section className="order-1 grid content-center gap-5 lg:order-2">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge variant="secondary">{MODE_LABELS[mode]}</Badge>
          {mode === 'hard' && <Badge variant="outline">{t('game.badge2x')}</Badge>}
          {mode === 'themed' && game.theme && (
            <Badge variant="outline">
              {t('game.themedBadge', { theme: t(`themes.${game.theme}`) })}
            </Badge>
          )}
        </div>

        {game.isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="aspect-[16/10] w-full" />
            <Skeleton className="h-12 w-full" />
          </>
        ) : game.dailyDone ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              {game.roundStatus === 'correct' ? (
                <CalendarCheck className="size-10 text-acid" />
              ) : (
                <CalendarX className="size-10 text-danger" />
              )}
              <p className="font-display text-lg uppercase tracking-[0.18em]">
                {t('game.dailyDoneTitle')}
              </p>
              <p className="text-sm text-bone/60">
                {game.roundStatus === 'correct'
                  ? game.user
                    ? t('game.dailyDoneCorrectUser', { name: game.carName, points: game.points })
                    : t('game.dailyDoneCorrectGuest', { name: game.carName })
                  : t('game.dailyDoneFailed', { name: game.carName })}
              </p>
              {canShare && <ShareButton loadText={loadShareText} />}
              <Button variant="outline" size="sm" asChild>
                <Link to="/game/classic">{t('game.playClassic')}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <GameInfo
              attemptsLeft={game.attemptsLeft}
              hint={game.hint}
              message={game.message}
              score={game.score}
              status={game.status}
            />

            <CarStage
              car={{ imageUrl: game.imageUrl }}
              blur={game.blur}
              isHardMode={game.isHardMode}
              status={game.status}
              label={MODE_LABELS[mode]}
              carName={game.carName}
              mode={mode}
              mistakes={game.attemptsUsed}
            />

            {game.carCredits && (
              <p className="text-center text-xs leading-relaxed text-bone/50">
                {t('game.creditsLine', {
                  brand: game.carCredits.brand,
                  model: game.carCredits.model,
                  years: game.carCredits.years,
                })}{' '}
                — {t('game.creditsPhoto')}{' '}
                <a
                  className="underline underline-offset-2 hover:text-bone/80"
                  href={game.carCredits.filePageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {game.carCredits.author}
                </a>
                , {game.carCredits.license}
              </p>
            )}

            <GuessInput
              disabled={game.isRoundOver || game.isGuessing || game.isSkipping}
              onSubmit={game.guess}
              hideSuggestions={mode === 'hard'}
            />

            {canShare && (
              <div className="flex justify-center">
                <ShareButton loadText={loadShareText} />
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={game.skip}
              disabled={game.isRoundOver || game.isGuessing || game.isSkipping}
            >
              <SkipForward className="size-4" />
              {t('game.skip')}
            </Button>
          </>
        )}
      </section>

      <div className="order-3 grid gap-6 lg:content-center">
        <ScorePanel title={t('game.recentTitle')} scores={game.recentScores} />
      </div>
    </main>
  );
}
