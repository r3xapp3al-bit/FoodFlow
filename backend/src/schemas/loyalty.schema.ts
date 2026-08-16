import { z } from 'zod';

export const AddPointsSchema = z.object({
  customer_id: z.string().uuid('ID de cliente inválido'),
  points: z.number().int().positive('Los puntos deben ser positivos'),
  concept: z.string().min(1, 'Concepto requerido'),
  reference_id: z.string().optional(),
});

export const RedeemPointsSchema = z.object({
  customer_id: z.string().uuid('ID de cliente inválido'),
  points: z.number().int().positive('Los puntos deben ser positivos'),
  concept: z.string().min(1, 'Concepto requerido'),
  reference_id: z.string().optional(),
});

export const ListLoyaltyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type AddPointsInput = z.infer<typeof AddPointsSchema>;
export type RedeemPointsInput = z.infer<typeof RedeemPointsSchema>;
export type ListLoyaltyQuery = z.infer<typeof ListLoyaltyQuerySchema>;