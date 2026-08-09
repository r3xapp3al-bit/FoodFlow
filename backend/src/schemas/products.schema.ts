import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU requerido'),
  base_price: z.coerce.number().min(0, 'Precio debe ser >= 0'),
  image_url: z.string().url().nullable().optional(),
  category_id: z.string().uuid('Categoría inválida'),
  is_active: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ListProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  category_id: z.string().uuid().optional(),
  is_active: z.coerce.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ListProductsQuery = z.infer<typeof ListProductsQuerySchema>;
