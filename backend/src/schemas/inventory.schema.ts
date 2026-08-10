import { z } from 'zod';

// ── Inventory ──
export const UpdateInventorySchema = z.object({
  available_stock: z.coerce.number().min(0).optional(),
  reserved_stock: z.coerce.number().min(0).optional(),
  reorder_point: z.coerce.number().min(0).optional(),
});

export const ListInventoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  branch_id: z.string().uuid().optional(),
  insumo_id: z.string().uuid().optional(),
});

// ── Batches ──
export const CreateBatchSchema = z.object({
  insumo_id: z.string().uuid('Insumo inválido'),
  branch_id: z.string().uuid('Sucursal inválida'),
  lot_number: z.string().min(1, 'Número de lote requerido'),
  initial_quantity: z.coerce.number().min(0, 'Cantidad inicial debe ser >= 0'),
  current_quantity: z.coerce.number().min(0).optional(),
  production_date: z.string().datetime().optional(),
  expiry_date: z.string().datetime().optional(),
});

export const UpdateBatchSchema = CreateBatchSchema.partial();

export const ListBatchesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  insumo_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
});

// ── Inventory Movements ──
export const CreateMovementSchema = z.object({
  insumo_id: z.string().uuid('Insumo inválido'),
  branch_id: z.string().uuid('Sucursal inválida'),
  batch_id: z.string().uuid().optional(),
  quantity: z.coerce.number().refine(val => val !== 0, 'Cantidad no puede ser 0'),
  type: z.enum([
    'ENTRADA',
    'SALIDA',
    'RESERVA',
    'CONSUMO',
    'LIBERACION',
    'AJUSTE',
    'TRANSFERENCIA_SALIDA',
    'TRANSFERENCIA_ENTRADA',
    'MERMA',
  ]),
  reason: z.string().optional(),
  reference_id: z.string().optional(),
});

export const ListMovementsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  insumo_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  type: z.enum([
    'ENTRADA',
    'SALIDA',
    'RESERVA',
    'CONSUMO',
    'LIBERACION',
    'AJUSTE',
    'TRANSFERENCIA_SALIDA',
    'TRANSFERENCIA_ENTRADA',
    'MERMA',
  ]).optional(),
});

export type UpdateInventoryInput = z.infer<typeof UpdateInventorySchema>;
export type ListInventoryQuery = z.infer<typeof ListInventoryQuerySchema>;
export type CreateBatchInput = z.infer<typeof CreateBatchSchema>;
export type UpdateBatchInput = z.infer<typeof UpdateBatchSchema>;
export type ListBatchesQuery = z.infer<typeof ListBatchesQuerySchema>;
export type CreateMovementInput = z.infer<typeof CreateMovementSchema>;
export type ListMovementsQuery = z.infer<typeof ListMovementsQuerySchema>;