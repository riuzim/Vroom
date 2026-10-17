import { Link, useParams } from 'react-router-dom';
import { GAME_MODES } from '@vroom/shared';
import { CalendarCheck, LogIn, ServerCrash, SkipForward } from 'lucide-react';
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
  classic: { label: 'Classic', description: 'Imagem colorida com blur progressivo.' },
  hard: { label: 'Hard', description: 'Imagem em preto e branco.', badge: '2x pontos' },
  daily: { label: 'Daily', description: 'Um carro por dia para todo mundo — uma rodada por dia.' },
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
        <p className="text-sm text-white/60">
          Não foi possível falar com o servidor do Vroom. Verifique se a API está rodando
          (<code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">pnpm dev</code>) e tente de novo.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>Tentar reconectar</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[17rem,1fr,17rem] lg:px-8 lg:py-8">
      <div className="order-2 grid gap-6 lg:order-1 lg:content-center">
        <ScorePanel title="Best Score" scores={game.bestScores} variant="best" />
        {!game.user && (
          <Card className="border-flame/25">
            <CardContent className="gap-2 p-5 text-xs text-white/60">
              <p className="font-bold text-white/85">Jogando como visitante</p>
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
              <CalendarCheck className="size-10 text-mint" />
              <p className="font-display text-lg uppercase tracking-[0.18em]">Desafio diário concluído</p>
              <p className="text-sm text-white/60">
                {game.status === 'correct'
                  ? `Você acertou o carro de hoje (${game.carName}) e garantiu ${game.points} pontos.`
                  : `O carro de hoje era ${game.carName}.`}
              </p>
              <p className="text-sm font-bold text-flame">Volte amanhã para um novo desafio!</p>
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
            />

            <GuessInput
              disabled={game.isRoundOver || game.isGuessing}
              onSubmit={game.guess}
            />

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={game.skip}
                disabled={game.isRoundOver || game.isSkipping}
              >
                <SkipForward className="size-4" />
                Pular carro
              </Button>
            </div>
          </>
        )}
      </section>

      <div className="order-3 grid gap-6 lg:content-center">
        <ScorePanel title="Last Score" scores={game.recentScores} />
        <div className="rounded-lg border border-white/10 bg-panel p-5 text-sm text-white/55">
          <p className="font-bold text-white/80">Modo atual</p>
          <p className="mt-1">{info.description}</p>
        </div>
      </div>
    </main>
  );
}
