import rateLimit from 'express-rate-limit';
import { Router } from 'express';
import { z } from 'zod';
import type { AsyncRequestHandler } from '../middleware/asyncHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  blurFromMistakes,
  calculatePoints,
  getAvailableLetters,
  getHint,
  GAME_MODES,
  MAX_ATTEMPTS,
  normalizeGuess,
  type GameMode,
} from '@vroom/shared';
import { prisma } from '../lib/prisma.js';

const roundsRouter = Router();

/** Limite por IP nos chutes (evita brute-force do nome). */
const guessLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitos chutes seguidos. Respire um pouco.' },
});

const startSchema = z.object({
  mode: z.enum(GAME_MODES),
});

const guessSchema = z.object({
  guess: z.string().trim().min(1, 'Envie um chute').max(80),
});

/** Data UTC de hoje no formato YYYY-MM-DD. */
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Índice determinístico do carro do dia — mesmo carro para todo mundo. */
function dailyCarIndex(date: string, total: number): number {
  const days = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  return Math.abs(days) % total;
}

interface RoundWithCar {
  id: number;
  userId: number | null;
  carId: number;
  mode: string;
  status: string;
  attemptsUsed: number;
  revealedLetters: string;
  dailyDate: string | null;
  points: number | null;
  car: { id: number; name: string; imageUrl: string };
}

/**
 * Visão pública de uma rodada: o nome do carro só viaja quando a rodada
 * já terminou (status !== playing) — núcleo do anti-cheat.
 */
function roundToClient(round: RoundWithCar) {
  const revealed = JSON.parse(round.revealedLetters) as string[];
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - round.attemptsUsed);
  const isOver = round.status !== 'playing';

  return {
    id: round.id,
    mode: round.mode,
    status: round.status,
    maxAttempts: MAX_ATTEMPTS,
    attemptsLeft,
    blur: isOver ? 0 : blurFromMistakes(round.attemptsUsed),
    imageUrl: round.car.imageUrl,
    hint: getHint(round.car.name, revealed),
    dailyDate: round.dailyDate,
    points: round.points,
    carName: isOver ? round.car.name : undefined,
  };
}

async function pickCar(mode: GameMode) {
  const cars = await prisma.car.findMany({ where: { active: true }, orderBy: { id: 'asc' } });

  if (cars.length === 0) {
    return null;
  }

  if (mode === 'daily') {
    return cars[dailyCarIndex(todayUtc(), cars.length)];
  }

  return cars[Math.floor(Math.random() * cars.length)];
}

/** POST /api/rounds — inicia (ou retoma) uma rodada do modo pedido. */
const startRound: AsyncRequestHandler = async (req, res) => {
  const { mode } = startSchema.parse(req.body);
  const user = req.user ?? null;
  const today = todayUtc();

  if (user) {
    // Daily do dia já existe (jogando ou encerrada)? Retorna o estado atual.
    const existing =
      mode === 'daily'
        ? await prisma.round.findFirst({
            where: { userId: user.id, mode, dailyDate: today },
            include: { car: true },
            orderBy: { id: 'desc' },
          })
        : await prisma.round.findFirst({
            where: { userId: user.id, mode, status: 'playing' },
            include: { car: true },
            orderBy: { id: 'desc' },
          });

    if (existing) {
      res.json({ round: roundToClient(existing) });
      return;
    }
  }

  const car = await pickCar(mode);

  if (!car) {
    res.status(503).json({ error: 'Catálogo de carros vazio — rode o seed.' });
    return;
  }

  // Higiene: rounds de visitantes abandonados há mais de 2h.
  await prisma.round.deleteMany({
    where: {
      userId: null,
      status: 'playing',
      startedAt: { lt: new Date(Date.now() - 2 * 3600_000) },
    },
  });

  const round = await prisma.round.create({
    data: {
      userId: user?.id ?? null,
      carId: car.id,
      mode,
      dailyDate: mode === 'daily' ? today : null,
    },
    include: { car: true },
  });

  res.status(201).json({ round: roundToClient(round) });
};

/** GET /api/rounds/active — rodada em andamento do usuário logado. */
const activeRound: AsyncRequestHandler = async (req, res) => {
  if (!req.user) {
    res.json({ round: null });
    return;
  }

  const round = await prisma.round.findFirst({
    where: { userId: req.user.id, status: 'playing' },
    include: { car: true },
    orderBy: { id: 'desc' },
  });

  res.json({ round: round ? roundToClient(round) : null });
};

function canPlayRound(round: RoundWithCar | null, userId?: number): string | null {
  if (!round) {
    return 'Rodada não encontrada';
  }
  if (round.status !== 'playing') {
    return 'Esta rodada já foi encerrada';
  }
  if (round.userId !== null && round.userId !== userId) {
    return 'Esta rodada não é sua';
  }
  return null;
}

/** POST /api/rounds/:id/guess — valida o chute no servidor. */
const submitGuess: AsyncRequestHandler = async (req, res) => {
  const roundId = Number(req.params.id);
  const { guess } = guessSchema.parse(req.body);

  const round = await prisma.round.findUnique({ where: { id: roundId }, include: { car: true } });
  const problem = canPlayRound(round, req.user?.id);

  if (problem) {
    res.status(problem === 'Rodada não encontrada' ? 404 : 403).json({ error: problem });
    return;
  }

  const active = round as RoundWithCar;
  const attemptsLeft = MAX_ATTEMPTS - active.attemptsUsed;

  // Acertou — encerra, pontua e registra no ranking.
  if (normalizeGuess(guess) === normalizeGuess(active.car.name)) {
    const points = calculatePoints(attemptsLeft, active.mode as GameMode);

    const updated = await prisma.round.update({
      where: { id: active.id },
      data: { status: 'correct', points, endedAt: new Date() },
      include: { car: true },
    });

    if (active.userId !== null) {
      await prisma.score.create({
        data: { userId: active.userId, roundId: active.id, points, mode: active.mode },
      });
    }

    res.json({
      result: 'correct',
      points,
      message: `Acertou: ${active.car.name}`,
      round: roundToClient(updated),
    });
    return;
  }

  // Errou — consome tentativa, revela letra e aumenta a nitidez.
  const revealed = JSON.parse(active.revealedLetters) as string[];
  const available = getAvailableLetters(active.car.name, revealed);
  const letter =
    available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
  const nextRevealed = letter ? [...revealed, letter] : revealed;
  const nextAttemptsUsed = active.attemptsUsed + 1;

  if (nextAttemptsUsed >= MAX_ATTEMPTS) {
    const updated = await prisma.round.update({
      where: { id: active.id },
      data: {
        attemptsUsed: nextAttemptsUsed,
        revealedLetters: JSON.stringify(nextRevealed),
        status: 'failed',
        points: 0,
        endedAt: new Date(),
      },
      include: { car: true },
    });

    res.json({
      result: 'failed',
      message: `Fim de rodada. Era ${active.car.name}.`,
      round: roundToClient(updated),
    });
    return;
  }

  const updated = await prisma.round.update({
    where: { id: active.id },
    data: { attemptsUsed: nextAttemptsUsed, revealedLetters: JSON.stringify(nextRevealed) },
    include: { car: true },
  });

  res.json({
    result: 'wrong',
    attemptsLeft: MAX_ATTEMPTS - nextAttemptsUsed,
    revealedLetter: letter,
    message: `Errou. ${MAX_ATTEMPTS - nextAttemptsUsed} tentativa${MAX_ATTEMPTS - nextAttemptsUsed === 1 ? '' : 's'} restante${MAX_ATTEMPTS - nextAttemptsUsed === 1 ? '' : 's'}.`,
    round: roundToClient(updated),
  });
};

/** POST /api/rounds/:id/skip — encerra revelando a resposta (0 pontos). */
const skipRound: AsyncRequestHandler = async (req, res) => {
  const roundId = Number(req.params.id);

  const round = await prisma.round.findUnique({ where: { id: roundId }, include: { car: true } });
  const problem = canPlayRound(round, req.user?.id);

  if (problem) {
    res.status(problem === 'Rodada não encontrada' ? 404 : 403).json({ error: problem });
    return;
  }

  const active = round as RoundWithCar;

  const updated = await prisma.round.update({
    where: { id: active.id },
    data: { status: 'skipped', points: 0, endedAt: new Date() },
    include: { car: true },
  });

  res.json({
    result: 'skipped',
    message: `Pulou. Era ${active.car.name}.`,
    round: roundToClient(updated),
  });
};

roundsRouter.post('/', asyncHandler(startRound));
roundsRouter.get('/active', asyncHandler(activeRound));
roundsRouter.post('/:id/guess', guessLimiter, asyncHandler(submitGuess));
roundsRouter.post('/:id/skip', asyncHandler(skipRound));

export default roundsRouter;
