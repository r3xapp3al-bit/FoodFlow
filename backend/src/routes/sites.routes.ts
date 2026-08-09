import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listSitesHandler,
  getSiteHandler,
  createSiteHandler,
  updateSiteHandler,
  deleteSiteHandler,
  listBranchesHandler,
  getBranchHandler,
  createBranchHandler,
  updateBranchHandler,
  deleteBranchHandler,
} from '../controllers/sites.controller';

export default async function sitesRoutes(app: FastifyInstance) {
  // Todas las rutas requieren autenticación
  app.addHook('preHandler', authMiddleware);

  // ── SITES ──────────────────────────────────────────────────────────

  app.get('/sites', listSitesHandler);
  app.get('/sites/:id', getSiteHandler);
  app.post('/sites', createSiteHandler);
  app.put('/sites/:id', updateSiteHandler);
  app.delete('/sites/:id', deleteSiteHandler);

  // ── BRANCHES ──────────────────────────────────────────────────────

  app.get('/branches', listBranchesHandler);
  app.get('/branches/:id', getBranchHandler);
  app.post('/branches', createBranchHandler);
  app.put('/branches/:id', updateBranchHandler);
  app.delete('/branches/:id', deleteBranchHandler);
}