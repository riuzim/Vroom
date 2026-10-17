import { Medal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const medalClasses = [
  'text-flame',
  'text-white/70',
  'text-mint',
];

export default function ScorePanel({ title, scores, emptyLabel = 'Ainda sem scores', variant = 'default' }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-sm font-black uppercase tracking-wide text-flame">{title}</h2>
        <ol className="mt-4 space-y-3">
          {scores.length === 0 && <li className="text-sm text-white/45">{emptyLabel}</li>}
          {scores.map((score, index) => (
            <li
              key={`${score}-${index}`}
              className="flex items-center justify-between rounded-md bg-white/[0.04] px-3 py-2 text-sm text-white/80"
            >
              <span className="flex items-center gap-2 font-bold text-white/55">
                {variant === 'best' ? (
                  <>
                    {index < 3 ? (
                      <Medal className={cn('size-4', medalClasses[index])} />
                    ) : null}
                    {index + 1}º
                  </>
                ) : (
                  `#${index + 1}`
                )}
              </span>
              <span className="font-mono font-black text-white">{score}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
