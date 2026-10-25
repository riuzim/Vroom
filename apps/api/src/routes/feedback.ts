import rateLimit from 'express-rate-limit';
import { Router } from 'express';
import { z } from 'zod';
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_CONTENT_MAX,
  FEEDBACK_IMAGE_MAX_BYTES,
  FEEDBACK_IMAGE_MIME_TYPES,
  FEEDBACK_TITLE_MAX,
  isAdminAccount,
} from '@vroom/shared';
import type { AsyncRequestHandler } from '../middleware/asyncHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { env } from '../env.js';

const feedbackRouter = Router();

/** Feedback é raro por natureza — 5/min por IP segura spam de visitante. */
const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // A suíte de testes cria vários feedbacks seguidos do mesmo IP.
  skip: () => env.isTest,
  message: { error: 'Muitos envios. Tente de novo em um minuto.', code: 'RATE_LIMITED' },
});

const idSchema = z.coerce.number().int().positive();

const createSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES),
  title: z.string().trim().min(3).max(FEEDBACK_TITLE_MAX),
  content: z.string().trim().min(5).max(FEEDBACK_CONTENT_MAX),
  image: z
    .object({
      // 2 MB binários ≈ 2,7 M chars em base64; o teto do zod vem antes do
      // limite geral do body (4 MB só nesta rota), com margem.
      data: z.string().min(1).max(2_800_000),
      mime: z.enum(FEEDBACK_IMAGE_MIME_TYPES),
    })
    .nullable()
    .optional(),
});

/**
 * Admin = conta `riuzimjp` (username OU email — a do dono entra pelo
 * Google, que pode derivar username diferente). O cookie de sessão NÃO
 * carrega username/email — o optionalAuth popula vazio — então a checagem
 * busca a conta no banco; 401 é do requireAuth na rota.
 */
const requireAdmin: AsyncRequestHandler = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { username: true, email: true },
  });

  if (!user || !isAdminAccount(user)) {
    res.status(403).json({ error: 'Área restrita à administração.', code: 'FEEDBACK_ADMIN_ONLY' });
    return;
  }

  next();
};

/** POST /api/feedback — qualquer um (visitante incluso) pode enviar. */
const create: AsyncRequestHandler = async (req, res) => {
  const body = createSchema.parse(req.body);

  let imageData: Uint8Array<ArrayBuffer> | undefined;
  let imageMime: string | undefined;

  if (body.image) {
    imageData = new Uint8Array(Buffer.from(body.image.data, 'base64'));

    if (imageData.byteLength === 0 || imageData.byteLength > FEEDBACK_IMAGE_MAX_BYTES) {
      res.status(400).json({ error: 'Print inválido.', code: 'FEEDBACK_IMAGE_INVALID' });
      return;
    }

    imageMime = body.image.mime;
  }

  const feedback = await prisma.feedback.create({
    data: {
      authorId: req.user?.id ?? null,
      category: body.category,
      title: body.title,
      content: body.content,
      imageData,
      imageMime,
    },
    select: { id: true },
  });

  res.status(201).json({ ok: true, id: feedback.id });
};

/** GET /api/feedback — lista completa para o painel admin. */
const list: AsyncRequestHandler = async (_req, res) => {
  const rows = await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { username: true } } },
  });

  res.json({
    feedbacks: rows.map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      content: row.content,
      hasImage: row.imageData !== null,
      author: row.author?.username ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
  });
};

/** GET /api/feedback/:id/image — print anexado, só para o admin. */
const image: AsyncRequestHandler = async (req, res) => {
  const id = idSchema.parse(req.params.id);

  const feedback = await prisma.feedback.findUnique({
    where: { id },
    select: { imageData: true, imageMime: true },
  });

  if (!feedback?.imageData) {
    res.status(404).json({ error: 'Print não encontrado.', code: 'FEEDBACK_NOT_FOUND' });
    return;
  }

  res.set('Content-Type', feedback.imageMime ?? 'image/png');
  res.set('Cache-Control', 'private, max-age=3600');
  res.send(Buffer.from(feedback.imageData));
};

/** DELETE /api/feedback/:id — "marcar como lido" exclui o feedback. */
const remove: AsyncRequestHandler = async (req, res) => {
  const id = idSchema.parse(req.params.id);

  try {
    await prisma.feedback.delete({ where: { id } });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      (error as { code?: string }).code === 'P2025'
    ) {
      res.status(404).json({ error: 'Feedback não encontrado.', code: 'FEEDBACK_NOT_FOUND' });
      return;
    }
    throw error;
  }

  res.json({ ok: true });
};

feedbackRouter.post('/', feedbackLimiter, asyncHandler(create));
feedbackRouter.get('/', requireAuth, asyncHandler(requireAdmin), asyncHandler(list));
feedbackRouter.get('/:id/image', requireAuth, asyncHandler(requireAdmin), asyncHandler(image));
feedbackRouter.delete('/:id', requireAuth, asyncHandler(requireAdmin), asyncHandler(remove));

export default feedbackRouter;
