import { useParams } from 'react-router-dom';
import { GAME_MODES } from '@vroom/shared';
import { SkipForward } from 'lucide-react';
import CarStage from '@/components/CarStage.jsx';
import GameInfo from '@/components/GameInfo.jsx';
import GuessInput from '@/components/GuessInput.jsx';
import ScorePanel from '@/components/ScorePanel.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVroomGame } from '@/hooks/useVroomGame.js';

const MODE_INFO = {
  classic: { label: 'Classic', description: 'Imagem colorida com blur progressivo.' },
  hard: { label: 'Hard', description: 'Imagem em preto e branco.', badge: '2x pontos' },
  daily: {
    label: 'Daily',
    description: 'Desafio único por dia — integração com o servidor nas próximas fases.',
    badge: 'Em breve',
  },
};

export default function Game() {
  const { mode: rawMode } = useParams();
  const mode = GAME_MODES.includes(rawMode) ? rawMode : 'classic';
  const info = MODE_INFO[mode];

  const game = useVroomGame(mode);

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[17rem,1fr,17rem] lg:px-8 lg:py-8">
      <div className="order-2 grid gap-6 lg:order-1 lg:content-center">
        <ScorePanel title="Best Score" scores={game.bestScores} variant="best" />
      </div>

      <section className="order-1 grid content-center gap-5 lg:order-2">
        <div className="flex items-center justify-center gap-3">
          <Badge variant="secondary">{info.label}</Badge>
          {info.badge && <Badge variant="outline">{info.badge}</Badge>}
        </div>

        <GameInfo
          attemptsLeft={game.attemptsLeft}
          hint={game.hint}
          message={game.message}
          score={game.score}
          status={game.status}
        />

        <CarStage car={game.currentCar} blur={game.blur} isHardMode={game.isHardMode} status={game.status} />

        <GuessInput disabled={game.isRoundOver} onSubmit={game.submitGuess} />

        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={game.skip} disabled={game.isRoundOver}>
            <SkipForward className="size-4" />
            Pular carro
          </Button>
        </div>
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
