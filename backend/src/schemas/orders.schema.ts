import { z } from 'zod';

// ── Order ──
export const CreateOrderSchema = z.object({
  branch_id: z.string().uuid('Sucursal inválida'),
  customer_id: z.string().uuid().optional(),
  channel: z.enum(['POS', 'WEB', 'WHATSAPP', 'LLAMADA']),
  items: z.array(z.object({
    product_id: z.string().uuid('Producto inválido'),
    quantity: z.coerce.number().int().min(1, 'Cantidad mínima 1'),
    unit_price: z.coerce.number().min(0, 'Precio unitario debe ser >= 0'),
    toppings: z.any().optional(),
  })).min(1, 'Al menos un item requerido'),
  delivery_cost: z.coerce.number().min(0).default(0),
  delivery_address: z.string().optional(),
  address_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  preparation_time_min: z.coerce.number().int().min(0).default(10),
  estimated_delivery_time_min: z.coerce.number().int().min(0).default(30),
});

export const UpdateOrderSchema = z.object({
  status: z.enum([
    'CREADO', 'PAGADO', 'RESERVADO', 'PENDIENTE', 'EMPAQUETADO',
    'LISTO', 'ASIGNADO', 'EN_CAMINO', 'ENTREGADO', 'CERRADO',
    'CANCELADO', 'NO_ENTREGADO'
  ]).optional(),
  delivery_cost: z.coerce.number().min(0).optional(),
  delivery_address: z.string().optional(),
  address_id: z.string().uuid().optional(),
  delivery_person_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  preparation_time_min: z.coerce.number().int().min(0).optional(),
  estimated_delivery_time_min: z.coerce.number().int().min(0).optional(),
});

export const ListOrdersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  branch_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  status: z.enum([
    'CREADO', 'PAGADO', 'RESERVADO', 'PENDIENTE', 'EMPAQUETADO',
    'LISTO', 'ASIGNADO', 'EN_CAMINO', 'ENTREGADO', 'CERRADO',
    'CANCELADO', 'NO_ENTREGADO'
  ]).optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional(),
});

// ── Payment ──
export const CreatePaymentSchema = z.object({
  order_id: z.string().uuid('Orden inválida'),
  amount: z.coerce.number().min(0, 'Monto debe ser >= 0'),
  method: z.enum(['EFECTIVO', 'QR_BCP', 'YAPE', 'TRANSFERENCIA', 'TARJETA']),
  reference: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
export type ListOrdersQuery = z.infer<typeof ListOrdersQuerySchema>;
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;