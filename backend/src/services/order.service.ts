import { supabase } from '../config/supabase';
import { Order, OrderCreate, OrderUpdate, OrderItem, Payment, PaymentCreate } from '../models/order.model';
import type { ListOrdersQuery } from '../schemas/orders.schema';

export class OrderService {
  // -- Orders ----------------------------------------
  async listOrders(siteId: string, query: ListOrdersQuery) {
    const { limit, offset, branch_id, customer_id, status, from_date, to_date } = query;

    let supabaseQuery = supabase
      .from('orders')
      .select(
        `
        *,
        customers(name),
        branches(name),
        users(display_name)
      `,
        { count: 'exact' }
      )
      .eq('site_id', siteId);

    if (branch_id) supabaseQuery = supabaseQuery.eq('branch_id', branch_id);
    if (customer_id) supabaseQuery = supabaseQuery.eq('customer_id', customer_id);
    if (status) supabaseQuery = supabaseQuery.eq('status', status);
    if (from_date) supabaseQuery = supabaseQuery.gte('created_at', from_date);
    if (to_date) supabaseQuery = supabaseQuery.lte('created_at', to_date);

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar órdenes: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getOrderById(id: string): Promise<Order & { items: OrderItem[]; payments: Payment[] }> {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        *,
        customers(name),
        branches(name),
        users(display_name)
      `
      )
      .eq('id', id)
      .single();

    if (orderError) throw new Error(`Orden no encontrada: ${orderError.message}`);

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(
        `
        *,
        products(name, sku)
      `
      )
      .eq('order_id', id);

    if (itemsError) throw new Error(`Error al obtener items: ${itemsError.message}`);

    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(
        `
        *,
        users(display_name)
      `
      )
      .eq('order_id', id);

    if (paymentsError) throw new Error(`Error al obtener pagos: ${paymentsError.message}`);

    return { ...order, items: items || [], payments: payments || [] };
  }

  async createOrder(payload: OrderCreate & { site_id: string }): Promise<Order> {
    const subtotal = payload.items.reduce<number>(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    );
    const total = subtotal + (payload.delivery_cost || 0);

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        site_id: payload.site_id,
        branch_id: payload.branch_id,
        customer_id: payload.customer_id || null,
        order_number: orderNumber,
        channel: payload.channel,
        status: 'CREADO',
        subtotal: subtotal,
        total: total,
        delivery_cost: payload.delivery_cost || 0,
        delivery_address: payload.delivery_address || null,
        address_id: payload.address_id || null,
        notes: payload.notes || null,
        preparation_time_min: payload.preparation_time_min || 10,
        estimated_delivery_time_min: payload.estimated_delivery_time_min || 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) throw new Error(`Error al crear orden: ${orderError.message}`);

    // ? CORREGIDO: NO enviar 'subtotal'
    const orderItems = payload.items.map(
      (item: { product_id: string; quantity: number; unit_price: number; toppings?: any }) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        toppings: item.toppings || [],
      })
    );

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) throw new Error(`Error al crear items: ${itemsError.message}`);

    return order;
  }

  async updateOrder(id: string, payload: OrderUpdate): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar orden: ${error.message}`);
    return data;
  }

  async deleteOrder(id: string): Promise<{ success: boolean; message: string }> {
    const { count: itemsCount, error: itemsError } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', id);

    if (itemsError) throw new Error(itemsError.message);
    if (itemsCount && itemsCount > 0) {
      throw new Error('No se puede eliminar la orden porque tiene items asociados.');
    }

    const { count: paymentsCount, error: paymentsError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', id);

    if (paymentsError) throw new Error(paymentsError.message);
    if (paymentsCount && paymentsCount > 0) {
      throw new Error('No se puede eliminar la orden porque tiene pagos asociados.');
    }

    const { error } = await supabase.from('orders').delete().eq('id', id);

    if (error) throw new Error(`Error al eliminar orden: ${error.message}`);
    return { success: true, message: 'Orden eliminada correctamente' };
  }

  // -- Payments --------------------------------------
  async createPayment(payload: PaymentCreate): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        ...payload,
        status: 'PENDIENTE',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Error al registrar pago: ${error.message}`);
    return data;
  }

  async confirmPayment(paymentId: string, confirmedBy: string): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'CONFIRMADO',
        confirmed_by: confirmedBy,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw new Error(`Error al confirmar pago: ${error.message}`);
    return data;
  }
}
