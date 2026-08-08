import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../config/supabase';

// Extender el tipo FastifyRequest para incluir `user`
declare module 'fastify' {
  interface FastifyRequest {
    user?: any;
  }
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // 1. Obtener el token del header Authorization
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: 'Token no proporcionado o mal formateado',
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar el token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return reply.status(401).send({
        success: false,
        error: 'Token inválido o expirado',
      });
    }

    // 3. Obtener el perfil del usuario desde la tabla `users`
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, site_id, branch_id, display_name, email, is_active')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return reply.status(404).send({
        success: false,
        error: 'Usuario no encontrado en la base de datos',
      });
    }

    // 4. Obtener los roles del usuario
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id);

    if (rolesError) {
      return reply.status(500).send({
        success: false,
        error: 'Error al obtener roles',
      });
    }

    // 5. Adjuntar la información al request (corregido: sin duplicar id/email)
    request.user = {
      ...profile,
      roles: roles.map(r => r.role_id),
    };

    return;
  } catch (err) {
    console.error('Error en authMiddleware:', err);
    return reply.status(500).send({
      success: false,
      error: 'Error interno al verificar autenticación',
    });
  }
}