import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listOrdersHandler,
  getOrderHandler,
  createOrderHandler,
  updateOrderHandler,
  deleteOrderHandler,
  createPaymentHandler,
  confirmPaymentHandler,
} from '../controllers/order.controller';

export default async function ordersRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  // ── Orders ──
  app.get('/', listOrdersHandler);
  app.get('/:id', getOrderHandler);
  app.post('/', createOrderHandler);
  app.put('/:id', updateOrderHandler);
  app.delete('/:id', deleteOrderHandler);

  // ── Payments (anidados) ──
  app.post('/:orderId/payments', createPaymentHandler);
  app.put('/payments/:paymentId/confirm', confirmPaymentHandler);
}