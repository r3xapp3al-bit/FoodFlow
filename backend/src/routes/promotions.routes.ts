import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listPromotionsHandler,
  getPromotionHandler,
  createPromotionHandler,
  updatePromotionHandler,
  deletePromotionHandler,
  useCouponHandler,
  getCouponUsageHandler,
} from '../controllers/promotion.controller';

export default async function promotionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  // ── Promotions ──
  app.get('/', listPromotionsHandler);
  app.get('/:id', getPromotionHandler);
  app.post('/', createPromotionHandler);
  app.put('/:id', updatePromotionHandler);
  app.delete('/:id', deletePromotionHandler);

  // ── Coupon Usage ──
  app.post('/use', useCouponHandler);
  app.get('/:promotionId/usage', getCouponUsageHandler);
}