import { Link, useParams } from 'react-router-dom';
import { GAME_MODES } from '@vroom/shared';
import { CalendarCheck, CalendarX, LogIn, ServerCrash, SkipForward } from 'lucide-react';
import CarStage from '@/components/CarStage.jsx';
import GameInfo from '@/components/GameInfo.jsx';
import GuessInput from '@/components/GuessInput.jsx';
import ScorePanel from '@/components/ScorePanel.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useVroomGame } from '@/hooks/useVroomGame.js';

const MODE_INFO = {
  classic: { label: 'Classic' },
  hard: { label: 'Hard', badge: '2x pontos' },
  daily: { label: 'Daily' },
};

export default function Game() {
  const { mode: rawMode } = useParams();
  const mode = GAME_MODES.includes(rawMode) ? rawMode : 'classic';
  const info = MODE_INFO[mode];

  const game = useVroomGame(mode);

  if (game.isError) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <ServerCrash className="size-12 text-flame" />
        <h1 className="font-display text-2xl uppercase tracking-[0.22em]">Servidor offline</h1>
        <p className="text-sm text-bone/60">Verifique sua conexão e tente de novo.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Tentar reconectar
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[17rem,1fr,17rem] lg:px-8 lg:py-8">
      <div className="order-2 grid gap-6 lg:order-1 lg:content-center">
        <ScorePanel title="Melhor sequência" scores={game.bestScores} variant="best" />
        {!game.user && (
          <Card className="border-flame">
            <CardContent className="gap-2 p-5 text-xs text-bone/60">
              <p className="font-bold text-bone/85">Jogando de convidado</p>
              <p className="mt-1">Os pontos não contam para o ranking global.</p>
              <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                <Link to="/login">
                  <LogIn className="size-4" />
                  Entrar e pontuar
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <section className="order-1 grid content-center gap-5 lg:order-2">
        <div className="flex items-center justify-center gap-3">
          <Badge variant="secondary">{info.label}</Badge>
          {info.badge && <Badge variant="outline">{info.badge}</Badge>}
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
                Desafio de hoje concluído
              </p>
              <p className="text-sm text-bone/60">
                {game.roundStatus === 'correct'
                  ? game.user
                    ? `Você acertou: ${game.carName} · +${game.points} pontos no ranking.`
                    : `Você acertou: ${game.carName}. Entre para pontuar no ranking.`
                  : `O carro de hoje era ${game.carName}.`}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/game/classic">Jogar Classic</Link>
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
              label={info.label}
              carName={game.carName}
            />

            {game.carCredits && (
              <p className="text-center text-xs leading-relaxed text-bone/50">
                {game.carCredits.brand} {game.carCredits.model} ({game.carCredits.years}) — foto:{' '}
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

            <Button
              variant="ghost"
              size="sm"
              onClick={game.skip}
              disabled={game.isRoundOver || game.isGuessing || game.isSkipping}
            >
              <SkipForward className="size-4" />
              Pular carro
            </Button>
          </>
        )}
      </section>

      <div className="order-3 grid gap-6 lg:content-center">
        <ScorePanel title="Últimas sequências" scores={game.recentScores} />
      </div>
    </main>
  );
}
