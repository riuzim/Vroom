import { MAX_ATTEMPTS } from '@vroom/shared';
import { useTranslation } from 'react-i18next';

export default function GameInfo({ attemptsLeft, hint, message, score, status }) {
  const { t } = useTranslation();
  const statusClass =
    status === 'wrong'
      ? 'border-danger/60 bg-panel text-danger'
      : status === 'correct'
        ? 'border-acid/60 bg-panel text-acid'
        : status === 'failed'
          ? 'border-danger/60 bg-panel text-danger'
          : status === 'skipped'
            ? 'border-flame/60 bg-panel text-flame'
            : 'border-bone/10 bg-panel text-bone/60';

  return (
    <div className="grid gap-3 sm:grid-cols-[auto,1fr]">
      <div className="rounded-md bg-flame px-5 py-4 text-center text-ink shadow-hard">
        <p className="font-display text-xs font-semibold uppercase tracking-widest">
          {t('game.streak')}
        </p>
        <p className="font-mono text-3xl font-bold tabular-nums">{score}</p>
      </div>
      <div className={`rounded-md border px-5 py-4 ${statusClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{t('game.attempts', { count: attemptsLeft })}</p>
            {/* Cluster de luzes: cada chute é uma lâmpada que queima */}
            <div className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: MAX_ATTEMPTS }, (_, index) => (
                <span
                  key={index}
                  className={`size-2.5 rounded-full transition-colors ${
                    index < attemptsLeft ? 'bg-current' : 'bg-bone/15'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="font-mono text-sm font-semibold tabular-nums tracking-[0.18em] text-bone">
            {hint}
          </p>
        </div>
        <p className="mt-2 min-h-5 text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}
