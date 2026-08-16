import { z } from 'zod';

export const ChangePasswordSchema = z.object({
  current_password: z.string().min(6, 'Contraseña actual requerida'),
  new_password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  new_password: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;