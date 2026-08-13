import { FastifyRequest, FastifyReply } from 'fastify';
import { OrderService } from '../services/order.service';
import {
  CreateOrderSchema,
  UpdateOrderSchema,
  ListOrdersQuerySchema,
  CreatePaymentSchema,
} from '../schemas/orders.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const orderService = new OrderService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

// ── Orders ──────────────────────────────────────────
export async function listOrdersHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para listar órdenes',
      });
    }

    const query = ListOrdersQuerySchema.parse(request.query);
    const result = await orderService.listOrders(authUser.site_id, query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos de consulta inválidos',
        details: err.issues,
      });
    }
    console.error('Error en listOrdersHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al listar órdenes',
    });
  }
}

export async function getOrderHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para ver esta orden',
      });
    }

    const order = await orderService.getOrderById(request.params.id);
    return reply.send({ success: true, data: order });
  } catch (err: any) {
    console.error('Error en getOrderHandler:', err);
    return reply.status(404).send({
      success: false,
      error: err.message || 'Orden no encontrada',
    });
  }
}

export async function createOrderHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para crear órdenes',
      });
    }

    const data = CreateOrderSchema.parse(request.body);
    const order = await orderService.createOrder({
      ...data,
      site_id: authUser.site_id,
    });
    return reply.status(201).send({ success: true, data: order });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en createOrderHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al crear orden',
    });
  }
}

export async function updateOrderHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para actualizar esta orden',
      });
    }

    const data = UpdateOrderSchema.parse(request.body);
    const order = await orderService.updateOrder(request.params.id, data);
    return reply.send({ success: true, data: order });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en updateOrderHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al actualizar orden',
    });
  }
}

export async function deleteOrderHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para eliminar esta orden',
      });
    }

    const result = await orderService.deleteOrder(request.params.id);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteOrderHandler:', err);
    
    // ✅ Manejar errores específicos de validación
    if (err.message && (
      err.message.includes('No se puede eliminar la orden porque tiene') ||
      err.message.includes('items asociados') ||
      err.message.includes('pagos asociados')
    )) {
      return reply.status(400).send({
        success: false,
        error: err.message,
      });
    }
    
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al eliminar orden',
    });
  }
}

// ── Payments ──────────────────────────────────────────
export async function createPaymentHandler(
  request: FastifyRequest<{ Params: { orderId: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para registrar pagos',
      });
    }

    // ✅ Evitar spread sobre null/undefined
    const body = request.body || {};
    const data = CreatePaymentSchema.parse({
      ...body,
      order_id: request.params.orderId,
    });
    const payment = await orderService.createPayment(data);
    return reply.status(201).send({ success: true, data: payment });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en createPaymentHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al registrar pago',
    });
  }
}

export async function confirmPaymentHandler(
  request: FastifyRequest<{ Params: { paymentId: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({
        success: false,
        error: 'No tienes permisos para confirmar pagos',
      });
    }

    const payment = await orderService.confirmPayment(request.params.paymentId, authUser.id);
    return reply.send({ success: true, data: payment });
  } catch (err: any) {
    console.error('Error en confirmPaymentHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al confirmar pago',
    });
  }
}