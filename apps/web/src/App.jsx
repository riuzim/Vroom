import { useState } from 'react';
import CarStage from './components/CarStage.jsx';
import GameInfo from './components/GameInfo.jsx';
import GuessInput from './components/GuessInput.jsx';
import Header from './components/Header.jsx';
import ScorePanel from './components/ScorePanel.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { useVroomGame } from './hooks/useVroomGame.js';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const game = useVroomGame();

  return (
    <div className="min-h-screen bg-ink text-white">
      <Header
        isHardMode={game.isHardMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleHardMode={game.toggleHardMode}
      />

      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[17rem,1fr,17rem] lg:px-8 lg:py-8">
        <div className="order-2 grid gap-6 lg:order-1 lg:content-center">
          <ScorePanel title="Best Score" scores={game.bestScores} variant="best" />
        </div>

        <section className="order-1 grid content-center gap-5 lg:order-2">
          <GameInfo
            attemptsLeft={game.attemptsLeft}
            hint={game.hint}
            message={game.message}
            score={game.score}
            status={game.status}
          />
          <CarStage
            car={game.currentCar}
            blur={game.blur}
            isHardMode={game.isHardMode}
            status={game.status}
          />
          <GuessInput disabled={game.status === 'correct'} onSubmit={game.submitGuess} />
        </section>

        <div className="order-3 grid gap-6 lg:content-center">
          <ScorePanel title="Last Score" scores={game.recentScores} />
          <div className="rounded-lg border border-white/10 bg-panel p-5 text-sm text-white/55">
            <p className="font-bold text-white/80">Modo atual</p>
            <p className="mt-1">{game.isHardMode ? 'Imagem em preto e branco.' : 'Imagem colorida com blur progressivo.'}</p>
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetScores={game.resetScores}
      />
    </div>
  );
}
