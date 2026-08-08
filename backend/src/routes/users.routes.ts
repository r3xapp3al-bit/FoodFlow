import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listUsersHandler,
  getUserHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  assignRoleHandler,
  removeRoleHandler,
} from '../controllers/users.controller';

export default async function usersRoutes(app: FastifyInstance) {
  // Todas las rutas de usuarios requieren autenticación
  app.addHook('preHandler', authMiddleware);

  // GET /users - Listar usuarios
  app.get('/users', listUsersHandler);

  // GET /users/:id - Obtener usuario
  app.get('/users/:id', getUserHandler);

  // POST /users - Crear usuario
  app.post('/users', createUserHandler);

  // PUT /users/:id - Actualizar usuario
  app.put('/users/:id', updateUserHandler);

  // DELETE /users/:id - Eliminar usuario
  app.delete('/users/:id', deleteUserHandler);

  // POST /users/:id/roles - Asignar rol
  app.post('/users/:id/roles', assignRoleHandler);

  // DELETE /users/:id/roles/:roleId - Quitar rol
  app.delete('/users/:id/roles/:roleId', removeRoleHandler);
}