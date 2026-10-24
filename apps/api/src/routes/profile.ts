import { Router } from 'express';
import { computeStreak, MAX_ATTEMPTS } from '@vroom/shared';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const profileRouter = Router();

interface ModeStats {
  points: number;
  rounds: number;
}

/** Data UTC de hoje no formato YYYY-MM-DD. */
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * GET /api/profile/stats — estatísticas do usuário logado.
 *
 * Além do ranking (pontos por modo), agora devolve o desempenho no Daily:
 * streak (atual/recorde, calculado dos dias realmente finalizados),
 * taxa de vitória e distribuição de chutes até o acerto — os números
 * que sustentam o share-grid e a página de perfil.
 */
profileRouter.get(
  '/stats',
  requireAuth,
  asyncHandler(async (req, res) => {
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

    // Rodadas de Daily encerradas — base do streak e da distribuição.
    // Participar (acertar, errar tudo ou pular) mantém o streak vivo:
    // quem apareceu e jogou cumpriu o compromisso do dia.
    const dailyRounds = await prisma.round.findMany({
      where: {
        userId,
        mode: 'daily',
        status: { in: ['correct', 'failed', 'skipped'] },
      },
      select: { attemptsUsed: true, status: true, dailyDate: true },
      orderBy: { dailyDate: 'asc' },
    });

    // distribution[0..4] = acertos no 1º..5º chute; distribution[5] = X (errou/pulou).
    // O acerto NÃO incrementa attemptsUsed no servidor: o chute vencedor é
    // o (attemptsUsed + 1)-ésimo.
    const distribution = Array.from({ length: MAX_ATTEMPTS + 1 }, () => 0);
    let wins = 0;

    for (const round of dailyRounds) {
      if (round.status === 'correct') {
        wins += 1;
        const used = Math.min(round.attemptsUsed + 1, MAX_ATTEMPTS);
        distribution[used - 1] += 1;
      } else {
        distribution[MAX_ATTEMPTS] += 1;
      }
    }

    const streak = computeStreak(
      dailyRounds.map((round) => round.dailyDate).filter((date): date is string => date !== null),
      todayUtc(),
    );

    res.json({
      stats: {
        totalPoints,
        roundsPlayed: scores.length,
        bestRound,
        byMode,
        daily: {
          played: dailyRounds.length,
          wins,
          distribution,
          streak,
        },
      },
    });
  }),
);

export default profileRouter;
