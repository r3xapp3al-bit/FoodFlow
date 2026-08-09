import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from '../services/users.service';
import {
  CreateUserSchema,
  UpdateUserSchema,
  AssignRoleSchema,
  ListUsersQuerySchema,
} from '../schemas/users.schema';
import { z } from 'zod';

const usersService = new UsersService();

// Obtener el usuario autenticado de request.user (seteado por authMiddleware)
function getAuthUser(request: FastifyRequest) {
  return (request as any).user;
}

// ── Listar usuarios ───────────────────────────────────────
export async function listUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    // Solo admin o site_admin pueden listar usuarios
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para listar usuarios',
      });
    }

    // Parsear query params con Zod
    const query = ListUsersQuerySchema.parse(request.query);
    
    // Si es site_admin, solo ve usuarios de su site
    if (authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      query.site_id = authUser.site_id;
    }

    const result = await usersService.listUsers(query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos de consulta inválidos',
        details: err.issues,
      });
    }
    console.error('Error en listUsersHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al listar usuarios',
    });
  }
}

// ── Obtener usuario por ID ──────────────────────────────
export async function getUserHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    const userId = request.params.id;

    // Un usuario puede ver su propio perfil, admin ve todos
    if (authUser.id !== userId && !authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin')) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para ver este usuario',
      });
    }

    const user = await usersService.getUserById(userId);

    // Si es site_admin, solo puede ver usuarios de su site
    if (authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      if (user.site_id !== authUser.site_id) {
        return reply.status(403).send({
          success: false,
          error: 'No tienes permisos para ver este usuario',
        });
      }
    }

    return reply.send({ success: true, data: user });
  } catch (err: any) {
    console.error('Error en getUserHandler:', err);
    return reply.status(404).send({
      success: false,
      error: err.message || 'Usuario no encontrado',
    });
  }
}

// ── Crear usuario ────────────────────────────────────────
export async function createUserHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    // Solo super_admin o site_admin pueden crear usuarios
    if (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin')) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para crear usuarios',
      });
    }

    const data = CreateUserSchema.parse(request.body);

    // Si es site_admin, el usuario debe pertenecer a su site
    if (authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      if (data.site_id && data.site_id !== authUser.site_id) {
        return reply.status(403).send({
          success: false,
          error: 'No puedes crear usuarios fuera de tu sitio',
        });
      }
      data.site_id = authUser.site_id;
    }

    // No permitir crear super_admin desde este endpoint
    if (data.roles.includes('super_admin')) {
      return reply.status(403).send({
        success: false,
        error: 'No puedes crear un Super Administrador desde este endpoint',
      });
    }

    const user = await usersService.createUser(data);
    return reply.status(201).send({ success: true, data: user });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en createUserHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al crear usuario',
    });
  }
}

// ── Actualizar usuario ────────────────────────────────────
export async function updateUserHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    const userId = request.params.id;

    // Un usuario puede actualizar su propio perfil, admin puede actualizar todos
    if (authUser.id !== userId && !authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin')) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para actualizar este usuario',
      });
    }

    const data = UpdateUserSchema.parse(request.body);

    // Si es site_admin, no puede cambiar site_id de otro usuario
    if (authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      if (data.site_id && data.site_id !== authUser.site_id) {
        return reply.status(403).send({
          success: false,
          error: 'No puedes mover usuarios fuera de tu sitio',
        });
      }
    }

    const user = await usersService.updateUser(userId, data);
    return reply.send({ success: true, data: user });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en updateUserHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al actualizar usuario',
    });
  }
}

// ── Eliminar usuario ──────────────────────────────────────
export async function deleteUserHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);

    // Solo super_admin o site_admin pueden eliminar
    if (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin')) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para eliminar usuarios',
      });
    }

    const userId = request.params.id;

    // Un usuario no puede eliminarse a sí mismo
    if (authUser.id === userId) {
      return reply.status(400).send({
        success: false,
        error: 'No puedes eliminarte a ti mismo',
      });
    }

    // Si es site_admin, solo puede eliminar usuarios de su site
    if (authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      const user = await usersService.getUserById(userId);
      if (user.site_id !== authUser.site_id) {
        return reply.status(403).send({
          success: false,
          error: 'No puedes eliminar usuarios fuera de tu sitio',
        });
      }
    }

    const result = await usersService.deleteUser(userId);
    return reply.send(result); // ✅ Corregido: result ya incluye success y message
  } catch (err: any) {
    console.error('Error en deleteUserHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al eliminar usuario',
    });
  }
}

// ── Asignar rol a usuario ────────────────────────────────
export async function assignRoleHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);

    // Solo super_admin o site_admin pueden asignar roles
    if (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin')) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para asignar roles',
      });
    }

    const userId = request.params.id;
    const { role_id } = AssignRoleSchema.parse(request.body);

    // Si es site_admin, no puede asignar super_admin
    if (authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      if (role_id === 'super_admin') {
        return reply.status(403).send({
          success: false,
          error: 'No puedes asignar el rol Super Administrador',
        });
      }
    }

    const user = await usersService.assignRole(userId, role_id);
    return reply.send({ success: true, data: user });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en assignRoleHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al asignar rol',
    });
  }
}

// ── Quitar rol de usuario ────────────────────────────────
export async function removeRoleHandler(
  request: FastifyRequest<{ Params: { id: string; roleId: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);

    if (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin')) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para quitar roles',
      });
    }

    const userId = request.params.id;
    const roleId = request.params.roleId;

    // No permitir quitar super_admin a un site_admin
    if (authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      if (roleId === 'super_admin') {
        return reply.status(403).send({
          success: false,
          error: 'No puedes quitar el rol Super Administrador',
        });
      }
    }

    const user = await usersService.removeRole(userId, roleId);
    return reply.send({ success: true, data: user });
  } catch (err: any) {
    console.error('Error en removeRoleHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al quitar rol',
    });
  }
}
