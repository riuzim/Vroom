import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function ScorePanel({ title, scores, emptyLabel, variant = 'default' }) {
  const { t, i18n } = useTranslation();
  const emptyText = emptyLabel ?? t('game.scoresEmpty');
  const showOrdinal = !i18n.resolvedLanguage?.startsWith('en');

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-flame">
          {title}
        </h2>
        <ol className="mt-4 space-y-3">
          {scores.length === 0 && <li className="text-sm text-bone/55">{emptyText}</li>}
          {scores.map((score, index) => {
            const isTop = variant === 'best' && index < 3;
            return (
              <li
                key={`${score}-${index}`}
                className={cn(
                  'flex items-center justify-between rounded-md border px-3 py-2 text-sm',
                  isTop
                    ? 'border-flame/60 bg-raised text-bone'
                    : 'border-bone/10 bg-raised text-bone/80',
                )}
              >
                <span className="flex items-center gap-2 font-bold">
                  {variant === 'best' ? (
                    <>
                      {isTop && <span className="font-mono text-xs text-flame">0{index + 1}</span>}
                      {index + 1}
                      {showOrdinal && 'º'}
                    </>
                  ) : (
                    `#${index + 1}`
                  )}
                </span>
                <span className="font-mono font-bold tabular-nums">{score}</span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
