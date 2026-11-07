import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { prisma } from '../lib/prisma.js';
import { MAX_ATTEMPTS } from '@vroom/shared';

const publicStatsRouter = Router();

/** GET /api/public/stats — estatísticas agregadas públicas */
publicStatsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const modes = ['classic', 'hard', 'daily', 'silhouette', 'themed'];

    const roundsByMode = await prisma.round.groupBy({
      by: ['mode'],
      where: {
        mode: { in: modes },
        status: { in: ['correct', 'failed', 'skipped'] },
      },
      _count: { _all: true },
      _avg: { attemptsUsed: true },
    });

    const winsByMode = await prisma.round.groupBy({
      by: ['mode'],
      where: {
        mode: { in: modes },
        status: 'correct',
      },
      _count: { _all: true },
    });

    const correctDistribution = await prisma.round.groupBy({
      by: ['mode', 'attemptsUsed'],
      where: {
        mode: { in: modes },
        status: 'correct',
      },
      _count: { _all: true },
    });

    // Build per-mode stats
    const statsByMode: Record<string, any> = {};
    for (const mode of modes) {
      const total = roundsByMode.find((r) => r.mode === mode)?._count._all ?? 0;
      const wins = winsByMode.find((r) => r.mode === mode)?._count._all ?? 0;
      const avgAttempts = roundsByMode.find((r) => r.mode === mode)?._avg.attemptsUsed ?? 0;

      const distribution = Array.from({ length: MAX_ATTEMPTS + 1 }, () => 0);
      // wins distribution by attemptsUsed+1
      for (const d of correctDistribution.filter((x) => x.mode === mode)) {
        const bucket = Math.min(d.attemptsUsed + 1, MAX_ATTEMPTS);
        distribution[bucket - 1] += d._count._all;
      }
      // failed / skipped go to last bucket
      const failedSkipped = distributionByMode
        .filter((x) => x.mode === mode && x.status !== 'correct')
        .reduce((sum, x) => sum + x._count._all, 0);
      distribution[MAX_ATTEMPTS] += failedSkipped;

      statsByMode[mode] = {
        total,
        wins,
        winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
        avgAttempts: Math.round((avgAttempts + 0.5) * 10) / 10,
        distribution,
      };
    }

    res.json({ byMode: statsByMode });
  }),
);

export default publicStatsRouter;
