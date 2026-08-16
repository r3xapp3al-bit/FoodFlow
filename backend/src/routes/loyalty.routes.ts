import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getLoyaltyByCustomerHandler,
  getPointHistoryHandler,
  addPointsHandler,
  redeemPointsHandler,
} from '../controllers/loyalty.controller';

export default async function loyaltyRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/customers/:customerId/loyalty', getLoyaltyByCustomerHandler);
  app.get('/customers/:customerId/loyalty/history', getPointHistoryHandler);
  app.post('/loyalty/add-points', addPointsHandler);
  app.post('/loyalty/redeem-points', redeemPointsHandler);
}