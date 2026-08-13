import { z } from 'zod';

// ── Customer ──
export const CreateCustomerSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  auth_user_id: z.string().uuid().optional(),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export const ListCustomersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  email: z.string().email().optional(),
});

// ── Address ──
export const CreateAddressSchema = z.object({
  address: z.string().min(1, 'Dirección requerida'),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  reference: z.string().optional(),
  is_default: z.boolean().default(false),
});

export const UpdateAddressSchema = CreateAddressSchema.partial();

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
export type ListCustomersQuery = z.infer<typeof ListCustomersQuerySchema>;
export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;