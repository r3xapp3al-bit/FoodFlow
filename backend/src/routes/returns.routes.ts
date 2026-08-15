import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listReturnsHandler,
  getReturnHandler,
  createReturnHandler,
  updateReturnHandler,
  approveReturnHandler,
  rejectReturnHandler,
  completeReturnHandler,
} from '../controllers/return.controller';

export default async function returnsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/', listReturnsHandler);
  app.get('/:id', getReturnHandler);
  app.post('/', createReturnHandler);
  app.put('/:id', updateReturnHandler);
  app.patch('/:id/approve', approveReturnHandler);
  app.patch('/:id/reject', rejectReturnHandler);
  app.patch('/:id/complete', completeReturnHandler);
}