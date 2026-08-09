import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getProfileHandler } from '../controllers/auth.controller';
import { supabase } from '../config/supabase';

export default async function authRoutes(app: FastifyInstance) {
  // 🔐 Ruta de login (temporal para pruebas)
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

  // Ruta protegida: obtener perfil del usuario autenticado
  app.get('/auth/me', { preHandler: authMiddleware }, getProfileHandler);
}