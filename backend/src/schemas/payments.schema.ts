import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  order_id: z.string().uuid('Orden inválida'),
  amount: z.number().positive('Monto debe ser mayor a 0'),
  method: z.enum(['EFECTIVO', 'QR_BCP', 'YAPE', 'TRANSFERENCIA', 'TARJETA']),
  reference: z.string().optional(),
});

export const UpdatePaymentSchema = z.object({
  status: z.enum(['CONFIRMADO', 'RECHAZADO']).optional(),
  reference: z.string().optional(),
});

export const ListPaymentsQuerySchema = z.object({
  order_id: z.string().uuid().optional(),
  status: z.enum(['PENDIENTE', 'CONFIRMADO', 'RECHAZADO']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>;
export type ListPaymentsQuery = z.infer<typeof ListPaymentsQuerySchema>;