import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LogIn, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { clearLocalScores } from '@/lib/localScores';
import SettingsModal from '@/components/SettingsModal.jsx';

const navItems = [
  { to: '/', label: 'Início' },
  { to: '/game/classic', label: 'Jogar' },
  { to: '/leaderboard', label: 'Ranking' },
];

function NavLinks({ onNavigate }) {
  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'rounded-full px-4 py-2 text-sm font-bold transition',
              isActive ? 'text-flame' : 'text-white/75 hover:text-flame'
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

export default function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="font-display text-2xl uppercase tracking-[0.22em] text-white transition hover:text-flame"
        >
          Vroom
        </Link>

        <div className="hidden md:block">
          <NavLinks />
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://discord.gg/JTDE5eMv"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-flame/60 hover:text-flame lg:inline-flex"
          >
            Discord
          </a>
          <a
            href="https://github.com/riuzim/Vroom"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-flame/60 hover:text-flame lg:inline-flex"
          >
            GitHub
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Abrir configurações"
          >
            <Settings className="size-5" />
          </Button>
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <Link to="/login">
              <LogIn className="size-4" />
              Entrar
            </Link>
          </Button>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Vroom</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-4">
                  <NavLinks />
                  <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                    <Button variant="outline" asChild>
                      <Link to="/login">
                        <LogIn className="size-4" />
                        Entrar
                      </Link>
                    </Button>
                    <a
                      href="https://discord.gg/JTDE5eMv"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white/80 transition hover:border-flame/60 hover:text-flame"
                    >
                      Discord
                    </a>
                    <a
                      href="https://github.com/riuzim/Vroom"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 px-4 py-2.5 text-center text-sm font-semibold text-white/80 transition hover:border-flame/60 hover:text-flame"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetScores={clearLocalScores}
      />
    </header>
  );
}
