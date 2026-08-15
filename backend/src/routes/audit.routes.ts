import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import { listAuditLogsHandler } from '../controllers/audit.controller';

export default async function auditRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/', listAuditLogsHandler);
}