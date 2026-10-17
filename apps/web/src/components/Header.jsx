import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LogIn, LogOut, Menu, Settings } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useLogout, useMe } from '@/hooks/useAuth';
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
              'rounded-none px-4 py-2 text-sm font-black uppercase transition',
              isActive ? 'bg-flame text-ink' : 'text-bone/70 hover:bg-bone/10 hover:text-bone',
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
  const { data } = useMe();
  const logout = useLogout();
  const user = data?.user ?? null;

  return (
    <header className="sticky top-0 z-40 border-b-2 border-bone bg-ink">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="font-display text-2xl uppercase tracking-[0.22em] text-bone transition hover:text-flame"
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
            className="hidden rounded-none border-2 border-bone px-4 py-2 text-sm font-bold text-bone transition hover:bg-bone hover:text-ink lg:inline-flex"
          >
            Discord
          </a>
          <a
            href="https://github.com/riuzim/Vroom"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-none border-2 border-bone px-4 py-2 text-sm font-bold text-bone transition hover:bg-bone hover:text-ink lg:inline-flex"
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
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="gap-2 px-2">
                <Link to="/profile" aria-label="Ver perfil">
                  <Avatar className="size-7 border-none">
                    <AvatarFallback className="text-xs">{user.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-24 truncate font-bold normal-case tracking-normal text-bone/85 sm:inline">
                    {user.username}
                  </span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sair"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <LogOut className="size-5" />
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/login">
                <LogIn className="size-4" />
                Entrar
              </Link>
            </Button>
          )}
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
                  <div className="flex flex-col gap-2 border-t-2 border-bone pt-4">
                    {user ? (
                      <>
                        <Button variant="secondary" asChild>
                          <Link to="/profile">
                            <Avatar className="size-6 border-none">
                              <AvatarFallback className="text-xs">
                                {user.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {user.username}
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => logout.mutate()}
                          disabled={logout.isPending}
                        >
                          <LogOut className="size-4" />
                          Sair
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" asChild>
                        <Link to="/login">
                          <LogIn className="size-4" />
                          Entrar
                        </Link>
                      </Button>
                    )}
                    <a
                      href="https://discord.gg/JTDE5eMv"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-none border-2 border-bone px-4 py-2.5 text-center text-sm font-bold text-bone transition hover:bg-bone hover:text-ink"
                    >
                      Discord
                    </a>
                    <a
                      href="https://github.com/riuzim/Vroom"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-none border-2 border-bone px-4 py-2.5 text-center text-sm font-bold text-bone transition hover:bg-bone hover:text-ink"
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
