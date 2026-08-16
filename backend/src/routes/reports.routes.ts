import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  getDailySalesHandler,
  getSalesByPeriodHandler,
  getCurrentInventoryHandler,
  getLowStockProductsHandler,
  getTopProductsHandler,
  exportSalesReportHandler,
} from '../controllers/report.controller';

export default async function reportsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/sales/daily', getDailySalesHandler);
  app.get('/sales/period', getSalesByPeriodHandler);
  app.get('/inventory/current', getCurrentInventoryHandler);
  app.get('/inventory/low-stock', getLowStockProductsHandler);
  app.get('/top-products', getTopProductsHandler);
  app.get('/export/sales', exportSalesReportHandler);
}