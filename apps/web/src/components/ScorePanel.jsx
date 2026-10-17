import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function ScorePanel({
  title,
  scores,
  emptyLabel = 'Ainda sem scores',
  variant = 'default',
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-sm font-black uppercase tracking-wide text-flame">{title}</h2>
        <ol className="mt-4 space-y-3">
          {scores.length === 0 && <li className="text-sm text-bone/55">{emptyLabel}</li>}
          {scores.map((score, index) => {
            const isTop = variant === 'best' && index < 3;
            return (
              <li
                key={`${score}-${index}`}
                className={cn(
                  'flex items-center justify-between rounded-none border-2 px-3 py-2 text-sm',
                  isTop ? 'border-bone bg-bone text-ink' : 'border-line bg-raised text-bone/80',
                )}
              >
                <span className="flex items-center gap-2 font-black">
                  {variant === 'best' ? (
                    <>
                      {isTop && <span className="font-mono text-xs">0{index + 1}</span>}
                      {index + 1}º
                    </>
                  ) : (
                    `#${index + 1}`
                  )}
                </span>
                <span className="font-mono font-black">{score}</span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
