import { MAX_ATTEMPTS } from '@vroom/shared';
import { useTranslation } from 'react-i18next';

export default function GameInfo({ attemptsLeft, hint, message, score, status }) {
  const { t } = useTranslation();
  const statusClass =
    status === 'wrong'
      ? 'border-2 border-danger bg-panel text-danger'
      : status === 'correct'
        ? 'border-2 border-acid bg-panel text-acid'
        : status === 'failed'
          ? 'border-2 border-danger bg-panel text-danger'
          : status === 'skipped'
            ? 'border-2 border-flame bg-panel text-flame'
            : 'border-2 border-line bg-panel text-bone/60';

  return (
    <div className="grid gap-3 sm:grid-cols-[auto,1fr]">
      <div className="rounded-none border-2 border-bone bg-flame px-5 py-4 text-center text-ink shadow-hard">
        <p className="text-xs font-black uppercase tracking-wide">{t('game.streak')}</p>
        <p className="font-mono text-3xl font-black">{score}</p>
      </div>
      <div className={`rounded-none px-5 py-4 ${statusClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold">{t('game.attempts', { count: attemptsLeft })}</p>
            <div className="flex gap-1" aria-hidden="true">
              {Array.from({ length: MAX_ATTEMPTS }, (_, index) => (
                <span
                  key={index}
                  className={`size-2.5 rounded-none ${index < attemptsLeft ? 'bg-current' : 'bg-line'}`}
                />
              ))}
            </div>
          </div>
          <p className="font-mono text-sm tracking-[0.18em] text-bone">{hint}</p>
        </div>
        <p className="mt-2 min-h-5 text-sm font-semibold">{message}</p>
      </div>
    </div>
  );
}
