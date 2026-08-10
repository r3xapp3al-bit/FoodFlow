import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listSuppliesHandler,
  getSupplyHandler,
  createSupplyHandler,
  updateSupplyHandler,
  deleteSupplyHandler,
} from '../controllers/supply.controller';

export default async function suppliesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/', listSuppliesHandler);
  app.get('/:id', getSupplyHandler);
  app.post('/', createSupplyHandler);
  app.put('/:id', updateSupplyHandler);
  app.delete('/:id', deleteSupplyHandler);
}