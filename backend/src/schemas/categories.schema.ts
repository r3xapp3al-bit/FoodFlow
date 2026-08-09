import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const ListCategoriesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  is_active: z.coerce.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof ListCategoriesQuerySchema>;
