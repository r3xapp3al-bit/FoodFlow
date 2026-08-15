import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listWastagesHandler,
  getWastageHandler,
  createWastageHandler,
} from '../controllers/wastage.controller';

export default async function wastagesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/', listWastagesHandler);
  app.get('/:id', getWastageHandler);
  app.post('/', createWastageHandler);
  // No se permiten actualizaciones ni eliminaciones de mermas (solo registro)
}