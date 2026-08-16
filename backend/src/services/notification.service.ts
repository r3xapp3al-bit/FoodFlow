import { supabase } from '../config/supabase';
import { Notification, NotificationCreate, NotificationUpdate } from '../models/notification.model';
import { ListNotificationsQuery } from '../schemas/notifications.schema';

export class NotificationService {
  async listNotifications(query: ListNotificationsQuery) {
    const { user_id, is_read, is_sent, limit, offset } = query;
    let supabaseQuery = supabase.from('notifications').select('*', { count: 'exact' });

    if (user_id) supabaseQuery = supabaseQuery.eq('user_id', user_id);
    if (is_read !== undefined) supabaseQuery = supabaseQuery.eq('is_read', is_read);
    if (is_sent !== undefined) supabaseQuery = supabaseQuery.eq('is_sent', is_sent);

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar notificaciones: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getNotificationById(id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Notificación no encontrada: ${error.message}`);
    return data;
  }

  async createNotification(payload: NotificationCreate): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...payload,
        is_read: false,
        is_sent: false,
      })
      .select()
      .single();

    if (error) throw new Error(`Error al crear notificación: ${error.message}`);
    return data;
  }

  async updateNotification(id: string, payload: NotificationUpdate): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar notificación: ${error.message}`);
    return data;
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.updateNotification(id, { is_read: true });
  }

  async markAsSent(id: string): Promise<Notification> {
    return this.updateNotification(id, { is_sent: true });
  }

  async deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar notificación: ${error.message}`);
    return { success: true, message: 'Notificación eliminada correctamente' };
  }
}