import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, Menu, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useLogout, useMe } from '@/hooks/useAuth';
import { clearLocalScores } from '@/lib/localScores';
import { apiErrorMessage } from '@/lib/api';
import SettingsModal from '@/components/SettingsModal.jsx';

function NavLinks({ onNavigate }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navItems = [
    { to: '/', label: t('nav.home') },
    { to: '/game/classic', label: t('nav.play') },
    { to: '/leaderboard', label: t('nav.leaderboard') },
  ];

  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
      {navItems.map((item) => {
        const isActive =
          item.to === '/'
            ? location.pathname === '/'
            : item.to === '/game/classic'
              ? location.pathname.startsWith('/game')
              : location.pathname.startsWith(item.to);

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              'rounded-none px-4 py-2 text-sm font-black uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
              isActive ? 'bg-flame text-ink' : 'text-bone/70 hover:bg-bone/10 hover:text-bone',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data } = useMe();
  const logout = useLogout();
  const user = data?.user ?? null;

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => toast.success(t('auth.loggedOut')),
      onError: (error) => toast.error(apiErrorMessage(t, error)),
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-bone bg-ink">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="font-display text-2xl uppercase tracking-[0.22em] text-bone transition-[color,letter-spacing] duration-200 hover:text-flame hover:tracking-[0.3em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        >
          Vroom
        </Link>

        <div className="hidden md:block">
          <NavLinks />
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/riuzim/Vroom"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-none border-2 border-bone px-4 py-2 text-sm font-bold text-bone transition hover:border-flame hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none lg:inline-flex"
          >
            GitHub
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            aria-label={t('nav.openSettings')}
          >
            <Settings className="size-5" />
          </Button>
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="gap-2 px-2">
                <Link to="/profile" aria-label={t('nav.viewProfile')}>
                  <Avatar className="size-7 border-none">
                    <AvatarFallback className="text-xs">{user.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-24 truncate font-bold normal-case tracking-normal sm:inline">
                    {user.username}
                  </span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('nav.logout')}
                onClick={handleLogout}
                disabled={logout.isPending}
              >
                <LogOut className="size-5" />
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/login">
                <LogIn className="size-4" />
                {t('nav.login')}
              </Link>
            </Button>
          )}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('nav.openMenu')}>
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
                          onClick={handleLogout}
                          disabled={logout.isPending}
                        >
                          <LogOut className="size-4" />
                          {t('nav.logout')}
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" asChild>
                        <Link to="/login">
                          <LogIn className="size-4" />
                          {t('nav.login')}
                        </Link>
                      </Button>
                    )}
                    <a
                      href="https://github.com/riuzim/Vroom"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-none border-2 border-bone px-4 py-2.5 text-center text-sm font-bold text-bone transition hover:border-flame hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
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
