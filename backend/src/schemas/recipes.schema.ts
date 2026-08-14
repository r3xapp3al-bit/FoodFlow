import { z } from 'zod';

export const CreateRecipeSchema = z.object({
  product_id: z.string().uuid('Producto inválido'),
  supply_id: z.string().uuid('Insumo inválido'),
  quantity: z.number().positive('Cantidad debe ser mayor a 0'),
});

export const UpdateRecipeSchema = CreateRecipeSchema.partial();

export const ListRecipesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  product_id: z.string().uuid().optional(),
  supply_id: z.string().uuid().optional(),
});

export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof UpdateRecipeSchema>;
export type ListRecipesQuery = z.infer<typeof ListRecipesQuerySchema>;