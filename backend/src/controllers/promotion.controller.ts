import { FastifyRequest, FastifyReply } from 'fastify';
import { PromotionService } from '../services/promotion.service';
import {
  CreatePromotionSchema,
  UpdatePromotionSchema,
  ListPromotionsQuerySchema,
  UseCouponSchema,
} from '../schemas/promotions.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const promotionService = new PromotionService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

export async function listPromotionsHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para listar promociones',
      });
    }

    const query = ListPromotionsQuerySchema.parse(request.query);
    const result = await promotionService.listPromotions(authUser.site_id, query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos de consulta inválidos',
        details: err.issues,
      });
    }
    console.error('Error en listPromotionsHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al listar promociones',
    });
  }
}

export async function getPromotionHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para ver esta promoción',
      });
    }

    const promotion = await promotionService.getPromotionById(request.params.id);
    return reply.send({ success: true, data: promotion });
  } catch (err: any) {
    console.error('Error en getPromotionHandler:', err);
    return reply.status(404).send({
      success: false,
      error: err.message || 'Promoción no encontrada',
    });
  }
}

export async function createPromotionHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para crear promociones',
      });
    }

    const data = CreatePromotionSchema.parse(request.body);
    const promotion = await promotionService.createPromotion({
      ...data,
      site_id: authUser.site_id,
    });
    return reply.status(201).send({ success: true, data: promotion });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en createPromotionHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al crear promoción',
    });
  }
}

export async function updatePromotionHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para actualizar esta promoción',
      });
    }

    const data = UpdatePromotionSchema.parse(request.body);
    const promotion = await promotionService.updatePromotion(request.params.id, data);
    return reply.send({ success: true, data: promotion });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en updatePromotionHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al actualizar promoción',
    });
  }
}

export async function deletePromotionHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para eliminar esta promoción',
      });
    }

    const result = await promotionService.deletePromotion(request.params.id);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deletePromotionHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al eliminar promoción',
    });
  }
}

// ── Coupon Usage ──────────────────────────────────
export async function useCouponHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para usar cupones',
      });
    }

    const data = UseCouponSchema.parse(request.body);
    const result = await promotionService.useCoupon(data);
    // ✅ Corregido: result ya contiene { success, message }, no duplicamos "success"
    return reply.send(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en useCouponHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al aplicar cupón',
    });
  }
}

export async function getCouponUsageHandler(
  request: FastifyRequest<{ Params: { promotionId: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para ver usos de cupones',
      });
    }

    const usage = await promotionService.getCouponUsageByPromotion(request.params.promotionId);
    return reply.send({ success: true, data: usage });
  } catch (err: any) {
    console.error('Error en getCouponUsageHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al obtener usos del cupón',
    });
  }
}