import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';

const profileRouter = Router();

interface ModeStats {
  points: number;
  rounds: number;
}

/** GET /api/profile/stats — estatísticas de ranking do usuário logado. */
profileRouter.get('/stats', requireAuth, async (req, res) => {
  const userId = req.user!.id;

  const scores = await prisma.score.findMany({
    where: { userId },
    select: { points: true, mode: true },
  });

  const byMode: Record<string, ModeStats> = {};
  let totalPoints = 0;
  let bestRound = 0;

  for (const score of scores) {
    totalPoints += score.points;
    bestRound = Math.max(bestRound, score.points);

    byMode[score.mode] = byMode[score.mode] ?? { points: 0, rounds: 0 };
    byMode[score.mode].points += score.points;
    byMode[score.mode].rounds += 1;
  }

  res.json({
    stats: {
      totalPoints,
      roundsPlayed: scores.length,
      bestRound,
      byMode,
    },
  });
});

export default profileRouter;
