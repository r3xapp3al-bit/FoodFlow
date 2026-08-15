import { supabase } from '../config/supabase';

export class AuditService {
  async logAction(
    userId: string,
    action: string,
    affectedTable?: string,
    recordId?: string,
    previousData?: any,
    newData?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      affected_table: affectedTable,
      record_id: recordId,
      previous_data: previousData,
      new_data: newData,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (error) {
      console.error('Error al registrar auditoría:', error);
      // No lanzamos error para no interrumpir la operación principal
    }
  }

  async listLogs(query: { limit?: number; offset?: number; user_id?: string; action?: string }) {
    const { limit = 20, offset = 0, user_id, action } = query;
    let supabaseQuery = supabase
      .from('audit_logs')
      .select('*, users(display_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (user_id) supabaseQuery = supabaseQuery.eq('user_id', user_id);
    if (action) supabaseQuery = supabaseQuery.eq('action', action);

    const { data, error, count } = await supabaseQuery.range(offset, offset + limit - 1);
    if (error) throw new Error(`Error al listar logs: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }
}