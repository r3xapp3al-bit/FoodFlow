import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigService } from '../services/config.service';
import {
  CreateConfigSchema,
  UpdateConfigSchema,
  ListConfigQuerySchema,
  CreateBranchConfigSchema,
  UpdateBranchConfigSchema,
  ListBranchConfigQuerySchema,
} from '../schemas/config.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const configService = new ConfigService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

// ─── Site Config ──────────────────────────────────────
export async function listConfigsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const query = ListConfigQuerySchema.parse(request.query);
    // Si es site_admin, solo ve configuraciones de su site
    if (authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      query.site_id = authUser.site_id;
    }

    const result = await configService.listConfigs(query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en listConfigsHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al listar configuraciones' });
  }
}

export async function getConfigHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const config = await configService.getConfigById(request.params.id);
    return reply.send({ success: true, data: config });
  } catch (err: any) {
    console.error('Error en getConfigHandler:', err);
    return reply.status(404).send({ success: false, error: err.message || 'Configuración no encontrada' });
  }
}

export async function createConfigHandler(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = CreateConfigSchema.parse(request.body);
    // Validar que el site_id sea el del usuario (si es site_admin)
    if (authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      if (data.site_id !== authUser.site_id) {
        return reply.status(403).send({ success: false, error: 'No puedes crear configuraciones para otro sitio' });
      }
    }

    const config = await configService.createConfig(data);
    return reply.status(201).send({ success: true, data: config });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en createConfigHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al crear configuración' });
  }
}

export async function updateConfigHandler(request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = UpdateConfigSchema.parse(request.body);
    const config = await configService.updateConfig(request.params.id, data);
    return reply.send({ success: true, data: config });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en updateConfigHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al actualizar configuración' });
  }
}

export async function deleteConfigHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const result = await configService.deleteConfig(request.params.id);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteConfigHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al eliminar configuración' });
  }
}

// ─── Branch Config ──────────────────────────────────────
export async function listBranchConfigsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const query = ListBranchConfigQuerySchema.parse(request.query);
    // Si es branch_manager, solo ve configuraciones de su branch (si está asociado)
    if (authUser.roles.includes('branch_manager') && !authUser.roles.includes('site_admin')) {
      query.branch_id = authUser.branch_id;
    }

    const result = await configService.listBranchConfigs(query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en listBranchConfigsHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al listar configuraciones de sucursal' });
  }
}

export async function getBranchConfigHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const config = await configService.getBranchConfigById(request.params.id);
    return reply.send({ success: true, data: config });
  } catch (err: any) {
    console.error('Error en getBranchConfigHandler:', err);
    return reply.status(404).send({ success: false, error: err.message || 'Configuración de sucursal no encontrada' });
  }
}

export async function createBranchConfigHandler(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = CreateBranchConfigSchema.parse(request.body);
    // Validar que el branch_id pertenece al site del usuario (opcional)
    // Podríamos verificar pero simplificamos

    const config = await configService.createBranchConfig(data);
    return reply.status(201).send({ success: true, data: config });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en createBranchConfigHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al crear configuración de sucursal' });
  }
}

export async function updateBranchConfigHandler(request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = UpdateBranchConfigSchema.parse(request.body);
    const config = await configService.updateBranchConfig(request.params.id, data);
    return reply.send({ success: true, data: config });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en updateBranchConfigHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al actualizar configuración de sucursal' });
  }
}

export async function deleteBranchConfigHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const result = await configService.deleteBranchConfig(request.params.id);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteBranchConfigHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al eliminar configuración de sucursal' });
  }
}