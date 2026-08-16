import { z } from 'zod';

// ─── Roles ──────────────────────────────────────────
export const CreateRoleSchema = z.object({
  id: z.string().min(1, 'ID del rol es requerido'),
  name: z.string().min(1, 'Nombre del rol es requerido'),
  description: z.string().optional(),
  level: z.number().int().default(0),
});

export const UpdateRoleSchema = CreateRoleSchema.partial();

export const ListRolesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// ─── Permisos ──────────────────────────────────────
export const CreatePermissionSchema = z.object({
  id: z.string().min(1, 'ID del permiso es requerido'),
  name: z.string().min(1, 'Nombre del permiso es requerido'),
  description: z.string().optional(),
  module: z.string().min(1, 'Módulo es requerido'),
});

export const UpdatePermissionSchema = CreatePermissionSchema.partial();

// ─── Asignación de permisos a roles ───────────────
// ⬇️ Esta es la línea que faltaba
export const AssignPermissionSchema = z.object({
  permission_id: z.string().uuid('ID de permiso inválido'),
});

// ─── Tipos inferidos ──────────────────────────────
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>;
export type ListRolesQuery = z.infer<typeof ListRolesQuerySchema>;
export type CreatePermissionInput = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof UpdatePermissionSchema>;
export type AssignPermissionInput = z.infer<typeof AssignPermissionSchema>;