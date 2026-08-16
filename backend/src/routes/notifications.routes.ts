import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listNotificationsHandler,
  getNotificationHandler,
  createNotificationHandler,
  updateNotificationHandler,
  markAsReadHandler,
  deleteNotificationHandler,
} from '../controllers/notification.controller';

export default async function notificationsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  app.get('/', listNotificationsHandler);
  app.get('/:id', getNotificationHandler);
  app.post('/', createNotificationHandler);
  app.put('/:id', updateNotificationHandler);
  app.patch('/:id/read', markAsReadHandler);
  app.delete('/:id', deleteNotificationHandler);
}