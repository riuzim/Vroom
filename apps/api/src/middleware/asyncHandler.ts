import type { NextFunction, Request, RequestHandler, Response } from 'express';

export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Express 4 não captura erros lançados em handlers async — este wrapper
 * encaminha a rejeição para o middleware de erros.
 */
export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
