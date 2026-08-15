import { z } from 'zod';

export const CreateReturnSchema = z.object({
  order_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  reason: z.string().min(1, 'Motivo requerido'),
  refund_amount: z.number().min(0, 'Monto debe ser >= 0'),
  notes: z.string().optional(),
});

export const UpdateReturnSchema = z.object({
  status: z.enum(['APROBADA', 'RECHAZADA', 'COMPLETADA']).optional(),
  notes: z.string().optional(),
});

export const ListReturnsQuerySchema = z.object({
  order_id: z.string().uuid().optional(),
  status: z.enum(['SOLICITADA', 'APROBADA', 'RECHAZADA', 'COMPLETADA']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateReturnInput = z.infer<typeof CreateReturnSchema>;
export type UpdateReturnInput = z.infer<typeof UpdateReturnSchema>;
export type ListReturnsQuery = z.infer<typeof ListReturnsQuerySchema>;