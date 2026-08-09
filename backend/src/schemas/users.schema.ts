import { z } from 'zod';

// Esquema para crear un usuario (solo admin)
export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  display_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone_number: z.string().optional(),
  site_id: z.string().uuid('Site ID inválido').optional(),
  branch_id: z.string().uuid('Branch ID inválido').optional(),
  roles: z.array(z.string()).optional().default([]),
});

// Esquema para actualizar un usuario
export const UpdateUserSchema = z.object({
  display_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  phone_number: z.string().optional(),
  site_id: z.string().uuid('Site ID inválido').optional().nullable(),
  branch_id: z.string().uuid('Branch ID inválido').optional().nullable(),
  is_active: z.boolean().optional(),
});

// Esquema para asignar rol
export const AssignRoleSchema = z.object({
  role_id: z.string().min(1, 'Role ID es requerido'),
});

// Esquema para listar usuarios (filtros)
export const ListUsersQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  search: z.string().optional(),
  site_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  is_active: z.coerce.boolean().optional(),
  role: z.string().optional(),
});

// Tipos inferidos para usar en TypeScript
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type AssignRoleInput = z.infer<typeof AssignRoleSchema>;
export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;
