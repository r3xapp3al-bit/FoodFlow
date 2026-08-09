import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';

export async function getProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authService = new AuthService();
    const userId = (request.user as any)?.id;

    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: 'Usuario no autenticado',
      });
    }

    const profile = await authService.getProfile(userId);

    return reply.send({
      success: true,
      data: profile,
    });
  } catch (err: any) {
    console.error('Error en getProfileHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al obtener el perfil',
    });
  }
}
