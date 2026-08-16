import { FastifyRequest, FastifyReply } from 'fastify';
import { LoyaltyService } from '../services/loyalty.service';
import { AddPointsSchema, RedeemPointsSchema, ListLoyaltyQuerySchema } from '../schemas/loyalty.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const loyaltyService = new LoyaltyService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

export async function getLoyaltyByCustomerHandler(
  request: FastifyRequest<{ Params: { customerId: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const loyalty = await loyaltyService.getLoyaltyByCustomer(request.params.customerId);
    return reply.send({ success: true, data: loyalty });
  } catch (err: any) {
    console.error('Error en getLoyaltyByCustomerHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al obtener puntos' });
  }
}

export async function getPointHistoryHandler(
  request: FastifyRequest<{ Params: { customerId: string }; Querystring: { limit?: string; offset?: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const query = ListLoyaltyQuerySchema.parse(request.query);
    const history = await loyaltyService.getPointHistory(
      request.params.customerId,
      query.limit,
      query.offset
    );
    return reply.send({ success: true, ...history });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos de consulta inválidos', details: err.issues });
    }
    console.error('Error en getPointHistoryHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al obtener historial' });
  }
}

export async function addPointsHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = AddPointsSchema.parse(request.body);
    const result = await loyaltyService.addPoints({
      customer_id: data.customer_id,
      points: data.points,
      concept: data.concept,
      reference_id: data.reference_id,
    });
    return reply.status(201).send({ success: true, data: result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en addPointsHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al agregar puntos' });
  }
}

export async function redeemPointsHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = RedeemPointsSchema.parse(request.body);
    const result = await loyaltyService.redeemPoints({
      customer_id: data.customer_id,
      points: data.points,
      concept: data.concept,
      reference_id: data.reference_id,
    });
    return reply.send({ success: true, data: result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en redeemPointsHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al canjear puntos' });
  }
}