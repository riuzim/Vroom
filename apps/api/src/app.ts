import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './env.js';
import { optionalAuth } from './lib/auth.js';
import authRouter from './routes/auth.js';
import carsRouter from './routes/cars.js';
import healthRouter from './routes/health.js';
import leaderboardRouter from './routes/leaderboard.js';
import profileRouter from './routes/profile.js';
import roundsRouter from './routes/rounds.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { checkOrigin } from './middleware/origin.js';

export function createApp() {
  const app = express();

  // Menos superfície de reconhecimento do stack.
  app.disable('x-powered-by');

  // Atrás de um proxy (nginx/Render), req.ip seria sempre o IP do proxy —
  // todos os rate limiters compartilhariam um único balde. Confiar em N hops
  // configurados (nunca 'true' indiscriminado) devolve o IP real do cliente.
  if (env.trustProxy !== false) {
    app.set('trust proxy', env.trustProxy);
  }

  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  // Headers de segurança para uma API JSON: nosniff, frameguard, hsts etc.
  // CSP fica desativada (payload é JSON, não documento navegável).
  // CORP vira cross-origin: o front publicado (ex.: GitHub Pages) embute a
  // imagem do carro via <img> — o default same-origin do helmet faz o
  // navegador bloquear o embed (fetch CORS passa, <img> no-cors não).
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Teto global anti-DoS por IP, acima dos limites por rota.
  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      skip: () => env.isTest,
      message: { error: 'Muitas requisições. Calma aí, piloto.', code: 'RATE_LIMITED' },
    }),
  );

  app.use(express.json({ limit: '64kb' }));
  app.use(cookieParser());
  app.use(optionalAuth);
  // CSRF de lastro: com cookies SameSite=None (Pages ↔ API), POSTs de
  // outros sites chegam com sessão — Origin/Referer fora da allowlist morre.
  app.use(checkOrigin);

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/cars', carsRouter);
  app.use('/api/rounds', roundsRouter);
  app.use('/api/leaderboard', leaderboardRouter);
  app.use('/api/profile', profileRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
