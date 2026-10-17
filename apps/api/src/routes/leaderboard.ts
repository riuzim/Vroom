import { Router } from 'express';
import { z } from 'zod';
import type { AsyncRequestHandler } from '../middleware/asyncHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { prisma } from '../lib/prisma.js';

const leaderboardRouter = Router();

const querySchema = z.object({
  period: z.enum(['all', 'today']).default('all'),
  mode: z.enum(['all', 'classic', 'hard', 'daily']).default('all'),
});

/** GET /api/leaderboard?period=all|today&mode=all|classic|hard|daily */
const leaderboard: AsyncRequestHandler = async (req, res) => {
  const { period, mode } = querySchema.parse(req.query);

  const where = {
    ...(mode !== 'all' ? { mode } : {}),
    ...(period === 'today'
      ? { createdAt: { gte: new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`) } }
      : {}),
  };

  const groups = await prisma.score.groupBy({
    by: ['userId'],
    where,
    _sum: { points: true },
    _count: { _all: true },
    orderBy: { _sum: { points: 'desc' } },
    take: 20,
  });

  if (groups.length === 0) {
    res.json({ entries: [] });
    return;
  }

  const users = await prisma.user.findMany({
    where: { id: { in: groups.map((group) => group.userId) } },
    select: { id: true, username: true },
  });

  const usernameById = new Map(users.map((user) => [user.id, user.username]));
  const entries = groups.map((group, index) => ({
    position: index + 1,
    username: usernameById.get(group.userId) ?? '???',
    points: group._sum.points ?? 0,
    rounds: group._count._all,
  }));

  res.json({ entries });
};

leaderboardRouter.get('/', asyncHandler(leaderboard));

export default leaderboardRouter;
