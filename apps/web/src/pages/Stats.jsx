import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Stats() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => api.get('/api/public/stats'),
  });

  const byMode = data?.byMode ?? {};

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.18em] mb-6">
        {t('stats.title') ?? 'Estatísticas Públicas'}
      </h1>
      <p className="text-bone/70 mb-8">
        {t('stats.subtitle') ?? 'Dados agregados de todos os jogadores.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(byMode).map(([mode, s]) => (
          <Card key={mode} className="bg-raised border-bone/10">
            <CardHeader>
              <CardTitle className="capitalize">{mode}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-bone/60">Rodadas</span>
                <span className="font-mono">{s.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone/60">Vitórias</span>
                <span className="font-mono">{s.wins} ({s.winRate}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bone/60">Média de tentativas</span>
                <span className="font-mono">{s.avgAttempts}</span>
              </div>
              <div className="pt-2">
                <p className="text-xs uppercase tracking-wide text-bone/50 mb-1">Distribuição</p>
                <div className="flex gap-1">
                  {s.distribution.map((count, i) => (
                    <div key={i} className="flex-1 text-center">
                      <div className="h-10 bg-bone/10 rounded flex items-end justify-center">
                        <div
                          className="w-full bg-acid/60 rounded"
                          style={{ height: `${Math.min(100, (count / Math.max(...s.distribution,1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-bone/50">{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
