import { z } from 'zod';

export const CreatePromotionSchema = z.object({
  codigo: z.string().min(1, 'Código requerido'),
  description: z.string().optional(),
  type: z.enum(['PORCENTAJE', 'MONTO_FIJO', '2X1']),
  value: z.number().positive('Valor debe ser mayor a 0'),
  product_id: z.string().uuid().optional(),
  start_date: z.string().datetime('Fecha de inicio inválida'),
  end_date: z.string().datetime('Fecha de fin inválida'),
  usage_per_customer: z.number().int().min(1).default(1),
  is_active: z.boolean().default(true),
});

export const UpdatePromotionSchema = CreatePromotionSchema.partial();

export const ListPromotionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  codigo: z.string().optional(),
  type: z.enum(['PORCENTAJE', 'MONTO_FIJO', '2X1']).optional(),
  is_active: z.coerce.boolean().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export const UseCouponSchema = z.object({
  promotion_id: z.string().uuid('Promoción inválida'),
  order_id: z.string().uuid('Orden inválida'),
  customer_id: z.string().uuid('Cliente inválido'),
  discount_applied: z.number().min(0, 'Descuento debe ser >= 0'),
});

export type CreatePromotionInput = z.infer<typeof CreatePromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof UpdatePromotionSchema>;
export type ListPromotionsQuery = z.infer<typeof ListPromotionsQuerySchema>;
export type UseCouponInput = z.infer<typeof UseCouponSchema>;