import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getDailySalesHandler,
  getCurrentInventoryHandler,
  getTopProductsHandler,
} from '../controllers/report.controller';

export default async function reportsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/sales/daily', getDailySalesHandler);
  app.get('/inventory/current', getCurrentInventoryHandler);
  app.get('/top-products', getTopProductsHandler);
}