import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalScores } from '@/lib/localScores';

export default function Profile() {
  const scores = useLocalScores();
  const roundsPlayed = scores.length;
  const bestStreak = scores.reduce((max, score) => Math.max(max, score), 0);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl uppercase tracking-[0.22em]">Perfil</h1>
      </div>

      <Card>
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

      <Card className="mt-6">
        <CardContent className="p-6 text-center">
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
    </main>
  );
}
