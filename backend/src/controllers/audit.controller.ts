import { FastifyRequest, FastifyReply } from 'fastify';
import { AuditService } from '../services/audit.service';
import { AuthUser } from '../types';

const auditService = new AuditService();

function getAuthUser(request: FastifyRequest): AuthUser {
  return (request as any).user;
}

export async function listAuditLogsHandler(request: FastifyRequest<{ Querystring: { limit?: string; offset?: string; user_id?: string; action?: string } }>, reply: FastifyReply) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo super_admin puede ver logs' });
    }

    const query = {
      limit: Number(request.query.limit) || 20,
      offset: Number(request.query.offset) || 0,
      user_id: request.query.user_id,
      action: request.query.action,
    };

    const result = await auditService.listLogs(query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    console.error('Error en listAuditLogsHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al listar logs' });
  }
}