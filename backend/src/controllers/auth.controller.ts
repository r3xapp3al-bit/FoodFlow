import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';

// ─── Definir esquemas localmente ───────────────────
const ChangePasswordSchema = z.object({
  current_password: z.string().min(6, 'Contraseña actual requerida'),
  new_password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  new_password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

// ─── Handlers ───────────────────────────────────────
export async function getProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authService = new AuthService();
    const userId = (request as any).user?.id;

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

export async function updateProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authService = new AuthService();
    const userId = (request as any).user?.id;

    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: 'Usuario no autenticado',
      });
    }

    const data = request.body as any;
    const allowedFields = ['display_name', 'phone_number'];
    const updateData: any = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const updated = await authService.updateProfile(userId, updateData);

    return reply.send({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    console.error('Error en updateProfileHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al actualizar perfil',
    });
  }
}

export async function changePasswordHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authService = new AuthService();
    const userId = (request as any).user?.id;

    if (!userId) {
      return reply.status(401).send({
        success: false,
        error: 'Usuario no autenticado',
      });
    }

    const { current_password, new_password } = ChangePasswordSchema.parse(request.body);

    await authService.changePassword(userId, current_password, new_password);

    return reply.send({
      success: true,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en changePasswordHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al cambiar contraseña',
    });
  }
}

export async function forgotPasswordHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { email } = ForgotPasswordSchema.parse(request.body);
    const authService = new AuthService();
    await authService.forgotPassword(email);

    return reply.send({
      success: true,
      message: 'Se ha enviado un correo para restablecer la contraseña',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en forgotPasswordHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al solicitar restablecimiento',
    });
  }
}

export async function resetPasswordHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { token, new_password } = ResetPasswordSchema.parse(request.body);
    const authService = new AuthService();
    await authService.resetPassword(token, new_password);

    return reply.send({
      success: true,
      message: 'Contraseña restablecida correctamente',
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Datos inválidos',
        details: err.issues,
      });
    }
    console.error('Error en resetPasswordHandler:', err);
    return reply.status(500).send({
      success: false,
      error: err.message || 'Error al restablecer contraseña',
    });
  }
}