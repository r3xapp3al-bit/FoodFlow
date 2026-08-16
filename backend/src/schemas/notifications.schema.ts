import { z } from 'zod';

export const CreateNotificationSchema = z.object({
  user_id: z.string().uuid(),
  channel: z.enum(['APP', 'WHATSAPP', 'EMAIL', 'PUSH']),
  type: z.string().min(1, 'Tipo requerido'),
  title: z.string().optional(),
  content: z.string().min(1, 'Contenido requerido'),
});

export const UpdateNotificationSchema = z.object({
  is_read: z.boolean().optional(),
  is_sent: z.boolean().optional(),
});

export const ListNotificationsQuerySchema = z.object({
  user_id: z.string().uuid().optional(),
  is_read: z.coerce.boolean().optional(),
  is_sent: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof UpdateNotificationSchema>;
export type ListNotificationsQuery = z.infer<typeof ListNotificationsQuerySchema>;