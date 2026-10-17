import rateLimit from 'express-rate-limit';
import { Router } from 'express';
import { z } from 'zod';
import type { AsyncRequestHandler } from '../middleware/asyncHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { prisma } from '../lib/prisma.js';
import {
  clearAuthCookie,
  hashPassword,
  optionalAuth,
  setAuthCookie,
  signToken,
  verifyPassword,
} from '../lib/auth.js';

const authRouter = Router();

/** Limite de tentativas nas rotas de autenticação (anti brute-force). */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' },
});

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'O nome precisa ter ao menos 3 caracteres')
    .max(20, 'Máximo de 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e _'),
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres').max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

const publicUser = (user: { id: number; username: string; email: string }) => ({
  id: user.id,
  username: user.username,
  email: user.email,
});

const register: AsyncRequestHandler = async (req, res) => {
  const body = registerSchema.parse(req.body);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: body.email }, { username: body.username }] },
    select: { email: true, username: true },
  });

  if (existing) {
    const field = existing.email === body.email ? 'email' : 'username';
    res.status(409).json({ error: field === 'email' ? 'Email já registrado' : 'Nome de usuário já em uso' });
    return;
  }

  const passwordHash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: { username: body.username, email: body.email, passwordHash },
  });

  setAuthCookie(res, signToken(user.id));
  res.status(201).json({ user: publicUser(user) });
};

const login: AsyncRequestHandler = async (req, res) => {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: body.email } });

  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    res.status(401).json({ error: 'Email ou senha incorretos' });
    return;
  }

  setAuthCookie(res, signToken(user.id));
  res.json({ user: publicUser(user) });
};

const logout: AsyncRequestHandler = async (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
};

const me: AsyncRequestHandler = async (req, res) => {
  if (!req.user) {
    res.json({ user: null });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, username: true, email: true, createdAt: true },
  });

  res.json({ user });
};

authRouter.post('/register', authLimiter, asyncHandler(register));
authRouter.post('/login', authLimiter, asyncHandler(login));
authRouter.post('/logout', asyncHandler(logout));
authRouter.get('/me', optionalAuth, asyncHandler(me));

export default authRouter;
