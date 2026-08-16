import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import { supabase } from '../config/supabase';
import {
  getProfileHandler,
  updateProfileHandler,
  changePasswordHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from '../controllers/auth.controller';

export default async function authRoutes(app: FastifyInstance) {
  // ── Endpoints públicos ─────────────────────────────
  app.post('/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body as any;
      if (!email || !password) {
        return reply.status(400).send({ success: false, error: 'Email y contraseña requeridos' });
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);

      return reply.send({
        success: true,
        data: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          user: data.user,
        },
      });
    } catch (err: any) {
      return reply.status(401).send({ success: false, error: err.message || 'Error de autenticación' });
    }
  });

  // Registro (público, opcional) - ELIMINAMOS 'request' PARA EVITAR EL ERROR
  app.post('/auth/register', async (_request, reply) => {
    return reply.status(501).send({ success: false, error: 'Registro no implementado' });
  });

  app.post('/auth/forgot-password', forgotPasswordHandler);
  app.post('/auth/reset-password', resetPasswordHandler);

  // ── Endpoints protegidos ──
  app.get('/auth/me', { preHandler: authMiddleware }, getProfileHandler);
  app.put('/auth/me', { preHandler: authMiddleware }, updateProfileHandler);
  app.post('/auth/change-password', { preHandler: authMiddleware }, changePasswordHandler);
}