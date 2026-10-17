import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './env.js';
import { optionalAuth } from './lib/auth.js';
import authRouter from './routes/auth.js';
import healthRouter from './routes/health.js';
import leaderboardRouter from './routes/leaderboard.js';
import profileRouter from './routes/profile.js';
import roundsRouter from './routes/rounds.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '64kb' }));
  app.use(cookieParser());
  app.use(optionalAuth);

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/rounds', roundsRouter);
  app.use('/api/leaderboard', leaderboardRouter);
  app.use('/api/profile', profileRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
