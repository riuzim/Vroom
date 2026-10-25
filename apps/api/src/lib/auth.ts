import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../env.js';
export const AUTH_COOKIE = 'vroom_token';
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

/**
 * Hash fixo (senha inexistente) usado para igualar o tempo de resposta
 * do login quando o email NÃO existe — sem isso, quem mede o tempo
 * descobre quais emails têm conta (timing oracle).
 */
const DUMMY_HASH = bcrypt.hashSync('vroom-dummy-password', 10);

export const dummyHash = DUMMY_HASH;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: number): string {
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, {
    expiresIn: TOKEN_TTL_SECONDS,
  });
}

/**
 * SameSite efetivo do cookie de sessão. Em produção vem do env
 * (COOKIE_SAMESITE; default 'none' para o cenário GitHub Pages ↔ API remota
 * em domínio distinto). Em dev é sempre lax — o proxy do Vite é same-origin.
 */
function authCookieSameSite(): 'none' | 'lax' | 'strict' {
  return env.isProduction ? env.cookieSameSite : 'lax';
}

const authCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  path: '/',
} as const;

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE, token, {
    ...authCookieOptions,
    // SameSite=None exige Secure — navegadores bloqueiam None sem HTTPS.
    sameSite: authCookieSameSite(),
    maxAge: TOKEN_TTL_SECONDS * 1000,
  });
}

export function clearAuthCookie(res: Response): void {
  // clearCookie precisa das MESMAS flags para remover de fato o cookie.
  res.clearCookie(AUTH_COOKIE, {
    ...authCookieOptions,
    sameSite: authCookieSameSite(),
  });
}

/** Decodifica o cookie de autenticação se presente; nunca rejeita. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE] as string | undefined;

  if (!token) {
    next();
    return;
  }

  try {
    // Pin explícito do algoritmo: sem isso o atacante pode mandar
    // um token HS256/RS256/none manipulado (confusion attack).
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });

    if (payload && typeof payload === 'object' && typeof payload.sub === 'string') {
      // Nome/email ficam vazios aqui: as rotas que precisam recarregam do banco.
      req.user = { id: Number(payload.sub), username: '', email: '' };
    }
  } catch {
    // token inválido/expirado: segue como visitante
  }

  next();
}

/** Bloqueia a rota quando não há usuário autenticado. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res
      .status(401)
      .json({ error: 'Você precisa entrar para fazer isso.', code: 'NOT_AUTHENTICATED' });
    return;
  }
  next();
}
