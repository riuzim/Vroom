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
import { env } from '../env.js';
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

/** Criação de rodadas é gravação no banco: sem isso, script em loop incha o DB. */
const startLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { error: 'Muitas rodadas seguidas. Aguarde um instante.' },
});

/** Skip também encerra rodada (gravação): mesmo tratamento. */
const skipLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { error: 'Calma no botão de pular.' },
});

const startSchema = z.object({
  mode: z.enum(GAME_MODES),
});

const guessSchema = z.object({
  guess: z.string().trim().min(1, 'Envie um chute').max(80),
});

const roundIdSchema = z.coerce.number().int().positive();

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
  car: {
    id: number;
    name: string;
    brand: string;
    model: string;
    category: string;
    years: string;
    author: string;
    license: string;
    filePageUrl: string;
  };
}

/**
 * Visão pública de uma rodada: o nome do carro (e os dados completos dele)
 * só viajam quando a rodada já terminou (status !== playing) — núcleo do
 * anti-cheat. A imagem é referenciada por caminho local da própria API;
 * nenhum host externo entra no runtime.
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
    imagePath: `/api/cars/${round.car.id}/image`,
    hint: getHint(round.car.name, revealed),
    dailyDate: round.dailyDate,
    points: round.points,
    carName: isOver ? round.car.name : undefined,
    carCredits: isOver
      ? {
          brand: round.car.brand,
          model: round.car.model,
          category: round.car.category,
          years: round.car.years,
          author: round.car.author,
          license: round.car.license,
          filePageUrl: round.car.filePageUrl,
        }
      : undefined,
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

/** Higiene de rounds de visitante — no máximo uma varredura por minuto. */
let lastCleanupAt = 0;

async function cleanupGuestRounds() {
  const now = Date.now();

  if (now - lastCleanupAt < 60_000) {
    return;
  }

  lastCleanupAt = now;
  await prisma.round.deleteMany({
    where: {
      userId: null,
      status: 'playing',
      startedAt: { lt: new Date(Date.now() - 2 * 3600_000) },
    },
  });
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

  await cleanupGuestRounds();

  try {
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
  } catch (error) {
    // Dois POSTs concorrentes de daily: o unique (userId, dailyDate)
    // garante que só um cria — o outro devolve a rodada que já existe.
    if (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: string }).code === 'P2002' &&
      user
    ) {
      const existing = await prisma.round.findFirst({
        where: { userId: user.id, mode, dailyDate: today },
        include: { car: true },
        orderBy: { id: 'desc' },
      });

      if (existing) {
        res.json({ round: roundToClient(existing) });
        return;
      }
    }

    throw error;
  }
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

/** Valida :id da rota; inválido/negativo/NaN vira 404 limpo (não 500). */
function parseRoundId(value: string): number | null {
  const parsed = roundIdSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** Erro de constraint única do Prisma (guarda dupla @@unique(roundId)). */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === 'P2002'
  );
}

/** POST /api/rounds/:id/guess — valida o chute no servidor. */
const submitGuess: AsyncRequestHandler = async (req, res) => {
  const roundId = parseRoundId(req.params.id);

  if (roundId === null) {
    res.status(404).json({ error: 'Rodada não encontrada' });
    return;
  }

  const { guess } = guessSchema.parse(req.body);

  const round = await prisma.round.findUnique({ where: { id: roundId }, include: { car: true } });
  const problem = canPlayRound(round, req.user?.id);

  if (problem) {
    res.status(problem === 'Rodada não encontrada' ? 404 : 403).json({ error: problem });
    return;
  }

  const active = round as RoundWithCar;
  const attemptsLeft = MAX_ATTEMPTS - active.attemptsUsed;

  // Acertou — encerra, pontua e registra no ranking de forma ATÔMICA.
  // A guarda condicional (status + attemptsAtuais) faz só UMA das
  // requisições concorrentes vencer; as outras recebem 409 e refazem.
  if (normalizeGuess(guess) === normalizeGuess(active.car.name)) {
    const points = calculatePoints(attemptsLeft, active.mode as GameMode);
    let updated: RoundWithCar | null = null;

    try {
      updated = await prisma.$transaction(async (tx) => {
        const claim = await tx.round.updateMany({
          where: { id: active.id, status: 'playing', attemptsUsed: active.attemptsUsed },
          data: { status: 'correct', points, endedAt: new Date() },
        });

        if (claim.count === 0) {
          return null;
        }

        if (active.userId !== null) {
          try {
            await tx.score.create({
              data: { userId: active.userId, roundId: active.id, points, mode: active.mode },
            });
          } catch (error) {
            // Fallback da guarda dupla: score duplicado = outro acerto já registrou.
            if (isUniqueViolation(error)) {
              return null;
            }
            throw error;
          }
        }

        return tx.round.findUnique({ where: { id: active.id }, include: { car: true } });
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        updated = null;
      } else {
        throw error;
      }
    }

    if (!updated) {
      res.status(409).json({ error: 'Esta rodada mudou de estado. Tente de novo.' });
      return;
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
  // updateMany com guarda (status + attemptsAtuais): uma única gravação
  // por tentativa; concorrentes recebem 409 e refazem com estado novo.
  const revealed = JSON.parse(active.revealedLetters) as string[];
  const available = getAvailableLetters(active.car.name, revealed);
  const letter =
    available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
  const nextRevealed = letter ? [...revealed, letter] : revealed;
  const nextAttemptsUsed = active.attemptsUsed + 1;
  const isFinalMiss = nextAttemptsUsed >= MAX_ATTEMPTS;

  const claim = await prisma.round.updateMany({
    where: { id: active.id, status: 'playing', attemptsUsed: active.attemptsUsed },
    data: {
      attemptsUsed: nextAttemptsUsed,
      revealedLetters: JSON.stringify(nextRevealed),
      ...(isFinalMiss ? { status: 'failed', points: 0, endedAt: new Date() } : {}),
    },
  });

  if (claim.count === 0) {
    res.status(409).json({ error: 'Esta rodada mudou de estado. Tente de novo.' });
    return;
  }

  const updated = await prisma.round.findUnique({
    where: { id: active.id },
    include: { car: true },
  });

  if (!updated) {
    res.status(409).json({ error: 'Esta rodada mudou de estado. Tente de novo.' });
    return;
  }

  res.json({
    result: isFinalMiss ? 'failed' : 'wrong',
    attemptsLeft: MAX_ATTEMPTS - nextAttemptsUsed,
    revealedLetter: letter,
    message: isFinalMiss
      ? `Fim de rodada. Era ${active.car.name}.`
      : `Errou. ${MAX_ATTEMPTS - nextAttemptsUsed} tentativa${MAX_ATTEMPTS - nextAttemptsUsed === 1 ? '' : 's'} restante${MAX_ATTEMPTS - nextAttemptsUsed === 1 ? '' : 's'}.`,
    round: roundToClient(updated),
  });
};

/** POST /api/rounds/:id/skip — encerra revelando a resposta (0 pontos). */
const skipRound: AsyncRequestHandler = async (req, res) => {
  const roundId = parseRoundId(req.params.id);

  if (roundId === null) {
    res.status(404).json({ error: 'Rodada não encontrada' });
    return;
  }

  const round = await prisma.round.findUnique({ where: { id: roundId }, include: { car: true } });
  const problem = canPlayRound(round, req.user?.id);

  if (problem) {
    res.status(problem === 'Rodada não encontrada' ? 404 : 403).json({ error: problem });
    return;
  }

  const active = round as RoundWithCar;

  // updateMany com guarda: pular duas vezes / pular após acerto → 409.
  const claim = await prisma.round.updateMany({
    where: { id: active.id, status: 'playing' },
    data: { status: 'skipped', points: 0, endedAt: new Date() },
  });

  if (claim.count === 0) {
    res.status(409).json({ error: 'Esta rodada mudou de estado. Tente de novo.' });
    return;
  }

  const updated = await prisma.round.findUnique({
    where: { id: active.id },
    include: { car: true },
  });

  if (!updated) {
    res.status(409).json({ error: 'Esta rodada mudou de estado. Tente de novo.' });
    return;
  }

  res.json({
    result: 'skipped',
    message: `Pulou. Era ${active.car.name}.`,
    round: roundToClient(updated),
  });
};

roundsRouter.post('/', startLimiter, asyncHandler(startRound));
roundsRouter.get('/active', asyncHandler(activeRound));
roundsRouter.post('/:id/guess', guessLimiter, asyncHandler(submitGuess));
roundsRouter.post('/:id/skip', skipLimiter, asyncHandler(skipRound));

export default roundsRouter;
