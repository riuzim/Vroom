import { Link } from 'react-router-dom';
import { CalendarDays, LogIn, LogOut, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogout, useMe } from '@/hooks/useAuth';
import { useLocalScores } from '@/lib/localScores';

export default function Profile() {
  const { data, isLoading } = useMe();
  const logout = useLogout();
  const scores = useLocalScores();

  const user = data?.user ?? null;
  const roundsPlayed = scores.length;
  const bestStreak = scores.reduce((max, score) => Math.max(max, score), 0);

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => toast.success('Sessão encerrada. Até logo!'),
    });
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl uppercase tracking-[0.22em]">Perfil</h1>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-white/45">Carregando...</CardContent>
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
                <p className="text-sm text-white/55">{user.email}</p>
                {user.createdAt && (
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-white/40 sm:justify-start">
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
            <p className="text-sm font-semibold text-white/70">
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Suas estatísticas locais</CardTitle>
          <CardDescription>Rodadas encerradas neste navegador.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white/[0.04] p-4 text-center">
              <p className="text-xs font-black uppercase tracking-wide text-white/45">Rodadas</p>
              <p className="mt-1 font-mono text-3xl font-black">{roundsPlayed}</p>
            </div>
            <div className="rounded-lg bg-white/[0.04] p-4 text-center">
              <p className="text-xs font-black uppercase tracking-wide text-white/45">Melhor streak</p>
              <p className="mt-1 font-mono text-3xl font-black text-flame">{bestStreak}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
