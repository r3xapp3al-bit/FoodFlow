import { FastifyRequest, FastifyReply } from 'fastify';
import { PermissionService } from '../services/permission.service';
import {
  CreateRoleSchema,
  UpdateRoleSchema,
  ListRolesQuerySchema,
  CreatePermissionSchema,
  UpdatePermissionSchema,
  AssignPermissionSchema,
} from '../schemas/permission.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const permissionService = new PermissionService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

// ─── Roles ──────────────────────────────────────────
export async function listRolesHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede listar roles' });
    }

    const query = ListRolesQuerySchema.parse(request.query);
    const result = await permissionService.listRoles(query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en listRolesHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al listar roles' });
  }
}

export async function getRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede ver roles' });
    }

    const role = await permissionService.getRoleById(request.params.id);
    const permissions = await permissionService.getRolePermissions(request.params.id);
    return reply.send({ success: true, data: { ...role, permissions } });
  } catch (err: any) {
    console.error('Error en getRoleHandler:', err);
    return reply.status(404).send({ success: false, error: err.message || 'Rol no encontrado' });
  }
}

export async function createRoleHandler(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede crear roles' });
    }

    const data = CreateRoleSchema.parse(request.body);
    const role = await permissionService.createRole(data);
    return reply.status(201).send({ success: true, data: role });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en createRoleHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al crear rol' });
  }
}

export async function updateRoleHandler(request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede actualizar roles' });
    }

    const data = UpdateRoleSchema.parse(request.body);
    const role = await permissionService.updateRole(request.params.id, data);
    return reply.send({ success: true, data: role });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en updateRoleHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al actualizar rol' });
  }
}

export async function deleteRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede eliminar roles' });
    }

    const result = await permissionService.deleteRole(request.params.id);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteRoleHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al eliminar rol' });
  }
}

// ─── Permisos ──────────────────────────────────────
export async function listPermissionsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede listar permisos' });
    }

    const permissions = await permissionService.listPermissions();
    return reply.send({ success: true, data: permissions });
  } catch (err: any) {
    console.error('Error en listPermissionsHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al listar permisos' });
  }
}

export async function getPermissionHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede ver permisos' });
    }

    const permission = await permissionService.getPermissionById(request.params.id);
    return reply.send({ success: true, data: permission });
  } catch (err: any) {
    console.error('Error en getPermissionHandler:', err);
    return reply.status(404).send({ success: false, error: err.message || 'Permiso no encontrado' });
  }
}

export async function createPermissionHandler(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede crear permisos' });
    }

    const data = CreatePermissionSchema.parse(request.body);
    const permission = await permissionService.createPermission(data);
    return reply.status(201).send({ success: true, data: permission });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en createPermissionHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al crear permiso' });
  }
}

export async function updatePermissionHandler(request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede actualizar permisos' });
    }

    const data = UpdatePermissionSchema.parse(request.body);
    const permission = await permissionService.updatePermission(request.params.id, data);
    return reply.send({ success: true, data: permission });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en updatePermissionHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al actualizar permiso' });
  }
}

export async function deletePermissionHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede eliminar permisos' });
    }

    const result = await permissionService.deletePermission(request.params.id);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deletePermissionHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al eliminar permiso' });
  }
}

// ─── Asignar permisos a roles ──────────────────────
export async function assignPermissionToRoleHandler(request: FastifyRequest<{ Params: { roleId: string }; Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede asignar permisos' });
    }

    const { permission_id } = AssignPermissionSchema.parse(request.body);
    const result = await permissionService.assignPermissionToRole(request.params.roleId, permission_id);
    return reply.send(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en assignPermissionToRoleHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al asignar permiso' });
  }
}

export async function removePermissionFromRoleHandler(request: FastifyRequest<{ Params: { roleId: string; permissionId: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede quitar permisos' });
    }

    const result = await permissionService.removePermissionFromRole(request.params.roleId, request.params.permissionId);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en removePermissionFromRoleHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al quitar permiso' });
  }
}