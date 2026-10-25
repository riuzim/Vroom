import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdSlot from '@/components/AdSlot.jsx';
import { usePageMeta } from '@/hooks/usePageMeta';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function Leaderboard() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('all');
  const [mode, setMode] = useState('all');

  usePageMeta({
    title: t('leaderboard.metaTitle'),
    description: t('leaderboard.metaDescription'),
  });

  const MODE_FILTERS = [
    { value: 'all', label: t('leaderboard.modes.all') },
    { value: 'classic', label: 'Classic' },
    { value: 'hard', label: 'Hard' },
    { value: 'daily', label: 'Daily' },
  ];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leaderboard', period, mode],
    queryFn: () => api.get(`/api/leaderboard?period=${period}&mode=${mode}`),
  });

  const entries = data?.entries ?? [];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="rounded-md border border-bone/15 bg-raised p-3 text-flame">
          <Trophy className="size-7" />
        </div>
        <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.18em]">
          {t('leaderboard.title')}
        </h1>
        <Badge variant="outline">{t('leaderboard.badge')}</Badge>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" value={period} onValueChange={setPeriod}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all">{t('leaderboard.allTime')}</TabsTrigger>
                <TabsTrigger value="today">{t('leaderboard.today')}</TabsTrigger>
              </TabsList>
              <div className="flex flex-wrap gap-1.5">
                {MODE_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    aria-pressed={mode === filter.value}
                    onClick={() => setMode(filter.value)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
                      mode === filter.value
                        ? 'border-transparent bg-flame text-ink shadow-hard-sm'
                        : 'border-bone/20 text-bone/60 hover:border-flame hover:text-flame',
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <TabsContent value={period} className="mt-6">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <p className="text-sm text-bone/55">{t('leaderboard.error')}</p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="rounded-md border border-bone/25 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wide transition hover:border-flame hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                  >
                    {t('common.retry')}
                  </button>
                </div>
              ) : entries.length === 0 ? (
                <p className="py-8 text-center text-sm text-bone/55">{t('leaderboard.empty')}</p>
              ) : (
                <ol className="space-y-2">
                  {entries.map((entry) => (
                    <li
                      key={`${entry.position}-${entry.username}`}
                      className={cn(
                        'flex items-center justify-between rounded-md border px-4 py-3',
                        entry.position <= 3
                          ? 'border-flame/60 bg-raised text-bone'
                          : 'border-bone/10 bg-raised text-bone/80',
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3 font-bold">
                        {entry.position <= 3 ? (
                          <span className="font-mono text-xs text-flame">0{entry.position}</span>
                        ) : null}
                        <span className="truncate">{entry.username}</span>
                      </span>
                      <span className="flex items-center gap-4">
                        <span className="text-xs font-semibold">
                          {t('leaderboard.rounds', { count: entry.rounds })}
                        </span>
                        <span className="font-mono text-lg font-bold tabular-nums">
                          {entry.points}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AdSlot className="mt-6" slot="leaderboard-footer" minHeight={280} />
    </main>
  );
}
