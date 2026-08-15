import { supabase } from '../config/supabase';
import { Return, ReturnCreate, ReturnUpdate } from '../models/return.model';
import { ListReturnsQuery } from '../schemas/returns.schema';

export class ReturnService {
  async listReturns(query: ListReturnsQuery) {
    const { order_id, status, limit, offset } = query;
    let supabaseQuery = supabase.from('returns').select('*, orders(order_number), customers(name)', { count: 'exact' });

    if (order_id) supabaseQuery = supabaseQuery.eq('order_id', order_id);
    if (status) supabaseQuery = supabaseQuery.eq('status', status);

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar devoluciones: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getReturnById(id: string): Promise<Return> {
    const { data, error } = await supabase
      .from('returns')
      .select('*, orders(order_number), customers(name)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Devolución no encontrada: ${error.message}`);
    return data;
  }

  async createReturn(payload: ReturnCreate): Promise<Return> {
    // Verificar que la orden existe y no está cancelada
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, total')
      .eq('id', payload.order_id)
      .single();

    if (orderError) throw new Error('Orden no encontrada');
    if (order.status === 'CANCELADO') throw new Error('No se puede devolver una orden cancelada');

    // Validar que el monto de reembolso no exceda el total
    if (payload.refund_amount > Number(order.total)) {
      throw new Error(`El monto de reembolso no puede exceder el total de la orden (${order.total})`);
    }

    const { data, error } = await supabase
      .from('returns')
      .insert({ ...payload, status: 'SOLICITADA' })
      .select()
      .single();

    if (error) throw new Error(`Error al crear devolución: ${error.message}`);
    return data;
  }

  async updateReturn(id: string, payload: ReturnUpdate): Promise<Return> {
    const { data, error } = await supabase
      .from('returns')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar devolución: ${error.message}`);
    return data;
  }

  async approveReturn(id: string): Promise<Return> {
    const { data, error } = await supabase
      .from('returns')
      .update({ status: 'APROBADA' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al aprobar devolución: ${error.message}`);
    return data;
  }

  async rejectReturn(id: string): Promise<Return> {
    const { data, error } = await supabase
      .from('returns')
      .update({ status: 'RECHAZADA' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al rechazar devolución: ${error.message}`);
    return data;
  }

  async completeReturn(id: string): Promise<Return> {
    const { data, error } = await supabase
      .from('returns')
      .update({ status: 'COMPLETADA' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al completar devolución: ${error.message}`);
    return data;
  }
}