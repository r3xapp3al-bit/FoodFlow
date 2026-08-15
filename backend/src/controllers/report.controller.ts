import { FastifyRequest, FastifyReply } from 'fastify';
import { ReportService } from '../services/report.service';
import { AuthUser } from '../types';

const reportService = new ReportService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

export async function getDailySalesHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const siteId = authUser.roles.includes('super_admin') ? undefined : authUser.site_id;
    const report = await reportService.getDailySales(siteId);
    return reply.send({ success: true, data: report });
  } catch (err: any) {
    console.error('Error en getDailySalesHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al obtener ventas diarias' });
  }
}

export async function getCurrentInventoryHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const siteId = authUser.roles.includes('super_admin') ? undefined : authUser.site_id;
    const inventory = await reportService.getCurrentInventory(siteId);
    return reply.send({ success: true, data: inventory });
  } catch (err: any) {
    console.error('Error en getCurrentInventoryHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al obtener inventario actual' });
  }
}

export async function getTopProductsHandler(request: FastifyRequest<{ Querystring: { limit?: string; days?: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'Sin permisos' });
    }

    const limit = Number(request.query.limit) || 10;
    const days = Number(request.query.days) || 30;
    const siteId = authUser.roles.includes('super_admin') ? undefined : authUser.site_id;

    const top = await reportService.getTopProducts(limit, days, siteId);
    return reply.send({ success: true, data: top });
  } catch (err: any) {
    console.error('Error en getTopProductsHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al obtener top productos' });
  }
}