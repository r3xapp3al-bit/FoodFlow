import { supabase } from '../config/supabase';
import { Payment, PaymentCreate, PaymentUpdate } from '../models/payment.model';
import { ListPaymentsQuery } from '../schemas/payments.schema';

export class PaymentService {
  async listPayments(query: ListPaymentsQuery) {
    const { order_id, status, limit, offset } = query;
    let supabaseQuery = supabase.from('payments').select('*, orders(order_number)', { count: 'exact' });

    if (order_id) supabaseQuery = supabaseQuery.eq('order_id', order_id);
    if (status) supabaseQuery = supabaseQuery.eq('status', status);

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar pagos: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getPaymentById(id: string): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .select('*, orders(order_number)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Pago no encontrado: ${error.message}`);
    return data;
  }

  async createPayment(payload: PaymentCreate): Promise<Payment> {
    // Verificar que la orden existe y no está pagada completamente
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, total, status')
      .eq('id', payload.order_id)
      .single();

    if (orderError) throw new Error('Orden no encontrada');
    if (order.status === 'CANCELADO') throw new Error('No se puede pagar una orden cancelada');

    // Sumar pagos existentes para no exceder el total
    const { data: existingPayments, error: sumError } = await supabase
      .from('payments')
      .select('amount')
      .eq('order_id', payload.order_id)
      .eq('status', 'CONFIRMADO');

    if (sumError) throw new Error(`Error al verificar pagos: ${sumError.message}`);

    const totalPaid = existingPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    if (totalPaid + payload.amount > Number(order.total)) {
      throw new Error(`El monto excede el total de la orden (${order.total})`);
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({ ...payload, status: 'PENDIENTE' })
      .select()
      .single();

    if (error) throw new Error(`Error al crear pago: ${error.message}`);
    return data;
  }

  async updatePayment(id: string, payload: PaymentUpdate): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar pago: ${error.message}`);
    return data;
  }

  async confirmPayment(id: string, confirmedBy: string): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'CONFIRMADO',
        confirmed_by: confirmedBy,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al confirmar pago: ${error.message}`);
    return data;
  }

  async rejectPayment(id: string): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'RECHAZADO' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al rechazar pago: ${error.message}`);
    return data;
  }
}