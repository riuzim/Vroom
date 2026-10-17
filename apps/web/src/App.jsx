import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';
import Header from '@/components/Header.jsx';
import Home from '@/pages/Home.jsx';
import Game from '@/pages/Game.jsx';
import Leaderboard from '@/pages/Leaderboard.jsx';
import Login from '@/pages/Login.jsx';
import Profile from '@/pages/Profile.jsx';
import Register from '@/pages/Register.jsx';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="flex min-h-screen flex-col bg-ink text-white">
        <Header />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:mode" element={<Game />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
        <footer className="border-t border-white/10 py-6 text-center text-xs font-semibold text-white/40">
          Vroom · Feito para quem ama carros ·{' '}
          <a href="mailto:vroomfeedback@gmail.com" className="transition hover:text-flame">
            Feedback
          </a>
        </footer>
      </div>
    </BrowserRouter>
  );
}
