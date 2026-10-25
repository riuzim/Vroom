import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';
import Header from '@/components/Header.jsx';
import CookieBanner from '@/components/CookieBanner.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import Home from '@/pages/Home.jsx';

const Game = lazy(() => import('@/pages/Game.jsx'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard.jsx'));
const Login = lazy(() => import('@/pages/Login.jsx'));
const Profile = lazy(() => import('@/pages/Profile.jsx'));
const Register = lazy(() => import('@/pages/Register.jsx'));
const Feedback = lazy(() => import('@/pages/Feedback.jsx'));
const Privacy = lazy(() => import('@/pages/Privacy.jsx'));
const Terms = lazy(() => import('@/pages/Terms.jsx'));
const Cookies = lazy(() => import('@/pages/Cookies.jsx'));
const Credits = lazy(() => import('@/pages/Credits.jsx'));

const footerLinkClasses =
  'transition hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none';

function PageFallback() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-16">
      <Skeleton className="h-48 w-full max-w-2xl" />
    </main>
  );
}

/** Rotas com boundary que reseta a cada navegação: um crash de render em
 *  uma página não pode deixar o app inteiro travado até um F5. */
function RoutedContent() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary key={pathname}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:mode" element={<Game />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/creditos" element={<Credits />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  const { t } = useTranslation();

  const legalLinks = [
    { to: '/privacidade', label: t('footer.privacy') },
    { to: '/termos', label: t('footer.terms') },
    { to: '/cookies', label: t('footer.cookies') },
    { to: '/creditos', label: t('footer.credits') },
  ];

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="grain relative flex min-h-screen flex-col bg-ink text-bone">
        <Header />
        <RoutedContent />
        <footer className="border-t border-bone/10">
          <div aria-hidden="true" className="checker h-1.5" />
          <div className="px-4 py-6 text-center text-xs font-medium text-bone/60">
            <p className="font-display font-semibold uppercase tracking-[0.18em]">
              {t('footer.tagline')}
            </p>
            <p className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <Link to="/feedback" className={footerLinkClasses}>
                {t('footer.feedback')}
              </Link>
              <span aria-hidden="true">·</span>
              <a
                href="https://github.com/riuzim/Vroom"
                target="_blank"
                rel="noreferrer"
                className={footerLinkClasses}
              >
                GitHub
              </a>
              {legalLinks.map((link) => (
                <span key={link.to} className="flex items-center gap-3">
                  <span aria-hidden="true">·</span>
                  <Link to={link.to} className={footerLinkClasses}>
                    {link.label}
                  </Link>
                </span>
              ))}
            </p>
          </div>
        </footer>
        <CookieBanner />
      </div>
    </BrowserRouter>
  );
}
