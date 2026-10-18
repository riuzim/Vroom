import { Router } from 'express';
import type { AsyncRequestHandler } from '../middleware/asyncHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { prisma } from '../lib/prisma.js';

const carsRouter = Router();

/**
 * GET /api/cars/:id/image — serve os bytes da imagem direto do banco.
 *
 * As imagens vivem no SQLite (BLOB): zero dependência de imgur/Wikimedia
 * em runtime. A seed é quem baixa os bytes originais (uma vez, do Commons)
 * e grava junto com a atribuição de licença.
 *
 * Bytes por id nunca mudam após o seed → cache agressivo + ETag barato
 * (tamanho do BLOB), com 304 para revalidações.
 */
const carImage: AsyncRequestHandler = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(404).json({ error: 'Carro não encontrado' });
    return;
  }

  const car = await prisma.car.findUnique({
    where: { id },
    select: { imageMime: true, imageData: true },
  });

  if (!car?.imageData) {
    res.status(404).json({ error: 'Imagem não encontrada' });
    return;
  }

  const bytes = Buffer.from(car.imageData);
  const etag = `W/"car-${id}-${bytes.byteLength}"`;

  if (req.headers['if-none-match'] === etag) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.status(304).end();
    return;
  }

  res
    .set('Content-Type', car.imageMime || 'image/jpeg')
    .set('Cache-Control', 'public, max-age=31536000, immutable')
    .set('ETag', etag)
    .send(bytes);
};

carsRouter.get('/:id/image', asyncHandler(carImage));

export default carsRouter;
