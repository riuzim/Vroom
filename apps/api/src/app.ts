import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './env.js';
import authRouter from './routes/auth.js';
import healthRouter from './routes/health.js';
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

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
