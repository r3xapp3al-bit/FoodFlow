import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listConfigsHandler,
  getConfigHandler,
  createConfigHandler,
  updateConfigHandler,
  deleteConfigHandler,
  listBranchConfigsHandler,
  getBranchConfigHandler,
  createBranchConfigHandler,
  updateBranchConfigHandler,
  deleteBranchConfigHandler,
} from '../controllers/config.controller';

export default async function configRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  // Site config
  app.get('/config', listConfigsHandler);
  app.get('/config/:id', getConfigHandler);
  app.post('/config', createConfigHandler);
  app.put('/config/:id', updateConfigHandler);
  app.delete('/config/:id', deleteConfigHandler);

  // Branch config
  app.get('/branch-config', listBranchConfigsHandler);
  app.get('/branch-config/:id', getBranchConfigHandler);
  app.post('/branch-config', createBranchConfigHandler);
  app.put('/branch-config/:id', updateBranchConfigHandler);
  app.delete('/branch-config/:id', deleteBranchConfigHandler);
}