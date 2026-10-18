import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, LogIn, LogOut, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLogout, useMe } from '@/hooks/useAuth';
import { useLocalScores } from '@/lib/localScores';

export default function Profile() {
  const { data, isLoading, isError, refetch } = useMe();
  const logout = useLogout();
  const scores = useLocalScores();

  const user = data?.user ?? null;
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/api/profile/stats'),
    enabled: !!user,
  });

  const stats = statsData?.stats ?? null;
  const roundsPlayed = scores.length;
  const bestStreak = scores.reduce((max, score) => Math.max(max, score), 0);

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => toast.success('Boxes fechados. Até a próxima!'),
    });
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl uppercase tracking-[0.22em]">Perfil</h1>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="grid gap-3 p-10">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <p className="text-sm text-bone/55">
              Não foi possível carregar seu perfil. Verifique sua conexão.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : user ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <Avatar className="size-16">
                <AvatarFallback className="text-xl">{user.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-display text-xl uppercase tracking-[0.18em]">{user.username}</p>
                <p className="text-sm text-bone/55">{user.email}</p>
                {user.createdAt && (
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-bone/60 sm:justify-start">
                    <CalendarDays className="size-3.5" />
                    Pilotando desde{' '}
                    {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={handleLogout} disabled={logout.isPending}>
                <LogOut className="size-4" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Badge variant="outline" className="mb-3">
              Visitante
            </Badge>
            <p className="text-sm font-semibold text-bone/70">
              Crie uma conta para salvar seu progresso no servidor e disputar o ranking global.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/register">
                  <UserPlus className="size-4" />
                  Criar conta
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login">
                  <LogIn className="size-4" />
                  Entrar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {user && statsError ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Ranking</CardTitle>
            <CardDescription>Seus pontos registrados no servidor.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-bone/55">
              Não foi possível carregar suas estatísticas. Verifique sua conexão.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetchStats()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : user && statsLoading ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Ranking</CardTitle>
            <CardDescription>Seus pontos registrados no servidor.</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : stats ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Ranking</CardTitle>
            <CardDescription>Seus pontos registrados no servidor.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-none border-2 border-line bg-raised p-4 text-center">
                <p className="text-xs font-black uppercase tracking-wide text-bone/55">Pontos</p>
                <p className="mt-1 font-mono text-2xl font-black text-flame">{stats.totalPoints}</p>
              </div>
              <div className="rounded-none border-2 border-line bg-raised p-4 text-center">
                <p className="text-xs font-black uppercase tracking-wide text-bone/55">Rodadas</p>
                <p className="mt-1 font-mono text-2xl font-black">{stats.roundsPlayed}</p>
              </div>
              <div className="rounded-none border-2 border-line bg-raised p-4 text-center">
                <p className="text-xs font-black uppercase tracking-wide text-bone/55">
                  Melhor rodada (pontos)
                </p>
                <p className="mt-1 font-mono text-2xl font-black text-acid">{stats.bestRound}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Suas estatísticas locais</CardTitle>
            <CardDescription>Suas sequências encerradas neste navegador.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-none border-2 border-line bg-raised p-4 text-center">
                <p className="text-xs font-black uppercase tracking-wide text-bone/55">Rodadas</p>
                <p className="mt-1 font-mono text-3xl font-black">{roundsPlayed}</p>
              </div>
              <div className="rounded-none border-2 border-line bg-raised p-4 text-center">
                <p className="text-xs font-black uppercase tracking-wide text-bone/55">
                  Maior sequência (acertos seguidos)
                </p>
                <p className="mt-1 font-mono text-3xl font-black text-flame">{bestStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
