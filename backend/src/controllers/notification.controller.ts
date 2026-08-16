import { FastifyRequest, FastifyReply } from 'fastify';
import { NotificationService } from '../services/notification.service';
import {
  CreateNotificationSchema,
  UpdateNotificationSchema,
  ListNotificationsQuerySchema,
} from '../schemas/notifications.schema';
import { z } from 'zod';
import { AuthUser } from '../types';

const notificationService = new NotificationService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

export async function listNotificationsHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const query = ListNotificationsQuerySchema.parse(request.query);
    // Si es site_admin, solo ve notificaciones de su site (opcional)
    // Aquí asumimos que las notificaciones tienen user_id, y el user tiene site_id
    // Pero no tenemos un filtro directo, así que lo dejamos abierto por ahora.

    const result = await notificationService.listNotifications(query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en listNotificationsHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al listar notificaciones' });
  }
}

export async function getNotificationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const notification = await notificationService.getNotificationById(request.params.id);
    return reply.send({ success: true, data: notification });
  } catch (err: any) {
    console.error('Error en getNotificationHandler:', err);
    return reply.status(404).send({ success: false, error: err.message || 'Notificación no encontrada' });
  }
}

export async function createNotificationHandler(request: FastifyRequest<{ Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = CreateNotificationSchema.parse(request.body);
    const notification = await notificationService.createNotification(data);
    return reply.status(201).send({ success: true, data: notification });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en createNotificationHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al crear notificación' });
  }
}

export async function updateNotificationHandler(request: FastifyRequest<{ Params: { id: string }; Body: any }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const data = UpdateNotificationSchema.parse(request.body);
    const notification = await notificationService.updateNotification(request.params.id, data);
    return reply.send({ success: true, data: notification });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en updateNotificationHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al actualizar notificación' });
  }
}

export async function markAsReadHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }
    // Un usuario puede marcar como leída su propia notificación
    // Pero para simplificar, cualquier usuario autenticado puede marcar como leída.
    const notification = await notificationService.markAsRead(request.params.id);
    return reply.send({ success: true, data: notification });
  } catch (err: any) {
    console.error('Error en markAsReadHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al marcar como leída' });
  }
}

export async function deleteNotificationHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const result = await notificationService.deleteNotification(request.params.id);
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteNotificationHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al eliminar notificación' });
  }
}