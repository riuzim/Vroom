import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const MODE_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'classic', label: 'Classic' },
  { value: 'hard', label: 'Hard' },
  { value: 'daily', label: 'Daily' },
];

export default function Leaderboard() {
  const [period, setPeriod] = useState('all');
  const [mode, setMode] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', period, mode],
    queryFn: () => api.get(`/api/leaderboard?period=${period}&mode=${mode}`),
  });

  const entries = data?.entries ?? [];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="rounded-none border-2 border-bone bg-raised p-3 text-flame">
          <Trophy className="size-7" />
        </div>
        <h1 className="font-display text-3xl uppercase tracking-[0.22em]">Ranking global</h1>
        <Badge variant="outline">Pontos de quem joga com conta</Badge>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" value={period} onValueChange={setPeriod}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all">Geral</TabsTrigger>
                <TabsTrigger value="today">Hoje</TabsTrigger>
              </TabsList>
              <div className="flex gap-1.5">
                {MODE_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setMode(filter.value)}
                    className={cn(
                      'rounded-none border-2 px-3 py-1.5 text-xs font-black uppercase tracking-wide transition',
                      mode === filter.value
                        ? 'border-bone bg-flame text-ink'
                        : 'border-line text-bone/60 hover:border-bone hover:text-bone',
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
              ) : entries.length === 0 ? (
                <p className="py-8 text-center text-sm text-bone/55">
                  Ninguém pontuou aqui ainda. Que tal ser o primeiro?
                </p>
              ) : (
                <ol className="space-y-2">
                  {entries.map((entry) => (
                    <li
                      key={`${entry.position}-${entry.username}`}
                      className={cn(
                        'flex items-center justify-between rounded-none border-2 px-4 py-3',
                        entry.position <= 3
                          ? 'border-bone bg-bone text-ink'
                          : 'border-line bg-raised text-bone/80',
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3 font-black">
                        {entry.position <= 3 ? (
                          <span className="font-mono text-xs">0{entry.position}</span>
                        ) : null}
                        <span className="truncate">{entry.username}</span>
                      </span>
                      <span className="flex items-center gap-4">
                        <span className="text-xs font-bold">
                          {entry.rounds} rodada{entry.rounds === 1 ? '' : 's'}
                        </span>
                        <span className="font-mono text-lg font-black">{entry.points}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
