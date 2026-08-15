import { FastifyRequest, FastifyReply } from 'fastify';
import { WastageService } from '../services/wastage.service';
import { CreateWastageSchema, ListWastagesQuerySchema } from '../schemas/wastages.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const wastageService = new WastageService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

export async function listWastagesHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const query = ListWastagesQuerySchema.parse(request.query);
    const result = await wastageService.listWastages(query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en listWastagesHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al listar mermas' });
  }
}

export async function getWastageHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const wastage = await wastageService.getWastageById(request.params.id);
    return reply.send({ success: true, data: wastage });
  } catch (err: any) {
    console.error('Error en getWastageHandler:', err);
    return reply.status(404).send({ success: false, error: err.message || 'Merma no encontrada' });
  }
}

export async function createWastageHandler(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = CreateWastageSchema.parse(request.body);
    const wastage = await wastageService.createWastage({
      ...data,
      registered_by: authUser.id,
    });
    return reply.status(201).send({ success: true, data: wastage });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en createWastageHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al crear merma' });
  }
}