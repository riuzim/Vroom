import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export const notFoundHandler: RequestHandler = (req, res) => {
  // Mensagem genérica: não reflete a URL de volta (evita fingerprint
  // e ecos de input do usuário). O detalhe fica só no log do servidor.
  console.warn(`[api] rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Rota não encontrada' });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  // Resposta já começou? Delega ao handler padrão do Express.
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Dados inválidos',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  // body-parser sinaliza JSON malformado/payload grande com status 400 —
  // respeitar error.status evita transformar erro de cliente em 500 ruidoso.
  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    res.status(400).json({ error: 'Requisição inválida: JSON malformado.' });
    return;
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      res.status(status).json({ error: 'Requisição inválida.' });
      return;
    }
  }

  console.error('[api] erro não tratado:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
};
