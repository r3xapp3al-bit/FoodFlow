import { FastifyRequest, FastifyReply } from 'fastify';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentSchema, UpdatePaymentSchema, ListPaymentsQuerySchema } from '../schemas/payments.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const paymentService = new PaymentService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

export async function listPaymentsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const query = ListPaymentsQuerySchema.parse(request.query);
    const result = await paymentService.listPayments(query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en listPaymentsHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al listar pagos' });
  }
}

export async function getPaymentHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const payment = await paymentService.getPaymentById(request.params.id);
    return reply.send({ success: true, data: payment });
  } catch (err: any) {
    console.error('Error en getPaymentHandler:', err);
    return reply.status(404).send({ success: false, error: err.message || 'Pago no encontrado' });
  }
}

export async function createPaymentHandler(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = CreatePaymentSchema.parse(request.body);
    const payment = await paymentService.createPayment(data);
    return reply.status(201).send({ success: true, data: payment });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    // Manejo de errores de negocio
    if (err.message && (
      err.message.includes('monto excede') ||
      err.message.includes('orden cancelada') ||
      err.message.includes('no se puede pagar') ||
      err.message.includes('Orden no encontrada')
    )) {
      return reply.status(400).send({ success: false, error: err.message });
    }
    console.error('Error en createPaymentHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al crear pago' });
  }
}

export async function updatePaymentHandler(request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = UpdatePaymentSchema.parse(request.body);
    const payment = await paymentService.updatePayment(request.params.id, data);
    return reply.send({ success: true, data: payment });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en updatePaymentHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al actualizar pago' });
  }
}

export async function confirmPaymentHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const payment = await paymentService.confirmPayment(request.params.id, authUser.id);
    return reply.send({ success: true, data: payment });
  } catch (err: any) {
    console.error('Error en confirmPaymentHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al confirmar pago' });
  }
}

export async function rejectPaymentHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const payment = await paymentService.rejectPayment(request.params.id);
    return reply.send({ success: true, data: payment });
  } catch (err: any) {
    console.error('Error en rejectPaymentHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al rechazar pago' });
  }
}