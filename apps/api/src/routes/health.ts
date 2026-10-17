import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'vroom-api', timestamp: new Date().toISOString() });
});

export default healthRouter;
