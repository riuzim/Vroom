import crypto from 'node:crypto';
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
  themeOfDay,
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
  skip: () => env.isTest,
  message: { error: 'Muitos chutes seguidos. Respire um pouco.', code: 'RATE_LIMITED' },
});

/** Criação de rodadas é gravação no banco: sem isso, script em loop incha o DB. */
const startLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { error: 'Muitas rodadas seguidas. Aguarde um instante.', code: 'RATE_LIMITED' },
});

/** Skip também encerra rodada (gravação): mesmo tratamento. */
const skipLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { error: 'Calma no botão de pular.', code: 'RATE_LIMITED' },
});

const startSchema = z.object({
  mode: z.enum(GAME_MODES),
});

const guessSchema = z.object({
  guess: z.string().trim().min(1, 'Envie um chute').max(80),
});

const roundIdSchema = z.coerce.number().int().positive();

/** Cookie de sessão de visitante — liga rodadas guest a este browser. */
const GUEST_COOKIE = 'vroom_guest';
const GUEST_COOKIE_TTL_MS = 180 * 24 * 60 * 60 * 1000; // 180 dias

function guestCookieOptions() {
  // Mesmas bandeiras do cookie de sessão (auth.ts): httpOnly + Secure em
  // produção. O SameSite da sessão implica o mesmo aqui — o front embutido
  // em domínio distinto (Pages ↔ API) precisa do cookie no fetch CORS.
  return {
    httpOnly: true,
    secure: env.isProduction,
    path: '/',
    sameSite: env.isProduction ? env.cookieSameSite : 'lax',
    maxAge: GUEST_COOKIE_TTL_MS,
  } as const;
}

/** Data UTC de hoje no formato YYYY-MM-DD. */
function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Índice determinístico do carro do desafio — mesmo carro para todo mundo.
 * O slot pode carregar sufixo "#tema" (modo themed): o comprimento dele
 * entra como offset para a Série não repetir o carro do Daily quando o
 * tema cai no fallback do catálogo completo.
 */
function dailyCarIndex(slot: string, total: number): number {
  const [date, ...suffix] = slot.split('#');
  const days = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  const themeOffset = suffix.length > 0 ? slot.length : 0;
  return Math.abs(days + themeOffset) % total;
}

interface CarOption {
  id: number;
}

/**
 * Carro oficial do desafio do dia para um modo diário (daily/themed):
 * 1a iniciação do dia grava em DailyCar e congela a escolha — catálogo
 * pode mudar no meio do dia sem afetar quem já jogou, e o archive lê
 * direto daqui. Para o themed, `slot` inclui o tema ("YYYY-MM-DD#jdm").
 */
async function pickDailyCar(slot: string, mode: 'daily' | 'themed', cars: CarOption[]) {
  const registered = await prisma.dailyCar.findUnique({
    where: { date_mode: { date: slot, mode } },
    include: { car: { select: CAR_LIGHT_SELECT } },
  });

  if (registered) {
    // Carro congelado vale mesmo se sair da rotação ativa depois.
    return registered.car;
  }

  const chosen = cars[dailyCarIndex(slot, cars.length)];

  try {
    await prisma.dailyCar.create({ data: { date: slot, mode, carId: chosen.id } });
  } catch (error) {
    // Outro request registrou primeiro (P2002): a linha dele é a verdade.
    if (!(
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: string }).code === 'P2002'
    )) {
      throw error;
    }
  }

  return chosen;
}

/**
 * Select leve do carro para TODAS as queries de rodada: `imageData` é um
 * BLOB de centenas de KB — materializá-lo em cada POST/guess/skip/retomada
 * multiplica memória e latência sem uso algum. A foto só sai pela rota
 * de imagem (/api/rounds/:id/image), que a lê explicitamente. Se algum
 * campo novo do carro precisar viajar, adicione AQUI (e no tipo abaixo).
 */
const CAR_LIGHT_SELECT = {
  id: true,
  name: true,
  brand: true,
  model: true,
  category: true,
  years: true,
  author: true,
  license: true,
  filePageUrl: true,
} as const;

interface RoundWithCar {
  id: number;
  userId: number | null;
  carId: number;
  mode: string;
  status: string;
  attemptsUsed: number;
  revealedLetters: string;
  dailyDate: string | null;
  guestSessionId: string | null;
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
 * anti-cheat. A imagem é servida POR RODADA (não por carro): o id do carro
 * nunca vaza para o cliente, então o catálogo público não vira oráculo.
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
    imagePath: `/api/rounds/${round.id}/image`,
    hint: getHint(round.car.name, revealed),
    dailyDate: round.dailyDate,
    // Tema da Série do dia (modo themed): vem no dailyDate "YYYY-MM-DD#tema".
    theme: round.mode === 'themed' ? (round.dailyDate?.split('#')[1] ?? null) : undefined,
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

/**
 * Janela de memória do "não repetir": quantas rodadas recentes do jogador
 * (login OU sessão de visitante) alimentam a lista de carros a evitar.
 * Maior que o catálogo ativo inteiro, então o jogador só reencontra a
 * mesma máquina depois de rodar por todos os carros — nunca dois seguidos.
 */
const RECENT_ROUNDS_WINDOW = 50;

/** Identidade dona do histórico de rodadas usado pelo sorteio sem repetição. */
interface PlayerScope {
  userId: number | null;
  guestSessionId: string | null;
}

async function pickCar(mode: GameMode, player: PlayerScope) {
  // Select mínimo: sortear precisa só de id (chave estrangeira da rodada)
  // e category (filtro do themed). SEM select o Prisma materializa os
  // BLOBs de TODOS os carros (~dezenas de MB) a cada POST /api/rounds.
  const cars = await prisma.car.findMany({
    where: { active: true },
    orderBy: { id: 'asc' },
    select: { id: true, category: true },
  });

  if (cars.length === 0) {
    return null;
  }

  if (mode === 'daily') {
    return pickDailyCar(todayUtc(), 'daily', cars);
  }

  if (mode === 'themed') {
    // Série do dia: tema determinístico da data; se a categoria não tiver
    // carros ativos (catálogo pequeno/desativados), cai pro catálogo todo.
    const theme = themeOfDay(todayUtc());
    const themed = cars.filter((car) => car.category === theme);
    return pickDailyCar(`${todayUtc()}#${theme}`, 'themed', themed.length > 0 ? themed : cars);
  }

  // Modos livres (classic/hard/silhouette): sorteia FORA do histórico
  // recente deste jogador — feedback do jvvr0608: "carros se repetiram na
  // minha run". Rodadas de login OU de sessão de visitante contam como
  // histórico, em qualquer modo. Se o histórico recente já cobre o
  // catálogo todo (recomeço, catálogo pequeno), volta ao sorteio cheio:
  // repetir só depois de esgotar as opções.
  const recentRounds = await prisma.round.findMany({
    where: {
      OR: [
        ...(player.userId !== null ? [{ userId: player.userId }] : []),
        ...(player.guestSessionId ? [{ guestSessionId: player.guestSessionId }] : []),
      ],
    },
    orderBy: { id: 'desc' },
    take: RECENT_ROUNDS_WINDOW,
    select: { carId: true },
  });
  const recentCarIds = new Set(recentRounds.map((round) => round.carId));
  const unseen = cars.filter((car) => !recentCarIds.has(car.id));

  const pool = unseen.length > 0 ? unseen : cars;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Chave do desafio do dia no Round.dailyDate — garante a restrição
 * de "uma rodada por dia" também para o themed, sem colidir com o
 * daily: daily usa "YYYY-MM-DD", themed usa "YYYY-MM-DD#tema".
 */
function dailyKeyFor(mode: GameMode, today: string): string | null {
  if (mode === 'daily') {
    return today;
  }
  if (mode === 'themed') {
    return `${today}#${themeOfDay(today)}`;
  }
  return null;
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
      OR: [
        // Rodadas abandonadas no meio (2h): o jogador sumiu.
        { status: 'playing', startedAt: { lt: new Date(Date.now() - 2 * 3600_000) } },
        // Encerradas de visitante: o histórico que importa vive no
        // navegador do jogador — no servidor só servem ao "1/dia" do dia
        // corrente. Sem isso, tráfego anônimo incha o banco sem limite.
        {
          status: { not: 'playing' },
          startedAt: { lt: new Date(Date.now() - 30 * 24 * 3600_000) },
        },
      ],
    },
  });
}

/** POST /api/rounds — inicia (ou retoma) uma rodada do modo pedido. */
const startRound: AsyncRequestHandler = async (req, res) => {
  const { mode } = startSchema.parse(req.body);
  const user = req.user ?? null;
  const today = todayUtc();
  const dailyKey = dailyKeyFor(mode, today);

  if (user) {
    // Desafio do dia já existe (jogando ou encerrado)? Retorna o estado atual.
    const existing = dailyKey
      ? await prisma.round.findFirst({
          where: { userId: user.id, mode, dailyDate: dailyKey },
          include: { car: { select: CAR_LIGHT_SELECT } },
          orderBy: { id: 'desc' },
        })
      : await prisma.round.findFirst({
          where: { userId: user.id, mode, status: 'playing' },
          include: { car: { select: CAR_LIGHT_SELECT } },
          orderBy: { id: 'desc' },
        });

    if (existing) {
      res.json({ round: roundToClient(existing) });
      return;
    }
  }

  // Sessão de visitante: liga as rodadas guest a este browser. Sem isso,
  // qualquer script encerra rodadas alheias por id sequencial (griefing).
  const guestSessionId = user
    ? null
    : ((req.cookies?.[GUEST_COOKIE] as string | undefined) ?? crypto.randomUUID());

  if (guestSessionId) {
    res.cookie(GUEST_COOKIE, guestSessionId, guestCookieOptions());

    // Retoma a visão deste cookie: o desafio do dia (jogando OU encerrado
    // — visitante também é 1/dia, sem replay pós-reload) e rodadas de
    // outros modos que ficaram em andamento.
    const existing = dailyKey
      ? await prisma.round.findFirst({
          where: { guestSessionId, mode, dailyDate: dailyKey },
          include: { car: { select: CAR_LIGHT_SELECT } },
          orderBy: { id: 'desc' },
        })
      : await prisma.round.findFirst({
          where: { guestSessionId, mode, status: 'playing' },
          include: { car: { select: CAR_LIGHT_SELECT } },
          orderBy: { id: 'desc' },
        });

    if (existing) {
      res.json({ round: roundToClient(existing) });
      return;
    }
  }

  const car = await pickCar(mode, {
    userId: user?.id ?? null,
    guestSessionId: guestSessionId ?? null,
  });

  if (!car) {
    res
      .status(503)
      .json({ error: 'Catálogo de carros vazio — rode o seed.', code: 'CATALOG_EMPTY' });
    return;
  }

  await cleanupGuestRounds();

  try {
    const round = await prisma.round.create({
      data: {
        userId: user?.id ?? null,
        guestSessionId,
        carId: car.id,
        mode,
        dailyDate: dailyKey,
      },
      include: { car: { select: CAR_LIGHT_SELECT } },
    });

    res.status(201).json({ round: roundToClient(round) });
  } catch (error) {
    // Dois POSTs concorrentes do desafio do dia: o unique (userId, dailyDate)
    // garante que só um cria — o outro devolve a rodada que já existe.
    if (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: string }).code === 'P2002' &&
      user
    ) {
      const existing = await prisma.round.findFirst({
        where: { userId: user.id, mode, dailyDate: dailyKey },
        include: { car: { select: CAR_LIGHT_SELECT } },
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
    include: { car: { select: CAR_LIGHT_SELECT } },
    orderBy: { id: 'desc' },
  });

  res.json({ round: round ? roundToClient(round) : null });
};

interface RoundProblem {
  status: number;
  code: string;
  message: string;
}

function canPlayRound(
  round: RoundWithCar | null,
  userId?: number,
  guestSessionId?: string,
): RoundProblem | null {
  if (!round) {
    return { status: 404, code: 'ROUND_NOT_FOUND', message: 'Rodada não encontrada' };
  }
  if (round.status !== 'playing') {
    return { status: 403, code: 'ROUND_ENDED', message: 'Esta rodada já foi encerrada' };
  }
  if (round.userId !== null) {
    if (round.userId !== userId) {
      return { status: 403, code: 'ROUND_NOT_YOURS', message: 'Esta rodada não é sua' };
    }
    return null;
  }
  // Rodada de visitante: só quem tem o cookie da sessão que a criou joga.
  // (Legado pré-cookie, guestSessionId null: ninguém joga — expira em 2h.)
  if (!round.guestSessionId || round.guestSessionId !== guestSessionId) {
    return { status: 403, code: 'ROUND_NOT_YOURS', message: 'Esta rodada não é sua' };
  }
  return null;
}

/** Valida :id da rota; inválido/negativo/NaN vira 404 limpo (não 500). */
function parseRoundId(value: string): number | null {
  const parsed = roundIdSchema.safeParse(value);
  if (!parsed.success) return null;
  const n = parsed.data;
  if (!Number.isSafeInteger(n) || n > 2147483647 || n < 1) return null;
  return n;
}

/** Erro de constraint única do Prisma (guarda dupla @@unique(roundId)). */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002'
  );
}

/** POST /api/rounds/:id/guess — valida o chute no servidor. */
const submitGuess: AsyncRequestHandler = async (req, res) => {
  const roundId = parseRoundId(req.params.id);

  if (roundId === null) {
    res.status(404).json({ error: 'Rodada não encontrada', code: 'ROUND_NOT_FOUND' });
    return;
  }

  const { guess } = guessSchema.parse(req.body);

  const round = await prisma.round.findUnique({ where: { id: roundId }, include: { car: { select: CAR_LIGHT_SELECT } } });
  const problem = canPlayRound(
    round,
    req.user?.id,
    req.cookies?.[GUEST_COOKIE] as string | undefined,
  );

  if (problem) {
    res.status(problem.status).json({ error: problem.message, code: problem.code });
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

        return tx.round.findUnique({ where: { id: active.id }, include: { car: { select: CAR_LIGHT_SELECT } } });
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        updated = null;
      } else {
        throw error;
      }
    }

    if (!updated) {
      res
        .status(409)
        .json({ error: 'Esta rodada mudou de estado. Tente de novo.', code: 'ROUND_CONFLICT' });
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
    res
      .status(409)
      .json({ error: 'Esta rodada mudou de estado. Tente de novo.', code: 'ROUND_CONFLICT' });
    return;
  }

  const updated = await prisma.round.findUnique({
    where: { id: active.id },
    include: { car: { select: CAR_LIGHT_SELECT } },
  });

  if (!updated) {
    res
      .status(409)
      .json({ error: 'Esta rodada mudou de estado. Tente de novo.', code: 'ROUND_CONFLICT' });
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
    res.status(404).json({ error: 'Rodada não encontrada', code: 'ROUND_NOT_FOUND' });
    return;
  }

  const round = await prisma.round.findUnique({ where: { id: roundId }, include: { car: { select: CAR_LIGHT_SELECT } } });
  const problem = canPlayRound(
    round,
    req.user?.id,
    req.cookies?.[GUEST_COOKIE] as string | undefined,
  );

  if (problem) {
    res.status(problem.status).json({ error: problem.message, code: problem.code });
    return;
  }

  const active = round as RoundWithCar;

  // updateMany com guarda: pular duas vezes / pular após acerto → 409.
  const claim = await prisma.round.updateMany({
    where: { id: active.id, status: 'playing' },
    data: { status: 'skipped', points: 0, endedAt: new Date() },
  });

  if (claim.count === 0) {
    res
      .status(409)
      .json({ error: 'Esta rodada mudou de estado. Tente de novo.', code: 'ROUND_CONFLICT' });
    return;
  }

  const updated = await prisma.round.findUnique({
    where: { id: active.id },
    include: { car: { select: CAR_LIGHT_SELECT } },
  });

  if (!updated) {
    res
      .status(409)
      .json({ error: 'Esta rodada mudou de estado. Tente de novo.', code: 'ROUND_CONFLICT' });
    return;
  }

  res.json({
    result: 'skipped',
    message: `Pulou. Era ${active.car.name}.`,
    round: roundToClient(updated),
  });
};

/**
 * GET /api/rounds/:id/image — a foto do carro DENTRO da rodada.
 *
 * A posse é da rodada: usuário logado dono, ou o cookie de sessão guest
 * que a criou. Rodadas legadas (pré-cookie) sem sessão ainda servem a
 * foto do próprio dono — expiram em 2h/30d pelo cleanup. Cache privado:
 * a mesma foto pode ser vista por quem NÃO tem posse, então nunca pública.
 */
const roundImage: AsyncRequestHandler = async (req, res) => {
  const id = parseRoundId(req.params.id);

  if (id === null) {
    res.status(404).json({ error: 'Rodada não encontrada', code: 'ROUND_NOT_FOUND' });
    return;
  }

  const round = await prisma.round.findUnique({
    where: { id },
    select: {
      userId: true,
      guestSessionId: true,
      car: { select: { imageData: true, imageMime: true } },
    },
  });

  if (!round?.car?.imageData) {
    res.status(404).json({ error: 'Imagem não encontrada', code: 'IMAGE_NOT_FOUND' });
    return;
  }

  const guestCookie = req.cookies?.[GUEST_COOKIE] as string | undefined;
  const owns =
    round.userId !== null
      ? round.userId === req.user?.id
      : !round.guestSessionId || round.guestSessionId === guestCookie;

  if (!owns) {
    res.status(403).json({ error: 'Esta rodada não é sua', code: 'ROUND_NOT_YOURS' });
    return;
  }

  const bytes = Buffer.from(round.car.imageData);
  const etag = `W/"round-${id}-${bytes.byteLength}"`;

  if (req.headers['if-none-match'] === etag) {
    res.set('Cache-Control', 'private, max-age=3600');
    res.status(304).end();
    return;
  }

  res
    .set('Content-Type', round.car.imageMime || 'image/jpeg')
    .set('Cache-Control', 'private, max-age=3600')
    .set('ETag', etag)
    .send(bytes);
};

roundsRouter.post('/', startLimiter, asyncHandler(startRound));
roundsRouter.get('/active', asyncHandler(activeRound));
roundsRouter.get('/:id/image', asyncHandler(roundImage));
roundsRouter.post('/:id/guess', guessLimiter, asyncHandler(submitGuess));
roundsRouter.post('/:id/skip', skipLimiter, asyncHandler(skipRound));

export default roundsRouter;
