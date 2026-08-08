import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getProfileHandler } from '../controllers/auth.controller';

export default async function authRoutes(app: FastifyInstance) {
  // Ruta protegida: obtener perfil del usuario autenticado
  app.get('/auth/me', { preHandler: authMiddleware }, getProfileHandler);
}