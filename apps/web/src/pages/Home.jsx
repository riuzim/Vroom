import { Link } from 'react-router-dom';
import { CalendarDays, Car, Eye, Lightbulb, Play, Timer, Trophy, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DitherCar from '@/components/DitherCar.jsx';

const modes = [
  {
    mode: 'classic',
    icon: Car,
    title: 'Classic',
    description: 'Imagem colorida que fica nítida a cada erro.',
  },
  {
    mode: 'hard',
    icon: Zap,
    title: 'Hard',
    description: 'Preto e branco, sem trapaça de cor. Pontos em dobro.',
    badge: '2x pontos',
  },
  {
    mode: 'daily',
    icon: CalendarDays,
    title: 'Daily',
    description: 'Um carro por dia para todo mundo. Uma rodada por dia — escolha bem.',
  },
];

const steps = [
  { icon: Eye, title: 'Olhe a silhueta', description: 'A imagem começa totalmente borrada.' },
  {
    icon: Lightbulb,
    title: 'Chute e ganhe dicas',
    description: 'Cada erro revela uma letra e mais nitidez.',
  },
  { icon: Timer, title: '5 tentativas', description: 'Acerte antes de zerar as tentativas.' },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <section className="mx-auto max-w-3xl text-center">
        <Badge variant="outline" className="mb-5">
          Jogo de adivinhar carros
        </Badge>
        <h1 className="font-display text-5xl uppercase tracking-[0.22em] text-bone sm:text-6xl">
          Vroom
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-bone/60 sm:text-lg">
          Uma imagem borrada. Um carro lendário. Você tem 5 chutes para provar que entende de
          carros.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/game/classic">
              <Play className="size-5" />
              Jogar Classic
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/leaderboard">
              <Trophy className="size-5" />
              Ver ranking
            </Link>
          </Button>
        </div>
        <DitherCar className="mx-auto mt-12 w-full max-w-lg text-bone" />
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map(({ icon: Icon, ...mode }) => (
          <Card
            key={mode.mode}
            className="transition-all duration-150 hover:border-flame hover:shadow-hard-lg"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="rounded-none border-2 border-bone bg-raised p-2.5 text-flame">
                  <Icon className="size-6" />
                </div>
                {mode.badge && <Badge variant="secondary">{mode.badge}</Badge>}
              </div>
              <CardTitle className="mt-4 text-lg">{mode.title}</CardTitle>
              <CardDescription>{mode.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to={`/game/${mode.mode}`}>Jogar {mode.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        {steps.map(({ icon: Icon, ...step }, index) => (
          <div
            key={step.title}
            className="rounded-none border-2 border-line bg-panel p-5 text-sm text-bone/55"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-black text-flame">0{index + 1}</span>
              <Icon className="size-5 shrink-0 text-flame" />
              <p className="font-black uppercase tracking-wide text-bone">{step.title}</p>
            </div>
            <p className="mt-2">{step.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
