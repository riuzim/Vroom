import { OAuth2Client } from 'google-auth-library';
import rateLimit from 'express-rate-limit';
import { Router } from 'express';
import { z } from 'zod';
import type { AsyncRequestHandler } from '../middleware/asyncHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { prisma } from '../lib/prisma.js';
import { env } from '../env.js';
import { isAdminAccount, isAdminEmail } from '@vroom/shared';
import {
  clearAuthCookie,
  dummyHash,
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
  // A suíte de testes dispara dezenas de registros/logins do mesmo IP.
  skip: () => env.isTest,
  message: {
    error: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
    code: 'RATE_LIMITED',
  },
});

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'O nome precisa ter ao menos 3 caracteres')
    .max(20, 'Máximo de 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e _'),
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z
    .string()
    .min(6, 'A senha precisa ter ao menos 6 caracteres')
    .max(72)
    // bcrypt ignora bytes além de 72 — validar em BYTES, não em caracteres,
    // senão senas multibyte UTF-8 são truncadas silenciosamente.
    .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, {
      message: 'A senha pode ter no máximo 72 bytes',
    }),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

const googleSchema = z.object({
  credential: z.string().min(10, 'Credencial do Google ausente'),
});

type DbUser = { id: number; username: string; email: string; googleId: string | null };

const publicUser = (user: DbUser) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  isAdmin: isAdminAccount(user),
});

/** Erro de constraint única do Prisma (e-mail/username/googleId em uso). */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002'
  );
}

const register: AsyncRequestHandler = async (req, res) => {
  const body = registerSchema.parse(req.body);

  // O email do dono NÃO pode virar conta local: admin é a conta
  // Google-vinculada com esse email — registrar aqui abriria disputa
  // de identidade. Mesma resposta 409 genérica do nome ocupado (sem
  // enumerar por que foi recusado).
  if (isAdminEmail(body.email)) {
    res
      .status(409)
      .json({ error: 'Nome de usuário ou email já registrado', code: 'REGISTER_TAKEN' });
    return;
  }

  // Mensagem ÚNICA para email e username: distinguir os dois casos
  // permitiria enumerar quais emails/nomes já têm conta.
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: body.email }, { username: body.username }] },
    select: { id: true },
  });

  if (existing) {
    res
      .status(409)
      .json({ error: 'Nome de usuário ou email já registrado', code: 'REGISTER_TAKEN' });
    return;
  }

  const passwordHash = await hashPassword(body.password);

  try {
    const user = await prisma.user.create({
      data: { username: body.username, email: body.email, passwordHash },
    });

    setAuthCookie(res, signToken(user.id));
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    // Registro concorrente passou da checagem acima: mesma resposta 409.
    if (isUniqueViolation(error)) {
      res
        .status(409)
        .json({ error: 'Nome de usuário ou email já registrado', code: 'REGISTER_TAKEN' });
      return;
    }
    throw error;
  }
};

const login: AsyncRequestHandler = async (req, res) => {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: body.email } });

  // Hash dummy quando o usuário não existe: bcrypt roda SEMPRE e o tempo
  // de resposta fica igual, fechando o oráculo de enumeração de emails.
  const ok = await verifyPassword(body.password, user?.passwordHash ?? dummyHash);

  if (!user || !ok) {
    res.status(401).json({ error: 'Email ou senha incorretos', code: 'INVALID_CREDENTIALS' });
    return;
  }

  setAuthCookie(res, signToken(user.id));
  res.json({ user: publicUser(user) });
};

/** Deriva um username válido a partir do email Google (local part). */
function baseUsernameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const cleaned = local
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 14)
    .toLowerCase();
  return cleaned.length >= 3 ? cleaned : 'piloto';
}

/** Garante username único com sufixo numérico curto. */
async function uniqueUsername(base: string): Promise<string> {
  let candidate = base.slice(0, 20);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const taken = await prisma.user.findUnique({ where: { username: candidate } });

    if (!taken) {
      return candidate;
    }

    candidate = `${base}${Math.floor(10 + Math.random() * 90)}`.slice(0, 20);
  }

  return `piloto${Date.now().toString(36).slice(-9)}`.slice(0, 20);
}

/**
 * Resolve a conta Vroom de um usuário Google autenticado.
 * 1) googleId já vinculado → entra.
 * 2) conta sem senha com o mesmo email → vincula (contas com senha são
 *    RECUSADAS: ver comentário anti pre-claim no ramo abaixo).
 * 3) nada ainda → cria conta sem senha (só Google).
 * Trata corridas (P2002) re-buscando pelo googleId.
 */
async function findOrCreateGoogleUser(sub: string, email: string): Promise<DbUser | null> {
  const byGoogleId = await prisma.user.findUnique({ where: { googleId: sub } });

  if (byGoogleId) {
    return byGoogleId;
  }

  const byEmail = await prisma.user.findUnique({ where: { email } });

  if (byEmail) {
    // Pre-claim takeover: uma conta local com senha neste email pode ter
    // sido criada por qualquer um (registro não verifica posse do email).
    // Vincular o Google a ela daria ao criador a sessão do dono real do
    // email — e, se for o email do admin, o painel inteiro. Exige-se um
    // fluxo explícito de vinculação (inexistente por enquanto): recusa.
    if (byEmail.passwordHash != null) {
      return null;
    }

    try {
      return await prisma.user.update({ where: { id: byEmail.id }, data: { googleId: sub } });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return prisma.user.findUnique({ where: { googleId: sub } });
      }
      throw error;
    }
  }

  const username = await uniqueUsername(baseUsernameFromEmail(email));

  try {
    return await prisma.user.create({
      data: { username, email, googleId: sub, passwordHash: null },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      const raced = await prisma.user.findUnique({ where: { googleId: sub } });
      if (raced) return raced;

      const racedEmail = await prisma.user.findUnique({ where: { email } });
      if (racedEmail) {
        // Mesma regra anti pre-claim do ramo principal (corrida de criação).
        if (racedEmail.passwordHash != null) {
          return null;
        }

        try {
          return await prisma.user.update({
            where: { id: racedEmail.id },
            data: { googleId: sub },
          });
        } catch {
          return prisma.user.findUnique({ where: { googleId: sub } });
        }
      }
    }
    throw error;
  }
}

/** POST /api/auth/google — troca o credential JWT do Google Identity Services. */
const googleLogin: AsyncRequestHandler = async (req, res) => {
  if (!env.GOOGLE_CLIENT_ID) {
    res.status(503).json({
      error: 'Login com Google não está configurado neste servidor.',
      code: 'GOOGLE_NOT_CONFIGURED',
    });
    return;
  }

  const body = googleSchema.parse(req.body);
  let payload;

  try {
    const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
    // verifyIdToken valida assinatura (certs do Google), audience e issuer.
    const ticket = await client.verifyIdToken({
      idToken: body.credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    res.status(401).json({
      error: 'Não foi possível validar seu login do Google.',
      code: 'GOOGLE_INVALID_TOKEN',
    });
    return;
  }

  if (!payload?.sub || !payload.email) {
    res.status(401).json({ error: 'Credencial do Google incompleta.', code: 'GOOGLE_INCOMPLETE' });
    return;
  }

  if (payload.email_verified !== true) {
    res
      .status(401)
      .json({ error: 'Seu email do Google não foi verificado.', code: 'GOOGLE_EMAIL_UNVERIFIED' });
    return;
  }

  const user = await findOrCreateGoogleUser(payload.sub, payload.email.toLowerCase());

  if (!user) {
    res.status(409).json({
      error: 'Não foi possível vincular sua conta do Google.',
      code: 'GOOGLE_LINK_FAILED',
    });
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
    // googleId só alimenta isAdminAccount; NÃO vai para a resposta.
    select: { id: true, username: true, email: true, createdAt: true, googleId: true },
  });

  res.json({
    user:
      user && {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        isAdmin: isAdminAccount(user),
      },
  });
};

authRouter.post('/register', authLimiter, asyncHandler(register));
authRouter.post('/login', authLimiter, asyncHandler(login));
authRouter.post('/google', authLimiter, asyncHandler(googleLogin));
authRouter.post('/logout', asyncHandler(logout));
authRouter.get('/me', optionalAuth, asyncHandler(me));

export default authRouter;
