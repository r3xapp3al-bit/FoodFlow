import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listInventoryHandler,
  updateInventoryHandler,
  listBatchesHandler,
  getBatchHandler,
  createBatchHandler,
  updateBatchHandler,
  deleteBatchHandler,
  listMovementsHandler,
  createMovementHandler,
} from '../controllers/inventory.controller';

export default async function inventoryRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  // ── Inventory ──
  app.get('/inventory', listInventoryHandler);
  app.put('/inventory/:insumoId/:branchId', updateInventoryHandler);

  // ── Batches ──
  app.get('/batches', listBatchesHandler);
  app.get('/batches/:id', getBatchHandler);
  app.post('/batches', createBatchHandler);
  app.put('/batches/:id', updateBatchHandler);
  app.delete('/batches/:id', deleteBatchHandler);

  // ── Movements ──
  app.get('/movements', listMovementsHandler);
  app.post('/movements', createMovementHandler);
}