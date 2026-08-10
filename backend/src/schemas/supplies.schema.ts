import { z } from 'zod';

export const CreateSupplySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  unit: z.string().min(1, 'Unidad requerida'),
  min_stock: z.coerce.number().min(0).default(0),
  unit_cost: z.coerce.number().min(0).default(0),
  is_perishable: z.boolean().default(true),
});

export const UpdateSupplySchema = CreateSupplySchema.partial();

export const ListSuppliesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  // is_active: z.coerce.boolean().optional(), // Eliminado porque no existe en la tabla
});

export type CreateSupplyInput = z.infer<typeof CreateSupplySchema>;
export type UpdateSupplyInput = z.infer<typeof UpdateSupplySchema>;
export type ListSuppliesQuery = z.infer<typeof ListSuppliesQuerySchema>;