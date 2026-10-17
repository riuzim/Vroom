import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';
import Header from '@/components/Header.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import Home from '@/pages/Home.jsx';

const Game = lazy(() => import('@/pages/Game.jsx'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard.jsx'));
const Login = lazy(() => import('@/pages/Login.jsx'));
const Profile = lazy(() => import('@/pages/Profile.jsx'));
const Register = lazy(() => import('@/pages/Register.jsx'));

function PageFallback() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-16">
      <Skeleton className="h-48 w-full max-w-2xl" />
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="flex min-h-screen flex-col bg-ink text-bone">
        <Header />
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game/:mode" element={<Game />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <footer className="border-t-2 border-bone">
          <div aria-hidden="true" className="checker h-3" />
          <p className="px-4 py-6 text-center text-xs font-bold text-bone/50">
            Vroom · Feito para quem ama carros ·{' '}
            <a href="mailto:vroomfeedback@gmail.com" className="transition hover:text-flame">
              Feedback
            </a>
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
