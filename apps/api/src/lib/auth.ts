import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../env.js';export const AUTH_COOKIE = 'vroom_token';
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

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    maxAge: TOKEN_TTL_SECONDS * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE, { path: '/' });
}

/** Decodifica o cookie de autenticação se presente; nunca rejeita. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[AUTH_COOKIE] as string | undefined;

  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

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
    res.status(401).json({ error: 'Você precisa entrar para fazer isso.' });
    return;
  }
  next();
}
