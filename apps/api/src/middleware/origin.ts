import type { NextFunction, Request, Response } from 'express';
import { env } from '../env.js';

/**
 * Defesa CSRF de lastro: o cookie de sessão precisa de SameSite=None em
 * produção (GitHub Pages ↔ API em domínios distintos), e nesse modo o
 * navegador MANDA cookies em requisições disparadas por outros sites
 * (form POST cross-site). Origin/Referer fora da allowlist de CORS → 403.
 *
 * Requisição sem Origin E sem Referer (curl, app nativo, server-side)
 * passa — a autenticação segue protegendo o resto.
 */
export function checkOrigin(req: Request, res: Response, next: NextFunction): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const origin = req.headers.origin as string | undefined;
  const referer = req.headers.referer as string | undefined;

  if (!origin && !referer) {
    next();
    return;
  }

  let host: string | null = null;
  if (origin) {
    host = origin;
  } else if (referer) {
    try {
      host = new URL(referer).origin;
    } catch {
      host = null;
    }
  }

  if (host && env.corsOrigins.includes(host)) {
    next();
    return;
  }

  res.status(403).json({ error: 'Origem não permitida.', code: 'ORIGIN_FORBIDDEN' });
}
