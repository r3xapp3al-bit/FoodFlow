import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  listRolesHandler,
  getRoleHandler,
  createRoleHandler,
  updateRoleHandler,
  deleteRoleHandler,
  listPermissionsHandler,
  getPermissionHandler,
  createPermissionHandler,
  updatePermissionHandler,
  deletePermissionHandler,
  assignPermissionToRoleHandler,
  removePermissionFromRoleHandler,
} from '../controllers/permission.controller';

export default async function permissionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authMiddleware);

  // Roles
  app.get('/roles', listRolesHandler);
  app.get('/roles/:id', getRoleHandler);
  app.post('/roles', createRoleHandler);
  app.put('/roles/:id', updateRoleHandler);
  app.delete('/roles/:id', deleteRoleHandler);

  // Permisos
  app.get('/permissions', listPermissionsHandler);
  app.get('/permissions/:id', getPermissionHandler);
  app.post('/permissions', createPermissionHandler);
  app.put('/permissions/:id', updatePermissionHandler);
  app.delete('/permissions/:id', deletePermissionHandler);

  // Asignar permisos a roles
  app.post('/roles/:roleId/permissions', assignPermissionToRoleHandler);
  app.delete('/roles/:roleId/permissions/:permissionId', removePermissionFromRoleHandler);
}