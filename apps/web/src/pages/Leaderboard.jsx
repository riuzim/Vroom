import { Medal, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalScores } from '@/lib/localScores';
import { cn } from '@/lib/utils';

const medalClasses = ['text-flame', 'text-white/70', 'text-mint'];

function ScoreList({ scores, emptyLabel }) {
  if (scores.length === 0) {
    return <p className="py-8 text-center text-sm text-white/45">{emptyLabel}</p>;
  }

  return (
    <ol className="space-y-2">
      {scores.map((score, index) => (
        <li
          key={`${score}-${index}`}
          className="flex items-center justify-between rounded-md bg-white/[0.04] px-4 py-3"
        >
          <span className="flex items-center gap-3 font-bold text-white/55">
            {index < 3 ? <Medal className={cn('size-5', medalClasses[index])} /> : null}
            {index + 1}º
          </span>
          <span className="font-mono text-lg font-black text-white">{score}</span>
        </li>
      ))}
    </ol>
  );
}

export default function Leaderboard() {
  const scores = useLocalScores();
  const best = [...new Set(scores)].sort((a, b) => b - a).slice(0, 10);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-panelSoft p-3 text-flame">
          <Trophy className="size-7" />
        </div>
        <h1 className="font-display text-3xl uppercase tracking-[0.22em]">Ranking</h1>
        <Badge variant="outline">Scores locais · ranking global chega com o backend</Badge>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                Melhores
              </TabsTrigger>
              <TabsTrigger value="today" className="flex-1">
                Hoje
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ScoreList scores={best} emptyLabel="Ainda sem scores. Jogue uma rodada!" />
            </TabsContent>
            <TabsContent value="today">
              <p className="py-8 text-center text-sm text-white/45">
                O ranking diário global chega com o backend do jogo — aguarde as próximas fases.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
