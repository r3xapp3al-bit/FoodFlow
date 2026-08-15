import { FastifyRequest, FastifyReply } from 'fastify';
import { ReturnService } from '../services/return.service';
import { CreateReturnSchema, UpdateReturnSchema, ListReturnsQuerySchema } from '../schemas/returns.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const returnService = new ReturnService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

export async function listReturnsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const query = ListReturnsQuerySchema.parse(request.query);
    const result = await returnService.listReturns(query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en listReturnsHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al listar devoluciones' });
  }
}

export async function getReturnHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const ret = await returnService.getReturnById(request.params.id);
    return reply.send({ success: true, data: ret });
  } catch (err: any) {
    console.error('Error en getReturnHandler:', err);
    return reply.status(404).send({ success: false, error: err.message || 'Devolución no encontrada' });
  }
}

export async function createReturnHandler(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = CreateReturnSchema.parse(request.body);
    const ret = await returnService.createReturn(data);
    return reply.status(201).send({ success: true, data: ret });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en createReturnHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al crear devolución' });
  }
}

export async function updateReturnHandler(request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = UpdateReturnSchema.parse(request.body);
    const ret = await returnService.updateReturn(request.params.id, data);
    return reply.send({ success: true, data: ret });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en updateReturnHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al actualizar devolución' });
  }
}

export async function approveReturnHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const ret = await returnService.approveReturn(request.params.id);
    return reply.send({ success: true, data: ret });
  } catch (err: any) {
    console.error('Error en approveReturnHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al aprobar devolución' });
  }
}

export async function rejectReturnHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const ret = await returnService.rejectReturn(request.params.id);
    return reply.send({ success: true, data: ret });
  } catch (err: any) {
    console.error('Error en rejectReturnHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al rechazar devolución' });
  }
}

export async function completeReturnHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const ret = await returnService.completeReturn(request.params.id);
    return reply.send({ success: true, data: ret });
  } catch (err: any) {
    console.error('Error en completeReturnHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al completar devolución' });
  }
}