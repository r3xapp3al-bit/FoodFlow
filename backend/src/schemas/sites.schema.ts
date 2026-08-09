import { z } from 'zod';

// ── Site Schemas ────────────────────────────────────────────────

export const CreateSiteSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  tax_id: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  logo_url: z.string().url().optional().nullable(),
  // ✅ CORREGIDO: zod v4 requiere z.record(z.string(), z.any()) para objetos con claves string
  config: z.record(z.string(), z.any()).optional().default({}),
});

export const UpdateSiteSchema = CreateSiteSchema.partial();

export const ListSitesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  search: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
});

// ── Branch Schemas ────────────────────────────────────────────────

export const CreateBranchSchema = z.object({
  site_id: z.string().uuid('Site ID inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  address: z.string().optional(),
  phone: z.string().optional(),
  schedule: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const UpdateBranchSchema = CreateBranchSchema.omit({ site_id: true }).partial();

export const ListBranchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  site_id: z.string().uuid('Site ID inválido').optional(),
  search: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
});

// ── Tipos inferidos ──────────────────────────────────────────────

export type CreateSiteInput = z.infer<typeof CreateSiteSchema>;
export type UpdateSiteInput = z.infer<typeof UpdateSiteSchema>;
export type ListSitesQuery = z.infer<typeof ListSitesQuerySchema>;
export type CreateBranchInput = z.infer<typeof CreateBranchSchema>;
export type UpdateBranchInput = z.infer<typeof UpdateBranchSchema>;
export type ListBranchesQuery = z.infer<typeof ListBranchesQuerySchema>;
