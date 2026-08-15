import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listPaymentsHandler,
  getPaymentHandler,
  createPaymentHandler,
  updatePaymentHandler,
  confirmPaymentHandler,
  rejectPaymentHandler,
} from '../controllers/payment.controller';

export default async function paymentsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/', listPaymentsHandler);
  app.get('/:id', getPaymentHandler);
  app.post('/', createPaymentHandler);
  app.put('/:id', updatePaymentHandler);
  app.patch('/:id/confirm', confirmPaymentHandler);
  app.patch('/:id/reject', rejectPaymentHandler);
}