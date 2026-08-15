import { z } from 'zod';

export const CreateWastageSchema = z.object({
  supply_id: z.string().uuid(),
  branch_id: z.string().uuid(),
  batch_id: z.string().uuid().optional(),
  quantity: z.number().positive('Cantidad debe ser > 0'),
  reason: z.enum(['DESCOMPOSICION', 'ACCIDENTE', 'DEGUSTACION', 'TRANSPORTE', 'OTRO']),
  description: z.string().optional(),
});

export const UpdateWastageSchema = z.object({
  description: z.string().optional(),
  // Normalmente no se actualiza la cantidad o razón, pero se puede permitir.
});

export const ListWastagesQuerySchema = z.object({
  supply_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  reason: z.enum(['DESCOMPOSICION', 'ACCIDENTE', 'DEGUSTACION', 'TRANSPORTE', 'OTRO']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateWastageInput = z.infer<typeof CreateWastageSchema>;
export type UpdateWastageInput = z.infer<typeof UpdateWastageSchema>;
export type ListWastagesQuery = z.infer<typeof ListWastagesQuerySchema>;