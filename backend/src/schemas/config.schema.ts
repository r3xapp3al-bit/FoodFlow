import { z } from 'zod';

export const CreateConfigSchema = z.object({
  site_id: z.string().uuid(),
  key: z.string().min(1, 'Clave requerida'),
  value: z.string().optional(),
  description: z.string().optional(),
});

export const UpdateConfigSchema = z.object({
  value: z.string().optional(),
  description: z.string().optional(),
});

export const ListConfigQuerySchema = z.object({
  site_id: z.string().uuid().optional(),
  key: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// Branch config
export const CreateBranchConfigSchema = z.object({
  branch_id: z.string().uuid(),
  key: z.string().min(1, 'Clave requerida'),
  value: z.string().optional(),
  description: z.string().optional(),
});

export const UpdateBranchConfigSchema = z.object({
  value: z.string().optional(),
  description: z.string().optional(),
});

export const ListBranchConfigQuerySchema = z.object({
  branch_id: z.string().uuid().optional(),
  key: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateConfigInput = z.infer<typeof CreateConfigSchema>;
export type UpdateConfigInput = z.infer<typeof UpdateConfigSchema>;
export type ListConfigQuery = z.infer<typeof ListConfigQuerySchema>;
export type CreateBranchConfigInput = z.infer<typeof CreateBranchConfigSchema>;
export type UpdateBranchConfigInput = z.infer<typeof UpdateBranchConfigSchema>;
export type ListBranchConfigQuery = z.infer<typeof ListBranchConfigQuerySchema>;